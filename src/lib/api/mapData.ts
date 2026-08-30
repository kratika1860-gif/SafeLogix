export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | string;
    coordinates: any;
  };
  properties: any;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface MapDataResponse {
  vehicles: GeoJSONFeature[];
  incidents: GeoJSONFeature[];
  landslides: GeoJSONFeature[];
  petrolStations: GeoJSONFeature[];
  hotels: GeoJSONFeature[];
  logistics: GeoJSONFeature[];
  routes: GeoJSONFeature[];
  zones: GeoJSONFeature[];
  pois: GeoJSONFeature[];
}

/**
 * Guwahati Geographic Center Reference Coordinates
 * Lat: 26.1445° N, Lng: 91.7362° E
 */
export const GUWAHATI_CENTER = {
  longitude: 91.7362,
  latitude: 26.1445,
  zoom: 11.5,
  name: 'Guwahati Metropolitan & Transit Corridor'
};

// ==========================================
// 1. CUSTOM GEOJSON: LANDSLIDE-PRONE AREAS (Guwahati)
// ==========================================
export const LANDSLIDE_PRONE_GEOJSON: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7050, 26.1550] },
      properties: {
        id: 'landslide-kamakhya',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Kamakhya Foothills / Nilachal Hill Slope',
        title: 'Kamakhya Foothill Landslide Zone',
        hazardLevel: 'High',
        severity: 'high',
        status: 'active_monitoring',
        vulnerability: 'Steep red soil cutting; heavy runoff during monsoon rainfall',
        slopeAngle: '42° Slope',
        mitigationStatus: 'Geo-grid netting installed; caution advisory active',
        safeAlternate: 'Route via Maligaon-Pandu Riverfront bypass',
        alertNote: 'High vigilance required during continuous rain > 40mm/hr',
        lastUpdated: Date.now() - 3600000
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8950, 26.1080] },
      properties: {
        id: 'landslide-jorabat',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Jorabat Border Hill Pass (NH-6 / NH-27)',
        title: 'Jorabat Mountain Pass Landslide Zone',
        hazardLevel: 'Critical',
        severity: 'critical',
        status: 'high_alert',
        vulnerability: 'Meghalaya border cliff face prone to massive rockfall and mudslides',
        slopeAngle: '55° Steep Cliff',
        mitigationStatus: 'Active PWD rock clearing & emergency heavy excavator standing by',
        safeAlternate: 'Wait at Jorabat staging yard or divert via Garchuk depot link',
        alertNote: 'CRITICAL ALERT: Intermittent rock sliding reported on outbound shoulder',
        lastUpdated: Date.now() - 1800000
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7750, 26.1950] },
      properties: {
        id: 'landslide-kharghuli',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Kharghuli Riverfront Hill Slopes',
        title: 'Kharghuli Hillside Slumping Area',
        hazardLevel: 'High',
        severity: 'high',
        status: 'active_monitoring',
        vulnerability: 'Riverbank hill erosion and soil slippage overlooking Brahmaputra corridor',
        slopeAngle: '38° Slope',
        mitigationStatus: 'Retaining wall reinforcement in progress',
        safeAlternate: 'Use MG Road central arterial instead of narrow hill ridge roads',
        alertNote: 'Restricted heavy freight passage during stormy weather',
        lastUpdated: Date.now() - 7200000
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8080, 26.1110] },
      properties: {
        id: 'landslide-khanapara',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Khanapara Mountain Ridge Pass',
        title: 'Khanapara Hill Cutting Hazard Area',
        hazardLevel: 'High',
        severity: 'high',
        status: 'active_monitoring',
        vulnerability: 'Unconsolidated shale and mountain stormwater runoff across highway edge',
        slopeAngle: '45° Slope',
        mitigationStatus: 'Drainage culverts and barrier wall active',
        safeAlternate: 'Use center express lanes on NH-27; avoid outer hill-facing shoulder',
        alertNote: 'Mud and loose gravel deposit hazard on shoulder',
        lastUpdated: Date.now() - 5400000
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6920, 26.1280] },
      properties: {
        id: 'landslide-garchuk-ridge',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Naranarayan Garchuk Ridge',
        title: 'Garchuk Ridge Slope Risk Area',
        hazardLevel: 'Moderate',
        severity: 'medium',
        status: 'stable',
        vulnerability: 'Gravel sliding risk adjacent to Hub Alpha western approaches',
        slopeAngle: '30° Slope',
        mitigationStatus: 'Reinforced concrete apron & catchment ditch maintained',
        safeAlternate: 'Direct access via NH-27 main carriageway',
        alertNote: 'Minor gravel slippage after flash downpours',
        lastUpdated: Date.now() - 14400000
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8320, 26.1680] },
      properties: {
        id: 'landslide-narengi',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Narengi / Forest Gate Hill Slope',
        title: 'Narengi Hill Pass Hazard Zone',
        hazardLevel: 'High',
        severity: 'high',
        status: 'active_monitoring',
        vulnerability: 'Steep hill section prone to boulder detachment during monsoon storms',
        slopeAngle: '48° Slope',
        mitigationStatus: 'Rock catch fencing and barrier mesh deployed',
        safeAlternate: 'Divert via Noonmati refinery link road',
        alertNote: 'Maintain safe following distance behind heavy haulers',
        lastUpdated: Date.now() - 8600000
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7620, 26.1750] },
      properties: {
        id: 'landslide-sarania',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Sarania Hill / Gandhi Mandap Ascent',
        title: 'Sarania Hill Slope Hazard',
        hazardLevel: 'Moderate',
        severity: 'medium',
        status: 'stable',
        vulnerability: 'Urban hill cutting slope with saturated topsoil layer',
        slopeAngle: '35° Slope',
        mitigationStatus: 'Terraced slope vegetation and drainage channels',
        safeAlternate: 'Use Rajgarh Road / GS Road flat routes',
        alertNote: 'Speed limit 20 km/h on winding ascents',
        lastUpdated: Date.now() - 10800000
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7280, 26.1380] },
      properties: {
        id: 'landslide-fatasil',
        type: 'landslide_prone_area',
        category: 'hazard_point',
        name: 'Fatasil Ambari Hill Cutting',
        title: 'Fatasil Hillside Vulnerability Point',
        hazardLevel: 'High',
        severity: 'high',
        status: 'active_monitoring',
        vulnerability: 'Earthcutting slopes vulnerable to mudslides blocking arterial link',
        slopeAngle: '40° Slope',
        mitigationStatus: 'Assam SDRF geo-hazard monitoring post',
        safeAlternate: 'Route via AK Azad Road (Lal Ganesh)',
        alertNote: 'Caution for single lane narrowing due to safety barriers',
        lastUpdated: Date.now() - 9200000
      }
    }
  ]
};

