import React, { useState, useRef, useMemo } from 'react';
import Map, { NavigationControl, FullscreenControl, Source, Layer, Marker, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  AlertTriangle, ShieldAlert, Mountain, MapPin, 
  Layers, Info, Compass, CheckCircle2, Phone, ExternalLink, X, Navigation2, Truck, Users, ArrowRight
} from 'lucide-react';
import { OPENFREEMAP_LIBERTY } from '../../config/map.config';
import { MeghalayaLandslide, MeghalayaVillage, MeghalayaSegment, MeghalayaRouteComparisonResult } from '../../api/corridorApi';

interface MeghalayaMapProps {
  landslides?: MeghalayaLandslide[];
  villages?: MeghalayaVillage[];
  segments?: MeghalayaSegment[];
  chokepoints?: any[];
  citizenReports?: any[];
  rain1d?: number;
  rain3d?: number;
  activeRouteComparison?: MeghalayaRouteComparisonResult | null;
  selectedSegmentExplainability?: any | null;
  onSelectSegment?: (seg: MeghalayaSegment | null) => void;
  onSelectLandslide?: (ls: MeghalayaLandslide | null) => void;
  onSelectChokepoint?: (cp: any | null) => void;
  onMapClick?: (lat: number, lon: number) => void;
  clickSelectionMode?: 'origin' | 'destination' | null;
}

