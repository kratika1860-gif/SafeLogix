import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Ambulance, 
  Shield, 
  Flame, 
  Truck, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Radio,
  FileText
} from 'lucide-react';
import { EmergencyReport } from '../../types';
import { playDispatchTone } from '../../lib/audioAlerts';

interface Props {
  alert: EmergencyReport;
  onClose: () => void;
  onDispatch: (unitName: string, notes: string) => void;
}

interface PresetUnit {
  id: string;
  name: string;
  type: 'medical' | 'sdrf' | 'police' | 'recovery';
  distance: string;
  eta: string;
  phone: string;
  status: 'Ready' | 'On Call';
}

const PRESET_UNITS: PresetUnit[] = [
  {
    id: 'unit-sdrf-1',
    name: 'Assam SDRF Quick Response Unit 2 (Guwahati)',
    type: 'sdrf',
    distance: '2.8 km',
    eta: '6 mins',
    phone: '1070',
    status: 'Ready'
  },
  {
    id: 'unit-med-gmch',
    name: 'GMCH Critical Care Trauma Ambulance',
    type: 'medical',
    distance: '4.2 km',
    eta: '8 mins',
    phone: '108',
    status: 'Ready'
  },
  {
    id: 'unit-pol-hwy',
    name: 'Highway Patrol Taskforce - NH-27 Interceptor',
    type: 'police',
    distance: '1.9 km',
    eta: '4 mins',
    phone: '112',
    status: 'Ready'
  },
  {
    id: 'unit-rec-heavy',
    name: 'Kamrup Heavy Winch & Crane Recovery #4',
    type: 'recovery',
    distance: '5.6 km',
    eta: '12 mins',
    phone: '+91 94350-99112',
    status: 'Ready'
  }
];

export default function EmergencyDispatchModal({ alert, onClose, onDispatch }: Props) {
  const [selectedUnit, setSelectedUnit] = useState<string>(PRESET_UNITS[0].name);
  const [customUnit, setCustomUnit] = useState<string>('');
  const [notes, setNotes] = useState<string>('Priority emergency clearance authorized. Dispatching immediate response.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    playDispatchTone();

    const unitName = customUnit.trim() || selectedUnit;
    setTimeout(() => {
      onDispatch(unitName, notes);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Ambulance className="w-5 h-5 text-rose-500" />;
      case 'sdrf': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'police': return <Shield className="w-5 h-5 text-blue-500" />;
      default: return <Truck className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/80 px-6 py-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Dispatch Emergency Response Unit
              </h3>
              <p className="text-xs text-slate-400">
                Incident #{alert.id} &bull; {alert.category} &bull; {alert.address || 'Guwahati Corridor'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Location Summary */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-mono text-slate-300">
                {alert.location[1].toFixed(5)}°N, {alert.location[0].toFixed(5)}°E
              </span>
            </div>
            <div className="text-slate-400">
              Reporter: <span className="font-semibold text-slate-200">{alert.reporterName || alert.reporterId}</span>
            </div>
          </div>

          {/* Preset Responders Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Nearest Field Unit
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
              {PRESET_UNITS.map(unit => {
                const isSelected = selectedUnit === unit.name && !customUnit;
                return (
                  <div
                    key={unit.id}
                    onClick={() => {
                      setSelectedUnit(unit.name);
                      setCustomUnit('');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected 
                        ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500/50' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                        {getUnitIcon(unit.type)}
                      </div>
                      <div>
                        <p className="font-bold text-xs sm:text-sm">{unit.name}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            ETA: <strong className="text-emerald-400">{unit.eta}</strong> ({unit.distance})
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {unit.phone}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Unit Alternative */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Or Specify Custom Unit / Call-Sign
            </label>
            <input
              type="text"
              placeholder="e.g. Assam Police PCR-12 / Dispur Traffic Outpost"
              value={customUnit}
              onChange={(e) => setCustomUnit(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Dispatch Notes / Instructions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Priority Directives & Operational Notes</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              <span>Confirm & Dispatch Unit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
