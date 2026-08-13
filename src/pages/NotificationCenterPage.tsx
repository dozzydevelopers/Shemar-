import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Shield,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  UserPlus,
  Settings,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AppNotification, NotificationPreferences, User } from '../types';
import { NotificationService, DEFAULT_NOTIFICATION_PREFERENCES } from '../notifications/notificationService';

interface NotificationCenterPageProps {
  currentUser: User;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDeleteNotification: (id: string) => void;
  onOpenConversation: (conversationId: string) => void;
}

export const NotificationCenterPage: React.FC<NotificationCenterPageProps> = ({
  currentUser,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onDeleteNotification,
  onOpenConversation,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications');
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const grouped = NotificationService.groupNotifications(notifications);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'message':
      case 'celebrity_reply':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'admin_alert':
      case 'moderation':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'security':
        return <Shield className="w-4 h-4 text-indigo-400" />;
      case 'invitation':
      case 'conversation_request':
        return <UserPlus className="w-4 h-4 text-indigo-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-400" />;
    }
  };

  const renderNotifList = (items: AppNotification[], groupTitle: string) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">{groupTitle}</p>
        <div className="space-y-2">
          {items.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onMarkRead(notif.id);
                if (notif.conversationId) onOpenConversation(notif.conversationId);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                notif.isRead
                  ? 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900'
                  : 'bg-indigo-950/20 border-indigo-500/30 hover:border-indigo-500/50 shadow-md shadow-indigo-950/20'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs text-white truncate">{notif.title}</p>
                    {!notif.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{notif.body}</p>
                  <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                    {NotificationService.getRelativeTime(notif.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(notif.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  title="Delete notification"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-full overflow-y-auto">
      {/* Header Bar */}
      <div className="p-4 md:p-6 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-emerald-400" />
              <span>Notification Center</span>
              {unreadCount > 0 && (
                <span className="bg-emerald-500 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time activity feeds, celebrity message alerts, and platform events.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'notifications'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'preferences'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>

            {unreadCount > 0 && activeTab === 'notifications' && (
              <button
                onClick={onMarkAllRead}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border border-slate-700"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mark All Read</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-4xl mx-auto w-full p-4 md:p-6 flex-1 space-y-6">
        {activeTab === 'notifications' ? (
          notifications.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3 my-8">
              <Bell className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No Notifications Yet</h3>
              <p className="text-xs text-slate-400">You will receive real-time alerts when new messages arrive.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {renderNotifList(grouped.today, 'Today')}
              {renderNotifList(grouped.yesterday, 'Yesterday')}
              {renderNotifList(grouped.earlier, 'Earlier')}
            </div>
          )
        ) : (
          /* Preferences Panel */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <span>Push & Alert Preferences</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Customize how Shemar Private Chat notifies you of activity.
                </p>
              </div>

              <button
                onClick={() => NotificationService.playChime()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Audio Chime</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {[
                {
                  key: 'newMessages',
                  title: 'New Messages',
                  desc: 'Notify when celebrities or fans send a private message.',
                },
                { key: 'mentions', title: 'Mentions & VIP Tags', desc: 'Notify when tag alerts occur in group or fan chats.' },
                {
                  key: 'platformUpdates',
                  title: 'Platform Announcements',
                  desc: 'System maintenance, feature updates, and celeb invitations.',
                },
                {
                  key: 'securityAlerts',
                  title: 'Security & Account Alerts',
                  desc: 'Locked to ON per security policy.',
                  disabled: true,
                },
                { key: 'sound', title: 'Notification Sounds', desc: 'Play subtle audio chime on new incoming message.' },
                { key: 'browserPush', title: 'Browser Push Notifications', desc: 'Desktop popups via Web Notification API.' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800/80"
                >
                  <div>
                    <p className="font-bold text-slate-200">{item.title}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>

                  <input
                    type="checkbox"
                    disabled={item.disabled}
                    checked={(prefs as any)[item.key]}
                    onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                    className="accent-emerald-500 w-4 h-4 rounded cursor-pointer disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
