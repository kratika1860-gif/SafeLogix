import React, { useRef, useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Map, { NavigationControl, FullscreenControl, GeolocateControl, MapRef, MapProps } from 'react-map-gl/maplibre';
import { MAP_CONFIG, MAP_STYLES, MapStyleKey, OPENFREEMAP_LIBERTY, SATELLITE_STYLE } from '../../config/map.config';
import { 
  RefreshCw, RotateCcw, Search, Map as MapIcon, Loader2, AlertTriangle, 
  Layers, Check, Sparkles, Compass, ShieldAlert 
} from 'lucide-react';
import MapSearch from './MapSearch';
import { cn } from '../../lib/utils';

export interface BaseMapProps extends Omit<MapProps, 'mapStyle'> {
  children?: React.ReactNode;
  onRefresh?: () => void;
  showSearch?: boolean;
  showStyleSwitcher?: boolean;
  className?: string;
  onMapLoad?: () => void;
  mapStyle?: any;
  defaultStyleKey?: MapStyleKey;
}

const BaseMap = forwardRef<MapRef, BaseMapProps>(({ 
  children, 
  onRefresh, 
  showSearch = true, 
  showStyleSwitcher = true,
  className = "w-full h-full",
  onMapLoad,
  mapStyle: customMapStyle,
  defaultStyleKey = 'vector',
  ...props 
}, ref) => {
  const mapRef = useRef<MapRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => mapRef.current as MapRef);

  const [selectedStyleKey, setSelectedStyleKey] = useState<MapStyleKey>(defaultStyleKey);
  const [activeStyle, setActiveStyle] = useState<any>(customMapStyle || MAP_STYLES[defaultStyleKey]?.style || OPENFREEMAP_LIBERTY);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  // Safety Timeout: Never let the map loading overlay hang indefinitely
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
      setLoadTimedOut(true);
      if (mapRef.current) {
        try {
          mapRef.current.resize();
        } catch (e) {
          // ignore
        }
      }
    }, 1500); // 1.5s max loading overlay time

    return () => clearTimeout(safetyTimer);
  }, []);

  // Update active style when styleKey changes or custom style is passed
  useEffect(() => {
    if (customMapStyle) {
      setActiveStyle(customMapStyle);
    } else if (MAP_STYLES[selectedStyleKey]) {
      setActiveStyle(MAP_STYLES[selectedStyleKey].style);
    }
  }, [selectedStyleKey, customMapStyle]);

  // Resize observer to ensure MapLibre canvas resizes cleanly with sidebars and layouts
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        try {
          mapRef.current.resize();
        } catch (e) {
          // ignore
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const resetView = useCallback(() => {
    mapRef.current?.flyTo({
      center: [MAP_CONFIG.initialLocation.longitude, MAP_CONFIG.initialLocation.latitude],
      zoom: MAP_CONFIG.initialLocation.zoom,
      duration: 1000
    });
  }, []);

  const handleSearchResult = useCallback((lng: number, lat: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 13,
      duration: 1200
    });
  }, []);

  const handleLoad = useCallback((e: any) => {
    setIsLoading(false);
    setMapError(null);
    if (mapRef.current) {
      try {
        mapRef.current.resize();
      } catch (err) {
        // ignore
      }
    }
    if (onMapLoad) onMapLoad();
    if (props.onLoad) props.onLoad(e);
  }, [onMapLoad, props]);

  const handleIdle = useCallback((e: any) => {
    setIsLoading(false);
    if (mapRef.current) {
      try {
        mapRef.current.resize();
      } catch (err) {
        // ignore
      }
    }
    if (props.onIdle) props.onIdle(e);
  }, [props]);

  const handleError = useCallback((e: any) => {
    setIsLoading(false);
    
    // Check if it's a fatal style load error (e.g. remote vector style network error)
    const isStyleLoadError = typeof activeStyle === 'string' && (
      e?.error?.message?.includes('style') || 
      e?.error?.message?.includes('Failed to fetch') || 
      e?.error?.status === 404 ||
      !activeStyle
    );

    if (isStyleLoadError) {
      console.warn("Vector style unavailable, falling back to satellite imagery tiles:", e?.error?.message);
      setActiveStyle(SATELLITE_STYLE);
      setSelectedStyleKey('satellite');
      return;
    }

    // Check for WebGL context loss
    if (e?.error?.message?.includes('WebGL') || e?.error?.message?.includes('context')) {
      setMapError("WebGL context was refreshed. Restoring tactical radar...");
      setTimeout(() => setMapError(null), 3000);
      if (mapRef.current) {
        try {
          mapRef.current.resize();
        } catch (err) {
          // ignore
        }
      }
    }

    if (props.onError) props.onError(e);
  }, [activeStyle, props]);

  const handleSelectStyle = (key: MapStyleKey) => {
    setSelectedStyleKey(key);
    setActiveStyle(MAP_STYLES[key].style);
    setIsStyleMenuOpen(false);
    setMapError(null);
  };

  const handleForceSkip = () => {
    setIsLoading(false);
    if (mapRef.current) {
      try {
        mapRef.current.resize();
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div ref={containerRef} className={cn("relative bg-[#050505] group overflow-hidden w-full h-full", className)}>
      
      {/* Non-Blocking Fast Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#050505]/80 backdrop-blur-sm transition-opacity duration-300">
           <div className="flex flex-col items-center gap-3.5 p-6 bg-[#121212]/95 border border-amber-500/30 rounded-2xl shadow-2xl max-w-sm text-center animate-in fade-in zoom-in-95">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-[#E9C46A]">
                  <Compass className="w-6 h-6 animate-spin text-[#E9C46A]" style={{ animationDuration: '3s' }} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
                </span>
              </div>

              <div>
                <h3 className="font-heading font-bold text-sm text-[#FAF7F2]">Initializing Command GIS Radar</h3>
                <p className="text-xs text-zinc-400 mt-1">Loading North East Vector & Satellite Telemetry</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleSelectStyle(selectedStyleKey === 'vector' ? 'satellite' : 'vector')}
                  className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-[#E9C46A] border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Switch to {selectedStyleKey === 'vector' ? 'Satellite' : 'Vector'}
                </button>
                <button
                  onClick={handleForceSkip}
                  className="px-3 py-1.5 bg-[#181818] hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 rounded-xl text-xs font-bold transition-all"
                >
                  Continue
                </button>
              </div>
           </div>
        </div>
      )}

      {/* Map Error / Notice Banner */}
      {mapError && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 bg-[#121212]/95 text-[#E9C46A] border border-amber-500/40 rounded-xl shadow-2xl backdrop-blur-md text-xs font-medium animate-in slide-in-from-top-2">
           <ShieldAlert className="w-4 h-4 shrink-0 text-[#E9C46A]" />
           <span>{mapError}</span>
           <button 
             onClick={() => setMapError(null)} 
             className="ml-2 px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-[10px] font-bold text-[#FAF7F2] transition-colors"
           >
             Dismiss
           </button>
        </div>
      )}

      <Map
        ref={mapRef}
        reuseMaps={true}
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        initialViewState={props.initialViewState || {
          longitude: MAP_CONFIG.initialLocation.longitude,
          latitude: MAP_CONFIG.initialLocation.latitude,
          zoom: MAP_CONFIG.initialLocation.zoom
        }}
        mapStyle={activeStyle}
        attributionControl={false}
        onLoad={handleLoad}
        onIdle={handleIdle}
        onError={handleError}
        {...props}
      >
        {MAP_CONFIG.controls.showNavigation && <NavigationControl position="bottom-right" />}
        {MAP_CONFIG.controls.showFullscreen && <FullscreenControl position="bottom-right" />}
        {MAP_CONFIG.controls.showGeolocate && (
          <GeolocateControl 
            position="bottom-right" 
            positionOptions={{ enableHighAccuracy: true }} 
            trackUserLocation={true} 
            showAccuracyCircle={false} 
          />
        )}
        
        {children}
      </Map>

      {/* Custom Controls Container - Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        {showSearch && (
          <div className="pointer-events-auto">
            <MapSearch onSelect={handleSearchResult} />
          </div>
        )}
      </div>

      {/* Custom Controls Container - Right (Map Tools & Style Switcher) */}
      <div className="absolute bottom-20 right-3 sm:bottom-24 sm:right-4 z-20 flex flex-col items-end gap-2 pointer-events-auto">
         <div className="flex items-center gap-1.5 bg-[#121212]/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-amber-500/30">
           
           {/* Reset View Button */}
           <button 
             onClick={resetView} 
             title="Reset View to Guwahati / NER" 
             className="p-2 text-zinc-300 hover:text-[#E9C46A] hover:bg-[#181818] rounded-xl transition-all group/btn"
           >
              <RotateCcw className="w-4 h-4 group-hover/btn:-rotate-90 transition-transform duration-300" />
           </button>

           {/* Refresh Data Button */}
           {onRefresh && (
             <button 
               onClick={onRefresh} 
               title="Refresh Live Telemetry" 
               className="p-2 text-zinc-300 hover:text-[#E9C46A] hover:bg-[#181818] rounded-xl transition-all group/btn"
             >
               <RefreshCw className="w-4 h-4 group-active/btn:rotate-180 transition-transform duration-500" />
             </button>
           )}

           {/* Style Switcher Toggle Button */}
           {showStyleSwitcher && (
             <div className="relative">
               <button
                 onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                 title="Change Base Map Style"
                 className={cn(
                   "p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all",
                   isStyleMenuOpen 
                     ? "bg-amber-500 text-black shadow-md shadow-amber-500/30" 
                     : "text-zinc-300 hover:text-[#E9C46A] hover:bg-[#181818]"
                 )}
               >
                 <Layers className="w-4 h-4" />
                 <span className="text-xs">{MAP_STYLES[selectedStyleKey]?.icon}</span>
               </button>

               {/* Style Switcher Dropdown Popover */}
               {isStyleMenuOpen && (
                 <div className="absolute right-0 bottom-12 w-64 bg-[#121212]/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                   <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E9C46A] border-b border-zinc-800/80 mb-1.5 flex items-center justify-between">
                     <span>Base Map Styles</span>
                     <span className="text-[9px] text-zinc-400 font-normal">2 Presets</span>
                   </div>
                   
                   <div className="space-y-1.5">
                     {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((key) => {
                       const item = MAP_STYLES[key];
                       const isSelected = selectedStyleKey === key;
                       return (
                         <button
                           key={key}
                           onClick={() => handleSelectStyle(key)}
                           className={cn(
                             "w-full px-3 py-2.5 rounded-xl text-left flex items-start gap-2.5 transition-all",
                             isSelected 
                               ? "bg-amber-500/20 text-[#FAF7F2] border border-amber-500/40 shadow-sm" 
                               : "text-zinc-300 hover:bg-[#181818] hover:text-[#FAF7F2] border border-transparent"
                           )}
                         >
                           <span className="text-base leading-none mt-0.5">{item.icon}</span>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                               <span className={cn("text-xs font-bold", isSelected ? "text-[#E9C46A]" : "text-[#FAF7F2]")}>{item.name}</span>
                               {isSelected && <Check className="w-3.5 h-3.5 text-[#E9C46A]" />}
                             </div>
                             <p className="text-[10px] text-zinc-400 truncate mt-0.5">{item.description}</p>
                           </div>
                         </button>
                       );
                     })}
                   </div>
                 </div>
               )}
             </div>
           )}
         </div>
      </div>
    </div>
  );
});

export default BaseMap;

