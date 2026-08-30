import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Package, MapPin, Clock, AlertTriangle, User, Truck, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function StartTripModal() {
  const { activeTrip, updateTripStatus, assignedVehicle, user } = useAppStore();

  if (!activeTrip || (activeTrip.status !== 'assigned' && activeTrip.status !== 'accepted')) {
    return null; // Only show pre-start if it's assigned or accepted
  }

  const handleConfirm = () => {
    // Transition state
    if (activeTrip.status === 'assigned') {
      updateTripStatus('accepted');
    } else {
      updateTripStatus('started');
      // Set to 'in_transit' slightly after, or let the tracking hook do it
      setTimeout(() => updateTripStatus('in_transit'), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-full">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-bold mb-1">New Trip Assignment</h2>
            <p className="text-blue-100 text-sm">Please review and confirm dispatch.</p>
          </div>
          <div className="bg-blue-500/50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {activeTrip.priorityLevel} Priority
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Route Info */}
          <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-6 py-2">
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-white border-2 border-slate-300 rounded-full" />
              <p className="text-xs font-bold text-slate-500 uppercase">Pickup Location</p>
              <p className="font-semibold text-slate-800">{activeTrip.pickupLocation}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0.5 w-4 h-4 bg-white border-2 border-blue-600 rounded-full" />
              <p className="text-xs font-bold text-slate-500 uppercase">Destination</p>
              <p className="font-semibold text-slate-800">{activeTrip.destination}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Package className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Cargo</span>
              </div>
              <p className="font-semibold text-slate-800">{activeTrip.cargoCategory}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Est. Travel</span>
              </div>
              <p className="font-semibold text-slate-800">{activeTrip.eta}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-yellow-800">Risk Assessment: {activeTrip.riskLevel}</p>
              <p className="text-xs text-yellow-700 mt-1">{activeTrip.weatherWarning}</p>
            </div>
          </div>

          {/* Asset Info */}
          <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Vehicle</p>
                <p className="text-sm font-semibold text-slate-800">{assignedVehicle?.licensePlate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Driver</p>
                <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            id="btn-decline-trip"
            className="px-6 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            onClick={() => updateTripStatus('cancelled')}
          >
            Decline
          </button>
          <button 
            id="btn-confirm-trip"
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-white transition-colors shadow-md cursor-pointer",
              activeTrip.status === 'assigned' ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"
            )}
            onClick={handleConfirm}
          >
            {activeTrip.status === 'assigned' ? 'Accept Trip' : 'Start Engine & Go'}
          </button>
        </div>
      </div>
    </div>
  );
}
