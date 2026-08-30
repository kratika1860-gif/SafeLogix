import React, { useEffect, useState } from 'react';
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

      <div className={`p-8 rounded-xl border-2 transition-colors duration-500 ${active ? 'bg-red-50 dark:bg-red-900/10 border-red-500' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-6">
          <div className={`p-6 rounded-full ${active ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
            <ShieldAlert className="w-16 h-16" />
          </div>
          
          <div>
            <h3 className={`text-3xl font-black mb-2 ${active ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
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
            className={`px-8 py-4 rounded-xl font-black text-xl uppercase tracking-widest transition-all shadow-lg ${
              active 
                ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200' 
                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-500/25'
            }`}
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
