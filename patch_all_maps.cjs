const fs = require('fs');

function patchFile(filename) {
  let content = fs.readFileSync(filename, 'utf8');

  // Replace Map import
  content = content.replace(
    /import Map, \{ (.*?MapRef.*?) \} from 'react-map-gl\/maplibre';/,
    "import { $1 } from 'react-map-gl/maplibre';\nimport BaseMap from '../../components/map/BaseMap';"
  );
  content = content.replace(
    /import Map, \{ (.*?) \} from 'react-map-gl\/maplibre';/,
    "import { $1 } from 'react-map-gl/maplibre';\nimport BaseMap from '../../components/map/BaseMap';"
  );

  // If path differs, adjust import (e.g. DriverAnalyticsHome is one level deep)
  if (filename.includes('DriverAnalyticsHome.tsx')) {
    content = content.replace(
      /import BaseMap from '..\/..\/components\/map\/BaseMap';/,
      "import BaseMap from '../map/BaseMap';"
    );
  } else if (filename.includes('GISMap.tsx')) {
     content = content.replace(
      /import BaseMap from '..\/..\/components\/map\/BaseMap';/,
      "import BaseMap from './BaseMap';"
    );
  }

  // Replace <Map ...> with <BaseMap ref={mapRef} ...>
  // We need to be careful. The easiest way is to just replace "<Map" with "<BaseMap"
  // and "</Map>" with "</BaseMap>"
  // Remove NavigationControl, FullscreenControl, GeolocateControl from JSX as BaseMap provides them
  content = content.replace(/<Map/g, "<BaseMap");
  content = content.replace(/<\/Map>/g, "</BaseMap>");
  
  content = content.replace(/<NavigationControl[^>]*\/>/g, "");
  content = content.replace(/<FullscreenControl[^>]*\/>/g, "");
  content = content.replace(/<GeolocateControl[^>]*\/>/g, "");

  // Remove `mapStyle="..."` since BaseMap provides it
  content = content.replace(/mapStyle=".*?"/g, "");

  // Remove duplicate initialViewState or style
  // Keep initialViewState if it's there so it overrides, but remove style={{width...}}
  content = content.replace(/style=\{\{.*?\}\}/, "");

  fs.writeFileSync(filename, content);
}

['src/pages/admin/CommandMap.tsx', 
 'src/pages/admin/SOSAlerts.tsx', 
 'src/pages/admin/AdminDashboard.tsx',
 'src/components/dashboard/DriverAnalyticsHome.tsx'].forEach(patchFile);

