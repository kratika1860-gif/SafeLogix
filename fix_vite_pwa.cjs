const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

// revert the duplicate
code = code.replace(/workbox: \{\n        maximumFileSizeToCacheInBytes: 5000000\n      \},/g, '');

// now find the actual workbox and inject
code = code.replace('workbox: {', 'workbox: {\n        maximumFileSizeToCacheInBytes: 5000000,');

fs.writeFileSync('vite.config.ts', code);
