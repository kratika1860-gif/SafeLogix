const fs = require('fs');
let content = fs.readFileSync('src/components/navigation/BottomNav.tsx', 'utf8');

content = content.replace(
  'className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 pb-safe pt-2 h-16 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors"',
  'className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 dark:border-slate-800/50 flex justify-around items-center px-2 pb-safe pt-2 h-16 z-50 shadow-[0_-4px_20px_-1px_rgba(0,0,0,0.1)] transition-colors"'
);

fs.writeFileSync('src/components/navigation/BottomNav.tsx', content);
console.log('BottomNav patched');
