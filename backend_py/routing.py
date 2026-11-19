import math
import networkx as nx
from typing import Dict, List, Tuple, Any, Optional

try:
    from backend_py.road_network import road_net, haversine_distance_m
    from backend_py.ml_risk_model import ml_system
except ImportError:
    from road_network import road_net, haversine_distance_m
    from ml_risk_model import ml_system

class RoutingEngine:
    def __init__(self):
        self.road_net = road_net

    def compute_route_comparison(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        rain_1h: float = 2.0,
        rain_24h: float = 25.0,
        rain_3day: float = 65.0,
        risk_penalty_weight: float = 25.0
    ) -> Dict[str, Any]:
        """
        Computes both the Normal Shortest Route along NH-10
        and the Risk-Aware Safer Route (penalized by ML landslide risk scores).
        """
        # 1. Update ML risk scores for all corridor segments under current rain scenario
        scored_segs = ml_system.predict_all_corridor_segments(rain_1h, rain_24h, rain_3day)
        risk_lookup = {seg["segment_id"]: seg["risk_score"] for seg in scored_segs}
        self.road_net.update_edge_risk_scores(risk_lookup)

        graph = self.road_net.graph

        # Find nearest graph nodes to requested start and end coordinates
        start_node = self.road_net.find_nearest_node(start_lat, start_lon)
        end_node = self.road_net.find_nearest_node(end_lat, end_lon)

        if not start_node or not end_node:
            raise ValueError(f"Could not find graph nodes close to ({start_lat}, {start_lon}) or ({end_lat}, {end_lon})")

        # 2. Standard Shortest Highway Route (Prefers NH-10 National Highway spine)
        def standard_highway_weight(u, v, d):
            length = d.get("length_m", 50.0)
            is_bypass = "Bypass" in d.get("road_name", "")
            # Normal commuters stay on the main national highway NH-10 unless specifically routing for safety
            return length * (2.2 if is_bypass else 1.0)

        try:
            shortest_path_nodes = nx.shortest_path(graph, source=start_node, target=end_node, weight=standard_highway_weight)
        except nx.NetworkXNoPath:
            shortest_path_nodes = nx.shortest_path(graph.to_undirected(), source=start_node, target=end_node, weight=standard_highway_weight)

        # 3. Risk-Aware Safer Route
        # Non-linear penalty applied to edges based on Random Forest predicted risk
        def risk_aware_weight(u, v, d):
            length = d.get("length_m", 50.0)
            risk = d.get("current_risk", 0.15)
            # Severe penalty for segments exceeding moderate risk threshold
            penalty = 1.0 + risk_penalty_weight * (risk ** 2.2)
            if risk >= 0.70:
                penalty *= 4.5  # Strong avoidance of critical debris flow zones
            return length * penalty

        try:
            safe_path_nodes = nx.shortest_path(graph, source=start_node, target=end_node, weight=risk_aware_weight)
        except nx.NetworkXNoPath:
            safe_path_nodes = nx.shortest_path(graph.to_undirected(), source=start_node, target=end_node, weight=risk_aware_weight)

        # 4. Extract detailed path metrics and geometry
        shortest_metrics = self._extract_path_details(graph, shortest_path_nodes, "Shortest Route (Standard NH-10)")
        safe_metrics = self._extract_path_details(graph, safe_path_nodes, "Risk-Aware Safer Route")

        # Calculate safety improvement metrics
        risk_reduction_pct = 0.0
        if shortest_metrics["average_risk"] > 0:
            diff = shortest_metrics["average_risk"] - safe_metrics["average_risk"]
            risk_reduction_pct = round(max(0.0, (diff / shortest_metrics["average_risk"]) * 100.0), 1)

        detour_km = round(safe_metrics["total_distance_km"] - shortest_metrics["total_distance_km"], 2)

        recommendation = "Standard NH-10 route is optimal and safe under current conditions."
        if risk_reduction_pct >= 25.0:
            recommendation = f"CRITICAL: High landslide risk detected on NH-10. Diverting to Safer Mountain Route reduces risk by {risk_reduction_pct}%."
        elif risk_reduction_pct >= 10.0:
            recommendation = f"ADVISORY: Risk-Aware Route avoids hazardous chokepoints with a {risk_reduction_pct}% safety margin."

        return {
            "origin": {"lat": start_lat, "lon": start_lon},
            "destination": {"lat": end_lat, "lon": end_lon},
            "weather_scenario": {
                "rain_1h_mm": rain_1h,
                "rain_24h_mm": rain_24h,
                "rain_3day_mm": rain_3day
            },
            "comparison": {
                "risk_reduction_pct": risk_reduction_pct,
                "detour_km": detour_km,
                "time_difference_mins": round(safe_metrics["estimated_time_mins"] - shortest_metrics["estimated_time_mins"], 1),
                "high_risk_segments_avoided": max(0, shortest_metrics["high_risk_segments_count"] - safe_metrics["high_risk_segments_count"]),
                "recommendation": recommendation
            },
            "shortest_route": shortest_metrics,
            "safer_route": safe_metrics
        }

    def _extract_path_details(self, graph: nx.Graph, path_nodes: List[str], label: str) -> Dict[str, Any]:
        """Extracts coordinate geometry, elevation profile, distance, and risk stats for a given node path."""
        total_length_m = 0.0
        risks = []
        coordinates = []
        chokepoints_encountered = []
        high_risk_count = 0

        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i + 1]
            edge_data = graph.get_edge_data(u, v) or graph.get_edge_data(v, u) or {}

            length = edge_data.get("length_m", 50.0)
            risk = edge_data.get("current_risk", 0.15)
            total_length_m += length
            risks.append(risk)

            if risk >= 0.50:
                high_risk_count += 1

            cp = edge_data.get("chokepoint")
            if cp and cp not in chokepoints_encountered:
                chokepoints_encountered.append(cp)

            # Node coordinates
            u_lat = graph.nodes[u].get("lat")
            u_lon = graph.nodes[u].get("lon")
            if not coordinates or coordinates[-1] != [u_lat, u_lon]:
                coordinates.append([u_lat, u_lon])

        # Add destination coordinate
        dest_node = path_nodes[-1]
        coordinates.append([graph.nodes[dest_node].get("lat"), graph.nodes[dest_node].get("lon")])

        total_distance_km = round(total_length_m / 1000.0, 2)
        avg_risk = round(sum(risks) / max(1, len(risks)), 3)
        max_risk = round(max(risks) if risks else 0.0, 3)

        # Mountain driving speed: ~32 km/h base, reduced when steep or risky
        speed_kmh = max(18.0, 34.0 - (avg_risk * 15.0))
        estimated_time_mins = round((total_distance_km / speed_kmh) * 60.0, 1)

        return {
            "name": label,
            "total_distance_km": total_distance_km,
            "estimated_time_mins": estimated_time_mins,
            "average_risk": avg_risk,
            "peak_risk": max_risk,
            "high_risk_segments_count": high_risk_count,
            "chokepoints_traversed": chokepoints_encountered,
            "node_count": len(path_nodes),
            "geojson": {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[lon, lat] for lat, lon in coordinates]  # GeoJSON expects [lon, lat]
                },
                "properties": {
                    "name": label,
                    "distance_km": total_distance_km,
                    "avg_risk": avg_risk
                }
            },
            "path_coordinates": coordinates  # [lat, lon] for Leaflet / MapLibre mapping
        }

router = RoutingEngine()
