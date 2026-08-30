import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Truck, Plus, CheckCircle, XCircle } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/admin/vehicles')
      .then(setVehicles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addMockVehicle = () => {
    fetchWithAuth('/api/admin/vehicles', {
      method: 'POST',
      body: JSON.stringify({ make: 'Toyota', model: 'Hilux', year: 2024, licensePlate: 'NER-' + Math.floor(Math.random() * 10000) })
    })
    .then(v => setVehicles(prev => [...prev, v]))
    .catch(console.error);
  };

  const deactivateVehicle = (id: number) => {
    fetchWithAuth(`/api/admin/vehicles/${id}`, { method: 'DELETE' })
      .then(() => setVehicles(prev => prev.filter(v => v.id !== id)))
      .catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Vehicle Management</h2>
          <p className="text-slate-500">Manage fleet, tracking, and assignments.</p>
        </div>
        <button onClick={addMockVehicle} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
          <Plus className="w-5 h-5" /> Add Vehicle
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Loading fleet...</div> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-sm">
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Vehicle</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">License Plate</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Truck className="w-5 h-5" /></div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{v.make} {v.model}</div>
                        <div className="text-xs text-slate-500">{v.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-400">{v.licensePlate}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold capitalize">{v.status}</span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => deactivateVehicle(v.id)} className="text-red-500 hover:text-red-700 text-sm font-bold">Deactivate</button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-500">No active vehicles found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
