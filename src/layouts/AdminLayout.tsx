import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, LayoutDashboard, Map, Settings, Users, LogOut, FileText, Bell, ShieldAlert, X, Radio, Activity } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useReportStore } from '../store/useReportStore';
import { useNotificationStore } from '../store/useNotificationStore';
import NotificationCenter from '../components/dashboard/NotificationCenter';
import IncomingSOSAlertBanner from '../components/emergency/IncomingSOSAlertBanner';
import SOSEscalatedBanner from '../components/emergency/SOSEscalatedBanner';
import { cn } from '../lib/utils';
import { EmergencyReport } from '../types';

export default function AdminLayout() {
  const { user, logout } = useAppStore();
  const { emergencyReports, updateEmergencyStatus, escalateEmergency } = useReportStore();
  const { unreadCount } = useNotificationStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeToast, setActiveToast] = useState<EmergencyReport | null>(null);
  const [escalationToast, setEscalationToast] = useState<EmergencyReport | null>(null);
  const [dismissedIncomingIds, setDismissedIncomingIds] = useState<string[]>([]);
  const [dismissedEscalatedIds, setDismissedEscalatedIds] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Monitor incoming new SOS signals
  useEffect(() => {
    const unhandledNew = emergencyReports.filter(
      r => r.status === 'New' && !dismissedIncomingIds.includes(r.id)
    );

    if (unhandledNew.length > 0) {
      const latest = unhandledNew[0];
      setActiveToast(prev => (prev?.id === latest.id ? prev : latest));
    } else {
      setActiveToast(prev => (prev !== null ? null : prev));
    }
  }, [emergencyReports, dismissedIncomingIds]);

  // Monitor SLA breach & escalation lifecycle (checks every 5 seconds)
  useEffect(() => {
    const checkEscalations = () => {
      const now = Date.now();
      
      // 1. Check for explicitly escalated reports not yet dismissed
      const explicitEscalated = emergencyReports.find(
        r => (r.status === 'Escalated' || r.isEscalated) && 
             r.status !== 'Resolved' &&
             !dismissedEscalatedIds.includes(r.id)
      );

      if (explicitEscalated) {
        setEscalationToast(prev => (prev?.id === explicitEscalated.id ? prev : explicitEscalated));
        return;
      }

      // 2. Check for alerts unacknowledged for > 3 minutes (180s)
      const overdueAlert = emergencyReports.find(
        r => r.status === 'New' && 
             now - r.timestamp > 3 * 60 * 1000 &&
             !dismissedEscalatedIds.includes(r.id)
      );

      if (overdueAlert) {
        escalateEmergency(
          overdueAlert.id, 
          'SLA Threshold Exceeded (180s without operator acknowledgement). Level-2 District Command notified.'
        );
        setEscalationToast(prev => (prev?.id === overdueAlert.id ? prev : overdueAlert));
      }
    };

    checkEscalations();
    const interval = setInterval(checkEscalations, 5000);
    return () => clearInterval(interval);
  }, [emergencyReports, dismissedEscalatedIds, escalateEmergency]);

  const handleAcknowledge = (id: string) => {
    setDismissedIncomingIds(prev => [...prev, id]);
    setDismissedEscalatedIds(prev => [...prev, id]);
    setActiveToast(null);
    setEscalationToast(null);
    updateEmergencyStatus(id, 'Acknowledged', user?.id || 'admin');
    navigate('/admin/sos');
  };

  const handleDismissIncoming = (id: string) => {
    setDismissedIncomingIds(prev => [...prev, id]);
    setActiveToast(null);
  };

  const handleDismissEscalated = (id: string) => {
    setDismissedEscalatedIds(prev => [...prev, id]);
    setEscalationToast(null);
  };

  if (!user) return null;

  const activeEmergenciesCount = emergencyReports.filter(r => r.status !== 'Resolved').length;
  const escalatedCount = emergencyReports.filter(r => r.status === 'Escalated' || r.isEscalated).length;

  return (
    <div className="flex h-screen w-full bg-[#18181B] text-[#FAF7F2] overflow-hidden relative font-sans">
      {/* Ambient Background for Soft Luxury Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[45%] h-[45%] rounded-full bg-[#D4A373]/10 blur-[140px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#E9C46A]/8 blur-[160px]" />
        <div className="absolute top-[30%] right-[15%] w-[35%] h-[35%] rounded-full bg-[#27272A]/60 blur-[120px]" />
      </div>

      {/* Floating Tactical SOS Notification Stack (Top-Right) */}
      <div className="fixed top-5 right-5 z-[90] flex flex-col gap-3 pointer-events-none max-w-md w-full px-2 sm:px-0">
        {/* Incoming SOS Banner */}
        {activeToast && (
          <IncomingSOSAlertBanner
            alert={activeToast}
            onAcknowledge={handleAcknowledge}
            onDismiss={handleDismissIncoming}
          />
        )}

        {/* SOS Escalated Banner */}
        {escalationToast && (
          <SOSEscalatedBanner
            alert={escalationToast}
            onTakeCommand={handleAcknowledge}
            onDismiss={handleDismissEscalated}
          />
        )}
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-[#27272A]/85 backdrop-blur-xl border-r border-[#D4A373]/15 text-[#FAF7F2]/80 flex flex-col shrink-0 z-20 shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#E9C46A] flex items-center justify-center shadow-md shadow-[#D4A373]/20">
              <Shield className="w-5 h-5 text-[#18181B]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-[#FAF7F2] tracking-tight block leading-tight">NER COMMAND</span>
              <span className="text-[10px] font-semibold text-[#D4A373] tracking-widest uppercase block">Logistics Intelligence</span>
            </div>
          </div>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9C46A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E9C46A]"></span>
          </span>
        </div>
        
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] uppercase text-[#D4A373]/70 font-extrabold tracking-widest px-3 mb-2.5 mt-2">Operations Center</div>
          
          <NavLink 
            to="/admin" 
            end
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-gradient-to-r from-[#D4A373]/20 to-[#E9C46A]/10 text-[#FAF7F2] border-l-2 border-[#D4A373] font-semibold shadow-sm" 
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/60"
            )}
          >
            <LayoutDashboard className="w-4 h-4 text-[#D4A373]" />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/admin/map" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-gradient-to-r from-[#D4A373]/20 to-[#E9C46A]/10 text-[#FAF7F2] border-l-2 border-[#D4A373] font-semibold shadow-sm" 
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/60"
            )}
          >
            <Map className="w-4 h-4 text-[#D4A373]" />
            <span>Command Map</span>
          </NavLink>

          <NavLink 
            to="/admin/incidents" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-gradient-to-r from-[#D4A373]/20 to-[#E9C46A]/10 text-[#FAF7F2] border-l-2 border-[#D4A373] font-semibold shadow-sm" 
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/60"
            )}
          >
            <FileText className="w-4 h-4 text-[#D4A373]" />
            <span>Incidents</span>
          </NavLink>

          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-gradient-to-r from-[#D4A373]/20 to-[#E9C46A]/10 text-[#FAF7F2] border-l-2 border-[#D4A373] font-semibold shadow-sm" 
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/60"
            )}
          >
            <Users className="w-4 h-4 text-[#D4A373]" />
            <span>Personnel</span>
          </NavLink>

          <NavLink 
            to="/admin/sos" 
            className={({ isActive }) => cn(
              "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all relative overflow-hidden",
              isActive 
                ? "bg-red-500/20 text-red-300 border-l-2 border-red-500 shadow-sm" 
                : activeEmergenciesCount > 0 
                  ? "bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/30" 
                  : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/60"
            )}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className={cn("w-4 h-4", activeEmergenciesCount > 0 && "animate-pulse text-red-400")} />
              <span>SOS Alerts</span>
            </div>
            {activeEmergenciesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-red-600 text-white shadow-sm animate-pulse">
                {activeEmergenciesCount}
              </span>
            )}
          </NavLink>

        </nav>
        
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3 mb-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#323236] border border-[#D4A373]/30 flex items-center justify-center text-[#E9C46A] font-bold text-sm shadow-sm">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#FAF7F2] truncate">{user.name}</p>
              <p className="text-[10px] text-[#D4A373] capitalize truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/60 py-1.5 px-3 rounded-lg transition-colors w-full border border-zinc-700/40 font-medium"
          >
            <LogOut className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#27272A]/75 backdrop-blur-md border-b border-[#D4A373]/15 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <h1 className="font-heading font-bold text-base md:text-lg text-[#FAF7F2] tracking-tight">
              Operations Command Center
            </h1>
            
            {/* Live Operational Status Pills */}
            <div className="hidden sm:flex items-center gap-2">
              {activeEmergenciesCount > 0 ? (
                <button 
                  onClick={() => navigate('/admin/sos')}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold hover:bg-red-500/25 transition-colors cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span>{activeEmergenciesCount} Active Emergency Signal{activeEmergenciesCount > 1 ? 's' : ''}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E9C46A]/10 border border-[#E9C46A]/30 text-[#E9C46A] text-xs font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E9C46A]"></span>
                  <span>All Corridors Nominal</span>
                </div>
              )}

              {escalatedCount > 0 && (
                <button 
                  onClick={() => navigate('/admin/sos')}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-colors"
                >
                  <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                  <span>{escalatedCount} Escalated (Level 2)</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/70 rounded-xl transition-all border border-zinc-700/40"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-[#D4A373]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E9C46A] rounded-full ring-2 ring-[#18181B] animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-auto bg-transparent p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
}
