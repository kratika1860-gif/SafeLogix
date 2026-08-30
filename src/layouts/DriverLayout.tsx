import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { Menu, Bell, User as UserIcon, Shield, LogOut, Home, Navigation, AlertTriangle, MapPin, Settings } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import EmergencyModal from '../components/reporting/EmergencyModal';
import BottomNav from '../components/navigation/BottomNav';
import NotificationCenter from '../components/dashboard/NotificationCenter';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';

export default function DriverLayout() {
  const { user, logout, activeTrip } = useAppStore();
  const { unreadCount } = useNotificationStore();
  const [showEmergency, setShowEmergency] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useTranslation();

  if (!user) {
    return <div className="p-8 text-center font-bold text-red-500">{t('app.access_denied')}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#050505] overflow-hidden text-[#FAF7F2] relative font-sans">
      {/* Ambient Background for Soft Luxury Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[150px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-amber-400/5 blur-[160px]" />
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#121212] backdrop-blur-xl border-r border-amber-500/15 text-[#FAF7F2]/80 z-20 shadow-2xl">
        <div className="p-5 flex items-center gap-3 border-b border-zinc-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <span className="font-heading font-extrabold text-base text-[#FAF7F2] tracking-tight block leading-tight">{t('app.title')}</span>
            <span className="text-[10px] font-semibold text-[#E9C46A] tracking-widest uppercase block">Tactical Copilot</span>
          </div>
        </div>
        
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] uppercase text-[#E9C46A]/80 font-extrabold tracking-widest px-3 mb-2.5 mt-2">{t('app.driver_portal')}</div>
          
          <NavLink 
            to="/driver" 
            end
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-[#FAF7F2] border-l-2 border-[#E9C46A] font-semibold shadow-sm" 
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
            )}
          >
            <Home className="w-4 h-4 text-[#E9C46A]" />
            <span>{t('app.dashboard')}</span>
          </NavLink>
          
          <NavLink 
            to="/driver/profile" 
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive 
                ? "bg-gradient-to-r from-amber-500/20 to-amber-400/10 text-[#FAF7F2] border-l-2 border-[#E9C46A] font-semibold shadow-sm" 
                : "text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/40"
            )}
          >
            <Settings className="w-4 h-4 text-[#E9C46A]" />
            <span>{t('app.profile')} & {t('app.settings')}</span>
          </NavLink>
        </nav>

        <div className="p-4 border-t border-zinc-800/80 bg-[#0A0A0A]">
          <div className="flex items-center gap-3 mb-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#181818] border border-amber-500/30 flex items-center justify-center text-[#E9C46A] font-bold text-sm shadow-sm">
              <UserIcon className="w-4 h-4 text-[#E9C46A]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#FAF7F2] truncate">{user.name}</p>
              <p className="text-[10px] text-[#E9C46A] capitalize truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center justify-center gap-2 text-xs text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/60 py-1.5 px-3 rounded-lg transition-colors w-full border border-zinc-700/40 font-medium"
          >
            <LogOut className="w-3.5 h-3.5 text-[#E9C46A]" />
            <span>{t('app.sign_out')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0 z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#121212] backdrop-blur-md border-b border-amber-500/15 shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <span className="font-heading font-bold text-sm text-[#FAF7F2]">{t('app.title')}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setShowNotifications(true)}
              className="text-zinc-400 hover:text-[#FAF7F2] relative p-1.5 rounded-lg border border-zinc-700/40 bg-[#181818]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#E9C46A]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#E9C46A] rounded-full ring-1 ring-black animate-pulse"></span>
              )}
            </button>
            <button 
              onClick={logout} 
              className="text-zinc-400 hover:text-[#FAF7F2] p-1.5 rounded-lg border border-zinc-700/40 bg-[#181818]" 
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4 text-[#E9C46A]" />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-end p-4 bg-[#121212]/90 backdrop-blur-md border-b border-amber-500/15 shrink-0 z-10 shadow-sm relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-800/70 rounded-xl transition-all border border-zinc-700/40 bg-[#181818]"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-[#E9C46A]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E9C46A] rounded-full ring-2 ring-black animate-pulse"></span>
              )}
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 relative overflow-hidden flex flex-col h-full">
          <Outlet context={{ setShowNotifications }} />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onEmergencyClick={() => setShowEmergency(true)} />

      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)} />}
      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}
