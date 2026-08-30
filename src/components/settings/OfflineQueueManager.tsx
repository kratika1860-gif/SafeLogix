import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore';
import { useReportStore } from '../../store/useReportStore';
import { Wifi, WifiOff, Cloud, Database, HardDrive, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function OfflineQueueManager() {
  const { t } = useTranslation();
  const { locationQueue } = useAppStore();
  const { fieldReports, emergencyReports } = useReportStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'synced' | 'failed'>('pending');

  const pendingLocations = locationQueue.filter(q => !q.synced);
  const syncedLocations = locationQueue.filter(q => q.synced);

  const pendingField = fieldReports.filter(r => !r.synced);
  const syncedField = fieldReports.filter(r => r.synced);

  const pendingEmergency = emergencyReports.filter(r => !r.synced);
  const syncedEmergency = emergencyReports.filter(r => r.synced);

  const getItemsByTab = () => {
    switch (activeTab) {
      case 'pending':
        return [
          { type: 'gps', label: t('offline_queue.gps_points'), count: pendingLocations.length, icon: <WifiOff className="w-5 h-5 text-amber-500" /> },
          { type: 'incident', label: t('offline_queue.incident_reports'), count: pendingField.length, icon: <Database className="w-5 h-5 text-amber-500" /> },
          { type: 'emergency', label: t('offline_queue.emergency_reports'), count: pendingEmergency.length, icon: <AlertCircle className="w-5 h-5 text-amber-500" /> }
        ].filter(i => i.count > 0);
      case 'synced':
        return [
          { type: 'gps', label: t('offline_queue.gps_points'), count: syncedLocations.length, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
          { type: 'incident', label: t('offline_queue.incident_reports'), count: syncedField.length, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
          { type: 'emergency', label: t('offline_queue.emergency_reports'), count: syncedEmergency.length, icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> }
        ].filter(i => i.count > 0);
      case 'failed':
        return []; // In a real app we'd track failed attempts separately
    }
  };

  const items = getItemsByTab();

  return (
    <div className="bg-[#121212] rounded-2xl border border-amber-500/20 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-zinc-800/80 flex justify-between items-center bg-[#050505]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#E9C46A]">
            <HardDrive className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-sm text-[#FAF7F2] font-heading">{t('offline_queue.title')}</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-300 bg-[#181818] px-3 py-1.5 rounded-xl border border-zinc-800 shadow-inner">
          <Cloud className="w-3.5 h-3.5 text-[#E9C46A]" />
          <span className="font-bold text-[11px]">{navigator.onLine ? 'Vault Synced (Online)' : 'Local Buffer (Offline)'}</span>
        </div>
      </div>

      <div className="flex border-b border-zinc-800/80 bg-[#0A0A0A]">
        <button 
          onClick={() => setActiveTab('pending')}
          className={cn("flex-1 py-3 text-xs font-bold border-b-2 transition-all focus:outline-none", activeTab === 'pending' ? "border-[#E9C46A] text-[#E9C46A] bg-amber-500/10" : "border-transparent text-zinc-400 hover:text-[#FAF7F2]")}
          aria-label={t('offline_queue.pending')}
        >
          {t('offline_queue.pending')}
        </button>
        <button 
          onClick={() => setActiveTab('synced')}
          className={cn("flex-1 py-3 text-xs font-bold border-b-2 transition-all focus:outline-none", activeTab === 'synced' ? "border-[#E9C46A] text-[#E9C46A] bg-amber-500/10" : "border-transparent text-zinc-400 hover:text-[#FAF7F2]")}
          aria-label={t('offline_queue.synced')}
        >
          {t('offline_queue.synced')}
        </button>
        <button 
          onClick={() => setActiveTab('failed')}
          className={cn("flex-1 py-3 text-xs font-bold border-b-2 transition-all focus:outline-none", activeTab === 'failed' ? "border-rose-500 text-rose-400 bg-rose-500/10" : "border-transparent text-zinc-400 hover:text-[#FAF7F2]")}
          aria-label={t('offline_queue.failed')}
        >
          {t('offline_queue.failed')}
        </button>
      </div>

      <div className="p-4 bg-transparent min-h-[160px]">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-8">
            <div className="w-12 h-12 rounded-full bg-[#050505] border border-amber-500/20 flex items-center justify-center mb-2.5 shadow-inner">
              <CheckCircle2 className="w-6 h-6 text-[#E9C46A]" />
            </div>
            <p className="text-xs font-medium text-center text-zinc-400">{activeTab === 'pending' ? t('offline_queue.no_pending') : `No ${activeTab} items in buffer.`}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/80 bg-[#181818] hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-[#050505] p-2 rounded-lg border border-amber-500/20 text-[#E9C46A]">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#FAF7F2]">{item.label}</h3>
                    <p className="text-[11px] text-zinc-400">
                      {activeTab === 'pending' ? t('offline_queue.pending') : t('offline_queue.synced')} • {item.count} telemetry records
                    </p>
                  </div>
                </div>
                {activeTab === 'pending' && (
                  <button className="text-[#E9C46A] hover:text-[#D4A373] p-1.5 hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-amber-500/30" aria-label="Sync now">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
