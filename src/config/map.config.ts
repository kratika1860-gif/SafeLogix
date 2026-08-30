// MapLibre Map Style Specifications (Vector Liberty and Satellite Imagery)

const DEMO_GLYPHS = 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf';

export const OPENFREEMAP_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';

export const SATELLITE_STYLE = {
  version: 8,
  name: 'Satellite Imagery',
  glyphs: DEMO_GLYPHS,
  sources: {
    'esri-satellite-tiles': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export type MapStyleKey = 'vector' | 'satellite';

export const MAP_STYLES: Record<MapStyleKey, { id: MapStyleKey; name: string; icon: string; description: string; style: any }> = {
  vector: { 
    id: 'vector', 
    name: 'Vector Liberty', 
    icon: '⚡', 
    description: 'OpenFreeMap high-clarity vector terrain & road network',
    style: OPENFREEMAP_LIBERTY 
  },
  satellite: { 
    id: 'satellite', 
    name: 'Satellite Imagery', 
    icon: '🛰️', 
    description: 'High-resolution aerial satellite earth imagery',
    style: SATELLITE_STYLE 
  }
};

export const MAP_CONFIG = {
  provider: 'OpenFreeMap / Esri Satellite',
  defaultStyleKey: 'vector' as MapStyleKey,
  style: OPENFREEMAP_LIBERTY,
  fallbackStyle: SATELLITE_STYLE,
  initialLocation: {
    // Center of Guwahati / Assam NER
    longitude: 91.7362,
    latitude: 26.1445,
    zoom: 11.5
  },
  bounds: {
    // Bounding box for NER India
    southWest: [89.0, 22.0],
    northEast: [97.5, 29.5]
  },
  controls: {
    showNavigation: true,
    showFullscreen: true,
    showGeolocate: true,
    showScale: true
  }
};

