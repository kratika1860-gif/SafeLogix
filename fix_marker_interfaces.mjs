import fs from 'fs';

const files = [
  'src/components/map/markers/LogisticsMarker.tsx',
  'src/components/map/markers/IncidentMarker.tsx',
  'src/components/map/markers/VehicleMarker.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/interface [a-zA-Z]+Props \{/g, '$&\n  key?: React.Key;');
    fs.writeFileSync(file, content);
  }
});
