import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import BaseMap from '../../components/map/BaseMap';
import 'maplibre-gl/dist/maplibre-gl.css';

import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  PhoneCall, 
  CheckCircle, 
  Navigation, 
  History, 
  User,
  Truck,
  Phone,
  Flame,
  Radio,
  Send,
  AlertOctagon,
  Copy,
  Check,
  Building2,
  Volume2,
  VolumeX,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Package,
  Activity,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';
import { useReportStore } from '../../store/useReportStore';
import { EmergencyReport, EmergencyCategory, EmergencyStatus } from '../../types';
import EmergencyDispatchModal from '../../components/emergency/EmergencyDispatchModal';
import { getEmergencyIcon, getEmergencyColor } from '../../components/emergency/IncomingSOSAlertBanner';
import { isAudioAlertEnabled, setAudioAlertEnabled, playIncomingSOSTone, playDispatchTone } from '../../lib/audioAlerts';

export default function SOSAlerts() {
  const mapRef = useRef<MapRef>(null);
  const [searchParams] = useSearchParams();
  const targetIdFromUrl = searchParams.get('id');
  
  const { theme, user } = useAppStore();
  const { 
    emergencyReports, 
    updateEmergencyStatus, 
    escalateEmergency, 
    dispatchEmergencyUnit, 
    resolveEmergency,
    simulateIncomingSOS,
    simulateEscalation
  } = useReportStore();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSOSId, setSelectedSOSId] = useState<string | null>(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isAudioAlertEnabled());
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'escalate' | 'dispatch' } | null>(null);

  // Set initial selected SOS or update if query param arrives
  useEffect(() => {
    if (targetIdFromUrl) {
      setSelectedSOSId(targetIdFromUrl);
      const target = emergencyReports.find(r => r.id === targetIdFromUrl);
      if (target && mapRef.current) {
        mapRef.current.flyTo({ center: [target.location[0], target.location[1]], zoom: 14.5, duration: 1500 });
      }
    } else if (!selectedSOSId && emergencyReports.length > 0) {
      // Pick first active
      const active = emergencyReports.find(r => r.status !== 'Resolved') || emergencyReports[0];
      setSelectedSOSId(active.id);
    }
  }, [targetIdFromUrl, emergencyReports]);

  // Selected emergency record
  const selectedSOS = emergencyReports.find(r => r.id === selectedSOSId) || null;

  // Filtered reports
  const filteredAlerts = emergencyReports.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return r.status !== 'Resolved';
    if (filterStatus === 'new') return r.status === 'New';
    if (filterStatus === 'escalated') return r.status === 'Escalated' || r.isEscalated;
    if (filterStatus === 'dispatched') return r.status === 'Dispatched';
    if (filterStatus === 'resolved') return r.status === 'Resolved';
    return true;
  });

  const activeCount = emergencyReports.filter(r => r.status !== 'Resolved').length;
  const escalatedCount = emergencyReports.filter(r => r.status === 'Escalated' || r.isEscalated).length;
  const dispatchedCount = emergencyReports.filter(r => r.status === 'Dispatched').length;

  const showNotificationToast = (text: string, type: 'success' | 'escalate' | 'dispatch' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectSOS = (alert: EmergencyReport) => {
    setSelectedSOSId(alert.id);
    if (mapRef.current) {
      mapRef.current.flyTo({ 
        center: [alert.location[0], alert.location[1]], 
        zoom: 15,
        duration: 1200
      });
    }
  };

  const handleAcknowledge = (alert: EmergencyReport) => {
    updateEmergencyStatus(alert.id, 'Acknowledged', user?.id || 'admin');
    showNotificationToast(`SOS #${alert.id} acknowledged. Operations Command engaged.`, 'success');
  };

  const handleManualEscalate = (alert: EmergencyReport) => {
    escalateEmergency(
      alert.id, 
      'Manual Level-2 Escalation triggered by Operations Admin. SDRF & DDMA notified.',
      user?.id || 'admin'
    );
    showNotificationToast(`Alert #${alert.id} Escalated to Level-2 SDRF Command!`, 'escalate');
  };

  const handleOpenDispatch = () => {
    if (!selectedSOS) return;
    setDispatchModalOpen(true);
  };

  const handleConfirmDispatch = (unitName: string, notes: string) => {
    if (!selectedSOS) return;
    dispatchEmergencyUnit(selectedSOS.id, unitName, user?.id || 'admin', notes);
    showNotificationToast(`Dispatched ${unitName} to #${selectedSOS.id}!`, 'dispatch');
  };

  const handleResolve = (alert: EmergencyReport) => {
    resolveEmergency(
      alert.id, 
      'Incident successfully resolved, perimeter secured, and logistics cleared.',
      user?.id || 'admin'
    );
    showNotificationToast(`Incident #${alert.id} resolved and archived.`, 'success');
  };

  const handleCopyCoords = (alert: EmergencyReport) => {
    const coords = `${alert.location[1].toFixed(5)}, ${alert.location[0].toFixed(5)}`;
    navigator.clipboard.writeText(coords);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleSimulateNew = () => {
    const categories: EmergencyCategory[] = ['Accident', 'Medical Emergency', 'Landslide', 'Vehicle Failure', 'Security Threat'];
    const chosen = categories[Math.floor(Math.random() * categories.length)];
    const created = simulateIncomingSOS(chosen);
    setSelectedSOSId(created.id);
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [created.location[0], created.location[1]], zoom: 15, duration: 1200 });
    }
    showNotificationToast(`Simulated Live SOS: ${chosen} broadcasted!`, 'dispatch');
  };

  const handleSimulateEscalate = () => {
    const escalated = simulateEscalation(selectedSOSId || undefined);
    if (escalated) {
      showNotificationToast(`Simulated SLA Escalation on #${escalated.id}!`, 'escalate');
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setAudioAlertEnabled(next);
  };

  const formatElapsed = (timestamp: number) => {
    const secs = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    if (mins === 0) return `${remSecs}s ago`;
    if (mins < 60) return `${mins}m ${remSecs}s ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] w-full overflow-hidden relative">
      {/* Top Incident Control & Metrics Bar */}
      <div className="bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-4 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>SOS Incident Command Radar</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 uppercase tracking-wide">
                  Live Response
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Guwahati Metro & Northeast Logistics Corridors
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs">
            <div className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>Active: <strong className="text-white font-bold">{activeCount}</strong></span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Escalated: <strong className="text-amber-300 font-bold">{escalatedCount}</strong></span>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-medium">
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>Dispatched: <strong className="text-blue-300 font-bold">{dispatchedCount}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Operations Tooling */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSound}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
              soundEnabled 
                ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700" 
                : "bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20"
            )}
            title="Toggle Tactical Audio Chimes"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio: Active' : 'Audio: Muted'}</span>
          </button>

          {/* Operator Simulation Buttons */}
          <button
            id="simulate-sos-btn"
            onClick={handleSimulateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-md shadow-red-600/30 transition-all hover:scale-[1.02]"
            title="Simulate incoming SOS broadcast"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Test Incoming SOS</span>
          </button>

          <button
            id="simulate-escalation-btn"
            onClick={handleSimulateEscalate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
            title="Simulate SLA breach escalation"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Test Escalation</span>
          </button>
        </div>
      </div>

      {/* Floating Action Confirmation Toast */}
      {toastMessage && (
        <div className={cn(
          "absolute top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold tracking-wide animate-in fade-in slide-in-from-top-4 duration-200 border",
          toastMessage.type === 'escalate' 
            ? "bg-amber-600 text-white border-amber-400 shadow-amber-950/50"
            : toastMessage.type === 'dispatch'
            ? "bg-blue-600 text-white border-blue-400 shadow-blue-950/50"
            : "bg-emerald-600 text-white border-emerald-400 shadow-emerald-950/50"
        )}>
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Workspace Layout (Left Queue, Center Map, Right Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* LEFT PANEL: SOS Queue & Triage List */}
        <div className="w-80 md:w-96 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border-r border-slate-800 flex flex-col shrink-0 h-full z-10">
          {/* Filter Pills */}
          <div className="p-3 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
            {[
              { id: 'all', label: 'All' },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'escalated', label: `Escalated (${escalatedCount})` },
              { id: 'dispatched', label: `Dispatched` },
              { id: 'resolved', label: `Resolved` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg transition-colors shrink-0 text-xs",
                  filterStatus === tab.id
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Queue List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-500 flex flex-col items-center">
                <CheckCircle className="w-10 h-10 text-emerald-500/40 mb-2" />
                <p className="font-bold text-sm text-slate-400">No Alerts in this Category</p>
                <p className="text-xs mt-1">All incidents are nominal or clear.</p>
              </div>
            ) : (
              filteredAlerts.map(alert => {
                const isSelected = selectedSOS?.id === alert.id;
                const isEscalated = alert.status === 'Escalated' || alert.isEscalated;
                const isNew = alert.status === 'New';
                const isDispatched = alert.status === 'Dispatched';
                const isResolved = alert.status === 'Resolved';
                const CategoryIcon = getEmergencyIcon(alert.category);
                const colors = getEmergencyColor(alert.category);

                return (
                  <div
                    key={alert.id}
                    id={`sos-item-${alert.id}`}
                    onClick={() => handleSelectSOS(alert)}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden text-slate-200",
                      isSelected 
                        ? "bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/30 shadow-lg"
                        : isEscalated
                        ? "bg-amber-950/20 border-amber-500/40 hover:bg-amber-950/30"
                        : isNew
                        ? "bg-red-950/20 border-red-500/40 hover:bg-red-950/30"
                        : "bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                    )}
                  >
                    {/* Top Row: Category & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold uppercase", colors.badge)}>
                        <CategoryIcon className="w-3.5 h-3.5" />
                        <span>{alert.category}</span>
                      </div>

                      {/* Status Badges */}
                      {isEscalated ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                          <Flame className="w-3 h-3 text-amber-400" />
                          Escalated L-2
                        </span>
                      ) : isNew ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                          New SOS
                        </span>
                      ) : isDispatched ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Dispatched
                        </span>
                      ) : isResolved ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Resolved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                          {alert.status}
                        </span>
                      )}
                    </div>

                    {/* Location Address */}
                    <div className="flex items-start gap-1.5 text-xs font-semibold text-slate-300 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                      <p className="line-clamp-1 leading-snug">
                        {alert.address || `${alert.location[1].toFixed(4)}°N, ${alert.location[0].toFixed(4)}°E`}
                      </p>
                    </div>

                    {/* Driver & Plate Info */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                      <div className="flex items-center gap-1 truncate">
                        <User className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate">{alert.reporterName || alert.reporterId}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 font-mono text-slate-300">
                        <Truck className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>{alert.vehiclePlate || 'AS-01-EXP'}</span>
                      </div>
                    </div>

                    {/* Elapsed Timer Footer */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800/40">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {formatElapsed(alert.timestamp)}
                      </span>
                      <span className="font-mono text-slate-400">#{alert.id}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER: GIS Tactical Map */}
        <div className="flex-1 relative bg-slate-950">
          <BaseMap
            ref={mapRef}
            initialViewState={{
              longitude: selectedSOS ? selectedSOS.location[0] : 91.7362,
              latitude: selectedSOS ? selectedSOS.location[1] : 26.1445,
              zoom: 12
            }}
          >
            {/* MapLibre Controls */}
            <NavigationControl position="bottom-right" />

            {/* Custom SVG Emergency Markers */}
            {emergencyReports.map(alert => {
              const isSelected = selectedSOS?.id === alert.id;
              const isEscalated = alert.status === 'Escalated' || alert.isEscalated;
              const isResolved = alert.status === 'Resolved';
              const isDispatched = alert.status === 'Dispatched';
              const CategoryIcon = getEmergencyIcon(alert.category);

              return (
                <Marker
                  key={alert.id}
                  longitude={alert.location[0]}
                  latitude={alert.location[1]}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation();
                    handleSelectSOS(alert);
                  }}
                >
                  <div className="relative group cursor-pointer">
                    {/* Pulsing Beacon Ring */}
                    {!isResolved && (
                      <span className={cn(
                        "absolute -inset-2 rounded-full animate-ping opacity-70",
                        isEscalated ? "bg-amber-500" : isDispatched ? "bg-blue-500" : "bg-red-500"
                      )} />
                    )}

                    {/* Marker Outer Shell */}
                    <div className={cn(
                      "relative flex items-center justify-center rounded-full transition-transform shadow-xl border-2",
                      isSelected ? "scale-125 ring-4 ring-white" : "hover:scale-110",
                      isResolved
                        ? "w-8 h-8 bg-slate-800 border-emerald-500 text-emerald-400"
                        : isEscalated
                        ? "w-10 h-10 bg-gradient-to-tr from-amber-600 via-orange-600 to-red-600 border-amber-300 text-white shadow-amber-900/60"
                        : isDispatched
                        ? "w-9 h-9 bg-blue-600 border-blue-300 text-white shadow-blue-900/60"
                        : "w-9 h-9 bg-red-600 border-red-200 text-white shadow-red-900/60"
                    )}>
                      {isEscalated ? (
                        <Flame className="w-5 h-5 animate-pulse text-amber-200" />
                      ) : (
                        <CategoryIcon className="w-4 h-4" />
                      )}
                    </div>

                    {/* Floating Label on Hover / Selected */}
                    {isSelected && (
                      <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-900/95 text-white text-[11px] font-bold border border-slate-700 shadow-2xl pointer-events-none z-30">
                        {alert.category} &bull; #{alert.id}
                      </div>
                    )}
                  </div>
                </Marker>
              );
            })}
          </BaseMap>
        </div>

        {/* RIGHT PANEL: Incident Command Inspector */}
        {selectedSOS ? (
          <div className="w-80 lg:w-96 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 flex flex-col shrink-0 h-full z-10 overflow-y-auto">
            {/* Inspector Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-2 rounded-xl border",
                    selectedSOS.status === 'Escalated' || selectedSOS.isEscalated 
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-red-500/20 text-red-400 border-red-500/40"
                  )}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Incident Command #{selectedSOS.id}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {new Date(selectedSOS.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyCoords(selectedSOS)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copy GPS coordinates"
                  >
                    {copiedCoords ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status & Priority Ribbon */}
              <div className="mt-3 flex items-center justify-between">
                <span className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border",
                  selectedSOS.status === 'Escalated' || selectedSOS.isEscalated
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : selectedSOS.status === 'Dispatched'
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                    : selectedSOS.status === 'Resolved'
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/40"
                )}>
                  Status: {selectedSOS.status}
                </span>

                <span className="text-[11px] font-semibold text-slate-400">
                  {formatElapsed(selectedSOS.timestamp)}
                </span>
              </div>
            </div>

            {/* Inspector Body Details */}
            <div className="p-4 space-y-4">
              
              {/* Escalation Alert Notice (If Escalated) */}
              {(selectedSOS.status === 'Escalated' || selectedSOS.isEscalated) && (
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 to-red-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-300">
                    <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span>Level-2 Escalation Active</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {selectedSOS.escalationReason || 'SLA breached without resolution. Notified Assam SDRF Zonal Command.'}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-amber-500/20 text-[10px] text-amber-400">
                    <Building2 className="w-3 h-3" />
                    <span>DDMA Emergency Protocol Engaged</span>
                  </div>
                </div>
              )}

              {/* Dispatched Unit Banner (If Dispatched) */}
              {selectedSOS.dispatchedUnit && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 text-blue-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-blue-300">
                    <Send className="w-4 h-4 text-blue-400" />
                    <span>Dispatched Unit En Route</span>
                  </div>
                  <p className="font-semibold text-white">{selectedSOS.dispatchedUnit}</p>
                  {selectedSOS.dispatchedAt && (
                    <p className="text-[10px] text-slate-400">
                      Dispatched {formatElapsed(selectedSOS.dispatchedAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Location & GIS Card */}
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-bold uppercase text-[10px]">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    Location & GIS
                  </span>
                  <span>{selectedSOS.district || 'Kamrup Metro'}</span>
                </div>
                <p className="font-bold text-slate-200 leading-snug">
                  {selectedSOS.address || 'Guwahati Express Logistics Corridor'}
                </p>
                <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Lat: {selectedSOS.location[1].toFixed(5)}°N</span>
                  <span>Lng: {selectedSOS.location[0].toFixed(5)}°E</span>
                </div>
              </div>

              {/* Driver, Vehicle & Cargo Telemetry */}
              <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-3 text-xs">
                <p className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-400" />
                  Freight & Driver Telemetry
                </p>

                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Driver</span>
                    <strong className="text-slate-200">{selectedSOS.reporterName || selectedSOS.reporterId}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Vehicle Plate</span>
                    <strong className="font-mono text-slate-200">{selectedSOS.vehiclePlate || 'AS-01-LOGIS'}</strong>
                  </div>
                </div>

                {selectedSOS.reporterPhone && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400">Driver Phone:</span>
                    <a 
                      href={`tel:${selectedSOS.reporterPhone}`}
                      className="text-emerald-400 font-mono font-bold hover:underline"
                    >
                      {selectedSOS.reporterPhone}
                    </a>
                  </div>
                )}

                {selectedSOS.cargoDescription && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold flex items-center gap-1 mb-0.5">
                      <Package className="w-3 h-3 text-amber-400" /> Cargo Manifest
                    </span>
                    <p className="text-slate-300 font-medium">{selectedSOS.cargoDescription}</p>
                  </div>
                )}
              </div>

              {/* Activity & Audit Trail Timeline */}
              {selectedSOS.history && selectedSOS.history.length > 0 && (
                <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
                  <p className="text-slate-400 font-bold uppercase text-[10px] flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    Activity & Audit Trail
                  </p>

                  <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
                    {selectedSOS.history.map((log, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-slate-800 pb-1.5 last:pb-0 last:border-transparent">
                        <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
                        <p className="text-xs font-semibold text-slate-200">{log.action}</p>
                        {log.note && (
                          <p className="text-[11px] text-slate-400 mt-0.5 bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                            {log.note}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                          <span>{log.userId}</span>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inspector Action Controls */}
              <div className="space-y-2 pt-2">
                {selectedSOS.status === 'New' && (
                  <button
                    onClick={() => handleAcknowledge(selectedSOS)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Acknowledge & Take Command</span>
                  </button>
                )}

                <button
                  id="dispatch-responder-unit-btn"
                  onClick={handleOpenDispatch}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Emergency Unit</span>
                </button>

                {selectedSOS.status !== 'Escalated' && !selectedSOS.isEscalated && (
                  <button
                    onClick={() => handleManualEscalate(selectedSOS)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Escalate to Level-2 SDRF</span>
                  </button>
                )}

                {selectedSOS.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolve(selectedSOS)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resolve & Clear Incident</span>
                  </button>
                )}

                {/* Direct Emergency Dials */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a 
                    href="tel:112"
                    className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-red-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-red-400" />
                    <span>Assam 112</span>
                  </a>
                  <a 
                    href="tel:1070"
                    className="py-2 px-3 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>SDRF 1070</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="w-80 lg:w-96 bg-slate-900/95 border-l border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500">
            <ShieldAlert className="w-12 h-12 text-slate-700 mb-3" />
            <p className="font-bold text-sm text-slate-400">No Alert Selected</p>
            <p className="text-xs mt-1">Select an incident from the queue or map marker to view command telemetry.</p>
          </div>
        )}
      </div>

      {/* Emergency Unit Dispatch Modal */}
      {dispatchModalOpen && selectedSOS && (
        <EmergencyDispatchModal
          alert={selectedSOS}
          onClose={() => setDispatchModalOpen(false)}
          onDispatch={handleConfirmDispatch}
        />
      )}
    </div>
  );
}
