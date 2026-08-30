const fs = require('fs');
let content = fs.readFileSync('src/layouts/DriverLayout.tsx', 'utf8');

// 1. Update main wrapper
content = content.replace(
  'className="flex flex-col md:flex-row h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100"',
  'className="flex flex-col md:flex-row h-screen w-full bg-transparent overflow-hidden text-slate-900 dark:text-slate-100 relative"'
);

// 2. Add Ambient Background
const ambientBg = `
      {/* Ambient Background for Glassmorphism */}
      <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-slate-950">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/20 dark:bg-blue-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-400/20 dark:bg-violet-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] right-[10%] w-[40%] h-[40%] rounded-full bg-teal-400/20 dark:bg-teal-600/10 blur-[120px] pointer-events-none" />
      </div>
`;
content = content.replace(
  '<div className="flex flex-col md:flex-row h-screen w-full bg-transparent overflow-hidden text-slate-900 dark:text-slate-100 relative">',
  '<div className="flex flex-col md:flex-row h-screen w-full bg-transparent overflow-hidden text-slate-900 dark:text-slate-100 relative">' + ambientBg
);

// 3. Desktop Sidebar
content = content.replace(
  'className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300"',
  'className="hidden md:flex flex-col w-64 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-700/30 text-slate-300 z-20 shadow-2xl"'
);

// 4. Mobile Header
content = content.replace(
  'className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0"',
  'className="md:hidden flex items-center justify-between p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shrink-0 z-20"'
);

// 5. Desktop Header
content = content.replace(
  'className="hidden md:flex items-center justify-end p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 shadow-sm relative"',
  'className="hidden md:flex items-center justify-end p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50 shrink-0 z-10 shadow-sm relative"'
);

fs.writeFileSync('src/layouts/DriverLayout.tsx', content);
console.log('DriverLayout patched');
