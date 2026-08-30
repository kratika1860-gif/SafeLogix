import { create } from 'zustand';
import { User, DriverState, Trip, Vehicle, LocationRecord, TripStatus } from '../types';
import * as turf from '@turf/turf';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { fetchWithAuth } from '../lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

interface AppState extends AuthState, DriverState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  setDuty: (isOnDuty: boolean) => Promise<void>;
  toggleDuty: () => Promise<void>;
  updateLocation: (lng: number, lat: number) => void;
  pushLocationRecord: (lat: number, lng: number) => void;
  syncLocationQueue: () => Promise<void>;
  setActiveTrip: (trip: Trip | null) => void;
  updateTripStatus: (status: TripStatus) => void;
  fetchAssignedTrip: () => void;
  updateUserProfile: (profileUpdates: Partial<User>) => void;
  updateAssignedVehicle: (vehicleUpdates: Partial<Vehicle>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  isOnDuty: false,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  activeTrip: null,
  assignedVehicle: {
    id: 'veh-1',
    make: 'Toyota',
    model: 'Hilux',
    licensePlate: 'ABC-123',
    status: 'assigned',
  },
  currentLocation: null,
  locationQueue: [],

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },

  login: (user) => set({ user, isAuthenticated: true }),
  
  logout: async () => {
    try {
      if (localStorage.getItem('DEV_MOCK_TOKEN')) {
        localStorage.removeItem('DEV_MOCK_TOKEN');
        localStorage.setItem('LOGGED_OUT', 'true');
      } else {
        await firebaseSignOut(auth);
      }
      set({ user: null, isAuthenticated: false, isOnDuty: false, activeTrip: null });
    } catch (error) {
      console.error('Logout error', error);
    }
  },

  initializeAuth: () => {
    set({ isLoadingAuth: true });

    let token = localStorage.getItem('DEV_MOCK_TOKEN');
    if (!token && !localStorage.getItem('LOGGED_OUT')) {
      token = 'DEV_MOCK_TOKEN';
      localStorage.setItem('DEV_MOCK_TOKEN', token);
    }

    if (token) {
      fetchWithAuth('/api/auth/me')
        .then(data => {
          set({ 
            user: data.user, 
            isAuthenticated: true,
            isOnDuty: data.driverState?.isOnDuty ?? false,
            isLoadingAuth: false
          });
        })
        .catch(err => {
          console.error('Dev auth failed', err);
          localStorage.removeItem('DEV_MOCK_TOKEN');
          set({ user: null, isAuthenticated: false, isLoadingAuth: false });
        });
      return;
    }

    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const data = await fetchWithAuth('/api/auth/me');
          set({ 
            user: data.user, 
            isAuthenticated: true,
            isOnDuty: data.driverState?.isOnDuty ?? false,
            isLoadingAuth: false
          });
        } catch (error) {
          console.error('Auth initialization error', error);
          set({ user: null, isAuthenticated: false, isLoadingAuth: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoadingAuth: false });
      }
    });
  },

  setDuty: async (newState: boolean) => {
    const currentState = get().isOnDuty;
    set({ isOnDuty: newState });
    try {
      await fetchWithAuth('/api/driver/duty', {
        method: 'POST',
        body: JSON.stringify({ isOnDuty: newState })
      });
    } catch (err) {
      console.error("Failed to sync duty status", err);
      set({ isOnDuty: currentState });
    }
  },

  toggleDuty: async () => {
    const currentState = get().isOnDuty;
    await get().setDuty(!currentState);
  },
  
  updateLocation: (lng, lat) => set({ currentLocation: [lng, lat] }),
  
  pushLocationRecord: (lat, lng) => set((state) => {
    const queue = [...state.locationQueue];
    const lastRecord = queue[queue.length - 1];
    if (lastRecord) {
      const dist = turf.distance(
        turf.point([lastRecord.lng, lastRecord.lat]), 
        turf.point([lng, lat]), 
        { units: 'meters' }
      );
      if (dist < 10) return state; // Don't push if moved < 10m
    }
    queue.push({ lat, lng, timestamp: Date.now(), synced: false });
    return { locationQueue: queue };
  }),

  syncLocationQueue: async () => {
    if (!navigator.onLine) return;
    const pending = get().locationQueue.filter(r => !r.synced);
    if (pending.length === 0) return;

    try {
      await fetchWithAuth('/api/sync', {
        method: 'POST',
        body: JSON.stringify({ gps: pending })
      });
      set((state) => ({
        locationQueue: state.locationQueue.map(record => ({ ...record, synced: true }))
      }));
    } catch (err) {
      console.error("Failed to sync locations", err);
    }
  },

  setActiveTrip: (trip) => set({ activeTrip: trip }),
  
  updateTripStatus: (status) => set((state) => ({
    activeTrip: state.activeTrip ? { ...state.activeTrip, status } : null
  })),

  updateUserProfile: (profileUpdates) => set((state) => ({
    user: state.user ? { ...state.user, ...profileUpdates } : null
  })),

  updateAssignedVehicle: (vehicleUpdates) => set((state) => ({
    assignedVehicle: state.assignedVehicle ? { ...state.assignedVehicle, ...vehicleUpdates } : {
      id: `veh-${Date.now()}`,
      make: vehicleUpdates.make || '',
      model: vehicleUpdates.model || '',
      licensePlate: vehicleUpdates.licensePlate || '',
      registrationNumber: vehicleUpdates.registrationNumber || '',
      status: 'assigned',
      ...vehicleUpdates
    } as Vehicle
  })),

  fetchAssignedTrip: () => set({
    activeTrip: {
      id: 'trip-101',
      driverId: 'user-1',
      vehicleId: 'veh-1',
      status: 'assigned',
      pickupLocation: 'Guwahati Central Depot (Garchuk)',
      destination: 'Dispur Medical Complex',
      destinationCoords: [91.7850, 26.1450], 
      cargoCategory: 'Medical Supplies',
      priorityLevel: 'Critical',
      eta: '28 mins',
      totalDistanceKm: 14.2,
      remainingDistanceKm: 14.2,
      routeId: 'route-1',
      riskLevel: 'Nominal',
      weatherWarning: 'Clear conditions'
    }
  })
}));
