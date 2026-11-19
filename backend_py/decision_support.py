import os
from typing import Dict, List, Any
import numpy as np

try:
    from backend_py.road_network import road_net, KNOWN_CHOKEPOINTS
    from backend_py.ml_risk_model import ml_system
    from backend_py.routing import router
except ImportError:
    from road_network import road_net, KNOWN_CHOKEPOINTS
    from ml_risk_model import ml_system
    from routing import router

# Key settlement nodes and relief supply hubs in Sikkim corridor
SETTLEMENTS_METADATA = [
    {
        "id": "mangan_dzongu",
        "name": "Mangan & Dzongu Valley",
        "region": "North Sikkim",
        "population": 18500,
        "vulnerability_score": 0.92,
        "base_stock_days": 2.0,
        "critical_access_chokepoint": "Pangthang North Corridor",
        "lat": 27.3773,
        "lon": 88.5590
    },
    {
        "id": "rongli_rolep",
        "name": "Rongli, Rolep & Rhenock Belt",
        "region": "East Sikkim Border Sub-division",
        "population": 22400,
        "vulnerability_score": 0.84,
        "base_stock_days": 2.5,
        "critical_access_chokepoint": "4th Mile Rongli Cut",
        "lat": 27.1954,
        "lon": 88.6115
    },
    {
        "id": "singtam_basin",
        "name": "Singtam Lower Teesta Basin",
        "region": "Central Transit Hub",
        "population": 14200,
        "vulnerability_score": 0.78,
        "base_stock_days": 3.0,
        "critical_access_chokepoint": "Singtam Riverfront Basin",
        "lat": 27.2344,
        "lon": 88.4988
    },
    {
        "id": "dikchu_hydro",
        "name": "Dikchu Power Colony & Hamlets",
        "region": "Teesta Valley Hydro Belt",
        "population": 6800,
        "vulnerability_score": 0.81,
        "base_stock_days": 2.2,
        "critical_access_chokepoint": "Singtam-Mangan Link Rd",
        "lat": 27.3710,
        "lon": 88.5420
    },
    {
        "id": "pakyong_rural",
        "name": "Pakyong Ridge & Airport Environs",
        "region": "East Sikkim South",
        "population": 31000,
        "vulnerability_score": 0.45,
        "base_stock_days": 6.0,
        "critical_access_chokepoint": "Pakyong Mountain Ridge",
        "lat": 27.2400,
        "lon": 88.5800
    },
    {
        "id": "gangtok_capital",
        "name": "Gangtok Municipal Capital",
        "region": "State Capital Center",
        "population": 105000,
        "vulnerability_score": 0.38,
        "base_stock_days": 8.0,
        "critical_access_chokepoint": "Pani House / Deorali Ascent",
        "lat": 27.3341,
        "lon": 88.6083
    }
]

