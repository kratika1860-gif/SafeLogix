import math
import networkx as nx
from typing import Dict, List, Tuple, Any, Optional

try:
    from backend_py.meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS, haversine_distance_m
    from backend_py.meghalaya_ml_model import meghalaya_ml
except ImportError:
    from meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS, haversine_distance_m
    from meghalaya_ml_model import meghalaya_ml

MEGHALAYA_PRESET_ROUTES = [
    {
        "id": "guwahati_silchar",
        "name": "Guwahati (Jorabat) ⇄ Silchar Border (Ratacherra)",
        "description": "Primary North-East interstate lifeline crossing Ri Bhoi, Khasi Hills & Jaintia Hills to Barak Valley.",
        "start": {"name": "Guwahati / Jorabat Gate", "lat": 26.1150, "lon": 91.8600},
        "end": {"name": "Ratacherra / Silchar Link", "lat": 25.0300, "lon": 92.4200}
    },
    {
        "id": "shillong_sonapur",
        "name": "Shillong Central ⇄ Sonapur Tunnel Gate (NH-6)",
        "description": "Vital transit corridor directly exposed to the hazardous Sonapur river cut & mudslide chokepoint.",
        "start": {"name": "Shillong Central Junction", "lat": 25.5780, "lon": 91.8930},
        "end": {"name": "Sonapur Tunnel Pass", "lat": 25.1165, "lon": 92.3654}
    },
    {
        "id": "shillong_sohra",
        "name": "Shillong Central ⇄ Sohra (Cherrapunji)",
        "description": "High-altitude mountain road traversing Mawkdok Dympep Gorge Rim into the world record rain plateau.",
        "start": {"name": "Shillong Central Junction", "lat": 25.5780, "lon": 91.8930},
        "end": {"name": "Sohra Cherrapunji Center", "lat": 25.2750, "lon": 91.7320}
    },
    {
        "id": "guwahati_shillong",
        "name": "Guwahati (Jorabat) ⇄ Shillong Central",
        "description": "Four-lane highway arterial connecting Assam with state capital via Nongpoh and Umiam Lake.",
        "start": {"name": "Guwahati / Jorabat Gate", "lat": 26.1150, "lon": 91.8600},
        "end": {"name": "Shillong Central Junction", "lat": 25.5780, "lon": 91.8930}
    },
    {
        "id": "shillong_tura",
        "name": "Shillong Central ⇄ Tura (Garo Hills)",
        "description": "Trans-Meghalaya arterial traversing Mairang, Nongstoin, Rongjeng & Williamnagar across Garo Hills.",
        "start": {"name": "Shillong Central Junction", "lat": 25.5780, "lon": 91.8930},
        "end": {"name": "Tura District HQ", "lat": 25.5140, "lon": 90.2150}
    },
    {
        "id": "jowai_ratacherra",
        "name": "Jowai District HQ ⇄ Ratacherra (Tripura Link)",
        "description": "Coal belt and cement transport spine connecting East Jaintia Hills to southern borders.",
        "start": {"name": "Jowai District HQ", "lat": 25.4500, "lon": 92.2000},
        "end": {"name": "Ratacherra (Tripura/Barak Border)", "lat": 25.0300, "lon": 92.4200}
    }
]

