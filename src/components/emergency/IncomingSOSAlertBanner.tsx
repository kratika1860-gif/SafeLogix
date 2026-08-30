import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  User, 
  Phone, 
  Truck, 
  Clock, 
  X, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  ExternalLink,
  Copy,
  Check,
  Bell,
  Activity,
  Ambulance,
  Car,
  Mountain,
  Droplets,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { EmergencyReport, EmergencyCategory } from '../../types';
import { isAudioAlertEnabled, setAudioAlertEnabled, playIncomingSOSTone } from '../../lib/audioAlerts';
import { useNotificationStore } from '../../store/useNotificationStore';
import { cn } from '../../lib/utils';

interface Props {
  alert: EmergencyReport;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
}

const AUTODISMISS_SECONDS = 14; // 10-15 seconds window

export function getEmergencyIcon(category: EmergencyCategory) {
  switch (category) {
    case 'Medical Emergency':
      return Ambulance;
    case 'Accident':
      return Car;
    case 'Landslide':
      return Mountain;
    case 'Flood':
      return Droplets;
    case 'Vehicle Failure':
      return Wrench;
    case 'Security Threat':
      return ShieldAlert;
    default:
      return AlertTriangle;
  }
}

export function getEmergencyColor(category: EmergencyCategory) {
  return {
    badge: 'bg-[#121212] text-[#F5D76E] border-[#D4AF37]/50',
    ring: 'ring-[#D4AF37]',
    glow: 'shadow-[#D4AF37]/20'
  };
}

