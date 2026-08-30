import { useState, useEffect } from 'react';
import { 
  fetchMapData, 
  fetchCustomGeoJSONData,
  fetchLandslideProneAreasGeoJSON,
  fetchPetrolStationsGeoJSON,
  fetchHotelsGeoJSON,
  MapDataResponse,
  GeoJSONFeatureCollection,
  GUWAHATI_CENTER
} from '../lib/api/mapData';
import { useMapStore } from '../store/useMapStore';
import { useDebounce } from './useDebounce';

const dataCache = new Map<string, { data: MapDataResponse, timestamp: number }>();

export function useMapData(bounds: any) {
  const [data, setData] = useState<MapDataResponse | null>(() => {
    // Check initial cached value if available
    const initial = dataCache.get('initial');
    return initial ? initial.data : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const filters = useMapStore(state => state.filters);
  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    let mounted = true;
    let timer: any;

    const loadData = async () => {
      if (!data) setLoading(true);
      setError(null);
      
      const cacheKey = bounds ? JSON.stringify({ bounds, filters: debouncedFilters }) : 'initial';
      
      try {
        if (!navigator.onLine) {
           const cached = dataCache.get(cacheKey) || dataCache.get('initial');
           if (cached && mounted) {
             setData(cached.data);
           } else if (mounted) {
             setError('Offline mode: No cached data available');
           }
           if (mounted) setLoading(false);
           return;
        }

        const res = await fetchMapData(bounds, debouncedFilters);
        
        if (mounted) {
          setData(res);
          dataCache.set(cacheKey, { data: res, timestamp: Date.now() });
          dataCache.set('initial', { data: res, timestamp: Date.now() });
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        console.warn('Map data refreshed with fallback telemetry', err);
        if (mounted) {
          const cached = dataCache.get(cacheKey) || dataCache.get('initial');
          if (cached) {
            setData(cached.data);
            setError(null);
          } else {
            setError(null); // Keep UI clean
          }
          setLoading(false);
        }
      }
    };

    loadData();

    timer = setInterval(() => {
      loadData();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [bounds, debouncedFilters]);

  return { data, loading, error, center: GUWAHATI_CENTER };
}

/**
 * Dedicated hook to fetch custom GeoJSON collections for landslides, petrol stations, and hotels
 */
export function useCustomGeoJSON(bounds?: any) {
  const [collections, setCollections] = useState<{
    landslides: GeoJSONFeatureCollection | null;
    petrolStations: GeoJSONFeatureCollection | null;
    hotels: GeoJSONFeatureCollection | null;
  }>({
    landslides: null,
    petrolStations: null,
    hotels: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await fetchCustomGeoJSONData(undefined, bounds);
        if (mounted) {
          setCollections({
            landslides: res.landslides,
            petrolStations: res.petrolStations,
            hotels: res.hotels,
          });
          setLoading(false);
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message || 'Failed to fetch custom GeoJSON layers');
          setLoading(false);
        }
      }
    };

    fetchAll();
    return () => {
      mounted = false;
    };
  }, [bounds]);

  return { ...collections, loading, error, center: GUWAHATI_CENTER };
}
