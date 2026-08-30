import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Activity, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(Date.now());

  useEffect(() => {
    // Check initial state
    setIsOnline(typeof window !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(Date.now());
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulated sync every 15s to update timestamp
    const interval = setInterval(() => {
      if (navigator.onLine) setLastSync(Date.now());
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const timeDiff = Math.floor((Date.now() - lastSync) / 1000);
  const isStale = isOnline && timeDiff > 60; // Mark stale if hasn't synced in 60s

  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md border transition-colors",
        !isOnline 
          ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800" 
          : isStale 
            ? "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800"
            : "bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
      )}>
        {!isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline (Cached)</span>
          </>
        ) : isStale ? (
          <>
            <Activity className="w-3.5 h-3.5 opacity-50" />
            <span>Stale Data</span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-green-500" />
            <span>Live Sync</span>
          </>
        )}
      </div>
    </div>
  );
}
