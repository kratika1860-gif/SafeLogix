const fs = require('fs');
const filesToPatch = [
  'src/pages/admin/CommandMap.tsx',
  'src/components/map/GISMap.tsx',
  'src/pages/admin/AdminDashboard.tsx',
  'src/pages/admin/SOSAlerts.tsx',
  'src/components/dashboard/DriverAnalyticsHome.tsx'
];

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/api\.maps\.freeroute\.com/g, 'api.maps.freeroute.org');
  fs.writeFileSync(file, content);
});
console.log('Patched freeroute domain');
