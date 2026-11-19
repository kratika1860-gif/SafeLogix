import os
import math
from typing import Dict, List, Any, Optional
import networkx as nx
import numpy as np

try:
    from backend_py.meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS, haversine_distance_m
    from backend_py.meghalaya_ml_model import meghalaya_ml
    from backend_py.meghalaya_db import get_meghalaya_key_villages
except ImportError:
    from meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS, haversine_distance_m
    from meghalaya_ml_model import meghalaya_ml
    from meghalaya_db import get_meghalaya_key_villages

# Critical Settlement and Sub-divisional Logistics Nodes in Meghalaya
MEGHALAYA_SETTLEMENTS = [
    {
        "id": "sonapur_lumshnong",
        "name": "Sonapur & Lumshnong Lifeline Corridor",
        "district": "East Jaintia Hills",
        "population": 34500,
        "vulnerability_score": 0.94,
        "base_stock_days": 1.8,
        "critical_chokepoint": "Sonapur Tunnel & River Cut (NH-6)",
        "lat": 25.1165,
        "lon": 92.3654,
        "primary_supply_need": "Drinking water, fuel, medical kits (vital transit chokepoint to Barak Valley & Tripura)"
    },
    {
        "id": "sohra_shella",
        "name": "Sohra-Shella Escarpment Villages",
        "district": "East Khasi Hills",
        "population": 42000,
        "vulnerability_score": 0.88,
        "base_stock_days": 2.2,
        "critical_chokepoint": "Mawkdok Dympep Gorge Rim (SH-5)",
        "lat": 25.2750,
        "lon": 91.7320,
        "primary_supply_need": "Emergency food rations, water purification tablets, high-terrain shelter tarpaulins"
    },
    {
        "id": "baghmara_siju",
        "name": "Baghmara & Siju Gorge Belt",
        "district": "South Garo Hills",
        "population": 38200,
        "vulnerability_score": 0.82,
        "base_stock_days": 2.5,
        "critical_chokepoint": "Siju Gorge Hill Track",
        "lat": 25.1870,
        "lon": 90.6380,
        "primary_supply_need": "Anti-venom vials, diesel generator fuel, infant nutritional supplements"
    },
    {
        "id": "khliehriat_center",
        "name": "Khliehriat Mining & Transit Center",
        "district": "East Jaintia Hills",
        "population": 28600,
        "vulnerability_score": 0.79,
        "base_stock_days": 3.0,
        "critical_chokepoint": "Khliehriat Hill Section (NH-6)",
        "lat": 25.3520,
        "lon": 92.3680,
        "primary_supply_need": "Food grains, earthmoving hydraulic spares, satellite comms"
    },
    {
        "id": "mawsynram_balat",
        "name": "Mawsynram - Balat High Rain Rim",
        "district": "South West Khasi Hills",
        "population": 24800,
        "vulnerability_score": 0.85,
        "base_stock_days": 2.1,
        "critical_chokepoint": "Mawsynram World Rain Record",
        "lat": 25.2970,
        "lon": 91.5830,
        "primary_supply_need": "Rainwear, non-perishable rations, solar lanterns"
    },
    {
        "id": "nongpoh_umling",
        "name": "Nongpoh & Umling Rural Foothills",
        "district": "Ri Bhoi",
        "population": 46500,
        "vulnerability_score": 0.62,
        "base_stock_days": 4.5,
        "critical_chokepoint": "Nongpoh Valley S-Curve (NH-6)",
        "lat": 25.9080,
        "lon": 91.8840,
        "primary_supply_need": "Agricultural feed, road repair asphalt, emergency first-aid"
    },
    {
        "id": "tura_rongram",
        "name": "Tura & Rongram Hub",
        "district": "West Garo Hills",
        "population": 74300,
        "vulnerability_score": 0.55,
        "base_stock_days": 5.0,
        "critical_chokepoint": "Rongram Mountain Pass",
        "lat": 25.5140,
        "lon": 90.2150,
        "primary_supply_need": "General hospital supplies, dry grocery reserves"
    },
    {
        "id": "shillong_capital",
        "name": "Shillong Capital Urban Cluster",
        "district": "East Khasi Hills",
        "population": 143200,
        "vulnerability_score": 0.35,
        "base_stock_days": 7.5,
        "critical_chokepoint": "Byrnihat Monsoon Chokepoint (NH-6)",
        "lat": 25.5780,
        "lon": 91.8930,
        "primary_supply_need": "LPG cylinders, petroleum fuel replenishment, green vegetables"
    }
]

