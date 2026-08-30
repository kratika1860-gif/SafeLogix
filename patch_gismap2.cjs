const fs = require('fs');

let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf8');

content = content.replace(
  /<BaseMap/,
  `<BaseMap\n        ref={mapRef}`
);

fs.writeFileSync('src/components/map/GISMap.tsx', content);
