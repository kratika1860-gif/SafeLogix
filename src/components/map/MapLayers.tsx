import React, { useState, useEffect } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { 
  Layers, ChevronUp, ChevronDown, Filter, X, AlertTriangle, 
  Fuel, Hotel, Utensils, HardHat, CheckCircle2, ShieldAlert, 
  Eye, EyeOff, Sparkles, MapPin, RefreshCw, Wifi, WifiOff, Activity
} from 'lucide-react';

export default function MapLayers() {
  const { 
    layers, toggleLayer, toggleCriticalAlerts, togglePois, setLayers,
    filters, setFilter, resetFilters 
  } = useMapStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'layers' | 'filters'>('layers');
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(Date.now());

  useEffect(() => {
    setIsOnline(typeof window !== 'undefined' ? navigator.onLine : true);
    const handleOnline = () => { setIsOnline(true); setLastSync(Date.now()); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(() => {
      if (navigator.onLine) setLastSync(Date.now());
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const timeDiff = Math.floor((Date.now() - lastSync) / 1000);
  const isStale = isOnline && timeDiff > 60;

  const allCriticalActive = layers.criticalAlerts || (layers.accidents && layers.landslides && layers.landslideZones);
  const allPoisActive = layers.petrolStations && layers.hotels && layers.restaurants && layers.roadwork;

  const handleTurnAllOn = () => {
    setLayers({
      warehouses: true,
      deliveryLocations: true,
      checkpoints: true,
      vehicles: true,
      roadwork: true,
      petrolStations: true,
      hotels: true,
      restaurants: true,
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
      weatherRisk: true,
      highRiskCorridors: true,
      routes: true,
    });
  };

  const handleTurnAllOff = () => {
    setLayers({
      warehouses: false,
      deliveryLocations: false,
      checkpoints: false,
      vehicles: false,
      roadwork: false,
      petrolStations: false,
      hotels: false,
      restaurants: false,
      criticalAlerts: false,
      accidents: false,
      landslides: false,
      landslideZones: false,
      floods: false,
      waterlogging: false,
      roadDamage: false,
      bridgeDamage: false,
      roadClosures: false,
      highDemandZones: false,
      roadAccessibility: false,
      weatherRisk: false,
      highRiskCorridors: false,
      routes: false,
    });
  };

  return (
    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex flex-col items-end pointer-events-auto">
      {/* Sideways Right Vertical Control Dock - Transparent Glassmorphism */}
      <div className="flex flex-col gap-2 p-2 bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 w-44 sm:w-48 text-zinc-100 transition-all">
        
        {/* Live Sync Telemetry Badge Header */}
        <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
          !isOnline 
            ? "bg-red-950/40 text-red-300 border-red-800/50" 
            : isStale 
              ? "bg-amber-950/40 text-amber-300 border-amber-800/50"
              : "bg-black/20 text-emerald-400 border-white/10"
        }`}>
          <div className="flex items-center gap-1.5">
            {!isOnline ? (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            ) : isStale ? (
              <Activity className="w-3.5 h-3.5 text-amber-400 opacity-60" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{!isOnline ? 'Offline' : isStale ? 'Stale' : 'Live Sync'}</span>
          </div>
          <span className={`w-2 h-2 rounded-full ${!isOnline ? 'bg-red-500' : isStale ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
        </div>

        {/* Quick Button: Critical Alerts */}
        <button
          onClick={() => toggleCriticalAlerts()}
          className={`w-full px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
            layers.criticalAlerts
              ? 'bg-red-600/80 text-white border-red-400/80 shadow-lg shadow-red-900/30'
              : 'bg-black/20 text-zinc-300 border-white/10 hover:bg-white/10'
          }`}
          title="Toggle All Critical Alerts & Hazard Warnings"
        >
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {layers.criticalAlerts && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${layers.criticalAlerts ? 'bg-white' : 'bg-red-500'}`}></span>
            </span>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Critical Alerts</span>
          </div>
          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/50 font-mono">
            {layers.criticalAlerts ? 'ON' : 'OFF'}
          </span>
        </button>

        <div className="h-px bg-white/10 my-0.5" />

        {/* Section Label */}
        <div className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>Quick POI Layers</span>
        </div>

        {/* Quick POI Toggles 2-Column Grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {/* Petrol */}
          <button
            onClick={() => toggleLayer('petrolStations')}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              layers.petrolStations
                ? 'bg-cyan-600/80 text-white border-cyan-400/80 shadow-md shadow-cyan-900/20'
                : 'bg-black/20 text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Petrol & Fuel Stations"
          >
            <Fuel className="w-3.5 h-3.5 text-cyan-300" />
            <span>Petrol</span>
          </button>

          {/* Hotels */}
          <button
            onClick={() => toggleLayer('hotels')}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              layers.hotels
                ? 'bg-indigo-600/80 text-white border-indigo-400/80 shadow-md shadow-indigo-900/20'
                : 'bg-black/20 text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Hotels & Lodging"
          >
            <Hotel className="w-3.5 h-3.5 text-indigo-300" />
            <span>Hotels</span>
          </button>

          {/* Dhabas */}
          <button
            onClick={() => toggleLayer('restaurants')}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              layers.restaurants
                ? 'bg-emerald-600/80 text-white border-emerald-400/80 shadow-md shadow-emerald-900/20'
                : 'bg-black/20 text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Restaurants & Dhabas"
          >
            <Utensils className="w-3.5 h-3.5 text-emerald-300" />
            <span>Dhabas</span>
          </button>

          {/* Roadwork */}
          <button
            onClick={() => toggleLayer('roadwork')}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 border ${
              layers.roadwork
                ? 'bg-amber-500/80 text-white border-amber-300/80 shadow-md shadow-amber-900/20'
                : 'bg-black/20 text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
            title="Toggle Roadwork & Men at Work"
          >
            <HardHat className="w-3.5 h-3.5 text-amber-300" />
            <span>Works</span>
          </button>
        </div>

        <div className="h-px bg-white/10 my-0.5" />

        {/* Menu & Filter Triggers */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => { setIsOpen(true); setActiveTab('filters'); }}
            className={`p-2 rounded-xl transition-all border flex items-center justify-center ${
              isOpen && activeTab === 'filters'
                ? 'bg-blue-600/80 text-white border-blue-400/80'
                : 'bg-black/20 text-zinc-300 border-white/10 hover:bg-white/10'
            }`}
            title="Filter Incidents & Data"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => { setIsOpen(!isOpen); setActiveTab('layers'); }}
            className={`flex-1 px-2.5 py-1.5 rounded-xl transition-all flex items-center justify-between border ${
              isOpen 
                ? 'bg-blue-600/80 text-white border-blue-400/80' 
                : 'bg-black/20 text-zinc-200 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-bold text-xs">All Layers</span>
            </div>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
        </div>
      </div>

      {/* Expanded Layer & Filter Panel - Positioned to the left of dock on desktop */}
      {isOpen && (
        <div className="mt-2 sm:mt-0 sm:absolute sm:right-52 sm:top-0 w-84 sm:w-96 bg-zinc-900/85 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/10 text-zinc-100 flex flex-col max-h-[calc(100vh-120px)] animate-in fade-in slide-in-from-right-2 z-40">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-zinc-800 bg-zinc-900/90 rounded-t-2xl">
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('layers')} 
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'layers' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Layers & Overlays
              </button>
              <button 
                onClick={() => setActiveTab('filters')} 
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'filters' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                Filters
              </button>
            </div>

            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="overflow-y-auto p-4 space-y-5 text-slate-800 dark:text-slate-200">
            {activeTab === 'layers' && (
              <>
                {/* 1. CRITICAL ALERTS & HAZARDS (MASTER TOGGLE) */}
                <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-sm">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-red-900 dark:text-red-300 uppercase tracking-wider">
                          🚨 Critical Alerts & Hazards
                        </h4>
                        <p className="text-[11px] text-red-700/80 dark:text-red-400/80">Master toggle for emergency events</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCriticalAlerts()}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
                        layers.criticalAlerts
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {layers.criticalAlerts ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Sub items */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-red-200/60 dark:border-red-900/40">
                    {[
                      { id: 'landslideZones', label: 'Landslide Zones', icon: '⛰️' },
                      { id: 'accidents', label: 'Accidents', icon: '💥' },
                      { id: 'landslides', label: 'Landslide Alerts', icon: '⚠️' },
                      { id: 'floods', label: 'Flash Floods', icon: '🌊' },
                      { id: 'waterlogging', label: 'Waterlogging', icon: '💧' },
                      { id: 'roadClosures', label: 'Road Closures', icon: '🚫' },
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(layers[item.id as keyof typeof layers])}
                          onChange={() => toggleLayer(item.id as keyof typeof layers)}
                          className="rounded text-red-600 focus:ring-red-500"
                        />
                        <span>{item.icon} {item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. POINTS OF INTEREST & AMENITIES */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          🏪 Amenities & Points of Interest
                        </h4>
                        <p className="text-[11px] text-slate-500">Fuel, food, hotels, road crews</p>
                      </div>
                    </div>
                    <button
                      onClick={() => togglePois()}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors border ${
                        allPoisActive
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {allPoisActive ? 'All On' : 'Toggle All'}
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-xs">🍽️</span>
                        Restaurants & Highway Dhabas
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.restaurants}
                        onChange={() => toggleLayer('restaurants')}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center text-xs">🏨</span>
                        Hotels & Transit Lodges
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.hotels}
                        onChange={() => toggleLayer('hotels')}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center text-xs">⛽</span>
                        Petrol & EV Stations (24/7)
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.petrolStations}
                        onChange={() => toggleLayer('petrolStations')}
                        className="rounded text-cyan-600 focus:ring-cyan-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center text-xs">🚧</span>
                        Men at Work / Road Repairs
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.roadwork}
                        onChange={() => toggleLayer('roadwork')}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. DEMAND & INTELLIGENCE */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    📍 Demand & Intelligence Overlays
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xs">📍</span>
                        High Demand Zone
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.highDemandZones}
                        onChange={() => toggleLayer('highDemandZones')}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xs">⚡</span>
                        High-Risk Corridors
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.highRiskCorridors}
                        onChange={() => toggleLayer('highRiskCorridors')}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xs">🛣️</span>
                        Active Logistics Routes
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.routes}
                        onChange={() => toggleLayer('routes')}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-xs">🚑</span>
                        Priority Emergency Corridors
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.emergencyRoutes}
                        onChange={() => toggleLayer('emergencyRoutes')}
                        className="rounded text-red-600 focus:ring-red-500"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center text-xs">🌧️</span>
                        Weather Risk & Radar
                      </span>
                      <input
                        type="checkbox"
                        checked={layers.weatherRisk}
                        onChange={() => toggleLayer('weatherRisk')}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>

                {/* 4. LOGISTICS & HUBS */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    🏠 Logistics & Fleet
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'warehouses', label: 'Hubs (Alpha/Beta)', icon: '🏠' },
                      { id: 'vehicles', label: 'Active Fleet', icon: '🚚' },
                      { id: 'deliveryLocations', label: 'Delivery Spots', icon: '📦' },
                      { id: 'checkpoints', label: 'Checkpoints', icon: '🛡️' },
                    ].map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(layers[item.id as keyof typeof layers])}
                          onChange={() => toggleLayer(item.id as keyof typeof layers)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>{item.icon} {item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleTurnAllOn}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Turn All On
                  </button>
                  <button
                    onClick={handleTurnAllOff}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <EyeOff className="w-3.5 h-3.5" /> Turn All Off
                  </button>
                </div>
              </>
            )}

            {activeTab === 'filters' && (
              <div className="space-y-5 text-slate-700 dark:text-slate-300">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Alert Severity</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['low', 'medium', 'high', 'critical'].map(sev => (
                      <label key={sev} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(filters.severity as any)[sev]} 
                          onChange={(e) => setFilter('severity', sev, e.target.checked)} 
                          className="rounded text-blue-600" 
                        />
                        <span className="text-xs capitalize font-medium">{sev}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['active', 'resolved', 'verified', 'underReview'].map(st => (
                      <label key={st} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={(filters.status as any)[st]} 
                          onChange={(e) => setFilter('status', st, e.target.checked)} 
                          className="rounded text-blue-600" 
                        />
                        <span className="text-xs capitalize font-medium">{st.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time Window</h4>
                  <select 
                    className="w-full p-2 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900"
                    value={filters.time}
                    onChange={(e) => setFilter('time', '', e.target.value)}
                  >
                    <option value="live">Live Only (Real-Time)</option>
                    <option value="1h">Last 1 Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <button 
                  onClick={resetFilters} 
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

