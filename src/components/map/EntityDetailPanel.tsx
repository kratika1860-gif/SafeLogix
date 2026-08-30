import React from 'react';
import { useMapStore } from '../../store/useMapStore';
import { useMapData } from '../../hooks/useMapData';
import { 
  X, Truck, Package, ShieldCheck, MapPin, AlertTriangle, Clock, Route, Activity, 
  CheckCircle, HardHat, Fuel, Hotel, Utensils, Home, Phone, ShieldAlert, Sparkles, Navigation, Zap, Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { LandslideHazardSvg, PetrolPumpSvg, HotelLodgingSvg, RoadworkSvg } from './markers/MapSvgIcons';

export default function EntityDetailPanel() {
  const { selectedEntityId, selectedEntityType, setSelectedEntity } = useMapStore();
  const { data } = useMapData(null); // Read from cache

  if (!selectedEntityId || !selectedEntityType) return null;

  let entity: any = null;
  if (data) {
    if (selectedEntityType === 'vehicle') {
      entity = data.vehicles.find(v => v.properties.id === selectedEntityId);
    } else if (selectedEntityType === 'incident' || selectedEntityType === 'landslide_zone') {
      entity = data.incidents?.find(i => i.properties.id === selectedEntityId) || 
               data.landslides?.find(l => l.properties.id === selectedEntityId) ||
               data.zones?.find(z => z.properties.id === selectedEntityId);
    } else if (selectedEntityType === 'landslide_prone_area' || selectedEntityType === 'landslide') {
      entity = data.landslides?.find(l => l.properties.id === selectedEntityId) ||
               data.incidents?.find(i => i.properties.id === selectedEntityId) ||
               data.pois?.find(p => p.properties.id === selectedEntityId);
    } else if (selectedEntityType === 'petrol_station') {
      entity = data.petrolStations?.find(s => s.properties.id === selectedEntityId) ||
               data.pois?.find(p => p.properties.id === selectedEntityId);
    } else if (selectedEntityType === 'hotel') {
      entity = data.hotels?.find(h => h.properties.id === selectedEntityId) ||
               data.pois?.find(p => p.properties.id === selectedEntityId);
    } else if (selectedEntityType === 'route') {
      entity = data.routes?.find(r => r.properties.id === selectedEntityId);
    } else if (['roadwork', 'restaurant'].includes(selectedEntityType)) {
      entity = data.pois?.find(p => p.properties.id === selectedEntityId);
    } else {
      entity = data.logistics?.find(l => l.properties.id === selectedEntityId) ||
               data.pois?.find(p => p.properties.id === selectedEntityId);
    }
  }

  if (!entity) return null;

  const props = entity.properties;
  const isAlpha = props.hubType === 'alpha' || props.name?.toLowerCase().includes('hub alpha');
  const isBeta = props.hubType === 'beta' || props.name?.toLowerCase().includes('hub beta');
  const isHub = props.isHub || isAlpha || isBeta;

  const getEntityHeaderBadge = () => {
    if (isAlpha) return { label: '🏠 HUB ALPHA (WEST DEPOT)', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' };
    if (isBeta) return { label: '🏠 HUB BETA (EAST RELIEF HUB)', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-400' };
    if (selectedEntityType === 'landslide_prone_area' || props.type === 'landslide_prone_area') return { label: '⛰️ LANDSLIDE-PRONE AREA', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400' };
    if (selectedEntityType === 'petrol_station' || props.type === 'petrol_station') return { label: '⛽ PETROL & EV FAST CHARGING', color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/60 dark:text-cyan-400' };
    if (selectedEntityType === 'hotel' || props.type === 'hotel') return { label: '🏨 HOTEL & TRANSIT LODGING', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-400' };
    if (selectedEntityType === 'roadwork') return { label: '🚧 MEN AT WORK', color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-400' };
    if (selectedEntityType === 'restaurant') return { label: '🍽️ RESTAURANT & DINER', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400' };
    if (selectedEntityType === 'landslide_zone' || props.type === 'landslide_zone') return { label: '⛰️ LANDSLIDE HAZARD ZONE', color: 'text-red-600 bg-red-50 dark:bg-red-950/60 dark:text-red-400' };
    return { label: (selectedEntityType || 'POINT').toUpperCase(), color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400' };
  };

  const headerBadge = getEntityHeaderBadge();

  return (
    <div className="absolute bottom-0 inset-x-0 sm:bottom-auto sm:inset-x-auto sm:top-4 sm:right-4 md:right-14 w-full sm:w-88 md:w-96 bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.15)] sm:shadow-2xl border-t sm:border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[70vh] sm:max-h-[calc(100vh-100px)] animate-in slide-in-from-bottom-8 sm:slide-in-from-right-8 z-[60] pointer-events-auto">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/90 flex justify-between items-start">
        <div className="pr-2">
          <div className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider mb-1.5 ${headerBadge.color}`}>
            {headerBadge.label}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{props.title || props.name || `ID: ${props.id}`}</h2>
          {props.address && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{props.address}</span>
            </p>
          )}
        </div>
        <button 
          onClick={() => setSelectedEntity(null, null)} 
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-4">
        {/* LANDSLIDE PRONE AREA DETAILS */}
        {(selectedEntityType === 'landslide_prone_area' || props.type === 'landslide_prone_area') && (
          <div className="space-y-3">
            <div className={`p-3 rounded-lg border text-sm font-bold uppercase flex items-center justify-between
              ${props.severity === 'critical' || props.hazardLevel === 'Critical' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' : 
                'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'}
            `}>
              <span className="flex items-center gap-2">
                <LandslideHazardSvg className="w-5 h-5" />
                {props.hazardLevel || 'High'} Hazard Risk
              </span>
              <span className="text-xs">{props.slopeAngle || 'Steep Slope'}</span>
            </div>

            {props.vulnerability && (
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Terrain Vulnerability</div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {props.vulnerability}
                </p>
              </div>
            )}

            {props.safeAlternate && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs">
                <span className="font-bold block mb-1">Recommended Safe Alternate Route:</span>
                <span className="text-emerald-700 dark:text-emerald-300">{props.safeAlternate}</span>
              </div>
            )}

            {props.alertNote && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                ⚠️ {props.alertNote}
              </div>
            )}

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center"><span className="font-medium">Mitigation Status:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.mitigationStatus || 'Active Monitoring'}</span></div>
              <div className="flex justify-between items-center"><span className="font-medium">Geo-Surveyed:</span> <span className="font-bold text-slate-900 dark:text-slate-100">Guwahati Hills Division</span></div>
            </div>
          </div>
        )}

        {/* PETROL STATION DETAILS */}
        {(selectedEntityType === 'petrol_station' || props.type === 'petrol_station') && (
          <div className="space-y-3">
            <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-lg border border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PetrolPumpSvg className="w-5 h-5 text-cyan-600 shrink-0" />
                <span className="text-sm font-bold">{props.brand || 'Fuel Station'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-200 dark:bg-cyan-800 text-cyan-900 dark:text-cyan-100 font-bold">{props.openHours || '24/7'}</span>
            </div>

            {props.availableDiesel && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-200">Diesel Bulk Supply:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{props.availableDiesel}</span>
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Available Fuel & Charging</div>
              <div className="flex flex-wrap gap-1.5">
                {(props.fuelTypes || ['Diesel', 'Petrol', 'CNG']).map((fuel: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                    {fuel.toLowerCase().includes('ev') && <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                    {fuel}
                  </span>
                ))}
              </div>
            </div>

            {props.facilities && (
              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Station Facilities</div>
                <div className="flex flex-wrap gap-1.5">
                  {props.facilities.map((fac: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ✓ {fac}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {props.contact && (
              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-2 font-medium"><Phone className="w-3.5 h-3.5 text-emerald-500"/> Direct Phone</span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{props.contact}</span>
              </div>
            )}
          </div>
        )}

        {/* HOTEL DETAILS */}
        {(selectedEntityType === 'hotel' || props.type === 'hotel') && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HotelLodgingSvg className="w-5 h-5 text-indigo-600 shrink-0" />
                <span className="text-sm font-bold">Transit Lodging & Driver Rest</span>
              </div>
              {props.rating && (
                <span className="px-2 py-0.5 rounded bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {props.rating}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 font-bold mb-0.5">Capacity</div>
                <div className="font-bold text-slate-900 dark:text-white">{props.roomsCount || '60+ Rooms'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-slate-500 font-bold mb-0.5">Category</div>
                <div className="font-bold text-slate-900 dark:text-white">{props.priceRange || 'Business & Transit'}</div>
              </div>
            </div>

            {props.amenities && (
              <div>
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Logistics & Guest Amenities</div>
                <div className="flex flex-wrap gap-1.5">
                  {props.amenities.map((amenity: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      ✓ {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {props.dispatchSupport && (
              <div className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{props.dispatchSupport}</span>
              </div>
            )}

            {props.contact && (
              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-2 font-medium"><Phone className="w-3.5 h-3.5 text-emerald-500"/> Reception Desk</span> 
                <span className="font-bold text-slate-900 dark:text-slate-100">{props.contact}</span>
              </div>
            )}
          </div>
        )}

        {/* VEHICLE DETAILS */}
        {selectedEntityType === 'vehicle' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 font-bold mb-1">Status</div>
                <div className="text-sm font-bold uppercase text-emerald-600">{props.status}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 font-bold mb-1">Driver</div>
                <div className="text-sm font-bold">{props.driver}</div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-500"/> Cargo</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.cargo}</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500"/> ETA</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.eta}</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-500"/> Updated</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.timestamp ? formatDistanceToNow(props.timestamp) + ' ago' : 'Live'}</span></div>
            </div>
          </>
        )}

        {/* INCIDENT DETAILS */}
        {selectedEntityType === 'incident' && (
          <>
            <div className={`p-3 rounded-lg border text-sm font-bold uppercase flex items-center justify-between
              ${props.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' : 
                props.severity === 'high' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800' :
                props.severity === 'medium' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'}
            `}>
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {props.severity || 'HIGH'} Severity
              </span>
              <span>{props.status || 'ACTIVE ZONE'}</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              {props.description || 'Hazard zone requiring high driver vigilance and potential rerouting.'}
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Verified Hazard</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.verified ? 'Yes (Verified by Assam SDRF)' : 'Monitoring'}</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500"/> Updated</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.timestamp ? formatDistanceToNow(props.timestamp) + ' ago' : 'Live Sensor Feed'}</span></div>
            </div>
          </>
        )}

        {/* HUB ALPHA / HUB BETA / LOGISTICS */}
        {(selectedEntityType === 'warehouse' || selectedEntityType === 'checkpoint' || selectedEntityType === 'delivery') && (
          <>
            {isHub ? (
              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isAlpha ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200' :
                  'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                      isAlpha ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                      🏠
                    </div>
                    <div>
                      <div className="font-bold text-sm">{isAlpha ? 'Hub Alpha Depot' : 'Hub Beta Relief Center'}</div>
                      <div className="text-xs opacity-80">{props.status || 'Operational'} • Storage {props.capacity || '80%'}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 font-bold mb-1">Fleet Assigned</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{props.activeFleetCount || 15} Vehicles</div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="text-xs text-slate-500 font-bold mb-1">Capacity Used</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{props.capacity || '75%'}</div>
                  </div>
                </div>

                {props.contact && (
                  <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="flex items-center gap-2 font-medium"><Phone className="w-4 h-4 text-emerald-500"/> Dispatch Hotline</span> 
                    <span className="font-bold text-slate-900 dark:text-slate-100">{props.contact}</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 font-bold mb-1">Status</div>
                  <div className="text-sm font-bold uppercase text-emerald-600">{props.status}</div>
                </div>
                {props.capacity && (
                  <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-2"><Package className="w-4 h-4"/> Capacity</span> 
                    <span className="font-bold text-slate-900 dark:text-slate-100">{props.capacity}</span>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ROADWORK / MEN AT WORK */}
        {selectedEntityType === 'roadwork' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2">
              <RoadworkSvg className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Active Road Crew & Machinery On-Site. Drive with caution.</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              {props.description}
            </p>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center"><span className="font-medium">Contractor:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.contractor || 'PWD Assam'}</span></div>
              <div className="flex justify-between items-center"><span className="font-medium">Est. Clearance:</span> <span className="font-bold text-amber-600">{props.expectedClearance || 'Ongoing'}</span></div>
              <div className="flex justify-between items-center"><span className="font-medium">Status:</span> <span className="font-bold uppercase text-emerald-600">{props.status || 'Active'}</span></div>
            </div>
          </div>
        )}

        {/* RESTAURANT */}
        {selectedEntityType === 'restaurant' && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{props.cuisine || 'Hot Meals & Refreshments'}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 font-bold">{props.openHours || 'Open'}</span>
            </div>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center"><span className="font-medium">Cuisine:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.cuisine}</span></div>
              <div className="flex justify-between items-center"><span className="font-medium">Capacity:</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.seating || '100+ Seats'}</span></div>
              <div className="flex justify-between items-center"><span className="font-medium">Driver Meal Pack:</span> <span className="font-bold text-emerald-600">Available on Demand</span></div>
            </div>
          </div>
        )}

        {/* ROUTE DETAILS */}
        {selectedEntityType === 'route' && (
          <div className="space-y-3">
            {props.emergencyCategory && (
              <div className={`p-3 rounded-lg border text-xs font-bold uppercase flex items-center justify-between
                ${props.emergencyCategory === 'medical' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' :
                  props.emergencyCategory === 'food' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                  props.emergencyCategory === 'disaster' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                  'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'}
              `}>
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  {props.priorityLevel || 'Emergency Corridor'}
                </span>
                <span>{props.emergencyCategory.toUpperCase()} CORRIDOR</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 font-bold mb-0.5">Accessibility</div>
                <div className="text-sm font-bold capitalize text-emerald-600 dark:text-emerald-400">{props.accessibility || 'Open'}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="text-xs text-slate-500 font-bold mb-0.5">Risk Level</div>
                <div className={`text-sm font-bold capitalize ${
                  props.risk === 'critical' ? 'text-red-600' :
                  props.risk === 'high' ? 'text-orange-600' :
                  props.risk === 'moderate' ? 'text-amber-600' : 'text-blue-600'
                }`}>{props.risk || 'Low'}</div>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 font-medium"><Route className="w-4 h-4 text-blue-500"/> Total Distance</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.distance || '18.4 km'}</span></div>
              <div className="flex justify-between items-center"><span className="flex items-center gap-2 font-medium"><Clock className="w-4 h-4 text-amber-500"/> Est. Transit Time</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.eta || '35 mins'}</span></div>
              {props.status && <div className="flex justify-between items-center"><span className="flex items-center gap-2 font-medium"><Activity className="w-4 h-4 text-emerald-500"/> Status</span> <span className="font-bold text-slate-900 dark:text-slate-100">{props.status}</span></div>}
            </div>

            {props.protocol && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs">
                <span className="font-bold block mb-0.5">Clearance Protocol:</span>
                <span>{props.protocol}</span>
              </div>
            )}

            <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="font-bold block mb-1 text-slate-800 dark:text-slate-200">AI Route Recommendation:</span>
              {props.emergencyCategory 
                ? 'Designated emergency transit corridor with priority clearance at state checkpoints and traffic intersections.'
                : 'Primary urban freight artery. Stable surface with continuous monitoring of potential weather disruptions.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
