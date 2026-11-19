import os
import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional

try:
    from backend_py.database import init_db, seed_25_field_reports, save_field_report, get_field_reports, get_model_metrics
    from backend_py.road_network import road_net, KNOWN_CHOKEPOINTS
    from backend_py.ml_risk_model import ml_system, DATASET_CSV_PATH
    from backend_py.routing import router
    from backend_py.weather_service import get_corridor_weather_summary, fetch_open_meteo_weather
    from backend_py.decision_support import generate_logistics_decision_support
    from backend_py.meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS
    from backend_py.meghalaya_ml_model import meghalaya_ml
    from backend_py.meghalaya_ml_dataset import OUTPUT_DATASET_CSV as MEGHALAYA_DATASET_CSV
    from backend_py.meghalaya_db import (
        ingest_meghalaya_data, get_meghalaya_districts, get_meghalaya_landslides, 
        get_meghalaya_key_villages, get_meghalaya_model_metrics,
        get_meghalaya_combined_stats, get_meghalaya_grid_cells, get_meghalaya_monsoon_extremes,
        get_segment_explainability, get_all_data_sources, get_meghalaya_citizen_reports,
        save_meghalaya_citizen_report, get_meghalaya_tables_summary
    )
    from backend_py.meghalaya_decision import generate_meghalaya_decision_support
    from backend_py.meghalaya_routing import meghalaya_router, MEGHALAYA_PRESET_ROUTES
except ImportError:
    from database import init_db, seed_25_field_reports, save_field_report, get_field_reports, get_model_metrics
    from road_network import road_net, KNOWN_CHOKEPOINTS
    from ml_risk_model import ml_system, DATASET_CSV_PATH
    from routing import router
    from weather_service import get_corridor_weather_summary, fetch_open_meteo_weather
    from decision_support import generate_logistics_decision_support
    from meghalaya_network import meghalaya_net, MEGHALAYA_CHOKEPOINTS
    from meghalaya_ml_model import meghalaya_ml
    from meghalaya_ml_dataset import OUTPUT_DATASET_CSV as MEGHALAYA_DATASET_CSV
    from meghalaya_db import (
        ingest_meghalaya_data, get_meghalaya_districts, get_meghalaya_landslides, 
        get_meghalaya_key_villages, get_meghalaya_model_metrics,
        get_meghalaya_combined_stats, get_meghalaya_grid_cells, get_meghalaya_monsoon_extremes,
        get_segment_explainability, get_all_data_sources, get_meghalaya_citizen_reports,
        save_meghalaya_citizen_report, get_meghalaya_tables_summary
    )
    from meghalaya_decision import generate_meghalaya_decision_support
    from meghalaya_routing import meghalaya_router, MEGHALAYA_PRESET_ROUTES

# Initialize database and seed 28 field reports on startup
init_db()
seed_25_field_reports()
ingest_meghalaya_data()

