import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, X, Navigation } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useReportStore } from '../../store/useReportStore';
import { EmergencyCategory } from '../../types';

const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  'Road Blocked', 'Medical Emergency', 'Accident', 
  'Flood', 'Landslide', 'Vehicle Failure'
];

interface Props {
  onClose: () => void;
}

export default function EmergencyModal({ onClose }: Props) {
  const { currentLocation, user, activeTrip } = useAppStore();
  const { addEmergencyReport } = useReportStore();
  
  const [countdown, setCountdown] = useState(3);
  const [category, setCategory] = useState<EmergencyCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-countdown to prevent accidental clicks
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleDispatch = () => {
    if (!currentLocation) {
      setError('Cannot get GPS location. Required for emergency dispatch.');
      return;
    }
    if (!user) {
      setError('User not identified.');
      return;
    }
    if (!category) {
      setError('Please select an emergency type.');
      return;
    }

    addEmergencyReport({
      category,
      location: currentLocation,
      tripId: activeTrip?.id || 'TRP-' + Math.floor(4000 + Math.random() * 2000),
      reporterId: user.id,
      reporterName: user.name || 'Field Driver (' + user.id + ')',
      reporterPhone: '+91 94350-' + Math.floor(10000 + Math.random() * 90000),
      vehiclePlate: 'AS-01-GC-' + Math.floor(1000 + Math.random() * 9000),
      vehicleModel: 'Freight Logistics 4x4',
      cargoDescription: activeTrip?.cargoCategory || 'Priority Freight Logistics Goods',
      district: 'Kamrup Metropolitan'
    });
    
    // In a real app, this might go to a different screen or remain open
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] p-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#27272A] w-full max-w-lg rounded-2xl shadow-2xl flex flex-col border border-rose-500/40 overflow-hidden text-[#FAF7F2]">
        
        <div className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 border-b border-rose-500/30 p-6 flex flex-col items-center justify-center text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-zinc-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 rounded-2xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center mb-3 shadow-lg shadow-rose-950/80">
            <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider font-heading text-rose-100">Emergency Dispatch SOS</h2>
          <p className="text-rose-200/80 text-xs mt-1 font-medium text-center max-w-sm">
            Immediately alerts State Disaster Command, Logistics Fleet Supervisors & SDRF units.
          </p>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs mb-4 font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            <div className="bg-[#18181B] border border-[#D4A373]/20 p-3 rounded-xl flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#E9C46A] shrink-0" />
              <div className="text-xs min-w-0">
                <div className="font-bold text-zinc-400 uppercase text-[10px]">Location</div>
                <div className="text-[#FAF7F2] font-mono text-xs truncate">
                  {currentLocation ? `${currentLocation[1].toFixed(5)}, ${currentLocation[0].toFixed(5)}` : 'Locating...'}
                </div>
              </div>
            </div>
            
            <div className="bg-[#18181B] border border-[#D4A373]/20 p-3 rounded-xl flex items-center gap-2.5">
              <Navigation className="w-4 h-4 text-[#E9C46A] shrink-0" />
              <div className="text-xs min-w-0">
                <div className="font-bold text-zinc-400 uppercase text-[10px]">Active Mission</div>
                <div className="text-[#FAF7F2] font-mono text-xs truncate">
                  {activeTrip ? activeTrip.id : 'Direct Field Broadcast'}
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-[#D4A373] mb-2.5 text-xs uppercase tracking-wider">Select Emergency Category</h3>
          
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {EMERGENCY_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setError(null);
                }}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                  category === cat 
                    ? 'border-rose-500 bg-rose-500/20 text-rose-200 shadow-md shadow-rose-950/60' 
                    : 'border-zinc-800 bg-[#18181B]/60 text-zinc-400 hover:border-zinc-700 hover:text-[#FAF7F2] hover:bg-zinc-800/80'
                }`}
              >
                <span>{cat}</span>
                {category === cat && <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4 flex gap-3 border-t border-zinc-800">
            <button 
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-800 text-zinc-300 font-bold rounded-xl hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              onClick={handleDispatch}
              disabled={countdown > 0 || !category}
              className={`flex-[2] py-3 font-bold rounded-xl text-white uppercase tracking-wider text-sm transition-all shadow-lg active:scale-95 ${
                countdown > 0 || !category 
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed shadow-none' 
                  : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-950/80 border border-rose-400/40'
              }`}
            >
              {countdown > 0 ? `Safety Interlock (${countdown}s)` : 'Dispatch SOS Now'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
