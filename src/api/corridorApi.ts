// Frontend API client communicating with SafeLogix FastAPI Backend (port 8001)

const BACKEND_BASE_URL = 'http://localhost:8001';

export interface RouteComparisonResult {
  origin: { lat: number; lon: number };
  destination: { lat: number; lon: number };
  weather_scenario: {
    rain_1h_mm: number;
    rain_24h_mm: number;
    rain_3day_mm: number;
  };
  comparison: {
    risk_reduction_pct: number;
    detour_km: number;
    time_difference_mins: number;
    high_risk_segments_avoided: number;
    recommendation: string;
  };
  shortest_route: {
    name: string;
    total_distance_km: number;
    estimated_time_mins: number;
    average_risk: number;
    peak_risk: number;
    high_risk_segments_count: number;
    chokepoints_traversed: string[];
    node_count: number;
    geojson: any;
    path_coordinates: [number, number][]; // [lat, lon]
  };
  safer_route: {
    name: string;
    total_distance_km: number;
    estimated_time_mins: number;
    average_risk: number;
    peak_risk: number;
    high_risk_segments_count: number;
    chokepoints_traversed: string[];
    node_count: number;
    geojson: any;
    path_coordinates: [number, number][]; // [lat, lon]
  };
}

export interface MLModelInfo {
  model_architecture: {
    baseline: string;
    main_model: string;
    temporal_split_rule: string;
    class_imbalance_handling: string;
    primary_metrics: string;
    labeling_methodology?: string;
  };
  trained_metrics: {
    baseline_logistic_regression: {
      precision: number;
      recall: number;
      f1_score: number;
      accuracy: number;
      confusion_matrix: number[][];
    };
    main_random_forest: {
      precision: number;
      recall: number;
      f1_score: number;
      accuracy: number;
      confusion_matrix: number[][];
      feature_importance: Record<string, number>;
    };
    temporal_split: {
      train_period: string;
      test_period: string;
      train_size: number;
      test_size: number;
      train_positive_rate: number;
      test_positive_rate: number;
    };
  };
}

export interface FieldReport {
  id: number;
  reporter_name: string;
  contact_number: string;
  hazard_type: string;
  severity: string;
  location_name: string;
  latitude: number;
  longitude: number;
  description: string;
  status: string;
  created_at: string;
}

export interface WeatherSummary {
  corridor: string;
  avg_rain_1h_mm: number;
  avg_rain_24h_mm: number;
  avg_rain_3day_mm: number;
  rangpo: any;
  gangtok: any;
  active_hazard_alert: boolean;
}

export interface DecisionSupportData {
  weather_scenario_tested: {
    rain_1d_mm: number;
    rain_3d_mm: number;
    rain_7d_mm: number;
  };
  question_1_inaccessible_roads: {
    chokepoint_name: string;
    coordinates: [number, number];
    failure_probability_pct: number;
    accessibility_status: string;
    severity_level: string;
    recommended_action: string;
    est_clearance_time: string;
    affected_highway: string;
  }[];
  question_2_vehicle_delays: {
    corridor_length_km: number;
    base_freeflow_time_mins: number;
    weather_slowdown_mins: number;
    hazard_congestion_delay_mins: number;
    total_expected_travel_time_mins: number;
    total_expected_delay_mins: number;
    traffic_condition: string;
    fuel_consumption_impact: string;
    safe_departure_advice: string;
  };
  question_3_disconnected_regions: {
    region_id: string;
    region_name: string;
    administrative_division: string;
    population_threatened: number;
    disconnection_risk_pct: number;
    isolation_status: string;
    sole_remaining_ingress: string;
    key_cut_artery: string;
    coordinates: [number, number];
  }[];
  question_4_safest_alternative_route: {
    recommended_route_name: string;
    route_description: string;
    distance_km: number;
    travel_time_mins: number;
    average_risk_score: number;
    safety_improvement_vs_nh10: string;
    hazardous_segments_avoided: number;
    detour_penalty_km: number;
    path_waypoints: [number, number][];
    verdict: string;
  };
  question_5_relief_supply_prioritization: {
    rank: number;
    settlement_name: string;
    region: string;
    population: number;
    priority_supply_index: number;
    priority_tier: string;
    disconnection_risk_pct: number;
    remaining_supplies_days: number;
    recommended_delivery_mode: string;
    critical_goods_needed: string;
  }[];
}