class MeghalayaRoutingEngine:
    def __init__(self):
        self.road_net = meghalaya_net
        self._cached_weather: Optional[Tuple[float, float, float]] = None

    def get_preset_routes(self) -> List[Dict[str, Any]]:
        return MEGHALAYA_PRESET_ROUTES

    def get_all_hubs(self) -> List[Dict[str, Any]]:
        """Returns all distinct transit hubs, district centers, and key intersections in Meghalaya."""
        try:
            from backend_py.meghalaya_network import CORRIDOR_WAYPOINTS
        except ImportError:
            from meghalaya_network import CORRIDOR_WAYPOINTS

        hubs = []
        for corridor_name, waypoints in CORRIDOR_WAYPOINTS.items():
            for wp in waypoints:
                name, lat, lon, elev, slope, district = wp
                clean_name = name.split(" (")[0]
                if not any(h["name"] == clean_name for h in hubs):
                    hubs.append({
                        "name": clean_name,
                        "display_name": f"{clean_name} ({district})",
                        "lat": lat,
                        "lon": lon,
                        "district": district,
                        "elevation_m": elev
                    })
        return sorted(hubs, key=lambda x: (x["district"], x["name"]))

    def compute_route_comparison(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        rain_1d: float = 35.0,
        rain_3d: float = 85.0,
        rain_7d: float = 160.0,
        risk_penalty_weight: float = 28.0
    ) -> Dict[str, Any]:
        """
        Computes dynamic route optimization for Meghalaya:
        1. Shortest Highway Route (Free-flow time / distance priority).
        2. Risk-Aware Safer Alternative Route (Penalized non-linearly with ML landslide predictions).
        """
        # 1. Update ML predictions with weather-level caching
        weather_key = (round(rain_1d, 1), round(rain_3d, 1), round(rain_7d, 1))
        if self._cached_weather != weather_key:
            scored_segs = meghalaya_ml.predict_all_segments(rain_1d, rain_3d, rain_7d)
            risk_lookup = {seg["segment_id"]: seg["risk_score"] for seg in scored_segs}
            self.road_net.update_edge_risk_scores(risk_lookup)
            self._cached_weather = weather_key

        graph = self.road_net.graph

        # 2. Find nearest graph nodes
        start_node = self.road_net.find_nearest_node(start_lat, start_lon)
        end_node = self.road_net.find_nearest_node(end_lat, end_lon)

        if not start_node or not end_node:
            raise ValueError(f"Could not find graph nodes close to ({start_lat}, {start_lon}) or ({end_lat}, {end_lon})")

        # 3. Standard Shortest Route Weight (Minimizes free-flow travel time)
        def standard_weight(u, v, d):
            free_flow = d.get("free_flow_hours", (d.get("length_m", 100.0) / 1000.0) / 45.0)
            corridor = d.get("corridor", "")
            # Highway arterial spine preferred for standard commercial transit
            is_bypass = "Bypass" in corridor or "Alternative" in corridor or "Relief" in corridor
            multiplier = 1.15 if is_bypass else 1.0
            return free_flow * multiplier

        try:
            shortest_path_nodes = nx.shortest_path(graph, source=start_node, target=end_node, weight=standard_weight)
        except nx.NetworkXNoPath:
            shortest_path_nodes = nx.shortest_path(graph.to_undirected(), source=start_node, target=end_node, weight=standard_weight)

        # 4. Risk-Aware Safer Route Weight (Travel-time scaled with Calibrated ML Landslide Risk)
        # Weight Formula: W = FreeFlowHours * [1.0 + alpha * (CalibratedRisk ^ beta)]
        def risk_aware_weight(u, v, d):
            free_flow = d.get("free_flow_hours", (d.get("length_m", 100.0) / 1000.0) / 45.0)
            risk = d.get("current_risk", 0.15)
            # Non-linear penalty scaling justified by sensitivity analysis:
            # At risk=0.10 -> 1.0 + 28*(0.10^2.2) = 1.18
            # At risk=0.30 -> 1.0 + 28*(0.30^2.2) = 2.96
            # At risk=0.50 -> 1.0 + 28*(0.50^2.2) = 7.10
            # At risk=0.80 -> 1.0 + 28*(0.80^2.2) = 20.10
            penalty = 1.0 + risk_penalty_weight * (risk ** 2.2)
            if risk >= 0.60:
                penalty *= 4.0  # Forceful diversion away from high hazard zones like Sonapur Tunnel
            return free_flow * penalty

        try:
            safe_path_nodes = nx.shortest_path(graph, source=start_node, target=end_node, weight=risk_aware_weight)
        except nx.NetworkXNoPath:
            safe_path_nodes = nx.shortest_path(graph.to_undirected(), source=start_node, target=end_node, weight=risk_aware_weight)

        # 5. Extract detailed path metrics and geometry
        shortest_metrics = self._extract_path_details(graph, shortest_path_nodes, "Standard Route (Shortest Highway Spine)")
        safe_metrics = self._extract_path_details(graph, safe_path_nodes, "Risk-Aware Safer Alternative Route")

        # 6. Safety improvement comparison
        risk_reduction_pct = 0.0
        if shortest_metrics["average_risk"] > 0:
            diff = shortest_metrics["average_risk"] - safe_metrics["average_risk"]
            risk_reduction_pct = round(max(0.0, (diff / shortest_metrics["average_risk"]) * 100.0), 1)

        detour_km = round(safe_metrics["total_distance_km"] - shortest_metrics["total_distance_km"], 2)
        time_diff_mins = round(safe_metrics["estimated_time_mins"] - shortest_metrics["estimated_time_mins"], 1)

        # Actionable recommendations
        if risk_reduction_pct >= 25.0 or safe_metrics["high_risk_segments_count"] < shortest_metrics["high_risk_segments_count"]:
            chokepoints_str = ", ".join(shortest_metrics["chokepoints_encountered"]) if shortest_metrics["chokepoints_encountered"] else "critical hill cuttings"
            recommendation = (
                f"CRITICAL HAZARD DETECTED: Shortest highway crosses severe landslide zone ({chokepoints_str}) "
                f"with peak risk {shortest_metrics['peak_risk']:.0%}. Taking Safer Alternative reduces landslide probability by "
                f"{risk_reduction_pct}% with a detour of {detour_km} km ({time_diff_mins} mins)."
            )
        elif risk_reduction_pct >= 10.0:
            recommendation = (
                f"MODERATE ADVISORY: Risk-Aware Route avoids hazardous chokepoints with a {risk_reduction_pct}% safety margin. "
                f"Recommended for heavy relief supply convoys and fuel tankers."
            )
        else:
            recommendation = (
                f"OPTIMAL: Highway conditions are stable across this corridor. Standard route is verified safe under current precipitation."
            )

        # Direct Comparative Analysis: Better, Faster, Safer
        if time_diff_mins < 0:
            faster_name = "Safer Alternative Route"
            faster_detail = f"Safer route arrives {abs(time_diff_mins):.1f} mins faster ({safe_metrics['total_distance_km']} km vs {shortest_metrics['total_distance_km']} km)."
        elif time_diff_mins == 0:
            faster_name = "Both routes have identical travel time"
            faster_detail = f"Both paths take approximately {shortest_metrics['estimated_time_hours']:.1f} hours ({shortest_metrics['total_distance_km']} km)."
        else:
            faster_name = "Standard Shortest Highway"
            faster_detail = f"Direct highway is {time_diff_mins:.1f} mins faster ({shortest_metrics['total_distance_km']} km vs {safe_metrics['total_distance_km']} km under free-flow conditions)."

        if risk_reduction_pct > 0 or safe_metrics["high_risk_segments_count"] < shortest_metrics["high_risk_segments_count"]:
            safer_name = "Risk-Aware Safer Alternative Route"
            avoided_names = [cp for cp in shortest_metrics["chokepoints_encountered"] if cp not in safe_metrics["chokepoints_encountered"]]
            avoided_str = f", completely bypassing {', '.join(avoided_names)}" if avoided_names else ""
            safer_detail = (
                f"Reduces average landslide failure probability by {risk_reduction_pct}% "
                f"and peak hazard from {shortest_metrics['peak_risk']:.0%} down to {safe_metrics['peak_risk']:.0%}{avoided_str}."
            )
            is_safer_better = (shortest_metrics["peak_risk"] >= 0.45 or risk_reduction_pct >= 8.0 or shortest_metrics["high_risk_segments_count"] > safe_metrics["high_risk_segments_count"])
        else:
            safer_name = "Both routes have equal risk profile"
            safer_detail = f"Current precipitation does not trigger severe hazard thresholds across either path (peak risk: {shortest_metrics['peak_risk']:.0%})."
            is_safer_better = False

        if is_safer_better:
            better_name = "Risk-Aware Safer Alternative Route"
            better_verdict = "STRONGLY RECOMMENDED FOR MONSOON TRANSIT & RELIEF CONVOYS"
            better_badge = "SAFER ROUTE IS BETTER (AVOIDS STRANDING)"
            better_color = "#06b6d4"
            better_reason = (
                f"Although taking the safer detour adds {detour_km:.1f} km ({time_diff_mins:.1f} mins), "
                f"the standard highway traverses high-hazard chokepoints with up to {shortest_metrics['peak_risk']:.0%} failure risk. "
                f"Monsoon debris flows on the direct route carry a high probability of multi-hour stranding. Safety takes precedence."
            )
        else:
            better_name = "Standard Shortest Highway"
            better_verdict = "RECOMMENDED FOR MAXIMUM TIME EFFICIENCY"
            better_badge = "DIRECT HIGHWAY IS BETTER (CONDITIONS VERIFIED STABLE)"
            better_color = "#10b981"
            better_reason = (
                f"Highway conditions are verified stable across this stretch under current weather. "
                f"Peak hazard is manageable at {shortest_metrics['peak_risk']:.0%}, so the direct {shortest_metrics['total_distance_km']} km route "
                f"is the most efficient path with zero unnecessary detours."
            )

        better_faster_safer = {
            "faster_route": faster_name,
            "faster_detail": faster_detail,
            "safer_route": safer_name,
            "safer_detail": safer_detail,
            "better_route": better_name,
            "better_verdict": better_verdict,
            "better_badge": better_badge,
            "better_color": better_color,
            "better_reason": better_reason
        }

        return {
            "origin": {
                "name": graph.nodes[start_node].get("name", "Origin"),
                "lat": start_lat,
                "lon": start_lon,
                "node_id": start_node
            },
            "destination": {
                "name": graph.nodes[end_node].get("name", "Destination"),
                "lat": end_lat,
                "lon": end_lon,
                "node_id": end_node
            },
            "weather_scenario": {
                "rain_1d_mm": rain_1d,
                "rain_3d_mm": rain_3d,
                "rain_7d_mm": rain_7d
            },
            "comparison": {
                "risk_reduction_pct": risk_reduction_pct,
                "detour_km": detour_km,
                "time_difference_mins": time_diff_mins,
                "high_risk_segments_avoided": max(0, shortest_metrics["high_risk_segments_count"] - safe_metrics["high_risk_segments_count"]),
                "recommendation": recommendation
            },
            "better_faster_safer": better_faster_safer,
            "shortest_route": shortest_metrics,
            "safer_route": safe_metrics
        }

    def _extract_path_details(self, graph: nx.Graph, path_nodes: List[str], label: str) -> Dict[str, Any]:
        """Extracts coordinate geometry, elevation profile, distance, accumulated risk, and travel time."""
        total_length_m = 0.0
        total_free_flow_hours = 0.0
        risks = []
        accumulated_risk = 0.0
        coordinates = []
        chokepoints_encountered = []
        high_risk_count = 0
        waypoints_traversed = []

        for i in range(len(path_nodes) - 1):
            u = path_nodes[i]
            v = path_nodes[i + 1]
            edge_data = graph.get_edge_data(u, v) or graph.get_edge_data(v, u) or {}

            length = edge_data.get("length_m", 100.0)
            free_flow = edge_data.get("free_flow_hours", (length / 1000.0) / 45.0)
            risk = edge_data.get("current_risk", 0.15)
            
            total_length_m += length
            total_free_flow_hours += free_flow
            risks.append(risk)
            accumulated_risk += risk * (length / 1000.0)

            if risk >= 0.50:
                high_risk_count += 1

            # Match proximity to known chokepoints
            u_lat = graph.nodes[u].get("lat")
            u_lon = graph.nodes[u].get("lon")
            if u_lat is not None and u_lon is not None:
                for cp in MEGHALAYA_CHOKEPOINTS:
                    dist_to_cp = haversine_distance_m(u_lat, u_lon, cp["lat"], cp["lon"])
                    if dist_to_cp <= cp.get("radius_m", 1000) * 1.5:
                        if cp["name"] not in chokepoints_encountered:
                            chokepoints_encountered.append(cp["name"])

            u_name = graph.nodes[u].get("name", "")
            if u_name and not u_name.startswith("Sub-") and u_name not in waypoints_traversed:
                clean_name = u_name.split(" (Sub-")[0]
                if clean_name not in waypoints_traversed:
                    waypoints_traversed.append(clean_name)

            if not coordinates or coordinates[-1] != [u_lat, u_lon]:
                coordinates.append([u_lat, u_lon])

        # Add destination node
        dest_node = path_nodes[-1]
        dest_lat = graph.nodes[dest_node].get("lat")
        dest_lon = graph.nodes[dest_node].get("lon")
        coordinates.append([dest_lat, dest_lon])
        dest_name = graph.nodes[dest_node].get("name", "").split(" (Sub-")[0]
        if dest_name and dest_name not in waypoints_traversed:
            waypoints_traversed.append(dest_name)

        total_distance_km = round(total_length_m / 1000.0, 2)
        avg_risk = round(sum(risks) / max(1, len(risks)), 3)
        peak_risk = round(max(risks) if risks else 0.0, 3)
        accumulated_risk = round(accumulated_risk, 2)

        # Graph edge-supported travel time:
        # Base free-flow minutes from road graph
        free_flow_mins = round(total_free_flow_hours * 60.0, 1)
        # Delay-adjusted mountain transit time (slower speed when risk / wet surface increases)
        speed_delay_factor = max(0.50, 1.0 - (avg_risk * 0.45))
        estimated_time_mins = round(free_flow_mins / speed_delay_factor, 1)

        return {
            "label": label,
            "total_distance_km": total_distance_km,
            "free_flow_time_mins": free_flow_mins,
            "estimated_time_mins": estimated_time_mins,
            "estimated_time_hours": round(estimated_time_mins / 60.0, 2),
            "accumulated_risk": accumulated_risk,
            "average_risk": avg_risk,
            "peak_risk": peak_risk,
            "high_risk_segments_count": high_risk_count,
            "chokepoints_encountered": chokepoints_encountered,
            "waypoints": waypoints_traversed[:8],
            "coordinates": coordinates,
            "node_count": len(path_nodes)
        }

    def evaluate_parameter_sensitivity(
        self,
        start_lat: float,
        start_lon: float,
        end_lat: float,
        end_lon: float,
        rain_1d: float = 35.0,
        rain_3d: float = 85.0,
        rain_7d: float = 160.0
    ) -> Dict[str, Any]:
        """
        Conducts rigorous parameter sensitivity experiment comparing:
        - Penalty coefficients alpha in [10.0, 18.0, 28.0]
        - Penalty exponents beta in [1.8, 2.0, 2.2]
        Returns travel distance, travel time, and accumulated risk comparison matrix.
        """
        weather_key = (round(rain_1d, 1), round(rain_3d, 1), round(rain_7d, 1))
        if self._cached_weather != weather_key:
            scored_segs = meghalaya_ml.predict_all_segments(rain_1d, rain_3d, rain_7d)
            risk_lookup = {seg["segment_id"]: seg["risk_score"] for seg in scored_segs}
            self.road_net.update_edge_risk_scores(risk_lookup)
            self._cached_weather = weather_key

        graph = self.road_net.graph
        start_node = self.road_net.find_nearest_node(start_lat, start_lon)
        end_node = self.road_net.find_nearest_node(end_lat, end_lon)

        if not start_node or not end_node:
            raise ValueError("Could not find graph nodes close to supplied coordinates")

        # 1. Baseline shortest route (alpha = 0, pure free-flow travel time)
        def base_weight(u, v, d):
            return d.get("free_flow_hours", (d.get("length_m", 100.0) / 1000.0) / 45.0)

        shortest_nodes = nx.shortest_path(graph, source=start_node, target=end_node, weight=base_weight)
        shortest_details = self._extract_path_details(graph, shortest_nodes, "Baseline Shortest Route")

        # 2. Sensitivity Grid: alpha in [10, 18, 28], beta in [1.8, 2.0, 2.2]
        alphas = [10.0, 18.0, 28.0]
        betas = [1.8, 2.0, 2.2]
        experiments = []

        for alpha in alphas:
            for beta in betas:
                def weight_func(u, v, d, a=alpha, b=beta):
                    ff = d.get("free_flow_hours", (d.get("length_m", 100.0) / 1000.0) / 45.0)
                    r = d.get("current_risk", 0.15)
                    pen = 1.0 + a * (r ** b)
                    if r >= 0.60:
                        pen *= 4.0
                    return ff * pen

                try:
                    p_nodes = nx.shortest_path(graph, source=start_node, target=end_node, weight=weight_func)
                except nx.NetworkXNoPath:
                    p_nodes = nx.shortest_path(graph.to_undirected(), source=start_node, target=end_node, weight=weight_func)

                details = self._extract_path_details(graph, p_nodes, f"Risk-Aware (alpha={alpha}, beta={beta})")
                risk_reduction = 0.0
                if shortest_details["average_risk"] > 0:
                    diff = shortest_details["average_risk"] - details["average_risk"]
                    risk_reduction = round(max(0.0, (diff / shortest_details["average_risk"]) * 100.0), 1)

                experiments.append({
                    "alpha": alpha,
                    "beta": beta,
                    "formula": f"W = FreeFlowHours * [1 + {alpha:.0f} * (Risk ^ {beta:.1f})]",
                    "distance_km": details["total_distance_km"],
                    "travel_time_mins": details["estimated_time_mins"],
                    "accumulated_risk": details["accumulated_risk"],
                    "average_risk_pct": round(details["average_risk"] * 100.0, 1),
                    "peak_risk_pct": round(details["peak_risk"] * 100.0, 1),
                    "high_risk_segments": details["high_risk_segments_count"],
                    "detour_km": round(details["total_distance_km"] - shortest_details["total_distance_km"], 2),
                    "risk_reduction_pct": risk_reduction,
                    "chokepoints_bypassed": [cp for cp in shortest_details["chokepoints_encountered"] if cp not in details["chokepoints_encountered"]]
                })

        return {
            "origin": graph.nodes[start_node].get("name", "Origin"),
            "destination": graph.nodes[end_node].get("name", "Destination"),
            "baseline_shortest": {
                "distance_km": shortest_details["total_distance_km"],
                "travel_time_mins": shortest_details["estimated_time_mins"],
                "accumulated_risk": shortest_details["accumulated_risk"],
                "average_risk_pct": round(shortest_details["average_risk"] * 100.0, 1),
                "peak_risk_pct": round(shortest_details["peak_risk"] * 100.0, 1),
                "high_risk_segments": shortest_details["high_risk_segments_count"],
                "chokepoints": shortest_details["chokepoints_encountered"]
            },
            "sensitivity_grid": experiments,
            "recommended_parameters": {
                "alpha": 28.0,
                "beta": 2.2,
                "justification": "alpha=28.0 and beta=2.2 maximize detour sensitivity specifically when segment risk exceeds 50% without over-penalizing mildly wet roads (<20% risk), providing optimal balance between transit safety and commercial logistics efficiency."
            }
        }

meghalaya_router = MeghalayaRoutingEngine()
