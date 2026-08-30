const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/NotificationCenter.tsx', 'utf8');

content = content.replace(
  '"fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out",',
  '"fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl shadow-2xl border-l border-white/20 dark:border-slate-700/50 flex flex-col transform transition-transform duration-300 ease-in-out",'
);

fs.writeFileSync('src/components/dashboard/NotificationCenter.tsx', content);
console.log('NotificationCenter patched');
