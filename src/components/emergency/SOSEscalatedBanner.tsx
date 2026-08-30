import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  AlertOctagon, 
  Clock, 
  X, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  Radio, 
  MapPin, 
  User, 
  CheckCircle,
  Building2,
  ShieldAlert,
  Bell,
  Copy,
  Check
} from 'lucide-react';
import { EmergencyReport } from '../../types';
import { isAudioAlertEnabled, setAudioAlertEnabled, playEscalationTone } from '../../lib/audioAlerts';
import { useNotificationStore } from '../../store/useNotificationStore';
import { getEmergencyIcon } from './IncomingSOSAlertBanner';

interface Props {
  alert: EmergencyReport;
  onTakeCommand: (id: string) => void;
  onDismiss: (id: string) => void;
}

const AUTODISMISS_SECONDS = 14; // 10-15 seconds window

export default function SOSEscalatedBanner({ alert, onTakeCommand, onDismiss }: Props) {
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(isAudioAlertEnabled());
  const [broadcasted, setBroadcasted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(AUTODISMISS_SECONDS);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    Math.max(0, Math.floor((Date.now() - (alert.escalatedAt || alert.timestamp)) / 1000))
  );

  const autoDismissTriggeredRef = useRef(false);

  // Play escalation audio alert on initial trigger
  useEffect(() => {
    playEscalationTone();
  }, [alert.id]);

  // Track elapsed escalation time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - (alert.escalatedAt || alert.timestamp)) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [alert.escalatedAt, alert.timestamp]);

  const moveToNotificationsAndDismiss = () => {
    if (autoDismissTriggeredRef.current) return;
    autoDismissTriggeredRef.current = true;
    setTimeout(() => {
      useNotificationStore.getState().addNotification({
        priority: 'Critical',
        category: 'Emergency',
        title: `🚨 SLA Breach: Protocol Escalated #${alert.id}`,
        message: alert.escalationReason || `SLA response threshold exceeded for Incident #${alert.id} (${alert.category}) at ${alert.address || 'Guwahati Logistics Corridor'}. Level-2 SDRF Command notified.`,
        actionLabel: 'Take Incident Command'
      });
      onDismiss(alert.id);
    }, 0);
  };

  // 10-15 seconds countdown timer to automatically move popup to Notification Center
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

  const handleBroadcast = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBroadcasted(true);
    setTimeout(() => setBroadcasted(false), 3500);
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

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(0, (remainingSeconds / AUTODISMISS_SECONDS) * 100);

  return (
    <div 
      id={`sos-escalated-toast-${alert.id}`}
      className="w-full max-w-md bg-[#050505] text-[#F5F5F5] backdrop-blur-2xl rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.22)] border-2 border-[#D4AF37] overflow-hidden ring-2 ring-[#D4AF37]/30 animate-in slide-in-from-top-6 duration-300 transition-all pointer-events-auto"
    >
      {/* Top Urgent Header Bar */}
      <div className="bg-[#121212] px-4 py-2.5 flex items-center justify-between border-b border-[#D4AF37]/40 relative overflow-hidden">
        {/* Subtle Luxury Accent Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/10 via-[#F5D76E]/10 to-transparent pointer-events-none" />

        {/* Left: SLA Breach Status */}
        <div className="flex items-center gap-2 z-10">
          <div className="p-1 rounded-md bg-[#050505] border border-[#D4AF37]/50 flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#D4AF37] animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xs sm:text-sm tracking-wider uppercase text-[#D4AF37]">
              SLA Breach : Protocol Escalated
            </span>
          </div>
        </div>

        {/* Right: Timer, Audio & Dismiss */}
        <div className="flex items-center gap-1.5 z-10">
          {/* Elapsed Timer */}
          <div className="bg-[#050505] text-[#F5D76E] font-mono text-xs px-2 py-0.5 rounded-md border border-[#D4AF37]/40 flex items-center gap-1 font-bold">
            <Clock className="w-3 h-3 text-[#D4AF37]" />
            <span>+{formatTimer(elapsedSeconds)}</span>
          </div>

          {/* Mute/Unmute */}
          <button
            onClick={toggleAudio}
            title={soundOn ? "Mute alert audio" : "Unmute alert audio"}
            className="p-1 rounded-md bg-[#050505] hover:bg-[#1a1a1a] text-[#F5F5F5] hover:text-[#FFFFFF] border border-[#D4AF37]/30 transition-colors"
          >
            {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#F5D76E]" /> : <VolumeX className="w-3.5 h-3.5 text-[#F5F5F5]/60" />}
          </button>

          {/* Dismiss & Send to Notifications */}
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

      {/* Main Content Details */}
      <div className="p-4 space-y-3 bg-[#050505]">
        {/* Category & Escalation Protocol Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#121212] text-[#F5D76E] border border-[#D4AF37]/50 text-xs font-bold uppercase tracking-wide">
            <CategoryIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{alert.category}</span>
            <span className="text-[#FFFFFF] font-mono text-[11px] bg-[#050505] px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
              #{alert.id}
            </span>
          </div>

          <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/60 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-[#D4AF37]" />
            Protocol Level-2
          </span>
        </div>

        {/* Reason / Escalation Scope Card */}
        <div className="bg-[#121212] border border-[#D4AF37]/35 rounded-xl p-3 space-y-2 text-xs">
          <div className="flex items-start gap-2.5 text-[#F5F5F5]">
            <AlertOctagon className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
            <p className="leading-relaxed text-[12px] text-[#F5F5F5]">
              {alert.escalationReason || 'Response time exceeded SLA target (> 3 min). Automated escalation dispatched to Assam SDRF & District DDMA.'}
            </p>
          </div>

          <div className="pt-2 border-t border-[#D4AF37]/20 flex items-center justify-between text-[11px] text-[#F5D76E]">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="font-semibold">Assam SDRF HQ & DDMA Notified</span>
            </span>
            <span className="font-mono text-[#F5F5F5]/70 text-[10px]">
              {alert.location ? `${alert.location[1].toFixed(3)}°N, ${alert.location[0].toFixed(3)}°E` : ''}
            </span>
          </div>
        </div>

        {/* Location & Personnel Info Card */}
        <div className="bg-[#121212] rounded-xl p-3 border border-[#D4AF37]/25 text-xs space-y-2 text-[#F5F5F5]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="truncate font-semibold text-[#F5F5F5]">{alert.address || 'Guwahati Logistics Corridor'}</span>
            </div>
            <button 
              onClick={handleCopyCoords}
              className="p-1 rounded bg-[#050505] hover:bg-[#1a1a1a] text-[#F5D76E] border border-[#D4AF37]/30 transition-colors shrink-0"
              title="Copy GPS coordinates"
            >
              {copied ? <Check className="w-3 h-3 text-[#FFFFFF]" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#D4AF37]/15">
            <div className="flex items-center gap-1.5 text-[#F5F5F5]/90">
              <User className="w-3 h-3 text-[#F5D76E]" />
              <span className="truncate max-w-[130px] font-medium">{alert.reporterName || alert.reporterId}</span>
            </div>
            <div className="font-mono text-[11px] text-[#F5D76E] bg-[#050505] px-2 py-0.5 rounded border border-[#D4AF37]/30 font-medium">
              {alert.vehiclePlate || 'AS-01-LOGIS'}
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            id="take-command-escalated-btn"
            onClick={() => onTakeCommand(alert.id)}
            className="col-span-2 w-full py-2.5 px-4 bg-gradient-to-r from-[#D4AF37] to-[#F5D76E] hover:from-[#F5D76E] hover:to-[#D4AF37] text-[#050505] font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <ShieldAlert className="w-4 h-4 text-[#050505]" />
            <span>Take Incident Command</span>
            <ArrowRight className="w-4 h-4 ml-0.5 text-[#050505]" />
          </button>

          <button
            onClick={handleBroadcast}
            disabled={broadcasted}
            className="col-span-2 w-full py-2 px-3 bg-[#121212] hover:bg-[#1a1a1a] text-[#F5D76E] hover:text-[#FFFFFF] font-bold text-xs rounded-xl border border-[#D4AF37]/40 flex items-center justify-center gap-1.5 transition-colors"
          >
            {broadcasted ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span className="text-[#FFFFFF]">Emergency Corridor Broadcast Dispatched!</span>
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Broadcast Emergency Corridor Alert</span>
              </>
            )}
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
