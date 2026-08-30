import React, { useEffect, useState } from 'react';
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
