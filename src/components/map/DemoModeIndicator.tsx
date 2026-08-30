import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DemoModeIndicator() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border-2 border-white animate-in slide-in-from-top-4">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">Demo Mode Active - Simulated Data</span>
      </div>
    </div>
  );
}
