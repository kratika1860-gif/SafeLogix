import fs from 'fs';
let content = fs.readFileSync('src/components/map/RoutePanel.tsx', 'utf-8');

content = content.replace(
  'const { selectedRouteId, setSelectedRouteId } = useMapStore();',
  'const { selectedEntityId, selectedEntityType, setSelectedEntity } = useMapStore();'
);

content = content.replace(
  /selectedRouteId === route\.id/g,
  '(selectedEntityType === \'route\' && selectedEntityId === route.id)'
);

content = content.replace(
  /onClick=\{\(\) => setSelectedRouteId\(route\.id\)\}/g,
  "onClick={() => setSelectedEntity(route.id, 'route')}"
);

content = content.replace(
  /onClick=\{\(\) => setSelectedRouteId\(null\)\}/g,
  "onClick={() => setSelectedEntity(null, null)}"
);

fs.writeFileSync('src/components/map/RoutePanel.tsx', content);
