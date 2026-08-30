const fs = require('fs');
let content = fs.readFileSync('./src/pages/Login.tsx', 'utf8');

if (!content.includes('EyeOff')) {
  content = content.replace('Fingerprint } from', 'Fingerprint, Eye, EyeOff } from');
}

content = content.replace(
  "const [resetSent, setResetSent] = useState(false);",
  "const [resetSent, setResetSent] = useState(false);\n  const [showPassword, setShowPassword] = useState(false);\n  const [loginSuccess, setLoginSuccess] = useState(false);\n  const [isHovered, setIsHovered] = useState(false);"
);

content = content.replace(
  "await signInWithEmailAndPassword(auth, email, password);\n      }\n      navigate('/');",
  "await signInWithEmailAndPassword(auth, email, password);\n      }\n      setLoginSuccess(true);\n      setTimeout(() => {\n        navigate('/');\n      }, 2000);"
);

content = content.replace(
  "localStorage.setItem('DEV_MOCK_TOKEN', role === 'admin' ? 'DEV_MOCK_ADMIN_TOKEN' : 'DEV_MOCK_TOKEN');\n      initializeAuth();",
  "localStorage.setItem('DEV_MOCK_TOKEN', role === 'admin' ? 'DEV_MOCK_ADMIN_TOKEN' : 'DEV_MOCK_TOKEN');\n      setLoginSuccess(true);\n      setTimeout(() => {\n        initializeAuth();\n      }, 2000);"
);

content = content.replace(
  '<div className="w-full md:w-[55%] h-[300px] md:h-auto md:min-h-[600px]">\n          <MascotScene />\n        </div>',
  '<div \n          className="w-full md:w-[55%] h-[300px] md:h-auto md:min-h-[600px]"\n          onMouseEnter={() => setIsHovered(true)}\n          onMouseLeave={() => setIsHovered(false)}\n        >\n          <MascotScene isHovered={isHovered} showPassword={showPassword} loginSuccess={loginSuccess} />\n        </div>'
);

content = content.replace(
  '<input\n                      type="password"\n                      required\n                      value={password}\n                      onChange={e => setPassword(e.target.value)}\n                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-colors"\n                      placeholder="••••••••"\n                    />',
  '<input\n                      type={showPassword ? "text" : "password"}\n                      required\n                      value={password}\n                      onChange={e => setPassword(e.target.value)}\n                      className="appearance-none block w-full px-3 py-2 pr-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-slate-900 focus:border-slate-900 sm:text-sm transition-colors"\n                      placeholder="••••••••"\n                    />\n                    <button\n                      type="button"\n                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"\n                      onClick={() => setShowPassword(!showPassword)}\n                    >\n                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}\n                    </button>'
);

fs.writeFileSync('./src/pages/Login.tsx', content);
console.log("Updated Login.tsx");