export async function fetchHealth(): Promise<any> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend not responding to health check:', err);
    return null;
  }
}

export async function fetchMLModelInfo(): Promise<MLModelInfo | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/ml/model-info`);
    if (!res.ok) throw new Error('Failed to fetch ML info');
    return await res.json();
  } catch (err) {
    console.warn('Backend ML info error:', err);
    return null;
  }
}

export async function fetchLiveWeather(): Promise<WeatherSummary | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/weather/current`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return await res.json();
  } catch (err) {
    console.warn('Backend weather error:', err);
    return null;
  }
}

export async function fetchDecisionSupport(rain1d?: number, rain3d?: number, rain7d?: number): Promise<DecisionSupportData | null> {
  try {
    const query = rain1d !== undefined 
      ? `?rain_1d=${rain1d}&rain_3d=${rain3d || rain1d * 2.5}&rain_7d=${rain7d || rain1d * 4.5}` 
      : '';
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/logistics/decision-support${query}`);
    if (!res.ok) throw new Error('Failed to fetch decision support');
    return await res.json();
  } catch (err) {
    console.warn('Backend decision support error:', err);
    return null;
  }
}

export async function compareRoutes(params: {
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  rain_1h?: number;
  rain_24h?: number;
  rain_3day?: number;
}): Promise<RouteComparisonResult | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/route/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to compare routes');
    return await res.json();
  } catch (err) {
    console.warn('Backend route compare error:', err);
    return null;
  }
}

export async function fetchFieldReports(): Promise<FieldReport[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/reports`);
    if (!res.ok) throw new Error('Failed to fetch reports');
    const data = await res.json();
    return data.reports || [];
  } catch (err) {
    console.warn('Backend reports error:', err);
    return [];
  }
}

export async function submitFieldReport(report: {
  reporter_name: string;
  contact_number?: string;
  hazard_type: string;
  severity: string;
  location_name: string;
  latitude: number;
  longitude: number;
  description: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    return res.ok;
  } catch (err) {
    console.error('Submit report error:', err);
    return false;
  }
}

// ---------------- MEGHALAYA STATEWIDE API CLIENTS ----------------

export interface MeghalayaDistrict {
  district_lgd_code: number;
  district_name: string;
  state: string;
}

export interface MeghalayaLandslide {
  event_id: string;
  latitude: number;
  longitude: number;
  district_nearest: string;
  nearest_village_id: string;
  dist_to_village_km: number;
  hazard_type: string;
}

export interface MeghalayaVillage {
  village_id: string;
  village_name: string;
  block: string;
  district: string;
  population: number;
  households: number;
  centroid_latitude: number;
  centroid_longitude: number;
}

export interface MeghalayaSegment {
  segment_id: string;
  corridor: string;
  start_name: string;
  end_name: string;
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  mid_lat: number;
  mid_lon: number;
  length_m: number;
  elevation: number;
  slope: number;
  district: string;
  near_hazard_km: number;
  risk_score: number;
  risk_category: string;
  color_hex: string;
}