// ==========================================
// 2. CUSTOM GEOJSON: PETROL & EV FUEL STATIONS (Guwahati)
// ==========================================
export const PETROL_STATIONS_GEOJSON: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7080, 26.1280] },
      properties: {
        id: 'fuel-iocl-garchuk',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'Indian Oil (IOCL) Auto Care & EV Fast Hub (Garchuk)',
        title: 'IOCL Fuel & EV Hub - Garchuk',
        brand: 'IndianOil',
        status: 'operational',
        openHours: '24/7 Non-Stop',
        fuelTypes: ['High-Speed Diesel', 'Petrol (XP95)', 'CNG', '60kW DC EV Fast Charging'],
        facilities: ['Heavy Truck Bay', 'DEF / AdBlue Dispenser', 'Digital Air/Nitrogen', 'Driver Restroom', 'FASTag Recharge'],
        paymentMethods: ['UPI', 'Fleet Card', 'Debit/Credit Card', 'Cash'],
        address: 'NH-27 Bypass (Near Hub Alpha), Garchuk, Guwahati',
        contact: '+91 361 245 8820',
        availableDiesel: '92% Full Tank',
        is24x7: true
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7980, 26.1150] },
      properties: {
        id: 'fuel-bpcl-khanapara',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'Bharat Petroleum (BPCL) Highway Fuel Oasis (Khanapara)',
        title: 'BPCL Highway Oasis - Khanapara',
        brand: 'Bharat Petroleum',
        status: 'operational',
        openHours: '24/7 Non-Stop',
        fuelTypes: ['Diesel', 'Speed Diesel', 'Petrol (Speed 97)', 'DEF AdBlue'],
        facilities: ['Multi-Lane Truck Canopy', 'Engine Oil Change Bay', 'Pure Drinking Water', '24h Convenience Store'],
        paymentMethods: ['SmartFleet Card', 'UPI', 'Cards'],
        address: 'Khanapara Gate 1, GS Road / NH-27 Junction, Guwahati',
        contact: '+91 361 289 1104',
        availableDiesel: '88% Full Tank',
        is24x7: true
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6700, 26.1480] },
      properties: {
        id: 'fuel-hpcl-jalukbari',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'Hindustan Petroleum (HPCL) Heavy Fleet Station (Jalukbari)',
        title: 'HPCL Fleet Fuel Station - Jalukbari',
        brand: 'HPCL',
        status: 'operational',
        openHours: '24/7 Non-Stop',
        fuelTypes: ['Diesel (HP Turbojet)', 'Petrol (Power)', 'Nitrogen Inflation'],
        facilities: ['Dedicated Freight Refueling Bay', 'Tire Pressure & Brake Check', 'Vehicle Lubricants Store'],
        paymentMethods: ['DriveTrack Plus', 'UPI', 'Cards'],
        address: 'Jalukbari Rotary West Approach, Guwahati',
        contact: '+91 361 257 3341',
        availableDiesel: '95% Full Tank',
        is24x7: true
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8850, 26.1100] },
      properties: {
        id: 'fuel-nayara-jorabat',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'Nayara Energy Freight Fuel Depot (Jorabat)',
        title: 'Nayara Fuel Station - Jorabat',
        brand: 'Nayara Energy',
        status: 'operational',
        openHours: '24/7 Non-Stop',
        fuelTypes: ['Highway Commercial Diesel', 'Petrol', 'DEF Bulk Dispensing'],
        facilities: ['Wide Turning Radius For Trailers', 'Driver Tea & Rest Stall', 'Emergency Breakdown Kit'],
        paymentMethods: ['Nayara Fleet', 'UPI', 'Cash'],
        address: 'NH-6 / NH-27 Inter-State Junction, Jorabat',
        contact: '+91 361 291 5560',
        availableDiesel: '80% Full Tank',
        is24x7: true
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8120, 26.1320] },
      properties: {
        id: 'fuel-shell-sixmile',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'Shell Auto Care & EV Fast Charger (Six Mile)',
        title: 'Shell Auto Care & EV Hub - Six Mile',
        brand: 'Shell',
        status: 'operational',
        openHours: '24/7 Non-Stop',
        fuelTypes: ['Shell V-Power Diesel', 'Shell V-Power Petrol', 'EV 50kW Fast Charging'],
        facilities: ['Shell Select Deli Store', 'Premium Nitrogen Bay', 'Clean Restrooms', 'ATM'],
        paymentMethods: ['Shell Fleet Solutions', 'UPI', 'Credit/Debit Card'],
        address: 'VIP Road, Six Mile (Near Hub Beta), Guwahati',
        contact: '+91 361 222 9988',
        availableDiesel: '90% Full Tank',
        is24x7: true
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7520, 26.1780] },
      properties: {
        id: 'fuel-iocl-paltanbazaar',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'Indian Oil (IOCL) City Center Fuel Station (Paltan Bazaar)',
        title: 'IOCL Fuel Hub - Paltan Bazaar',
        brand: 'IndianOil',
        status: 'operational',
        openHours: '24/7 Non-Stop',
        fuelTypes: ['Diesel', 'Petrol', 'Auto LPG'],
        facilities: ['Railway Station Proximity', 'Two-Wheeler & Fleet Dispenser', 'Digital Payments'],
        paymentMethods: ['UPI', 'IOCL XTRAPOWER', 'Cards'],
        address: 'GS Road / Station Road, Paltan Bazaar, Guwahati',
        contact: '+91 361 254 1209',
        availableDiesel: '85% Full Tank',
        is24x7: true
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7220, 26.1660] },
      properties: {
        id: 'fuel-hpcl-bharalumukh',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'HPCL Riverfront Fuel Station (Bharalumukh)',
        title: 'HPCL Fuel Station - Bharalumukh',
        brand: 'HPCL',
        status: 'operational',
        openHours: '05:00 AM - 11:30 PM',
        fuelTypes: ['Diesel', 'Petrol', 'Air & Water Check'],
        facilities: ['Riverfront Supply Lane', 'Emergency Refueling Cans Available'],
        paymentMethods: ['UPI', 'Cash', 'Cards'],
        address: 'MG Road, Bharalumukh, West Guwahati',
        contact: '+91 361 247 6620',
        availableDiesel: '78% Full Tank',
        is24x7: false
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6180, 26.1350] },
      properties: {
        id: 'fuel-reliance-borjhar',
        type: 'petrol_station',
        category: 'amenity_point',
        name: 'Jio-bp / Reliance Fuel & EV Fast Plaza (Borjhar Airport Rd)',
        title: 'Jio-bp Fuel & EV Plaza - Borjhar',
        brand: 'Jio-bp',
        status: 'operational',
        openHours: '24/7 Non-Stop',
        fuelTypes: ['Active Technology Diesel', 'Active Petrol', 'EV 120kW Dual Gun Fast Charger'],
        facilities: ['Wild Bean Cafe & Snacks', 'Castrol Auto Service', 'Spacious Truck Staging'],
        paymentMethods: ['Jio-bp Fleet', 'UPI', 'All Major Cards'],
        address: 'Airport VIP Link Road, Borjhar, Guwahati',
        contact: '+91 361 284 0055',
        availableDiesel: '96% Full Tank',
        is24x7: true
      }
    }
  ]
};

