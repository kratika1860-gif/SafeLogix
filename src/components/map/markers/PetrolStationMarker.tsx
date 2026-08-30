import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { PetrolPumpSvg } from './MapSvgIcons';
import { Zap } from 'lucide-react';

interface PetrolStationMarkerProps {
  key?: React.Key;
  station: any;
  onClick: (station: any) => void;
}

export default function PetrolStationMarker({ station, onClick }: PetrolStationMarkerProps) {
  const [lng, lat] = station.geometry.coordinates;
  const { name, title, brand, openHours, fuelTypes, is24x7 } = station.properties;

  const hasEV = fuelTypes?.some((f: string) => f.toLowerCase().includes('ev') || f.toLowerCase().includes('charging'));

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(station);
      }}
    >
      <div className="relative group flex flex-col items-center cursor-pointer select-none">
        {/* Floating title tag above marker */}
        <div className="opacity-90 group-hover:opacity-100 transition-all mb-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg flex items-center gap-1 whitespace-nowrap bg-slate-950/90 border border-cyan-500/60 backdrop-blur-sm">
          <span className="text-cyan-400">⛽</span>
          <span className="max-w-[130px] truncate">{title || name}</span>
          {is24x7 && (
            <span className="px-1 py-0.2 rounded bg-emerald-600 text-[9px] font-extrabold text-white">
              24/7
            </span>
          )}
        </div>

        {/* Custom SVG Icon Container */}
        <div
          className="w-9 h-9 rounded-xl border-2 border-white bg-gradient-to-br from-cyan-600 via-teal-600 to-blue-700 shadow-xl shadow-cyan-900/30 flex items-center justify-center transition-transform duration-200 group-hover:scale-115 ring-2 ring-cyan-400/50"
        >
          <PetrolPumpSvg className="w-5 h-5 text-white drop-shadow" />
          {hasEV && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow">
              <Zap className="w-2.5 h-2.5 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Rich Hover Card Tooltip */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-full mt-1 bg-slate-950/95 text-white text-xs px-3 py-2 rounded-xl shadow-2xl border border-cyan-500/50 pointer-events-none whitespace-nowrap z-40 flex flex-col gap-1 backdrop-blur-md">
          <div className="font-bold flex items-center justify-between gap-3 text-cyan-300">
            <span>{name}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-900 text-cyan-200 border border-cyan-700">
              {brand || 'Fuel Station'}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <span className="text-emerald-400">● {openHours || '24 Hours Open'}</span>
            {hasEV && <span className="text-yellow-300 font-semibold">• EV Fast Charger Available</span>}
          </div>
          {fuelTypes && (
            <div className="flex flex-wrap gap-1 mt-0.5 max-w-[220px]">
              {fuelTypes.slice(0, 3).map((f: string, idx: number) => (
                <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                  {f}
                </span>
              ))}
            </div>
          )}
          <div className="text-[9px] text-cyan-400/90 font-medium pt-0.5 border-t border-slate-800 flex items-center justify-between">
            <span>Guwahati Fleet Network</span>
            <span>Click to inspect</span>
          </div>
        </div>
      </div>
    </Marker>
  );
}
