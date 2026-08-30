import React, { useState, useEffect } from 'react';
import { ShieldAlert, Map, AlertTriangle, ArrowRight, CheckCircle, Navigation } from 'lucide-react';
import { RouteData, Incident } from '../../types';
import { generateAlternativeRoutes, RouteConditions } from '../../lib/intelligence';
import { useAppStore } from '../../store/useAppStore';

interface RerouteModalProps {
  onAccept: (routeId: string) => void;
  onReject: () => void;
  incident: Incident;
}

export default function RerouteModal({ onAccept, onReject, incident }: RerouteModalProps) {
  const [alternativeRoutes, setAlternativeRoutes] = useState<RouteData[]>([]);

  useEffect(() => {
    // Generate alternatives based on the incident
    const baseConditions: RouteConditions = {
      distanceKm: 15,
      baseTimeMin: 35,
      weather: 'Heavy Rain',
      floodRisk: 60,
      landslideRisk: 30,
      historicalDisruptionProbability: 20,
      trafficCongestion: 50,
      incidents: [incident],
      fieldReportsCount: 2
    };
    
    setAlternativeRoutes(generateAlternativeRoutes(baseConditions));
  }, [incident]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] p-4 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-red-600 p-4 text-white flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 animate-pulse mt-1" />
          <div>
            <h2 className="font-bold text-lg leading-tight uppercase tracking-wide">Critical Route Change Required</h2>
            <p className="text-red-100 text-sm mt-1 opacity-90 leading-relaxed">
              New incident reported ahead: {incident.type}. The current route is no longer safe.
            </p>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 bg-slate-50">
          <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-3">Alternative Routes</h3>
          
          <div className="space-y-3">
            {alternativeRoutes.map((route, idx) => (
              <div 
                key={route.id} 
                onClick={() => onAccept(route.id)}
                className="bg-white border-2 border-blue-100 hover:border-blue-500 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${route.routeType === 'Safest' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {route.routeType}
                    </span>
                    <span className="font-bold text-slate-800">{route.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{route.estimatedTimeMin} min</div>
                    <div className="text-xs text-slate-500">{route.distanceKm.toFixed(1)} km</div>
                  </div>
                </div>

                {route.scores && (
                  <div className="bg-slate-50 p-2 rounded text-xs mb-2 text-slate-600">
                    <div className="font-semibold mb-1">Why this route?</div>
                    {route.scores.explanation}
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs mt-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Safety Score: <span className="font-bold text-slate-800">{route.scores?.safetyScore}</span></span>
                  </div>
                  <div className="text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                    Accept Route <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-white border-t border-slate-100">
          <button 
            onClick={onReject}
            className="w-full py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Acknowledge but Keep Current Route (Not Recommended)
          </button>
        </div>
      </div>
    </div>
  );
}
