const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code += `
export type AlertPriority = 'Critical' | 'Emergency' | 'High' | 'Medium' | 'Low' | 'Informational';

export type AlertCategory = 
  | 'Road closure'
  | 'Landslide'
  | 'Flood'
  | 'Heavy rainfall'
  | 'Bridge damage'
  | 'Delivery delay'
  | 'Route deviation'
  | 'High-risk corridor'
  | 'Vehicle issue'
  | 'Emergency supply requirement';

export interface AppNotification {
  id: string;
  priority: AlertPriority;
  category: AlertCategory;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: number;
  relatedRouteId?: string;
  relatedIncidentId?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export type RiskLevel = 'Green' | 'Amber' | 'Red';

export interface WeatherIntelligence {
  temperature: number;
  forecast: string;
  rainfall: number; // mm
  windSpeed: number; // km/h
  heavyRainfallWarning: boolean;
  travelRiskLevel: RiskLevel;
  lastUpdated: number;
}
`;
fs.writeFileSync('src/types.ts', code);