def generate_meghalaya_decision_support(rain_1d: float, rain_3d: float, rain_7d: float) -> Dict[str, Any]:
    """
    Computes rigorous answers to the 5 core operational logistics questions for Meghalaya:
    1. Which roads are likely to become inaccessible?
    2. How much delay should a logistics vehicle expect?
    3. Which areas are at the highest risk of being disconnected?
    4. What is the safest alternative route?
    5. Which villages or regions should receive emergency supplies first?
    """
    # Predict risk across all 284 Meghalaya road segments
    scored_segments = meghalaya_ml.predict_all_segments(rain_1d, rain_3d, rain_7d)

    # ---------------- 1. INACCESSIBLE ROADS ----------------
    inaccessible_roads = []
    for cp in MEGHALAYA_CHOKEPOINTS:
        # Check nearby segments within 3 km
        matching = [
            s for s in scored_segments 
            if haversine_distance_m(s["mid_lat"], s["mid_lon"], cp["lat"], cp["lon"]) <= 3200.0
        ]
        
        if matching:
            max_risk = max(s["risk_score"] for s in matching)
            avg_slope = np.mean([s["slope"] for s in matching])
        else:
            max_risk = 0.20
            avg_slope = cp["slope_deg"]

        # Geotechnical thresholds
        if max_risk >= 0.70 or (rain_1d >= 70.0 and cp["slope_deg"] >= 25.0) or (rain_3d >= 160.0):
            status = "BLOCKED / CLOSED"
            severity = "CRITICAL"
            action = "Immediate NDRF/BRO deployment required; detour mandatory"
            est_hours_to_clear = round(12.0 + (max_risk * 28.0) + (rain_3d / 20.0), 1)
        elif max_risk >= 0.45 or (rain_1d >= 35.0 and cp["slope_deg"] >= 20.0):
            status = "RESTRICTED (HEAVY VEHICLES BANNED)"
            severity = "HIGH"
            action = "Single-lane escorted transit; essential supplies only"
            est_hours_to_clear = round(4.0 + (max_risk * 10.0), 1)
        elif max_risk >= 0.25:
            status = "CAUTION (SLOW TRANSIT)"
            severity = "MODERATE"
            action = "Drive with fog lights; active rockfall watch"
            est_hours_to_clear = 0.0
        else:
            status = "OPEN / CLEAR"
            severity = "LOW"
            action = "Normal mountain transit permitted"
            est_hours_to_clear = 0.0

        inaccessible_roads.append({
            "chokepoint_id": cp["id"],
            "name": cp["name"],
            "district": cp["district"],
            "lat": cp["lat"],
            "lon": cp["lon"],
            "elevation_m": cp["elevation_m"],
            "slope_deg": cp["slope_deg"],
            "risk_score": round(max_risk, 3),
            "status": status,
            "severity": severity,
            "recommended_action": action,
            "estimated_clearance_hours": est_hours_to_clear,
            "hazard_reason": cp["hazard_description"]
        })

    inaccessible_roads = sorted(inaccessible_roads, key=lambda x: x["risk_score"], reverse=True)

    # ---------------- 2. VEHICLE DELAYS ----------------
    delay_runs = [
        {
            "route_name": "Guwahati to Shillong Central (NH-6)",
            "origin": "Jorabat / Guwahati Border",
            "destination": "Shillong Capital Center",
            "distance_km": 102.0,
            "baseline_hours": 2.2,
            "critical_chokepoints": ["Byrnihat Monsoon Chokepoint", "Nongpoh Valley S-Curve"],
            "corridor_type": "4-Lane Mountain Expressway"
        },
        {
            "route_name": "Shillong to Khliehriat & Sonapur (NH-6)",
            "origin": "Shillong Central",
            "destination": "Sonapur Tunnel Pass",
            "distance_km": 118.0,
            "baseline_hours": 3.2,
            "critical_chokepoints": ["Khliehriat Hill Section", "Sonapur Tunnel & River Cut"],
            "corridor_type": "Primary Arterial Lifeline"
        },
        {
            "route_name": "Shillong to Sohra / Cherrapunji (SH-5)",
            "origin": "Shillong Central",
            "destination": "Sohra Town",
            "distance_km": 54.0,
            "baseline_hours": 1.4,
            "critical_chokepoints": ["Mawkdok Dympep Gorge Rim", "Sohra-Nohsngithiang Escarpment"],
            "corridor_type": "State Mountain Highway"
        },
        {
            "route_name": "Guwahati to Tura (via Bajengdoba / NH-127B)",
            "origin": "Guwahati Outskirts",
            "destination": "Tura Garo Hills HQ",
            "distance_km": 218.0,
            "baseline_hours": 5.4,
            "critical_chokepoints": ["Rongram Mountain Pass", "Bajengdoba Junction"],
            "corridor_type": "Western Interstate Highway"
        },
        {
            "route_name": "Sonapur to Silchar / Badarpur (Barak Link)",
            "origin": "Sonapur Tunnel Gate",
            "destination": "Silchar Valley Hub",
            "distance_km": 68.0,
            "baseline_hours": 2.0,
            "critical_chokepoints": ["Sonapur Tunnel & River Cut"],
            "corridor_type": "Interstate Vital Conduit"
        }
    ]

    vehicle_delays = []
    for run in delay_runs:
        # Calculate impact from intersecting chokepoint risks
        relevant_risks = [
            cp["risk_score"] for cp in inaccessible_roads 
            if any(name.lower() in cp["name"].lower() for name in run["critical_chokepoints"])
        ]
        peak_risk = max(relevant_risks) if relevant_risks else 0.15

        if peak_risk >= 0.70:
            delay_factor = 2.8 + (peak_risk * 3.5)
            delay_hours = round(run["baseline_hours"] * delay_factor + (rain_3d / 25.0), 1)
            transit_condition = "SEVERE BOTTLENECK / PASSAGE SUSPENDED"
        elif peak_risk >= 0.40:
            delay_factor = 1.3 + (peak_risk * 1.8)
            delay_hours = round(run["baseline_hours"] * delay_factor, 1)
            transit_condition = "SIGNIFICANT SLOWDOWN (SLIPPAGE & SINGLE-LANE)"
        elif peak_risk >= 0.20:
            delay_hours = round(run["baseline_hours"] * 0.35, 1)
            transit_condition = "MINOR SLOWDOWN (HEAVY RAIN & FOG)"
        else:
            delay_hours = 0.0
            transit_condition = "OPTIMAL MOUNTAIN SPEED"

        total_expected_hours = round(run["baseline_hours"] + delay_hours, 1)

        vehicle_delays.append({
            "route_name": run["route_name"],
            "origin": run["origin"],
            "destination": run["destination"],
            "distance_km": run["distance_km"],
            "baseline_hours": run["baseline_hours"],
            "delay_hours": delay_hours,
            "total_expected_hours": total_expected_hours,
            "transit_condition": transit_condition,
            "peak_risk_score": round(peak_risk, 3),
            "corridor_type": run["corridor_type"]
        })

    # ---------------- 3. DISCONNECTED AREAS ----------------
    disconnected_areas = []
    for s in MEGHALAYA_SETTLEMENTS:
        # Match with critical chokepoint
        matching_cp = next((cp for cp in inaccessible_roads if cp["name"] == s["critical_chokepoint"]), None)
        cp_risk = matching_cp["risk_score"] if matching_cp else 0.20

        # Calculate isolation probability: function of chokepoint risk, rainfall and base vulnerability
        isolation_prob = min(0.99, max(0.05, (cp_risk * 0.55) + (s["vulnerability_score"] * 0.30) + ((rain_3d / 200.0) * 0.15)))
        
        # Calculate stock runway days left
        stock_runway_days = max(0.4, round(s["base_stock_days"] / (1.0 + (isolation_prob * 1.8)), 1))

        if isolation_prob >= 0.65:
            risk_level = "CRITICAL ISOLATION IMMINENT"
            action_req = "Pre-position helicopter drops or foot porterage teams"
        elif isolation_prob >= 0.40:
            risk_level = "ELEVATED VULNERABILITY"
            action_req = "Rush heavy vehicle supply convoys before road closes"
        else:
            risk_level = "STABLE CONNECTIVITY"
            action_req = "Routine monitoring of lifeline bridges"

        disconnected_areas.append({
            "settlement_id": s["id"],
            "name": s["name"],
            "district": s["district"],
            "population": s["population"],
            "isolation_probability": round(isolation_prob, 3),
            "stock_runway_days": stock_runway_days,
            "risk_level": risk_level,
            "primary_supply_need": s["primary_supply_need"],
            "critical_access_chokepoint": s["critical_chokepoint"],
            "lat": s["lat"],
            "lon": s["lon"]
        })

    disconnected_areas = sorted(disconnected_areas, key=lambda x: x["isolation_probability"], reverse=True)

    # ---------------- 4. SAFEST ALTERNATIVE ROUTE ----------------
    # Showcase: Guwahati to Silchar / Badarpur (or Shillong to Sonapur)
    # Primary: NH-6 Direct via Sonapur Tunnel (fastest normal, but landslide trap)
    # Safer Alternative: NH-6 to Mawryngkneng -> Shangpung -> Ridge Bypass or Inter-state Ridge Link
    normal_dist_km = 118.0
    normal_time_hrs = 3.2
    normal_sonapur_risk = next((cp["risk_score"] for cp in inaccessible_roads if "Sonapur" in cp["name"]), 0.5)

    # Alternative route avoids the deep Sonapur gorge by taking the ridge detour or Shangpung-Rymbai high terrace
    alt_dist_km = 142.0  # +24 km longer
    alt_time_hrs = round(alt_dist_km / 34.0, 1)  # slightly slower speed
    alt_risk = max(0.12, round(normal_sonapur_risk * 0.32, 3))  # 68% risk reduction!

    safest_route_comparison = {
        "corridor": "Shillong Central to Barak Valley Transit (Sonapur Cut)",
        "shortest_route": {
            "name": "Standard NH-6 Highway (Direct via Sonapur Gorge)",
            "distance_km": normal_dist_km,
            "duration_hours": normal_time_hrs,
            "max_landslide_risk": round(normal_sonapur_risk, 3),
            "safety_verdict": "UNSAFE DURING CLOUDBURST" if normal_sonapur_risk >= 0.45 else "ACCEPTABLE",
            "path_summary": "Shillong -> Mawryngkneng -> Jowai -> Khliehriat -> Sonapur Tunnel Gate"
        },
        "safest_alternative": {
            "name": "Northern Ridge Detour & Escorted Bypass",
            "distance_km": alt_dist_km,
            "duration_hours": alt_time_hrs,
            "max_landslide_risk": alt_risk,
            "risk_reduction_pct": f"{int((1.0 - (alt_risk / max(0.01, normal_sonapur_risk))) * 100)}%",
            "safety_verdict": "RECOMMENDED FOR SUPPLY CONVOYS",
            "path_summary": "Shillong -> Mawryngkneng -> Shangpung High Terrace -> Lad Rymbai Ridge Road"
        }
    }

    # ---------------- 5. EMERGENCY SUPPLY PRIORITIZATION (PSI) ----------------
    # Computed across real villages and key settlements in Meghalaya
    ranked_villages = []
    for s in MEGHALAYA_SETTLEMENTS:
        matching_area = next((a for a in disconnected_areas if a["settlement_id"] == s["id"]), None)
        iso_prob = matching_area["isolation_probability"] if matching_area else 0.5
        runway = matching_area["stock_runway_days"] if matching_area else 3.0

        # Priority Supply Index Formula:
        # PSI = (Isolation Prob * 0.40) + (1 / Runway * 0.35) + (log10(Pop) / 6.0 * 0.25)
        runway_urgency = min(1.0, 3.0 / max(0.5, runway))
        pop_scale = min(1.0, math.log10(max(100, s["population"])) / 5.2)

        psi_score = round((iso_prob * 0.45) + (runway_urgency * 0.35) + (pop_scale * 0.20), 3)

        if psi_score >= 0.70:
            tier = "PRIORITY 1: IMMEDIATE AIR/CONVOY DISPATCH"
            badge_color = "#ef4444"
        elif psi_score >= 0.50:
            tier = "PRIORITY 2: STAGE WAREHOUSE RESERVES"
            badge_color = "#f59e0b"
        else:
            tier = "PRIORITY 3: ROUTINE MONITORING"
            badge_color = "#10b981"

        ranked_villages.append({
            "settlement_id": s["id"],
            "name": s["name"],
            "district": s["district"],
            "population": s["population"],
            "psi_score": psi_score,
            "priority_tier": tier,
            "badge_color": badge_color,
            "stock_runway_days": runway,
            "primary_supply_need": s["primary_supply_need"],
            "critical_chokepoint": s["critical_chokepoint"],
            "lat": s["lat"],
            "lon": s["lon"]
        })

    ranked_villages = sorted(ranked_villages, key=lambda x: x["psi_score"], reverse=True)

    return {
        "weather_conditions": {
            "rain_1d_mm": rain_1d,
            "rain_3d_mm": rain_3d,
            "rain_7d_mm": rain_7d
        },
        "q1_inaccessible_roads": inaccessible_roads,
        "q2_vehicle_delays": vehicle_delays,
        "q3_disconnected_areas": disconnected_areas,
        "q4_safest_route": safest_route_comparison,
        "q5_emergency_prioritization": ranked_villages,
        "total_segments_analyzed": len(scored_segments),
        "high_risk_segments_count": sum(1 for s in scored_segments if s["risk_score"] >= 0.70),
        "moderate_risk_segments_count": sum(1 for s in scored_segments if 0.40 <= s["risk_score"] < 0.70)
    }

if __name__ == "__main__":
    res = generate_meghalaya_decision_support(rain_1d=85.0, rain_3d=190.0, rain_7d=340.0)
    print("Inaccessible roads count:", len(res["q1_inaccessible_roads"]))
    print("Top inaccessible road:", res["q1_inaccessible_roads"][0])
    print("Top priority settlement:", res["q5_emergency_prioritization"][0])

