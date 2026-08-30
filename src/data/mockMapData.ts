import { Incident, RouteData } from '../types';
import { calculateRouteScores } from '../lib/intelligence';

export const mockIncidents: Incident[] = [
  {
    id: 'inc-1',
    type: 'accident',
    description: 'Multi-vehicle collision blocking 2 lanes near Jalukbari Rotary, Guwahati.',
    severity: 'high',
    location: [91.6620, 26.1510],
  },
  {
    id: 'inc-2',
    type: 'flood',
    description: 'Critical flash flooding and water overflow reported on GS Road / Zoo Road junction.',
    severity: 'critical',
    location: [91.7720, 26.1680],
  },
  {
    id: 'inc-3',
    type: 'accident',
    description: 'Heavy truck breakdown and oil spill on NH-27 Guwahati Bypass near Khanapara.',
    severity: 'high',
    location: [91.7880, 26.1120],
  },
  {
    id: 'inc-4',
    type: 'road_closure',
    description: 'Landslide clearing underway near Kamakhya foothills road.',
    severity: 'critical',
    location: [91.7050, 26.1550],
  },
];

export const mockVehicles = [
  { id: 'V-101', type: 'Medical Transport', location: [91.7420, 26.1520], status: 'En Route', driver: 'Alice S.', load: '85%' },
  { id: 'V-102', type: 'Food Supply', location: [91.7850, 26.1420], status: 'Idle', driver: 'Bob W.', load: '10%' },
  { id: 'V-103', type: 'Emergency Rescue', location: [91.6750, 26.1600], status: 'Loading', driver: 'Charlie D.', load: '100%' }
];

export const mockRoutes = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'route-1',
        name: 'Guwahati Northern Supply Corridor',
        accessibilityState: 'Open',
        distanceKm: 14.2,
        estimatedTimeMin: 28,
        routeType: 'Fastest',
        weatherCondition: 'Clear',
        scores: calculateRouteScores({
          distanceKm: 14.2,
          baseTimeMin: 28,
          weather: 'Clear',
          floodRisk: 0,
          landslideRisk: 0,
          historicalDisruptionProbability: 5,
          trafficCongestion: 15,
          incidents: [],
          fieldReportsCount: 0
        }),
        incidents: [],
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.6600, 26.1500],
          [91.7100, 26.1650],
          [91.7500, 26.1800],
          [91.7900, 26.1500],
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        id: 'route-2',
        name: 'NH-27 Southern Bypass Corridor',
        accessibilityState: 'High Risk',
        distanceKm: 18.5,
        estimatedTimeMin: 52,
        routeType: 'Alternative',
        weatherCondition: 'Heavy Rain',
        scores: calculateRouteScores({
          distanceKm: 18.5,
          baseTimeMin: 32,
          weather: 'Heavy Rain',
          floodRisk: 45,
          landslideRisk: 20,
          historicalDisruptionProbability: 30,
          trafficCongestion: 65,
          incidents: [mockIncidents[1], mockIncidents[2]],
          fieldReportsCount: 3
        }),
        incidents: [mockIncidents[1], mockIncidents[2]],
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.6550, 26.1400],
          [91.7200, 26.1150],
          [91.7850, 26.1050],
          [91.8150, 26.1200],
        ]
      }
    },
  ]
};
