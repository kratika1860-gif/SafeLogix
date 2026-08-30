const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');

// Update StatCard
content = content.replace(
  'cn("bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm", alert ? "border-red-500 dark:border-red-500/50" : "border-slate-200 dark:border-slate-700")',
  'cn("bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-5 border shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300", alert ? "border-red-500/50 dark:border-red-500/30 shadow-red-500/10" : "border-slate-200/50 dark:border-slate-700/50")'
);

// Update map container
content = content.replace(
  'className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]"',
  'className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden flex flex-col h-[500px]"'
);

// Update charts container 1
content = content.replace(
  'className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"',
  'className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg"'
);

// Update charts container 2
content = content.replace(
  'className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-[400px]"',
  'className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg flex flex-col h-[400px]"'
);
// Replace global multiple times in case
content = content.replace(
  /className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-\[400px\]"/g,
  'className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg flex flex-col h-[400px]"'
);
content = content.replace(
  /className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm"/g,
  'className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-lg"'
);


fs.writeFileSync('src/pages/admin/AdminDashboard.tsx', content);
console.log('AdminDashboard patched');