def generate_logistics_decision_support(rain_1d: float, rain_3d: float, rain_7d: float) -> Dict[str, Any]:
    """
    Computes rigorous answers to the 5 core operational logistics questions:
    1. Which roads are likely to become inaccessible?
    2. How much delay should a logistics vehicle expect?
    3. Which areas are at the highest risk of being disconnected?
    4. What is the safest alternative route?
    5. Which villages or regions should receive emergency supplies first?
    """
    # 1. Predict risk across all 1,422 corridor segments
    scored_segments = ml_system.predict_all_corridor_segments(rain_1d, rain_3d, rain_7d)

    # ---------------- QUESTION 1: WHICH ROADS ARE LIKELY TO BECOME INACCESSIBLE? ----------------
    inaccessible_roads = []
    
    # Assess the 5 critical known chokepoints along NH-10
    for cp in KNOWN_CHOKEPOINTS:
        # Find closest scored segment
        cp_segs = [s for s in scored_segments if s.get("chokepoint") == cp["name"]]
        if not cp_segs:
            # Fallback by coordinate proximity
            cp_segs = sorted(scored_segments, key=lambda s: (s["mid_coord"][0] - cp["lat"])**2 + (s["mid_coord"][1] - cp["lon"])**2)[:5]

        avg_risk = float(np.mean([s["risk_score"] for s in cp_segs])) if cp_segs else 0.25

        if avg_risk >= 0.70:
            status = "IMPASSABLE (Total Road Blockage)"
            severity = "CRITICAL"
            action = "Heavy BRO dozers required. Immediate detour mandatory."
            est_clearance = "8 to 16 Hours"
        elif avg_risk >= 0.45:
            status = "RESTRICTED (Single-Lane Alternating Convoy)"
            severity = "HIGH"
            action = "Slurry and rock scree on road. Speed restricted to 10 km/h."
            est_clearance = "2 to 5 Hours"
        elif avg_risk >= 0.25:
            status = "CAUTION (Passing Slush & Minor Stones)"
            severity = "MODERATE"
            action = "Passable with extreme caution. Avoid nighttime travel."
            est_clearance = "Under 1 Hour"
        else:
            status = "OPEN & PASSABLE"
            severity = "LOW"
            action = "Normal mountain transit permitted."
            est_clearance = "N/A"

        inaccessible_roads.append({
            "chokepoint_name": cp["name"],
            "coordinates": [cp["lat"], cp["lon"]],
            "failure_probability_pct": round(avg_risk * 100.0, 1),
            "accessibility_status": status,
            "severity_level": severity,
            "recommended_action": action,
            "est_clearance_time": est_clearance,
            "affected_highway": "NH-10 Lifeline Corridor"
        })

    # Sort descending by risk
    inaccessible_roads.sort(key=lambda x: x["failure_probability_pct"], reverse=True)

    # ---------------- QUESTION 2: HOW MUCH DELAY SHOULD A LOGISTICS VEHICLE EXPECT? ----------------
    # Base travel time: 38.54 km at 32 km/h in clear weather = 72 minutes
    base_time_mins = 72.0
    weather_delay_mins = min(35.0, (rain_1d / 50.0) * 20.0 + (rain_3d / 120.0) * 15.0)

    critical_blocks = sum(1 for r in inaccessible_roads if r["severity_level"] == "CRITICAL")
    high_blocks = sum(1 for r in inaccessible_roads if r["severity_level"] == "HIGH")

    if critical_blocks >= 1:
        # Full detour mandatory (via Pakyong ridge bypass: adds 16.5 km + winding climbs)
        route_status = "NH-10 Severed. Diverting via Mountain Bypass."
        chokepoint_delay_mins = 65.0 + (critical_blocks - 1) * 25.0
        expected_total_time_mins = round(base_time_mins + weather_delay_mins + chokepoint_delay_mins, 1)
        expected_delay_mins = round(expected_total_time_mins - base_time_mins, 1)
        fuel_consumption_mult = 1.35
    elif high_blocks >= 1:
        route_status = "NH-10 Single-Lane Clearance Convoy in operation."
        chokepoint_delay_mins = high_blocks * 25.0
        expected_total_time_mins = round(base_time_mins + weather_delay_mins + chokepoint_delay_mins, 1)
        expected_delay_mins = round(expected_total_time_mins - base_time_mins, 1)
        fuel_consumption_mult = 1.18
    else:
        route_status = "NH-10 Flowing normally with seasonal wet-weather caution."
        expected_total_time_mins = round(base_time_mins + weather_delay_mins, 1)
        expected_delay_mins = round(weather_delay_mins, 1)
        fuel_consumption_mult = 1.05

    vehicle_delay_analysis = {
        "corridor_length_km": 38.54,
        "base_freeflow_time_mins": base_time_mins,
        "weather_slowdown_mins": round(weather_delay_mins, 1),
        "hazard_congestion_delay_mins": round(expected_delay_mins - weather_delay_mins, 1),
        "total_expected_travel_time_mins": expected_total_time_mins,
        "total_expected_delay_mins": expected_delay_mins,
        "traffic_condition": route_status,
        "fuel_consumption_impact": f"+{int((fuel_consumption_mult - 1.0) * 100)}%",
        "safe_departure_advice": "Immediate dispatch before evening downpour" if rain_1d < 30.0 else "Hold convoys at Rangpo staging depot until BRO green signal"
    }

    # ---------------- QUESTION 3: WHICH AREAS ARE AT THE HIGHEST RISK OF BEING DISCONNECTED? ----------------
    disconnected_regions = []
    for s in SETTLEMENTS_METADATA:
        # Match with critical chokepoint accessibility
        matching_chokepoints = [r for r in inaccessible_roads if r["chokepoint_name"] in s["critical_access_chokepoint"] or s["critical_access_chokepoint"] in r["chokepoint_name"]]
        cp_risk = matching_chokepoints[0]["failure_probability_pct"] if matching_chokepoints else 20.0

        # Disconnection Probability: function of access chokepoint risk & terrain vulnerability
        disconnection_risk_pct = round(min(98.0, cp_risk * 0.75 + s["vulnerability_score"] * 30.0), 1)

        if disconnection_risk_pct >= 75.0:
            isolation_level = "CRITICAL ISOLATION"
            alt_access = "Air-drop via Mi-17 / Indian Army porter track only"
        elif disconnection_risk_pct >= 50.0:
            isolation_level = "HIGH RISK OF CUTOFF"
            alt_access = "4x4 Emergency Convoy via Southern Ridge link"
        elif disconnection_risk_pct >= 30.0:
            isolation_level = "MODERATE VULNERABILITY"
            alt_access = "Light vehicular bypass available"
        else:
            isolation_level = "LOW RISK"
            alt_access = "Normal highway supply route intact"

        disconnected_regions.append({
            "region_id": s["id"],
            "region_name": s["name"],
            "administrative_division": s["region"],
            "population_threatened": s["population"],
            "disconnection_risk_pct": disconnection_risk_pct,
            "isolation_status": isolation_level,
            "sole_remaining_ingress": alt_access,
            "key_cut_artery": s["critical_access_chokepoint"],
            "coordinates": [s["lat"], s["lon"]]
        })

    disconnected_regions.sort(key=lambda x: x["disconnection_risk_pct"], reverse=True)

    # ---------------- QUESTION 4: WHAT IS THE SAFEST ALTERNATIVE ROUTE? ----------------
    # Compute route comparison between Rangpo and Gangtok
    route_comparison = router.compute_route_comparison(
        start_lat=27.1720,
        start_lon=88.5292,
        end_lat=27.3341,
        end_lon=88.6083,
        rain_1h=rain_1d * 0.15,
        rain_24h=rain_1d,
        rain_3day=rain_3d
    )

    safest_route_solution = {
        "recommended_route_name": route_comparison["safer_route"]["name"],
        "route_description": "Pakyong-Ranipool Mountain Ridge Bypass avoiding Teesta river slide zone",
        "distance_km": route_comparison["safer_route"]["total_distance_km"],
        "travel_time_mins": route_comparison["safer_route"]["estimated_time_mins"],
        "average_risk_score": route_comparison["safer_route"]["average_risk"],
        "safety_improvement_vs_nh10": f"+{route_comparison['comparison']['risk_reduction_pct']}% safer",
        "hazardous_segments_avoided": route_comparison["comparison"]["high_risk_segments_avoided"],
        "detour_penalty_km": route_comparison["comparison"]["detour_km"],
        "path_waypoints": route_comparison["safer_route"]["path_coordinates"][:15],
        "verdict": route_comparison["comparison"]["recommendation"]
    }

    # ---------------- QUESTION 5: WHICH VILLAGES SHOULD RECEIVE EMERGENCY SUPPLIES FIRST? ----------------
    # Priority Supply Index (PSI):
    # PSI = (Disconnection Risk * 0.35) + (Vulnerability * 0.25) + (Days Stock Left Inverse * 0.25) + (Population Weight * 0.15)
    prioritized_villages = []
    for s, d in zip(SETTLEMENTS_METADATA, disconnected_regions):
        # Remaining stock in days drops under heavy rainfall and isolation
        effective_stock_days = max(0.5, round(s["base_stock_days"] - (d["disconnection_risk_pct"] / 100.0) * 1.2, 1))
        stock_urgency = (1.0 / (effective_stock_days + 0.5)) * 10.0

        psi_score = round(
            (d["disconnection_risk_pct"] * 0.40) +
            (s["vulnerability_score"] * 30.0) +
            (stock_urgency * 2.5) +
            (min(50000, s["population"]) / 50000.0) * 10.0,
            1
        )

        if psi_score >= 80.0:
            priority_tier = "PRIORITY 1: IMMEDIATE (Within 6h)"
            delivery_mode = "Air-drop Helipad / Special Military Convoy"
        elif psi_score >= 60.0:
            priority_tier = "PRIORITY 2: URGENT (Within 18h)"
            delivery_mode = "High-clearance 4x4 Supply Trucks"
        elif psi_score >= 40.0:
            priority_tier = "PRIORITY 3: ELEVATED (Within 36h)"
            delivery_mode = "Standard Freight Convoy via Ridge Bypass"
        else:
            priority_tier = "PRIORITY 4: MONITORING (Normal)"
            delivery_mode = "Regular Commercial Distribution"

        prioritized_villages.append({
            "rank": 0, # Assigned after sort
            "settlement_name": s["name"],
            "region": s["region"],
            "population": s["population"],
            "priority_supply_index": psi_score,
            "priority_tier": priority_tier,
            "disconnection_risk_pct": d["disconnection_risk_pct"],
            "remaining_supplies_days": effective_stock_days,
            "recommended_delivery_mode": delivery_mode,
            "critical_goods_needed": "Potable Water, Baby Formula, Diesel for Generators, Trauma Kits" if psi_score >= 70.0 else "Staple Grains, Kerosene, Medical Refills"
        })

    # Sort descending by PSI
    prioritized_villages.sort(key=lambda x: x["priority_supply_index"], reverse=True)
    for idx, item in enumerate(prioritized_villages):
        item["rank"] = idx + 1

    return {
        "weather_scenario_tested": {
            "rain_1d_mm": rain_1d,
            "rain_3d_mm": rain_3d,
            "rain_7d_mm": rain_7d
        },
        "question_1_inaccessible_roads": inaccessible_roads,
        "question_2_vehicle_delays": vehicle_delay_analysis,
        "question_3_disconnected_regions": disconnected_regions,
        "question_4_safest_alternative_route": safest_route_solution,
        "question_5_relief_supply_prioritization": prioritized_villages
    }

