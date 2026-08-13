import { AppNotification, NotificationType, NotificationPreferences } from '../types';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  newMessages: true,
  mentions: true,
  platformUpdates: true,
  securityAlerts: true, // Policy locked to true
  sound: true,
  browserPush: true,
};

export class NotificationService {
  /**
   * Play an audio chime alert for new notifications
   */
  static playChime() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (err) {
      console.warn('Audio chime playback omitted by browser policy', err);
    }
  }

  /**
   * Trigger native browser push notification if granted
   */
  static async triggerBrowserNotification(title: string, body: string, icon?: string) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
      });
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
        });
      }
    }
  }

  /**
   * Helper to format relative time (e.g. "2 minutes ago", "1 hour ago")
   */
  static getRelativeTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Group notifications into time sections
   */
  static groupNotifications(notifications: AppNotification[]) {
    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const earlier: AppNotification[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;

    for (const notif of notifications) {
      const time = new Date(notif.createdAt).getTime();
      if (time >= todayStart) {
        today.push(notif);
      } else if (time >= yesterdayStart) {
        yesterday.push(notif);
      } else {
        earlier.push(notif);
      }
    }

    return { today, yesterday, earlier };
  }
}
