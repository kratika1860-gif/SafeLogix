import fs from 'fs';
let content = fs.readFileSync('src/components/map/MapLegend.tsx', 'utf-8');

const additionalRoutes = `
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 border-b-[3px] border-dashed border-red-500" />
                <span>Road Closure</span>
              </div>
`;

content = content.replace(
  '<span>Critical Risk Corridor</span>\n              </div>',
  '<span>Critical Risk Corridor</span>\n              </div>' + additionalRoutes
);

const additionalZones = `
          {/* Zones */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Zones</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-orange-700 bg-orange-500/40 rounded-sm" />
                <span>Incident Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-red-800 bg-red-600/30 rounded-sm" />
                <span>Critical Flood Zone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-orange-800 bg-orange-600/30 rounded-sm" />
                <span>High Flood Zone</span>
              </div>
            </div>
          </div>
`;

content = content.replace(
  '{/* Routes */}',
  additionalZones + '\n          {/* Routes */}'
);

fs.writeFileSync('src/components/map/MapLegend.tsx', content);
