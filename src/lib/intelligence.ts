import { RouteData, Incident, RouteScore, RouteType, AccessibilityState } from '../types';

export interface RouteConditions {
  distanceKm: number;
  baseTimeMin: number;
  weather: 'Clear' | 'Rain' | 'Heavy Rain' | 'Storm' | 'Snow';
  floodRisk: number; // 0-100
  landslideRisk: number; // 0-100
  historicalDisruptionProbability: number; // 0-100
  trafficCongestion: number; // 0-100
  incidents: Incident[];
  fieldReportsCount: number;
}

/**
 * Calculates a route's scores deterministically when AI service is unavailable.
 * Risk = Weather Risk + Incident Risk + Historical Risk + Road Condition Risk + Field Report Risk
 */
export function calculateRouteScores(conditions: RouteConditions): RouteScore {
  // 1. Weather Risk (0-30)
  let weatherRisk = 0;
  switch (conditions.weather) {
    case 'Rain': weatherRisk = 10; break;
    case 'Heavy Rain': weatherRisk = 20; break;
    case 'Storm': weatherRisk = 30; break;
    case 'Snow': weatherRisk = 25; break;
  }

  // 2. Incident Risk (0-30)
  const incidentRisk = Math.min(30, conditions.incidents.length * 15);

  // 3. Historical Risk (0-15)
  const historicalRisk = (conditions.historicalDisruptionProbability / 100) * 15;

  // 4. Road Condition Risk (Flood + Landslide + Traffic) (0-20)
  const roadConditionRisk = Math.min(20, (conditions.floodRisk + conditions.landslideRisk + conditions.trafficCongestion) / 10);

  // 5. Field Report Risk (0-15)
  const fieldReportRisk = Math.min(15, conditions.fieldReportsCount * 5);

  const totalRiskScore = Math.min(100, Math.round(weatherRisk + incidentRisk + historicalRisk + roadConditionRisk + fieldReportRisk));
  
  const safetyScore = 100 - totalRiskScore;
  const accessibilityScore = 100 - Math.min(100, incidentRisk + roadConditionRisk * 2);
  
  // Delay calculation
  const delayProbability = Math.min(100, Math.round((totalRiskScore * 1.5)));
  
  let confidenceIndicator: 'Low' | 'Medium' | 'High' = 'High';
  if (conditions.weather === 'Storm' || conditions.fieldReportsCount > 3) {
    confidenceIndicator = 'Low';
  } else if (conditions.incidents.length > 0 || conditions.weather === 'Heavy Rain') {
    confidenceIndicator = 'Medium';
  }

  // Generate Explanation
  const explanationParts = [];
  if (totalRiskScore < 20) {
    explanationParts.push('Route conditions are optimal with minimal detected risks.');
  } else {
    explanationParts.push(`Calculated risk is ${totalRiskScore}%.`);
    if (weatherRisk > 10) explanationParts.push(`Adverse weather (${conditions.weather}) contributes to risk.`);
    if (incidentRisk > 0) explanationParts.push(`Active incidents along route.`);
    if (roadConditionRisk > 10) explanationParts.push(`Elevated road condition risks (flood/landslide/traffic).`);
    if (fieldReportRisk > 0) explanationParts.push(`Recent field reports indicate potential hazards.`);
  }

  return {
    safetyScore,
    accessibilityScore,
    riskScore: totalRiskScore,
    delayProbability,
    confidenceIndicator,
    explanation: explanationParts.join(' '),
  };
}

export function generateAlternativeRoutes(baseConditions: RouteConditions): RouteData[] {
  // Generate Fastest
  const fastestScores = calculateRouteScores(baseConditions);
  
  // Generate Safest (Simulate longer distance, better conditions)
  const safestConditions = {
    ...baseConditions,
    distanceKm: baseConditions.distanceKm * 1.3,
    baseTimeMin: baseConditions.baseTimeMin * 1.4,
    incidents: [],
    floodRisk: 0,
    landslideRisk: 0,
    fieldReportsCount: 0,
    trafficCongestion: 10,
  };
  const safestScores = calculateRouteScores(safestConditions);

  // Generate Emergency (Simulate shorter distance, potentially higher risk)
  const emergencyConditions = {
    ...baseConditions,
    distanceKm: baseConditions.distanceKm * 0.9,
    baseTimeMin: baseConditions.baseTimeMin * 0.8,
  };
  const emergencyScores = calculateRouteScores(emergencyConditions);

  // Generate Recommended (Balanced)
  const recommendedConditions = {
    ...baseConditions,
    distanceKm: baseConditions.distanceKm * 1.1,
    baseTimeMin: baseConditions.baseTimeMin * 1.1,
    floodRisk: Math.max(0, baseConditions.floodRisk - 10),
    trafficCongestion: Math.max(0, baseConditions.trafficCongestion - 20),
  };
  const recommendedScores = calculateRouteScores(recommendedConditions);

  return [
    {
      id: 'route-recommended',
      name: 'Primary Arterial',
      routeType: 'Recommended',
      accessibilityState: getAccessibilityFromRisk(recommendedScores.riskScore),
      distanceKm: recommendedConditions.distanceKm,
      estimatedTimeMin: recommendedConditions.baseTimeMin,
      weatherCondition: recommendedConditions.weather,
      incidents: recommendedConditions.incidents,
      geometry: { type: 'LineString', coordinates: [] },
      scores: recommendedScores,
    },
    {
      id: 'route-fastest',
      name: 'Highway Route',
      routeType: 'Fastest',
      accessibilityState: getAccessibilityFromRisk(fastestScores.riskScore),
      distanceKm: baseConditions.distanceKm,
      estimatedTimeMin: baseConditions.baseTimeMin,
      weatherCondition: baseConditions.weather,
      incidents: baseConditions.incidents,
      geometry: { type: 'LineString', coordinates: [] }, // Mock geometry
      scores: fastestScores,
    },
    {
      id: 'route-safest',
      name: 'Bypass Route',
      routeType: 'Safest',
      accessibilityState: getAccessibilityFromRisk(safestScores.riskScore),
      distanceKm: safestConditions.distanceKm,
      estimatedTimeMin: safestConditions.baseTimeMin,
      weatherCondition: safestConditions.weather,
      incidents: safestConditions.incidents,
      geometry: { type: 'LineString', coordinates: [] },
      scores: safestScores,
    },
    {
      id: 'route-emergency',
      name: 'Direct Access',
      routeType: 'Emergency',
      accessibilityState: getAccessibilityFromRisk(emergencyScores.riskScore),
      distanceKm: emergencyConditions.distanceKm,
      estimatedTimeMin: emergencyConditions.baseTimeMin,
      weatherCondition: emergencyConditions.weather,
      incidents: emergencyConditions.incidents,
      geometry: { type: 'LineString', coordinates: [] },
      scores: emergencyScores,
    }
  ];
}

function getAccessibilityFromRisk(riskScore: number): AccessibilityState {
  if (riskScore < 20) return 'Open';
  if (riskScore < 50) return 'Partially Accessible';
  if (riskScore < 80) return 'High Risk';
  return 'Closed';
}
