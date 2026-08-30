import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { LandslideHazardSvg } from './MapSvgIcons';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface LandslideProneMarkerProps {
  key?: React.Key;
  landslide: any;
  onClick: (landslide: any) => void;
}

export default function LandslideProneMarker({ landslide, onClick }: LandslideProneMarkerProps) {
  const [lng, lat] = landslide.geometry.coordinates;
  const { name, title, hazardLevel, severity, slopeAngle, vulnerability } = landslide.properties;

  const isCritical = severity === 'critical' || hazardLevel?.toLowerCase() === 'critical';
  const isHigh = severity === 'high' || hazardLevel?.toLowerCase() === 'high';

  const badgeColor = isCritical 
    ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-red-500/50' 
    : isHigh 
    ? 'bg-amber-600 border-amber-400 text-white shadow-amber-500/40' 
    : 'bg-orange-600 border-orange-400 text-white shadow-orange-500/40';

  const glowRing = isCritical 
    ? 'ring-4 ring-red-500/40 animate-ping' 
    : 'ring-2 ring-amber-400/50';

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(landslide);
      }}
    >
      <div className="relative group flex flex-col items-center cursor-pointer select-none">
        {/* Floating title tag above marker */}
        <div className="hidden group-hover:flex transition-all mb-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg items-center gap-1 whitespace-nowrap bg-slate-950/90 border border-amber-500/60 backdrop-blur-sm z-30">
          <span className="text-amber-400">⛰️</span>
          <span className="max-w-[130px] truncate">{title || name}</span>
          <span className={`px-1 py-0.2 rounded text-[9px] font-extrabold ${isCritical ? 'bg-red-600' : 'bg-amber-600'}`}>
            {hazardLevel || 'HAZARD'}
          </span>
        </div>

        {/* Pulse effect on critical points */}
        {isCritical && (
          <div className="absolute top-5 w-8 h-8 rounded-xl bg-red-500/30 animate-ping pointer-events-none" />
        )}

        {/* Custom SVG Icon Container */}
        <div
          className={`w-9 h-9 rounded-xl border-2 shadow-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-115 ${badgeColor}`}
        >
          <LandslideHazardSvg className="w-5 h-5 text-white drop-shadow" />
        </div>

        {/* Rich Hover Card Tooltip */}
        <div className="hidden group-hover:flex transition-all duration-150 absolute top-full mt-1 bg-slate-950/95 text-white text-xs px-3 py-2 rounded-xl shadow-2xl border border-amber-500/50 pointer-events-none whitespace-nowrap z-40 flex-col gap-1 backdrop-blur-md">
          <div className="font-bold flex items-center justify-between gap-3 text-amber-300">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              {name}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${isCritical ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'}`}>
              {hazardLevel} Hazard
            </span>
          </div>
          {slopeAngle && <div className="text-[11px] text-slate-300">Terrain Slope: <span className="font-semibold text-white">{slopeAngle}</span></div>}
          {vulnerability && (
            <div className="text-[10px] text-slate-400 max-w-[220px] whitespace-normal leading-tight">
              {vulnerability}
            </div>
          )}
          <div className="text-[9px] text-amber-400/90 font-medium pt-0.5 border-t border-slate-800 flex items-center justify-between">
            <span>Guwahati Hill Slope Survey</span>
            <span>Click to inspect</span>
          </div>
        </div>
      </div>
    </Marker>
  );
}
