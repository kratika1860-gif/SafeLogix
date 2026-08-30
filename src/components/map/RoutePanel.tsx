import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import { mockRoutes } from '../../data/mockMapData';
import { Clock, ShieldAlert, Route, AlertCircle, CloudRain, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function RoutePanel() {
  const { selectedEntityId, selectedEntityType, setSelectedEntity, mapDataTimestamp } = useMapStore();
  
  if (selectedEntityType !== 'route' || !selectedEntityId) return null;
  
  const route = mockRoutes.features.find(f => f.properties.id === selectedEntityId)?.properties;
  if (!route) return null;

  return (
    <div className="absolute top-4 left-4 w-80 max-w-[calc(100vw-2rem)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/40 dark:border-slate-700/50 overflow-hidden flex flex-col max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-2rem)] z-10">
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Route className="w-4 h-4" />
            {route.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Data timestamp: {new Date(mapDataTimestamp).toLocaleTimeString()}
          </p>
        </div>
        <button 
          onClick={() => setSelectedEntity(null, null)}
          className="text-slate-400 hover:text-slate-600"
        >
          &times;
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* State Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-bold",
            route.accessibilityState === 'Open' ? "bg-green-100 text-green-700" :
            route.accessibilityState === 'High Risk' ? "bg-red-100 text-red-700" :
            "bg-yellow-100 text-yellow-700"
          )}>
            {route.accessibilityState}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-xs">Distance</span>
            </div>
            <p className="font-semibold text-slate-800">{route.distanceKm} km</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">ETA</span>
            </div>
            <p className="font-semibold text-slate-800">{route.estimatedTimeMin} min</p>
            {route.scores && route.scores.delayProbability > 20 && (
              <p className="text-xs text-red-500">Delay Risk: {route.scores.delayProbability}%</p>
            )}
          </div>
        </div>

        {/* AI Risk Explanation */}
        {route.scores && (
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
                <ShieldAlert className="w-4 h-4" />
                AI Risk Assessment
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Score: {route.scores.riskScore}/100
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/60 p-2 rounded text-xs">
                <div className="text-slate-500 mb-0.5">Safety</div>
                <div className="font-bold text-slate-700">{route.scores.safetyScore}/100</div>
              </div>
              <div className="bg-white/60 p-2 rounded text-xs">
                <div className="text-slate-500 mb-0.5">Confidence</div>
                <div className="font-bold text-slate-700">{route.scores.confidenceIndicator}</div>
              </div>
            </div>

            <p className="text-sm text-blue-900 leading-relaxed">
              {route.scores.explanation}
            </p>
          </div>
        )}

        {/* Conditions */}
        <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
          <CloudRain className="w-4 h-4" />
          <span>Weather: {route.weatherCondition}</span>
        </div>

        {/* Incidents List */}
        {route.incidents && route.incidents.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Known Incidents</h4>
            <div className="space-y-2">
              {route.incidents.map((inc: any) => (
                <div key={inc.id} className="flex gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">{inc.type.replace('_', ' ').toUpperCase()}</p>
                    <p className="text-xs text-red-700 mt-1">{inc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
