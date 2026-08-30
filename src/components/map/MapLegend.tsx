import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Map, ShieldAlert, Truck, Package, AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react';
import { LandslideHazardSvg, PetrolPumpSvg, HotelLodgingSvg, RoadworkSvg } from './markers/MapSvgIcons';

export default function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 w-52 sm:w-72 overflow-hidden animate-in slide-in-from-bottom-4">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Guwahati Map Legend</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronUp className="w-4 h-4 text-slate-500" />}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4 max-h-[340px] overflow-y-auto">
          {/* Custom GeoJSON Points of Interest */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Custom Survey POIs</h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-red-600 border border-red-400 text-white flex items-center justify-center shadow-sm">
                  <LandslideHazardSvg className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Landslide-Prone Area</div>
                  <div className="text-[10px] text-slate-500">Kamakhya, Jorabat, Kharghuli</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-600 border border-cyan-400 text-white flex items-center justify-center shadow-sm">
                  <PetrolPumpSvg className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Petrol & EV Fast Station</div>
                  <div className="text-[10px] text-slate-500">IOCL, BPCL, Shell, HPCL 24/7</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-600 border border-indigo-400 text-white flex items-center justify-center shadow-sm">
                  <HotelLodgingSvg className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Hotel & Transit Lodging</div>
                  <div className="text-[10px] text-slate-500">Radisson Blu, Vivanta, Lodges</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-500 border border-amber-400 text-white flex items-center justify-center shadow-sm">
                  <RoadworkSvg className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Men at Work / Roadwork</div>
                  <div className="text-[10px] text-slate-500">Beltola, Airport VIP Rd, PWD</div>
                </div>
              </div>
            </div>
          </div>

          {/* Entities & Hubs */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Hubs & Logistics</h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 border border-blue-400 flex items-center justify-center text-white text-xs shadow-sm">
                  🏠
                </div>
                <span className="font-semibold text-blue-900 dark:text-blue-200">Hub Alpha (Garchuk West)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600 border border-purple-400 flex items-center justify-center text-white text-xs shadow-sm">
                  🏠
                </div>
                <span className="font-semibold text-purple-900 dark:text-purple-200">Hub Beta (Six Mile East)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span>Active Logistics Fleet</span>
              </div>
            </div>
          </div>

          {/* Incidents & Zones */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Incidents & Hazard Zones</h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-100 border border-red-500 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                </div>
                <span>Accident Alert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-red-700 bg-red-600/30 rounded-sm" />
                <span>Jorabat Landslide Zone (NH-6/27)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-blue-600 bg-blue-600/30" />
                <span>High Demand Zone (Guwahati)</span>
              </div>
            </div>
          </div>

          {/* Routes */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Corridors</h4>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-green-500 rounded-full" />
                <span>Open Safe Corridor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 border-b-2 border-dashed border-red-500" />
                <span>Critical Risk Mountain Pass</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
