import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { 
  User, Mail, Phone, Truck, ShieldCheck, Activity, Edit2, Check, 
  Award, Sparkles, Radio, Volume2, Moon, Sun, Globe, Calendar, 
  BadgeCheck, Zap, Shield, Key, AlertTriangle, ChevronRight, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OfflineQueueManager from '../components/settings/OfflineQueueManager';
import { cn } from '../lib/utils';

export default function SettingsAndProfile() {
  const { t, i18n } = useTranslation();
  const { user, assignedVehicle, updateUserProfile, updateAssignedVehicle, theme, setTheme, isOnDuty } = useAppStore();
  
  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: user?.phone || '+91 98640 55123',
    emergencyContactName: user?.emergencyContactName || 'Anjali Roy (Spouse)',
    emergencyContactPhone: user?.emergencyContactPhone || '+91 94350 11988',
  });

  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [vehicleSaveSuccess, setVehicleSaveSuccess] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    make: assignedVehicle?.make || 'Tata Motors',
    model: assignedVehicle?.model || 'Yodha 4x4 Heavy Rescue',
    year: assignedVehicle?.year || '2024',
    color: assignedVehicle?.color || 'Tactical Sand / Matte Black',
    licensePlate: assignedVehicle?.licensePlate || 'AS-01-EV-4921',
    registrationNumber: assignedVehicle?.registrationNumber || 'NER-SDRF-2024-889',
  });

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSaveProfile = () => {
    updateUserProfile(profileForm);
    setIsEditingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveVehicle = () => {
    updateAssignedVehicle(vehicleForm);
    setIsEditingVehicle(false);
    setVehicleSaveSuccess(true);
    setTimeout(() => setVehicleSaveSuccess(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#050505] text-[#FAF7F2] p-4 md:p-8 selection:bg-[#D4A373]/30 selection:text-[#FAF7F2]">
      {/* Background ambient luxury lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#D4A373]/[0.04] blur-[180px] rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#E9C46A]/[0.03] blur-[160px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-8 relative z-10 pb-16">
        
        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-5"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#D4A373]/15 text-[#E9C46A] border border-[#D4A373]/30 shadow-inner">
                Unit ID: DRV-{user.id ? user.id.slice(0, 6).toUpperCase() : '88921'}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                Guwahati Command Center Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] font-heading tracking-tight">
              {t('profile.title', 'Driver Command & Settings')}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border shadow-lg backdrop-blur-md",
              isOnDuty 
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-emerald-950/40" 
                : "bg-[#121212] text-zinc-400 border-[#2A2A2A]"
            )}>
              <span className={cn("w-2 h-2 rounded-full", isOnDuty ? "bg-emerald-400 animate-ping" : "bg-zinc-500")} />
              {isOnDuty ? t('app.on_duty', 'Active On Duty') : t('app.off_duty', 'Observing / Standby')}
            </span>
          </div>
        </motion.div>

        {/* Profile Card with Smooth Entrance Animation */}
        <motion.section 
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.65, 
            ease: [0.16, 1, 0.3, 1],
            staggerChildren: 0.08
          }}
          className="bg-[#121212] rounded-3xl border border-[#D4A373]/25 p-6 md:p-8 shadow-[0_16px_50px_rgba(0,0,0,0.85)] relative overflow-hidden group"
        >
          {/* Subtle warm luxury backdrop radiance */}
          <motion.div 
            animate={{ 
              scale: [1, 1.12, 1],
              opacity: [0.06, 0.12, 0.06]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-28 -right-28 w-96 h-96 bg-gradient-to-br from-[#D4A373] to-[#E9C46A] rounded-full blur-[100px] pointer-events-none"
          />

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start relative z-10">
            
            {/* Animated Avatar with Smooth Pulse Rings */}
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center sm:items-start gap-4 shrink-0 mx-auto sm:mx-0"
            >
              <div className="relative">
                {/* Outer animated radar pulse ring 1 */}
                <motion.div
                  animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-[#E9C46A]/20 blur-[2px] pointer-events-none"
                />
                {/* Outer animated radar pulse ring 2 */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.15, 0.6] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-full border border-[#D4A373]/40 pointer-events-none"
                />

                {/* Main Avatar Surface in Dark Luxury Theme */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#1E1E1E] via-[#121212] to-[#050505] border-2 border-[#D4A373]/60 flex items-center justify-center text-[#E9C46A] shadow-2xl relative overflow-hidden">
                  <User className="w-12 h-12 text-[#FAF7F2]/95 drop-shadow" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-1.5 text-[9px] font-bold uppercase tracking-widest text-[#E9C46A] bg-[#050505]/80 px-2 py-0.5 rounded-full border border-[#D4A373]/30 shadow-sm">
                    OPERATOR
                  </div>
                </div>

                {/* Duty Radar Dot */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#121212] border-2 border-[#050505] flex items-center justify-center shadow-lg"
                >
                  <span className={cn("w-3.5 h-3.5 rounded-full", isOnDuty ? "bg-emerald-400 shadow-sm shadow-emerald-400/80" : "bg-amber-400")} />
                </motion.div>
              </div>

              <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4A373] bg-[#181818] border border-[#D4A373]/30 px-2.5 py-1 rounded-lg shadow-sm">
                  Level 3 Dispatcher
                </span>
              </div>
            </motion.div>

            {/* Profile Info Details */}
            <div className="flex-1 w-full space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-[#FAF7F2] font-heading tracking-tight">{user.name}</h2>
                    <BadgeCheck className="w-5 h-5 text-[#E9C46A]" />
                  </div>
                  <p className="text-xs font-semibold text-[#D4A373] uppercase tracking-wider mt-0.5">
                    {t('profile.role', 'Role')}: {user.role} &bull; Guwahati Regional Fleet
                  </p>
                </div>

                {!isEditingProfile && (
                  <motion.button 
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setIsEditingProfile(true)} 
                    className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-[#E9C46A] bg-[#181818] border border-[#D4A373]/30 hover:border-[#E9C46A] hover:bg-[#1E1E1E] transition-all shadow-md"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Information
                  </motion.button>
                )}
              </div>

              {saveSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  Profile contact records synchronized with central dispatch.
                </motion.div>
              )}

              {/* Badges / Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-3 flex flex-col justify-between hover:border-[#D4A373]/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between text-zinc-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Safety Index</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black text-[#FAF7F2] font-mono">98.4<span className="text-xs text-zinc-500">/100</span></div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-3 flex flex-col justify-between hover:border-[#D4A373]/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between text-zinc-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Trips Completed</span>
                    <Truck className="w-3.5 h-3.5 text-[#E9C46A]" />
                  </div>
                  <div className="text-lg font-black text-[#FAF7F2] font-mono">148</div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25 }}
                  className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-3 flex flex-col justify-between hover:border-[#D4A373]/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between text-zinc-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">SLA On-Time</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-lg font-black text-[#FAF7F2] font-mono">99.1%</div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-3 flex flex-col justify-between hover:border-[#D4A373]/30 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between text-zinc-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Emergency Tier</span>
                    <Award className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <div className="text-lg font-black text-[#FAF7F2] font-mono">Tier-1 First</div>
                </motion.div>
              </div>

              {/* View/Edit Profile Mode */}
              <AnimatePresence mode="wait">
                {!isEditingProfile ? (
                  <motion.div 
                    key="view-profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className="flex items-center gap-3 p-3.5 bg-[#181818] rounded-2xl border border-[#2A2A2A] hover:border-[#D4A373]/30 transition-all shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-[#050505] border border-[#2A2A2A] flex items-center justify-center text-[#E9C46A] shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-[10px] text-[#D4A373] uppercase font-bold tracking-wider">{t('profile.contact', 'Official Email')}</p>
                        <p className="text-xs font-semibold text-[#FAF7F2] truncate mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3.5 bg-[#181818] rounded-2xl border border-[#2A2A2A] hover:border-[#D4A373]/30 transition-all shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-[#050505] border border-[#2A2A2A] flex items-center justify-center text-[#E9C46A] shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-[10px] text-[#D4A373] uppercase font-bold tracking-wider">Driver Contact Phone</p>
                        <p className="text-xs font-semibold text-[#FAF7F2] truncate mt-0.5">{profileForm.phone || user.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3.5 bg-rose-950/20 rounded-2xl border border-rose-500/25 sm:col-span-2 hover:border-rose-500/40 transition-all">
                      <div className="w-9 h-9 rounded-xl bg-rose-900/40 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0">
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                      </div>
                      <div className="overflow-hidden min-w-0">
                        <p className="text-[10px] text-rose-400 uppercase font-bold tracking-wider">SDRF Emergency Contact</p>
                        <p className="text-xs font-semibold text-[#FAF7F2] truncate mt-0.5">
                          {profileForm.emergencyContactName ? `${profileForm.emergencyContactName} (${profileForm.emergencyContactPhone})` : 'Not configured'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="edit-profile"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="p-4 bg-[#181818] rounded-2xl border border-[#D4A373]/30 space-y-4 shadow-inner"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Primary Phone</label>
                        <input 
                          type="tel" 
                          value={profileForm.phone} 
                          onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                          className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none"
                          placeholder="+91 98640 12345"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Emergency Contact Name</label>
                        <input 
                          type="text" 
                          value={profileForm.emergencyContactName} 
                          onChange={e => setProfileForm({...profileForm, emergencyContactName: e.target.value})}
                          className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none"
                          placeholder="Contact Name"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Emergency Contact Phone</label>
                        <input 
                          type="tel" 
                          value={profileForm.emergencyContactPhone} 
                          onChange={e => setProfileForm({...profileForm, emergencyContactPhone: e.target.value})}
                          className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none"
                          placeholder="+91 94350 12345"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#2A2A2A]">
                      <button 
                        type="button"
                        onClick={() => setIsEditingProfile(false)} 
                        className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAF7F2] hover:bg-[#121212] rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="button"
                        onClick={handleSaveProfile} 
                        className="px-4 py-2 text-xs font-bold text-[#18181B] bg-gradient-to-r from-[#D4A373] to-[#E9C46A] hover:brightness-105 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </motion.section>

        {/* Assigned Vehicle Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#121212] rounded-3xl border border-[#D4A373]/25 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.85)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#D4A373]/15 border border-[#D4A373]/30 flex items-center justify-center text-[#E9C46A]">
                <Truck className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-[#FAF7F2] font-heading">{t('profile.assigned_vehicle', 'Assigned Logistics Vehicle')}</h2>
            </div>
            {!isEditingVehicle && (
              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsEditingVehicle(true)} 
                className="flex items-center gap-1.5 text-xs font-bold text-[#E9C46A] bg-[#181818] border border-[#D4A373]/30 hover:border-[#E9C46A] px-3 py-1.5 rounded-xl transition-all shadow-md"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Unit
              </motion.button>
            )}
          </div>

          {vehicleSaveSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 mb-4">
              <Check className="w-4 h-4 text-emerald-400" />
              Vehicle specifications updated in fleet telemetry registry.
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isEditingVehicle ? (
              <motion.div 
                key="view-vehicle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#181818] rounded-2xl border border-[#2A2A2A] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-inner"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#050505] border border-[#D4A373]/30 rounded-2xl flex items-center justify-center text-[#E9C46A] shadow-inner shrink-0">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[#FAF7F2] text-base font-heading">
                        {vehicleForm.year} {vehicleForm.make} {vehicleForm.model}
                      </p>
                      <span className="px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase shadow-sm">
                        Active Unit
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{vehicleForm.color}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <span className="font-mono text-xs bg-[#050505] text-[#E9C46A] px-2.5 py-1 rounded-lg font-bold border border-[#D4A373]/40 tracking-wider shadow-sm">
                        {vehicleForm.licensePlate || 'AS-01-EV-4921'}
                      </span>
                      <span className="text-[11px] font-medium text-zinc-400 bg-[#121212] px-2.5 py-1 rounded-lg border border-[#2A2A2A] font-mono">
                        Reg: {vehicleForm.registrationNumber || 'NER-SDRF-2024-889'}
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-[#121212] px-2 py-1 rounded-lg border border-[#2A2A2A] flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-[#E9C46A]" /> All-Terrain 4WD
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#2A2A2A]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Telemetry Status</div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shadow-sm shadow-emerald-400/80" />
                    GPS / OBD-II Stream Online
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="edit-vehicle"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="p-4 bg-[#181818] rounded-2xl border border-[#D4A373]/30 space-y-4 shadow-inner"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Manufacturer / Make</label>
                    <input 
                      type="text" 
                      value={vehicleForm.make} 
                      onChange={e => setVehicleForm({...vehicleForm, make: e.target.value})}
                      className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none"
                      placeholder="Tata Motors / Mahindra"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Model</label>
                    <input 
                      type="text" 
                      value={vehicleForm.model} 
                      onChange={e => setVehicleForm({...vehicleForm, model: e.target.value})}
                      className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none"
                      placeholder="Yodha 4x4 / Bolero Maxx"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Year</label>
                    <input 
                      type="text" 
                      value={vehicleForm.year} 
                      onChange={e => setVehicleForm({...vehicleForm, year: e.target.value})}
                      className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none"
                      placeholder="2024"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Color / Camo</label>
                    <input 
                      type="text" 
                      value={vehicleForm.color} 
                      onChange={e => setVehicleForm({...vehicleForm, color: e.target.value})}
                      className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none"
                      placeholder="Tactical Sand"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">License Plate</label>
                    <input 
                      type="text" 
                      value={vehicleForm.licensePlate} 
                      onChange={e => setVehicleForm({...vehicleForm, licensePlate: e.target.value})}
                      className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none font-mono"
                      placeholder="AS-01-EV-4921"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider">Registration Number</label>
                    <input 
                      type="text" 
                      value={vehicleForm.registrationNumber} 
                      onChange={e => setVehicleForm({...vehicleForm, registrationNumber: e.target.value})}
                      className="w-full p-2.5 border border-[#2A2A2A] rounded-xl bg-[#050505] text-[#FAF7F2] text-xs font-medium focus:ring-2 focus:ring-[#E9C46A]/40 outline-none font-mono"
                      placeholder="NER-SDRF-2024-889"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#2A2A2A]">
                  <button 
                    type="button"
                    onClick={() => setIsEditingVehicle(false)} 
                    className="px-3.5 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAF7F2] hover:bg-[#121212] rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={handleSaveVehicle} 
                    className="px-4 py-2 text-xs font-bold text-[#18181B] bg-gradient-to-r from-[#D4A373] to-[#E9C46A] hover:brightness-105 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Vehicle
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Tactical System Settings */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#121212] rounded-3xl border border-[#D4A373]/25 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.85)]"
        >
          <div className="p-6 border-b border-[#2A2A2A] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4A373]/15 border border-[#D4A373]/30 flex items-center justify-center text-[#E9C46A]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAF7F2] font-heading">{t('settings.title', 'Application & Dispatch Preferences')}</h2>
              <p className="text-xs text-zinc-400">Configure localization, audio beacon alarms, and offline buffer synchronization.</p>
            </div>
          </div>

          <div className="divide-y divide-[#2A2A2A]">
            {/* Language Selector */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#181818]/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#050505] border border-[#2A2A2A] flex items-center justify-center text-[#E9C46A] shrink-0 shadow-inner">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#FAF7F2]">{t('settings.language', 'Operational Language')}</h3>
                  <p className="text-xs text-zinc-400">{t('settings.language_desc', 'Select dialect for route cues & voice instructions')}</p>
                </div>
              </div>

              <div className="flex gap-1.5 bg-[#050505] p-1.5 rounded-2xl border border-[#2A2A2A] shadow-inner">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'as', label: 'অসমীয়া' }
                ].map(item => (
                  <button 
                    key={item.code}
                    onClick={() => changeLanguage(item.code)}
                    className={cn(
                      "px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all focus:outline-none",
                      i18n.language === item.code 
                        ? "bg-[#D4A373] text-[#18181B] shadow-md shadow-[#D4A373]/20" 
                        : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-[#181818]"
                    )}
                    aria-pressed={i18n.language === item.code}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Alerts & Beacons */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#181818]/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#050505] border border-[#2A2A2A] flex items-center justify-center text-[#E9C46A] shrink-0 shadow-inner">
                  <Volume2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#FAF7F2]">Siren & Hazard Voice Audio</h3>
                  <p className="text-xs text-zinc-400">Play acoustic alert sirens when entering critical risk zones or receiving high-priority SOS</p>
                </div>
              </div>

              <button 
                onClick={() => setSoundAlerts(!soundAlerts)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border shadow-inner",
                  soundAlerts ? "bg-[#D4A373] border-[#E9C46A]" : "bg-[#050505] border-[#2A2A2A]"
                )}
                aria-pressed={soundAlerts}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-[#18181B] transition-transform shadow-md",
                    soundAlerts ? "translate-x-6 bg-[#18181B]" : "translate-x-1 bg-zinc-400"
                  )}
                />
              </button>
            </div>

            {/* Dark Theme / Tactical Black */}
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#181818]/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#050505] border border-[#2A2A2A] flex items-center justify-center text-[#E9C46A] shrink-0 shadow-inner">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#FAF7F2]">Night Vision / Black Mode</h3>
                  <p className="text-xs text-zinc-400">High-contrast ultra-dark palette for low-light night driving on mountain corridors</p>
                </div>
              </div>

              <button 
                onClick={toggleTheme}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border shadow-inner",
                  theme === 'dark' ? "bg-[#D4A373] border-[#E9C46A]" : "bg-[#050505] border-[#2A2A2A]"
                )}
                aria-pressed={theme === 'dark'}
              >
                <span
                  className={cn(
                    "inline-block h-4 w-4 transform rounded-full transition-transform shadow-md",
                    theme === 'dark' ? "translate-x-6 bg-[#18181B]" : "translate-x-1 bg-zinc-400"
                  )}
                />
              </button>
            </div>

            {/* Offline Storage Buffer */}
            <div className="p-5 space-y-3 bg-[#050505]/60">
              <div className="mb-2">
                <h3 className="font-bold text-sm text-[#FAF7F2]">{t('settings.offline_storage', 'Offline Telemetry Buffer & Vault')}</h3>
                <p className="text-xs text-zinc-400">{t('settings.offline_storage_desc', 'Automatic fallback when driving through Assam hill gaps and low-cellular riverbeds.')}</p>
              </div>
              <OfflineQueueManager />
            </div>

          </div>
        </motion.section>

      </div>
    </div>
  );
}
