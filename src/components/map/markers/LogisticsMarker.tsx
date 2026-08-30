import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { Package, ShieldCheck, MapPin, Home, Warehouse } from 'lucide-react';

interface LogisticsMarkerProps {
  key?: React.Key;
  logistic: any;
  onClick: (logistic: any) => void;
}

const getIcon = (type: string, hubType?: string) => {
  if (hubType === 'alpha' || hubType === 'beta') {
    return <Home className="w-5 h-5" />;
  }
  switch (type) {
    case 'warehouse': return <Home className="w-5 h-5" />;
    case 'checkpoint': return <ShieldCheck className="w-5 h-5" />;
    case 'delivery': return <MapPin className="w-5 h-5" />;
    default: return <MapPin className="w-5 h-5" />;
  }
};

const getColor = (type: string, status: string, hubType?: string) => {
  if (status !== 'operational' && status !== 'pending') return 'bg-slate-400 border-slate-600';
  if (hubType === 'alpha') return 'bg-gradient-to-br from-blue-600 to-indigo-700 border-white ring-2 ring-blue-500 shadow-blue-500/50';
  if (hubType === 'beta') return 'bg-gradient-to-br from-purple-600 to-indigo-700 border-white ring-2 ring-purple-500 shadow-purple-500/50';
  
  switch (type) {
    case 'warehouse': return 'bg-indigo-600 border-white ring-2 ring-indigo-400';
    case 'checkpoint': return 'bg-teal-600 border-white ring-2 ring-teal-400';
    case 'delivery': return 'bg-fuchsia-600 border-white ring-2 ring-fuchsia-400';
    default: return 'bg-slate-600 border-slate-800';
  }
};

export default function LogisticsMarker({ logistic, onClick }: LogisticsMarkerProps) {
  const [lng, lat] = logistic.geometry.coordinates;
  const { type, status, hubType, isHub, name } = logistic.properties;
  
  const isAlpha = hubType === 'alpha' || name?.toLowerCase().includes('hub alpha');
  const isBeta = hubType === 'beta' || name?.toLowerCase().includes('hub beta');
  const isHubMarker = isHub || isAlpha || isBeta;

  const colorClass = getColor(type, status, isAlpha ? 'alpha' : isBeta ? 'beta' : undefined);

  return (
    <Marker 
      longitude={lng} 
      latitude={lat} 
      anchor="center" 
      onClick={(e) => { 
        e.originalEvent.stopPropagation(); 
        onClick(logistic); 
      }}
    >
      <div className="relative group flex flex-col items-center cursor-pointer">
        {/* Hub Flag Badge */}
        {isHubMarker && (
          <div className={`mb-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-md flex items-center gap-1 whitespace-nowrap animate-bounce-subtle ${
            isAlpha ? 'bg-blue-600 border border-blue-300' : 'bg-purple-600 border border-purple-300'
          }`}>
            <span>🏠</span>
            <span>{isAlpha ? 'Hub Alpha' : isBeta ? 'Hub Beta' : 'Hub Depot'}</span>
          </div>
        )}

        {/* Marker Icon */}
        <div className={`w-10 h-10 rounded-xl border-2 shadow-xl flex items-center justify-center text-white transition-all duration-200 group-hover:scale-115 ${colorClass}`}>
          {getIcon(type, isAlpha ? 'alpha' : isBeta ? 'beta' : undefined)}
        </div>

        {/* Regular label on hover if not hub */}
        {!isHubMarker && name && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-7 bg-slate-900/90 text-white text-[10px] font-medium px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
            {name}
          </div>
        )}
      </div>
    </Marker>
  );
}

