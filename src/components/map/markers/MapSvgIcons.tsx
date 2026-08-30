import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Custom distinct SVG icon for Landslide-Prone Areas & Hazard Slopes.
 * Features steep mountain terrain, falling rock debris, and warning chevron.
 */
export function LandslideHazardSvg({ className = 'w-5 h-5', size, color }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Mountain Base & Ridge */}
      <path d="M2 20h20" strokeWidth="2.5" />
      <path d="M3.5 20l6.5-12 3 5 3-4 4.5 11" fill="currentColor" fillOpacity="0.15" />
      {/* Slope Fault Line */}
      <path d="M7 14l5-2 3 5" strokeDasharray="1.5 1.5" />
      {/* Falling Rock Fragments / Boulder Debris */}
      <polygon points="17,6 19,8 18,10 16,9" fill="currentColor" />
      <polygon points="14,3 16,5 15,6 13,5" fill="currentColor" />
      <polygon points="19.5,12 21.5,13.5 20.5,15 18.5,14" fill="currentColor" />
    </svg>
  );
}

/**
 * Custom distinct SVG icon for Petrol & Fuel Stations (with EV capability).
 * Features commercial fuel dispenser pump, nozzle hose, digital readout, and pump base.
 */
export function PetrolPumpSvg({ className = 'w-5 h-5', size, color }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Pump Main Body */}
      <rect x="3" y="3" width="11" height="18" rx="2" fill="currentColor" fillOpacity="0.15" />
      {/* Digital Meter / Liters Display */}
      <rect x="5.5" y="6" width="6" height="4" rx="0.5" fill="currentColor" fillOpacity="0.3" />
      <line x1="7" y1="8" x2="10" y2="8" strokeWidth="1.5" />
      {/* Fuel Nozzle Base / Cradle */}
      <path d="M14 9h2a2 2 0 0 1 2 2v7a1.5 1.5 0 0 1-3 0v-4" />
      {/* Dispenser Nozzle Grip */}
      <path d="M17 6l2-2v4h-2" fill="currentColor" />
      {/* Pump Island Base */}
      <line x1="2" y1="21" x2="15" y2="21" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * Custom distinct SVG icon for Hotels & Transit Lodging.
 * Features grand multi-story facade, arched entrance canopy, window grid, and star crown.
 */
export function HotelLodgingSvg({ className = 'w-5 h-5', size, color }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Hotel Main Building Structure */}
      <rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fillOpacity="0.15" />
      {/* Arched Ground Entrance */}
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" fill="currentColor" fillOpacity="0.4" />
      {/* Window Rows (Rooms) */}
      <rect x="7" y="6" width="2.5" height="2" rx="0.5" fill="currentColor" />
      <rect x="14.5" y="6" width="2.5" height="2" rx="0.5" fill="currentColor" />
      <rect x="7" y="11" width="2.5" height="2" rx="0.5" fill="currentColor" />
      <rect x="14.5" y="11" width="2.5" height="2" rx="0.5" fill="currentColor" />
      {/* Building Crown Sign "H" / Flag */}
      <path d="M10.5 3V1.5h3V3" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Custom distinct SVG icon for Men at Work / Roadwork.
 */
export function RoadworkSvg({ className = 'w-5 h-5', size, color }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      {/* Hard hat silhouette */}
      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" fill="currentColor" fillOpacity="0.2" />
      <path d="M10 10V5a2 2 0 0 1 4 0v5" />
      <path d="M4 15a8 8 0 0 1 16 0" />
    </svg>
  );
}
