import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { HardHat, Utensils, Construction } from 'lucide-react';
import { PetrolPumpSvg, HotelLodgingSvg, RoadworkSvg, LandslideHazardSvg } from './MapSvgIcons';

interface PoiMarkerProps {
  key?: React.Key;
  poi: any;
  onClick: (poi: any) => void;
}

const getPoiIcon = (type: string) => {
  switch (type) {
    case 'roadwork':
      return <RoadworkSvg className="w-4 h-4 text-white" />;
    case 'petrol_station':
      return <PetrolPumpSvg className="w-4 h-4 text-white" />;
    case 'hotel':
      return <HotelLodgingSvg className="w-4 h-4 text-white" />;
    case 'landslide_prone_area':
      return <LandslideHazardSvg className="w-4 h-4 text-white" />;
    case 'restaurant':
      return <Utensils className="w-4 h-4 text-white" />;
    default:
      return <Construction className="w-4 h-4 text-white" />;
  }
};

const getPoiConfig = (type: string) => {
  switch (type) {
    case 'roadwork':
      return {
        bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        ring: 'ring-2 ring-amber-400',
        border: 'border-white',
        badgeBg: 'bg-amber-600',
        label: 'Men at Work 🚧',
        textColor: 'text-amber-100',
      };
    case 'petrol_station':
      return {
        bg: 'bg-gradient-to-br from-cyan-600 to-blue-700',
        ring: 'ring-2 ring-cyan-400',
        border: 'border-white',
        badgeBg: 'bg-cyan-700',
        label: 'Fuel Station ⛽',
        textColor: 'text-cyan-100',
      };
    case 'hotel':
      return {
        bg: 'bg-gradient-to-br from-indigo-600 to-violet-700',
        ring: 'ring-2 ring-indigo-400',
        border: 'border-white',
        badgeBg: 'bg-indigo-700',
        label: 'Hotel 🏨',
        textColor: 'text-indigo-100',
      };
    case 'landslide_prone_area':
      return {
        bg: 'bg-gradient-to-br from-red-600 to-amber-700',
        ring: 'ring-2 ring-amber-400',
        border: 'border-white',
        badgeBg: 'bg-red-700',
        label: 'Landslide Zone ⛰️',
        textColor: 'text-amber-100',
      };
    case 'restaurant':
      return {
        bg: 'bg-gradient-to-br from-emerald-600 to-teal-700',
        ring: 'ring-2 ring-emerald-400',
        border: 'border-white',
        badgeBg: 'bg-emerald-700',
        label: 'Restaurant 🍽️',
        textColor: 'text-emerald-100',
      };
    default:
      return {
        bg: 'bg-slate-700',
        ring: 'ring-2 ring-slate-400',
        border: 'border-white',
        badgeBg: 'bg-slate-800',
        label: 'Location 📍',
        textColor: 'text-slate-100',
      };
  }
};

export default function PoiMarker({ poi, onClick }: PoiMarkerProps) {
  const [lng, lat] = poi.geometry.coordinates;
  const { type, name, title, brand, rating, cuisine, hazardLevel } = poi.properties;
  const config = getPoiConfig(type);

  return (
    <Marker
      longitude={lng}
      latitude={lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(poi);
      }}
    >
      <div className="relative group flex flex-col items-center cursor-pointer select-none">
        {/* Floating tooltip/badge */}
        <div className="opacity-90 group-hover:opacity-100 transition-opacity mb-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-md flex items-center gap-1 whitespace-nowrap bg-slate-900/90 border border-slate-700 backdrop-blur-sm">
          <span>{type === 'roadwork' ? '🚧' : type === 'petrol_station' ? '⛽' : type === 'hotel' ? '🏨' : type === 'landslide_prone_area' ? '⛰️' : '🍽️'}</span>
          <span className="max-w-[110px] truncate">{title || name}</span>
        </div>

        {/* POI Marker Icon Box with Distinct SVG */}
        <div
          className={`w-8 h-8 rounded-lg border-2 shadow-lg flex items-center justify-center text-white transition-transform duration-150 group-hover:scale-115 ${config.bg} ${config.ring} ${config.border}`}
        >
          {getPoiIcon(type)}
        </div>

        {/* Expanded Info tooltip on hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute top-full mt-1 bg-slate-950/95 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl border border-slate-700 pointer-events-none whitespace-nowrap z-30 flex flex-col gap-0.5 backdrop-blur-sm">
          <div className="font-bold flex items-center justify-between gap-2">
            <span>{name}</span>
            {rating && <span className="text-amber-400 font-semibold">{rating}</span>}
            {hazardLevel && <span className="text-red-400 font-semibold">{hazardLevel} Hazard</span>}
          </div>
          {brand && <div className="text-slate-300 text-[10px]">{brand}</div>}
          {cuisine && <div className="text-emerald-300 text-[10px]">{cuisine}</div>}
          {type === 'roadwork' && <div className="text-amber-300 text-[10px]">Men at Work • Caution</div>}
          <div className="text-[9px] text-slate-400 mt-0.5">Click for full details</div>
        </div>
      </div>
    </Marker>
  );
}
