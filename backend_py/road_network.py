import os
import csv
import math
import json
import networkx as nx
from typing import Dict, List, Tuple, Any, Optional

CORRIDOR_SEGMENTS_CSV = os.path.join(os.path.dirname(os.path.dirname(__file__)), "real_sikkim_dataset", "rangpo_gangtok_road_segments.csv")
ELEVATION_SAMPLES_CSV = os.path.join(os.path.dirname(os.path.dirname(__file__)), "real_sikkim_dataset", "rangpo_gangtok_elevation_samples.csv")

# Known landslide choke points along the NH-10 corridor
KNOWN_CHOKEPOINTS = [
    {"name": "Mile 27 near Rambi", "lat": 27.1761, "lon": 88.5287, "radius_m": 800, "base_multiplier": 1.7},
    {"name": "Singtam Riverfront Basin", "lat": 27.2344, "lon": 88.4988, "radius_m": 700, "base_multiplier": 1.5},
    {"name": "4th Mile Rongli Cutoff", "lat": 27.1954, "lon": 88.6115, "radius_m": 600, "base_multiplier": 1.6},
    {"name": "Pani House / Deorali Ascent", "lat": 27.3341, "lon": 88.6083, "radius_m": 500, "base_multiplier": 1.8},
    {"name": "Pangthang North Corridor", "lat": 27.3383, "lon": 88.6069, "radius_m": 900, "base_multiplier": 1.65}
]

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance in meters between two GPS coordinates."""
    R = 6371000.0  # Earth radius in meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

class RoadNetworkManager:
    def __init__(self):
        self.segments: List[Dict[str, Any]] = []
        self.elevations: Dict[str, float] = {}
        self.graph: nx.DiGraph = nx.DiGraph()
        self.nodes_spatial: List[Tuple[float, float, str]] = []  # (lat, lon, node_id)
        self.load_elevation_data()
        self.load_road_segments()
        self.build_graph()

    def load_elevation_data(self):
        """Loads Copernicus DEM 90m elevation samples along the corridor."""
        if not os.path.exists(ELEVATION_SAMPLES_CSV):
            return
        with open(ELEVATION_SAMPLES_CSV, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    lat = round(float(row.get("latitude", 0)), 4)
                    lon = round(float(row.get("longitude", 0)), 4)
                    elev = float(row.get("elevation_m", 0))
                    key = f"{lat}:{lon}"
                    self.elevations[key] = elev
                except (ValueError, TypeError):
                    continue

    def get_elevation_for_coord(self, lat: float, lon: float, fallback: float = 600.0) -> float:
        """Looks up closest elevation sample or computes interpolated estimate from valley floor to Gangtok."""
        key = f"{round(lat, 4)}:{round(lon, 4)}"
        if key in self.elevations:
            return self.elevations[key]
        # Linear approximation between Rangpo (312m at lat ~27.172) and Gangtok (1620m at lat ~27.3341)
        progress = max(0.0, min(1.0, (lat - 27.172) / (27.3341 - 27.172)))
        return round(312.0 + progress * (1620.0 - 312.0), 1)

    def load_road_segments(self):
        """Loads real road segments from CSV."""
        if not os.path.exists(CORRIDOR_SEGMENTS_CSV):
            raise FileNotFoundError(f"Missing road segments CSV at {CORRIDOR_SEGMENTS_CSV}")

        with open(CORRIDOR_SEGMENTS_CSV, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            idx = 0
            for row in reader:
                idx += 1
                try:
                    seg_id = row.get("segment_id") or f"seg_{idx}"
                    s_lon = float(row["start_lon"])
                    s_lat = float(row["start_lat"])
                    e_lon = float(row["end_lon"])
                    e_lat = float(row["end_lat"])
                    m_lon = float(row.get("mid_lon") or (s_lon + e_lon)/2)
                    m_lat = float(row.get("mid_lat") or (s_lat + e_lat)/2)
                    length_m = float(row.get("length_m") or haversine_distance_m(s_lat, s_lon, e_lat, e_lon))
                    road_name = row.get("road_name") or "NH-10 Sikkim Highway"
                    road_type = row.get("road_type") or "trunk"

                    s_elev = self.get_elevation_for_coord(s_lat, s_lon)
                    e_elev = self.get_elevation_for_coord(e_lat, e_lon)
                    elev_diff = abs(e_elev - s_elev)
                    slope_pct = (elev_diff / max(1.0, length_m)) * 100.0

                    # Check proximity to known historical landslide bottlenecks
                    chokepoint_name = None
                    chokepoint_mult = 1.0
                    for cp in KNOWN_CHOKEPOINTS:
                        d = haversine_distance_m(m_lat, m_lon, cp["lat"], cp["lon"])
                        if d <= cp["radius_m"]:
                            chokepoint_name = cp["name"]
                            chokepoint_mult = cp["base_multiplier"]
                            break

                    self.segments.append({
                        "segment_id": seg_id,
                        "start_lat": s_lat,
                        "start_lon": s_lon,
                        "end_lat": e_lat,
                        "end_lon": e_lon,
                        "mid_lat": m_lat,
                        "mid_lon": m_lon,
                        "length_m": round(length_m, 2),
                        "road_name": road_name,
                        "road_type": road_type,
                        "elevation_start": s_elev,
                        "elevation_end": e_elev,
                        "slope_pct": round(slope_pct, 2),
                        "chokepoint_name": chokepoint_name,
                        "chokepoint_multiplier": chokepoint_mult,
                        "base_risk_score": 0.15 * chokepoint_mult + min(0.35, (slope_pct / 40.0) * 0.3)
                    })
                except (KeyError, ValueError):
                    continue

    def build_graph(self):
        """Constructs a NetworkX directed routing graph with forward and reverse edges."""
        self.graph = nx.DiGraph()
        self.nodes_spatial.clear()

        for seg in self.segments:
            u = f"{seg['start_lat']:.5f},{seg['start_lon']:.5f}"
            v = f"{seg['end_lat']:.5f},{seg['end_lon']:.5f}"

            # Add nodes
            if not self.graph.has_node(u):
                self.graph.add_node(u, lat=seg["start_lat"], lon=seg["start_lon"], elev=seg["elevation_start"])
                self.nodes_spatial.append((seg["start_lat"], seg["start_lon"], u))
            if not self.graph.has_node(v):
                self.graph.add_node(v, lat=seg["end_lat"], lon=seg["end_lon"], elev=seg["elevation_end"])
                self.nodes_spatial.append((seg["end_lat"], seg["end_lon"], v))

            # Forward edge
            self.graph.add_edge(
                u, v,
                segment_id=seg["segment_id"],
                length_m=seg["length_m"],
                slope_pct=seg["slope_pct"],
                road_name=seg["road_name"],
                chokepoint=seg["chokepoint_name"],
                base_risk=seg["base_risk_score"],
                current_risk=seg["base_risk_score"],
                coords=[[seg["start_lat"], seg["start_lon"]], [seg["end_lat"], seg["end_lon"]]]
            )

            # Reverse edge (two-way mountain highway NH-10)
            self.graph.add_edge(
                v, u,
                segment_id=f"{seg['segment_id']}_rev",
                length_m=seg["length_m"],
                slope_pct=seg["slope_pct"],
                road_name=seg["road_name"],
                chokepoint=seg["chokepoint_name"],
                base_risk=seg["base_risk_score"],
                current_risk=seg["base_risk_score"],
                coords=[[seg["end_lat"], seg["end_lon"]], [seg["start_lat"], seg["start_lon"]]]
            )

        # Synthesize alternate bypass edges so safe routing has alternate detours around Singtam & Rambi
        self._add_alternative_mountain_bypasses()

    def _add_alternative_mountain_bypasses(self):
        """Adds realistic regional alternate bypass routes (e.g., via Pakyong / Rongli / Singtam bypass)
        so that when NH-10 chokepoints are hit by landslides, risk-aware routing can find safe diversions."""
        # Rongli - Pakyong - Ranipool bypass connection:
        # Connects lower valley (near Rangpo/Singtam) around high landslide zones into East Gangtok
        bypass_coords = [
            (27.1850, 88.5350, "Bypass_Jct_RangpoNorth"),
            (27.2100, 88.5450, "Bypass_Jct_RhenockEast"),
            (27.2400, 88.5800, "Bypass_Jct_PakyongApproach"),
            (27.2900, 88.5950, "Bypass_Jct_RanipoolUpper"),
            (27.3200, 88.6050, "Bypass_Jct_GangtokSouth")
        ]

        prev_node = None
        for lat, lon, name in bypass_coords:
            node_id = f"{lat:.5f},{lon:.5f}"
            self.graph.add_node(node_id, lat=lat, lon=lon, elev=self.get_elevation_for_coord(lat, lon))
            self.nodes_spatial.append((lat, lon, node_id))
            if prev_node:
                dist = haversine_distance_m(prev_lat, prev_lon, lat, lon)
                self.graph.add_edge(
                    prev_node, node_id,
                    segment_id=f"alt_bypass_{name}",
                    length_m=dist,
                    slope_pct=7.5,
                    road_name="Pakyong-Ranipool Mountain Bypass",
                    chokepoint=None,
                    base_risk=0.12,  # noticeably safer ridge alignment
                    current_risk=0.12,
                    coords=[[prev_lat, prev_lon], [lat, lon]]
                )
                self.graph.add_edge(
                    node_id, prev_node,
                    segment_id=f"alt_bypass_{name}_rev",
                    length_m=dist,
                    slope_pct=7.5,
                    road_name="Pakyong-Ranipool Mountain Bypass",
                    chokepoint=None,
                    base_risk=0.12,
                    current_risk=0.12,
                    coords=[[lat, lon], [prev_lat, prev_lon]]
                )
            prev_node = node_id
            prev_lat, prev_lon = lat, lon

        # Connect bypass junctions into nearest NH-10 highway nodes
        for lat, lon, name in [bypass_coords[0], bypass_coords[-1]]:
            n_id = f"{lat:.5f},{lon:.5f}"
            closest_hwy_node = self.find_nearest_node(lat, lon, exclude={n_id})
            if closest_hwy_node:
                c_data = self.graph.nodes[closest_hwy_node]
                d = haversine_distance_m(lat, lon, c_data["lat"], c_data["lon"])
                self.graph.add_edge(n_id, closest_hwy_node, segment_id=f"connector_{name}", length_m=d, slope_pct=5.0, road_name="Bypass Connector Link", chokepoint=None, base_risk=0.15, current_risk=0.15, coords=[[lat, lon], [c_data["lat"], c_data["lon"]]])
                self.graph.add_edge(closest_hwy_node, n_id, segment_id=f"connector_{name}_rev", length_m=d, slope_pct=5.0, road_name="Bypass Connector Link", chokepoint=None, base_risk=0.15, current_risk=0.15, coords=[[c_data["lat"], c_data["lon"]], [lat, lon]])

    def find_nearest_node(self, lat: float, lon: float, exclude: Optional[set] = None) -> str:
        """Finds the closest node in the NetworkX graph to given coordinates."""
        best_node = None
        min_dist = float("inf")
        for n_lat, n_lon, n_id in self.nodes_spatial:
            if exclude and n_id in exclude:
                continue
            d = (n_lat - lat)**2 + (n_lon - lon)**2
            if d < min_dist:
                min_dist = d
                best_node = n_id
        return best_node

    def update_edge_risk_scores(self, risk_map: Dict[str, float]):
        """Updates live risk scores on all graph edges based on ML prediction."""
        for u, v, data in self.graph.edges(data=True):
            seg_id = data.get("segment_id", "").replace("_rev", "")
            if seg_id in risk_map:
                data["current_risk"] = risk_map[seg_id]

# Singleton instance
road_net = RoadNetworkManager()

