const fs = require('fs');

let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf8');

// Replace Map import
content = content.replace(
  /import Map, \{ Source, Layer, Marker, NavigationControl, MapRef \} from 'react-map-gl\/maplibre';/,
  "import { Source, Layer, Marker } from 'react-map-gl/maplibre';\nimport BaseMap from './BaseMap';"
);

// Replace Map Component
content = content.replace(
  /<Map\s+ref=\{mapRef\}\s+style=\{\{ width: '100%', height: '100%', position: 'absolute' \}\}\s+initialViewState=\{\{[\s\S]*?\}\}\s+mapStyle="https:\/\/tiles.openfreemap.org\/styles\/liberty"\s+onLoad=\{.*?\}\s+interactiveLayerIds=\{.*?\}\s+onClick=\{.*?\}>/,
  `<BaseMap
        onMapLoad={() => setIsMapLoaded(true)}
        interactiveLayerIds={['routes-layer']}
        onClick={handleRouteClick}
      >`
);

content = content.replace(
  /<NavigationControl position="bottom-right" \/>/,
  ""
);

content = content.replace(
  /<\/Map>/,
  "</BaseMap>"
);

fs.writeFileSync('src/components/map/GISMap.tsx', content);
