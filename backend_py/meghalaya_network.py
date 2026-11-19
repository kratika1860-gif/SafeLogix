import os
import math
import json
import networkx as nx
from typing import Dict, List, Tuple, Any, Optional

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance in meters between two GPS coordinates."""
    R = 6371000.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

# Critical Landslide Chokepoints across Meghalaya lifelines
MEGHALAYA_CHOKEPOINTS = [
    {
        "id": "sonapur_tunnel",
        "name": "Sonapur Tunnel & River Cut (NH-6)",
        "district": "East Jaintia Hills",
        "lat": 25.1165,
        "lon": 92.3654,
        "elevation_m": 420.0,
        "slope_deg": 32.5,
        "radius_m": 1200,
        "hazard_description": "Perennial monsoon mudslide & rockfall zone blocking NH-6; isolates Barak Valley, Tripura & Mizoram."
    },
    {
        "id": "khliehriat_subsidence",
        "name": "Khliehriat Hill Section (NH-6)",
        "district": "East Jaintia Hills",
        "lat": 25.3520,
        "lon": 92.3680,
        "elevation_m": 1240.0,
        "slope_deg": 24.0,
        "radius_m": 900,
        "hazard_description": "Slope instability and mining-induced surface subsidence along highway cuttings."
    },
    {
        "id": "mawkdok_gorge",
        "name": "Mawkdok Dympep Gorge Rim (SH-5)",
        "district": "East Khasi Hills",
        "lat": 25.3850,
        "lon": 91.7610,
        "elevation_m": 1580.0,
        "slope_deg": 34.0,
        "radius_m": 1000,
        "hazard_description": "Sheer gorge wall collapse risk and dense zero-visibility fog during cloudburst events."
    },
    {
        "id": "sohra_nohsngithiang",
        "name": "Sohra-Nohsngithiang Escarpment",
        "district": "East Khasi Hills",
        "lat": 25.2680,
        "lon": 91.7340,
        "elevation_m": 1430.0,
        "slope_deg": 31.0,
        "radius_m": 1100,
        "hazard_description": "Massive waterfalls and torrential plateau runoff causing edge scouring and debris slips."
    },
    {
        "id": "nongpoh_scurve",
        "name": "Nongpoh Valley S-Curve (NH-6)",
        "district": "Ri Bhoi",
        "lat": 25.9080,
        "lon": 91.8840,
        "elevation_m": 580.0,
        "slope_deg": 22.0,
        "radius_m": 850,
        "hazard_description": "Heavy clay soil slumping and flash inundation on Guwahati-Shillong expressway."
    },
    {
        "id": "byrnihat_foothills",
        "name": "Byrnihat Monsoon Chokepoint (NH-6)",
        "district": "Ri Bhoi",
        "lat": 26.0520,
        "lon": 91.8680,
        "elevation_m": 140.0,
        "slope_deg": 14.0,
        "radius_m": 800,
        "hazard_description": "Foothill runoff and drainage backflow at Meghalaya-Assam boundary."
    },
    {
        "id": "rongram_pass",
        "name": "Rongram Hill Cutting (NH-127B)",
        "district": "West Garo Hills",
        "lat": 25.5890,
        "lon": 90.2670,
        "elevation_m": 410.0,
        "slope_deg": 21.0,
        "radius_m": 900,
        "hazard_description": "Garo Hills lateral landslide cut threatening Tura road connectivity."
    },
    {
        "id": "baghmara_siju",
        "name": "Siju Gorge Hill Track",
        "district": "South Garo Hills",
        "lat": 25.1870,
        "lon": 90.6380,
        "elevation_m": 290.0,
        "slope_deg": 26.0,
        "radius_m": 950,
        "hazard_description": "Limestone karst collapse and Simsang river overflow cutting off South Garo villages."
    }
]

# Arterial Waypoints for synthesizing road corridors across Meghalaya
CORRIDOR_WAYPOINTS = {
    "NH-6 Lifeline (Guwahati - Shillong - Jowai - Sonapur)": [
        ("Jorabat Gate (Assam-Meghalaya Border)", 26.1150, 91.8600, 110.0, 6.0, "Ri Bhoi"),
        ("Byrnihat Industrial Belt", 26.0520, 91.8680, 140.0, 14.0, "Ri Bhoi"),
        ("20th Mile Umling", 25.9800, 91.8750, 310.0, 18.0, "Ri Bhoi"),
        ("Nongpoh Valley Transit", 25.9080, 91.8840, 580.0, 22.0, "Ri Bhoi"),
        ("Umsning Express Bypass", 25.7530, 91.8950, 890.0, 19.0, "Ri Bhoi"),
        ("Umiam Barapani Lake Viaduct", 25.6600, 91.9050, 1020.0, 12.0, "Ri Bhoi"),
        ("Mawlai Shillong North", 25.6000, 91.8900, 1480.0, 16.0, "East Khasi Hills"),
        ("Shillong Central Junction", 25.5780, 91.8930, 1520.0, 10.0, "East Khasi Hills"),
        ("Mawryngkneng Ridge", 25.5560, 92.0550, 1410.0, 15.0, "East Khasi Hills"),
        ("Shangpung Crossroad", 25.5050, 92.2000, 1340.0, 18.0, "West Jaintia Hills"),
        ("Jowai District HQ", 25.4500, 92.2000, 1380.0, 12.0, "West Jaintia Hills"),
        ("Lad Rymbai Coal Transit", 25.3500, 92.3200, 1290.0, 21.0, "East Jaintia Hills"),
        ("Khliehriat Sub-divisional Center", 25.3520, 92.3680, 1240.0, 24.0, "East Jaintia Hills"),
        ("Lumshnong Cement Belt", 25.1800, 92.3800, 780.0, 28.0, "East Jaintia Hills"),
        ("Sonapur River & Tunnel Pass", 25.1165, 92.3654, 420.0, 32.5, "East Jaintia Hills"),
        ("Ratacherra (Tripura/Barak Border)", 25.0300, 92.4200, 160.0, 14.0, "East Jaintia Hills")
    ],
    "NH-6 Shillong Eastern Bypass (Expressway)": [
        ("Umsning Express Bypass", 25.7530, 91.8950, 890.0, 19.0, "Ri Bhoi"),
        ("Bhoirymbong Bypass Interchange", 25.6820, 91.9800, 1120.0, 11.0, "Ri Bhoi"),
        ("Mawryngkneng Ridge", 25.5560, 92.0550, 1410.0, 15.0, "East Khasi Hills")
    ],
    "Sonapur Tunnel Umrangso Relief Bypass": [
        ("Khliehriat Sub-divisional Center", 25.3520, 92.3680, 1240.0, 24.0, "East Jaintia Hills"),
        ("Saipung High Plateau", 25.2600, 92.5100, 1150.0, 12.0, "East Jaintia Hills"),
        ("Umrangso Border Link", 25.1700, 92.5600, 680.0, 14.0, "East Jaintia Hills"),
        ("Ratacherra (Tripura/Barak Border)", 25.0300, 92.4200, 160.0, 14.0, "East Jaintia Hills")
    ],
    "SH-5 Sohra / Cherrapunji Escarpment": [
        ("Shillong Central Junction", 25.5780, 91.8930, 1520.0, 10.0, "East Khasi Hills"),
        ("Upper Shillong Peak Ascent", 25.5350, 91.8500, 1960.0, 22.0, "East Khasi Hills"),
        ("Elephant Falls / 7th Mile", 25.5350, 91.8200, 1720.0, 18.0, "East Khasi Hills"),
        ("Mylliem Iron Plateau", 25.4950, 91.8150, 1680.0, 16.0, "East Khasi Hills"),
        ("Mawkdok Dympep Gorge Rim", 25.3850, 91.7610, 1580.0, 34.0, "East Khasi Hills"),
        ("Sohra Cherrapunji Town Center", 25.2750, 91.7320, 1430.0, 20.0, "East Khasi Hills"),
        ("Nohsngithiang Falls Escarpment", 25.2680, 91.7340, 1280.0, 31.0, "East Khasi Hills"),
        ("Shella Gorge Border Point", 25.1800, 91.6450, 220.0, 29.0, "East Khasi Hills")
    ],
    "Weiloi to Sohra Ridge Alternative": [
        ("Weiloi Mountain Junction", 25.3800, 91.6200, 1620.0, 23.0, "East Khasi Hills"),
        ("Dympep West Saddle", 25.3400, 91.6800, 1480.0, 15.0, "East Khasi Hills"),
        ("Sohra Cherrapunji Town Center", 25.2750, 91.7320, 1430.0, 20.0, "East Khasi Hills")
    ],
    "Mawphlang - Mawsynram Rain Belt": [
        ("Shillong Central Junction", 25.5780, 91.8930, 1520.0, 10.0, "East Khasi Hills"),
        ("Mawphlang Sacred Grove", 25.4500, 91.7580, 1790.0, 15.0, "East Khasi Hills"),
        ("Weiloi Mountain Junction", 25.3800, 91.6200, 1620.0, 23.0, "East Khasi Hills"),
        ("Mawsynram World Rain Record", 25.2970, 91.5830, 1400.0, 28.0, "East Khasi Hills"),
        ("Balat Foothills Outpost", 25.1800, 91.4500, 180.0, 18.0, "South West Khasi Hills")
    ],
    "Western Garo Hills Trunk Link": [
        ("Bajengdoba Junction", 25.8830, 90.5540, 240.0, 10.0, "North Garo Hills"),
        ("Resubelpara District Center", 25.9000, 90.6000, 260.0, 12.0, "North Garo Hills"),
        ("Rongram Mountain Pass", 25.5890, 90.2670, 410.0, 21.0, "West Garo Hills"),
        ("Tura District Headquarters", 25.5140, 90.2150, 390.0, 15.0, "West Garo Hills"),
        ("Ampati Border Sub-division", 25.4660, 89.9460, 110.0, 8.0, "South West Garo Hills"),
        ("Williamnagar Simsang Valley", 25.7350, 90.6710, 330.0, 14.0, "East Garo Hills"),
        ("Baghmara / Siju Cave Corridor", 25.1870, 90.6380, 290.0, 26.0, "South Garo Hills")
    ],
    "Central Khasi-Jaintia Interior Connector": [
        ("Shillong Central Junction", 25.5780, 91.8930, 1520.0, 10.0, "East Khasi Hills"),
        ("Mairang Sub-divisional HQ", 25.5600, 91.6350, 1680.0, 14.0, "Eastern West Khasi Hills"),
        ("Nongstoin District Center", 25.5200, 91.2700, 1410.0, 18.0, "West Khasi Hills"),
        ("Shallang Coal Basin", 25.6800, 91.0200, 820.0, 22.0, "West Khasi Hills"),
        ("Rongjeng East Garo Junction", 25.7200, 90.7800, 390.0, 16.0, "East Garo Hills"),
        ("Williamnagar Simsang Valley", 25.7350, 90.6710, 330.0, 14.0, "East Garo Hills")
    ],
    "Northern Assam-Meghalaya Arterial Link": [
        ("Bajengdoba Junction", 25.8830, 90.5540, 240.0, 10.0, "North Garo Hills"),
        ("Dudhnoi Link Post", 25.9800, 90.7300, 160.0, 6.0, "North Garo Hills"),
        ("Boko Transit Post", 25.9800, 91.2000, 120.0, 5.0, "Ri Bhoi"),
        ("Jorabat Gate (Assam-Meghalaya Border)", 26.1150, 91.8600, 110.0, 6.0, "Ri Bhoi")
    ]
}

class MeghalayaRoadNetwork:
    def __init__(self):
        self.segments: List[Dict[str, Any]] = []
        self.graph: nx.DiGraph = nx.DiGraph()
        self.chokepoints = MEGHALAYA_CHOKEPOINTS
        self.build_segments_and_graph()

    def build_segments_and_graph(self):
        """Builds standardized road segments of ~1.5 to 3.0 km each along all Meghalaya corridors."""
        self.segments = []
        self.graph = nx.DiGraph()
        seg_counter = 1

        for corridor_name, waypoints in CORRIDOR_WAYPOINTS.items():
            for i in range(len(waypoints) - 1):
                p1 = waypoints[i]
                p2 = waypoints[i + 1]

                total_dist = haversine_distance_m(p1[1], p1[2], p2[1], p2[2])
                # Subdivide long stretches into ~2.2 km segments
                n_sub = max(1, int(round(total_dist / 2200.0)))

                for s in range(n_sub):
                    frac1 = s / float(n_sub)
                    frac2 = (s + 1) / float(n_sub)

                    s_lat = p1[1] + frac1 * (p2[1] - p1[1])
                    s_lon = p1[2] + frac1 * (p2[2] - p1[2])
                    e_lat = p1[1] + frac2 * (p2[1] - p1[1])
                    e_lon = p1[2] + frac2 * (p2[2] - p1[2])
                    m_lat = (s_lat + e_lat) / 2.0
                    m_lon = (s_lon + e_lon) / 2.0

                    length_m = round(haversine_distance_m(s_lat, s_lon, e_lat, e_lon), 1)
                    elevation = round(p1[3] + ((frac1 + frac2) / 2.0) * (p2[3] - p1[3]), 1)
                    slope = round(p1[4] + ((frac1 + frac2) / 2.0) * (p2[4] - p1[4]), 2)
                    district = p1[5] if frac1 < 0.5 else p2[5]

                    # Check proximity to known chokepoints
                    near_cp_dist = min(
                        haversine_distance_m(m_lat, m_lon, cp["lat"], cp["lon"])
                        for cp in MEGHALAYA_CHOKEPOINTS
                    ) / 1000.0

                    seg_id = f"ML_SEG_{seg_counter:04d}"
                    road_type = "trunk" if "NH-6" in corridor_name else ("primary" if "SH-5" in corridor_name else "secondary")
                    
                    segment_obj = {
                        "segment_id": seg_id,
                        "corridor": corridor_name,
                        "start_name": f"{p1[0]} (Sub-{s+1})" if n_sub > 1 else p1[0],
                        "end_name": f"{p2[0]} (Sub-{s+1})" if n_sub > 1 else p2[0],
                        "road_type": road_type,
                        "start_lat": round(s_lat, 5),
                        "start_lon": round(s_lon, 5),
                        "end_lat": round(e_lat, 5),
                        "end_lon": round(e_lon, 5),
                        "mid_lat": round(m_lat, 5),
                        "mid_lon": round(m_lon, 5),
                        "length_m": length_m,
                        "elevation": elevation,
                        "slope": slope,
                        "district": district,
                        "near_hazard_km": round(near_cp_dist, 2),
                        "base_speed_kmh": 50 if road_type == "trunk" else (35 if road_type == "primary" else 28)
                    }

                    self.segments.append(segment_obj)

                    # Add to NetworkX graph with node coordinates
                    u_node = f"{round(s_lat, 4)},{round(s_lon, 4)}"
                    v_node = f"{round(e_lat, 4)},{round(e_lon, 4)}"

                    if u_node not in self.graph:
                        self.graph.add_node(u_node, lat=round(s_lat, 5), lon=round(s_lon, 5), name=segment_obj["start_name"])
                    if v_node not in self.graph:
                        self.graph.add_node(v_node, lat=round(e_lat, 5), lon=round(e_lon, 5), name=segment_obj["end_name"])

                    free_flow_hours = (length_m / 1000.0) / segment_obj["base_speed_kmh"]

                    self.graph.add_edge(u_node, v_node, 
                                        segment_id=seg_id, 
                                        distance_m=length_m, 
                                        length_m=length_m,
                                        free_flow_hours=free_flow_hours,
                                        elevation=elevation,
                                        slope=slope,
                                        district=district,
                                        corridor=corridor_name,
                                        current_risk=0.15)
                    # Bidirectional
                    self.graph.add_edge(v_node, u_node, 
                                        segment_id=seg_id, 
                                        distance_m=length_m, 
                                        length_m=length_m,
                                        free_flow_hours=free_flow_hours,
                                        elevation=elevation,
                                        slope=slope,
                                        district=district,
                                        corridor=corridor_name,
                                        current_risk=0.15)

                    seg_counter += 1

        print(f"[Meghalaya Road Network] Built {len(self.segments)} standardized segments across arterial & bypass corridors.")
        print(f"[Meghalaya Road Network] NetworkX graph has {self.graph.number_of_nodes()} nodes and {self.graph.number_of_edges()} directed edges.")

    def find_nearest_node(self, lat: float, lon: float) -> Optional[str]:
        """Finds the nearest road node in the Meghalaya graph to the given GPS coordinates."""
        best_node = None
        min_dist = float("inf")
        for node, data in self.graph.nodes(data=True):
            n_lat = data.get("lat")
            n_lon = data.get("lon")
            if n_lat is not None and n_lon is not None:
                dist = haversine_distance_m(lat, lon, n_lat, n_lon)
                if dist < min_dist:
                    min_dist = dist
                    best_node = node
        return best_node

    def update_edge_risk_scores(self, risk_lookup: Dict[str, float]):
        """Updates real-time risk scores on all graph edges based on ML predictions."""
        for u, v, d in self.graph.edges(data=True):
            seg_id = d.get("segment_id")
            if seg_id in risk_lookup:
                d["current_risk"] = risk_lookup[seg_id]

meghalaya_net = MeghalayaRoadNetwork()

