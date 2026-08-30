import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Navigation, Clock, ShieldAlert, CheckCircle, PauseCircle, MapPin, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import DeliveryCompletionModal from './DeliveryCompletionModal';
import RerouteModal from './RerouteModal';
import EmergencyModal from '../reporting/EmergencyModal';
import { mockIncidents } from '../../data/mockMapData';

export default function ActiveTripPanel() {
  const { activeTrip, updateTripStatus, currentLocation } = useAppStore();
  const [showCompletion, setShowCompletion] = useState(false);
  const [showReroute, setShowReroute] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);

  if (!activeTrip || activeTrip.status === 'assigned' || activeTrip.status === 'accepted') return null;
  if (activeTrip.status === 'completed' || activeTrip.status === 'cancelled') return null;

  const isPaused = activeTrip.status === 'paused';
  const progressPercent = Math.min(100, Math.max(0, 100 - (activeTrip.remainingDistanceKm / activeTrip.totalDistanceKm) * 100));

  const handlePauseToggle = () => {
    updateTripStatus(isPaused ? 'in_transit' : 'paused');
  };

  const handleDelivery = () => {
    setShowCompletion(true);
  };

  return (
    <>
      {/* HUD Panel on Map */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-[400px] bg-white shadow-2xl rounded-2xl border border-slate-200 overflow-hidden flex flex-col z-20">
        
        {/* Dynamic Header */}
        <div className={cn(
          "p-4 text-white flex justify-between items-center transition-colors",
          isPaused ? "bg-amber-600" : 
          activeTrip.status === 'emergency' ? "bg-red-600" : "bg-blue-700"
        )}>
          <div className="flex items-center gap-2">
            {isPaused ? <PauseCircle className="w-5 h-5 animate-pulse" /> : <Navigation className="w-5 h-5 animate-pulse" />}
            <span className="font-bold uppercase tracking-wider text-sm">
              {activeTrip.status.replace('_', ' ')}
            </span>
          </div>
          <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">
            {activeTrip.priorityLevel}
          </span>
        </div>

        <div className="p-5 space-y-5">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-2 uppercase">
              <span>{activeTrip.pickupLocation}</span>
              <span>{activeTrip.destination}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-800 font-semibold">
              <span>{activeTrip.remainingDistanceKm.toFixed(1)} km left</span>
              <span className="flex items-center gap-1 text-blue-600"><Clock className="w-4 h-4"/> {activeTrip.eta}</span>
            </div>
          </div>

          {/* Warnings Panel */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Road Risk</p>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-1">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                {activeTrip.riskLevel}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Weather</p>
              <p className="text-sm font-bold text-slate-800 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-4 h-4 text-blue-400" />
                {activeTrip.weatherWarning}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={handlePauseToggle}
              className="py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              {isPaused ? 'Resume' : 'Pause Trip'}
            </button>
            <button 
              onClick={handleDelivery}
              className="py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-600/20"
            >
              <CheckCircle className="w-5 h-5" />
              Complete
            </button>
          </div>
          
          <button 
            onClick={() => setShowEmergency(true)}
            className="w-full py-3 rounded-xl font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-5 h-5" />
            Report Emergency
          </button>

          {/* SIMULATION: Trigger Reroute */}
          <button 
            onClick={() => setShowReroute(true)}
            className="w-full mt-2 py-2 rounded-xl font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200 flex items-center justify-center gap-2"
          >
            Simulate Critical Disruption (Reroute)
          </button>

          {/* Cancel Active Trip */}
          <button 
            id="btn-cancel-active-trip"
            onClick={() => updateTripStatus('cancelled')}
            className="w-full mt-2 py-2 rounded-xl font-bold text-zinc-500 hover:text-red-600 bg-zinc-100 hover:bg-red-50 transition-colors border border-zinc-200 flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            Cancel Trip Assignment
          </button>
        </div>
      </div>

      {showCompletion && (
        <DeliveryCompletionModal onClose={() => setShowCompletion(false)} />
      )}

      {showReroute && (
        <RerouteModal 
          incident={mockIncidents[1]}
          onAccept={(routeId) => {
            console.log('Accepted new route:', routeId);
            console.log('Notifying administrators of critical route deviation...');
            setShowReroute(false);
          }}
          onReject={() => setShowReroute(false)}
        />
      )}

      {showEmergency && (
        <EmergencyModal onClose={() => setShowEmergency(false)} />
      )}
    </>
  );
}
