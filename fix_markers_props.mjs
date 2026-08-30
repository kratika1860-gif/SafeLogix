import fs from 'fs';
let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf-8');

// Fix LogisticsMarker
content = content.replace(
  /<LogisticsMarker\s*key=\{cluster\.properties\.id\}\s*logistics=\{cluster\}\s*onClick=\{\(\) => setSelectedEntity\(cluster\.properties\.id, cluster\.properties\.type \|\| 'warehouse'\)\}\s*selected=\{selectedEntityId === cluster\.properties\.id\}\s*\/>/g,
  "<LogisticsMarker key={cluster.properties.id} logistic={cluster} onClick={() => setSelectedEntity(cluster.properties.id, cluster.properties.type || 'warehouse')} />"
);

// Fix IncidentMarker
content = content.replace(
  /<IncidentMarker\s*key=\{cluster\.properties\.id\}\s*incident=\{cluster\}\s*onClick=\{\(\) => setSelectedEntity\(cluster\.properties\.id, 'incident'\)\}\s*selected=\{selectedEntityId === cluster\.properties\.id\}\s*\/>/g,
  "<IncidentMarker key={cluster.properties.id} incident={cluster} onClick={() => setSelectedEntity(cluster.properties.id, 'incident')} />"
);

// We had an error with VehicleMarker? Let's check how VehicleMarker is called.
content = content.replace(
  /<VehicleMarker\s*key=\{vehicle\.properties\.id\}\s*vehicle=\{vehicle\}\s*onClick=\{setSelectedEntity\}\s*\/>/g,
  "<VehicleMarker key={vehicle.properties.id} vehicle={vehicle} onClick={() => setSelectedEntity(vehicle.properties.id, 'vehicle')} />"
);

fs.writeFileSync('src/components/map/GISMap.tsx', content);
