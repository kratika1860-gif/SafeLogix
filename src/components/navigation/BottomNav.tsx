import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, AlertTriangle, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  onEmergencyClick: () => void;
}

export default function BottomNav({ onEmergencyClick }: BottomNavProps) {
  const { t } = useTranslation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#121212]/95 backdrop-blur-2xl border-t border-amber-500/20 flex justify-around items-center px-4 pb-safe pt-1.5 h-16 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.8)]">
      <NavLink 
        to="/driver" 
        end 
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all", 
          isActive ? "text-[#E9C46A] bg-amber-500/15 font-bold shadow-sm" : "text-zinc-400 hover:text-[#FAF7F2]"
        )}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t('app.home', 'Home')}</span>
      </NavLink>
      
      <div className="relative -top-4 px-2">
        <button 
          onClick={onEmergencyClick}
          className="w-14 h-14 bg-gradient-to-tr from-red-600 to-rose-500 rounded-full border-4 border-[#050505] flex items-center justify-center text-white shadow-xl shadow-red-950/80 active:scale-95 transition-transform focus:outline-none focus:ring-4 focus:ring-red-500/40"
          aria-label="Emergency"
        >
          <AlertTriangle className="w-6 h-6 animate-pulse" />
        </button>
      </div>

      <NavLink 
        to="/driver/profile" 
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all", 
          isActive ? "text-[#E9C46A] bg-amber-500/15 font-bold shadow-sm" : "text-zinc-400 hover:text-[#FAF7F2]"
        )}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t('app.profile', 'Profile')}</span>
      </NavLink>
    </nav>
  );
}
