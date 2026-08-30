import React, { useState, useMemo } from 'react';
import GISMap from '../../components/map/GISMap';
import MapSearch from '../../components/map/MapSearch';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Filter, Layers, AlertTriangle, Truck, Package, Activity, Info, CheckCircle2, 
  XCircle, AlertCircle, ShieldAlert, Navigation, Map as MapIcon, ChevronDown, 
  ChevronRight, BarChart2, CloudRain, Thermometer, Wind, Search, RotateCcw, 
  Radio, Compass, ShieldCheck, MapPin, Eye, Check, ExternalLink, Zap, Fuel,
  Hotel, Utensils, HardHat, Phone
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { useMapStore } from '../../store/useMapStore';
import { useMapData } from '../../hooks/useMapData';

// --- DISTRICT & TERRITORIAL INTELLIGENCE ---
export interface DistrictInfo {
  id: string;
  name: string;
  region: string;
  coordinates: [number, number]; // [lng, lat]
  zoom: number;
  connectivityScore: number;
  routes: { open: number; restricted: number; closed: number };
  vehicles: number;
  deliveries: number;
  highRiskLocations: number;
  incidents: number;
  accessibility: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    confidence: 'High' | 'Medium';
    explanation: string;
  };
}

export const OPERATIONAL_DISTRICTS: DistrictInfo[] = [
  {
    id: 'kamrup-metro',
    name: 'Kamrup Metropolitan & Urban Core',
    region: 'Central Valley Corridor',
    coordinates: [91.7362, 26.1445],
    zoom: 12.2,
    connectivityScore: 78,
    routes: { open: 38, restricted: 6, closed: 2 },
    vehicles: 24,
    deliveries: 86,
    highRiskLocations: 3,
    incidents: 4,
    accessibility: {
      score: 72,
      trend: 'stable',
      confidence: 'High',
      explanation: 'GS Road waterlogging active on curb lanes; central elevated corridor open. Urban freight moving with slight speed restrictions.'
    }
  },
  {
    id: 'jorabat-gateway',
    name: 'Jorabat Gateway & Meghalaya Pass',
    region: 'East Mountain Border Corridor',
    coordinates: [91.8950, 26.1080],
    zoom: 13.0,
    connectivityScore: 42,
    routes: { open: 12, restricted: 8, closed: 3 },
    vehicles: 14,
    deliveries: 38,
    highRiskLocations: 4,
    incidents: 3,
    accessibility: {
      score: 38,
      trend: 'down',
      confidence: 'High',
      explanation: 'Active mudslide alert along mountain cutting on NH-6 / NH-27 confluence. Heavy freight staging at Jorabat yard pending slope stabilization.'
    }
  },
  {
    id: 'jalukbari-north',
    name: 'Jalukbari & Brahmaputra North',
    region: 'West Transit & Saraighat Bridge',
    coordinates: [91.6620, 26.1550],
    zoom: 12.8,
    connectivityScore: 92,
    routes: { open: 45, restricted: 2, closed: 0 },
    vehicles: 31,
    deliveries: 110,
    highRiskLocations: 1,
    incidents: 1,
    accessibility: {
      score: 91,
      trend: 'up',
      confidence: 'High',
      explanation: 'Saraighat bridge dual-deck fully operational. Freight depot Alpha operating at peak throughput.'
    }
  },
  {
    id: 'azara-airport',
    name: 'Azara & Airport Logistics Corridor',
    region: 'Western Logistics Trunk',
    coordinates: [91.5850, 26.1100],
    zoom: 12.5,
    connectivityScore: 94,
    routes: { open: 28, restricted: 1, closed: 0 },
    vehicles: 18,
    deliveries: 64,
    highRiskLocations: 0,
    incidents: 0,
    accessibility: {
      score: 96,
      trend: 'stable',
      confidence: 'High',
      explanation: 'Air freight cargo terminal links clear. Priority medical and high-value shipments moving ahead of schedule.'
    }
  },
  {
    id: 'sonapur-east',
    name: 'Sonapur Industrial & Tea Trunk',
    region: 'Eastern Freight Highway',
    coordinates: [91.9600, 26.1200],
    zoom: 12.2,
    connectivityScore: 82,
    routes: { open: 34, restricted: 4, closed: 1 },
    vehicles: 20,
    deliveries: 72,
    highRiskLocations: 2,
    incidents: 2,
    accessibility: {
      score: 84,
      trend: 'stable',
      confidence: 'Medium',
      explanation: 'Tea export and consumer freight routes active. Highway bypass operating with temporary wet weather caution.'
    }
  }
];

