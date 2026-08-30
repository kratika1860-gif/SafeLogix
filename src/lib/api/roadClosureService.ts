export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: any;
}

export const fetchRoadClosures = async (): Promise<GeoJSONFeature[]> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 400));
  
  return [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.7, 26.2],
          [91.8, 26.3]
        ]
      },
      properties: { id: 'closure1', type: 'road_closure', severity: 'critical', name: 'NH-27 Blocked', reason: 'Landslide', expectedClearance: 'Unknown' }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [92.5, 25.8],
          [92.6, 25.9]
        ]
      },
      properties: { id: 'closure2', type: 'road_closure', severity: 'high', name: 'SH-10 Bridge Repair', reason: 'Bridge Damage', expectedClearance: '12 Hours' }
    }
  ];
};

export const fetchIncidentZones = async (): Promise<GeoJSONFeature[]> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 400));

  return [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.8, 26.1],
          [91.9, 26.1],
          [91.9, 26.2],
          [91.8, 26.2],
          [91.8, 26.1]
        ]]
      },
      properties: { id: 'zone2', type: 'incident_zone', severity: 'high', name: 'Evacuation Zone A' }
    }
  ];
};
