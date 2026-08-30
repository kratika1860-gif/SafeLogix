const fs = require('fs');
let content = fs.readFileSync('src/layouts/AdminLayout.tsx', 'utf8');

// 1. Update main wrapper background to transparent (since we'll add ambient bg)
content = content.replace(
  'className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden"',
  'className="flex h-screen w-full bg-transparent text-slate-900 dark:text-slate-100 overflow-hidden relative"'
);

// 2. Add Ambient Background
const ambientBg = `
      {/* Ambient Background for Glassmorphism */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/30 dark:bg-blue-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-emerald-400/20 dark:bg-emerald-600/10 blur-[120px] pointer-events-none" />
      </div>
`;
content = content.replace(
  '<div className="flex h-screen w-full bg-transparent text-slate-900 dark:text-slate-100 overflow-hidden relative">',
  '<div className="flex h-screen w-full bg-transparent text-slate-900 dark:text-slate-100 overflow-hidden relative">' + ambientBg
);

// 3. Update aside (sidebar)
content = content.replace(
  'className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0"',
  'className="w-64 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-700/30 text-slate-300 flex flex-col shrink-0 z-20 shadow-2xl"'
);

// 4. Update Header
content = content.replace(
  'className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0"',
  'className="h-16 flex items-center justify-between px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shrink-0 z-10"'
);

// 5. Update main content area
content = content.replace(
  'className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-6"',
  'className="flex-1 overflow-auto bg-transparent p-6"'
);

fs.writeFileSync('src/layouts/AdminLayout.tsx', content);
console.log('AdminLayout patched');