export default function IncomingSOSAlertBanner({ alert, onAcknowledge, onDismiss }: Props) {
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(isAudioAlertEnabled());
  const [copied, setCopied] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(AUTODISMISS_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.max(0, Math.floor((Date.now() - alert.timestamp) / 1000))
  );

  const autoDismissTriggeredRef = useRef(false);

  // Play audio chime on mount
  useEffect(() => {
    playIncomingSOSTone();
    const interval = setInterval(() => {
      playIncomingSOSTone();
    }, 15000);
    return () => clearInterval(interval);
  }, [alert.id]);

  // Live timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - alert.timestamp) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [alert.timestamp]);

  const moveToNotificationsAndDismiss = () => {
    if (autoDismissTriggeredRef.current) return;
    autoDismissTriggeredRef.current = true;
    setTimeout(() => {
      useNotificationStore.getState().addNotification({
        priority: 'Emergency',
        category: (alert.category as any) || 'Emergency',
        title: `🚨 Incoming SOS Signal #${alert.id}`,
        message: `Emergency signal from ${alert.reporterName || 'Driver'} (${alert.vehiclePlate || 'Unit'}) at ${alert.address || 'Guwahati Corridor'}.`,
        actionLabel: 'Open SOS Center'
      });
      onDismiss(alert.id);
    }, 0);
  };

  // Auto-dismiss countdown (10-15 seconds) to move alert into notifications
  useEffect(() => {
    setRemainingSeconds(AUTODISMISS_SECONDS);
    autoDismissTriggeredRef.current = false;

    const interval = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      moveToNotificationsAndDismiss();
    }, AUTODISMISS_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [alert.id]);

  const handleManualDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveToNotificationsAndDismiss();
  };

  const toggleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    setAudioAlertEnabled(next);
  };

  const handleCopyCoords = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!alert.location) return;
    const coords = `${alert.location[1].toFixed(5)}, ${alert.location[0].toFixed(5)}`;
    navigator.clipboard.writeText(coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CategoryIcon = getEmergencyIcon(alert.category);
  const colors = getEmergencyColor(alert.category);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, (remainingSeconds / AUTODISMISS_SECONDS) * 100);

  return (
    <div 
      id={`incoming-sos-toast-${alert.id}`}
      className="w-full max-w-md bg-[#050505] text-[#F5F5F5] backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.22)] border-2 border-[#D4AF37] overflow-hidden ring-2 ring-[#D4AF37]/30 animate-in slide-in-from-top-6 duration-300 transition-all pointer-events-auto"
    >
      {/* Top Urgent Status Banner */}
      <div className="bg-[#121212] px-4 py-2.5 flex items-center justify-between border-b border-[#D4AF37]/40 relative overflow-hidden">
        {/* Subtle Luxury Accent Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-[#F5D76E]/10 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-2.5 z-10">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F5D76E]"></span>
          </span>
          <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm tracking-wider uppercase text-[#D4AF37]">
            <ShieldAlert className="w-4 h-4 text-[#D4AF37] animate-bounce" />
            <span>Incoming SOS Signal</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 z-10">
          <div className="bg-[#050505] text-[#F5D76E] font-mono text-xs px-2 py-0.5 rounded-md border border-[#D4AF37]/40 flex items-center gap-1 font-bold">
            <Clock className="w-3 h-3 text-[#D4AF37]" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            onClick={toggleAudio}
            title={soundOn ? "Mute alert audio" : "Unmute alert audio"}
            className="p-1 rounded-md bg-[#050505] hover:bg-[#1a1a1a] text-[#F5F5F5] hover:text-[#FFFFFF] border border-[#D4AF37]/30 transition-colors"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#F5D76E]" /> : <VolumeX className="w-3.5 h-3.5 text-[#F5F5F5]/60" />}
          </button>

          <button 
            onClick={handleManualDismiss}
            title="Move to Notifications"
            className="p-1 rounded-md bg-[#050505] hover:bg-[#1a1a1a] text-[#F5F5F5] hover:text-[#FFFFFF] border border-[#D4AF37]/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Auto-Dismiss Progress Bar (10-15s indicator) */}
      <div className="w-full bg-[#121212] h-[3px] overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-[#D4AF37] via-[#F5D76E] to-[#FFFFFF] transition-all duration-1000 ease-linear shadow-[0_0_8px_#D4AF37]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-3 bg-[#050505]">
        {/* Category & SLA Tag */}
        <div className="flex items-center justify-between gap-2">
          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold uppercase tracking-wide", colors.badge)}>
            <CategoryIcon className="w-4 h-4 text-[#D4AF37]" />
            <span>{alert.category}</span>
            <span className="text-[#FFFFFF] font-mono text-[11px] bg-[#050505] px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
              #{alert.id}
            </span>
          </div>

          <div className="text-[11px] font-semibold text-[#F5D76E] flex items-center gap-1 bg-[#121212] px-2.5 py-1 rounded-lg border border-[#D4AF37]/25">
            <Activity className="w-3 h-3 text-[#D4AF37]" />
            <span>SLA Target: &lt; 03:00m</span>
          </div>
        </div>

        {/* Location & Driver Info Box */}
        <div className="bg-[#121212] rounded-xl p-3 border border-[#D4AF37]/25 space-y-2.5 text-xs text-[#F5F5F5]">
          {/* Location */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-[#F5F5F5] leading-snug">
                  {alert.address || 'Guwahati Express Logistics Corridor'}
                </p>
                <p className="text-[#F5F5F5]/70 font-mono text-[11px] mt-0.5">
                  {alert.location[1].toFixed(5)}°N, {alert.location[0].toFixed(5)}°E
                </p>
              </div>
            </div>
            <button 
              onClick={handleCopyCoords}
              className="p-1 rounded bg-[#050505] hover:bg-[#1a1a1a] text-[#F5D76E] border border-[#D4AF37]/30 transition-colors shrink-0"
              title="Copy GPS coordinates"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#FFFFFF]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="h-px bg-[#D4AF37]/15" />

          {/* Driver & Unit */}
          <div className="grid grid-cols-2 gap-2 text-[#F5F5F5]/90">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#F5D76E] shrink-0" />
              <span className="truncate font-medium">{alert.reporterName || alert.reporterId}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="font-mono text-[11px] font-medium text-[#F5D76E] bg-[#050505] px-1.5 py-0.5 rounded border border-[#D4AF37]/30">{alert.vehiclePlate || 'AS-01-LOGIS'}</span>
            </div>
          </div>

          {alert.reporterPhone && (
            <div className="flex items-center justify-between pt-1 border-t border-[#D4AF37]/15 text-[#F5F5F5]/80 text-[11px]">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#F5D76E]" />
                <span>Contact Driver:</span>
              </span>
              <a 
                href={`tel:${alert.reporterPhone}`}
                className="text-[#F5D76E] hover:text-[#FFFFFF] hover:underline font-mono font-bold"
              >
                {alert.reporterPhone}
              </a>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="acknowledge-sos-btn"
            onClick={() => onAcknowledge(alert.id)}
            className="col-span-2 w-full py-2.5 px-4 bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] hover:from-[#F5D76E] hover:to-[#D4AF37] text-[#050505] font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <ShieldAlert className="w-4 h-4 text-[#050505]" />
            <span>Take Command & Acknowledge</span>
            <ArrowRight className="w-4 h-4 ml-0.5 text-[#050505]" />
          </button>

          <a
            href="tel:112"
            className="w-full py-2 px-3 bg-[#121212] hover:bg-[#1a1a1a] text-[#F5D76E] hover:text-[#FFFFFF] font-bold text-xs rounded-xl border border-[#D4AF37]/40 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Emergency 112</span>
          </a>

          <button
            onClick={() => {
              onAcknowledge(alert.id);
              navigate('/admin/sos');
            }}
            className="w-full py-2 px-3 bg-[#121212] hover:bg-[#1a1a1a] text-[#F5F5F5] hover:text-[#FFFFFF] font-bold text-xs rounded-xl border border-[#D4AF37]/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#F5D76E]" />
            <span>Open Map Radar</span>
          </button>
        </div>

        {/* Auto-Move to Notification Notice */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#121212] border border-[#D4AF37]/20 text-[10.5px] text-[#F5F5F5]/75">
          <span className="flex items-center gap-1.5">
            <Bell className="w-3 h-3 text-[#F5D76E]" />
            <span>Auto-moving to Notifications in <strong className="text-[#D4AF37] font-bold">{remainingSeconds}s</strong></span>
          </span>
          <button 
            onClick={handleManualDismiss}
            className="text-[#F5D76E] hover:text-[#FFFFFF] font-semibold underline underline-offset-2 transition-colors"
          >
            Move Now
          </button>
        </div>
      </div>
    </div>
  );
}