export interface MeghalayaDecisionSupport {
  weather_conditions: {
    rain_1d_mm: number;
    rain_3d_mm: number;
    rain_7d_mm: number;
  };
  q1_inaccessible_roads: {
    chokepoint_id: string;
    name: string;
    district: string;
    lat: number;
    lon: number;
    elevation_m: number;
    slope_deg: number;
    risk_score: number;
    status: string;
    severity: string;
    recommended_action: string;
    estimated_clearance_hours: number;
    hazard_reason: string;
  }[];
  q2_vehicle_delays: {
    route_name: string;
    origin: string;
    destination: string;
    distance_km: number;
    baseline_hours: number;
    delay_hours: number;
    total_expected_hours: number;
    transit_condition: string;
    peak_risk_score: number;
    corridor_type: string;
  }[];
  q3_disconnected_areas: {
    settlement_id: string;
    name: string;
    district: string;
    population: number;
    isolation_probability: number;
    stock_runway_days: number;
    risk_level: string;
    primary_supply_need: string;
    critical_access_chokepoint: string;
    lat: number;
    lon: number;
  }[];
  q4_safest_route: {
    corridor: string;
    shortest_route: {
      name: string;
      distance_km: number;
      duration_hours: number;
      max_landslide_risk: number;
      safety_verdict: string;
      path_summary: string;
    };
    safest_alternative: {
      name: string;
      distance_km: number;
      duration_hours: number;
      max_landslide_risk: number;
      risk_reduction_pct: string;
      safety_verdict: string;
      path_summary: string;
    };
  };
  q5_emergency_prioritization: {
    settlement_id: string;
    name: string;
    district: string;
    population: number;
    psi_score: number;
    priority_tier: string;
    badge_color: string;
    stock_runway_days: number;
    primary_supply_need: string;
    critical_chokepoint: string;
    lat: number;
    lon: number;
  }[];
  total_segments_analyzed: number;
  high_risk_segments_count: number;
  moderate_risk_segments_count: number;
}

export async function fetchMeghalayaDistricts(): Promise<MeghalayaDistrict[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/districts`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    const data = await res.json();
    return data.districts || [];
  } catch (err) {
    console.warn('Meghalaya districts fetch error:', err);
    return [];
  }
}

export async function fetchMeghalayaLandslides(): Promise<MeghalayaLandslide[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/landslides`);
    if (!res.ok) throw new Error('Failed to fetch landslides');
    const data = await res.json();
    return data.landslides || [];
  } catch (err) {
    console.warn('Meghalaya landslides fetch error:', err);
    return [];
  }
}

export async function fetchMeghalayaVillages(): Promise<MeghalayaVillage[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/villages`);
    if (!res.ok) throw new Error('Failed to fetch villages');
    const data = await res.json();
    return data.villages || [];
  } catch (err) {
    console.warn('Meghalaya villages fetch error:', err);
    return [];
  }
}

export async function fetchMeghalayaSegments(rain1d: number = 25, rain3d: number = 60, rain7d: number = 120): Promise<MeghalayaSegment[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/segments?rain_1d=${rain1d}&rain_3d=${rain3d}&rain_7d=${rain7d}`);
    if (!res.ok) throw new Error('Failed to fetch segments');
    const data = await res.json();
    return data.segments || [];
  } catch (err) {
    console.warn('Meghalaya segments fetch error:', err);
    return [];
  }
}

export async function fetchMeghalayaMLMetrics(): Promise<any> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/ml/metrics`);
    if (!res.ok) throw new Error('Failed to fetch ML metrics');
    return await res.json();
  } catch (err) {
    console.warn('Meghalaya ML metrics fetch error:', err);
    return null;
  }
}

export async function fetchMeghalayaDecisionSupport(rain1d: number = 35, rain3d: number = 85, rain7d: number = 160): Promise<MeghalayaDecisionSupport | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/decision-support?rain_1d=${rain1d}&rain_3d=${rain3d}&rain_7d=${rain7d}`);
    if (!res.ok) throw new Error('Failed to fetch Meghalaya decision support');
    return await res.json();
  } catch (err) {
    console.warn('Meghalaya decision support fetch error:', err);
    return null;
  }
}

export interface MeghalayaRoutePreset {
  id: string;
  name: string;
  description: string;
  start: { name: string; lat: number; lon: number };
  end: { name: string; lat: number; lon: number };
}

export interface MeghalayaRouteDetails {
  label: string;
  total_distance_km: number;
  estimated_time_mins: number;
  estimated_time_hours: number;
  average_risk: number;
  peak_risk: number;
  high_risk_segments_count: number;
  chokepoints_encountered: string[];
  waypoints: string[];
  coordinates: [number, number][]; // [lat, lon]
  node_count: number;
}