export const OPERATIONAL_REGIONS = [
  { id: 'all', name: 'All Greater Guwahati Network', coords: [91.7362, 26.1445] as [number, number], zoom: 11.5 },
  { id: 'central', name: 'Guwahati Urban Core & Dispur', coords: [91.7600, 26.1550] as [number, number], zoom: 12.5 },
  { id: 'west', name: 'Jalukbari & Saraighat Bridge Corridor', coords: [91.6620, 26.1550] as [number, number], zoom: 12.8 },
  { id: 'east', name: 'Jorabat Mountain Pass & NH-6 Border', coords: [91.8950, 26.1080] as [number, number], zoom: 13.0 },
  { id: 'airport', name: 'Azara & Airport Cargo Hub', coords: [91.5850, 26.1100] as [number, number], zoom: 12.5 },
  { id: 'sonapur', name: 'Sonapur Industrial Belt & East Link', coords: [91.9600, 26.1200] as [number, number], zoom: 12.2 }
];

export const TACTICAL_SUPPLY_GAPS = [
  {
    id: 'gap-jorabat',
    entityId: 'landslide-jorabat',
    type: 'Critical Chokepoint',
    severity: 'critical',
    title: 'Jorabat Mountain Pass Freight Bottleneck',
    location: [91.8950, 26.1080] as [number, number],
    explanation: 'Landslide debris on NH-6/NH-27 pass. Outbound freight to Meghalaya & Tripura delayed by 3.8 hours.',
    action: 'Divert via Garchuk staging yard or wait at Jorabat depot.'
  },
  {
    id: 'gap-gsroad',
    entityId: 'inc-flood-gsroad',
    type: 'Urban Inundation',
    severity: 'high',
    title: 'GS Road Urban Drainage Surcharge',
    location: [91.7720, 26.1680] as [number, number],
    explanation: '45mm/hr localized downpour causing 1.5ft waterlogging. Light delivery vans restricted to central elevated flyover.',
    action: 'Reroute urgent shipments via VIP Road / NH-27 bypass.'
  },
  {
    id: 'gap-kamakhya',
    entityId: 'landslide-kamakhya',
    type: 'Slope Vigilance',
    severity: 'warning',
    title: 'Kamakhya Foothill Slope Vulnerability',
    location: [91.7050, 26.1550] as [number, number],
    explanation: 'Saturated red soil cutting on Nilachal Hill bypass. Heavy freight trucks advised to maintain 40m safe spacing.',
    action: 'Use Maligaon-Pandu Riverfront bypass.'
  }
];

