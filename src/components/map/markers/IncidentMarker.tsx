import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { AlertTriangle, CloudRain, Droplets, MapPin, Activity, CheckCircle } from 'lucide-react';
import { LandslideHazardSvg } from './MapSvgIcons';

interface IncidentMarkerProps {
  key?: React.Key;
  incident: any;
  onClick: (incident: any) => void;
}

const severityConfig = {
  critical: 'bg-red-600 border-red-800 text-white animate-pulse',
  high: 'bg-orange-500 border-orange-700 text-white',
  medium: 'bg-amber-400 border-amber-600 text-slate-900',
  low: 'bg-blue-400 border-blue-600 text-white'
};

const getIcon = (type: string) => {
  switch (type) {
    case 'accident': return <AlertTriangle className="w-4 h-4" />;
    case 'landslide': return <LandslideHazardSvg className="w-4 h-4 text-white" />;
    case 'flood': return <Droplets className="w-4 h-4" />;
    case 'waterlogging': return <CloudRain className="w-4 h-4" />;
    case 'road_damage': return <Activity className="w-4 h-4" />;
    case 'road_closure': return <CheckCircle className="w-4 h-4" />;
    default: return <MapPin className="w-4 h-4" />;
  }
};

export default function IncidentMarker({ incident, onClick }: IncidentMarkerProps) {
  const [lng, lat] = incident.geometry.coordinates;
  const { type, severity, status } = incident.properties;

  const styleClass = severityConfig[severity as keyof typeof severityConfig] || severityConfig.low;
  const opacity = status === 'resolved' ? 'opacity-50 grayscale' : 'opacity-100';

  return (
    <Marker longitude={lng} latitude={lat} anchor="bottom" onClick={(e) => { e.originalEvent.stopPropagation(); onClick(incident); }}>
      <div className={`relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 group ${opacity}`}>
        <div className={`w-8 h-8 rounded-t-full rounded-bl-full rotate-45 border-2 shadow-lg flex items-center justify-center ${styleClass}`}>
          <div className="-rotate-45">
            {getIcon(type)}
          </div>
        </div>
      </div>
    </Marker>
  );
}
