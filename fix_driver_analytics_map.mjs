import fs from 'fs';
let content = fs.readFileSync('src/components/dashboard/DriverAnalyticsHome.tsx', 'utf-8');

content = content.replace(
  /longitude: 114.1694,\s*latitude: 22.3193,/g,
  'longitude: 91.7362,\n                    latitude: 26.1445,'
);

content = content.replace(
  /<Marker longitude=\{114.1900\} latitude=\{22.3350\}>/g,
  '<Marker longitude={91.78} latitude={26.17}>'
);

content = content.replace(
  /<Marker longitude=\{114.1500\} latitude=\{22.2850\}>/g,
  '<Marker longitude={91.7} latitude={26.12}>'
);

fs.writeFileSync('src/components/dashboard/DriverAnalyticsHome.tsx', content);
