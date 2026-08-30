import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { HotelLodgingSvg } from './MapSvgIcons';
import { Star } from 'lucide-react';

interface HotelMarkerProps {
  key?: React.Key;
  hotel: any;
  onClick: (hotel: any) => void;
}

export default function HotelMarker({ hotel, onClick }: HotelMarkerProps) {
  const [lng, lat] = hotel.geometry.coordinates;
  const { name, title, rating, roomsCount, priceRange } = hotel.properties;

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(hotel);
      }}
    >
      <div className="relative group flex flex-col items-center cursor-pointer select-none">
        {/* Floating title tag above marker */}
        <div className="opacity-90 group-hover:opacity-100 transition-all mb-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg flex items-center gap-1 whitespace-nowrap bg-slate-950/90 border border-indigo-500/60 backdrop-blur-sm">
          <span className="text-indigo-400">🏨</span>
          <span className="max-w-[130px] truncate">{title || name}</span>
          {rating && (
            <span className="px-1 py-0.2 rounded bg-indigo-600 text-[9px] font-extrabold text-white flex items-center gap-0.5">
              <Star className="w-2 h-2 fill-amber-300 text-amber-300" />
              {rating.replace('★', '').trim()}
            </span>
          )}
        </div>

        {/* Custom SVG Icon Container */}
        <div
          className="w-9 h-9 rounded-xl border-2 border-white bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-800 shadow-xl shadow-indigo-900/30 flex items-center justify-center transition-transform duration-200 group-hover:scale-115 ring-2 ring-indigo-400/50"
        >
          <HotelLodgingSvg className="w-5 h-5 text-white drop-shadow" />
        </div>

        {/* Rich Hover Card Tooltip */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-full mt-1 bg-slate-950/95 text-white text-xs px-3 py-2 rounded-xl shadow-2xl border border-indigo-500/50 pointer-events-none whitespace-nowrap z-40 flex flex-col gap-1 backdrop-blur-md">
          <div className="font-bold flex items-center justify-between gap-3 text-indigo-300">
            <span>{name}</span>
            {rating && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-900 text-indigo-200 border border-indigo-700 flex items-center gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                {rating}
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            {roomsCount && <span>{roomsCount}</span>}
            {priceRange && <span className="text-indigo-300">• {priceRange}</span>}
          </div>
          <div className="text-[10px] text-emerald-400">
            ✓ 24/7 Power Backup • Secure Fleet Parking
          </div>
          <div className="text-[9px] text-indigo-400/90 font-medium pt-0.5 border-t border-slate-800 flex items-center justify-between">
            <span>Guwahati Transit Accommodation</span>
            <span>Click to inspect</span>
          </div>
        </div>
      </div>
    </Marker>
  );
}
