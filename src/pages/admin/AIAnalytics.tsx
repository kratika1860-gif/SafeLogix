import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Activity, CloudLightning, ShieldAlert, RefreshCw } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area
} from 'recharts';

const DEFAULT_ANALYTICS = {
  riskTrends: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [12, 19, 15, 25, 22, 18, 14] },
  districtComparison: { labels: ['Kamrup Metro', 'East Khasi Hills', 'Cachar', 'Nagaon', 'Dibrugarh'], data: [45, 80, 65, 30, 20] },
  frequentDisruptions: ['NH-6 Jorabat Hill Pass (Mudslide Risk)', 'Saraighat Bridge West Approach (Congestion)', 'Kharghuli Riverfront Slope (High Runoff)', 'Sonapur - Jagiroad Freight Bypass (Potholes)'],
  predictedDisruptions: ['NH-6 Border Pass (Heavy Rainfall Landslide Warning)', 'Silchar-Guwahati Southern Freight Corridor (Waterlogging)'],
  delayTrends: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [2.5, 3.1, 1.8, 2.0] },
  weatherImpact: 'High Monsoon Advisory'
};

export default function AIAnalytics() {
  const [analytics, setAnalytics] = useState<any>(DEFAULT_ANALYTICS);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = () => {
    setLoading(true);
    fetchWithAuth('/api/admin/analytics')
      .then((data) => {
        if (data && data.riskTrends) {
          setAnalytics(data);
        }
      })
      .catch((err) => {
        console.warn('Using cached AI analytics:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Format data for Recharts safely
  const riskData = (analytics?.riskTrends?.labels || []).map((label: string, idx: number) => ({
    name: label,
    risk: analytics.riskTrends.data[idx] || 0
  }));

  const delayData = (analytics?.delayTrends?.labels || []).map((label: string, idx: number) => ({
    name: label,
    delay: analytics.delayTrends.data[idx] || 0
  }));

  const districtData = (analytics?.districtComparison?.labels || []).map((label: string, idx: number) => ({
    name: label,
    riskLevel: analytics.districtComparison.data[idx] || 0
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AI Intelligence & Predictive Analytics</h2>
          <p className="text-slate-500">Predictive modeling, route efficiency, and disruption trends for Northeast India.</p>
        </div>
        <button 
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg text-xs font-bold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
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
            <div className="text-2xl font-black text-amber-600 dark:text-amber-500 mb-2">{analytics.weatherImpact || 'High Precipitation'}</div>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-400">Severe monsoon conditions affecting mountain corridors and river crossings.</p>
            <p className="text-[11px] text-slate-500 mt-3">AI recommends 40% speed reduction and preemptive bypass routing via Saraighat.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Activity className="w-5 h-5 text-purple-500" /> Frequent Disruption Corridors
          </h3>
          <ul className="space-y-3">
            {(analytics.frequentDisruptions || []).map((d: string, i: number) => (
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
            {(analytics.predictedDisruptions || []).map((d: string, i: number) => (
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
