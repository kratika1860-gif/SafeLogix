const fs = require('fs');
let content = fs.readFileSync('src/components/map/MapLegend.tsx', 'utf8');

content = content.replace(
  'className="absolute bottom-6 left-4 z-10 bg-white p-4 rounded-xl shadow-md border border-slate-200"',
  'className="absolute bottom-6 left-4 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/40 dark:border-slate-700/50"'
);

fs.writeFileSync('src/components/map/MapLegend.tsx', content);
console.log('MapLegend patched');
