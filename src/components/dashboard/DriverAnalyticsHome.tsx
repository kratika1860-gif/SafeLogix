import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useMapStore } from '../../store/useMapStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { 
  CloudRain, AlertTriangle, Truck, History, CheckCircle, Navigation, Wind, 
  Thermometer, ShieldAlert, CheckCircle2, Activity, Clock, Map as MapIcon, 
  Info, Flame, MapPin, Zap, Fuel, Hotel, Utensils, HardHat, Home, Layers, X,
  TrendingUp, Bell
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { Marker, NavigationControl, Source, Layer, Popup } from 'react-map-gl/maplibre';
import BaseMap from '../map/BaseMap';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mockIncidents } from '../../data/mockMapData';
import circle from '@turf/circle';
import DailyTripsSummaryCard from './DailyTripsSummaryCard';

interface Props {
  onStartTrip: () => void;
  onOpenNotifications: () => void;
}

export default function DriverAnalyticsHome({ onStartTrip, onOpenNotifications }: Props) {
  const { assignedVehicle, isOnDuty, theme } = useAppStore();
  const { weather, notifications, unreadCount } = useNotificationStore();
  const { layers, toggleLayer, toggleCriticalAlerts, togglePois } = useMapStore();
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  
  const recentNotifications = notifications.slice(0, 3);

  // Generate GeoJSON polygon for High Demand Zone (Guwahati Central) with ~2km radius
  const highDemandZonePolygon = useMemo(() => {
    try {
      return circle([91.78, 26.17], 2.0, { units: 'kilometers', steps: 64 });
    } catch (e) {
      console.error('Error generating circle:', e);
      return null;
    }
  }, []);

  // Landslide Hazard Zone near Jorabat (Meghalaya border junction)
  const jorabatLandslidePolygon = useMemo(() => {
    try {
      return circle([91.8950, 26.1080], 1.6, { units: 'kilometers', steps: 48 });
    } catch (e) {
      return null;
    }
  }, []);

  // Mock POIs for Driver Map
  const mockPois = useMemo(() => [
    // Men at Work
    { id: 'pw-1', type: 'roadwork', name: 'Beltola Flyover Resurfacing', location: [91.7920, 26.1310], desc: 'Girder erection & asphalt repair. Single lane.' },
    { id: 'pw-2', type: 'roadwork', name: 'Airport VIP Road Drain Culvert', location: [91.6250, 26.1400], desc: 'Stormwater trenching. Heavy machinery active.' },
    // Petrol Stations
    { id: 'ps-1', type: 'petrol_station', name: 'IndianOil 24/7 & EV Hub (Garchuk)', location: [91.7080, 26.1240], desc: 'Diesel, Petrol, EV Fast Chargers, Nitrogen.' },
    { id: 'ps-2', type: 'petrol_station', name: 'HP Fuel Center (Six Mile)', location: [91.8120, 26.1320], desc: '24/7 commercial fuel bay & DEF dispenser.' },
    // Hotels
    { id: 'ph-1', type: 'hotel', name: 'Radisson Blu Resort (NH-27)', location: [91.6920, 26.1380], desc: 'Secure transit parking & rest quarters.' },
    { id: 'ph-2', type: 'hotel', name: 'Vivanta Guwahati (GS Road)', location: [91.7820, 26.1480], desc: 'Central city transit hotel & fleet stop.' },
    // Restaurants
    { id: 'pr-1', type: 'restaurant', name: 'Jorabat Highway Family Dhaba', location: [91.8880, 26.1110], desc: '24/7 hot meals, chai, driver lounge & washrooms.' },
    { id: 'pr-2', type: 'restaurant', name: 'Khorikaa Ethnic & Highway Diner', location: [91.7750, 26.1550], desc: 'Fresh meals & rest area along GS Road.' },
  ], []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Red': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400';
      case 'Amber': return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-500/30 dark:text-orange-400';
      case 'Green': return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-500/30 dark:text-green-400';
      default: return 'bg-slate-50 border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Red': return <ShieldAlert className="w-5 h-5" />;
      case 'Amber': return <AlertTriangle className="w-5 h-5" />;
      case 'Green': return <CheckCircle2 className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full overflow-y-auto w-full z-10">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#FAF7F2] font-heading flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4A373]/15 border border-[#D4A373]/30 flex items-center justify-center text-[#E9C46A]">
              <Activity className="w-5 h-5" />
            </div>
            Driver Analytics
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            Guwahati &amp; NER Operations &bull; Real-time traffic, critical alerts, logistics hubs, and high demand heatmaps.
          </p>
        </div>
        <button 
          onClick={onStartTrip}
          disabled={isOnDuty}
          className={cn(
            "px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 active:scale-95",
            isOnDuty 
              ? "bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed shadow-none" 
              : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-emerald-950/60 hover:shadow-emerald-900/80 hover:-translate-y-0.5"
          )}
        >
          <Navigation className="w-5 h-5 text-emerald-100" />
          {isOnDuty ? "Finding Trip..." : "Go On-Duty"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Observational Data & Metrics */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Daily Trips Summary Card with Recharts */}
          <DailyTripsSummaryCard />

          {/* Weather Intelligence */}
          {weather && (
            <div className={cn(
              "p-5 rounded-2xl border backdrop-blur-xl shadow-xl transition-all duration-300",
              weather.travelRiskLevel === 'Red' 
                ? "bg-[#140b0b] border-red-500/40 text-red-300"
                : weather.travelRiskLevel === 'Amber'
                ? "bg-[#161007] border-amber-500/40 text-amber-300"
                : "bg-[#0b140f] border-emerald-500/40 text-emerald-300"
            )}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {getRiskIcon(weather.travelRiskLevel)}
                  <span className="font-bold uppercase tracking-wide text-xs">
                    Travel Risk: {weather.travelRiskLevel}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-bold text-sm text-[#FAF7F2]">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  {weather.temperature}°C
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-zinc-300">
                <div>
                  <div className="flex items-center gap-1.5 opacity-80 mb-1">
                    <CloudRain className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Forecast</span>
                  </div>
                  <p className="text-sm font-semibold text-[#FAF7F2]">{weather.forecast}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{weather.rainfall}mm rain</p>
                  {weather.heavyRainfallWarning && (
                    <span className="inline-block mt-1.5 bg-red-950/80 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-red-500/40">
                      Heavy Rain Warning
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 opacity-80 mb-1">
                    <Wind className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Wind</span>
                  </div>
                  <p className="text-sm font-semibold text-[#FAF7F2]">{weather.windSpeed} km/h</p>
                </div>
              </div>
            </div>
          )}

          {/* Assigned Vehicle Summary */}
          <div className="bg-[#121212] backdrop-blur-xl p-5 rounded-2xl border border-amber-500/20 shadow-xl">
            <div className="text-zinc-400 flex items-center justify-between gap-2 mb-3 border-b border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E9C46A]" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Assigned Vehicle</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">FLEET #492</span>
            </div>
            {assignedVehicle ? (
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="font-bold text-[#FAF7F2] text-base">{assignedVehicle.make} {assignedVehicle.model}</p>
                  <p className="text-xs text-amber-400/90 font-mono mt-1 tracking-wider">{assignedVehicle.licensePlate}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-950/80 text-emerald-400 text-xs font-bold rounded-lg uppercase border border-emerald-500/40">
                  {assignedVehicle.status}
                </span>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 py-2">No vehicle assigned for this shift.</p>
            )}
          </div>
          
          {/* Recent Dispatch Notifications */}
          <div className="bg-[#121212] backdrop-blur-xl p-5 rounded-2xl border border-amber-500/20 shadow-xl flex-1">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#FAF7F2] text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#E9C46A]" />
                  Recent Dispatch Alerts
                </h3>
                {unreadCount > 0 && (
                   <span className="px-2 py-0.5 bg-red-950/80 text-red-400 text-[10px] font-bold rounded-full border border-red-500/40">
                      {unreadCount} new
                   </span>
                )}
             </div>
             <div className="space-y-2.5">
                {recentNotifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className="p-3 rounded-xl bg-[#181818] border border-zinc-800/80 flex gap-3 cursor-pointer hover:bg-[#202020] hover:border-amber-500/30 transition-all" 
                    onClick={onOpenNotifications}
                  >
                     <div className={cn("w-1.5 rounded-full shrink-0", notif.priority === 'Critical' ? 'bg-red-500' : notif.priority === 'High' ? 'bg-orange-500' : 'bg-amber-400')} />
                     <div className="min-w-0 flex-1">
                       <p className="font-bold text-[#FAF7F2] text-xs truncate">{notif.title}</p>
                       <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{notif.message}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>

        </div>

        {/* Right Column: Map Analytics */}
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="bg-[#121212] backdrop-blur-xl rounded-2xl border border-amber-500/20 shadow-2xl p-5 flex flex-col h-[680px]">
            {/* Map Header with Quick Toggle Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-[#E9C46A]" />
                <h3 className="font-bold text-[#FAF7F2] text-sm sm:text-base font-heading">Area Analytics &amp; Map Layers</h3>
              </div>

              {/* Quick Layer Switchers for Driver Map */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Critical Alerts Toggle */}
                <button
                  onClick={() => toggleCriticalAlerts()}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1 border",
                    layers.criticalAlerts 
                      ? "bg-red-600 text-white border-red-500 shadow-red-500/30" 
                      : "bg-[#181818] text-zinc-400 border-zinc-700/60 opacity-60 hover:opacity-100"
                  )}
                  title="Toggle Critical Alerts & Hazards"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Alerts ({layers.criticalAlerts ? 'ON' : 'OFF'})</span>
                </button>

                {/* Petrol Toggle */}
                <button
                  onClick={() => toggleLayer('petrolStations')}
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1",
                    layers.petrolStations
                      ? "bg-cyan-600 text-white border-cyan-500"
                      : "bg-[#181818] text-zinc-400 border-zinc-700/60 opacity-60 hover:opacity-100"
                  )}
                  title="Toggle Petrol Stations"
                >
                  <Fuel className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Petrol</span>
                </button>

                {/* Hotels Toggle */}
                <button
                  onClick={() => toggleLayer('hotels')}
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1",
                    layers.hotels
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-[#181818] text-zinc-400 border-zinc-700/60 opacity-60 hover:opacity-100"
                  )}
                  title="Toggle Hotels"
                >
                  <Hotel className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hotels</span>
                </button>

                {/* Restaurants Toggle */}
                <button
                  onClick={() => toggleLayer('restaurants')}
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1",
                    layers.restaurants
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-[#181818] text-zinc-400 border-zinc-700/60 opacity-60 hover:opacity-100"
                  )}
                  title="Toggle Restaurants"
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Food</span>
                </button>

                {/* Roadwork Toggle */}
                <button
                  onClick={() => toggleLayer('roadwork')}
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1",
                    layers.roadwork
                      ? "bg-amber-500 text-black border-amber-400 font-bold"
                      : "bg-[#181818] text-zinc-400 border-zinc-700/60 opacity-60 hover:opacity-100"
                  )}
                  title="Toggle Roadwork"
                >
                  <HardHat className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Roadwork</span>
                </button>

                {/* High Demand Toggle */}
                <button
                  onClick={() => toggleLayer('highDemandZones')}
                  className={cn(
                    "px-2 py-1 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1",
                    layers.highDemandZones
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-[#181818] text-zinc-400 border-zinc-700/60 opacity-60 hover:opacity-100"
                  )}
                  title="Toggle High Demand Zone"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">High Demand</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 rounded-xl overflow-hidden relative border border-zinc-800/80">
               <BaseMap
                  initialViewState={{
                    longitude: 91.7500,
                    latitude: 26.1350,
                    zoom: 11.2
                  }}
                  attributionControl={false}
                >
                  
                  {/* High Demand Zone Blue Circle Overlay (30% Opacity) */}
                  {layers.highDemandZones && highDemandZonePolygon && (
                    <Source id="high-demand-zone-source" type="geojson" data={highDemandZonePolygon as any}>
                      <Layer
                        id="high-demand-zone-fill"
                        type="fill"
                        paint={{
                          'fill-color': '#3b82f6',
                          'fill-opacity': 0.30 // Exact 30% Transparency
                        }}
                      />
                      <Layer
                        id="high-demand-zone-border"
                        type="line"
                        paint={{
                          'line-color': '#1d4ed8',
                          'line-width': 2,
                          'line-opacity': 0.70,
                          'line-dasharray': [3, 2]
                        }}
                      />
                    </Source>
                  )}

                  {/* Landslide Hazard Zone (near Jorabat NH-6/NH-27 junction) */}
                  {(layers.criticalAlerts || layers.landslideZones || layers.landslides) && jorabatLandslidePolygon && (
                    <Source id="jorabat-landslide-zone-source" type="geojson" data={jorabatLandslidePolygon as any}>
                      <Layer
                        id="jorabat-landslide-zone-fill"
                        type="fill"
                        paint={{
                          'fill-color': '#dc2626',
                          'fill-opacity': 0.30
                        }}
                      />
                      <Layer
                        id="jorabat-landslide-zone-border"
                        type="line"
                        paint={{
                          'line-color': '#991b1b',
                          'line-width': 2.5,
                          'line-opacity': 0.85,
                          'line-dasharray': [4, 2]
                        }}
                      />
                    </Source>
                  )}
                  
                  {/* Mock Incident & Accident Markers in Guwahati (Controlled by Critical Alerts toggle) */}
                  {(layers.criticalAlerts || layers.accidents || layers.landslides || layers.floods || layers.roadClosures) && mockIncidents.map((incident) => {
                    const isAccident = incident.type === 'accident';
                    if (isAccident && !layers.criticalAlerts && !layers.accidents) return null;
                    return (
                      <Marker 
                        key={incident.id} 
                        longitude={incident.location[0]} 
                        latitude={incident.location[1]}
                        anchor="bottom"
                        onClick={(e) => {
                          e.originalEvent.stopPropagation();
                          setSelectedEntity({ ...incident, category: 'incident' });
                        }}
                      >
                        <div className="flex flex-col items-center cursor-pointer group hover:scale-110 transition-transform">
                          {isAccident ? (
                            <div className="relative flex items-center justify-center">
                              <div className="absolute -inset-1 bg-red-500/40 rounded-full animate-ping" />
                              <div className="relative bg-red-600 text-white p-2 rounded-full shadow-lg border-2 border-white flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4 text-white" />
                              </div>
                              <span className="absolute -bottom-5 whitespace-nowrap bg-red-950/90 text-red-200 text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-red-500/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                Accident Alert
                              </span>
                            </div>
                          ) : (
                            <div className="relative flex items-center justify-center">
                              <div className={cn(
                                "p-2 rounded-full shadow-lg text-white border-2 border-white flex items-center justify-center",
                                incident.severity === 'critical' ? 'bg-red-600 animate-pulse' : 'bg-orange-500'
                              )}>
                                <ShieldAlert className="w-4 h-4 text-white" />
                              </div>
                              <span className="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                {incident.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </Marker>
                    );
                  })}

                  {/* POI Markers: Petrol Stations, Hotels, Restaurants, Men at Work */}
                  {mockPois.map((poi) => {
                    const isRoadwork = poi.type === 'roadwork';
                    const isPetrol = poi.type === 'petrol_station';
                    const isHotel = poi.type === 'hotel';
                    const isRestaurant = poi.type === 'restaurant';

                    if (isRoadwork && !layers.roadwork) return null;
                    if (isPetrol && !layers.petrolStations) return null;
                    if (isHotel && !layers.hotels) return null;
                    if (isRestaurant && !layers.restaurants) return null;

                    return (
                      <Marker
                        key={poi.id}
                        longitude={poi.location[0]}
                        latitude={poi.location[1]}
                        anchor="bottom"
                        onClick={(e) => {
                          e.originalEvent.stopPropagation();
                          setSelectedEntity({ ...poi, category: 'poi' });
                        }}
                      >
                        <div className="cursor-pointer group hover:scale-110 transition-transform">
                          {isRoadwork && (
                            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-md">
                              <HardHat className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {isPetrol && (
                            <div className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center border-2 border-white shadow-md">
                              <Fuel className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {isHotel && (
                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center border-2 border-white shadow-md">
                              <Hotel className="w-3.5 h-3.5" />
                            </div>
                          )}
                          {isRestaurant && (
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-md">
                              <Utensils className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </Marker>
                    );
                  })}

                  {/* High Demand Zone Tag Marker (Guwahati Central / Zoo Road) */}
                  {layers.highDemandZones && (
                    <Marker longitude={91.78} latitude={26.17} anchor="center">
                       <div className="bg-blue-600/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-blue-400/40 select-none pointer-events-none">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
                          High Demand Zone
                       </div>
                    </Marker>
                  )}

                  {/* Landslide Hazard Zone Tag Marker (Jorabat) */}
                  {(layers.criticalAlerts || layers.landslideZones || layers.landslides) && (
                    <Marker longitude={91.8950} latitude={26.1080} anchor="center">
                       <div className="bg-red-600/35 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-red-400/40 select-none pointer-events-none">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-200" />
                          Landslide Hazard (Jorabat)
                       </div>
                    </Marker>
                  )}

                  {/* Hub Alpha Marker (Garchuk / Jalukbari Corridor - House Sign 🏠) */}
                  {layers.warehouses && (
                    <Marker 
                      longitude={91.7000} 
                      latitude={26.1200} 
                      anchor="center"
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedEntity({
                          name: 'Hub Alpha (Garchuk Depot 🏠)',
                          type: 'warehouse',
                          category: 'hub',
                          desc: 'Primary West Logistics Hub & Dispatch Center with 18 active vehicles and cold storage.'
                        });
                      }}
                    >
                       <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl shadow-emerald-500/40 flex items-center gap-1.5 border-2 border-emerald-200 cursor-pointer hover:scale-105 transition-transform">
                          <Home className="w-3.5 h-3.5 text-emerald-100" />
                          Hub Alpha (Garchuk 🏠)
                       </div>
                    </Marker>
                  )}

                  {/* Hub Beta Marker (Six Mile Logistics Center - House Sign 🏠) */}
                  {layers.warehouses && (
                    <Marker 
                      longitude={91.8150} 
                      latitude={26.1350} 
                      anchor="center"
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedEntity({
                          name: 'Hub Beta (Six Mile Logistics 🏠)',
                          type: 'warehouse',
                          category: 'hub',
                          desc: 'Secondary East Logistics Hub & Emergency Center serving Dispur and East Guwahati.'
                        });
                      }}
                    >
                       <div className="bg-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl shadow-blue-500/40 flex items-center gap-1.5 border-2 border-blue-200 cursor-pointer hover:scale-105 transition-transform">
                          <Home className="w-3.5 h-3.5 text-blue-100" />
                          Hub Beta (Six Mile 🏠)
                       </div>
                    </Marker>
                  )}

                  {/* Selected Entity / Incident / POI Popup */}
                  {selectedEntity && (
                    <Popup
                      longitude={selectedEntity.location ? selectedEntity.location[0] : selectedEntity.name?.includes('Alpha') ? 91.7000 : 91.8150}
                      latitude={selectedEntity.location ? selectedEntity.location[1] : selectedEntity.name?.includes('Alpha') ? 26.1200 : 26.1350}
                      anchor="top"
                      onClose={() => setSelectedEntity(null)}
                      closeOnClick={false}
                      className="z-50"
                    >
                      <div className="p-2 max-w-xs text-slate-800 dark:text-slate-100">
                        <div className="flex items-center justify-between gap-1.5 font-bold text-xs uppercase mb-1">
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-200">
                            {selectedEntity.type?.replace('_', ' ').toUpperCase()}
                          </span>
                          {selectedEntity.severity && (
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded font-bold uppercase",
                              selectedEntity.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300'
                            )}>
                              {selectedEntity.severity}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                          {selectedEntity.name || selectedEntity.title || selectedEntity.description}
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {selectedEntity.desc || selectedEntity.description}
                        </p>
                      </div>
                    </Popup>
                  )}
                </BaseMap>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
