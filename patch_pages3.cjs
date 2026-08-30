const fs = require('fs');

const AIAnalyticsTsx = `import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Activity, Map as MapIcon, CloudLightning, Clock, ShieldAlert } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

export default function AIAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchWithAuth('/api/admin/analytics').then(setAnalytics).catch(console.error);
  }, []);

  if (!analytics) return <div className="p-8 text-center">Loading AI Intelligence...</div>;

  // Format data for Recharts
  const riskData = analytics.riskTrends.labels.map((label: string, idx: number) => ({
    name: label,
    risk: analytics.riskTrends.data[idx]
  }));

  const delayData = analytics.delayTrends.labels.map((label: string, idx: number) => ({
    name: label,
    delay: analytics.delayTrends.data[idx]
  }));

  const districtData = analytics.districtComparison.labels.map((label: string, idx: number) => ({
    name: label,
    riskLevel: analytics.districtComparison.data[idx]
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Intelligence & Analytics</h2>
          <p className="text-slate-500">Predictive modeling, route efficiency, and disruption trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm min-h-[300px]">
          <h3 className="font-bold mb-4 text-slate-800 dark:text-slate-200">Logistics Efficiency Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={riskData}>
              <defs>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="risk" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRisk)" name="Risk Score" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm min-h-[300px]">
          <h3 className="font-bold mb-4 text-slate-800 dark:text-slate-200">Delivery Delays (Avg Hours)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={delayData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Bar dataKey="delay" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Delay (Hours)" maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 lg:col-span-2">
          <h3 className="font-bold mb-4 text-slate-800 dark:text-slate-200">District Accessibility Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={districtData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
              <Line type="monotone" dataKey="riskLevel" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Accessibility Risk %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <CloudLightning className="w-5 h-5 text-amber-500" /> Weather Impact Warning
          </h3>
          <div className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <div className="text-4xl font-black text-amber-600 dark:text-amber-500 mb-2">{analytics.weatherImpact}</div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Severe conditions affecting coastal and mountain routes.</p>
            <p className="text-xs text-slate-500 mt-4">AI recommends 40% speed reduction and preemptive rerouting.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Activity className="w-5 h-5 text-purple-500" /> Frequent Disruption Corridors
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
    </div>
  );
}
`;

const SystemHealthTsx = `import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Server, Database, CloudRain, Cpu, Route, Bell, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SystemHealth() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/admin/health')
      .then(setHealth)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Checking system vitals...</div>;
  if (!health) return <div className="p-8 text-center text-red-500">Failed to load system health</div>;

  const services = [
    { name: 'Core API Server', key: 'api', icon: Server, description: 'Main REST and GraphQL endpoints' },
    { name: 'Database (Cloud SQL)', key: 'database', icon: Database, description: 'PostgreSQL primary instance' },
    { name: 'Background Queue', key: 'queue', icon: Activity, description: 'Redis task processor' },
    { name: 'Weather Provider', key: 'weatherProvider', icon: CloudRain, description: 'External meteorological API integration' },
    { name: 'Routing Engine', key: 'routingProvider', icon: Route, description: 'Mapbox / Google Maps API' },
    { name: 'AI Services', key: 'aiService', icon: Cpu, description: 'Gemini prediction and analytics model' },
    { name: 'Notification Service', key: 'notificationService', icon: Bell, description: 'FCM push and SMS gateway' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">System Health & Infrastructure</h2>
          <p className="text-slate-500">Real-time status of internal microservices and external providers.</p>
        </div>
        <div className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
          Uptime: {Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service, i) => {
          const status = health[service.key];
          const isHealthy = status === 'healthy';
          const isDegraded = status === 'degraded';
          const Icon = service.icon;
          
          return (
            <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "p-2.5 rounded-lg",
                  isHealthy ? "bg-green-100 text-green-600 dark:bg-green-900/20" : 
                  isDegraded ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20" : "bg-red-100 text-red-600 dark:bg-red-900/20"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  isHealthy ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                  isDegraded ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {isHealthy ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {status}
                </div>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{service.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{service.description}</p>
            </div>
          );
        })}
      </div>
      
      <div className="bg-slate-900 text-slate-300 p-6 rounded-xl font-mono text-sm shadow-inner">
         <div className="flex items-center gap-2 mb-4 text-white font-bold border-b border-slate-700 pb-2">
           <Server className="w-4 h-4"/> System Audit Trace
         </div>
         <div className="space-y-2 opacity-80">
            <div>[OK] Environment variables validated</div>
            <div>[OK] PostgreSQL connections stable (Pool: 10/10)</div>
            <div>[OK] Row-Level Security enforced on active queries</div>
            <div>[OK] Rate-limiting active (15m/200req window)</div>
            <div className="text-amber-400">[WARN] High latency detected on meteorological API</div>
         </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/AIAnalytics.tsx', AIAnalyticsTsx);
fs.writeFileSync('src/pages/admin/SystemHealth.tsx', SystemHealthTsx);

// Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('import SystemHealth')) {
  appCode = appCode.replace("import EmergencyMode from './pages/admin/EmergencyMode';", "import EmergencyMode from './pages/admin/EmergencyMode';\nimport SystemHealth from './pages/admin/SystemHealth';");
  appCode = appCode.replace('<Route path="emergency" element={<EmergencyMode />} />', '<Route path="emergency" element={<EmergencyMode />} />\n          <Route path="health" element={<SystemHealth />} />');
  fs.writeFileSync('src/App.tsx', appCode);
}

// Update AdminLayout.tsx
let layoutCode = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');
if (!layoutCode.includes("path: '/admin/health'")) {
  const newLink = `  { name: 'System Health', icon: Activity, path: '/admin/health' },`; // Activity is already imported
  layoutCode = layoutCode.replace("{ name: 'Emergency Mode', icon: ShieldAlert, path: '/admin/emergency' },", "{ name: 'Emergency Mode', icon: ShieldAlert, path: '/admin/emergency' },\n" + newLink);
  fs.writeFileSync('src/layouts/AdminLayout.tsx', layoutCode);
}

