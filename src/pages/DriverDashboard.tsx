import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { useReportStore } from '../store/useReportStore';
import { useGeolocation } from '../hooks/useGeolocation';
import GISMap from '../components/map/GISMap';
import RoutePanel from '../components/map/RoutePanel';
import StartTripModal from '../components/trip/StartTripModal';
import ActiveTripPanel from '../components/trip/ActiveTripPanel';
import ReportIncidentModal from '../components/reporting/ReportIncidentModal';
import EmergencyModal from '../components/reporting/EmergencyModal';
import DriverAnalyticsHome from '../components/dashboard/DriverAnalyticsHome';
import { ShieldAlert, Navigation, RefreshCcw, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { useOutletContext } from 'react-router-dom';

export default function DriverDashboard() {
  const { t } = useTranslation();
  const { user, isOnDuty, toggleDuty, activeTrip, fetchAssignedTrip, locationQueue } = useAppStore();
  const { fieldReports, emergencyReports } = useReportStore();
  
  const unsyncedCount = locationQueue.filter(q => !q.synced).length + fieldReports.filter(r => !r.synced).length + emergencyReports.filter(r => !r.synced).length;
  
  const [showIncidentReport, setShowIncidentReport] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const isTrackingActive = activeTrip?.status === 'started' || activeTrip?.status === 'in_transit' || activeTrip?.status === 'emergency';
  
  const { error: gpsError, permission: gpsPermission } = useGeolocation(isTrackingActive);

  const { setShowNotifications } = useOutletContext<{ setShowNotifications: (v: boolean) => void }>() || { setShowNotifications: () => {} };

  useEffect(() => {
    if (activeTrip && (activeTrip.status === 'completed' || activeTrip.status === 'cancelled')) {
      useAppStore.getState().setActiveTrip(null);
    }
  }, []);

  useEffect(() => {
    if (isOnDuty && !activeTrip) {
      const timer = setTimeout(() => {
        fetchAssignedTrip();
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [isOnDuty, activeTrip, fetchAssignedTrip]);

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Status Bar */}
      <div className="bg-[#27272A]/85 backdrop-blur-md border-b border-[#D4A373]/15 p-4 shrink-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#FAF7F2] font-heading">{t('app.welcome')}, {user?.name}</h1>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                {isOnDuty && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isOnDuty ? "bg-emerald-500" : "bg-zinc-500")} />
              </span>
              <span className={cn("text-xs font-semibold uppercase tracking-wider", isOnDuty ? "text-emerald-400" : "text-zinc-400")}>
                {isOnDuty ? t('app.on_duty') : t('app.off_duty')}
              </span>
            </div>
            
            {activeTrip && (
              <>
                <span className="text-zinc-700">|</span>
                <span className="text-xs font-bold text-[#E9C46A] flex items-center gap-1 uppercase tracking-wider">
                  <Navigation className="w-3.5 h-3.5" />
                  {activeTrip.status.replace('_', ' ')}
                </span>
              </>
            )}

            {unsyncedCount > 0 && (
              <>
                <span className="text-zinc-700">|</span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1" aria-label="Offline sync items pending">
                  <WifiOff className="w-3.5 h-3.5" />
                  {t('app.offline_sync')} ({unsyncedCount})
                </span>
              </>
            )}

            {gpsError && (
              <>
                <span className="text-zinc-700">|</span>
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {t('app.gps_issue')}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2.5">
          {!activeTrip && (
            <button 
              onClick={toggleDuty}
              className={cn(
                "px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 focus:outline-none focus:ring-2 active:scale-95 shadow-md",
                isOnDuty 
                  ? "bg-[#18181B]/90 text-amber-300 border border-[#D4A373]/30 hover:bg-zinc-800 hover:border-[#D4A373]/50 focus:ring-[#D4A373]/40" 
                  : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-emerald-950/60 focus:ring-emerald-500"
              )}
            >
              <Navigation className="w-4 h-4" />
              {isOnDuty ? t('app.go_off_duty') : t('app.go_on_duty')}
            </button>
          )}
          
          <button 
            onClick={() => setShowIncidentReport(true)} 
            className="px-4 py-2 bg-[#E9C46A]/15 text-[#E9C46A] border border-[#E9C46A]/35 hover:bg-[#E9C46A]/25 hover:border-[#E9C46A]/60 rounded-xl font-semibold text-sm transition-all hidden md:flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#E9C46A]/40 shadow-sm active:scale-95"
          >
            <ShieldAlert className="w-4 h-4 text-[#E9C46A]" /> {t('app.report_incident')}
          </button>
          <button 
            onClick={() => setShowEmergency(true)} 
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border border-rose-400/30 rounded-xl font-bold text-sm transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg shadow-rose-950/50 active:scale-95 animate-pulse"
          >
            <ShieldAlert className="w-4 h-4" />
            <span className="hidden sm:inline">{t('app.emergency_action')}</span>
            <span className="sm:hidden">{t('app.emergency')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-transparent overflow-hidden">
        {!activeTrip ? (
           <>
              <DriverAnalyticsHome 
                onStartTrip={toggleDuty} 
                onOpenNotifications={() => setShowNotifications(true)}
              />
              
              {isOnDuty && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                     <RefreshCcw className="w-8 h-8 text-blue-600 animate-spin" />
                     <span className="font-bold text-slate-800 dark:text-slate-100">Checking for dispatch...</span>
                  </div>
                </div>
              )}
           </>
        ) : (
          <>
            <GISMap />

            {activeTrip.status === 'assigned' || activeTrip.status === 'accepted' ? (
                <RoutePanel />
              ) : activeTrip.status === 'completed' || activeTrip.status === 'cancelled' ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                  <div className="bg-[#27272A]/95 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border border-[#D4A373]/25 w-[90%] max-w-sm text-center animate-in fade-in zoom-in-95 duration-150">
                    <h3 className="text-xl font-bold text-[#FAF7F2] font-heading">
                      {activeTrip.status === 'completed' ? 'Trip Completed! 🎉' : 'Trip Cancelled'}
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      {activeTrip.status === 'completed' 
                        ? 'Trip has been successfully recorded. What would you like to do next?' 
                        : 'Trip assignment was cancelled. What would you like to do next?'}
                    </p>
                    <div className="flex w-full gap-3 mt-2">
                      <button 
                        id="btn-find-next-trip"
                        onClick={async () => {
                          const store = useAppStore.getState();
                          store.setActiveTrip(null);
                          await store.setDuty(true);
                          store.fetchAssignedTrip();
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-[#D4A373] to-[#E9C46A] text-[#18181B] rounded-xl font-bold hover:brightness-105 transition-all shadow-md shadow-[#D4A373]/20 active:scale-95 cursor-pointer"
                      >
                        Find Next
                      </button>
                      <button 
                        id="btn-off-duty-modal"
                        onClick={async () => {
                          const store = useAppStore.getState();
                          store.setActiveTrip(null);
                          await store.setDuty(false);
                        }}
                        className="flex-1 py-3 bg-[#18181B]/80 text-zinc-300 rounded-xl font-bold hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-700/60 active:scale-95 cursor-pointer"
                      >
                        Off Duty
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ActiveTripPanel />
              )}
           </>
        )}
                
        <StartTripModal />
        {showIncidentReport && <ReportIncidentModal onClose={() => setShowIncidentReport(false)} />}
        {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      </div>
    </div>
  );
}