// ==========================================
// 3. CUSTOM GEOJSON: HOTEL & TRANSIT LODGING LOCATIONS (Guwahati)
// ==========================================
export const HOTELS_GEOJSON: GeoJSONFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6840, 26.1430] },
      properties: {
        id: 'hotel-radisson-blu',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Radisson Blu Hotel Guwahati (NH-27 Gotanagar)',
        title: 'Radisson Blu Hotel & Transit Facility',
        rating: '4.8 ★',
        status: 'operational',
        roomsCount: '196 Luxury & Executive Rooms',
        amenities: ['24/7 Power Backup Generator', 'Secure Heavy Freight / Bus Parking', 'Emergency First Aid Station', 'High-Speed Optical Wi-Fi', '24h Coffee Shop & Restaurant'],
        facilities: ['Driver Refreshment Rooms', 'Conference & Briefing Center', 'EV Charging Station On-Site'],
        address: 'NH-37 / NH-27 Gotanagar, Maligaon, Guwahati',
        contact: '+91 361 710 0100',
        priceRange: 'Premium / Executive',
        dispatchSupport: '24/7 Logistics Command Supported'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8020, 26.1180] },
      properties: {
        id: 'hotel-vivanta-khanapara',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Vivanta Guwahati (GS Road / Khanapara)',
        title: 'Vivanta Guwahati - Luxury Hotel',
        rating: '4.7 ★',
        status: 'operational',
        roomsCount: '160 Rooms & Suites',
        amenities: ['Emergency Helipad Access', 'Command & Incident Briefing Halls', 'Secure Multi-Level Underground Parking', '24/7 Medical Doctor on Call'],
        facilities: ['Express Check-In for Emergency Logistics Crew', 'Power Backup', 'Multi-Cuisine Dining'],
        address: 'Nikita Complex, GS Road, Khanapara, Guwahati',
        contact: '+91 361 710 8888',
        priceRange: 'Premium Luxury',
        dispatchSupport: 'Official State Crisis Support Facility'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7820, 26.1490] },
      properties: {
        id: 'hotel-novotel-dispur',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Novotel Guwahati GS Road (Dispur)',
        title: 'Novotel Hotel - GS Road Dispur',
        rating: '4.6 ★',
        status: 'operational',
        roomsCount: '118 Contemporary Rooms',
        amenities: ['24/7 Kitchen & In-Room Dining', 'Dedicated Crew & Relief Accommodation Block', 'EV Charging Points', 'Fast Fiber Internet'],
        facilities: ['Secure Gated Vehicle Yard', 'Laundry Express', 'Fitness & Spa'],
        address: 'GS Road, Dispur (Near Secretariat), Guwahati',
        contact: '+91 361 710 4444',
        priceRange: 'Business / Upscale',
        dispatchSupport: 'Central Capital Transit Node'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8920, 26.1090] },
      properties: {
        id: 'hotel-highway-inn-jorabat',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Hotel Highway Inn & Transit Rest Lodge (Jorabat)',
        title: 'Highway Inn & Driver Lodge - Jorabat',
        rating: '4.2 ★',
        status: 'operational',
        roomsCount: '45 Private Rooms + 80 Dormitory Beds',
        amenities: ['Clean Driver Rest Bunks', '24h Hot Geyser Showers', 'Highway Truck & Trailer Staging Yard', '24h Highway Dhaba & Chai Stall'],
        facilities: ['Vehicle Wash Ramp', 'Secure Perimeter Lighting', 'First Aid Kit'],
        address: 'Main Jorabat Crossing (Opposite Weighbridge), Guwahati-Meghalaya Border',
        contact: '+91 361 291 4410',
        priceRange: 'Economical Transit & Logistics',
        dispatchSupport: 'Primary Interstate Driver Waypoint'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6640, 26.1520] },
      properties: {
        id: 'hotel-brahmaputra-grand',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Hotel Brahmaputra Grand & Transit Hub (Jalukbari)',
        title: 'Brahmaputra Grand - Jalukbari Gateway',
        rating: '4.4 ★',
        status: 'operational',
        roomsCount: '62 Air-Conditioned Rooms',
        amenities: ['Secure Logistics Compound', '24/7 Heavy Generator Backup', 'All-Day Buffet & Packaged Meals', 'CCTV Surveillance'],
        facilities: ['Fast Check-In', 'Large Parking Lot', 'Mechanic Assistance On-Demand'],
        address: 'NH-27 Junction, Jalukbari West, Guwahati',
        contact: '+91 361 257 8890',
        priceRange: 'Midscale Business & Transit',
        dispatchSupport: 'Western Gateway Staging Point'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7450, 26.1880] },
      properties: {
        id: 'hotel-dynasty-panbazar',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Hotel Dynasty (Panbazar Riverfront)',
        title: 'Hotel Dynasty - City Center',
        rating: '4.5 ★',
        status: 'operational',
        roomsCount: '80 Executive Rooms',
        amenities: ['Heart of City Location', 'Executive Conference Suites', '24h Kitchen & High Security', 'Ample Car Parking'],
        facilities: ['Direct Brahmaputra River View', 'Laundry & Courier Desk'],
        address: 'SS Road, Lakhtokia, Panbazar, Guwahati',
        contact: '+91 361 251 6021',
        priceRange: 'Business Class',
        dispatchSupport: 'North Bank Administration Access'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7910, 26.1340] },
      properties: {
        id: 'hotel-green-valley-beltola',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Green Valley Transit Lodge & Rest Stop (Beltola)',
        title: 'Green Valley Transit Lodge - Beltola',
        rating: '4.3 ★',
        status: 'operational',
        roomsCount: '38 Rooms',
        amenities: ['Relief Crew Bunks', 'Secure Locked Parking Yard', '24/7 Hot Water & Power', 'Hygienic Home-Style Dining'],
        facilities: ['Quick Turnaround Rest Rooms', 'Drinking Water Refill Station'],
        address: 'Beltola Tiniali, Near Flyover, Guwahati',
        contact: '+91 361 228 3340',
        priceRange: 'Budget Transit',
        dispatchSupport: 'East Guwahati Supply Node'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6080, 26.1280] },
      properties: {
        id: 'hotel-kiranshree-grand',
        type: 'hotel',
        category: 'amenity_point',
        name: 'Kiranshree Grand (Airport Corridor / Borjhar)',
        title: 'Kiranshree Grand Hotel & Convention',
        rating: '4.7 ★',
        status: 'operational',
        roomsCount: '122 Premium Rooms',
        amenities: ['Airport Shuttle & Freight Liaison', 'Extensive Secured Vehicle Fleet Grounds', '24/7 Continuous Power', 'Luxury Dining & Quick Grab Deli'],
        facilities: ['Emergency Coordination Suite', 'Driver Dorms Available'],
        address: 'New Airport Road, Borjhar, West Guwahati',
        contact: '+91 361 284 1000',
        priceRange: 'Luxury Transit',
        dispatchSupport: 'Airport Logistics Gateway'
      }
    }
  ]
};

