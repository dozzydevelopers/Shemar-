import { AppNotification } from '../types';
import { NotificationService } from './notificationService';

type NotificationListener = (notification: AppNotification) => void;

class RealtimeNotificationManager {
  private listeners: Set<NotificationListener> = new Set();

  /**
   * Subscribe to real-time notification events
   */
  subscribe(listener: NotificationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Dispatch a real-time event when a new notification arrives
   */
  dispatch(notification: AppNotification, playSound = true) {
    this.listeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (err) {
        console.error('Error in notification listener:', err);
      }
    });

    if (playSound) {
      NotificationService.playChime();
    }

    // Trigger browser push notification if permissions allowed
    NotificationService.triggerBrowserNotification(notification.title, notification.body);
  }
}

export const realtimeNotificationManager = new RealtimeNotificationManager();
