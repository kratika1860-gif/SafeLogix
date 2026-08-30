import React, { useMemo } from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useMapData } from '../../hooks/useMapData';

export default function AccessibleMapSummary() {
  const { data } = useMapData(null);
  const { layers } = useMapStore();

  const summary = useMemo(() => {
    if (!data) return 'Map data is loading or offline.';
    let text = 'Interactive map of NER Logistics. ';
    
    if (layers.accidents || layers.landslides || layers.floods || layers.roadClosures) {
      text += `There are ${data.incidents.length} active incidents. `;
    }
    if (layers.vehicles) {
      text += `There are ${data.vehicles.length} active vehicles. `;
    }
    if (layers.routes) {
      text += `There are ${data.routes.length} mapped routes. `;
    }

    return text;
  }, [data, layers]);

  return (
    <div className="sr-only" aria-live="polite">
      {summary}
      <ul>
        {data?.incidents.slice(0, 5).map(inc => (
          <li key={inc.properties.id}>
            {inc.properties.severity} incident at {inc.properties.title}: {inc.properties.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