// ==========================================
// 4. SIMULATED VEHICLES, INCIDENTS, LOGISTICS, ROUTES, ZONES & POIS
// ==========================================

let simulatedVehicles: GeoJSONFeature[] = [
  {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [91.7362, 26.1445] },
    properties: { id: 'v1', type: 'vehicle', status: 'active', heading: 45, driver: 'Raju Sharma', timestamp: Date.now(), cargo: 'Medical & Vaccines', eta: '32 mins' }
  },
  {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [91.8050, 26.1250] },
    properties: { id: 'v2', type: 'vehicle', status: 'active', heading: 120, driver: 'Amit Kalita', timestamp: Date.now() - 1200000, cargo: 'Relief Rations', eta: '18 mins' }
  },
  {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [91.6850, 26.1550] },
    properties: { id: 'v3', type: 'vehicle', status: 'active', heading: 270, driver: 'Debojit Barman', timestamp: Date.now() - 3600000, cargo: 'Emergency Generator', eta: '45 mins' }
  }
];

// Dedicated Fetch Functions for specific GeoJSON Layers
export const fetchLandslideProneAreasGeoJSON = async (bounds?: any): Promise<GeoJSONFeatureCollection> => {
  await new Promise(r => setTimeout(r, 120));
  return JSON.parse(JSON.stringify(LANDSLIDE_PRONE_GEOJSON));
};

