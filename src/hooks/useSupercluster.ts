import { useState, useEffect, useRef, useMemo } from 'react';
import Supercluster from 'supercluster';
import { BBox, GeoJsonProperties } from 'geojson';

export interface UseSuperclusterProps<P extends GeoJsonProperties = GeoJsonProperties> {
  points: Array<Supercluster.PointFeature<P>>;
  bounds?: BBox | null;
  zoom: number;
  options?: Supercluster.Options<P, any>;
}

export function useSupercluster<P extends GeoJsonProperties = GeoJsonProperties>({
  points = [],
  bounds,
  zoom,
  options
}: UseSuperclusterProps<P>) {
  const superclusterRef = useRef<Supercluster<P, any> | null>(null);
  const [clusters, setClusters] = useState<Array<Supercluster.ClusterFeature<any> | Supercluster.PointFeature<P>>>([]);

  const optionsJson = JSON.stringify(options);

  useEffect(() => {
    try {
      const clusterer = new Supercluster<P, any>(options || {});
      clusterer.load(points || []);
      superclusterRef.current = clusterer;
    } catch (e) {
      console.warn("Supercluster load error:", e);
    }
  }, [points, optionsJson]);

  useEffect(() => {
    if (!superclusterRef.current) return;

    // Validate bounds format: [minX, minY, maxX, maxY]
    const isValidBBox = Array.isArray(bounds) && 
      bounds.length === 4 && 
      bounds.every(n => typeof n === 'number' && Number.isFinite(n));

    if (isValidBBox) {
      try {
        const safeZoom = Math.max(0, Math.min(24, Math.round(zoom || 11)));
        const res = superclusterRef.current.getClusters(bounds, safeZoom);
        setClusters(res);
      } catch (err) {
        console.warn("Supercluster getClusters error:", err);
        setClusters(points || []);
      }
    } else {
      // Fallback: show unclustered points when bounds are calculating
      setClusters(points || []);
    }
  }, [bounds, zoom, points, optionsJson]);

  return { clusters, supercluster: superclusterRef.current };
}
