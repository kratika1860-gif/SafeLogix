import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Package, AlertTriangle, ShieldAlert, Navigation, CloudLightning, Database, Activity, Map as MapIcon, BarChart2, LayoutDashboard, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchWithAuth } from '../../lib/api';
import { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import BaseMap from '../../components/map/BaseMap';
import 'maplibre-gl/dist/maplibre-gl.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

import { useAppStore } from '../../store/useAppStore';
import { mockVehicles, mockIncidents } from '../../data/mockMapData';

function StatCard({ title, value, icon, trend, alert = false }: { title: string, value: string | number, icon: React.ReactNode, trend?: string, alert?: boolean }) {
  return (
    <div className={cn(
      "bg-[#27272A]/80 backdrop-blur-xl rounded-2xl p-5 border shadow-xl hover:-translate-y-0.5 transition-all duration-300",
      alert ? "border-red-500/30 shadow-red-950/20" : "border-[#D4A373]/20 shadow-black/40"
    )}>
      <div className="flex justify-between items-start mb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">{title}</h3>
        <div className={cn(
          "p-2 rounded-xl border",
          alert ? "bg-red-950/40 text-red-400 border-red-500/30" : "bg-[#D4A373]/15 text-[#E9C46A] border-[#D4A373]/30"
        )}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-heading font-extrabold text-[#FAF7F2]">{value}</p>
        {trend && (
          <span className="text-[11px] font-semibold text-zinc-400 mb-0.5">{trend}</span>
        )}
      </div>
    </div>
  );
}

// Mock Analytics Data
const mockDistrictData = [
  { name: 'Northern Highlands', alerts: 14 },
  { name: 'Central Valley', alerts: 8 },
  { name: 'Eastern Seaboard', alerts: 25 },
  { name: 'Western Ridge', alerts: 10 },
  { name: 'Southern Delta', alerts: 18 }
];

const mockTimeData = [
  { time: '00:00', alerts: 2 },
  { time: '04:00', alerts: 1 },
  { time: '08:00', alerts: 12 },
  { time: '12:00', alerts: 8 },
  { time: '16:00', alerts: 22 },
  { time: '20:00', alerts: 15 }
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { theme } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'sos_analytics'>('overview');
  const [stats, setStats] = React.useState<any>({
    activeVehicles: 142,
    activeDeliveries: 86,
    delayedDeliveries: 14,
    blockedRoutes: 3,
    openIncidents: 24,
    emergencyEvents: 2,
    criticalWeather: 1,
    districtAccess: "92%"
  });

  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    fetchWithAuth('/api/admin/stats')
      .then((data) => {
        if (data && data.activeVehicles !== undefined) {
          setStats(data);
        }
      })
      .catch((err) => {
        console.warn('Using initial dashboard stats:', err);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#FAF7F2] tracking-tight">Command Center</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">Real-time overview of national operations & active crisis logistics</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-[#D4A373]/15 border border-[#D4A373]/30 text-[#E9C46A] rounded-full text-xs font-bold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9C46A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9C46A]"></span>
            </span>
            Live Telemetry Online
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-1">
        <button 
          onClick={() => setActiveTab('overview')}
          className={cn(
            "px-4 py-2 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2",
            activeTab === 'overview' 
              ? "border-[#E9C46A] text-[#E9C46A] bg-[#D4A373]/10" 
              : "border-transparent text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
          )}
        >
          <LayoutDashboard className="w-4 h-4" /> Operations Overview
        </button>
        <button 
          onClick={() => setActiveTab('sos_analytics')}
          className={cn(
            "px-4 py-2 font-bold text-xs sm:text-sm rounded-t-xl transition-all border-b-2 flex items-center gap-2",
            activeTab === 'sos_analytics' 
              ? "border-red-400 text-red-400 bg-red-950/20" 
              : "border-transparent text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
          )}
        >
          <BarChart2 className="w-4 h-4" /> SOS Incident Trends
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Vehicles" value={stats.activeVehicles} icon={<Truck className="w-4 h-4" />} trend="+12 this hour" />
            <StatCard title="Active Deliveries" value={stats.activeDeliveries} icon={<Package className="w-4 h-4" />} trend="89% on time" />
            <StatCard title="Delayed Deliveries" value={stats.delayedDeliveries} icon={<AlertTriangle className="w-4 h-4" />} alert={true} trend="Weather related" />
            <StatCard title="Blocked Routes" value={stats.blockedRoutes} icon={<Navigation className="w-4 h-4" />} alert={true} trend="Re-routing active" />
            
            <StatCard title="Open Incidents" value={stats.openIncidents} icon={<ShieldAlert className="w-4 h-4" />} alert={true} />
            <StatCard title="Emergency Events" value={stats.emergencyEvents} icon={<Activity className="w-4 h-4" />} alert={true} />
            <StatCard title="Critical Weather" value={stats.criticalWeather} icon={<CloudLightning className="w-4 h-4" />} alert={true} trend="Typhoon Warning" />
            <StatCard title="District Access" value={stats.districtAccess} icon={<MapIcon className="w-4 h-4" />} trend="3 districts isolated" />
          </div>

          <div className="bg-[#27272A]/80 backdrop-blur-xl rounded-2xl shadow-xl border border-[#D4A373]/20 overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#18181B]/80">
              <h3 className="font-heading font-bold text-sm text-[#FAF7F2] flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-[#E9C46A]" />
                Live Operations Map
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-[#E9C46A]"></span> Vehicles
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span> Incidents
                </div>
              </div>
            </div>
            <div className="flex-1 w-full bg-[#18181B] relative">
              <BaseMap
                ref={mapRef}
                initialViewState={{
                  longitude: 91.7362,
                  latitude: 26.1445,
                  zoom: 11
                }}
              >
                {/* Vehicles Markers */}
                {mockVehicles.map((vehicle) => (
                  <Marker
                    key={vehicle.id}
                    longitude={vehicle.location[0]}
                    latitude={vehicle.location[1]}
                    anchor="center"
                  >
                    <div className="group cursor-pointer">
                      <div className="bg-[#D4A373] p-1.5 rounded-full shadow-lg border-2 border-[#18181B]">
                        <Truck className="w-3 h-3 text-[#18181B]" />
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-36 bg-[#18181B] text-[#FAF7F2] border border-[#D4A373]/30 text-xs p-2.5 rounded-xl shadow-2xl z-50 pointer-events-none">
                        <p className="font-bold text-[#E9C46A]">{vehicle.type}</p>
                        <p className="text-[11px] text-zinc-300">{vehicle.id}</p>
                        <p className="text-[11px] text-zinc-400">Driver: {vehicle.driver}</p>
                        <p className="text-[11px] text-zinc-400">Status: {vehicle.status}</p>
                        <p className="text-[11px] text-zinc-400">Load: {vehicle.load}</p>
                      </div>
                    </div>
                  </Marker>
                ))}

                {/* Incidents Markers */}
                {mockIncidents.map((incident) => (
                  <Marker
                    key={incident.id}
                    longitude={incident.location[0]}
                    latitude={incident.location[1]}
                    anchor="center"
                  >
                    <div className="group cursor-pointer">
                      <div className="bg-red-500 p-1.5 rounded-full shadow-lg border-2 border-[#18181B] animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </Marker>
                ))}
              </BaseMap>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#27272A]/80 backdrop-blur-xl rounded-2xl p-5 border border-[#D4A373]/20 shadow-xl">
              <h3 className="font-heading font-bold text-sm text-[#FAF7F2] mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E9C46A]" />
                Recent Incidents & Alerts
              </h3>
              <div className="space-y-3">
                {[
                  { time: '10 mins ago', msg: 'Landslide reported on Route 42. Road fully blocked.', type: 'critical' },
                  { time: '25 mins ago', msg: 'Vehicle V-881 delayed due to heavy flooding.', type: 'warning' },
                  { time: '1 hr ago', msg: 'Emergency medical supply delivered successfully to Zone C.', type: 'info' }
                ].map((alert, i) => (
                  <div key={i} className="flex gap-3 p-3 rounded-xl border border-zinc-800 bg-[#18181B]/70">
                    <div className={cn(
                      "w-2 h-2 mt-1.5 rounded-full shrink-0", 
                      alert.type === 'critical' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-[#E9C46A]' : 'bg-[#D4A373]'
                    )} />
                    <div>
                      <p className="text-xs font-semibold text-[#FAF7F2]">{alert.msg}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#27272A]/80 backdrop-blur-xl rounded-2xl p-5 border border-[#D4A373]/20 shadow-xl">
              <h3 className="font-heading font-bold text-sm text-[#FAF7F2] mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#E9C46A]" />
                System Health & Intelligence
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-zinc-400">Risk Engine Processing</span>
                    <span className="font-bold text-emerald-400">Optimal</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-zinc-400">GPS Sync Queue</span>
                    <span className="font-bold text-[#E9C46A]">142 pending</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-[#D4A373] h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-zinc-400">Route API Latency</span>
                    <span className="font-bold text-[#E9C46A]">142ms</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div className="bg-[#E9C46A] h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-[#27272A]/80 backdrop-blur-xl rounded-2xl p-5 border border-[#D4A373]/20 shadow-xl flex flex-col h-[420px]">
            <h3 className="font-heading font-bold text-sm text-[#FAF7F2] mb-1.5 flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-red-400" />
              SOS Frequency by District
            </h3>
            <p className="text-xs text-zinc-400 mb-4">Total volume of SOS alerts generated per district over the last 30 days.</p>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockDistrictData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                  <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} angle={-35} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', border: '1px solid rgba(212, 163, 115, 0.3)', color: '#FAF7F2' }}
                    itemStyle={{ color: '#E9C46A', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="alerts" fill="#E9C46A" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#27272A]/80 backdrop-blur-xl rounded-2xl p-5 border border-[#D4A373]/20 shadow-xl flex flex-col h-[420px]">
            <h3 className="font-heading font-bold text-sm text-[#FAF7F2] mb-1.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A373]" />
              SOS Incidents by Time of Day
            </h3>
            <p className="text-xs text-zinc-400 mb-4">Identify peak hours for emergencies to optimize shift patterns.</p>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" />
                  <XAxis dataKey="time" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181B', borderRadius: '12px', border: '1px solid rgba(212, 163, 115, 0.3)', color: '#FAF7F2' }}
                    itemStyle={{ color: '#D4A373', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="alerts" stroke="#D4A373" strokeWidth={3} dot={{ r: 4, fill: '#E9C46A', strokeWidth: 2, stroke: '#18181B' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
