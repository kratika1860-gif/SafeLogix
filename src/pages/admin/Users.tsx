import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWithAuth } from '../../lib/api';
import { User, Shield, ShieldAlert, Navigation } from 'lucide-react';

interface AdminUser {
  id: number;
  uid: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export default function Users() {
  const { t } = useTranslation();
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/api/admin/users')
      .then((data) => {
        setUsersList(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Personnel Management</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage all staff across the platform.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-sm">
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Name</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Email</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">Role</th>
                  <th className="p-4 font-bold text-slate-700 dark:text-slate-300">ID</th>
                </tr>
              </thead>
              <tbody>
                {usersList.length > 0 ? (
                  usersList.map(u => (
                    <tr key={u.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                      <td className="p-4 text-sm font-medium text-slate-900 dark:text-slate-100">{u.firstName} {u.lastName}</td>
                      <td className="p-4 text-sm text-slate-500 dark:text-slate-400">{u.email}</td>
                      <td className="p-4 text-sm capitalize">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-md font-bold text-xs">{u.role.replace('_', ' ')}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-400 font-mono">{u.id}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No personnel found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
