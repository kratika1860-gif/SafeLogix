import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Camera, CheckCircle, MapPin, X, UploadCloud, AlertTriangle } from 'lucide-react';
import * as turf from '@turf/turf';

export default function DeliveryCompletionModal({ onClose }: { onClose: () => void }) {
  const { activeTrip, currentLocation, updateTripStatus, setActiveTrip } = useAppStore();
  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  
  if (!activeTrip) return null;

  // Geo-verification
  let distanceToDest = 0;
  let isFarFromDest = false;
  if (currentLocation && activeTrip.destinationCoords) {
    distanceToDest = turf.distance(
      turf.point(currentLocation),
      turf.point(activeTrip.destinationCoords),
      { units: 'kilometers' }
    );
    isFarFromDest = distanceToDest > 0.5; // > 500 meters
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  const submitDelivery = () => {
    updateTripStatus('delivered');
    setTimeout(() => {
      updateTripStatus('completed');
      setActiveTrip(null); // Clear trip from active screen
      onClose();
    }, 2000); // Mock processing time
    setStep(3); // Show success
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative flex flex-col">
        {step < 3 && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Confirm Arrival</h2>
                <p className="text-slate-500 text-sm mt-1">Verify location before completing delivery.</p>
              </div>

              {isFarFromDest ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Geo-verification Warning</p>
                    <p className="text-xs text-amber-700 mt-1">
                      You are {distanceToDest.toFixed(1)}km away from the registered destination. Are you sure you're at the correct location?
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
                  <MapPin className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-800">Location Verified</p>
                    <p className="text-xs text-green-700 mt-1">
                      You are at the correct delivery destination.
                    </p>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setStep(2)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors"
              >
                Confirm Arrival & Proceed
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Proof of Delivery</h2>
                <p className="text-slate-500 text-sm mt-1">Upload required documentation.</p>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Photo (Required)</label>
                {photo ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video flex items-center justify-center">
                    <img src={photo} alt="Proof" className="object-cover w-full h-full" />
                    <button 
                      onClick={() => setPhoto(null)} 
                      className="absolute top-2 right-2 bg-slate-900/60 p-1 rounded-full text-white hover:bg-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors aspect-video cursor-pointer">
                    <Camera className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-500">Tap to take photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Recipient / Notes (Optional)</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g. Handed directly to Site Manager..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                >
                  Back
                </button>
                <button 
                  onClick={submitDelivery}
                  disabled={!photo}
                  className="flex-1 py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-green-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadCloud className="w-5 h-5" />
                  Submit Delivery
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Delivery Completed!</h2>
              <p className="text-slate-500">The trip has been logged and operations notified.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
