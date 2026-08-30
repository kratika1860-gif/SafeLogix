const fs = require('fs');
let code = fs.readFileSync('src/store/useAppStore.ts', 'utf8');

code = code.replace(/localStorage.setItem\('DEV_MOCK_TOKEN', 'DEV_MOCK_TOKEN'\);/g, "localStorage.setItem('DEV_MOCK_TOKEN', 'DEV_MOCK_ADMIN_TOKEN');");

fs.writeFileSync('src/store/useAppStore.ts', code);
