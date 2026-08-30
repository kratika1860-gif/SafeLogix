import { create } from 'zustand';
import { FieldReport, EmergencyReport, EmergencyStatus } from '../types';
import { fetchWithAuth } from '../lib/api';

interface ReportState {
  fieldReports: FieldReport[];
  emergencyReports: EmergencyReport[];
  addFieldReport: (report: Omit<FieldReport, 'id' | 'timestamp' | 'synced'>) => void;
  addEmergencyReport: (report: Omit<EmergencyReport, 'id' | 'timestamp' | 'synced'>) => void;
  updateEmergencyStatus: (id: string, status: EmergencyStatus, userId: string, note?: string) => void;
  escalateEmergency: (id: string, reason: string, userId?: string) => void;
  dispatchEmergencyUnit: (id: string, unitName: string, userId: string, notes?: string) => void;
  resolveEmergency: (id: string, notes: string, userId: string) => void;
  simulateIncomingSOS: (category?: string) => EmergencyReport;
  simulateEscalation: (id?: string) => EmergencyReport | null;
  syncReports: () => Promise<void>;
}

export const useReportStore = create<ReportState>((set, get) => ({
  fieldReports: [],
  emergencyReports: [
    {
      id: 'emerg-1001',
      category: 'Medical Emergency',
      location: [91.7450, 26.1500],
      address: 'GMCH Hospital Road, Bhangagarh, Guwahati',
      district: 'Kamrup Metropolitan',
      reporterId: 'USR-8902',
      reporterName: 'Rajesh Kalita',
      reporterPhone: '+91 94350-12890',
      vehiclePlate: 'AS-01-GC-9281',
      vehicleModel: 'Tata 407 High-Deck',
      cargoDescription: 'Essential Medical Supplies & IV Saline',
      tripId: 'TRP-4820',
      timestamp: Date.now() - 8 * 60 * 1000,
      synced: true,
      status: 'Acknowledged',
      history: [
        { action: 'Emergency Signal Broadcasted', timestamp: Date.now() - 8 * 60 * 1000, userId: 'USR-8902' },
        { action: 'Status changed to Acknowledged by NER Operations Admin', timestamp: Date.now() - 6 * 60 * 1000, userId: 'admin' }
      ]
    },
    {
      id: 'emerg-1002',
      category: 'Accident',
      location: [91.7880, 26.1120],
      address: 'NH-27 Khanapara Overpass Express Corridor',
      district: 'Kamrup Metropolitan',
      reporterId: 'USR-8911',
      reporterName: 'Biren Barman',
      reporterPhone: '+91 98640-77123',
      vehiclePlate: 'AS-01-EC-4019',
      vehicleModel: 'Ashok Leyland Ecomet 1214',
      cargoDescription: 'Perishable Food Grain & Dairy',
      tripId: 'TRP-4911',
      timestamp: Date.now() - 14 * 60 * 1000,
      synced: true,
      status: 'Escalated',
      isEscalated: true,
      escalatedAt: Date.now() - 9 * 60 * 1000,
      escalationReason: 'SLA Breach: Unattended in high-density corridor > 5 minutes',
      history: [
        { action: 'Emergency Signal Broadcasted', timestamp: Date.now() - 14 * 60 * 1000, userId: 'USR-8911' },
        { action: 'Protocol Escalated to Level-2 (District SDRF & Zonal Command)', timestamp: Date.now() - 9 * 60 * 1000, userId: 'SYSTEM_MONITOR', note: 'SLA threshold exceeded (300s)' }
      ]
    },
    {
      id: 'emerg-1003',
      category: 'Landslide',
      location: [91.6620, 26.1510],
      address: 'Jalukbari Rotary Bypass, Near Saraighat Bridge',
      district: 'Kamrup Metropolitan',
      reporterId: 'USR-8924',
      reporterName: 'Dipak Choudhury',
      reporterPhone: '+91 97060-33441',
      vehiclePlate: 'AS-25-CC-1102',
      vehicleModel: 'Mahindra Bolero Maxi Truck',
      cargoDescription: 'Emergency Water Purifiers & Dry Rations',
      tripId: 'TRP-4702',
      timestamp: Date.now() - 25 * 60 * 1000,
      synced: true,
      status: 'Dispatched',
      dispatchedUnit: 'Assam SDRF Quick Response Unit 2',
      dispatchedAt: Date.now() - 18 * 60 * 1000,
      history: [
        { action: 'Emergency Signal Broadcasted', timestamp: Date.now() - 25 * 60 * 1000, userId: 'USR-8924' },
        { action: 'Status changed to Acknowledged', timestamp: Date.now() - 22 * 60 * 1000, userId: 'admin' },
        { action: 'Dispatched Unit: Assam SDRF Quick Response Unit 2', timestamp: Date.now() - 18 * 60 * 1000, userId: 'admin', note: 'Heavy debris clearance & winch tow dispatched' }
      ]
    }
  ],

  addFieldReport: (reportData) => {
    const newReport: FieldReport = {
      ...reportData,
      id: `report-${Date.now()}`,
      timestamp: Date.now(),
      synced: false
    };
    set((state) => ({ fieldReports: [...state.fieldReports, newReport] }));
    get().syncReports();
  },

  addEmergencyReport: (reportData) => {
    const newReport: EmergencyReport = {
      ...reportData,
      id: `emerg-${Date.now()}`,
      timestamp: Date.now(),
      synced: false,
      status: 'New',
      reporterName: reportData.reporterName || 'Driver ' + (reportData.reporterId || 'Unknown'),
      reporterPhone: reportData.reporterPhone || '+91 94350-00000',
      vehiclePlate: reportData.vehiclePlate || 'AS-01-EX-' + Math.floor(1000 + Math.random() * 9000),
      vehicleModel: reportData.vehicleModel || 'Logistics Freight Truck',
      address: reportData.address || `${reportData.location[1].toFixed(4)}°N, ${reportData.location[0].toFixed(4)}°E (Guwahati Corridor)`,
      district: reportData.district || 'Kamrup Metropolitan',
      history: [{ action: 'Emergency Signal Broadcasted (Live SOS)', timestamp: Date.now(), userId: reportData.reporterId }]
    };
    set((state) => ({ emergencyReports: [newReport, ...state.emergencyReports] }));
    console.warn('EMERGENCY DISPATCHED:', newReport);
    get().syncReports();
  },

  updateEmergencyStatus: (id, status, userId, note) => {
    set((state) => ({
      emergencyReports: state.emergencyReports.map((report) => {
        if (report.id === id) {
          const actionText = status === 'Acknowledged' ? 'Incident Command Acknowledged by Operator' : 
                             status === 'Resolved' ? 'Incident Formally Resolved & Cleared' : 
                             status === 'Escalated' ? 'Protocol Escalated to Level-2 Command' :
                             status === 'Dispatched' ? 'Emergency Response Unit Dispatched' :
                             `Status updated to ${status}`;
          return {
            ...report,
            status,
            isEscalated: status === 'Escalated' ? true : report.isEscalated,
            history: [
              ...(report.history || []),
              { action: actionText, timestamp: Date.now(), userId, note }
            ]
          };
        }
        return report;
      })
    }));
  },

  escalateEmergency: (id, reason, userId = 'SYSTEM_MONITOR') => {
    set((state) => ({
      emergencyReports: state.emergencyReports.map((report) => {
        if (report.id === id) {
          return {
            ...report,
            status: 'Escalated',
            isEscalated: true,
            escalatedAt: Date.now(),
            escalationReason: reason,
            history: [
              ...(report.history || []),
              { 
                action: '🚨 Protocol Escalated: Level-2 Emergency Alert', 
                timestamp: Date.now(), 
                userId,
                note: reason 
              }
            ]
          };
        }
        return report;
      })
    }));
  },

  dispatchEmergencyUnit: (id, unitName, userId, notes) => {
    set((state) => ({
      emergencyReports: state.emergencyReports.map((report) => {
        if (report.id === id) {
          return {
            ...report,
            status: 'Dispatched',
            dispatchedUnit: unitName,
            dispatchedAt: Date.now(),
            history: [
              ...(report.history || []),
              { 
                action: `Unit Dispatched: ${unitName}`, 
                timestamp: Date.now(), 
                userId,
                note: notes || 'En route with priority corridor clearance' 
              }
            ]
          };
        }
        return report;
      })
    }));
  },

  resolveEmergency: (id, notes, userId) => {
    set((state) => ({
      emergencyReports: state.emergencyReports.map((report) => {
        if (report.id === id) {
          return {
            ...report,
            status: 'Resolved',
            resolvedAt: Date.now(),
            resolutionNotes: notes,
            history: [
              ...(report.history || []),
              { 
                action: 'Incident Resolved & Closed', 
                timestamp: Date.now(), 
                userId,
                note: notes 
              }
            ]
          };
        }
        return report;
      })
    }));
  },

  simulateIncomingSOS: (category = 'Accident') => {
    const locations: { name: string; coords: [number, number]; address: string }[] = [
      { name: 'Six Mile Flyover Junction', coords: [91.7940, 26.1280], address: 'Six Mile GS Road Flyover, Guwahati' },
      { name: 'Jorabat Landslide Chokepoint (NH-6)', coords: [91.8900, 26.1100], address: 'NH-6 Jorabat Hill Incline (Border Point)' },
      { name: 'Beltola Chariali Logistics Depot', coords: [91.7820, 26.1360], address: 'Beltola Central Market Crossing, Guwahati' },
      { name: 'Guwahati Port / Pandu Ghat', coords: [91.6850, 26.1680], address: 'Pandu Riverport Road, Jalukbari' },
      { name: 'VIP Road Borjhar Airport Link', coords: [91.6020, 26.1080], address: 'Airport VIP Road, Borjhar Corridor' }
    ];

    const pick = locations[Math.floor(Math.random() * locations.length)];
    const driverNum = Math.floor(1000 + Math.random() * 9000);
    const driverNames = ['Anup Barua', 'Hiren Deka', 'Tapan Sharma', 'Pranab Saikia', 'Bikash Gogoi'];
    const driverName = driverNames[Math.floor(Math.random() * driverNames.length)];

    const newReport: EmergencyReport = {
      id: `emerg-${Date.now()}`,
      category: category as any,
      location: pick.coords,
      address: pick.address,
      district: 'Kamrup Metropolitan',
      reporterId: `USR-${driverNum}`,
      reporterName: driverName,
      reporterPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      vehiclePlate: `AS-01-FX-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleModel: 'BharatBenz 1617R Logistics Truck',
      cargoDescription: 'Priority Commercial Freight & Medicines',
      tripId: `TRP-${Math.floor(5000 + Math.random() * 4000)}`,
      timestamp: Date.now(),
      synced: false,
      status: 'New',
      history: [
        { action: '🚨 Live Emergency SOS Broadcasted', timestamp: Date.now(), userId: `USR-${driverNum}` }
      ]
    };

    set((state) => ({ emergencyReports: [newReport, ...state.emergencyReports] }));
    return newReport;
  },

  simulateEscalation: (targetId) => {
    const current = get().emergencyReports;
    const alert = targetId 
      ? current.find(r => r.id === targetId) 
      : current.find(r => r.status !== 'Resolved' && r.status !== 'Escalated') || current[0];

    if (!alert) return null;

    get().escalateEmergency(
      alert.id, 
      'SLA Breach: Response time exceeded protocol target (3 min). Level-2 District command notified.',
      'SYSTEM_MONITOR'
    );

    return alert;
  },

  syncReports: async () => {
    if (!navigator.onLine) return;

    const pendingField = get().fieldReports.filter(r => !r.synced);
    const pendingEmergency = get().emergencyReports.filter(r => !r.synced);

    if (pendingField.length === 0 && pendingEmergency.length === 0) return;

    try {
      await fetchWithAuth('/api/sync', {
        method: 'POST',
        body: JSON.stringify({
          incidents: pendingField.map(f => ({
            category: f.category,
            severity: f.severity,
            description: f.description,
            location: f.location,
            photoUrls: f.photoUrls
          })),
          emergencies: pendingEmergency.map(e => ({
            type: e.category,
            description: '',
            location: e.location
          }))
        })
      });

      set((state) => ({
        fieldReports: state.fieldReports.map(r => ({ ...r, synced: true })),
        emergencyReports: state.emergencyReports.map(r => ({ ...r, synced: true }))
      }));
    } catch (err) {
      console.error("Failed to sync reports", err);
    }
  }
}));