app = FastAPI(
    title="SafeLogix NH-10 Sikkim ML Landslide & Safe Routing API",
    description="Pilot Corridor: Rangpo to Gangtok (NH-10). OpenStreetMap/NetworkX routing, scikit-learn ML risk prediction, Open-Meteo weather, and SQLite citizen field reports.",
    version="2.1.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request Models -----------------
class RouteRequest(BaseModel):
    start_lat: float = Field(default=27.1720, description="Origin Latitude (default: Rangpo)")
    start_lon: float = Field(default=88.5292, description="Origin Longitude (default: Rangpo)")
    end_lat: float = Field(default=27.3341, description="Destination Latitude (default: Gangtok)")
    end_lon: float = Field(default=88.6083, description="Destination Longitude (default: Gangtok)")
    rain_1h: Optional[float] = Field(default=None, description="Hourly rainfall in mm (optional)")
    rain_24h: Optional[float] = Field(default=None, description="24-hour rainfall in mm (optional)")
    rain_3day: Optional[float] = Field(default=None, description="3-day antecedent rainfall in mm (optional)")

class MeghalayaRouteRequest(BaseModel):
    start_lat: float = Field(default=26.1150, description="Origin Latitude (default: Guwahati/Jorabat Gate)")
    start_lon: float = Field(default=91.8600, description="Origin Longitude (default: Guwahati/Jorabat Gate)")
    end_lat: float = Field(default=25.0300, description="Destination Latitude (default: Ratacherra/Silchar Border)")
    end_lon: float = Field(default=92.4200, description="Destination Longitude (default: Ratacherra/Silchar Border)")
    rain_1d: Optional[float] = Field(default=35.0, description="1-day rainfall in mm")
    rain_3d: Optional[float] = Field(default=85.0, description="3-day rainfall in mm")
    rain_7d: Optional[float] = Field(default=160.0, description="7-day rainfall in mm")
    risk_penalty_weight: Optional[float] = Field(default=28.0, description="Risk avoidance penalty weight")

class FieldReportRequest(BaseModel):
    reporter_name: str = Field(..., example="Dorjee Bhutia")
    contact_number: Optional[str] = Field(default="", example="+91 98001 23456")
    hazard_type: str = Field(..., example="Landslide / Mudflow")
    severity: str = Field(..., example="CRITICAL")
    location_name: str = Field(..., example="Near Singtam Teesta Basin")
    latitude: float = Field(..., example=27.2344)
    longitude: float = Field(..., example=88.4988)
    description: str = Field(..., example="Large rockfall blocking left lane towards Gangtok. BRO notified.")

class MeghalayaCitizenReportRequest(BaseModel):
    reporter_name: str = Field(..., example="Bah Dkhar")
    contact_number: Optional[str] = Field(default="", example="+91 94361 12345")
    hazard_type: str = Field(..., example="Mudflow / Road Slump")
    severity: str = Field(..., example="HIGH")
    location_name: str = Field(..., example="Near Sonapur Tunnel NH-6")
    district: Optional[str] = Field(default="East Jaintia Hills", example="East Jaintia Hills")
    latitude: float = Field(..., example=25.1180)
    longitude: float = Field(..., example=92.3660)
    description: str = Field(..., example="Mud slurry accumulation along road cutting.")

# ----------------- API Endpoints -----------------

@app.get("/api/v2/health")
def health_check():
    return {
        "status": "ONLINE",
        "service": "SafeLogix Landslide Safe Routing Engine",
        "ml_model": "RandomForestClassifier (Balanced, Temporal Split 2018-2023)",
        "baseline_model": "LogisticRegression (Balanced)",
        "network_nodes": road_net.graph.number_of_nodes(),
        "network_edges": road_net.graph.number_of_edges(),
        "total_corridor_segments": len(road_net.segments),
        "database": "SQLite (safelogix_corridor.db)",
        "dataset_rows": 23010
    }

@app.get("/api/v2/weather/current")
def get_current_weather():
    """Returns real-time precipitation and weather conditions along the corridor from Open-Meteo."""
    return get_corridor_weather_summary()

@app.get("/api/v2/corridor/segments")
def get_corridor_segments(
    rain_1d: Optional[float] = Query(None, description="24h cumulative rainfall in mm"),
    rain_3d: Optional[float] = Query(None, description="3-day antecedent rainfall in mm"),
    rain_7d: Optional[float] = Query(None, description="7-day cumulative rainfall in mm")
):
    """
    Returns all 1,422 road segments on NH-10 with ML-predicted risk scores,
    elevation climb profile, slope, and danger colors.
    """
    # If weather params omitted, use live Open-Meteo weather
    if rain_1d is None or rain_3d is None or rain_7d is None:
        weather = get_corridor_weather_summary()
        r1 = weather["avg_rain_24h_mm"] if rain_1d is None else rain_1d
        r3 = weather["avg_rain_3day_mm"] if rain_3d is None else rain_3d
        r7 = (r3 * 1.8) if rain_7d is None else rain_7d
    else:
        r1, r3, r7 = rain_1d, rain_3d, rain_7d

    scored_segments = ml_system.predict_all_corridor_segments(r1, r3, r7)
    
    risk_values = [s["risk_score"] for s in scored_segments]
    avg_corridor_risk = round(sum(risk_values) / max(1, len(risk_values)), 3)
    critical_count = sum(1 for s in scored_segments if s["risk_score"] >= 0.70)
    high_count = sum(1 for s in scored_segments if 0.48 <= s["risk_score"] < 0.70)

    return {
        "corridor": "NH-10 (Rangpo - Singtam - Gangtok)",
        "length_km": 38.54,
        "total_segments": len(scored_segments),
        "weather_used": {"rain_1d_mm": r1, "rain_3d_mm": r3, "rain_7d_mm": r7},
        "corridor_stats": {
            "average_risk": avg_corridor_risk,
            "critical_segments": critical_count,
            "high_risk_segments": high_count,
            "safe_segments": len(scored_segments) - critical_count - high_count
        },
        "segments": scored_segments
    }

@app.get("/api/v2/corridor/chokepoints")
def get_chokepoints():
    """Returns the 5 critical landslide hotspots along the NH-10 corridor."""
    return {
        "corridor": "NH-10 Sikkim Pilot Corridor",
        "chokepoints": KNOWN_CHOKEPOINTS
    }

@app.post("/api/v2/route/compare")
def compare_routes(req: RouteRequest):
    """
    Computes side-by-side route comparison between normal shortest path
    and risk-aware safer path using NetworkX and ML predictions.
    """
    if req.rain_1h is None or req.rain_24h is None or req.rain_3day is None:
        weather = get_corridor_weather_summary()
        r1 = weather["avg_rain_1h_mm"] if req.rain_1h is None else req.rain_1h
        r24 = weather["avg_rain_24h_mm"] if req.rain_24h is None else req.rain_24h
        r3d = weather["avg_rain_3day_mm"] if req.rain_3day is None else req.rain_3day
    else:
        r1, r24, r3d = req.rain_1h, req.rain_24h, req.rain_3day

    try:
        comparison_result = router.compute_route_comparison(
            start_lat=req.start_lat,
            start_lon=req.start_lon,
            end_lat=req.end_lat,
            end_lon=req.end_lon,
            rain_1h=r1,
            rain_24h=r24,
            rain_3day=r3d
        )
        return comparison_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v2/ml/model-info")
def get_ml_model_info():
    """
    Returns full ML model performance metrics:
    - Logistic Regression baseline vs Random Forest main model
    - Temporal split details (Train 2018-2021, Test 2022-2023)
    - Precision, Recall, F1 score, Accuracy, Confusion Matrix
    - Feature Importances from Random Forest
    """
    db_metrics = get_model_metrics()
    return {
        "model_architecture": {
            "baseline": "LogisticRegression(class_weight='balanced')",
            "main_model": "RandomForestClassifier(n_estimators=100, class_weight='balanced')",
            "temporal_split_rule": "Train on 2018-2021, Test on 2022-2023 (No random shuffling)",
            "class_imbalance_handling": "class_weight='balanced' (positive landslide instances ~14.5%)",
            "primary_metrics": "Precision, Recall, F1 Score, Confusion Matrix (Not Accuracy alone)",
            "labeling_methodology": "NASA GLC spatial matching within 1.5km + empirical failure threshold with 8% noise"
        },
        "trained_metrics": ml_system.metrics,
        "database_records": db_metrics
    }

@app.get("/api/v2/logistics/decision-support")
def get_decision_support(
    rain_1d: Optional[float] = Query(None, description="24h rainfall in mm"),
    rain_3d: Optional[float] = Query(None, description="3-day rainfall in mm"),
    rain_7d: Optional[float] = Query(None, description="7-day rainfall in mm")
):
    """
    Answers the 5 core operational logistics questions:
    1. Which roads are likely to become inaccessible?
    2. How much delay should a logistics vehicle expect?
    3. Which areas are at the highest risk of being disconnected?
    4. What is the safest alternative route?
    5. Which villages or regions should receive emergency supplies first?
    """
    if rain_1d is None or rain_3d is None or rain_7d is None:
        weather = get_corridor_weather_summary()
        r1 = weather["avg_rain_24h_mm"] if rain_1d is None else rain_1d
        r3 = weather["avg_rain_3day_mm"] if rain_3d is None else rain_3d
        r7 = (r3 * 1.8) if rain_7d is None else rain_7d
    else:
        r1, r3, r7 = rain_1d, rain_3d, rain_7d

    return generate_logistics_decision_support(r1, r3, r7)

@app.get("/api/v2/dataset/download")
def download_training_dataset():
    """Provides the standardized training dataset CSV (23,010 rows, 12 columns)."""
    if os.path.exists(DATASET_CSV_PATH):
        return FileResponse(DATASET_CSV_PATH, filename="corridor_landslide_training_dataset.csv", media_type="text/csv")
    raise HTTPException(status_code=404, detail="Dataset CSV not found on disk")

@app.post("/api/v2/reports")
def submit_field_report(report: FieldReportRequest):
    """Saves user-reported road hazard / landslide into the SQLite database."""
    saved = save_field_report(
        name=report.reporter_name,
        contact=report.contact_number or "",
        hazard_type=report.hazard_type,
        severity=report.severity,
        location_name=report.location_name,
        lat=report.latitude,
        lon=report.longitude,
        desc=report.description
    )
    return {"status": "SUCCESS", "message": "Hazard report recorded successfully", "report": saved}

@app.get("/api/v2/reports")
def list_field_reports(limit: int = 50):
    """Retrieves recent citizen and patrol field reports from SQLite."""
    reports = get_field_reports(limit=limit)
    return {"count": len(reports), "reports": reports}

# ----------------- MEGHALAYA STATEWIDE LOGISTICS & ML ENDPOINTS -----------------

@app.get("/api/v2/meghalaya/districts")
def get_districts():
    """Returns the 12 administrative districts of Meghalaya."""
    return {"count": 12, "districts": get_meghalaya_districts()}

@app.get("/api/v2/meghalaya/landslides")
def get_landslides():
    """Returns 88 candidate landslide points across Meghalaya."""
    points = get_meghalaya_landslides()
    return {"count": len(points), "landslides": points}

@app.get("/api/v2/meghalaya/villages")
def get_villages(limit: int = 150):
    """Returns key populated villages and transit centers in Meghalaya."""
    villages = get_meghalaya_key_villages(limit=limit)
    return {"count": len(villages), "villages": villages}

@app.get("/api/v2/meghalaya/segments")
def get_meghalaya_segments(
    rain_1d: Optional[float] = Query(25.0, description="1-day rainfall in mm"),
    rain_3d: Optional[float] = Query(60.0, description="3-day antecedent rainfall in mm"),
    rain_7d: Optional[float] = Query(120.0, description="7-day cumulative rainfall in mm")
):
    """Returns all 284 Meghalaya arterial road segments scored by Random Forest & XGBoost ensemble."""
    scored = meghalaya_ml.predict_all_segments(rain_1d, rain_3d, rain_7d)
    return {
        "count": len(scored),
        "rain_conditions": {"rain_1d": rain_1d, "rain_3d": rain_3d, "rain_7d": rain_7d},
        "segments": scored
    }

@app.get("/api/v2/meghalaya/ml/metrics")
def get_meghalaya_ml_metrics():
    """Returns ML performance evaluation (Precision, Recall, F1, Accuracy, Confusion Matrix, Feature Importances)."""
    return get_meghalaya_model_metrics()

@app.get("/api/v2/meghalaya/decision-support")
def get_meghalaya_decision_support_api(
    rain_1d: Optional[float] = Query(35.0, description="24h rainfall in mm"),
    rain_3d: Optional[float] = Query(85.0, description="3-day rainfall in mm"),
    rain_7d: Optional[float] = Query(160.0, description="7-day rainfall in mm")
):
    """
    Computes rigorous answers to the 5 core operational logistics questions for Meghalaya:
    1. Which roads are likely to become inaccessible?
    2. How much delay should a logistics vehicle expect?
    3. Which areas are at the highest risk of being disconnected?
    4. What is the safest alternative route?
    5. Which villages or regions should receive emergency supplies first?
    """
    return generate_meghalaya_decision_support(rain_1d, rain_3d, rain_7d)

@app.get("/api/v2/meghalaya/dataset/download")
def download_meghalaya_dataset():
    """Provides the standardized Meghalaya training dataset CSV (52,190 rows, 13 columns)."""
    if os.path.exists(MEGHALAYA_DATASET_CSV):
        return FileResponse(MEGHALAYA_DATASET_CSV, filename="meghalaya_landslide_training_dataset.csv", media_type="text/csv")
    raise HTTPException(status_code=404, detail="Meghalaya dataset CSV not found on disk")

@app.get("/api/v2/meghalaya/combined-db/stats")
def get_combined_db_stats_api():
    """Returns database status and row counts from meghalaya_combined.db (218,757 records)."""
    return get_meghalaya_combined_stats()

@app.get("/api/v2/meghalaya/grid-cells")
def get_grid_cells_api():
    """Returns the 46 IMD 0.25-degree climate grid cells across Meghalaya."""
    cells = get_meghalaya_grid_cells()
    return {"count": len(cells), "grid_cells": cells}

@app.get("/api/v2/meghalaya/monsoon-extremes")
def get_monsoon_extremes_api(limit: int = 15):
    """Returns historic extreme rainfall events from the 91,356 IMD daily records in ml_cell_day_features."""
    extremes = get_meghalaya_monsoon_extremes(limit=limit)
    return {"count": len(extremes), "extreme_events": extremes}

@app.get("/api/v2/meghalaya/route/presets")
def get_meghalaya_route_presets():
    """Returns preset arterial highway routes across Meghalaya (e.g. Guwahati-Silchar, Shillong-Sohra, Shillong-Tura)."""
    presets = meghalaya_router.get_preset_routes()
    return {"count": len(presets), "presets": presets}

@app.get("/api/v2/meghalaya/route/hubs")
def get_meghalaya_route_hubs():
    """Returns all 44 key town transit hubs and district centers for customizable Point-to-Point routing."""
    hubs = meghalaya_router.get_all_hubs()
    return {"count": len(hubs), "hubs": hubs}

@app.post("/api/v2/meghalaya/route/compare")
def compare_meghalaya_routes_api(req: MeghalayaRouteRequest):
    """
    Computes dynamic side-by-side route optimization for Meghalaya:
    Compares standard shortest highway spine against risk-aware safer route
    penalized by Random Forest & XGBoost ML landslide predictions.
    """
    try:
        comparison_result = meghalaya_router.compute_route_comparison(
            start_lat=req.start_lat,
            start_lon=req.start_lon,
            end_lat=req.end_lat,
            end_lon=req.end_lon,
            rain_1d=req.rain_1d if req.rain_1d is not None else 35.0,
            rain_3d=req.rain_3d if req.rain_3d is not None else 85.0,
            rain_7d=req.rain_7d if req.rain_7d is not None else 160.0,
            risk_penalty_weight=req.risk_penalty_weight if req.risk_penalty_weight is not None else 28.0
        )
        return comparison_result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v2/meghalaya/route/sensitivity")
def evaluate_meghalaya_sensitivity_api(req: MeghalayaRouteRequest):
    """
    Evaluates parameter sensitivity across alpha in [10, 18, 28] and beta in [1.8, 2.0, 2.2],
    comparing travel distance, travel time, and accumulated risk (sum of risk * km).
    """
    try:
        return meghalaya_router.evaluate_parameter_sensitivity(
            start_lat=req.start_lat,
            start_lon=req.start_lon,
            end_lat=req.end_lat,
            end_lon=req.end_lon,
            rain_1d=req.rain_1d if req.rain_1d is not None else 35.0,
            rain_3d=req.rain_3d if req.rain_3d is not None else 85.0,
            rain_7d=req.rain_7d if req.rain_7d is not None else 160.0
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/v2/meghalaya/ml/ablation-study")
def get_meghalaya_ablation_study_api():
    """
    Returns Feature Leakage Ablation Study:
    Model A (All features) vs Model B (Without near_hazard_km) vs Model C (Without citizen reports).
    """
    return meghalaya_ml.get_ablation_study()

@app.get("/api/v2/meghalaya/ml/spatial-validation")
def get_meghalaya_spatial_validation_api():
    """
    Returns Geographical Holdout Validation experiment:
    Trained on Khasi & Jaintia Hills, tested on unobserved Garo Hills holdout.
    """
    return meghalaya_ml.get_spatial_validation()

@app.get("/api/v2/meghalaya/ml/calibration")
def get_meghalaya_calibration_api():
    """
    Returns Platt Scaling (Sigmoid) Probability Calibration results:
    Brier Score before vs after calibration, and empirical calibration curve bins.
    """
    return meghalaya_ml.get_probability_calibration()

@app.get("/api/v2/meghalaya/explainability/{segment_id}")
def get_meghalaya_segment_explainability_api(
    segment_id: str,
    rain_1d: Optional[float] = Query(35.0, description="1-day rainfall mm"),
    rain_3d: Optional[float] = Query(85.0, description="3-day rainfall mm"),
    rain_7d: Optional[float] = Query(160.0, description="7-day rainfall mm")
):
    """
    Returns end-to-end explainability for a specific road segment:
    - IMD grid cell used & rainfall observation
    - DEM terrain record used & slope gradient
    - Model ensemble used & calibrated probability
    - Nearest candidate landslide point (unverified third-party record)
    - Full data provenance
    """
    result = get_segment_explainability(segment_id, rain_1d, rain_3d, rain_7d)
    if not result:
        raise HTTPException(status_code=404, detail=f"Road segment {segment_id} not found")
    return result

@app.get("/api/v2/meghalaya/database/tables-summary")
def get_database_tables_summary_api():
    """Returns row counts and schema purposes for all 10 separate tables in meghalaya_combined.db."""
    return get_meghalaya_tables_summary()

@app.get("/api/v2/meghalaya/data-sources")
def get_data_sources_api():
    """Returns the master provenance catalog of the 6 data sources powering the platform."""
    sources = get_all_data_sources()
    return {"count": len(sources), "sources": sources}

@app.get("/api/v2/meghalaya/citizen-reports")
def get_meghalaya_citizen_reports_api(limit: int = 50):
    """Retrieves recent citizen hazard submissions for Meghalaya."""
    reports = get_meghalaya_citizen_reports(limit=limit)
    return {"count": len(reports), "reports": reports}

@app.post("/api/v2/meghalaya/citizen-reports")
def submit_meghalaya_citizen_report_api(req: MeghalayaCitizenReportRequest):
    """Records a new citizen hazard report with PENDING_OFFICIAL_VERIFICATION status."""
    saved = save_meghalaya_citizen_report(
        reporter_name=req.reporter_name,
        contact_number=req.contact_number or "",
        hazard_type=req.hazard_type,
        severity=req.severity,
        location_name=req.location_name,
        district=req.district or "East Khasi Hills",
        lat=req.latitude,
        lon=req.longitude,
        desc=req.description
    )
    return {"status": "SUCCESS", "message": "Citizen hazard report recorded for verification", "report": saved}

if __name__ == "__main__":
    uvicorn.run("backend_py.main:app", host="0.0.0.0", port=8001, reload=False)
