const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

if (code.includes('VitePWA({')) {
  // Add workbox config to PWA
  code = code.replace(
    'registerType: \'autoUpdate\',', 
    'registerType: \'autoUpdate\',\n      workbox: {\n        maximumFileSizeToCacheInBytes: 5000000\n      },'
  );
  fs.writeFileSync('vite.config.ts', code);
  console.log('Patched vite.config.ts');
} else {
  console.log('VitePWA not found?');
}
