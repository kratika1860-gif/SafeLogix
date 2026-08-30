import React from 'react';
import { Marker } from 'react-map-gl/maplibre';
import { Truck } from 'lucide-react';

interface VehicleMarkerProps {
  key?: React.Key;
  vehicle: any;
  onClick: (vehicle: any) => void;
}

export default function VehicleMarker({ vehicle, onClick }: VehicleMarkerProps) {
  const [lng, lat] = vehicle.geometry.coordinates;
  const { heading, status } = vehicle.properties;

  const isStale = Date.now() - vehicle.properties.timestamp > 10 * 60 * 1000; // 10 minutes
  
  return (
    <Marker longitude={lng} latitude={lat} anchor="center" onClick={(e) => { e.originalEvent.stopPropagation(); onClick(vehicle); }}>
      <div 
        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-md cursor-pointer transition-transform hover:scale-110 
          ${isStale ? 'bg-slate-300 border-slate-500' : 'bg-blue-500 border-white'}`}
        style={{ transform: `rotate(${heading}deg)` }}
      >
        <Truck className="w-4 h-4 text-white" />
      </div>
    </Marker>
  );
}
