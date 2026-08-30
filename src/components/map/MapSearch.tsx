import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Loader2, MapPin, Navigation, X } from 'lucide-react';

interface MapSearchProps {
  onSelect: (lng: number, lat: number) => void;
  className?: string;
  placeholder?: string;
}

interface LocalPOI {
  name: string;
  category: string;
  state: string;
  lng: number;
  lat: number;
  description?: string;
}

// Built-in high-precision directory for Northeast India (NER) logistics & command hubs
const NER_DIRECTORY: LocalPOI[] = [
  // Assam - Greater Guwahati & Kamrup
  { name: 'Guwahati Urban Center', category: 'City Core', state: 'Assam', lng: 91.7362, lat: 26.1445, description: 'Kamrup Metro Operations Core' },
  { name: 'Dispur Capital Complex & GMCH', category: 'Government & Medical', state: 'Assam', lng: 91.7850, lat: 26.1450, description: 'State Emergency Operations Center' },
  { name: 'Jorabat Mountain Pass (NH-6 / NH-27)', category: 'Border Chokepoint', state: 'Assam / Meghalaya', lng: 91.8950, lat: 26.1080, description: 'Critical mountain freight junction' },
  { name: 'Jalukbari & Saraighat Bridge', category: 'Transit Gateway', state: 'Assam', lng: 91.6620, lat: 26.1550, description: 'Brahmaputra cross-river artery' },
  { name: 'Garchuk Central Freight Depot', category: 'Logistics Hub', state: 'Assam', lng: 91.7050, lat: 26.1150, description: 'Primary inter-district truck terminal' },
  { name: 'GS Road Commercial Artery', category: 'Urban Corridor', state: 'Assam', lng: 91.7720, lat: 26.1680, description: 'Dispur - Paltan Bazaar central trunk' },
  { name: 'Khanapara Transit Point', category: 'Transit Corridor', state: 'Assam', lng: 91.8200, lat: 26.1250, description: 'Interstate Meghalaya entry point' },
  { name: 'Lokpriya Gopinath Bordoloi Airport (Borjhar)', category: 'Air Cargo Hub', state: 'Assam', lng: 91.5850, lat: 26.1100, description: 'NER Air Freight logistics base' },
  { name: 'Noonmati IOCL Refinery', category: 'Petroleum Trunk', state: 'Assam', lng: 91.8050, lat: 26.1850, description: 'Petroleum and fuel reserve base' },
  { name: 'Amingaon Inland Container Depot', category: 'Rail & Freight', state: 'Assam', lng: 91.6750, lat: 26.1850, description: 'Container Freight Station & PDS Base' },
  { name: 'Kamakhya Foothills (Nilachal)', category: 'Vulnerable Slope', state: 'Assam', lng: 91.7050, lat: 26.1550, description: 'Landslide monitoring zone' },
  { name: 'Paltan Bazaar Railway Terminal', category: 'Railway Hub', state: 'Assam', lng: 91.7510, lat: 26.1810, description: 'Guwahati central railway passenger & parcel depot' },
  { name: 'Sonapur Freight Bypass', category: 'Highway Trunk', state: 'Assam', lng: 91.9600, lat: 26.1200, description: 'NH-27 Eastbound trunk' },

  // Key NER Districts & Cities
  { name: 'Dibrugarh Logistics Base', category: 'District Hub', state: 'Assam', lng: 94.9120, lat: 27.4728, description: 'Upper Assam oil & gas transport hub' },
  { name: 'Silchar Cachar Depot', category: 'District Hub', state: 'Assam', lng: 92.7926, lat: 24.8333, description: 'Barak Valley transit center' },
  { name: 'Jorhat Regional Depot', category: 'District Hub', state: 'Assam', lng: 94.2037, lat: 26.7509, description: 'Central Upper Assam link' },
  { name: 'Tezpur & Kolia Bhomora Bridge', category: 'Transit Gateway', state: 'Assam', lng: 92.7940, lat: 26.6528, description: 'North bank central crossing' },
  { name: 'Nagaon Central Hub', category: 'District Hub', state: 'Assam', lng: 92.6840, lat: 26.3450, description: 'Central corridor junction' },
  { name: 'Bongaigaon Industrial Hub', category: 'Industrial & Fuel', state: 'Assam', lng: 90.5432, lat: 26.5020, description: 'Lower Assam fuel and refinery junction' },
  { name: 'Tinsukia Goods Terminal', category: 'Rail Freight', state: 'Assam', lng: 95.3610, lat: 27.4920, description: 'Easternmost rail interchange' },
  
  // Other NER State Capitals & Key Points
  { name: 'Shillong Command Station', category: 'State Capital', state: 'Meghalaya', lng: 91.8933, lat: 25.5788, description: 'East Khasi Hills relief base' },
  { name: 'Cherrapunji (Sohra)', category: 'High Precipitation Zone', state: 'Meghalaya', lng: 91.7323, lat: 25.2986, description: 'Intense weather monitoring post' },
  { name: 'Tura Logistics Center', category: 'District Hub', state: 'Meghalaya', lng: 90.2201, lat: 25.5144, description: 'West Garo Hills hub' },
  { name: 'Itanagar Command Base', category: 'State Capital', state: 'Arunachal Pradesh', lng: 93.6053, lat: 27.0844, description: 'Papum Pare district logistics' },
  { name: 'Pasighat Transit Station', category: 'Strategic Link', state: 'Arunachal Pradesh', lng: 95.3260, lat: 28.0667, description: 'Siang river corridor' },
  { name: 'Kohima Relief Command', category: 'State Capital', state: 'Nagaland', lng: 94.1086, lat: 25.6701, description: 'High altitude mountain corridor' },
  { name: 'Dimapur Freight Interchange', category: 'Commercial Hub', state: 'Nagaland', lng: 93.7260, lat: 25.9060, description: 'Primary rail & road gateway to Nagaland' },
  { name: 'Imphal Valley Center', category: 'State Capital', state: 'Manipur', lng: 93.9368, lat: 24.8170, description: 'Manipur central distribution node' },
  { name: 'Aizawl Operations Depot', category: 'State Capital', state: 'Mizoram', lng: 92.7176, lat: 23.7271, description: 'Central Mizoram mountain hub' },
  { name: 'Agartala Border Hub', category: 'State Capital', state: 'Tripura', lng: 91.2868, lat: 23.8315, description: 'Western border logistics terminal' },
  { name: 'Gangtok Command Station', category: 'State Capital', state: 'Sikkim', lng: 88.6138, lat: 27.3389, description: 'Himalayan corridor base' }
];

