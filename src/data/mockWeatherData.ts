export const mockPrecipitation = {
  type: 'FeatureCollection',
  features: [
    // Outer moderate rain area
    {
      type: 'Feature',
      properties: { intensity: 'moderate' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.60, 26.05],
          [91.90, 26.05],
          [91.90, 26.25],
          [91.60, 26.25],
          [91.60, 26.05]
        ]]
      }
    },
    // Inner heavy rain area
    {
      type: 'Feature',
      properties: { intensity: 'heavy' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.68, 26.10],
          [91.82, 26.10],
          [91.82, 26.20],
          [91.68, 26.20],
          [91.68, 26.10]
        ]]
      }
    },
    // Core critical storm cell
    {
      type: 'Feature',
      properties: { intensity: 'critical' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.72, 26.13],
          [91.78, 26.13],
          [91.78, 26.18],
          [91.72, 26.18],
          [91.72, 26.13]
        ]]
      }
    }
  ]
};