export default function CommandMap() {
  const [activeSidebarTab, setActiveSidebarTab] = useState<'controls' | 'fleet' | 'incidents' | 'gaps'>('controls');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { 
    layers, 
    toggleLayer, 
    toggleCriticalAlerts, 
    togglePois,
    filters,
    setFilter,
    resetFilters,
    emergencyRouteTypes,
    toggleEmergencyRouteType,
    flyTo,
    setSelectedEntity
  } = useMapStore();

  const { data: mapData, loading: dataLoading } = useMapData(null);

  const selectedDistrict = useMemo(() => {
    return OPERATIONAL_DISTRICTS.find(d => d.id === selectedDistrictId);
  }, [selectedDistrictId]);

  // Handle District Selection
  const handleSelectDistrict = (districtId: string) => {
    if (!districtId) {
      setSelectedDistrictId(null);
      return;
    }
    const dist = OPERATIONAL_DISTRICTS.find(d => d.id === districtId);
    if (dist) {
      setSelectedDistrictId(dist.id);
      flyTo(dist.coordinates, dist.zoom);
    }
  };

  // Handle Region Selection
  const handleSelectRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    const reg = OPERATIONAL_REGIONS.find(r => r.id === regionId);
    if (reg) {
      flyTo(reg.coords, reg.zoom);
    }
  };

  // Handle Focus On Emergency Route
  const handleFocusEmergencyRoute = (routeId: string, coords: [number, number]) => {
    setSelectedEntity(routeId, 'route');
    flyTo(coords, 13.5);
  };

  // Filtered vehicles for live fleet tab
  const filteredVehicles = useMemo(() => {
    if (!mapData?.vehicles) return [];
    if (!searchQuery.trim()) return mapData.vehicles;
    const q = searchQuery.toLowerCase();
    return mapData.vehicles.filter((v: any) => 
      v.properties.id?.toLowerCase().includes(q) ||
      v.properties.driver?.toLowerCase().includes(q) ||
      v.properties.cargo?.toLowerCase().includes(q) ||
      v.properties.status?.toLowerCase().includes(q)
    );
  }, [mapData?.vehicles, searchQuery]);

  // Filtered incidents for incidents tab
  const filteredIncidents = useMemo(() => {
    if (!mapData?.incidents) return [];
    if (!searchQuery.trim()) return mapData.incidents;
    const q = searchQuery.toLowerCase();
    return mapData.incidents.filter((i: any) => 
      i.properties.title?.toLowerCase().includes(q) ||
      i.properties.description?.toLowerCase().includes(q) ||
      i.properties.type?.toLowerCase().includes(q) ||
      i.properties.severity?.toLowerCase().includes(q)
    );
  }, [mapData?.incidents, searchQuery]);

  // Quick stats summary
  const stats = useMemo(() => {
    const totalVehicles = mapData?.vehicles?.length || 12;
    const activeAlerts = mapData?.incidents?.filter((i: any) => i.properties.severity === 'critical' || i.properties.severity === 'high')?.length || 4;
    const openCorridorsPct = 94.2;
    return { totalVehicles, activeAlerts, openCorridorsPct };
  }, [mapData]);

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden relative bg-[#18181B] font-sans">
      
      {/* =========================================================================
          LEFT SIDEBAR: Command Radar Controls, Fleet & Incident Queue
          ========================================================================= */}
      <div 
        className={cn(
          "absolute md:relative inset-y-0 left-0 w-84 md:w-96 bg-[#18181B] border-r border-zinc-800 flex flex-col z-30 shrink-0 h-full transition-transform duration-300 transform shadow-2xl md:shadow-none",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Mobile Toggle Handle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden absolute top-4 -right-12 bg-[#D4A373] text-[#18181B] p-2.5 rounded-r-xl shadow-lg flex items-center justify-center z-40 font-bold"
          aria-label="Toggle Command Controls"
        >
          <Filter className="w-5 h-5" />
        </button>

        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-zinc-800 bg-[#18181B] sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4A373]/15 text-[#E9C46A] border border-[#D4A373]/30 flex items-center justify-center font-bold">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-heading font-extrabold text-[#FAF7F2] leading-tight flex items-center gap-1.5">
                Command GIS Radar
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#E9C46A]/15 text-[#E9C46A] border border-[#E9C46A]/30 text-[9px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E9C46A] animate-pulse" /> LIVE
                </span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-zinc-400">Guwahati & Northeast Logistics Hub</p>
            </div>
          </div>
          
          <button 
            onClick={() => flyTo([91.7362, 26.1445], 11.5)}
            title="Reset Map to Guwahati Center"
            className="p-1.5 text-zinc-400 hover:text-[#E9C46A] hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Controls, Fleet, Incidents, Gaps) */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 p-1.5 gap-1">
          <button
            onClick={() => setActiveSidebarTab('controls')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1",
              activeSidebarTab === 'controls'
                ? "bg-[#27272A] text-[#E9C46A] border border-[#D4A373]/30 shadow-sm"
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
            )}
          >
            <Filter className="w-3.5 h-3.5" /> Controls
          </button>
          <button
            onClick={() => setActiveSidebarTab('fleet')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1",
              activeSidebarTab === 'fleet'
                ? "bg-[#27272A] text-[#E9C46A] border border-[#D4A373]/30 shadow-sm"
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
            )}
          >
            <Truck className="w-3.5 h-3.5" /> Fleet ({mapData?.vehicles?.length || 0})
          </button>
          <button
            onClick={() => setActiveSidebarTab('incidents')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1",
              activeSidebarTab === 'incidents'
                ? "bg-[#27272A] text-red-400 border border-red-500/30 shadow-sm"
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
            )}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Incidents
          </button>
          <button
            onClick={() => setActiveSidebarTab('gaps')}
            className={cn(
              "flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1",
              activeSidebarTab === 'gaps'
                ? "bg-[#27272A] text-[#D4A373] border border-[#D4A373]/30 shadow-sm"
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" /> Gaps
          </button>
        </div>

        {/* =====================================================================
            TAB 1: MAP CONTROLS & INTELLIGENCE
            ===================================================================== */}
        {activeSidebarTab === 'controls' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            
            {/* Territory / Region Focus */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E9C46A]" /> Operational Territory
              </label>
              <select 
                className="w-full p-2 bg-[#27272A] rounded-xl border border-zinc-700 text-xs font-medium text-[#FAF7F2] focus:border-[#E9C46A] focus:ring-1 focus:ring-[#E9C46A] outline-none"
                value={selectedRegionId}
                onChange={(e) => handleSelectRegion(e.target.value)}
              >
                {OPERATIONAL_REGIONS.map(reg => (
                  <option key={reg.id} value={reg.id}>{reg.name}</option>
                ))}
              </select>
            </div>

            {/* Tactical District Focus */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> Tactical District Focus
                </label>
                {selectedDistrictId && (
                  <button 
                    onClick={() => setSelectedDistrictId(null)}
                    className="text-[10px] font-semibold text-[#E9C46A] hover:underline"
                  >
                    Clear Focus
                  </button>
                )}
              </div>
              <select 
                className="w-full p-2 bg-[#27272A] rounded-xl border border-zinc-700 text-xs font-medium text-[#FAF7F2] focus:border-[#E9C46A] focus:ring-1 focus:ring-[#E9C46A] outline-none"
                value={selectedDistrictId || ''}
                onChange={(e) => handleSelectDistrict(e.target.value)}
              >
                <option value="">-- Overview All Districts --</option>
                {OPERATIONAL_DISTRICTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name} (Access {d.accessibility.score}/100)</option>
                ))}
              </select>
            </div>

            {/* Filter Row: Risk Severity & Time Horizon */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Severity Filter</label>
                <select 
                  className="w-full p-1.5 bg-[#27272A] rounded-xl border border-zinc-700 text-xs text-[#FAF7F2] focus:border-[#E9C46A] outline-none"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'critical-only') {
                      setFilter('severity', 'critical', true);
                      setFilter('severity', 'high', false);
                      setFilter('severity', 'medium', false);
                      setFilter('severity', 'low', false);
                    } else if (val === 'high-and-critical') {
                      setFilter('severity', 'critical', true);
                      setFilter('severity', 'high', true);
                      setFilter('severity', 'medium', false);
                      setFilter('severity', 'low', false);
                    } else {
                      resetFilters();
                    }
                  }}
                >
                  <option value="all">All Severities</option>
                  <option value="high-and-critical">High & Critical</option>
                  <option value="critical-only">Critical Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Time Window</label>
                <select 
                  className="w-full p-1.5 bg-[#27272A] rounded-xl border border-zinc-700 text-xs text-[#FAF7F2] focus:border-[#E9C46A] outline-none"
                  value={filters.time}
                  onChange={(e) => setFilter('time', 'time', e.target.value)}
                >
                  <option value="live">Live Telemetry</option>
                  <option value="1h">Last 1 Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                </select>
              </div>
            </div>

            {/* Core Tactical Map Layers */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#E9C46A]" /> Active GIS Layers
                </label>
              </div>

              <div className="space-y-1.5">
                {/* Active Incidents Master */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/70 border border-zinc-800 cursor-pointer hover:bg-[#27272A] hover:border-[#D4A373]/30 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs font-semibold text-[#FAF7F2]">Active Incidents & Hazards</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={layers.criticalAlerts}
                    onChange={() => toggleCriticalAlerts()}
                    className="rounded text-red-500 focus:ring-red-500 h-4 w-4 bg-zinc-900 border-zinc-700"
                  />
                </label>

                {/* Active Fleet */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/70 border border-zinc-800 cursor-pointer hover:bg-[#27272A] hover:border-[#D4A373]/30 transition-all">
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-[#E9C46A]" />
                    <span className="text-xs font-semibold text-[#FAF7F2]">Live Freight Fleet</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={layers.vehicles}
                    onChange={() => toggleLayer('vehicles')}
                    className="rounded text-[#D4A373] focus:ring-[#D4A373] h-4 w-4 bg-zinc-900 border-zinc-700"
                  />
                </label>

                {/* Standard Routes */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/70 border border-zinc-800 cursor-pointer hover:bg-[#27272A] hover:border-[#D4A373]/30 transition-all">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-[#FAF7F2]">Standard Transit Corridors</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={layers.routes}
                    onChange={() => toggleLayer('routes')}
                    className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-zinc-900 border-zinc-700"
                  />
                </label>

                {/* High Risk Corridors */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/70 border border-zinc-800 cursor-pointer hover:bg-[#27272A] hover:border-[#D4A373]/30 transition-all">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span className="text-xs font-semibold text-[#FAF7F2]">High-Risk Corridors</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={layers.highRiskCorridors}
                    onChange={() => toggleLayer('highRiskCorridors')}
                    className="rounded text-[#D4A373] focus:ring-[#D4A373] h-4 w-4 bg-zinc-900 border-zinc-700"
                  />
                </label>

                {/* High Demand Demand Zones */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/70 border border-zinc-800 cursor-pointer hover:bg-[#27272A] hover:border-[#D4A373]/30 transition-all">
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-[#E9C46A]" />
                    <span className="text-xs font-semibold text-[#FAF7F2]">High-Demand Relief Zones</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={layers.highDemandZones}
                    onChange={() => toggleLayer('highDemandZones')}
                    className="rounded text-[#D4A373] focus:ring-[#D4A373] h-4 w-4 bg-zinc-900 border-zinc-700"
                  />
                </label>

                {/* Points of Interest */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/70 border border-zinc-800 cursor-pointer hover:bg-[#27272A] hover:border-[#D4A373]/30 transition-all">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold text-[#FAF7F2]">Petrol, Rest Stops & Hotels</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={layers.petrolStations || layers.hotels || layers.restaurants}
                    onChange={() => togglePois()}
                    className="rounded text-cyan-500 focus:ring-cyan-500 h-4 w-4 bg-zinc-900 border-zinc-700 cursor-pointer"
                  />
                </label>

                {/* Weather & Storm Radar */}
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#D4A373]/15 border border-[#D4A373]/30 cursor-pointer hover:bg-[#D4A373]/20 transition-all">
                  <div className="flex items-center gap-2 font-bold text-[#E9C46A]">
                    <CloudRain className="w-4 h-4 text-[#E9C46A]" />
                    <span className="text-xs">Weather & Storm Radar</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={layers.weatherRisk}
                    onChange={() => toggleLayer('weatherRisk')}
                    className="rounded text-[#D4A373] focus:ring-[#D4A373] h-4 w-4 bg-zinc-900 border-zinc-700 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Emergency Priority Corridors Section */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Priority Emergency Corridors
                </label>
                <button
                  onClick={() => toggleLayer('emergencyRoutes')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all border ${
                    layers.emergencyRoutes 
                      ? 'bg-red-500/20 text-red-400 border-red-500/40' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  Master: {layers.emergencyRoutes ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="space-y-2">
                {/* Medical Corridor */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/80 border border-red-500/30">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={emergencyRouteTypes?.medical}
                      onChange={() => toggleEmergencyRouteType('medical')}
                      className="rounded text-red-500 focus:ring-red-500 h-4 w-4 bg-zinc-900 border-zinc-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-red-300">🚑 Medical Green Corridor</div>
                      <div className="text-[10px] text-zinc-400">GMCH &rarr; Airport (26.4 km)</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFocusEmergencyRoute('r-emg-medical', [91.7100, 26.1650])}
                    className="px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Focus
                  </button>
                </div>

                {/* Essential Food Supply */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/80 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={emergencyRouteTypes?.food}
                      onChange={() => toggleEmergencyRouteType('food')}
                      className="rounded text-emerald-500 focus:ring-emerald-500 h-4 w-4 bg-zinc-900 border-zinc-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">🍞 Essential Food & PDS</div>
                      <div className="text-[10px] text-zinc-400">Amingaon Depot &rarr; Khanapara (19.8 km)</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFocusEmergencyRoute('r-emg-food', [91.7500, 26.1400])}
                    className="px-2.5 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Focus
                  </button>
                </div>

                {/* SDRF Disaster Response */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/80 border border-[#D4A373]/30">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={emergencyRouteTypes?.disaster}
                      onChange={() => toggleEmergencyRouteType('disaster')}
                      className="rounded text-[#D4A373] focus:ring-[#D4A373] h-4 w-4 bg-zinc-900 border-zinc-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#E9C46A]">🚨 SDRF Disaster Rapid Route</div>
                      <div className="text-[10px] text-zinc-400">Dispur HQ &rarr; Jorabat (15.2 km)</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFocusEmergencyRoute('r-emg-disaster', [91.8500, 26.1100])}
                    className="px-2.5 py-1 bg-[#D4A373] hover:bg-[#E9C46A] text-[#18181B] rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Focus
                  </button>
                </div>

                {/* Refinery Fuel Trunk */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#27272A]/80 border border-amber-500/30">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={emergencyRouteTypes?.evacuation}
                      onChange={() => toggleEmergencyRouteType('evacuation')}
                      className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4 bg-zinc-900 border-zinc-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-amber-300">⛽ Refinery Petroleum Trunk</div>
                      <div className="text-[10px] text-zinc-400">Noonmati &rarr; Garchuk (18.1 km)</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleFocusEmergencyRoute('r-emg-evacuation', [91.7500, 26.1200])}
                    className="px-2.5 py-1 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-colors"
                  >
                    Focus
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            TAB 2: LIVE FLEET TRACKING
            ===================================================================== */}
        {activeSidebarTab === 'fleet' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
              <input 
                type="text"
                placeholder="Search truck ID, driver, cargo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#27272A] rounded-xl border border-zinc-700 text-xs text-[#FAF7F2] placeholder-zinc-500 outline-none focus:border-[#E9C46A]"
              />
            </div>

            <div className="space-y-2.5">
              {filteredVehicles.map((vehicle: any) => {
                const p = vehicle.properties;
                const coords = vehicle.geometry.coordinates;
                return (
                  <div 
                    key={p.id}
                    className="p-3 bg-[#27272A]/80 rounded-2xl border border-zinc-800 shadow-md hover:border-[#D4A373]/50 transition-all cursor-pointer"
                    onClick={() => {
                      setSelectedEntity(p.id, 'vehicle');
                      flyTo(coords, 14.5);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-[#D4A373]/15 text-[#E9C46A] border border-[#D4A373]/30 rounded-xl font-bold">
                          <Truck className="w-4 h-4" />
                        </span>
                        <div>
                          <div className="text-xs font-bold text-[#FAF7F2]">{p.id}</div>
                          <div className="text-[10px] text-zinc-400">{p.driver || 'Assigned Driver'}</div>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        p.status === 'en_route' || p.status === 'moving' ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30" :
                        p.status === 'delayed' ? "bg-red-950/60 text-red-400 border border-red-500/30" :
                        "bg-[#D4A373]/20 text-[#E9C46A] border border-[#D4A373]/30"
                      )}>
                        {p.status || 'Active'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 text-[11px] py-1.5 border-y border-zinc-800 mb-2">
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Speed</span>
                        <span className="font-bold text-[#FAF7F2]">{p.speed || '45 km/h'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] block">Cargo</span>
                        <span className="font-bold text-[#FAF7F2] truncate block">{p.cargo || 'Medical Kit'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] block">ETA</span>
                        <span className="font-bold text-[#E9C46A]">{p.eta || '28 min'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 flex items-center gap-1 text-[10px]">
                        <Zap className="w-3 h-3 text-[#E9C46A]" /> GPS Lock Active
                      </span>
                      <span className="text-[#E9C46A] font-bold flex items-center gap-1 text-xs">
                        Track Vehicle &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: ACTIVE INCIDENTS QUEUE
            ===================================================================== */}
        {activeSidebarTab === 'incidents' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="space-y-2.5">
              {filteredIncidents.map((incident: any) => {
                const p = incident.properties;
                const coords = incident.geometry.coordinates;
                const isCritical = p.severity === 'critical';
                const isHigh = p.severity === 'high';

                return (
                  <div 
                    key={p.id}
                    className={cn(
                      "p-3 rounded-2xl border transition-all cursor-pointer",
                      isCritical ? "bg-red-950/30 border-red-500/30 hover:border-red-400" :
                      isHigh ? "bg-[#27272A]/90 border-[#D4A373]/40 hover:border-[#E9C46A]" :
                      "bg-[#27272A]/80 border-zinc-800 hover:border-[#D4A373]/30"
                    )}
                    onClick={() => {
                      setSelectedEntity(p.id, 'incident');
                      flyTo(coords, 14.5);
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {isCritical ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <AlertTriangle className="w-4 h-4 text-[#E9C46A]" />}
                        <span className={isCritical ? 'text-red-300' : isHigh ? 'text-[#E9C46A]' : 'text-[#FAF7F2]'}>
                          {p.title || p.name || p.id}
                        </span>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        isCritical ? "bg-red-900/60 text-red-300 border border-red-500/30" : "bg-[#D4A373]/20 text-[#E9C46A] border border-[#D4A373]/30"
                      )}>
                        {p.severity || 'HIGH'}
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
                      {p.description || p.vulnerability || 'Hazard zone requiring high driver vigilance.'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1.5 border-t border-zinc-800">
                      <span>Type: {p.type || 'Hazard'}</span>
                      <span className="text-[#E9C46A] font-bold">Inspect Location &rarr;</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: SUPPLY GAP DETECTION & BOTTLENECK INTELLIGENCE
            ===================================================================== */}
        {activeSidebarTab === 'gaps' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="p-3 bg-[#D4A373]/15 rounded-2xl border border-[#D4A373]/30 mb-3">
              <div className="flex items-center gap-2 font-bold text-xs text-[#E9C46A] mb-1">
                <BarChart2 className="w-4 h-4 text-[#E9C46A]" />
                AI Supply Bottleneck Engine
              </div>
              <p className="text-[11px] text-zinc-300 leading-tight">
                Real-time isolation risk and transit slowdown detectors across Northeast interstate arteries.
              </p>
            </div>

            <div className="space-y-3">
              {TACTICAL_SUPPLY_GAPS.map(gap => (
                <div 
                  key={gap.id}
                  className={cn(
                    "p-3 rounded-2xl border text-sm transition-all cursor-pointer",
                    gap.severity === 'critical' ? "bg-red-950/30 border-red-500/30 hover:border-red-400" :
                    gap.severity === 'high' ? "bg-[#27272A]/90 border-[#D4A373]/40 hover:border-[#E9C46A]" :
                    "bg-[#27272A]/80 border-zinc-800 hover:border-[#D4A373]/30"
                  )}
                  onClick={() => {
                    setSelectedEntity(gap.entityId, 'incident');
                    flyTo(gap.location, 14.5);
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#FAF7F2] flex items-center gap-1.5">
                      {gap.severity === 'critical' ? <ShieldAlert className="w-4 h-4 text-red-400" /> : <AlertTriangle className="w-4 h-4 text-[#E9C46A]" />}
                      {gap.title}
                    </span>
                    <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {gap.severity}
                    </span>
                  </div>
                  
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">{gap.type}</div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-2">{gap.explanation}</p>
                  
                  <div className="p-2.5 rounded-xl bg-[#18181B] border border-zinc-800 text-[11px] text-zinc-300">
                    <span className="font-bold text-[#E9C46A] block mb-0.5">Recommended Action:</span>
                    {gap.action}
                  </div>
                  
                  <div className="mt-2 text-right">
                    <span className="text-[#E9C46A] text-[11px] font-bold">Zoom to Corridor &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CENTER / RIGHT: GIS Tactical Map Canvas & Real-Time Overlays
          ========================================================================= */}
      <div className="flex-1 relative flex flex-col h-full bg-[#18181B]">
        
        {/* Top HUD Floating Control Bar */}
        <div className="absolute top-3 left-3 sm:left-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto max-w-[calc(100%-220px)] sm:max-w-[calc(100%-340px)]">
          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2 bg-[#18181B]/90 backdrop-blur-xl px-2.5 py-1.5 sm:px-3 rounded-xl shadow-2xl border border-[#D4A373]/30 text-xs font-bold text-[#FAF7F2]">
            <span className="flex items-center gap-1 text-[#E9C46A]">
              <Truck className="w-3.5 h-3.5" /> {stats.totalVehicles} <span className="hidden xs:inline">Active</span>
            </span>
            <span className="w-1 h-3 bg-zinc-700 rounded-full" />
            <span className="flex items-center gap-1 text-red-400">
              <AlertTriangle className="w-3.5 h-3.5" /> {stats.activeAlerts} <span className="hidden xs:inline">Hazards</span>
            </span>
            <span className="w-1 h-3 bg-zinc-700 rounded-full hidden md:inline-block" />
            <span className="hidden md:flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> {stats.openCorridorsPct}% Corridors
            </span>
          </div>

          {/* Center Reset View Button */}
          <button 
            onClick={() => flyTo([91.7362, 26.1445], 11.5)}
            className="px-2.5 py-1.5 bg-[#18181B]/90 hover:bg-[#27272A] backdrop-blur-xl rounded-xl shadow-2xl border border-[#D4A373]/30 text-xs font-bold text-[#FAF7F2] transition-all flex items-center gap-1.5"
            title="Reset Map to Guwahati Center"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#E9C46A]" />
            <span className="hidden xl:inline">Guwahati View</span>
          </button>

          {/* Tactical Map Search */}
          <MapSearch 
            onSelect={(lng, lat) => flyTo([lng, lat], 13.5)}
            className="w-40 sm:w-52 md:w-60"
            placeholder="Search NER hubs..."
          />
        </div>

        {/* GIS Interactive Core Map */}
        <div className="flex-1 w-full h-full">
          <GISMap />
        </div>

        {/* FLOATING OVERLAY: Environmental Intel (Storm Radar Mode) */}
        {layers.weatherRisk && (
          <div className="absolute top-16 left-3 sm:left-4 w-76 sm:w-80 bg-[#18181B]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#D4A373]/40 overflow-hidden flex flex-col z-20 animate-in fade-in slide-in-from-left-4 pointer-events-auto">
            <div className="p-3.5 bg-[#D4A373] text-[#18181B] flex items-center justify-between font-bold">
              <h3 className="text-xs flex items-center gap-2 uppercase tracking-wider">
                <CloudRain className="w-4 h-4 text-[#18181B]" /> 
                Environmental Storm Radar
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#18181B] text-[#E9C46A] text-[10px] font-extrabold">
                RADAR ACTIVE
              </span>
            </div>
            
            <div className="p-4 space-y-3.5">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400 mb-0.5">Precipitation Band</div>
                  <div className="text-lg font-heading font-extrabold text-[#FAF7F2]">Active Monsoon Cell</div>
                </div>
                <div className="flex items-center gap-1 font-bold text-[#E9C46A] text-sm">
                  <Thermometer className="w-4 h-4 text-[#E9C46A]" />
                  26°C
                </div>
              </div>
              
              <div className="bg-red-950/40 p-3 rounded-xl border border-red-500/30">
                <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" /> Flash Flood & Mudslide Alert
                </div>
                <p className="text-[11px] text-zinc-300 leading-tight">
                  Intense downpour concentrated along Jorabat mountain slopes and GS Road drainage basin.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#27272A] p-2.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-1 text-zinc-400 font-bold text-[10px] mb-0.5"><Wind className="w-3 h-3 text-[#E9C46A]" /> Wind Velocity</div>
                  <div className="font-bold text-[#FAF7F2]">32 km/h NE</div>
                </div>
                <div className="bg-[#27272A] p-2.5 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-1 text-zinc-400 font-bold text-[10px] mb-0.5"><CloudRain className="w-3 h-3 text-[#E9C46A]" /> Rate of Rainfall</div>
                  <div className="font-bold text-[#FAF7F2]">45 mm/hr</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase mb-1.5">Radar Intensity Scale</div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-zinc-300"><div className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Moderate Rain</span>
                    <span className="text-zinc-500 text-[10px]">10-25 mm/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-zinc-300"><div className="w-2.5 h-2.5 rounded-full bg-[#E9C46A]" /> Heavy Rain</span>
                    <span className="text-zinc-500 text-[10px]">25-50 mm/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-zinc-300"><div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Critical Storm Cell</span>
                    <span className="text-zinc-500 text-[10px]">&gt;50 mm/h</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING OVERLAY: Selected District Deep Dive */}
        {selectedDistrict && (
          <div className="absolute top-16 right-3 sm:right-16 w-80 sm:w-88 bg-[#18181B]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#D4A373]/40 overflow-hidden flex flex-col max-h-[calc(100vh-140px)] z-20 animate-in slide-in-from-right-8 pointer-events-auto">
            <div className="p-4 border-b border-zinc-800 bg-[#27272A]/80 flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-[#E9C46A] uppercase tracking-wider mb-0.5">District Telemetry</div>
                <h2 className="text-sm sm:text-base font-heading font-extrabold text-[#FAF7F2] leading-snug">{selectedDistrict.name}</h2>
                <div className="text-xs text-zinc-400 mt-0.5">{selectedDistrict.region}</div>
              </div>
              <button 
                onClick={() => setSelectedDistrictId(null)} 
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-4">
              
              {/* Accessibility Score Card */}
              <div className="bg-[#27272A]/90 rounded-2xl p-3.5 border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 uppercase">
                    <Activity className="w-4 h-4 text-[#E9C46A]" /> Accessibility Index
                  </h3>
                  <div className={cn(
                    "text-2xl font-heading font-extrabold",
                    selectedDistrict.accessibility.score >= 80 ? "text-emerald-400" :
                    selectedDistrict.accessibility.score >= 50 ? "text-[#E9C46A]" : "text-red-400"
                  )}>
                    {selectedDistrict.accessibility.score}<span className="text-xs text-zinc-500 font-normal">/100</span>
                  </div>
                </div>
                <div className="flex gap-4 mb-2.5 text-xs">
                  <span className="flex items-center gap-1 text-zinc-400">
                    Trend: <span className="font-bold capitalize text-[#FAF7F2]">{selectedDistrict.accessibility.trend}</span>
                  </span>
                  <span className="flex items-center gap-1 text-zinc-400">
                    Confidence: <span className="font-bold text-[#FAF7F2]">{selectedDistrict.accessibility.confidence}</span>
                  </span>
                </div>
                <div className="text-xs text-zinc-300 bg-[#18181B] p-2.5 rounded-xl border border-zinc-800 leading-relaxed">
                  <span className="font-bold text-[#E9C46A] block mb-1">AI Tactical Evaluation:</span>
                  {selectedDistrict.accessibility.explanation}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#27272A] border border-zinc-800 p-2.5 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">Connectivity</div>
                  <div className="text-base font-bold text-[#FAF7F2]">{selectedDistrict.connectivityScore}%</div>
                </div>
                <div className="bg-[#27272A] border border-zinc-800 p-2.5 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">Open Incidents</div>
                  <div className="text-base font-bold text-red-400">{selectedDistrict.incidents}</div>
                </div>
                <div className="bg-[#27272A] border border-zinc-800 p-2.5 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">Active Fleet Units</div>
                  <div className="text-base font-bold text-[#E9C46A]">{selectedDistrict.vehicles}</div>
                </div>
                <div className="bg-[#27272A] border border-zinc-800 p-2.5 rounded-xl">
                  <div className="text-[10px] text-zinc-400 font-bold mb-0.5">Pending Relief Loads</div>
                  <div className="text-base font-bold text-[#D4A373]">{selectedDistrict.deliveries}</div>
                </div>
              </div>

              {/* Route Status Breakdown */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Route Status Breakdown</h4>
                <div className="p-2.5 bg-[#27272A] rounded-xl border border-zinc-800 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold"><CheckCircle2 className="w-3.5 h-3.5"/> Open Corridors</span>
                    <span className="font-bold text-[#FAF7F2]">{selectedDistrict.routes.open}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-[#E9C46A] font-semibold"><AlertTriangle className="w-3.5 h-3.5"/> Restricted Corridors</span>
                    <span className="font-bold text-[#FAF7F2]">{selectedDistrict.routes.restricted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-red-400 font-semibold"><XCircle className="w-3.5 h-3.5"/> Closed Corridors</span>
                    <span className="font-bold text-[#FAF7F2]">{selectedDistrict.routes.closed}</span>
                  </div>
                </div>
              </div>

              {/* Focus Button */}
              <button 
                onClick={() => flyTo(selectedDistrict.coordinates, selectedDistrict.zoom)}
                className="w-full py-2.5 bg-[#D4A373] hover:bg-[#E9C46A] text-[#18181B] rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" /> Re-Center on {selectedDistrict.name}
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
