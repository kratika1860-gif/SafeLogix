const fs = require('fs');

const code = `import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Filter, Layers, AlertTriangle, Truck, Package, Activity, Info, CheckCircle, XCircle, AlertCircle, ShieldAlert, Navigation, Map as MapIcon, ChevronDown, ChevronRight, BarChart2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- MOCK DATA ---
const MOCK_DISTRICTS = [
  {
    id: 'd1',
    name: 'Northern Highlands',
    connectivityScore: 42,
    routes: { open: 12, restricted: 8, closed: 5 },
    vehicles: 14,
    deliveries: 45,
    highRiskLocations: 3,
    incidents: 7,
    accessibility: {
      score: 38,
      trend: 'down',
      confidence: 'High',
      explanation: 'Recent landslides on Route 4A and 7B have severely impacted road accessibility. Flood risk remains high due to continuous rainfall.'
    }
  },
  {
    id: 'd2',
    name: 'Central Valley',
    connectivityScore: 88,
    routes: { open: 45, restricted: 2, closed: 0 },
    vehicles: 62,
    deliveries: 120,
    highRiskLocations: 1,
    incidents: 2,
    accessibility: {
      score: 92,
      trend: 'stable',
      confidence: 'High',
      explanation: 'Primary corridors are clear. Minimal weather impact. All major supply routes are functioning optimally.'
    }
  },
  {
    id: 'd3',
    name: 'Eastern Delta',
    connectivityScore: 65,
    routes: { open: 24, restricted: 12, closed: 2 },
    vehicles: 28,
    deliveries: 76,
    highRiskLocations: 4,
    incidents: 5,
    accessibility: {
      score: 55,
      trend: 'up',
      confidence: 'Medium',
      explanation: 'Flood waters receding, but secondary roads remain partially accessible. Route 12 cleared for emergency vehicles.'
    }
  }
];

const MOCK_GAPS = [
  {
    id: 'g1',
    type: 'Isolated District',
    severity: 'critical',
    title: 'Northern Highlands Isolation Risk',
    explanation: '3 out of 5 primary access routes are closed. Supply coverage for medical goods has dropped below 20%.'
  },
  {
    id: 'g2',
    type: 'Delayed Deliveries',
    severity: 'high',
    title: 'Eastern Delta Supply Bottleneck',
    explanation: 'Average delivery delay of 4.5 hours due to partial route restrictions on the main bridge.'
  },
  {
    id: 'g3',
    type: 'High-Risk Corridor',
    severity: 'warning',
    title: 'Valley-to-Highlands Route 7',
    explanation: 'Repeated landslide incidents reported. High probability of complete disruption in the next 48 hours.'
  }
];

export default function CommandMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [showGaps, setShowGaps] = useState(true);

  const [filters, setFilters] = useState({
    state: 'All',
    district: 'All',
    incidents: 'All',
    vehicles: 'All',
    routes: 'All',
    risk: 'All',
    time: '24h'
  });

  const selectedDistrict = MOCK_DISTRICTS.find(d => d.id === selectedDistrictId);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [114.1694, 22.3193], // Default center
        zoom: 9,
        attributionControl: false
      });
      
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        // Add mock emergency routes layer
        map.current?.addSource('emergency-routes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: { type: 'medical' },
                geometry: { type: 'LineString', coordinates: [[114.1, 22.3], [114.2, 22.4]] }
              }
            ]
          }
        });

        map.current?.addLayer({
          id: 'emergency-routes-line',
          type: 'line',
          source: 'emergency-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#3b82f6', 'line-width': 4, 'line-dasharray': [2, 2] }
        });
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="flex-1 flex h-[calc(100vh-64px)] overflow-hidden relative">
      
      {/* LEFT PANEL: Controls & Gaps */}
      <div className="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-10 shrink-0 h-full overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 sticky top-0 z-20">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-500" /> Map Controls
          </h2>
        </div>

        {/* Filters */}
        <div className="p-4 space-y-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">State / Region</label>
            <select className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm">
              <option>All States</option>
              <option>Northern Region</option>
              <option>Central Region</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">District</label>
            <select 
              className="w-full mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm"
              value={selectedDistrictId || ''}
              onChange={(e) => setSelectedDistrictId(e.target.value || null)}
            >
              <option value="">All Districts</option>
              {MOCK_DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Risk Level</label>
              <select className="w-full mt-1 p-1.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm">
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
              <select className="w-full mt-1 p-1.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-sm">
                <option>Live</option>
                <option>Last 24h</option>
                <option>Last 7d</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Map Layers</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Emergency Routes</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Active Incidents</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Active Vehicles</span>
              </label>
            </div>
          </div>
        </div>

        {/* Supply Gap Detection */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex-1">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3 text-slate-800 dark:text-slate-200">
            <BarChart2 className="w-4 h-4 text-purple-500" /> Supply Gap Intelligence
          </h3>
          <div className="space-y-3">
            {MOCK_GAPS.map(gap => (
              <div key={gap.id} className={cn(
                "p-3 rounded-lg border text-sm",
                gap.severity === 'critical' ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/50" : 
                gap.severity === 'high' ? "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/50" :
                "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/50"
              )}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {gap.severity === 'critical' ? <ShieldAlert className="w-4 h-4 text-red-600" /> : <AlertTriangle className="w-4 h-4 text-orange-500" />}
                  <span className={
                    gap.severity === 'critical' ? 'text-red-700 dark:text-red-400' :
                    gap.severity === 'high' ? 'text-orange-700 dark:text-orange-400' :
                    'text-amber-700 dark:text-amber-400'
                  }>{gap.title}</span>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">{gap.type}</div>
                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{gap.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CENTER: Map */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full bg-slate-100 dark:bg-slate-900" />
        
        {/* RIGHT PANEL: District View (Absolute) */}
        {selectedDistrict && (
          <div className="absolute top-4 right-14 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[calc(100vh-100px)] animate-in slide-in-from-right-8">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-start">
              <div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">District Overview</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDistrict.name}</h2>
              </div>
              <button onClick={() => setSelectedDistrictId(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 space-y-5">
              
              {/* Accessibility Score */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Activity className="w-4 h-4 text-blue-500" /> Accessibility Score
                  </h3>
                  <div className={cn(
                    "text-2xl font-bold",
                    selectedDistrict.accessibility.score >= 80 ? "text-green-600" :
                    selectedDistrict.accessibility.score >= 50 ? "text-amber-500" : "text-red-600"
                  )}>
                    {selectedDistrict.accessibility.score}/100
                  </div>
                </div>
                <div className="flex gap-4 mb-3 text-xs">
                  <span className="flex items-center gap-1 text-slate-500">
                    Trend: <span className="font-bold capitalize">{selectedDistrict.accessibility.trend}</span>
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    Confidence: <span className="font-bold">{selectedDistrict.accessibility.confidence}</span>
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                  <span className="font-bold block mb-1">AI Explanation:</span>
                  {selectedDistrict.accessibility.explanation}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 font-bold mb-1">Connectivity</div>
                  <div className="text-xl font-bold">{selectedDistrict.connectivityScore}%</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 font-bold mb-1">Open Incidents</div>
                  <div className="text-xl font-bold text-red-600">{selectedDistrict.incidents}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 font-bold mb-1">Active Vehicles</div>
                  <div className="text-xl font-bold text-blue-600">{selectedDistrict.vehicles}</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-lg">
                  <div className="text-xs text-slate-500 font-bold mb-1">Pending Deliveries</div>
                  <div className="text-xl font-bold text-orange-500">{selectedDistrict.deliveries}</div>
                </div>
              </div>

              {/* Routes Status */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">Route Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500"/> Open</span>
                    <span className="font-bold">{selectedDistrict.routes.open}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500"/> Restricted</span>
                    <span className="font-bold">{selectedDistrict.routes.restricted}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500"/> Closed</span>
                    <span className="font-bold">{selectedDistrict.routes.closed}</span>
                  </div>
                </div>
              </div>
              
              {/* Risks */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-200 dark:border-slate-700 pb-1">Risk Intelligence</h3>
                <div className="flex justify-between items-center text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-2 rounded">
                  <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4"/> High-Risk Locations</span>
                  <span className="font-bold">{selectedDistrict.highRiskLocations}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
`

fs.writeFileSync('src/pages/admin/CommandMap.tsx', code);