export default function MapSearch({ onSelect, className, placeholder = "Search NER districts, hubs, places..." }: MapSearchProps) {
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter local directory instantly with high-speed fuzzy matching
  const localMatches = useMemo(() => {
    if (!query.trim() || query.length < 2) return [];
    const q = query.toLowerCase();
    return NER_DIRECTORY.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query]);

  // Fallback remote search with safe AbortController and strict error suppression
  useEffect(() => {
    if (!query.trim() || query.length < 3) {
      setRemoteResults([]);
      return;
    }

    // If local matches are sufficient, avoid network call
    if (localMatches.length >= 4) {
      setRemoteResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Northeast India')}&limit=4`,
          { signal: controller.signal }
        );
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          setRemoteResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // Silently handle any network / CORS / abort errors
        setRemoteResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, localMatches.length]);

  const handleSelectLocal = (item: LocalPOI) => {
    setQuery(item.name);
    setIsOpen(false);
    onSelect(item.lng, item.lat);
  };

  const handleSelectRemote = (item: any) => {
    setQuery(item.display_name.split(',')[0]);
    setIsOpen(false);
    onSelect(parseFloat(item.lon), parseFloat(item.lat));
  };

  const clearQuery = () => {
    setQuery('');
    setRemoteResults([]);
    setIsOpen(false);
  };

  const totalResultsCount = localMatches.length + remoteResults.length;

  return (
    <div ref={wrapperRef} className={`relative ${className || 'w-64 md:w-80'}`} id="map-search-component">
      <div className="relative flex items-center w-full h-9 rounded-xl shadow-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <div className="grid place-items-center h-full w-9 text-slate-400">
          <Search className="w-4 h-4 text-blue-500" />
        </div>
        <input
          className="peer h-full w-full outline-none text-xs text-slate-800 dark:text-slate-100 bg-transparent pr-2 placeholder-slate-400"
          type="text"
          id="map-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        {query && (
          <button 
            onClick={clearQuery}
            className="p-1 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {loading && (
          <div className="grid place-items-center h-full w-8 text-blue-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        )}
      </div>

      {isOpen && totalResultsCount > 0 && (
        <div className="absolute top-11 left-0 w-full max-h-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800">
          {/* Local Intelligence Matches */}
          {localMatches.length > 0 && (
            <div>
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Verified NER Operations Hubs</span>
                <span className="text-emerald-500 font-semibold">Instant GIS</span>
              </div>
              <ul>
                {localMatches.map((item, i) => (
                  <li 
                    key={`local-${i}`}
                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex items-start gap-2.5 transition-colors group"
                    onClick={() => handleSelectLocal(item)}
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Navigation className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{item.category}</span>
                        <span>•</span>
                        <span>{item.state}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* External Geocoded Matches (if any) */}
          {remoteResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Geocoded Places
              </div>
              <ul>
                {remoteResults.map((item, i) => (
                  <li 
                    key={`remote-${i}`} 
                    className="px-3 py-2 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex items-start gap-2.5 transition-colors"
                    onClick={() => handleSelectRemote(item)}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                    <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{item.display_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {isOpen && query.trim().length >= 2 && !loading && totalResultsCount === 0 && (
        <div className="absolute top-11 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 text-center text-xs text-slate-500 z-50">
          No matching NER locations found.
        </div>
      )}
    </div>
  );
}