export interface BetterFasterSaferAnalysis {
  faster_route: string;
  faster_detail: string;
  safer_route: string;
  safer_detail: string;
  better_route: string;
  better_verdict: string;
  better_badge: string;
  better_color: string;
  better_reason: string;
}

export interface MeghalayaHub {
  name: string;
  display_name: string;
  lat: number;
  lon: number;
  district: string;
  elevation_m: number;
}

export interface MeghalayaRouteComparisonResult {
  origin: { name: string; lat: number; lon: number; node_id: string };
  destination: { name: string; lat: number; lon: number; node_id: string };
  weather_scenario: {
    rain_1d_mm: number;
    rain_3d_mm: number;
    rain_7d_mm: number;
  };
  comparison: {
    risk_reduction_pct: number;
    detour_km: number;
    time_difference_mins: number;
    high_risk_segments_avoided: number;
    recommendation: string;
  };
  better_faster_safer?: BetterFasterSaferAnalysis;
  shortest_route: MeghalayaRouteDetails;
  safer_route: MeghalayaRouteDetails;
}

export async function fetchMeghalayaRouteHubs(): Promise<MeghalayaHub[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/route/hubs`);
    if (!res.ok) throw new Error('Failed to fetch route hubs');
    const data = await res.json();
    return data.hubs || [];
  } catch (err) {
    console.warn('Meghalaya hubs fetch error:', err);
    return [];
  }
}

export async function fetchMeghalayaRoutePresets(): Promise<MeghalayaRoutePreset[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/route/presets`);
    if (!res.ok) throw new Error('Failed to fetch route presets');
    const data = await res.json();
    return data.presets || [];
  } catch (err) {
    console.warn('Meghalaya presets fetch error:', err);
    return [];
  }
}

export async function compareMeghalayaRoutes(params: {
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  rain_1d?: number;
  rain_3d?: number;
  rain_7d?: number;
  risk_penalty_weight?: number;
}): Promise<MeghalayaRouteComparisonResult | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/route/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to compare Meghalaya routes`);
    return await res.json();
  } catch (err) {
    console.warn('Meghalaya route comparison error:', err);
    return null;
  }
}

export interface SegmentExplainabilityData {
  segment_id: string;
  corridor: string;
  start_name: string;
  end_name: string;
  district: string;
  road_type: string;
  length_m: number;
  coordinates: {
    start: [number, number];
    mid: [number, number];
    end: [number, number];
  };
  explainability: {
    prediction: {
      calibrated_landslide_probability: number;
      raw_rf_probability: number;
      raw_xgb_probability: number;
      risk_tier: string;
      confidence_score: number;
      model_ensemble: string;
      evaluated_at: string;
    };
    rainfall_provenance: {
      source_id: string;
      nearest_grid_cell: string;
      grid_coordinates: [number, number];
      rain_1d_mm: number;
      rain_3d_mm: number;
      rain_7d_mm: number;
      data_quality: string;
    };
    terrain_provenance: {
      terrain_record_id: string;
      elevation_m: number;
      slope_deg: number;
      aspect_deg: number;
      lithology: string;
      source_id: string;
      data_quality: string;
    };
    hazard_proximity_provenance: {
      nearest_candidate_id: string;
      verification_status: string;
      source_catalog: string;
      data_quality: string;
      scientific_warning: string;
    };
    data_sources_catalog: Array<{
      source_id: string;
      source_name: string;
      provider: string;
      data_quality: string;
    }>;
  };
}

export interface DatabaseSummaryData {
  status: string;
  database_file: string;
  total_tables: number;
  total_records: number;
  tables: Array<{
    table: string;
    purpose: string;
    rows: number;
    has_provenance_cols: boolean;
  }>;
}

export interface AblationStudyData {
  experiments: Array<{
    model_id: string;
    label: string;
    features_used: string[];
    features_count: number;
    precision: number;
    recall: number;
    f1_score: number;
    accuracy: number;
  }>;
  conclusion: string;
}

export interface SpatialValidationData {
  training_region: string;
  holdout_test_region: string;
  train_samples: number;
  holdout_samples: number;
  precision: number;
  recall: number;
  f1_score: number;
  accuracy: number;
  confusion_matrix: number[][];
  verdict: string;
}

export interface ProbabilityCalibrationData {
  method: string;
  brier_score_before: number;
  brier_score_after: number;
  brier_score_reduction_pct: number;
  calibration_curve: Array<{
    predicted_prob: number;
    observed_frequency: number;
  }>;
  conclusion: string;
}

export interface SensitivityAnalysisResult {
  origin: string;
  destination: string;
  baseline_shortest: {
    distance_km: number;
    travel_time_mins: number;
    accumulated_risk: number;
    average_risk_pct: number;
    peak_risk_pct: number;
    high_risk_segments: number;
    chokepoints: string[];
  };
  sensitivity_grid: Array<{
    alpha: number;
    beta: number;
    formula: string;
    distance_km: number;
    travel_time_mins: number;
    accumulated_risk: number;
    average_risk_pct: number;
    peak_risk_pct: number;
    high_risk_segments: number;
    detour_km: number;
    risk_reduction_pct: number;
    chokepoints_bypassed: string[];
  }>;
  recommended_parameters: {
    alpha: number;
    beta: number;
    justification: string;
  };
}

export interface MeghalayaCitizenReport {
  report_id: number;
  reporter_name: string;
  contact_number?: string;
  hazard_type: string;
  severity: string;
  location_name: string;
  district: string;
  latitude: number;
  longitude: number;
  description: string;
  verification_status: string;
  source_id: string;
  data_quality: string;
  created_at: string;
}

export async function fetchMeghalayaExplainability(
  segmentId: string,
  rain1d?: number,
  rain3d?: number,
  rain7d?: number
): Promise<SegmentExplainabilityData | null> {
  try {
    const q = rain1d !== undefined ? `?rain_1d=${rain1d}&rain_3d=${rain3d || 85}&rain_7d=${rain7d || 160}` : '';
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/explainability/${segmentId}${q}`);
    if (!res.ok) throw new Error('Explainability fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Explainability fetch error:', err);
    return null;
  }
}

