import React, { useState, useRef } from 'react';
import { Camera, X, Upload, MapPin, AlertCircle, FileAudio } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useReportStore } from '../../store/useReportStore';
import { ReportCategory } from '../../types';

const CATEGORIES: ReportCategory[] = [
  'Landslide', 'Flooding', 'Road damage', 'Bridge damage', 
  'Road blockage', 'Accident', 'Vehicle breakdown', 
  'Traffic congestion', 'Weather hazard', 'Accessibility problem', 
  'Supply emergency', 'Other'
];

interface Props {
  onClose: () => void;
}

export default function ReportIncidentModal({ onClose }: Props) {
  const { currentLocation, user } = useAppStore();
  const { addFieldReport } = useReportStore();
  
  const [category, setCategory] = useState<ReportCategory>('Road blockage');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        setError('Images must be smaller than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      
      const url = URL.createObjectURL(file);
      newPhotos.push(url);
    });

    setPhotos(prev => [...prev, ...newPhotos]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentLocation) {
      setError('Cannot get GPS location. Required for reporting.');
      return;
    }
    if (!user) {
      setError('User not identified.');
      return;
    }

    addFieldReport({
      category,
      severity,
      description,
      location: currentLocation,
      photoUrls: photos,
      reporterId: user.id
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] p-4 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#27272A] border border-[#D4A373]/25 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-full text-[#FAF7F2]">
        <div className="flex justify-between items-center p-4 border-b border-[#D4A373]/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E9C46A]/15 border border-[#E9C46A]/30 flex items-center justify-center text-[#E9C46A]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#FAF7F2] font-heading">Field Report Incident</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              {error}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 bg-[#18181B]/80 border border-[#D4A373]/20 p-2.5 rounded-xl">
            <MapPin className="w-4 h-4 text-[#E9C46A]" />
            {currentLocation ? `GPS Logged: ${currentLocation[1].toFixed(4)}, ${currentLocation[0].toFixed(4)}` : 'Waiting for GPS...'}
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[#D4A373] tracking-wider mb-1.5">Incident Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value as ReportCategory)}
              className="w-full p-2.5 bg-[#18181B] border border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#E9C46A]/50 focus:border-[#E9C46A] text-[#FAF7F2] outline-none text-sm font-medium"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-[#18181B] text-[#FAF7F2]">{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[#D4A373] tracking-wider mb-1.5">Severity Level</label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level as any)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    severity === level 
                      ? level === 'Critical' 
                        ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-950/60' 
                        : level === 'High' 
                        ? 'bg-amber-600 border-amber-500 text-white shadow-md' 
                        : 'bg-[#D4A373] border-[#E9C46A] text-[#18181B] shadow-md'
                      : 'bg-[#18181B]/60 text-zinc-400 border-zinc-700/60 hover:text-[#FAF7F2] hover:bg-zinc-800'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[#D4A373] tracking-wider mb-1.5">Situation Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe road blockage, debris, landslide, or flood details..."
              className="w-full p-3 bg-[#18181B] border border-zinc-700 rounded-xl focus:ring-2 focus:ring-[#E9C46A]/50 focus:border-[#E9C46A] text-[#FAF7F2] placeholder-zinc-500 outline-none resize-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[#D4A373] tracking-wider mb-2">Visual Evidence</label>
            <div className="flex gap-3">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border border-dashed border-[#D4A373]/30 bg-[#18181B]/50 text-zinc-300 hover:border-[#E9C46A] hover:text-[#E9C46A] hover:bg-[#18181B] transition-all p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5"
              >
                <Camera className="w-5 h-5 text-[#E9C46A]" />
                <span className="text-xs font-semibold">Upload Photo</span>
              </button>
              
              <button 
                type="button"
                className="flex-1 border border-dashed border-zinc-800 bg-[#18181B]/30 text-zinc-500 p-3.5 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-not-allowed opacity-60"
                title="Voice notes in field"
              >
                <FileAudio className="w-5 h-5" />
                <span className="text-xs font-medium">Voice Note (Beta)</span>
              </button>
            </div>

            {photos.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#D4A373]/30">
                    <img src={url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, index) => index !== i))}
                      className="absolute top-1 right-1 bg-rose-600 text-white p-0.5 rounded-full shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        <div className="p-4 border-t border-[#D4A373]/15 flex gap-3 bg-zinc-900/40">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white font-bold rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            disabled={!currentLocation}
            className="flex-1 py-2.5 bg-gradient-to-r from-[#D4A373] to-[#E9C46A] hover:brightness-105 text-[#18181B] font-bold rounded-xl disabled:opacity-50 transition-all shadow-md shadow-[#D4A373]/20 active:scale-95 text-sm"
          >
            Submit Incident
          </button>
        </div>
      </div>
    </div>
  );
}
