import fs from 'fs';
let content = fs.readFileSync('src/components/map/RoutePanel.tsx', 'utf-8');

content = content.replace(
  /const { selectedRouteId, setSelectedRouteId, mapDataTimestamp } = useMapStore\(\);/,
  'const { selectedEntityId, selectedEntityType, setSelectedEntity, mapDataTimestamp } = useMapStore();'
);

content = content.replace(
  /if \(!selectedRouteId\) return null;/g,
  "if (selectedEntityType !== 'route' || !selectedEntityId) return null;"
);

content = content.replace(
  /f.properties.id === selectedRouteId/g,
  "f.properties.id === selectedEntityId"
);

fs.writeFileSync('src/components/map/RoutePanel.tsx', content);
