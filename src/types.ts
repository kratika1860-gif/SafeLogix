import { Feature, FeatureCollection, Point, LineString, Polygon } from 'geojson';

export type UserRole = 'driver' | 'field_user' | 'district_officer' | 'logistics_coordinator' | 'emergency_coordinator' | 'admin' | 'super_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatarUrl?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export type AccessibilityState = 'Open' | 'Partially Accessible' | 'Congested' | 'High Risk' | 'Restricted' | 'Closed' | 'Unknown';

export type RouteType = 'Fastest' | 'Safest' | 'Recommended' | 'Emergency' | 'Alternative';

export interface RouteScore {
  safetyScore: number;
  accessibilityScore: number;
  riskScore: number;
  delayProbability: number;
  confidenceIndicator: 'Low' | 'Medium' | 'High';
  explanation: string;
}

export interface RouteData {
  id: string;
  name: string;
  routeType: RouteType;
  accessibilityState: AccessibilityState;
  distanceKm: number;
  estimatedTimeMin: number;
  weatherCondition: string;
  incidents: Incident[];
  geometry: any;
  scores: RouteScore;
}

export interface Incident {
  id: string;
  type: 'road_closure' | 'accident' | 'weather' | 'landslide' | 'flood';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: [number, number]; // [lng, lat]
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year?: string;
  color?: string;
  licensePlate: string;
  registrationNumber?: string;
  status: 'available' | 'assigned' | 'maintenance';
}

export type TripStatus = 
  | 'assigned' | 'accepted' | 'preparing' | 'started' 
  | 'in_transit' | 'delayed' | 'route_changed' | 'paused' 
  | 'emergency' | 'delivered' | 'completed' | 'cancelled';

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  status: TripStatus;
  pickupLocation: string;
  destination: string;
  destinationCoords: [number, number]; // [lng, lat]
  cargoCategory: string;
  priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  eta: string;
  totalDistanceKm: number;
  remainingDistanceKm: number;
  routeId: string;
  riskLevel: string;
  weatherWarning: string;
}

export interface LocationRecord {
  lat: number;
  lng: number;
  timestamp: number;
  synced: boolean;
}

export interface DriverState {
  isOnDuty: boolean;
  activeTrip: Trip | null;
  assignedVehicle: Vehicle | null;
  currentLocation: [number, number] | null; // [lng, lat]
  locationQueue: LocationRecord[];
}


export type ReportCategory = 'Landslide' | 'Flooding' | 'Road damage' | 'Bridge damage' | 'Road blockage' | 'Accident' | 'Vehicle breakdown' | 'Traffic congestion' | 'Weather hazard' | 'Accessibility problem' | 'Supply emergency' | 'Other';

export interface FieldReport {
  id: string;
  category: ReportCategory;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  location: [number, number]; // [lng, lat]
  district?: string;
  roadName?: string;
  photoUrls: string[];
  timestamp: number;
  reporterId: string;
  synced: boolean;
}

export type EmergencyCategory = 
  | 'Road Blocked' 
  | 'Medical Emergency' 
  | 'Accident' 
  | 'Flood' 
  | 'Landslide' 
  | 'Vehicle Failure'
  | 'Security Threat'
  | 'Hazardous Spill';

export type EmergencyStatus = 'New' | 'Acknowledged' | 'Escalated' | 'Dispatched' | 'Resolved';

export interface EmergencyHistoryLog {
  action: string;
  timestamp: number;
  userId: string;
  note?: string;
}

export interface EmergencyReport {
  id: string;
  category: EmergencyCategory;
  location: [number, number]; // [lng, lat]
  address?: string;
  district?: string;
  tripId?: string;
  reporterId: string;
  reporterName?: string;
  reporterPhone?: string;
  vehiclePlate?: string;
  vehicleModel?: string;
  cargoDescription?: string;
  timestamp: number;
  synced: boolean;
  status?: EmergencyStatus;
  isEscalated?: boolean;
  escalatedAt?: number;
  escalationReason?: string;
  dispatchedUnit?: string;
  dispatchedAt?: number;
  resolvedAt?: number;
  resolutionNotes?: string;
  history?: EmergencyHistoryLog[];
}

export type AlertPriority = 'Critical' | 'Emergency' | 'High' | 'Medium' | 'Low' | 'Informational';

export type AlertCategory = 
  | 'Emergency'
  | 'Road closure'
  | 'Landslide'
  | 'Flood'
  | 'Accident'
  | 'Medical Emergency'
  | 'Security Threat'
  | 'SLA Breach'
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
