const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/CommandMap.tsx', 'utf8');

const oldBlock = `          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Map Layers</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Emergency Routes</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Active Incidents</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Active Vehicles</span>
              </label>
            </div>
          </div>`;

const newBlock = `          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Map Layers</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Active Incidents</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Active Vehicles</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                <span>Standard Routes</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block mt-4">Emergency Route Highlights</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked className="rounded text-red-600 focus:ring-red-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Medical Supplies</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded text-green-600 focus:ring-green-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Food Supplies</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded text-purple-600 focus:ring-purple-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Disaster Response</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded text-orange-600 focus:ring-orange-500" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Emergency Evacuation</span>
              </label>
            </div>
          </div>`;

code = code.replace(oldBlock, newBlock);
fs.writeFileSync('src/pages/admin/CommandMap.tsx', code);
