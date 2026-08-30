import { create } from 'zustand';

export interface MapFilters {
  location: {
    state: string;
    district: string;
    route: string;
  };
  severity: {
    low: boolean;
    medium: boolean;
    high: boolean;
    critical: boolean;
  };
  status: {
    active: boolean;
    resolved: boolean;
    verified: boolean;
    underReview: boolean;
  };
  time: 'live' | '1h' | '24h' | '7d' | 'custom';
}

interface MapState {
  layers: {
    // Logistics
    warehouses: boolean;
    deliveryLocations: boolean;
    checkpoints: boolean;
    vehicles: boolean;
    // Points of Interest & Amenities
    roadwork: boolean;
    petrolStations: boolean;
    hotels: boolean;
    restaurants: boolean;
    landslideProneAreas: boolean;
    // Incidents & Hazard Zones
    criticalAlerts: boolean;
    accidents: boolean;
    landslides: boolean;
    landslideZones: boolean;
    floods: boolean;
    waterlogging: boolean;
    roadDamage: boolean;
    bridgeDamage: boolean;
    roadClosures: boolean;
    // Intelligence & Demand
    highDemandZones: boolean;
    roadAccessibility: boolean;
    weatherRisk: boolean;
    highRiskCorridors: boolean;
    routes: boolean;
    emergencyRoutes: boolean;
  };
  emergencyRouteTypes: {
    medical: boolean;
    food: boolean;
    disaster: boolean;
    evacuation: boolean;
  };
  filters: MapFilters;
  toggleLayer: (layer: keyof MapState['layers']) => void;
  setLayers: (newLayers: Partial<MapState['layers']>) => void;
  toggleEmergencyRouteType: (type: 'medical' | 'food' | 'disaster' | 'evacuation') => void;
  setEmergencyRouteTypes: (types: Partial<MapState['emergencyRouteTypes']>) => void;
  toggleCriticalAlerts: (force?: boolean) => void;
  togglePois: (enable?: boolean) => void;
  setFilter: (category: keyof MapFilters, subFilter: string, value: any) => void;
  resetFilters: () => void;
  selectedEntityId: string | null;
  setSelectedEntityId: (id: string | null) => void;
  selectedEntityType: 'vehicle' | 'incident' | 'warehouse' | 'delivery' | 'checkpoint' | 'route' | 'roadwork' | 'petrol_station' | 'hotel' | 'restaurant' | 'landslide_zone' | 'landslide_prone_area' | 'landslide' | null;
  setSelectedEntity: (id: string | null, type: MapState['selectedEntityType']) => void;
  isMapLoaded: boolean;
  setIsMapLoaded: (loaded: boolean) => void;
  mapDataTimestamp: number;
  flyToTarget: { longitude: number; latitude: number; zoom?: number; timestamp: number } | null;
  flyTo: (coords: [number, number], zoom?: number) => void;
}

const defaultFilters: MapFilters = {
  location: { state: 'all', district: 'all', route: 'all' },
  severity: { low: true, medium: true, high: true, critical: true },
  status: { active: true, resolved: false, verified: true, underReview: true },
  time: 'live'
};

export const useMapStore = create<MapState>((set) => ({
  layers: {
    warehouses: true,
    deliveryLocations: true,
    checkpoints: true,
    vehicles: true,
    roadwork: true,
    petrolStations: true,
    hotels: true,
    restaurants: true,
    landslideProneAreas: true,
    criticalAlerts: true,
    accidents: true,
    landslides: true,
    landslideZones: true,
    floods: true,
    waterlogging: true,
    roadDamage: true,
    bridgeDamage: true,
    roadClosures: true,
    highDemandZones: true,
    roadAccessibility: true,
    weatherRisk: false,
    highRiskCorridors: true,
    routes: true,
    emergencyRoutes: true,
  },
  emergencyRouteTypes: {
    medical: true,
    food: true,
    disaster: true,
    evacuation: true,
  },
  filters: defaultFilters,
  flyToTarget: null,
  flyTo: (coords, zoom = 13.5) => set({
    flyToTarget: { longitude: coords[0], latitude: coords[1], zoom, timestamp: Date.now() }
  }),
  toggleEmergencyRouteType: (type) =>
    set((state) => ({
      emergencyRouteTypes: {
        ...state.emergencyRouteTypes,
        [type]: !state.emergencyRouteTypes[type]
      }
    })),
  setEmergencyRouteTypes: (types) =>
    set((state) => ({
      emergencyRouteTypes: {
        ...state.emergencyRouteTypes,
        ...types
      }
    })),
  toggleLayer: (layer) =>
    set((state) => {
      const nextVal = !state.layers[layer];
      const newLayers = { ...state.layers, [layer]: nextVal };
      
      // If toggling criticalAlerts master switch, sync incident layers
      if (layer === 'criticalAlerts') {
        newLayers.accidents = nextVal;
        newLayers.landslides = nextVal;
        newLayers.landslideZones = nextVal;
        newLayers.landslideProneAreas = nextVal;
        newLayers.floods = nextVal;
        newLayers.waterlogging = nextVal;
        newLayers.roadDamage = nextVal;
        newLayers.bridgeDamage = nextVal;
        newLayers.roadClosures = nextVal;
      }
      
      return { layers: newLayers };
    }),
  setLayers: (newLayers) =>
    set((state) => ({
      layers: { ...state.layers, ...newLayers },
    })),
  toggleCriticalAlerts: (force) =>
    set((state) => {
      const targetState = force !== undefined ? force : !state.layers.criticalAlerts;
      return {
        layers: {
          ...state.layers,
          criticalAlerts: targetState,
          accidents: targetState,
          landslides: targetState,
          landslideZones: targetState,
          landslideProneAreas: targetState,
          floods: targetState,
          waterlogging: targetState,
          roadDamage: targetState,
          bridgeDamage: targetState,
          roadClosures: targetState,
        }
      };
    }),
  togglePois: (enable) =>
    set((state) => {
      const currentPoisState = state.layers.petrolStations || state.layers.hotels || state.layers.restaurants || state.layers.roadwork;
      const targetState = enable !== undefined ? enable : !currentPoisState;
      return {
        layers: {
          ...state.layers,
          petrolStations: targetState,
          hotels: targetState,
          restaurants: targetState,
          roadwork: targetState,
          landslideProneAreas: targetState,
        }
      };
    }),
  setFilter: (category, subFilter, value) => set((state) => {
    if (category === 'time') {
      return { filters: { ...state.filters, time: value } };
    }
    return {
      filters: {
        ...state.filters,
        [category]: {
          ...(state.filters[category] as any),
          [subFilter]: value
        }
      }
    };
  }),
  resetFilters: () => set({ filters: defaultFilters }),
  selectedEntityId: null,
  selectedEntityType: null,
  setSelectedEntityId: (id) => set({ selectedEntityId: id }),
  setSelectedEntity: (id, type) => set({ selectedEntityId: id, selectedEntityType: type }),
  isMapLoaded: false,
  setIsMapLoaded: (loaded) => set({ isMapLoaded: loaded }),
  mapDataTimestamp: Date.now(),
}));