export async function fetchMeghalayaDatabaseSummary(): Promise<DatabaseSummaryData | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/database/tables-summary`);
    if (!res.ok) throw new Error('Database summary fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Database summary fetch error:', err);
    return null;
  }
}

export async function fetchMeghalayaAblationStudy(): Promise<AblationStudyData | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/ml/ablation-study`);
    if (!res.ok) throw new Error('Ablation study fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Ablation study fetch error:', err);
    return null;
  }
}

export async function fetchMeghalayaSpatialValidation(): Promise<SpatialValidationData | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/ml/spatial-validation`);
    if (!res.ok) throw new Error('Spatial validation fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Spatial validation fetch error:', err);
    return null;
  }
}

export async function fetchMeghalayaCalibration(): Promise<ProbabilityCalibrationData | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/ml/calibration`);
    if (!res.ok) throw new Error('Calibration fetch failed');
    return await res.json();
  } catch (err) {
    console.warn('Calibration fetch error:', err);
    return null;
  }
}

export async function fetchMeghalayaRouteSensitivity(params: {
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  rain_1d?: number;
  rain_3d?: number;
  rain_7d?: number;
}): Promise<SensitivityAnalysisResult | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/route/sensitivity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Sensitivity evaluation failed');
    return await res.json();
  } catch (err) {
    console.warn('Sensitivity evaluation error:', err);
    return null;
  }
}

export async function fetchMeghalayaCitizenReports(): Promise<MeghalayaCitizenReport[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/citizen-reports`);
    if (!res.ok) throw new Error('Failed to fetch citizen reports');
    const data = await res.json();
    return data.reports || [];
  } catch (err) {
    console.warn('Citizen reports fetch error:', err);
    return [];
  }
}

export async function submitMeghalayaCitizenReport(report: {
  reporter_name: string;
  contact_number?: string;
  hazard_type: string;
  severity: string;
  location_name: string;
  district?: string;
  latitude: number;
  longitude: number;
  description: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v2/meghalaya/citizen-reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    return res.ok;
  } catch (err) {
    console.error('Submit citizen report error:', err);
    return false;
  }
}
