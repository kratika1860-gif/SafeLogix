const fs = require('fs');

const AIAnalyticsTsx = `import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Activity, TrendingUp, TrendingDown, Map as MapIcon, CloudLightning, Clock, ShieldAlert } from 'lucide-react';

export default function AIAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchWithAuth('/api/admin/analytics').then(setAnalytics).catch(console.error);
  }, []);

  if (!analytics) return <div className="p-8 text-center">Loading AI Intelligence...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Intelligence & Analytics</h2>
          <p className="text-slate-500">Predictive modeling and historical disruption trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm col-span-2">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <TrendingUp className="w-5 h-5 text-blue-500" /> Risk Trends (Last 5 Days)
          </h3>
          <div className="flex h-48 items-end gap-2 mt-4">
            {analytics.riskTrends.data.map((val: number, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm" style={{ height: \`\${val * 3}%\` }}>
                  <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: '100%' }}></div>
                </div>
                <div className="text-xs text-slate-500 font-bold">{analytics.riskTrends.labels[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <MapIcon className="w-5 h-5 text-purple-500" /> District Risk Comparison
          </h3>
          <div className="space-y-4">
            {analytics.districtComparison.labels.map((label: string, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">
                  <span>{label}</span>
                  <span>{analytics.districtComparison.data[i]}% Risk</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className={\`h-2 rounded-full \${analytics.districtComparison.data[i] > 50 ? 'bg-red-500' : 'bg-amber-500'}\`} style={{ width: \`\${analytics.districtComparison.data[i]}%\` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Activity className="w-5 h-5 text-amber-500" /> Frequent Disruption Corridors
          </h3>
          <ul className="space-y-3">
            {analytics.frequentDisruptions.map((d: string, i: number) => (
              <li key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300">
                {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <ShieldAlert className="w-5 h-5 text-red-500" /> Predicted Disruptions (Next 48h)
          </h3>
          <ul className="space-y-3">
            {analytics.predictedDisruptions.map((d: string, i: number) => (
              <li key={i} className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-sm font-bold text-red-700 dark:text-red-400">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Clock className="w-5 h-5 text-blue-500" /> Delivery Delay Trends (Avg Hours)
          </h3>
          <div className="space-y-4 mt-6">
            {analytics.delayTrends.labels.map((label: string, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1 font-medium text-slate-700 dark:text-slate-300">
                  <span>{label}</span>
                  <span>{analytics.delayTrends.data[i]} hrs</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: \`\${analytics.delayTrends.data[i] * 20}%\` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center items-center text-center">
          <CloudLightning className="w-16 h-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Weather Impact Warning</h3>
          <div className="text-4xl font-black text-amber-600 dark:text-amber-500 mb-4">{analytics.weatherImpact}</div>
          <p className="text-sm text-slate-500 max-w-sm">Typhoon conditions are severely affecting coastal routes. Expect 40% reduction in average speed.</p>
        </div>
      </div>
    </div>
  );
}
`;

const AlertManagementTsx = `import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Bell, Plus, Users, MapPin, Truck } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AlertManagement() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/admin/alerts')
      .then(setAlerts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createMockAlert = () => {
    fetchWithAuth('/api/admin/alerts', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Flash Flood Warning - Route 4A',
        message: 'Avoid Route 4A. Flash floods reported. Seek alternate high-ground routes immediately.',
        severity: 'critical',
        targetDistricts: ['Northern Highlands'],
        targetDrivers: [],
        targetVehicles: [],
      })
    })
    .then(a => setAlerts([a, ...alerts]))
    .catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Alert Management</h2>
          <p className="text-slate-500">Broadcast targeted emergency and operational alerts.</p>
        </div>
        <button onClick={createMockAlert} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
          <Plus className="w-5 h-5" /> New Alert
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Loading alerts...</div> : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {alerts.map(a => (
              <div key={a.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      a.severity === 'critical' ? 'bg-red-100 text-red-600' : 
                      a.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                    )}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">{a.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{a.message}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4 ml-14">
                  {a.targetDistricts && a.targetDistricts.length > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                      <MapPin className="w-3 h-3" /> Districts: {a.targetDistricts.join(', ')}
                    </span>
                  )}
                  {a.targetDrivers && a.targetDrivers.length > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                      <Users className="w-3 h-3" /> Drivers: {a.targetDrivers.join(', ')}
                    </span>
                  )}
                  {a.targetVehicles && a.targetVehicles.length > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded">
                      <Truck className="w-3 h-3" /> Vehicles: {a.targetVehicles.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {alerts.length === 0 && <div className="p-8 text-center text-slate-500">No alerts broadcasted yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
`;

