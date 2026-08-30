import { AlertTriangle } from 'lucide-react';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Source, Layer, Marker, MapRef, ViewState } from 'react-map-gl/maplibre';
import BaseMap from './BaseMap';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStore } from '../../store/useMapStore';
import { useAppStore } from '../../store/useAppStore';
import { useMapData } from '../../hooks/useMapData';
import { useSupercluster } from '../../hooks/useSupercluster';
import { fetchRoadClosures, fetchIncidentZones, GeoJSONFeature } from '../../lib/api/roadClosureService';
import { mockPrecipitation } from '../../data/mockWeatherData';
import bbox from '@turf/bbox';
import circle from '@turf/circle';

import VehicleMarker from './markers/VehicleMarker';
import IncidentMarker from './markers/IncidentMarker';
import LogisticsMarker from './markers/LogisticsMarker';
import PoiMarker from './markers/PoiMarker';
import LandslideProneMarker from './markers/LandslideProneMarker';
import PetrolStationMarker from './markers/PetrolStationMarker';
import HotelMarker from './markers/HotelMarker';
import MapLayers from './MapLayers';
import EntityDetailPanel from './EntityDetailPanel';
import DemoModeIndicator from './DemoModeIndicator';
import ConnectionStatus from './ConnectionStatus';
import AccessibleMapSummary from './AccessibleMapSummary';
import MapLegend from './MapLegend';

