const fs = require('fs');
let content = fs.readFileSync('src/pages/DriverDashboard.tsx', 'utf8');

content = content.replace(
  'className="bg-white border-b border-slate-200 p-4 shrink-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"',
  'className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 p-4 shrink-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"'
);

content = content.replace(
  'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 z-20 border border-slate-200 dark:border-slate-700 w-[90%] max-w-sm text-center"',
  'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 z-20 border border-white/20 dark:border-slate-700/50 w-[90%] max-w-sm text-center"'
);

content = content.replace(
  'className="absolute top-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-200 flex items-center gap-2 z-10 animate-pulse"',
  'className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/20 dark:border-slate-700/50 flex items-center gap-2 z-10 animate-pulse"'
);

fs.writeFileSync('src/pages/DriverDashboard.tsx', content);
console.log('DriverDashboard patched');
