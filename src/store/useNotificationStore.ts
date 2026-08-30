import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppNotification, WeatherIntelligence, AlertPriority } from '../types';

interface NotificationState {
  notifications: AppNotification[];
  weather: WeatherIntelligence | null;
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  updateWeather: (weather: WeatherIntelligence) => void;
  lastAlertTime: number;
}

const PRIORITY_LEVELS: Record<AlertPriority, number> = {
  'Informational': 1,
  'Low': 2,
  'Medium': 3,
  'High': 4,
  'Emergency': 5,
  'Critical': 6
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: 'notif-1',
          priority: 'Emergency',
          category: 'Road closure',
          title: 'Route 4 Closed',
          message: 'Immediate road closure on Route 4 due to severe flooding.',
          isRead: false,
          timestamp: Date.now() - 1000 * 60 * 5,
        },
        {
          id: 'notif-2',
          priority: 'High',
          category: 'Heavy rainfall',
          title: 'Heavy Rainfall Warning',
          message: 'Expect delays. Rainfall exceeding 50mm/hr in Northern district.',
          isRead: false,
          timestamp: Date.now() - 1000 * 60 * 15,
        }
      ],
      weather: {
        temperature: 24,
        forecast: 'Thunderstorms',
        rainfall: 65,
        windSpeed: 45,
        heavyRainfallWarning: true,
        travelRiskLevel: 'Red',
        lastUpdated: Date.now()
      },
      unreadCount: 2,
      lastAlertTime: 0,

      addNotification: (notification) => set((state) => {
        const now = Date.now();
        
        // Smart Alert Logic:
        
        // 1. Deduplication & Escalation
        // Check if similar active notification exists in last 1 hour
        const similarIndex = state.notifications.findIndex(n => 
          n.category === notification.category && 
          n.title === notification.title && 
          now - n.timestamp < 1000 * 60 * 60
        );

        if (similarIndex !== -1) {
          const existing = state.notifications[similarIndex];
          // If new priority is higher, we escalate (update existing)
          if (PRIORITY_LEVELS[notification.priority] > PRIORITY_LEVELS[existing.priority]) {
             const updatedNotifs = [...state.notifications];
             updatedNotifs[similarIndex] = {
               ...existing,
               priority: notification.priority,
               message: notification.message,
               timestamp: now,
               isRead: false // Mark unread again due to escalation
             };
             return {
               notifications: updatedNotifs,
               unreadCount: updatedNotifs.filter(n => !n.isRead).length
             };
          }
          // Otherwise ignore duplicate
          return state;
        }

        // 2. Rate Control
        // Prevent spamming low/medium priority alerts too quickly (e.g. max 1 per 10 seconds)
        // Critical/Emergency alerts bypass rate limiting
        if (
          PRIORITY_LEVELS[notification.priority] <= PRIORITY_LEVELS['High'] &&
          now - state.lastAlertTime < 10000 
        ) {
          return state; // Rate limited
        }

        // 3. Add New Notification
        const newNotif: AppNotification = {
          ...notification,
          id: `notif-${now}-${Math.random().toString(36).substring(2, 11)}`,
          timestamp: now,
          isRead: false
        };

        const newNotifications = [newNotif, ...state.notifications].slice(0, 100); // Keep max 100
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(n => !n.isRead).length,
          lastAlertTime: now
        };
      }),

      markAsRead: (id) => set((state) => {
        const newNotifications = state.notifications.map(n => 
          n.id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications: newNotifications,
          unreadCount: newNotifications.filter(n => !n.isRead).length
        };
      }),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      })),

      updateWeather: (weather) => set({ weather })
    }),
    {
      name: 'logistics-notifications',
      storage: createJSONStorage(() => localStorage), // Offline persistence
    }
  )
);