export default function GISMap() {
  const { 
    layers, 
    emergencyRouteTypes,
    flyToTarget,
    selectedEntityId, 
    setSelectedEntityId, 
    setSelectedEntity, 
    setIsMapLoaded 
  } = useMapStore();
  const { currentLocation } = useAppStore();
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState<ViewState | null>(null);
  const [roadClosures, setRoadClosures] = useState<GeoJSONFeature[]>([]);
  const [incidentZones, setIncidentZones] = useState<GeoJSONFeature[]>([]);

  // Reactively execute flyTo when requested by store
  useEffect(() => {
    if (flyToTarget && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToTarget.longitude, flyToTarget.latitude],
        zoom: flyToTarget.zoom || 13.5,
        duration: 1200,
        essential: true
      });
    }
  }, [flyToTarget?.timestamp, flyToTarget?.longitude, flyToTarget?.latitude]);

  // High Demand Zone polygon in Guwahati central
  const highDemandZonePolygon = useMemo(() => {
    try {
      return circle([91.78, 26.17], 2.0, { units: 'kilometers', steps: 64 });
    } catch (e) {
      return null;
    }
  }, []);

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

  // Throttle map moves to update bounds
  const handleMoveEnd = (e: any) => {
    setViewState(e.viewState);
  };

  const bounds = useMemo(() => {
    if (!mapRef.current) return null;
    const b = mapRef.current.getBounds();
    return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
  }, [viewState]);

  const { data, loading, error } = useMapData(bounds);

  // CLUSTERING INCIDENTS (Accidents, Floods, Waterlogging, Active Road Closures)
  const incidentPoints = useMemo(() => {
    if (!data?.incidents) return [];
    return data.incidents
      .filter((i: any) => {
        const type = i.properties.type;
        if (!layers.criticalAlerts) {
          if (type === 'accident' && !layers.accidents) return false;
          if (type === 'landslide' && !layers.landslides) return false;
          if (type === 'flood' && !layers.floods) return false;
          if (type === 'waterlogging' && !layers.waterlogging) return false;
          if (type === 'road_damage' && !layers.roadDamage) return false;
          if (type === 'bridge_damage' && !layers.bridgeDamage) return false;
          if (type === 'road_closure' && !layers.roadClosures) return false;
        } else {
          if (type === 'accident' && layers.accidents === false) return false;
          if (type === 'landslide' && layers.landslides === false) return false;
          if (type === 'flood' && layers.floods === false) return false;
          if (type === 'waterlogging' && layers.waterlogging === false) return false;
          if (type === 'road_damage' && layers.roadDamage === false) return false;
          if (type === 'bridge_damage' && layers.bridgeDamage === false) return false;
          if (type === 'road_closure' && layers.roadClosures === false) return false;
        }
        return true;
      })
      .map((i: any) => ({
        type: 'Feature' as const,
        properties: { cluster: false, id: i.properties.id, category: 'incident', ...i.properties },
        geometry: { type: 'Point' as const, coordinates: i.geometry.coordinates }
      }));
  }, [data?.incidents, layers.criticalAlerts, layers.accidents, layers.landslides, layers.floods, layers.waterlogging, layers.roadDamage, layers.bridgeDamage, layers.roadClosures]);

  const { clusters: incidentClusters, supercluster: incidentSupercluster } = useSupercluster({
    points: incidentPoints as any,
    bounds: bounds as any,
    zoom: viewState?.zoom || 11.5,
    options: { radius: 50, maxZoom: 12 }
  });

  // CLUSTERING LOGISTICS
  const logisticsPoints = useMemo(() => {
    if (!data?.logistics) return [];
    return data.logistics
      .filter((l: any) => {
        const type = l.properties.type;
        if (type === 'warehouse' && !layers.warehouses) return false;
        if (type === 'checkpoint' && !layers.checkpoints) return false;
        if (type === 'delivery' && !layers.deliveryLocations) return false;
        return true;
      })
      .map((l: any) => ({
        type: 'Feature' as const,
        properties: { cluster: false, id: l.properties.id, category: 'logistics', ...l.properties },
        geometry: { type: 'Point' as const, coordinates: l.geometry.coordinates }
      }));
  }, [data?.logistics, layers.warehouses, layers.checkpoints, layers.deliveryLocations]);

  const { clusters: logisticsClusters, supercluster: logisticsSupercluster } = useSupercluster({
    points: logisticsPoints as any,
    bounds: bounds as any,
    zoom: viewState?.zoom || 11.5,
    options: { radius: 60, maxZoom: 12 }
  });

  // Filtered remaining POIs (roadwork / men at work, restaurants)
  const visibleRemainingPois = useMemo(() => {
    if (!data?.pois) return [];
    return data.pois.filter((poi: any) => {
      const type = poi.properties.type;
      // Skip petrol stations, hotels, and landslide prone points as they have dedicated components
      if (type === 'petrol_station' || type === 'hotel' || type === 'landslide_prone_area') return false;
      if (type === 'roadwork' && !layers.roadwork) return false;
      if (type === 'restaurant' && !layers.restaurants) return false;
      return true;
    });
  }, [data?.pois, layers.roadwork, layers.restaurants]);

  const handleRouteClick = (e: any) => {
    if (e.features && e.features.length > 0) {
      const featureId = e.features[0].properties.id;
      setSelectedEntity(featureId, 'route');
    }
  };

  const handleZoneClick = (e: any) => {
    if (e.features && e.features.length > 0) {
      const featureId = e.features[0].properties.id;
      setSelectedEntity(featureId, 'incident');
    }
  };

  const activeRoute = useMemo(() => {
    if (!data) return null;
    return data.routes.find((f: any) => f.properties.id === selectedEntityId);
  }, [data, selectedEntityId]);

  // Filtered emergency routes based on active emergency sub-categories
  const emergencyRouteFeatures = useMemo(() => {
    if (!data?.routes) return [];
    return data.routes.filter((r: any) => {
      if (r.properties.type !== 'emergency_route') return false;
      const cat = r.properties.emergencyCategory;
      if (cat === 'medical' && !emergencyRouteTypes?.medical) return false;
      if (cat === 'food' && !emergencyRouteTypes?.food) return false;
      if (cat === 'disaster' && !emergencyRouteTypes?.disaster) return false;
      if (cat === 'evacuation' && !emergencyRouteTypes?.evacuation) return false;
      return true;
    });
  }, [data?.routes, emergencyRouteTypes]);

  useEffect(() => {
    if (activeRoute && mapRef.current) {
      const [minLng, minLat, maxLng, maxLat] = bbox(activeRoute as any);
      mapRef.current.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 40, duration: 1000 }
      );
    }
  }, [activeRoute]);

  const handleMarkerClick = (feature: any, type: any) => {
    setSelectedEntity(feature.properties.id, type);
  };

  return (
    <div className="w-full h-full relative bg-slate-100 dark:bg-slate-900">
      <BaseMap
        ref={mapRef}
        showSearch={false}
        onMoveEnd={handleMoveEnd}
        onLoad={(e: any) => {
          setIsMapLoaded(true);
          const center = e.target.getCenter();
          setViewState({ 
            longitude: center.lng, 
            latitude: center.lat, 
            zoom: e.target.getZoom(),
            bearing: 0,
            pitch: 0,
            padding: { top: 0, bottom: 0, left: 0, right: 0 }
          });
        }}
        interactiveLayerIds={['routes-layer', 'zones-layer', 'corridors-layer', 'emergency-routes-line']}
        onClick={(e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features[0];
            const layerId = feature.layer.id;
            if (layerId.includes('zone')) {
              setSelectedEntity(feature.properties.id, 'incident');
            } else {
              setSelectedEntity(feature.properties.id, 'route');
            }
          }
        }}
      >
        
        {/* WEATHER PRECIPITATION RADAR OVERLAY */}
        {layers.weatherRisk && (
          <Source id="weather-radar-cells" type="geojson" data={mockPrecipitation as any}>
            <Layer
              id="weather-radar-fill"
              type="fill"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'intensity'],
                  'critical', '#dc2626',
                  'heavy', '#ea580c',
                  'moderate', '#3b82f6',
                  '#60a5fa'
                ],
                'fill-opacity': [
                  'match',
                  ['get', 'intensity'],
                  'critical', 0.40,
                  'heavy', 0.30,
                  'moderate', 0.20,
                  0.15
                ]
              }}
            />
            <Layer
              id="weather-radar-outline"
              type="line"
              paint={{
                'line-color': [
                  'match',
                  ['get', 'intensity'],
                  'critical', '#b91c1c',
                  'heavy', '#c2410c',
                  'moderate', '#2563eb',
                  '#3b82f6'
                ],
                'line-width': 1.5,
                'line-opacity': 0.7
              }}
            />
          </Source>
        )}

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

        {/* INCIDENT ZONES (from service) */}
        {(layers.criticalAlerts || layers.floods || layers.waterlogging || layers.landslides) && incidentZones.length > 0 && (
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

        {/* ZONES / POLYGONS (Flood Zones & Jorabat Landslide Zone) */}
        {(layers.criticalAlerts || layers.floods || layers.waterlogging || layers.landslides || layers.landslideZones) && data?.zones && (
          <Source 
            id="zones" 
            type="geojson" 
            data={{ 
              type: 'FeatureCollection', 
              features: data.zones.filter((z: any) => {
                if (z.properties.type === 'landslide_zone' && !layers.landslideZones && !layers.landslides && !layers.criticalAlerts) return false;
                if (z.properties.type === 'flood_zone' && !layers.floods && !layers.waterlogging && !layers.criticalAlerts) return false;
                return true;
              }) 
            } as any}
          >
            <Layer
              id="zones-layer"
              type="fill"
              paint={{
                'fill-color': [
                  'match',
                  ['get', 'type'],
                  'landslide_zone', '#dc2626',
                  'flood_zone', '#ea580c',
                  '#3b82f6'
                ],
                'fill-opacity': 0.35
              }}
            />
            <Layer
              id="zones-outline"
              type="line"
              paint={{
                'line-color': [
                  'match',
                  ['get', 'type'],
                  'landslide_zone', '#991b1b',
                  'flood_zone', '#9a3412',
                  '#1d4ed8'
                ],
                'line-width': 2.5
              }}
            />
          </Source>
        )}

        {/* ROUTES */}
        {(layers.routes || layers.roadAccessibility) && data?.routes && (
          <Source id="routes" type="geojson" data={{ type: 'FeatureCollection', features: data.routes.filter((r: any) => r.properties.type !== 'high_risk_corridor') } as any}>
            <Layer
              id="routes-layer"
              type="line"
              paint={{
                'line-color': [
                  'match',
                  ['get', 'accessibility'],
                  'open', '#22c55e',
                  'restricted', '#f59e0b',
                  'closed', '#dc2626',
                  '#9ca3af'
                ],
                'line-width': 5,
                'line-opacity': 0.85
              }}
            />
          </Source>
        )}

        {/* HIGH RISK CORRIDORS */}
        {layers.highRiskCorridors && data?.routes && (
          <Source id="corridors" type="geojson" data={{ type: 'FeatureCollection', features: data.routes.filter((r: any) => r.properties.type === 'high_risk_corridor') } as any}>
            <Layer
              id="corridors-layer"
              type="line"
              paint={{
                'line-color': [
                  'match',
                  ['get', 'risk'],
                  'critical', '#dc2626',
                  'high', '#ea580c',
                  'moderate', '#ca8a04',
                  'low', '#3b82f6',
                  '#9ca3af'
                ],
                'line-width': 10,
                'line-opacity': 0.6,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {/* EMERGENCY PRIORITY CORRIDORS (Medical, Food, SDRF Disaster, Fuel) */}
        {layers.emergencyRoutes && emergencyRouteFeatures.length > 0 && (
          <Source id="emergency-routes" type="geojson" data={{ type: 'FeatureCollection', features: emergencyRouteFeatures } as any}>
            <Layer
              id="emergency-routes-glow"
              type="line"
              paint={{
                'line-color': ['coalesce', ['get', 'color'], '#ef4444'],
                'line-width': 12,
                'line-opacity': 0.35,
                'line-blur': 4
              }}
            />
            <Layer
              id="emergency-routes-line"
              type="line"
              paint={{
                'line-color': ['coalesce', ['get', 'color'], '#ef4444'],
                'line-width': 5,
                'line-opacity': 0.95,
                'line-dasharray': [3, 1.5]
              }}
            />
          </Source>
        )}

        {/* Selected Route Highlight */}
        {activeRoute && (
          <Source id="selected-route" type="geojson" data={activeRoute as any}>
            <Layer
              id="selected-route-layer"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 8,
                'line-opacity': 0.5
              }}
            />
          </Source>
        )}

        {/* HIGH DEMAND ZONE OVERLAY (Guwahati Central) */}
        {layers.highDemandZones && highDemandZonePolygon && (
          <Source id="high-demand-zone-gis" type="geojson" data={highDemandZonePolygon as any}>
            <Layer
              id="high-demand-gis-fill"
              type="fill"
              paint={{
                'fill-color': '#3b82f6',
                'fill-opacity': 0.30
              }}
            />
            <Layer
              id="high-demand-gis-line"
              type="line"
              paint={{
                'line-color': '#1d4ed8',
                'line-width': 2,
                'line-opacity': 0.60,
                'line-dasharray': [3, 2]
              }}
            />
          </Source>
        )}

        {/* High Demand Zone Tag Marker (Guwahati Central / Zoo Road) */}
        {layers.highDemandZones && (
          <Marker longitude={91.78} latitude={26.17} anchor="center">
            <div className="bg-blue-600/30 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 border border-blue-400/40 pointer-events-none select-none">
              <span className="w-2 h-2 rounded-full bg-blue-300 animate-ping" />
              High Demand Zone
            </div>
          </Marker>
        )}

        {/* 1. CUSTOM GEOJSON: LANDSLIDE-PRONE AREAS (Guwahati Hill Ridges) */}
        {(layers.landslides || layers.landslideProneAreas || layers.criticalAlerts) && data?.landslides && data.landslides.map((l: any) => (
          <LandslideProneMarker
            key={l.properties.id}
            landslide={l}
            onClick={(item) => setSelectedEntity(item.properties.id, 'landslide_prone_area')}
          />
        ))}

        {/* 2. CUSTOM GEOJSON: PETROL & EV FAST CHARGING STATIONS (Guwahati Corridors) */}
        {layers.petrolStations && data?.petrolStations && data.petrolStations.map((station: any) => (
          <PetrolStationMarker
            key={station.properties.id}
            station={station}
            onClick={(item) => setSelectedEntity(item.properties.id, 'petrol_station')}
          />
        ))}

        {/* 3. CUSTOM GEOJSON: HOTEL & TRANSIT LODGING LOCATIONS (Guwahati) */}
        {layers.hotels && data?.hotels && data.hotels.map((hotel: any) => (
          <HotelMarker
            key={hotel.properties.id}
            hotel={hotel}
            onClick={(item) => setSelectedEntity(item.properties.id, 'hotel')}
          />
        ))}

        {/* 4. POI MARKERS (Men at Work / Roadwork, Restaurants) */}
        {(layers.roadwork || layers.restaurants) && visibleRemainingPois.map((poi: any) => (
          <PoiMarker 
            key={poi.properties.id} 
            poi={poi} 
            onClick={(item) => setSelectedEntity(item.properties.id, item.properties.type)} 
          />
        ))}

        {/* LOGISTICS MARKERS (Clustered Hubs & Checkpoints) */}
        {(layers.warehouses || layers.checkpoints || layers.deliveryLocations) && logisticsClusters.map((cluster: any, idx: number) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker key={`log-cluster-${cluster.id || idx}-${longitude}-${latitude}`} longitude={longitude} latitude={latitude}>
                <div 
                  className="w-10 h-10 rounded-full bg-blue-500/80 border-2 border-blue-200 text-white flex items-center justify-center font-bold shadow-lg cursor-pointer"
                  onClick={() => {
                    const expansionZoom = Math.min(logisticsSupercluster.getClusterExpansionZoom(cluster.id), 14);
                    setViewState({ ...viewState, longitude, latitude, zoom: expansionZoom, transitionDuration: 500 } as any);
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <LogisticsMarker key={cluster.properties.id} logistic={cluster} onClick={() => setSelectedEntity(cluster.properties.id, cluster.properties.type || 'warehouse')} />
          );
        })}

        {/* INCIDENT MARKERS (Clustered Accidents, Floods, Collisions) */}
        {(layers.criticalAlerts || layers.accidents || layers.landslides || layers.floods || layers.waterlogging || layers.roadDamage || layers.bridgeDamage || layers.roadClosures) && incidentClusters.map((cluster: any, idx: number) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const { cluster: isCluster, point_count: pointCount } = cluster.properties;

          if (isCluster) {
            return (
              <Marker key={`inc-cluster-${cluster.id || idx}-${longitude}-${latitude}`} longitude={longitude} latitude={latitude}>
                <div 
                  className="w-10 h-10 rounded-full bg-red-500/80 border-2 border-red-200 text-white flex items-center justify-center font-bold shadow-lg cursor-pointer animate-pulse"
                  onClick={() => {
                    const expansionZoom = Math.min(incidentSupercluster.getClusterExpansionZoom(cluster.id), 14);
                    setViewState({ ...viewState, longitude, latitude, zoom: expansionZoom, transitionDuration: 500 } as any);
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <IncidentMarker key={cluster.properties.id} incident={cluster} onClick={() => setSelectedEntity(cluster.properties.id, 'incident')} />
          );
        })}

        {/* VEHICLE MARKERS */}
        {layers.vehicles && data?.vehicles.map((v: any) => (
          <VehicleMarker key={v.properties.id} vehicle={v} onClick={(item) => handleMarkerClick(item, 'vehicle')} />
        ))}

        {/* Loading overlay for data */}
        {loading && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-4 py-1 rounded-full shadow border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 animate-pulse pointer-events-none">
            Updating Data...
          </div>
        )}
      </BaseMap>
      <DemoModeIndicator />
      <AccessibleMapSummary />
      
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md shadow-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-bold text-sm">{error}</span>
        </div>
      )}

      <MapLayers />
      <MapLegend />
      <EntityDetailPanel />
    </div>
  );
}
