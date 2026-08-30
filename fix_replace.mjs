import fs from 'fs';
let content = fs.readFileSync('src/components/map/GISMap.tsx', 'utf-8');

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

fs.writeFileSync('src/components/map/GISMap.tsx', content);