const EmergencyModeTsx = `import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { ShieldAlert, AlertTriangle, Activity, Navigation, HeartPulse } from 'lucide-react';

export default function EmergencyMode() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/admin/emergency-mode')
      .then(res => setActive(res.active))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleEmergencyMode = () => {
    if (!active) {
      if (!confirm('WARNING: Activating Emergency Operations Mode will override standard protocols and restrict non-essential fleet movements. Proceed?')) return;
    }
    
    fetchWithAuth('/api/admin/emergency-mode', {
      method: 'POST',
      body: JSON.stringify({ active: !active })
    })
    .then(res => setActive(res.active))
    .catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Emergency Operations Center</h2>
          <p className="text-slate-500">Global override for catastrophic events.</p>
        </div>
      </div>

      <div className={\`p-8 rounded-xl border-2 transition-colors duration-500 \${active ? 'bg-red-50 dark:bg-red-900/10 border-red-500' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}\`}>
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          <div className={\`p-6 rounded-full \${active ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}\`}>
            <ShieldAlert className="w-16 h-16" />
          </div>
          
          <div>
            <h3 className={\`text-3xl font-black mb-2 \${active ? 'text-red-600' : 'text-slate-900 dark:text-white'}\`}>
              {active ? 'EMERGENCY MODE ACTIVE' : 'STANDARD OPERATIONS'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {active 
                ? 'All non-essential logistics are currently suspended. System is prioritizing human safety, medical supply routes, and disaster recovery.' 
                : 'System is operating under normal logistics parameters. No global overrides are active.'}
            </p>
          </div>
          
          <button 
            disabled={loading}
            onClick={toggleEmergencyMode}
            className={\`px-8 py-4 rounded-xl font-black text-xl uppercase tracking-widest transition-all shadow-lg \${
              active 
                ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200' 
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/25'
            }\`}
          >
            {active ? 'Deactivate Emergency Mode' : 'Activate Emergency Mode'}
          </button>
        </div>
      </div>

      {active && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm">
             <h4 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                <AlertTriangle className="w-5 h-5"/> Prioritized Intelligence
             </h4>
             <ul className="space-y-4">
               <li className="flex items-start gap-3">
                 <HeartPulse className="w-5 h-5 text-red-500 mt-0.5 shrink-0"/>
                 <div>
                   <div className="font-bold text-slate-900 dark:text-white">Medical Supply Routes</div>
                   <p className="text-sm text-slate-600 dark:text-slate-400">Routes to District General and Northern Field Hospital are locked for exclusive emergency use.</p>
                 </div>
               </li>
               <li className="flex items-start gap-3">
                 <Navigation className="w-5 h-5 text-blue-500 mt-0.5 shrink-0"/>
                 <div>
                   <div className="font-bold text-slate-900 dark:text-white">Evacuation Corridors</div>
                   <p className="text-sm text-slate-600 dark:text-slate-400">Highway 7 is operating in reverse-flow to facilitate rapid civilian evacuation from the valley.</p>
                 </div>
               </li>
             </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm">
             <h4 className="font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                <Activity className="w-5 h-5"/> Live Affected Area Status
             </h4>
             <div className="space-y-3">
               <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/50">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Central Valley</span>
                  <span className="text-xs font-black uppercase text-red-600 bg-red-100 px-2 py-1 rounded">Critical Priority</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-100 dark:border-orange-900/50">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Northern Highlands</span>
                  <span className="text-xs font-black uppercase text-orange-600 bg-orange-100 px-2 py-1 rounded">High Priority</span>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/AIAnalytics.tsx', AIAnalyticsTsx);
fs.writeFileSync('src/pages/admin/AlertManagement.tsx', AlertManagementTsx);
fs.writeFileSync('src/pages/admin/EmergencyMode.tsx', EmergencyModeTsx);

// Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const imports = `import AIAnalytics from './pages/admin/AIAnalytics';\nimport AlertManagement from './pages/admin/AlertManagement';\nimport EmergencyMode from './pages/admin/EmergencyMode';\n`;
appCode = appCode.replace("import Trips from './pages/admin/Trips';", imports + "import Trips from './pages/admin/Trips';");

const routes = `          <Route path="analytics" element={<AIAnalytics />} />
          <Route path="alerts" element={<AlertManagement />} />
          <Route path="emergency" element={<EmergencyMode />} />`;
appCode = appCode.replace('<Route path="trips" element={<Trips />} />', '<Route path="trips" element={<Trips />} />\n' + routes);
fs.writeFileSync('src/App.tsx', appCode);

// Update AdminLayout.tsx
let layoutCode = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');
const newLinks = `  { name: 'Trips & Intelligence', icon: Truck, path: '/admin/trips' },
  { name: 'AI Analytics', icon: Activity, path: '/admin/analytics' },
  { name: 'Alerts', icon: Bell, path: '/admin/alerts' },
  { name: 'Emergency Mode', icon: ShieldAlert, path: '/admin/emergency' },`;
// need to import Activity, Bell, ShieldAlert if not imported. Wait, they are probably imported in AdminLayout, but let's check.
// Actually, I can just write them.
layoutCode = layoutCode.replace("{ name: 'Trips & Intelligence', icon: Truck, path: '/admin/trips' },", newLinks);

if (!layoutCode.includes('Activity')) {
   layoutCode = layoutCode.replace('import { LayoutDashboard', 'import { LayoutDashboard, Activity, Bell, ShieldAlert');
}

fs.writeFileSync('src/layouts/AdminLayout.tsx', layoutCode);