export default function MeghalayaMap({
  landslides = [],
  villages = [],
  segments = [],
  chokepoints = [],
  citizenReports = [],
  rain1d = 35,
  rain3d = 85,
  activeRouteComparison,
  selectedSegmentExplainability = null,
  onSelectSegment,
  onSelectLandslide,
  onSelectChokepoint,
  onMapClick,
  clickSelectionMode = null
}: MeghalayaMapProps) {
  const mapRef = useRef<MapRef>(null);

  const [activeModalLandslide, setActiveModalLandslide] = useState<MeghalayaLandslide | null>(null);
  const [activeModalChokepoint, setActiveModalChokepoint] = useState<any | null>(null);
  const [activeModalVillage, setActiveModalVillage] = useState<MeghalayaVillage | null>(null);
  const [activeModalReport, setActiveModalReport] = useState<any | null>(null);
  const [activeModalSegment, setActiveModalSegment] = useState<MeghalayaSegment | null>(null);

  // Layer toggles
  const [showLandslides, setShowLandslides] = useState(true);
  const [showChokepoints, setShowChokepoints] = useState(true);
  const [showVillages, setShowVillages] = useState(false);
  const [showCitizenReports, setShowCitizenReports] = useState(true);
  const [showRoads, setShowRoads] = useState(true);
  const [routeVisibility, setRouteVisibility] = useState<'both' | 'safer' | 'shortest'>('both');

  // Initial view centered on Meghalaya state center (between Shillong & Nongstoin)
  const initialViewState = {
    longitude: 91.50,
    latitude: 25.50,
    zoom: 8.5,
    pitch: 28,
    bearing: 0
  };

  // 1. Shortest Route GeoJSON (Dashed Amber/Orange)
  const shortestRouteGeoJSON = useMemo(() => {
    if (!activeRouteComparison?.shortest_route?.coordinates?.length) return null;
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: activeRouteComparison.shortest_route.coordinates.map(([lat, lon]) => [lon, lat])
      },
      properties: {
        name: activeRouteComparison.shortest_route.label
      }
    };
  }, [activeRouteComparison]);

  // 2. Safer Alternative Route GeoJSON (Glowing Solid Cyan)
  const saferRouteGeoJSON = useMemo(() => {
    if (!activeRouteComparison?.safer_route?.coordinates?.length) return null;
    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: activeRouteComparison.safer_route.coordinates.map(([lat, lon]) => [lon, lat])
      },
      properties: {
        name: activeRouteComparison.safer_route.label
      }
    };
  }, [activeRouteComparison]);

  // Convert segments to GeoJSON LineStrings with risk colors
  const roadsGeoJSON = useMemo(() => {
    const features = segments.map((seg) => {
      let tierColor = '#10b981'; // Green: Low (<20%)
      if (seg.risk_score >= 0.70) tierColor = '#ef4444'; // Red: Very High (>70%)
      else if (seg.risk_score >= 0.50) tierColor = '#f97316'; // Orange: High (50-70%)
      else if (seg.risk_score >= 0.20) tierColor = '#f59e0b'; // Yellow: Moderate (20-50%)

      return {
        type: 'Feature',
        properties: {
          segment_id: seg.segment_id,
          corridor: seg.corridor,
          risk_score: seg.risk_score,
          color_hex: tierColor,
          elevation: seg.elevation,
          slope: seg.slope,
          length_m: seg.length_m
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [seg.start_lon, seg.start_lat],
            [seg.end_lon, seg.end_lat]
          ]
        }
      };
    });

    return {
      type: 'FeatureCollection',
      features
    };
  }, [segments]);

  return (
    <div className="relative w-full h-[580px] rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950 shadow-2xl">
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%', cursor: clickSelectionMode ? 'crosshair' : 'grab' }}
        mapStyle={OPENFREEMAP_LIBERTY}
        maxZoom={16}
        minZoom={7}
        interactiveLayerIds={['meghalaya-roads-layer']}
        onClick={(e) => {
          if (clickSelectionMode && onMapClick) {
            onMapClick(e.lngLat.lat, e.lngLat.lng);
            return;
          }
          const feat = e.features?.[0];
          if (feat && feat.properties?.segment_id) {
            const seg = segments.find(s => s.segment_id === feat.properties.segment_id);
            if (seg) {
              setActiveModalSegment(seg);
              if (onSelectSegment) onSelectSegment(seg);
              return;
            }
          }
          if (onMapClick) {
            onMapClick(e.lngLat.lat, e.lngLat.lng);
          }
        }}
      >
        <NavigationControl position="bottom-right" showCompass={true} />
        <FullscreenControl position="bottom-right" />

        {/* 1. Road Segments Layer */}
        {showRoads && segments.length > 0 && (
          <Source id="meghalaya-roads-source" type="geojson" data={roadsGeoJSON as any}>
            <Layer
              id="meghalaya-roads-layer"
              type="line"
              paint={{
                'line-color': ['get', 'color_hex'],
                'line-width': 4.5,
                'line-opacity': 0.85
              }}
            />
            <Layer
              id="meghalaya-roads-casing"
              type="line"
              paint={{
                'line-color': '#020617',
                'line-width': 6.5,
                'line-opacity': 0.4
              }}
            />
          </Source>
        )}

        {/* 2. Route Optimization Layers */}
        {/* Shortest Highway Route Layer (Dashed Orange/Purple) */}
        {(routeVisibility === 'both' || routeVisibility === 'shortest') && shortestRouteGeoJSON && (
          <Source id="meghalaya-shortest-route-source" type="geojson" data={shortestRouteGeoJSON as any}>
            <Layer
              id="meghalaya-shortest-casing"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#0f172a',
                'line-width': 8.5,
                'line-opacity': 0.8
              }}
            />
            <Layer
              id="meghalaya-shortest-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#f59e0b',
                'line-width': 5.5,
                'line-dasharray': [2, 2],
                'line-opacity': 0.95
              }}
            />
          </Source>
        )}

        {/* Safer Alternative Route Layer (Glowing Cyan/Emerald) */}
        {(routeVisibility === 'both' || routeVisibility === 'safer') && saferRouteGeoJSON && (
          <Source id="meghalaya-safer-route-source" type="geojson" data={saferRouteGeoJSON as any}>
            <Layer
              id="meghalaya-safer-glow"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#06b6d4',
                'line-width': 14,
                'line-blur': 5,
                'line-opacity': 0.5
              }}
            />
            <Layer
              id="meghalaya-safer-casing"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#083344',
                'line-width': 9.0,
                'line-opacity': 0.85
              }}
            />
            <Layer
              id="meghalaya-safer-line"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': '#06b6d4',
                'line-width': 6.5,
                'line-opacity': 1.0
              }}
            />
          </Source>
        )}

        {/* 3. Origin & Destination Markers when Route Comparison is Active */}
        {activeRouteComparison && (
          <>
            <Marker
              longitude={activeRouteComparison.origin.lon}
              latitude={activeRouteComparison.origin.lat}
              anchor="bottom"
            >
              <div className="flex flex-col items-center group cursor-pointer z-40">
                <div className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded shadow-xl border border-white flex items-center space-x-1">
                  <Navigation2 className="w-3.5 h-3.5 rotate-45" />
                  <span>START: {activeRouteComparison.origin.name.split(' (')[0]}</span>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rotate-45 -mt-1.5 border-r border-b border-white" />
              </div>
            </Marker>

            <Marker
              longitude={activeRouteComparison.destination.lon}
              latitude={activeRouteComparison.destination.lat}
              anchor="bottom"
            >
              <div className="flex flex-col items-center group cursor-pointer z-40">
                <div className="bg-purple-600 text-white font-black text-[10px] px-2.5 py-1 rounded shadow-xl border border-white flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>DEST: {activeRouteComparison.destination.name.split(' (')[0]}</span>
                </div>
                <div className="w-3 h-3 bg-purple-600 rotate-45 -mt-1.5 border-r border-b border-white" />
              </div>
            </Marker>
          </>
        )}

        {/* 4. Critical Chokepoint Markers (Pulsing Radar Rings) */}
        {showChokepoints && chokepoints.map((cp) => {
          const isHighRisk = (cp.risk_score || 0) >= 0.65;
          const isBlocked = cp.status?.includes('BLOCKED');
          const markerColor = isBlocked ? '#ef4444' : (isHighRisk ? '#f97316' : '#eab308');

          return (
            <Marker
              key={cp.chokepoint_id || cp.id || cp.name}
              longitude={cp.lon}
              latitude={cp.lat}
              anchor="center"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setActiveModalChokepoint(cp);
                if (onSelectChokepoint) onSelectChokepoint(cp);
              }}
            >
              <div className="relative flex items-center justify-center cursor-pointer group">
                {isHighRisk && (
                  <span 
                    className="absolute inline-flex h-9 w-9 rounded-full opacity-75 animate-ping"
                    style={{ backgroundColor: markerColor }}
                  />
                )}
                <div 
                  className="relative z-10 p-1.5 rounded-full shadow-lg border-2 border-white transition-transform transform group-hover:scale-125"
                  style={{ backgroundColor: markerColor }}
                >
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                  <div className="bg-slate-900/95 text-white text-[11px] font-semibold py-1 px-2.5 rounded shadow-xl border border-slate-700 whitespace-nowrap">
                    {cp.name}
                    <div className="text-[9px] text-amber-400 font-normal">
                      Risk: {(cp.risk_score ? (cp.risk_score * 100).toFixed(0) : 65)}% · {cp.district}
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
                </div>
              </div>
            </Marker>
          );
        })}

        {/* 3. Candidate Landslide Hotspots (88 UGLC unverified points) */}
        {showLandslides && landslides.map((ls) => (
          <Marker
            key={ls.event_id}
            longitude={ls.longitude}
            latitude={ls.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActiveModalLandslide(ls);
              if (onSelectLandslide) onSelectLandslide(ls);
            }}
          >
            <div className="relative cursor-pointer group">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white/80 shadow transition-transform transform group-hover:scale-150" />
              <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                <div className="bg-slate-950/95 text-rose-300 text-[10px] font-mono py-0.5 px-2 rounded border border-rose-900/50 whitespace-nowrap shadow-lg">
                  {ls.event_id} · {ls.district_nearest} (Candidate Hotspot - Unverified)
                </div>
              </div>
            </div>
          </Marker>
        ))}

        {/* 4. Citizen Hazard Reports Markers */}
        {showCitizenReports && citizenReports.map((cr, idx) => (
          <Marker
            key={cr.report_id || idx}
            longitude={cr.longitude}
            latitude={cr.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActiveModalReport(cr);
            }}
          >
            <div className="relative cursor-pointer group flex flex-col items-center">
              <div className={`p-1 rounded-full ${cr.severity === 'CRITICAL' ? 'bg-rose-600 animate-bounce' : 'bg-amber-600'} border border-white text-white shadow-lg`}>
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] bg-slate-950/90 text-amber-300 px-1 rounded border border-amber-800/40 shadow mt-0.5 whitespace-nowrap">
                {cr.hazard_type?.split('/')[0]?.trim()}
              </span>
            </div>
          </Marker>
        ))}

        {/* 5. Key Populated Villages Markers */}
        {showVillages && villages.slice(0, 30).map((v) => (
          <Marker
            key={v.village_id}
            longitude={v.centroid_longitude}
            latitude={v.centroid_latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setActiveModalVillage(v);
            }}
          >
            <div className="flex flex-col items-center cursor-pointer group">
              <div className="p-1 rounded-full bg-emerald-700/90 border border-emerald-300 text-white shadow-md transform group-hover:scale-110 transition-transform">
                <Users className="w-3 h-3" />
              </div>
              <span className="text-[9px] font-semibold text-emerald-200 bg-slate-950/80 px-1 rounded shadow mt-0.5 whitespace-nowrap">
                {v.village_name}
              </span>
            </div>
          </Marker>
        ))}
      </Map>

      {/* Top Floating Header & Stats Banner */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700 shadow-xl flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-white tracking-wide">
            MEGHALAYA LIFELINE CORRIDORS
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
            {segments.length} Segments · 88 Candidate Points (Unverified)
          </span>
        </div>

        {/* Layer Toggle Pills */}
        <div className="bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 shadow-lg flex items-center space-x-1.5 text-[11px]">
          <button
            onClick={() => setShowRoads(!showRoads)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${showRoads ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'}`}
          >
            Roads ({segments.length})
          </button>
          <button
            onClick={() => setShowChokepoints(!showChokepoints)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${showChokepoints ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400'}`}
          >
            Chokepoints ({chokepoints.length})
          </button>
          <button
            onClick={() => setShowLandslides(!showLandslides)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${showLandslides ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400'}`}
            title="Candidate landslide susceptibility points from UGLC inventory (unverified third-party records)"
          >
            Hotspots ({landslides.length} unverified)
          </button>
          <button
            onClick={() => setShowCitizenReports(!showCitizenReports)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${showCitizenReports ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400'}`}
          >
            Citizen Reports ({citizenReports.length})
          </button>
          <button
            onClick={() => setShowVillages(!showVillages)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${showVillages ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400'}`}
          >
            Villages
          </button>
        </div>

        {/* Route Optimization Visibility Controls */}
        {activeRouteComparison && (
          <div className="bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-500/50 shadow-lg flex items-center space-x-1.5 text-[11px]">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1">
              <Navigation2 className="w-3 h-3 rotate-45 text-cyan-400" />
              <span>Route:</span>
            </span>
            <button
              onClick={() => setRouteVisibility('both')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${routeVisibility === 'both' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'text-slate-400 hover:text-white'}`}
            >
              Both
            </button>
            <button
              onClick={() => setRouteVisibility('safer')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${routeVisibility === 'safer' ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' : 'text-slate-400 hover:text-white'}`}
            >
              Safer (Cyan)
            </button>
            <button
              onClick={() => setRouteVisibility('shortest')}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${routeVisibility === 'shortest' ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50' : 'text-slate-400 hover:text-white'}`}
            >
              Shortest (Amber)
            </button>
          </div>
        )}
      </div>

      {/* Top Map Click Selection Mode Alert */}
      {clickSelectionMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-400 shadow-2xl text-xs font-bold text-white flex items-center space-x-2 animate-pulse">
          <MapPin className="w-4 h-4 text-cyan-300" />
          <span>Click on the map to set {clickSelectionMode === 'origin' ? 'Origin (Start Point)' : 'Destination (End Point)'}</span>
        </div>
      )}

      {/* Floating Route Optimisation HUD on Map */}
      {activeRouteComparison && (
        <div className="absolute top-14 left-3 z-10 max-w-sm bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/50 shadow-2xl text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-[11px] tracking-wide uppercase">
              <Navigation2 className="w-3.5 h-3.5 rotate-45 text-cyan-400" />
              <span>Route Optimisation</span>
            </div>
            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 font-black text-[10px] px-2 py-0.5 rounded-full">
              -{activeRouteComparison.comparison.risk_reduction_pct}% Risk
            </span>
          </div>

          <div className="text-[11px] font-semibold text-white flex items-center space-x-1">
            <span className="text-emerald-400">{activeRouteComparison.origin.name.split(' (')[0]}</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
            <span className="text-purple-400">{activeRouteComparison.destination.name.split(' (')[0]}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            <div>
              <div className="text-amber-400 font-bold">Shortest Route:</div>
              <div className="text-slate-200 font-mono">{activeRouteComparison.shortest_route.total_distance_km} km · {activeRouteComparison.shortest_route.estimated_time_hours}h</div>
              <div className="text-rose-400">Peak: {(activeRouteComparison.shortest_route.peak_risk * 100).toFixed(0)}% risk</div>
            </div>
            <div>
              <div className="text-cyan-400 font-bold">Safer Alternative:</div>
              <div className="text-cyan-200 font-mono">{activeRouteComparison.safer_route.total_distance_km} km · {activeRouteComparison.safer_route.estimated_time_hours}h</div>
              <div className="text-emerald-400">Peak: {(activeRouteComparison.safer_route.peak_risk * 100).toFixed(0)}% risk</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-300 bg-cyan-950/30 p-2 rounded border border-cyan-800/40 leading-relaxed">
            {activeRouteComparison.comparison.recommendation}
          </div>
        </div>
      )}

      {/* Bottom Map Legend - 4-Tier Standard Classification */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-800 shadow-lg text-[11px] text-slate-300 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1.5 bg-emerald-500 rounded-full" />
          <span>Low Risk (&lt;20%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1.5 bg-amber-500 rounded-full" />
          <span>Moderate (20-50%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1.5 bg-orange-500 rounded-full" />
          <span>High Risk (50-70%)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1.5 bg-rose-500 rounded-full" />
          <span>Very High (&gt;70%)</span>
        </div>
        {activeRouteComparison && (
          <>
            <div className="flex items-center space-x-1.5 border-l border-slate-700 pl-2">
              <span className="w-3.5 h-1 border-t-2 border-dashed border-amber-400 inline-block" />
              <span className="text-amber-300 font-medium">Shortest</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-1.5 bg-cyan-400 rounded-full inline-block shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <span className="text-cyan-300 font-medium">Safer Route</span>
            </div>
          </>
        )}
      </div>

      {/* Chokepoint Inspection Modal */}
      {activeModalChokepoint && (
        <div className="absolute top-14 right-3 z-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider font-semibold">
                Critical Lifeline Chokepoint
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeModalChokepoint.name}</h4>
              <p className="text-xs text-slate-400">{activeModalChokepoint.district}</p>
            </div>
            <button 
              onClick={() => setActiveModalChokepoint(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Status</span>
              <span className="font-bold text-amber-400">{activeModalChokepoint.status || 'CAUTION'}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Failure Risk</span>
              <span className="font-bold text-rose-400">
                {activeModalChokepoint.risk_score ? (activeModalChokepoint.risk_score * 100).toFixed(1) : 65.0}%
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Elevation / Slope</span>
              <span className="font-mono">{activeModalChokepoint.elevation_m}m / {activeModalChokepoint.slope_deg}°</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Est. Clearance</span>
              <span className="font-mono text-emerald-400">{activeModalChokepoint.estimated_clearance_hours || 0} hrs</span>
            </div>
          </div>

          <div className="mt-3 text-xs bg-slate-950/80 p-2.5 rounded border border-slate-800 text-slate-300">
            <span className="font-semibold text-slate-200 block mb-1">Hazard Mechanism:</span>
            {activeModalChokepoint.hazard_reason || activeModalChokepoint.hazard_description}
          </div>

          <div className="mt-2.5 text-[11px] bg-amber-950/30 text-amber-300 p-2 rounded border border-amber-800/40">
            <strong>Recommended Action:</strong> {activeModalChokepoint.recommended_action || 'Maintain active patrol surveillance'}
          </div>
        </div>
      )}

      {/* Candidate Hotspot Modal - Explicit Provenance Notice */}
      {activeModalLandslide && (
        <div className="absolute top-14 right-3 z-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-rose-500/50 rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-wider font-semibold">
                Candidate Susceptibility Hotspot
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeModalLandslide.event_id}</h4>
              <p className="text-xs text-slate-400">{activeModalLandslide.district_nearest}</p>
            </div>
            <button 
              onClick={() => setActiveModalLandslide(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mt-3 text-xs">
            <div className="bg-rose-950/40 p-2 rounded border border-rose-800/40 text-[11px] text-rose-200 leading-tight">
              <strong>Provenance Disclaimer:</strong> Unverified third-party record from UGLC NE inventory. Source records contain no confirmed event date or ground-truth verification.
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">GPS Coordinates:</span>
              <span className="font-mono text-slate-200">{activeModalLandslide.latitude.toFixed(4)}, {activeModalLandslide.longitude.toFixed(4)}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Nearest Village:</span>
              <span className="font-medium text-emerald-400">{activeModalLandslide.nearest_village_id} ({activeModalLandslide.dist_to_village_km} km)</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800 flex justify-between">
              <span className="text-slate-400">Catalog Source:</span>
              <span className="text-slate-300">NASA GLC / UGLC NE Catalog</span>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Hazard Report Modal */}
      {activeModalReport && (
        <div className="absolute top-14 right-3 z-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-purple-500/50 rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider font-semibold">
                Live Citizen Field Report
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeModalReport.hazard_type}</h4>
              <p className="text-xs text-slate-400">{activeModalReport.location_name}</p>
            </div>
            <button 
              onClick={() => setActiveModalReport(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 mt-3 text-xs">
            <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-400">Severity:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeModalReport.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                {activeModalReport.severity}
              </span>
            </div>
            <div className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-400">Verification Status:</span>
              <span className="text-emerald-400 text-[10px] font-mono">
                {activeModalReport.verification_status || 'PENDING_OFFICIAL_VERIFICATION'}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Field Observation:</span>
              <p className="text-slate-200 mt-1">{activeModalReport.description}</p>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 px-1">
              <span>Reported by: {activeModalReport.reporter_name}</span>
              <span>{activeModalReport.created_at || 'Recent'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Road Segment Explainability Drawer */}
      {activeModalSegment && (
        <div className="absolute top-14 right-3 z-20 w-88 bg-slate-900/98 backdrop-blur-xl border border-cyan-500/60 rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200 max-h-[500px] overflow-y-auto">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Segment Decision Explainability
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeModalSegment.segment_id}</h4>
              <p className="text-xs text-slate-400">{activeModalSegment.corridor}</p>
            </div>
            <button 
              onClick={() => setActiveModalSegment(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2.5 mt-3 text-xs">
            {/* Risk Tier Badge */}
            <div className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">4-Tier Risk Score:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-white">{(activeModalSegment.risk_score * 100).toFixed(1)}%</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  activeModalSegment.risk_score >= 0.70 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  activeModalSegment.risk_score >= 0.50 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                  activeModalSegment.risk_score >= 0.20 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {activeModalSegment.risk_score >= 0.70 ? 'VERY HIGH' :
                   activeModalSegment.risk_score >= 0.50 ? 'HIGH' :
                   activeModalSegment.risk_score >= 0.20 ? 'MODERATE' : 'LOW'}
                </span>
              </div>
            </div>

            {/* Model & Calibration Details */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">ML Provenance</span>
              <div className="flex justify-between text-slate-300">
                <span>Model Ensemble:</span>
                <span className="font-mono text-slate-100">RF + XGBoost (Platt Calibrated)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>RF Probability:</span>
                <span className="font-mono text-slate-100">{activeModalSegment.rf_prob ? (activeModalSegment.rf_prob * 100).toFixed(1) : (activeModalSegment.risk_score * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>XGBoost Probability:</span>
                <span className="font-mono text-slate-100">{activeModalSegment.xgb_prob ? (activeModalSegment.xgb_prob * 100).toFixed(1) : (activeModalSegment.risk_score * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Precipitation Window Inputs */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">Precipitation Provenance</span>
              <div className="flex justify-between text-slate-300">
                <span>Data Source:</span>
                <span className="text-slate-100">IMD 0.25° Daily Gridded Grid</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rainfall Windows (1d / 3d):</span>
                <span className="font-mono text-emerald-400">{activeModalSegment.rain_1d || rain1d}mm / {activeModalSegment.rain_3d || rain3d}mm</span>
              </div>
            </div>

            {/* Terrain Parameters */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold block uppercase tracking-wider">Terrain Features</span>
              <div className="flex justify-between text-slate-300">
                <span>Elevation / Slope:</span>
                <span className="font-mono text-slate-100">{activeModalSegment.elevation}m / {activeModalSegment.slope}°</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Segment Length:</span>
                <span className="font-mono text-slate-100">{activeModalSegment.length_m} m</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>District:</span>
                <span className="text-slate-100">{activeModalSegment.district}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Village Inspection Modal */}
      {activeModalVillage && (
        <div className="absolute top-14 right-3 z-20 w-72 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/50 rounded-xl p-4 shadow-2xl text-slate-200 animate-in fade-in slide-in-from-right-4 duration-200">
          <div className="flex items-start justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Census Village Demographics
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{activeModalVillage.village_name}</h4>
              <p className="text-xs text-slate-400">{activeModalVillage.block}, {activeModalVillage.district}</p>
            </div>
            <button 
              onClick={() => setActiveModalVillage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Population</span>
              <span className="font-bold text-white text-sm">{activeModalVillage.population.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Households</span>
              <span className="font-bold text-white text-sm">{activeModalVillage.households.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

