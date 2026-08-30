const fs = require('fs');

let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf8');

// Just replace `<Map` with `<BaseMap`
content = content.replace(/<Map/g, "<BaseMap");
// And remove `mapStyle="..."` and `style={{...}}`
content = content.replace(/mapStyle=".*?"/g, "");
content = content.replace(/style=\{\{.*?\}\}/g, "");
// Remove maplibre imports that might still be there like MapRef if they were stripped
// Wait, MapRef is used in `useRef<MapRef>` so we need it imported
content = content.replace(/import \{ Source, Layer, Marker \} from 'react-map-gl\/maplibre';/, "import { Source, Layer, Marker, MapRef } from 'react-map-gl/maplibre';");

fs.writeFileSync('src/components/map/GISMap.tsx', content);
