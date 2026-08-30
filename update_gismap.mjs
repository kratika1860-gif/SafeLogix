import fs from 'fs';
let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf-8');

// Add import for the new service
if (!content.includes('fetchRoadClosures')) {
  content = content.replace(
    "import { useSupercluster } from '../../hooks/useSupercluster';",
    "import { useSupercluster } from '../../hooks/useSupercluster';\nimport { fetchRoadClosures, fetchIncidentZones, GeoJSONFeature } from '../../lib/api/roadClosureService';"
  );
}

// Add state for the new data
if (!content.includes('roadClosures')) {
  const stateToAdd = `
  const [roadClosures, setRoadClosures] = useState<GeoJSONFeature[]>([]);
  const [incidentZones, setIncidentZones] = useState<GeoJSONFeature[]>([]);

  useEffect(() => {
    const loadClosuresAndZones = async () => {
      try {
        const [closuresData, zonesData] = await Promise.all([
          fetchRoadClosures(),
          fetchIncidentZones()
        ]);
        setRoadClosures(closuresData);
        setIncidentZones(zonesData);
      } catch (e) {
        console.error('Failed to load closures and zones', e);
      }
    };
    loadClosuresAndZones();
  }, []);
`;
  content = content.replace(
    "const [viewState, setViewState] = useState<ViewState | null>(null);",
    "const [viewState, setViewState] = useState<ViewState | null>(null);" + stateToAdd
  );
}

// Add the Sources and Layers for road closures and incident zones
const layersToAdd = `
        {/* ROAD CLOSURES */}
        {layers.roadClosures && roadClosures.length > 0 && (
          <Source id="road-closures" type="geojson" data={{ type: 'FeatureCollection', features: roadClosures } as any}>
            <Layer
              id="road-closures-layer"
              type="line"
              paint={{
                'line-color': '#ef4444',
                'line-width': 6,
                'line-dasharray': [2, 1]
              }}
            />
          </Source>
        )}

        {/* INCIDENT ZONES (from new service) */}
        {(layers.floods || layers.waterlogging || layers.landslides) && incidentZones.length > 0 && (
          <Source id="incident-zones" type="geojson" data={{ type: 'FeatureCollection', features: incidentZones } as any}>
            <Layer
              id="incident-zones-layer"
              type="fill"
              paint={{
                'fill-color': '#f97316',
                'fill-opacity': 0.4
              }}
            />
            <Layer
              id="incident-zones-outline"
              type="line"
              paint={{
                'line-color': '#c2410c',
                'line-width': 2
              }}
            />
          </Source>
        )}
`;

content = content.replace(
  '{/* ZONES / POLYGONS */}',
  layersToAdd + '\n        {/* ZONES / POLYGONS */}'
);

fs.writeFileSync('src/components/map/GISMap.tsx', content);
