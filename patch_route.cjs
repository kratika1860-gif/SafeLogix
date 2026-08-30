const fs = require('fs');
let content = fs.readFileSync('src/components/map/RoutePanel.tsx', 'utf8');

content = content.replace(
  'className="absolute top-4 left-4 w-80 max-w-[calc(100vw-2rem)] bg-white shadow-xl rounded-xl border border-slate-200 overflow-hidden flex flex-col max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-2rem)] z-10"',
  'className="absolute top-4 left-4 w-80 max-w-[calc(100vw-2rem)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/40 dark:border-slate-700/50 overflow-hidden flex flex-col max-h-[calc(100vh-14rem)] sm:max-h-[calc(100vh-2rem)] z-10"'
);

fs.writeFileSync('src/components/map/RoutePanel.tsx', content);
console.log('RoutePanel patched');