export const fetchPetrolStationsGeoJSON = async (bounds?: any): Promise<GeoJSONFeatureCollection> => {
  await new Promise(r => setTimeout(r, 120));
  return JSON.parse(JSON.stringify(PETROL_STATIONS_GEOJSON));
};

export const fetchHotelsGeoJSON = async (bounds?: any): Promise<GeoJSONFeatureCollection> => {
  await new Promise(r => setTimeout(r, 120));
  return JSON.parse(JSON.stringify(HOTELS_GEOJSON));
};

export const fetchCustomGeoJSONData = async (types?: string[], bounds?: any) => {
  const [landslides, petrolStations, hotels] = await Promise.all([
    fetchLandslideProneAreasGeoJSON(bounds),
    fetchPetrolStationsGeoJSON(bounds),
    fetchHotelsGeoJSON(bounds)
  ]);
  return {
    landslides,
    petrolStations,
    hotels,
    center: GUWAHATI_CENTER
  };
};

/**
 * Primary Map Data Loader
 * Fetches and aggregates all GeoJSON points centered on Guwahati
 */
export const fetchMapData = async (bounds: any, filters?: any): Promise<MapDataResponse> => {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 200));

  // Simulate vehicle movement
  if (simulatedVehicles[0]) {
    simulatedVehicles[0].geometry.coordinates[0] += 0.0006 * (Math.random() - 0.3);
    simulatedVehicles[0].geometry.coordinates[1] += 0.0006 * (Math.random() - 0.3);
    simulatedVehicles[0].properties.timestamp = Date.now();
  }
  const vehicles = JSON.parse(JSON.stringify(simulatedVehicles));

  // Incidents
  const incidents: GeoJSONFeature[] = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7050, 26.1550] },
      properties: { 
        id: 'i1', 
        type: 'landslide', 
        severity: 'critical', 
        status: 'active', 
        verified: true, 
        title: 'Kamakhya Foothills Landslide Blockage', 
        description: 'Major rockfall and red soil slide blocking Kamakhya foothills road.', 
        timestamp: Date.now() - 7200000 
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8950, 26.1080] },
      properties: { 
        id: 'i-jorabat-landslide', 
        type: 'landslide', 
        severity: 'critical', 
        status: 'active', 
        verified: true, 
        title: 'Jorabat Border Hill Landslide', 
        description: 'Heavy mudslide and debris blockage at Jorabat NH-6/NH-27 Meghalaya border junction.', 
        timestamp: Date.now() - 3600000 
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7720, 26.1680] },
      properties: { 
        id: 'i2', 
        type: 'flood', 
        severity: 'high', 
        status: 'active', 
        verified: true, 
        title: 'GS Road / Zoo Road Water Overflow', 
        description: 'Flash flood water level above safety mark on arterial corridor.', 
        timestamp: Date.now() - 14400000 
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6620, 26.1510] },
      properties: { 
        id: 'i3', 
        type: 'accident', 
        severity: 'high', 
        status: 'active', 
        verified: true, 
        title: 'Jalukbari Rotary Collision', 
        description: 'Multi-vehicle collision blocking two outbound lanes.', 
        timestamp: Date.now() - 3600000 
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7880, 26.1120] },
      properties: { 
        id: 'i4', 
        type: 'accident', 
        severity: 'medium', 
        status: 'active', 
        verified: true, 
        title: 'Khanapara Bypass Truck Breakdown', 
        description: 'Heavy freight vehicle breakdown and fuel spillage on shoulder.', 
        timestamp: Date.now() - 1800000 
      }
    }
  ];

  // Logistics Hubs & Points
  const logistics: GeoJSONFeature[] = [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7000, 26.1200] },
      properties: { 
        id: 'w1', 
        type: 'warehouse', 
        hubType: 'alpha',
        isHub: true,
        name: 'Hub Alpha (Garchuk Depot 🏠)', 
        title: 'Hub Alpha (Primary Depot)',
        status: 'operational', 
        capacity: '85%', 
        address: 'NH-27 Garchuk Junction, West Guwahati',
        activeFleetCount: 18,
        contact: '+91 361 245 9011',
        timestamp: Date.now() 
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8150, 26.1350] },
      properties: { 
        id: 'w2', 
        type: 'warehouse', 
        hubType: 'beta',
        isHub: true,
        name: 'Hub Beta (Six Mile Logistics Center 🏠)', 
        title: 'Hub Beta (East Emergency Hub)',
        status: 'operational', 
        capacity: '72%', 
        address: 'VIP Road / Six Mile Commercial Zone, East Guwahati',
        activeFleetCount: 14,
        contact: '+91 361 289 4420',
        timestamp: Date.now() 
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7850, 26.1450] },
      properties: { id: 'w3', type: 'delivery', status: 'operational', name: 'Dispur Medical Center', priority: 'critical', timestamp: Date.now() }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8000, 26.1100] },
      properties: { id: 'w4', type: 'checkpoint', status: 'operational', name: 'Khanapara Checkpoint', timestamp: Date.now() }
    }
  ];

  // Points of Interest (Roadwork, Restaurants, plus merged pointers)
  const pois: GeoJSONFeature[] = [
    // Men at Work / Roadwork
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7920, 26.1310] },
      properties: { 
        id: 'poi-work-1', 
        type: 'roadwork', 
        name: 'Flyover Expansion & Resurfacing (Beltola)', 
        title: 'Men at Work: Beltola Flyover',
        status: 'in_progress', 
        severity: 'medium',
        contractor: 'PWD Highway Div.',
        description: 'Single-lane closure for flyover girder erection and bitumen resurfacing.',
        expectedClearance: 'Tomorrow 06:00 AM'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.6250, 26.1400] },
      properties: { 
        id: 'poi-work-2', 
        type: 'roadwork', 
        name: 'Airport VIP Road Culvert & Trenching', 
        title: 'Men at Work: Airport VIP Road',
        status: 'in_progress', 
        severity: 'medium',
        contractor: 'GMDA Drainage Project',
        description: 'Heavy machinery digging stormwater drain channel along road shoulder.',
        expectedClearance: '3 Days'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7610, 26.1580] },
      properties: { 
        id: 'poi-work-3', 
        type: 'roadwork', 
        name: 'Bhangagarh GS Road Paving Work', 
        title: 'Men at Work: Bhangagarh GS Road',
        status: 'in_progress', 
        severity: 'low',
        contractor: 'Guwahati Municipal Corp.',
        description: 'Night time asphalt resurfacing and line painting crew active.',
        expectedClearance: 'Today 11:00 PM'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8880, 26.1130] },
      properties: { 
        id: 'poi-work-4', 
        type: 'roadwork', 
        name: 'Jorabat Slope Stabilization & Retaining Wall', 
        title: 'Men at Work: Jorabat Retaining Wall',
        status: 'in_progress', 
        severity: 'high',
        contractor: 'NHAI Emergency Works',
        description: 'Installing steel mesh geo-reinforcement and rock anchors to mitigate landslides.',
        expectedClearance: 'Active 24/7'
      }
    },
    // Restaurants
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7740, 26.1620] },
      properties: { 
        id: 'poi-rest-1', 
        type: 'restaurant', 
        name: 'Khorikaa Traditional Assamese Diner', 
        title: 'Khorikaa Restaurant',
        status: 'operational',
        cuisine: 'Traditional Assamese, Thalis & BBQ',
        seating: '120 Seats',
        openHours: '11:00 AM - 10:30 PM',
        address: 'Kamal C Plaza, GS Road, Guwahati'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7680, 26.1850] },
      properties: { 
        id: 'poi-rest-2', 
        type: 'restaurant', 
        name: 'Paradise Heritage Food Complex', 
        title: 'Paradise Restaurant',
        status: 'operational',
        cuisine: 'Assamese & North Indian Thalis',
        seating: '150 Seats',
        openHours: '11:00 AM - 10:00 PM',
        address: 'Maniram Dewan Road, Silpukhuri, Guwahati'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.8900, 26.1120] },
      properties: { 
        id: 'poi-rest-3', 
        type: 'restaurant', 
        name: 'Jiva Veg & Highway Dhaba (Jorabat)', 
        title: 'Jiva Veg Highway Dhaba',
        status: 'operational',
        cuisine: 'North Indian, South Indian, 24/7 Chai & Parathas',
        seating: '200 Seats',
        openHours: '24 Hours Open',
        address: 'NH-6/NH-27 Junction, Jorabat'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [91.7950, 26.1360] },
      properties: { 
        id: 'poi-rest-4', 
        type: 'restaurant', 
        name: 'Machaal Highway Diner & Cafe (Beltola)', 
        title: 'Machaal Diner & Cafe',
        status: 'operational',
        cuisine: 'Fast Food, Tea, Meals, Fresh Bakery',
        seating: '80 Seats',
        openHours: '07:00 AM - 11:30 PM',
        address: 'Beltola Tiniali Road, Guwahati'
      }
    },
    // Merge Petrol Stations into POI array for backwards compatibility
    ...PETROL_STATIONS_GEOJSON.features,
    // Merge Hotels into POI array for backwards compatibility
    ...HOTELS_GEOJSON.features
  ];

  // Routes
  const routes: GeoJSONFeature[] = [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.6600, 26.1500],
          [91.7100, 26.1650],
          [91.7500, 26.1800],
          [91.7900, 26.1500]
        ]
      },
      properties: { 
        id: 'r1', 
        name: 'Guwahati Northern Express Arterial',
        type: 'active_route', 
        risk: 'low', 
        accessibility: 'open', 
        distance: '14.2 km', 
        eta: '28 mins',
        status: 'Clear & Flowing'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.6550, 26.1400],
          [91.7200, 26.1150],
          [91.7850, 26.1050],
          [91.8150, 26.1200],
          [91.8900, 26.1100]
        ]
      },
      properties: { 
        id: 'r2', 
        name: 'NH-27 / NH-6 Jorabat Heavy Freight Link',
        type: 'high_risk_corridor', 
        risk: 'critical', 
        accessibility: 'restricted', 
        distance: '22.8 km', 
        eta: '58 mins', 
        factors: 'Heavy Rain, Landslide Risk near Jorabat Pass',
        status: 'Restricted - High Alert'
      }
    },
    // Emergency Medical Route (Red Corridor)
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.7750, 26.1540],
          [91.7500, 26.1600],
          [91.7100, 26.1650],
          [91.6600, 26.1500],
          [91.5900, 26.1150]
        ]
      },
      properties: {
        id: 'r-emg-medical',
        name: 'Emergency Medical Green Corridor (GMCH to Airport)',
        type: 'emergency_route',
        emergencyCategory: 'medical',
        title: 'Emergency Medical Green Corridor',
        risk: 'low',
        accessibility: 'open',
        color: '#ef4444',
        distance: '26.4 km',
        eta: '32 mins',
        protocol: 'Assam Police Green Light Escort Active',
        priorityLevel: 'Tier 1 Priority'
      }
    },
    // Essential Food & PDS Corridor (Green Corridor)
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.6850, 26.1850],
          [91.7100, 26.1650],
          [91.7500, 26.1400],
          [91.7900, 26.1200]
        ]
      },
      properties: {
        id: 'r-emg-food',
        name: 'Essential Food Supply Corridor (Amingaon - Khanapara)',
        type: 'emergency_route',
        emergencyCategory: 'food',
        title: 'Essential Food Supply Corridor',
        risk: 'low',
        accessibility: 'open',
        color: '#22c55e',
        distance: '19.8 km',
        eta: '41 mins',
        protocol: 'FCI Essential Commodities Clearance Active',
        priorityLevel: 'Tier 2 Priority'
      }
    },
    // Disaster Response & SDRF Rapid Route (Purple Corridor)
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.7800, 26.1400],
          [91.8150, 26.1200],
          [91.8500, 26.1100],
          [91.8950, 26.1080]
        ]
      },
      properties: {
        id: 'r-emg-disaster',
        name: 'SDRF Rapid Disaster Deployment Route (Dispur - Jorabat)',
        type: 'emergency_route',
        emergencyCategory: 'disaster',
        title: 'SDRF Rapid Disaster Route',
        risk: 'moderate',
        accessibility: 'restricted',
        color: '#a855f7',
        distance: '15.2 km',
        eta: '25 mins',
        protocol: 'State Disaster Management Escort Activated',
        priorityLevel: 'Tier 1 Priority'
      }
    },
    // Emergency Evacuation & Fuel Trunk Line (Orange Corridor)
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [91.8050, 26.1880],
          [91.7900, 26.1500],
          [91.7500, 26.1200],
          [91.6900, 26.1150]
        ]
      },
      properties: {
        id: 'r-emg-evacuation',
        name: 'Refinery Petroleum Trunk & Evacuation Highway (Noonmati - Garchuk)',
        type: 'emergency_route',
        emergencyCategory: 'evacuation',
        title: 'Petroleum Trunk & Evacuation Highway',
        risk: 'low',
        accessibility: 'open',
        color: '#f97316',
        distance: '18.1 km',
        eta: '34 mins',
        protocol: 'Hazardous Materials & Fuel Escort Standard Active',
        priorityLevel: 'Tier 2 Priority'
      }
    }
  ];

  // Hazard / Demand Zones
  const zones: GeoJSONFeature[] = [
    // GS Road Flood Zone
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.76, 26.15],
          [91.80, 26.15],
          [91.80, 26.18],
          [91.76, 26.18],
          [91.76, 26.15]
        ]]
      },
      properties: { 
        id: 'z1', 
        type: 'flood_zone', 
        severity: 'high', 
        name: 'GS Road Flood Vulnerability Zone',
        description: 'Low-lying urban drainage basin prone to rapid waterlogging during heavy precipitation.' 
      }
    },
    // Jorabat Landslide Zone
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [91.875, 26.095],
          [91.925, 26.095],
          [91.925, 26.125],
          [91.875, 26.125],
          [91.875, 26.095]
        ]]
      },
      properties: { 
        id: 'z-jorabat-landslide', 
        type: 'landslide_zone', 
        severity: 'critical', 
        name: 'Jorabat Landslide Risk Zone (NH-6 / NH-27)',
        description: 'Active steep slope cutting and mountain runoff area prone to major mudslides and debris blocking interstate freight.' 
      }
    }
  ];

  // Filter incidents if filters are provided
  let filteredIncidents = incidents;
  if (filters?.severity) {
    filteredIncidents = incidents.filter(i => {
      if (i.properties.severity === 'critical' && !filters.severity.critical) return false;
      if (i.properties.severity === 'high' && !filters.severity.high) return false;
      if (i.properties.severity === 'medium' && !filters.severity.medium) return false;
      if (i.properties.severity === 'low' && !filters.severity.low) return false;
      return true;
    });
  }

  return {
    vehicles: vehicles as GeoJSONFeature[],
    incidents: filteredIncidents as GeoJSONFeature[],
    landslides: LANDSLIDE_PRONE_GEOJSON.features as GeoJSONFeature[],
    petrolStations: PETROL_STATIONS_GEOJSON.features as GeoJSONFeature[],
    hotels: HOTELS_GEOJSON.features as GeoJSONFeature[],
    logistics: logistics as GeoJSONFeature[],
    routes: routes as GeoJSONFeature[],
    zones: zones as GeoJSONFeature[],
    pois: pois as GeoJSONFeature[]
  };
};
