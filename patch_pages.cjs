const fs = require('fs');

const VehiclesTsx = `import React, { useEffect, useState } from 'react';
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
    fetchWithAuth(\`/api/admin/vehicles/\${id}\`, { method: 'DELETE' })
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
`;

const DriversTsx = `import React, { useEffect, useState } from 'react';
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
    fetchWithAuth(\`/api/admin/drivers/\${id}\`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) })
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
                    <span className={\`px-2 py-1 rounded text-xs font-bold capitalize \${d.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}\`}>
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
`;

const TripsTsx = `import React, { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { Navigation, Plus, AlertTriangle, CloudLightning, Activity, ShieldAlert, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Trips() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetchWithAuth('/api/admin/trips'),
      fetchWithAuth('/api/admin/drivers'),
      fetchWithAuth('/api/admin/vehicles')
    ]).then(([tData, dData, vData]) => {
      setTrips(tData);
      setDrivers(dData);
      setVehicles(vData);
    }).finally(() => setLoading(false));
  }, []);

  const createTrip = () => {
    if (drivers.length === 0 || vehicles.length === 0) return alert('Need at least 1 driver and 1 vehicle.');
    
    fetchWithAuth('/api/admin/trips', {
      method: 'POST',
      body: JSON.stringify({
        driverId: drivers[0].id,
        vehicleId: vehicles[0].id,
        cargoCategory: 'Emergency supplies', // Medicines, Food, Agricultural produce, Construction materials, Emergency supplies, Other
        priority: 'critical',
        startLocation: 'Central Warehouse',
        endLocation: 'Northern District Hub'
      })
    })
    .then(t => setTrips(prev => [t, ...prev]))
    .catch(console.error);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Trip Management & Intelligence</h2>
          <p className="text-slate-500">Monitor live supply runs and delay factors.</p>
        </div>
        <button onClick={createTrip} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
          <Plus className="w-5 h-5" /> New Trip
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {loading ? <div className="p-8 text-center text-slate-500">Loading trips...</div> : 
            trips.map(trip => (
              <div key={trip.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase", trip.priority === 'critical' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>
                      {trip.priority} Priority
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">#{trip.id.toString().padStart(4, '0')}</span>
                    <span className="px-2 py-1 bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded text-xs font-bold capitalize">{trip.status}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-600 dark:text-slate-400">{trip.cargoCategory}</div>
                </div>
                <div className="p-4 flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Origin</div>
                      <div className="font-medium text-slate-900 dark:text-white">{trip.startLocation}</div>
                    </div>
                    <Navigation className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Destination</div>
                      <div className="font-medium text-slate-900 dark:text-white">{trip.endLocation}</div>
                    </div>
                  </div>
                </div>
                
                {/* Delay Intelligence */}
                {trip.delayIntelligence && (
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 border-t border-amber-100 dark:border-amber-900/30">
                    <h4 className="text-xs font-bold text-amber-800 dark:text-amber-500 uppercase mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Delay Intelligence
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="block text-amber-700/70 dark:text-amber-500/70 text-xs">Expected Delay</span>
                        <span className="font-bold text-amber-900 dark:text-amber-400">{trip.delayIntelligence.expectedDelay}</span>
                      </div>
                      <div>
                        <span className="block text-amber-700/70 dark:text-amber-500/70 text-xs">Actual Delay</span>
                        <span className="font-bold text-amber-900 dark:text-amber-400">{trip.delayIntelligence.actualDelay}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-amber-700/70 dark:text-amber-500/70 text-xs">Primary Cause</span>
                        <span className="font-bold text-amber-900 dark:text-amber-400">{trip.delayIntelligence.cause}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 border-t border-amber-200/50 dark:border-amber-800/50 pt-3 text-xs">
                      <div className="flex items-center gap-1 text-amber-800 dark:text-amber-400">
                        <CloudLightning className="w-3 h-3"/> Weather: <span className="font-bold">{trip.delayIntelligence.weatherFactor}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-800 dark:text-amber-400">
                        <Navigation className="w-3 h-3"/> Route: <span className="font-bold">{trip.delayIntelligence.routeFactor}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-800 dark:text-amber-400">
                        <ShieldAlert className="w-3 h-3"/> Incident: <span className="font-bold">{trip.delayIntelligence.incidentFactor}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-white/50 dark:bg-black/20 p-2 rounded text-amber-900 dark:text-amber-300 text-xs">
                      <span className="font-bold">Recommended Action:</span> {trip.delayIntelligence.recommendedAction}
                    </div>
                  </div>
                )}
              </div>
            ))
          }
          {trips.length === 0 && !loading && <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">No active trips found. Create a new trip to start monitoring.</div>}
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-800 text-white rounded-xl p-5 shadow-lg">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-400">
              <Activity className="w-5 h-5" /> Cargo Categories Insight
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400" /> Medicines</span> <span className="font-bold">24%</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-400" /> Food</span> <span className="font-bold">38%</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-400" /> Agricultural</span> <span className="font-bold">12%</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400" /> Construction</span> <span className="font-bold">8%</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400" /> Emergency</span> <span className="font-bold">18%</span></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-bold mb-4 text-slate-900 dark:text-white">Active Reassignments</h3>
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              All routes are currently stable. No reassignments pending.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/Vehicles.tsx', VehiclesTsx);
fs.writeFileSync('src/pages/admin/Drivers.tsx', DriversTsx);
fs.writeFileSync('src/pages/admin/Trips.tsx', TripsTsx);

// Update App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const imports = `import Vehicles from './pages/admin/Vehicles';\nimport Drivers from './pages/admin/Drivers';\nimport Trips from './pages/admin/Trips';\n`;
appCode = appCode.replace("import Users from './pages/admin/Users';", imports + "import Users from './pages/admin/Users';");

const routes = `          <Route path="incidents" element={<Incidents />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="trips" element={<Trips />} />`;
appCode = appCode.replace('<Route path="incidents" element={<Incidents />} />', routes);
fs.writeFileSync('src/App.tsx', appCode);

// Update AdminLayout.tsx
let layoutCode = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');
const newLinks = `  { name: 'Incidents', icon: ShieldAlert, path: '/admin/incidents' },
  { name: 'Trips & Intelligence', icon: Truck, path: '/admin/trips' },
  { name: 'Vehicles', icon: MapIcon, path: '/admin/vehicles' },
  { name: 'Drivers', icon: User, path: '/admin/drivers' },`;
layoutCode = layoutCode.replace("{ name: 'Incidents', icon: ShieldAlert, path: '/admin/incidents' },", newLinks);
fs.writeFileSync('src/layouts/AdminLayout.tsx', layoutCode);
