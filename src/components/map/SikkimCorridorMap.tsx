import React, { useState, useRef, useMemo } from 'react';
import Map, { NavigationControl, FullscreenControl, Source, Layer, Marker, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  AlertTriangle, ShieldAlert, Mountain, MapPin, 
  Layers, Info, Compass, CheckCircle2, Phone, ExternalLink, X, Navigation2, Truck
} from 'lucide-react';
import { 
  SIKKIM_HISTORICAL_EVENTS, 
  SIKKIM_CORRIDOR_CHOKEPOINTS, 
  SIKKIM_NH10_ROUTE_GEOJSON,
  LandslideHistoricalEvent,
  CorridorChokepoint
} from '../../data/sikkimRealCorridor';
import { OPENFREEMAP_LIBERTY } from '../../config/map.config';

interface SikkimCorridorMapProps {
  statusColor?: string;
  totalRiskIndex?: number;
  selectedEventId?: string | null;
  onSelectEvent?: (event: LandslideHistoricalEvent | null) => void;
  showHistoricalLandslides?: boolean;
  showChokepoints?: boolean;
  shortestRouteGeoJSON?: any;
  saferRouteGeoJSON?: any;
  vehiclePosition?: [number, number] | null; // [lon, lat]
  vehicleTelemetry?: {
    speedKmh: number;
    altitudeM: number;
    currentRisk: number;
    status: string;
  } | null;
}

