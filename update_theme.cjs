const fs = require('fs');
let content = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// 1. Add Sun, Moon to lucide-react imports
content = content.replace(
  "Fingerprint, Eye, EyeOff } from 'lucide-react';",
  "Fingerprint, Eye, EyeOff, Sun, Moon } from 'lucide-react';"
);

// 2. Add useEffect to React imports
if (!content.includes("useEffect")) {
  content = content.replace("useState } from 'react'", "useState, useEffect } from 'react'");
}

// 3. Add isDark state
const stateInsert = `  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);`;
content = content.replace(
  "  const [loginSuccess, setLoginSuccess] = useState(false);\n  const [isHovered, setIsHovered] = useState(false);",
  stateInsert
);

// 4. Update the main background and add the toggle button
content = content.replace(
  '<div className="min-h-screen bg-[#2F3336] relative flex items-center justify-center p-4 sm:p-8 overflow-hidden">',
  `<div className={\`min-h-screen \${isDark ? 'bg-[#2F3336]' : 'bg-slate-100'} relative flex items-center justify-center p-4 sm:p-8 overflow-hidden transition-colors duration-500\`}>
      <button
        onClick={() => setIsDark(!isDark)}
        className={\`absolute top-6 right-6 p-3 rounded-full z-20 transition-all duration-300 \${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-lg' : 'bg-white text-slate-800 hover:bg-slate-50 shadow-md'}\`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
      </button>`
);

// 5. Update wrapper
content = content.replace(
  '<div className="relative z-10 w-full max-w-[1000px] bg-[#EAECEE] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">',
  '<div className={`relative z-10 w-full max-w-[1000px] ${isDark ? \'bg-slate-800\' : \'bg-[#EAECEE]\'} rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row transition-colors duration-500`}>'
);

// 6. Update form container
content = content.replace(
  'className="bg-white p-6 sm:p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] w-full"',
  'className={`p-6 sm:p-8 rounded-2xl w-full transition-colors duration-500 ${isDark ? \'bg-slate-900 shadow-xl\' : \'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]\'}`}'
);

// 7. Text colors
content = content.replace(
  '<Truck className="w-8 h-8 text-slate-800" />',
  '<Truck className={`w-8 h-8 ${isDark ? \'text-white\' : \'text-slate-800\'}`} />'
);
content = content.replace(
  '<h2 className="text-center text-2xl font-bold text-slate-800 mb-1">',
  '<h2 className={`text-center text-2xl font-bold mb-1 ${isDark ? \'text-white\' : \'text-slate-800\'}`}>'
);
content = content.replace(
  '<p className="text-center text-sm text-slate-500 mb-8">',
  '<p className={`text-center text-sm mb-8 ${isDark ? \'text-slate-400\' : \'text-slate-500\'}`}>'
);
content = content.replace(
  /<label className="block text-sm font-medium text-slate-700">/g,
  '<label className={`block text-sm font-medium ${isDark ? \'text-slate-300\' : \'text-slate-700\'}`}>'
);
content = content.replace(
  '<h3 className="text-lg font-bold text-slate-900">Reset Password</h3>',
  '<h3 className={`text-lg font-bold ${isDark ? \'text-white\' : \'text-slate-900\'}`}>Reset Password</h3>'
);

// 8. Inputs
content = content.replace(
  /className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-colors"/g,
  'className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-colors ${isDark ? \'bg-slate-800 border-slate-700 text-white placeholder-slate-500\' : \'bg-white border-slate-300 text-slate-900 placeholder-slate-400\'}`}'
);
content = content.replace(
  'className="appearance-none block w-full px-3 py-2 pr-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-colors"',
  'className={`appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-colors ${isDark ? \'bg-slate-800 border-slate-700 text-white placeholder-slate-500\' : \'bg-white border-slate-300 text-slate-900 placeholder-slate-400\'}`}'
);
content = content.replace(
  'className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"',
  'className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors ${isDark ? \'bg-slate-800 border-slate-700 text-white placeholder-slate-500\' : \'bg-white border-slate-300 text-slate-900 placeholder-slate-400\'}`}'
);

// 9. Buttons
content = content.replace(
  /className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"/g,
  'className={`w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-colors ${isDark ? \'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700\' : \'border-slate-300 bg-white text-slate-700 hover:bg-slate-50\'}`}'
);
content = content.replace(
  /className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors"/g,
  'className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors ${isDark ? \'bg-blue-600 hover:bg-blue-700 text-white\' : \'bg-slate-900 hover:bg-slate-800 text-white\'}`}'
);
content = content.replace(
  /className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors"/g,
  'className={`w-full flex justify-center items-center gap-2 py-2 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 transition-colors ${isDark ? \'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700\' : \'bg-white border-slate-300 text-slate-700 hover:bg-slate-50\'}`}'
);
content = content.replace(
  /className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"/g,
  'className={`w-full text-center text-sm font-medium transition-colors ${isDark ? \'text-slate-400 hover:text-white\' : \'text-slate-500 hover:text-slate-900\'}`}'
);

// 10. Separator
content = content.replace(
  '<div className="w-full border-t border-slate-200"></div>',
  '<div className={`w-full border-t ${isDark ? \'border-slate-700\' : \'border-slate-200\'}`}></div>'
);
content = content.replace(
  '<span className="px-2 bg-white text-slate-500">Or</span>',
  '<span className={`px-2 ${isDark ? \'bg-slate-900 text-slate-400\' : \'bg-white text-slate-500\'}`}>Or</span>'
);

// 11. Checkbox and labels
content = content.replace(
  '<label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">',
  '<label htmlFor="remember-me" className={`ml-2 block text-sm ${isDark ? \'text-slate-300\' : \'text-slate-900\'}`}>'
);
content = content.replace(
  'className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"',
  'className={`h-4 w-4 focus:ring-slate-900 rounded ${isDark ? \'text-blue-600 border-slate-600 bg-slate-800\' : \'text-slate-900 border-slate-300 bg-white\'}`}'
);
content = content.replace(
  '<button type="button" onClick={() => setMode(\'reset\')} className="font-medium text-slate-900 hover:text-slate-700">',
  '<button type="button" onClick={() => setMode(\'reset\')} className={`font-medium ${isDark ? \'text-slate-300 hover:text-white\' : \'text-slate-900 hover:text-slate-700\'}`}>'
);

fs.writeFileSync('src/pages/Login.tsx', content);
console.log('Theme toggle script complete.');
