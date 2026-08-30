const fs = require('fs');

const filesToPatch = [
  'src/pages/admin/CommandMap.tsx',
  'src/components/map/GISMap.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/components/dashboard/DriverAnalyticsHome.tsx',
  'src/pages/admin/SOSAlerts.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/mapStyle=\{theme === 'dark' \? "https:\/\/tiles\.openfreemap\.org\/styles\/dark_matter" : "https:\/\/tiles\.openfreemap\.org\/styles\/liberty"\}/g, `mapStyle="https://tiles.openfreemap.org/styles/liberty"`);
  fs.writeFileSync(file, content);
});
console.log('Patched style theme back');