export default function SikkimCorridorMap({
  statusColor = '#10b981',
  totalRiskIndex = 25,
  selectedEventId,
  onSelectEvent,
  showHistoricalLandslides = true,
  showChokepoints = true,
  shortestRouteGeoJSON,
  saferRouteGeoJSON,
  vehiclePosition,
  vehicleTelemetry
}: SikkimCorridorMapProps) {
  const mapRef = useRef<MapRef>(null);

  const [activeModalEvent, setActiveModalEvent] = useState<LandslideHistoricalEvent | null>(null);
  const [activeModalChokepoint, setActiveModalChokepoint] = useState<CorridorChokepoint | null>(null);
  const [routeLayerVisibility, setRouteLayerVisibility] = useState<'both' | 'safer' | 'shortest'>('both');

  // Initial view centered on the middle of NH-10 between Rangpo and Gangtok
  const initialViewState = {
    longitude: 88.568,
    latitude: 27.253,
    zoom: 11.2,
    pitch: 35,
    bearing: -15
  };

  // Base corridor route styling
  const corridorLineStyle: any = useMemo(() => ({
    id: 'sikkim-nh10-route',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': statusColor,
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 14, 6],
      'line-opacity': 0.7
    }
  }), [statusColor]);

  // Shortest Route Styling (Dashed Purple)
  const shortestLineStyle: any = useMemo(() => ({
    id: 'shortest-route-line',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#a855f7',
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 14, 7],
      'line-dasharray': [2, 2],
      'line-opacity': 0.95
    }
  }), []);

  // Risk-Aware Safer Route Styling (Glowing Cyan/Emerald)
  const safeLineStyle: any = useMemo(() => ({
    id: 'safer-route-line',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#06b6d4',
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 14, 9],
      'line-opacity': 0.95
    }
  }), []);

  const safeGlowStyle: any = useMemo(() => ({
    id: 'safer-route-glow',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#06b6d4',
      'line-width': ['interpolate', ['linear'], ['zoom'], 10, 9, 14, 16],
      'line-opacity': 0.4,
      'line-blur': 4
    }
  }), []);

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={OPENFREEMAP_LIBERTY}
        attributionControl={false}
        className="w-full h-full"
      >
        <NavigationControl position="top-right" showCompass={true} />
        <FullscreenControl position="top-right" />

        {/* NH-10 Base Geometry */}
        <Source id="nh10-source" type="geojson" data={SIKKIM_NH10_ROUTE_GEOJSON as any}>
          <Layer {...corridorLineStyle} />
        </Source>

        {/* Shortest Route GeoJSON (Dashed Purple) */}
        {shortestRouteGeoJSON && (routeLayerVisibility === 'both' || routeLayerVisibility === 'shortest') && (
          <Source id="shortest-route-source" type="geojson" data={shortestRouteGeoJSON}>
            <Layer {...shortestLineStyle} />
          </Source>
        )}

        {/* Risk-Aware Safer Route GeoJSON (Glowing Cyan) */}
        {saferRouteGeoJSON && (routeLayerVisibility === 'both' || routeLayerVisibility === 'safer') && (
          <Source id="safer-route-source" type="geojson" data={saferRouteGeoJSON}>
            <Layer {...safeGlowStyle} />
            <Layer {...safeLineStyle} />
          </Source>
        )}

        {/* RANGPO CORRIDOR START MARKER */}
        <Marker longitude={88.5292} latitude={27.1720} anchor="bottom">
          <div className="group relative flex flex-col items-center cursor-pointer">
            <div className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-lg flex items-center gap-1 border border-emerald-400/40">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              <span>RANGPO (312m)</span>
            </div>
            <div className="w-0.5 h-3 bg-emerald-500"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-zinc-950 shadow"></div>
          </div>
        </Marker>

        {/* GANGTOK CORRIDOR END MARKER */}
        <Marker longitude={88.6083} latitude={27.3341} anchor="bottom">
          <div className="group relative flex flex-col items-center cursor-pointer">
            <div className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-bold shadow-lg flex items-center gap-1 border border-indigo-400/40">
              <Mountain className="w-3 h-3" />
              <span>GANGTOK (1,600m)</span>
            </div>
            <div className="w-0.5 h-3 bg-indigo-500"></div>
            <div className="w-3 h-3 rounded-full bg-indigo-400 border-2 border-zinc-950 shadow"></div>
          </div>
        </Marker>

        {/* SINGTAM TRANSIT JUNCTION */}
        <Marker longitude={88.4988} latitude={27.2344} anchor="center">
          <div className="px-2 py-0.5 rounded bg-zinc-900/90 text-amber-300 text-[10px] font-mono font-semibold border border-amber-500/30 flex items-center gap-1 shadow">
            <span>Singtam (460m)</span>
          </div>
        </Marker>

        {/* CHOKEPOINT MARKERS */}
        {showChokepoints && SIKKIM_CORRIDOR_CHOKEPOINTS.map(cp => (
          <Marker 
            key={cp.id} 
            longitude={cp.coords[0]} 
            latitude={cp.coords[1]}
            anchor="center"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setActiveModalChokepoint(cp);
              setActiveModalEvent(null);
            }}
          >
            <button className="group relative p-1.5 rounded-full bg-amber-500 text-zinc-950 hover:scale-125 transition-transform shadow-lg border-2 border-zinc-900 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 fill-current" />
              <div className="absolute bottom-full mb-1 hidden group-hover:flex whitespace-nowrap px-2 py-1 bg-zinc-900 text-amber-300 text-[10px] font-semibold rounded shadow-xl border border-zinc-800 z-50">
                Chokepoint: {cp.name}
              </div>
            </button>
          </Marker>
        ))}

        {/* REAL NASA GLC HISTORICAL LANDSLIDE EVENTS */}
        {showHistoricalLandslides && SIKKIM_HISTORICAL_EVENTS.map(evt => (
          <Marker
            key={evt.eventId}
            longitude={evt.longitude}
            latitude={evt.latitude}
            anchor="center"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setActiveModalEvent(evt);
              setActiveModalChokepoint(null);
              if (onSelectEvent) onSelectEvent(evt);
            }}
          >
            <button className={`group relative p-1.5 rounded-full transition-transform hover:scale-125 shadow-lg border-2 border-zinc-950 ${
              evt.rain24h > 35 ? 'bg-rose-600 text-white animate-pulse' : 'bg-red-500 text-white'
            }`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              <div className="absolute bottom-full mb-1 hidden group-hover:flex whitespace-nowrap px-2 py-1 bg-zinc-900 text-rose-300 text-[10px] font-mono rounded shadow-xl border border-zinc-800 z-50">
                NASA Event {evt.eventId}: {evt.title.substring(0, 24)}... ({evt.date})
              </div>
            </button>
          </Marker>
        ))}

        {/* SIMULATED TRANSIT VEHICLE */}
        {vehiclePosition && (
          <Marker longitude={vehiclePosition[0]} latitude={vehiclePosition[1]} anchor="center">
            <div className="relative flex items-center justify-center cursor-pointer group">
              <div className="absolute w-8 h-8 rounded-full bg-cyan-400/30 animate-ping"></div>
              <div className="relative w-7 h-7 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center shadow-lg border-2 border-white font-bold">
                <Truck className="w-4 h-4 fill-current" />
              </div>

              {/* Vehicle Live Telemetry Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col whitespace-nowrap px-3 py-2 bg-zinc-900/95 text-white text-[10px] font-mono rounded-xl shadow-2xl border border-cyan-500/40 z-50">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>Vehicle Telemetry (Transit)</span>
                </div>
                {vehicleTelemetry && (
                  <div className="mt-1 space-y-0.5 text-zinc-300">
                    <div>Speed: <strong className="text-white">{vehicleTelemetry.speedKmh} km/h</strong></div>
                    <div>Elevation: <strong className="text-white">{vehicleTelemetry.altitudeM} m</strong></div>
                    <div>Local Segment Risk: <strong className={vehicleTelemetry.currentRisk > 0.5 ? 'text-rose-400' : 'text-emerald-400'}>{(vehicleTelemetry.currentRisk * 100).toFixed(0)}%</strong></div>
                    <div className="text-[9px] text-zinc-400">{vehicleTelemetry.status}</div>
                  </div>
                )}
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* TOP OVERLAY CONTROLS */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-800 text-xs font-semibold text-zinc-200 flex items-center gap-2 shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }}></span>
          <span className="font-mono">NH-10 SIKKIM CORRIDOR (38.54 km)</span>
        </div>
        
        {/* Route Selector Toggle */}
        <div className="flex items-center bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-0.5 text-[11px] font-medium shadow-xl">
          <button
            onClick={() => setRouteLayerVisibility('both')}
            className={`px-2.5 py-1 rounded-lg transition ${routeLayerVisibility === 'both' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'}`}
          >
            Both Routes
          </button>
          <button
            onClick={() => setRouteLayerVisibility('safer')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${routeLayerVisibility === 'safer' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-zinc-400 hover:text-white'}`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Safer (Risk-Aware)</span>
          </button>
          <button
            onClick={() => setRouteLayerVisibility('shortest')}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${routeLayerVisibility === 'shortest' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-zinc-400 hover:text-white'}`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>Shortest (NH-10)</span>
          </button>
        </div>
      </div>

      {/* BOTTOM MAP LEGEND */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="px-3 py-2 rounded-xl bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 text-[11px] text-zinc-300 flex items-center gap-3 shadow-xl">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-1 rounded bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></span>
            <span>Risk-Aware Safer Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-b-2 border-dashed border-purple-400"></span>
            <span>Shortest Highway Route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 flex items-center justify-center text-[8px] text-white font-bold">!</span>
            <span>NASA GLC Landslides (14)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center text-[8px] font-bold">▲</span>
            <span>Chokepoints (5)</span>
          </div>
        </div>
      </div>

      {/* POPUP MODAL: HISTORICAL LANDSLIDE DETAIL */}
      {activeModalEvent && (
        <div className="absolute top-16 right-4 z-30 max-w-sm w-[90%] bg-zinc-900/95 backdrop-blur-xl border border-rose-500/40 rounded-2xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-[10px] font-bold border border-rose-500/30">
                NASA GLC #{activeModalEvent.eventId}
              </span>
              <span className="text-zinc-400 text-[11px] font-mono">{activeModalEvent.date}</span>
            </div>
            <button 
              onClick={() => setActiveModalEvent(null)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-white mb-1.5">{activeModalEvent.title}</h4>
          <p className="text-[11px] text-zinc-300 line-clamp-3 mb-3 leading-relaxed">
            {activeModalEvent.description}
          </p>

          <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/80 mb-3 text-center">
            <div>
              <div className="text-[9px] text-zinc-500 uppercase font-mono">1h Rain</div>
              <div className="text-xs font-bold text-zinc-200">{activeModalEvent.rain1h} mm</div>
            </div>
            <div>
              <div className="text-[9px] text-rose-400 uppercase font-mono">24h Rain</div>
              <div className="text-xs font-bold text-rose-400">{activeModalEvent.rain24h} mm</div>
            </div>
            <div>
              <div className="text-[9px] text-indigo-400 uppercase font-mono">3-Day Rain</div>
              <div className="text-xs font-bold text-indigo-300">{activeModalEvent.rain3day} mm</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
            <span>Trigger: <strong className="text-zinc-200 capitalize">{activeModalEvent.trigger}</strong></span>
            {activeModalEvent.fatalities > 0 && (
              <span className="text-rose-400 font-semibold">Fatalities: {activeModalEvent.fatalities}</span>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL: CHOKEPOINT DETAIL */}
      {activeModalChokepoint && (
        <div className="absolute top-16 right-4 z-30 max-w-sm w-[90%] bg-zinc-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 shadow-2xl text-zinc-100 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30">
                Corridor Chokepoint
              </span>
              <span className="text-zinc-400 text-[11px] font-mono">Elev: {activeModalChokepoint.elevation}m</span>
            </div>
            <button 
              onClick={() => setActiveModalChokepoint(null)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-amber-300 mb-1.5">{activeModalChokepoint.name}</h4>
          <p className="text-[11px] text-zinc-300 mb-2.5 leading-relaxed">
            {activeModalChokepoint.historySummary}
          </p>

          <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-200 leading-snug">
            <strong>Recommended Detour / Action:</strong> {activeModalChokepoint.safeDetour}
          </div>
        </div>
      )}
    </div>
  );
}
