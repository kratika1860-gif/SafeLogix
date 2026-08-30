import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { User, CheckCircle, XCircle } from 'lucide-react';

export default function Drivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/admin/drivers')
      .then(setDrivers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleApproval = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'suspended' : 'approved';
    fetchWithAuth(`/api/admin/drivers/${id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
      .then(() => {
        setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Driver Management</h2>
          <p className="text-slate-500">Approve, assign, and manage logistics personnel.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-500">Loading drivers...</div> : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-sm">
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Driver Name</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Email</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">License No.</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
                <th className="p-4 font-bold text-slate-700 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User className="w-5 h-5" /></div>
                      <div className="font-bold text-slate-900 dark:text-white">{d.firstName} {d.lastName}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{d.email}</td>
                  <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-400">{d.licenseNumber || 'Pending'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${d.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {d.status || 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => toggleApproval(d.id, d.status)} className="text-blue-600 hover:text-blue-800 text-sm font-bold">
                      {d.status === 'approved' ? 'Deactivate' : 'Approve'}
                    </button>
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No drivers found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
