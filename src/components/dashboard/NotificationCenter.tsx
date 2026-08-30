import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Bell, X, AlertTriangle, AlertCircle, Info, CloudRain, ShieldAlert, CheckCircle2, Flame, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: Props) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Weather' | 'Accidents' | 'Jobs'>('All');

  if (!isOpen) return null;

  const getPriorityConfig = (priority: string, title?: string) => {
    if (title && (title.includes('SLA') || title.includes('Escalated'))) {
      return { 
        icon: Flame, 
        color: 'text-[#E9C46A]', 
        bg: 'bg-[#27272A]/90', 
        border: 'border-[#D4A373]/40',
        badgeBg: 'bg-[#D4A373]/20 text-[#E9C46A]'
      };
    }
    switch (priority) {
      case 'Critical':
      case 'Emergency':
        return { 
          icon: ShieldAlert, 
          color: 'text-red-400', 
          bg: 'bg-red-950/30', 
          border: 'border-red-500/30',
          badgeBg: 'bg-red-500/20 text-red-400'
        };
      case 'High':
        return { 
          icon: AlertTriangle, 
          color: 'text-amber-400', 
          bg: 'bg-amber-950/30', 
          border: 'border-amber-500/30',
          badgeBg: 'bg-amber-500/20 text-amber-400'
        };
      case 'Medium':
        return { 
          icon: AlertCircle, 
          color: 'text-[#E9C46A]', 
          bg: 'bg-zinc-800/60', 
          border: 'border-[#D4A373]/30',
          badgeBg: 'bg-[#D4A373]/20 text-[#E9C46A]'
        };
      case 'Low':
      case 'Informational':
      default:
        return { 
          icon: Info, 
          color: 'text-zinc-300', 
          bg: 'bg-zinc-800/40', 
          border: 'border-zinc-700/40',
          badgeBg: 'bg-zinc-800 text-zinc-300'
        };
    }
  };

  const getSection = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('weather') || cat.includes('rain') || cat.includes('storm')) return 'Weather';
    if (cat.includes('accident') || cat.includes('closure') || cat.includes('crash') || cat.includes('emergency')) return 'Accidents';
    if (cat.includes('job') || cat.includes('trip') || cat.includes('assignment')) return 'Jobs';
    return 'All'; // Default unclassified
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return getSection(n.category) === activeTab;
  });

  const handleActionClick = (notif: any) => {
    markAsRead(notif.id);
    onClose();
    if (notif.category.toLowerCase().includes('emergency') || notif.title.toLowerCase().includes('sos') || notif.title.toLowerCase().includes('sla')) {
      navigate('/admin/sos');
    } else {
      navigate('/admin/incidents');
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" 
        onClick={onClose}
      />
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#18181B] text-[#FAF7F2] shadow-2xl border-l border-[#D4A373]/20 flex flex-col transform transition-transform duration-300 ease-in-out font-sans",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-5 border-b border-zinc-800 bg-[#27272A]/80 backdrop-blur-md flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#D4A373]/15 text-[#E9C46A] border border-[#D4A373]/30">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="font-heading font-bold text-base text-[#FAF7F2]">Notification Center</h2>
              {unreadCount > 0 && (
                <span className="bg-[#E9C46A] text-[#18181B] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#D4A373] hover:text-[#E9C46A] transition-colors flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button 
                onClick={onClose} 
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-[#FAF7F2] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['All', 'Weather', 'Accidents', 'Jobs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-3.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap transition-all",
                  activeTab === tab 
                    ? "bg-[#D4A373] text-[#18181B] shadow-sm font-bold" 
                    : "bg-zinc-800/80 text-zinc-400 hover:text-[#FAF7F2] hover:bg-zinc-700/80 border border-zinc-700/50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#18181B]/95">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-12">
              <Bell className="w-10 h-10 mb-3 opacity-20 text-[#D4A373]" />
              <p className="text-sm font-medium">No notifications in this category</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const config = getPriorityConfig(notif.priority, notif.title);
              const Icon = config.icon;
              const isGoldTheme = notif.title.includes('SLA') || notif.title.includes('Escalated');
              
              return (
                <div 
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all cursor-pointer",
                    notif.isRead 
                      ? "bg-zinc-900/60 border-zinc-800/60 opacity-60 hover:opacity-90" 
                      : `${config.bg} ${config.border} shadow-lg ring-1 ring-white/5`
                  )}
                >
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-0.5">
                      <div className={cn("p-2 rounded-xl", config.badgeBg || "bg-zinc-800")}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#D4A373]">
                          {notif.category}
                        </span>
                        <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                          {formatDistanceToNow(notif.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                      <h4 className={cn(
                        "text-xs sm:text-sm font-bold mb-1",
                        isGoldTheme ? "text-[#E9C46A]" : notif.isRead ? "text-zinc-400" : "text-[#FAF7F2]"
                      )}>
                        {notif.title}
                      </h4>
                      <p className={cn(
                        "text-xs leading-relaxed line-clamp-2",
                        notif.isRead ? "text-zinc-500" : "text-zinc-300"
                      )}>
                        {notif.message}
                      </p>
                      
                      {notif.actionLabel && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(notif);
                          }}
                          className={cn(
                            "mt-2.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5",
                            isGoldTheme 
                              ? "bg-[#D4A373] hover:bg-[#E9C46A] text-[#18181B] shadow-sm font-black"
                              : "text-[#E9C46A] bg-[#D4A373]/15 hover:bg-[#D4A373]/25 border border-[#D4A373]/30"
                          )}
                        >
                          <span>{notif.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
