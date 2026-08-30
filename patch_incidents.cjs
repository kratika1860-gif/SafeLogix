const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { AlertTriangle, MapPin, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Incidents() {
  const [data, setData] = useState<any>({ fieldReports: [], emergencyReports: [] });
  const [loading, setLoading] = useState(true);

  const fetchIncidents = () => {
    setLoading(true);
    fetchWithAuth('/api/admin/incidents')
      .then((res) => {
        setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const allReports = [
    ...(data.emergencyReports || []).map((r: any) => ({ ...r, source: 'Emergency', time: new Date(r.createdAt).toLocaleString(), isEmergency: true })),
    ...(data.fieldReports || []).map((r: any) => ({ ...r, source: 'Field Report', type: r.category, time: new Date(r.createdAt).toLocaleString(), isEmergency: false }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updateStatus = (id: number, isEmergency: boolean, newStatus: string) => {
    const endpoint = isEmergency ? \`/api/admin/incidents/emergency/\${id}\` : \`/api/admin/incidents/field/\${id}\`;
    const resolutionNotes = (newStatus === 'Rejected' || newStatus === 'Resolved') ? prompt(\`Enter \${newStatus.toLowerCase()} notes:\`) : '';
    if ((newStatus === 'Rejected' || newStatus === 'Resolved') && resolutionNotes === null) return;

    fetchWithAuth(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus, resolutionNotes })
    }).then(() => fetchIncidents()).catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Incident Center</h2>
          <p className="text-slate-500 dark:text-slate-400">Verify, escalate, and resolve active reports.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {allReports.length > 0 ? (
              allReports.map((r, i) => (
                <div key={i} className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/20">
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full mt-1", r.source === 'Emergency' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600')}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", r.source === 'Emergency' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white')}>
                          {r.source}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100">{r.type}</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          Status: {r.status}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">{r.description || 'No description provided.'}</p>
                      
                      {r.photoUrls && r.photoUrls.length > 0 && (
                         <div className="mt-2 text-blue-500 text-sm font-medium">View Photos ({r.photoUrls.length})</div>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {parseFloat(r.locationLat).toFixed(4)}, {parseFloat(r.locationLng).toFixed(4)}</span>
                        <span>{r.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex flex-wrap gap-2">
                    {r.status !== 'Resolved' && r.status !== 'Rejected' && (
                      <>
                        <select 
                          className="px-2 py-1.5 text-sm font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-slate-700 dark:text-slate-300"
                          onChange={(e) => updateStatus(r.id, r.isEmergency, e.target.value)}
                          value={r.status}
                        >
                          <option value="New">New</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Verified">Verified</option>
                          <option value="Assigned">Assigned</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                        <button onClick={() => updateStatus(r.id, r.isEmergency, 'Resolved')} className="px-3 py-1.5 text-sm font-bold bg-green-100 hover:bg-green-200 text-green-700 rounded flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Resolve</button>
                        <button onClick={() => updateStatus(r.id, r.isEmergency, 'Rejected')} className="px-3 py-1.5 text-sm font-bold bg-red-100 hover:bg-red-200 text-red-700 rounded flex items-center gap-1"><XCircle className="w-4 h-4"/> Reject (False)</button>
                      </>
                    )}
                    {(r.status === 'Resolved' || r.status === 'Rejected') && (
                       <div className="text-sm text-slate-500 italic flex items-center gap-1">
                          {r.status === 'Resolved' ? <CheckCircle className="w-4 h-4 text-green-500"/> : <XCircle className="w-4 h-4 text-red-500"/>}
                          {r.status}
                       </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                No active incidents.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/Incidents.tsx', code);
