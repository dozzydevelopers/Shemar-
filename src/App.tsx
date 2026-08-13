import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { CelebrityDashboard } from './components/CelebrityDashboard';
import { AuthModal } from './components/AuthModal';
import { PHPCodeViewerModal } from './components/PHPCodeViewerModal';
import { ReportModal } from './components/ReportModal';
import { NavigationHeader } from './components/NavigationHeader';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { PreloadStartupScreen } from './components/PreloadStartupScreen';
import { OfflineScreen } from './components/OfflineScreen';
import { SkeletonLoader } from './components/SkeletonLoader';
import { GlobalSearchPage } from './pages/GlobalSearchPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { WebIntelligencePage } from './pages/WebIntelligencePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CallsPage } from './pages/CallsPage';
import { ProfilePage } from './pages/ProfilePage';
import { PrivacyCenterPage } from './pages/PrivacyCenterPage';
import { AppStoreCompliancePage } from './pages/AppStoreCompliancePage';
import { SystemHealthDashboard } from './components/SystemHealthDashboard';
import { realtimeNotificationManager } from './notifications/realtimeNotifications';
import { WifiOff } from 'lucide-react';
import {
  User,
  Celebrity,
  Fan,
  Conversation,
  Message,
  Invitation,
  Report,
  AuditLog,
  SystemSettings,
  PHPFileExport,
  Attachment,
  AppNotification,
  NavigationTab,
} from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [fans, setFans] = useState<Fan[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [phpFiles, setPhpFiles] = useState<PHPFileExport[]>([]);

  // Navigation & UI State
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const p = window.location.pathname;
    if (p === '/admin' || p === '/celebrity') {
      return p;
    }
    return '/app';
  });

  const navigateTo = (route: string) => {
    window.history.pushState(null, '', route);
    setCurrentRoute(route);
  };

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/admin' || p === '/celebrity') {
        setCurrentRoute(p);
      } else {
        setCurrentRoute('/app');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [activeTab, setActiveTab] = useState<NavigationTab>('chats');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [preloadDone, setPreloadDone] = useState(false);

  // Modals
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCelebrityModal, setShowCelebrityModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPhpModal, setShowPhpModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{
    userId: string;
    userName: string;
    msgId?: string;
    msgText?: string;
  } | null>(null);

  // Fetch initial bootstrap data
  const loadBootstrap = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const data = await res.json();

      setCurrentUser(data.currentUser);
      setUsers(data.users);
      setCelebrities(data.celebrities);
      setFans(data.fans);
      setConversations(data.conversations);
      setMessages(data.messages);
      setInvitations(data.invitations);
      setReports(data.reports);
      setAuditLogs(data.auditLogs);
      setSettings(data.settings);
      setNotifications(data.notifications || []);

      if (!activeConversationId && data.conversations.length > 0 && window.innerWidth >= 768) {
        setActiveConversationId(data.conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to load bootstrap API', err);
    }
  };

  const loadPhpFiles = async () => {
    try {
      const res = await fetch('/api/export-php');
      const data = await res.json();
      setPhpFiles(data.files || []);
    } catch (err) {
      console.error('Failed to fetch PHP codebase', err);
    }
  };

  useEffect(() => {
    loadBootstrap();
    loadPhpFiles();

    // Remove inline static HTML splash once React mounts
    const splash = document.getElementById('initial-splash');
    if (splash) {
      splash.style.transition = 'opacity 0.3s ease-out';
      splash.style.opacity = '0';
      setTimeout(() => splash.remove(), 300);
    }

    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      loadBootstrap();
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-time listener for incoming notifications
  useEffect(() => {
    const unsubscribe = realtimeNotificationManager.subscribe((newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });
    return unsubscribe;
  }, []);

  // Periodic polling for real-time messaging & notification synchronization
  useEffect(() => {
    if (isOffline) return;
    const interval = setInterval(() => {
      loadBootstrap();
    }, 2500);
    return () => clearInterval(interval);
  }, [activeConversationId, isOffline]);

  // Render Branded Offline Screen if network is down
  if (isOffline) {
    return <OfflineScreen onRetry={loadBootstrap} />;
  }

  // Render Enhanced Preload Screen during initial startup
  if (!preloadDone || !currentUser || !settings) {
    return <PreloadStartupScreen onComplete={() => setPreloadDone(true)} />;
  }

  // Handle Switch User
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCurrentUser(data.currentUser);
        loadBootstrap();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (conversationId: string, text: string, attachment?: Attachment) => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, text, attachment }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        loadBootstrap();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  // Handle Delete Message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const res = await fetch('/api/messages/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId }),
      });
      if (res.ok) loadBootstrap();
    } catch (err) {
      console.error(err);
    }
  };

  // Notification API handlers
  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await fetch('/api/notifications/read-all', { method: 'POST' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      await fetch('/api/notifications/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Admin Handlers
  const handleInviteCelebrity = async (data: {
    displayName: string;
    username: string;
    email: string;
    bio: string;
    avatar: string;
  }) => {
    try {
      const res = await fetch('/api/admin/invite-celebrity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) loadBootstrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivateInvite = async (token: string, password: string) => {
    try {
      const res = await fetch('/api/auth/activate-celebrity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setCurrentUser(data.user);
        loadBootstrap();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterFan = async (data: { name: string; email: string; password: string; celebrityId: string }) => {
    try {
      const res = await fetch('/api/auth/register-fan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.status === 'success') {
        setCurrentUser(resData.user);
        if (resData.conversation) setActiveConversationId(resData.conversation.id);
        loadBootstrap();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCelebrityStatus = async (celebrityId: string, status: 'active' | 'suspended') => {
    try {
      const res = await fetch('/api/admin/celebrity/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ celebrityId, status }),
      });
      if (res.ok) loadBootstrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionReport = async (reportId: string, action: 'dismissed' | 'actioned') => {
    try {
      const res = await fetch('/api/admin/reports/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });
      if (res.ok) loadBootstrap();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReport = async (data: {
    reportedUserId: string;
    reportedUserName: string;
    messageId?: string;
    messageText?: string;
    reason: string;
  }) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) loadBootstrap();
    } catch (err) {
      console.error(err);
    }
  };

  // Active Conversation Messages
  const activeConv = conversations.find((c) => c.id === activeConversationId) || null;
  const activeMessages = activeConv ? messages.filter((m) => m.conversationId === activeConv.id) : [];

  const unreadMessagesCount = conversations.reduce(
    (acc, curr) => acc + (currentUser.role === 'fan' ? curr.unreadCountFan : curr.unreadCountCelebrity),
    0
  );

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Determine whether Mobile Bottom Navigation should be visible
  const isMobileInChat = activeTab === 'chats' && activeConversationId !== null;

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col font-sans overflow-hidden">
      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="bg-amber-600 text-slate-950 text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2 border-b border-amber-500 shadow-sm z-50">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>⚡ Offline Mode: Connection lost. Draft messages are saved locally.</span>
        </div>
      )}

      {/* --- BRANCH 1: SUPER ADMIN ENVIRONMENT --- */}
      {currentRoute === '/admin' && (
        (() => {
          const isAdmin = currentUser.role === 'super_admin';
          return isAdmin ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              {/* Minimal High-End Administrative Bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md">
                    <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center font-bold text-amber-400 text-xs">A</div>
                  </div>
                  <div>
                    <h1 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Platform Administration Console</h1>
                    <p className="text-[10px] text-slate-400">Secure Enterprise Portal • Multi-Tenant Isolated Sandbox</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full font-bold border border-amber-500/20 hidden sm:inline-block">
                    Logged in as {currentUser.name}
                  </span>
                  <button
                    onClick={() => navigateTo('/app')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    View Fan App
                  </button>
                </div>
              </div>

              {/* Main Admin View Workspace */}
              <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6">
                <SuperAdminDashboard
                  celebrities={celebrities}
                  fans={fans}
                  conversations={conversations}
                  invitations={invitations}
                  reports={reports}
                  auditLogs={auditLogs}
                  settings={settings}
                  onClose={() => navigateTo('/app')}
                  onInviteCelebrity={handleInviteCelebrity}
                  onToggleCelebrityStatus={handleToggleCelebrityStatus}
                  onActionReport={handleActionReport}
                  onUpdateSettings={(newSettings) => setSettings({ ...settings, ...newSettings })}
                />
              </div>
            </div>
          ) : (
            /* Secure Lock Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-950">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-500 to-amber-500" />
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-black text-white">Platform Administration Restricted</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The Super Admin environment is restricted. Your current session profile ({currentUser.name}) does not have administrative privileges.
                  </p>
                </div>

                {/* Dev Test Switcher */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dev Mode Account Bypass</p>
                  <div className="space-y-2">
                    {users.filter(u => u.role === 'super_admin').map(u => (
                      <button
                        key={u.id}
                        onClick={async () => {
                          await handleSwitchUser(u.id);
                          navigateTo('/admin');
                        }}
                        className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-3 transition-colors text-xs font-semibold"
                      >
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-xs font-bold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Click to switch to Admin account</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigateTo('/app')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Go to Fan App
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* --- BRANCH 2: CELEBRITY ENVIRONMENT --- */}
      {currentRoute === '/celebrity' && (
        (() => {
          const isCelebOrAdmin = currentUser.role === 'celebrity' || currentUser.role === 'super_admin';
          return isCelebOrAdmin ? (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
              {/* Minimal Celebrity Dashboard Bar */}
              <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-md">
                    <div className="w-full h-full bg-slate-900 rounded-[6px] flex items-center justify-center font-bold text-teal-400 text-xs">C</div>
                  </div>
                  <div>
                    <h1 className="text-xs font-extrabold text-slate-100 uppercase tracking-wider">Celebrity Communications Control</h1>
                    <p className="text-[10px] text-slate-400">Exclusive VIP Hub • Direct Private Messaging Channel</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full font-bold border border-teal-500/20 hidden sm:inline-block">
                    Channel Owner: {currentUser.name}
                  </span>
                  <button
                    onClick={() => navigateTo('/app')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    View Fan App
                  </button>
                </div>
              </div>

              {/* Main Celebrity Dashboard Workspace */}
              <div className="flex-1 bg-slate-950 p-4 sm:p-6 overflow-y-auto">
                <CelebrityDashboard
                  currentUser={currentUser}
                  celebrities={celebrities}
                  conversations={conversations}
                  fans={fans}
                  onClose={() => navigateTo('/app')}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          ) : (
            /* Secure Lock Screen */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-950">
              <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-teal-500 to-indigo-500" />
                <div className="w-16 h-16 mx-auto rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-black text-white">Celebrity Hub Restricted</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Only verified celebrity profiles and authorized administrators can view this messaging hub. Your current profile ({currentUser.name}) does not have access.
                  </p>
                </div>

                {/* Dev Test Switcher */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-left space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dev Mode Account Bypass</p>
                  <div className="space-y-2">
                    {users.filter(u => u.role === 'celebrity').map(u => (
                      <button
                        key={u.id}
                        onClick={async () => {
                          await handleSwitchUser(u.id);
                          navigateTo('/celebrity');
                        }}
                        className="w-full text-left p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center gap-3 transition-colors text-xs font-semibold"
                      >
                        <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-xs font-bold truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Click to switch to Celebrity account</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigateTo('/app')}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Go to Fan App
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* --- BRANCH 3: FAN MOBILE APP ENVIRONMENT --- */}
      {currentRoute === '/app' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* 1. Mobile Compact Header (< md) */}
          <div className="md:hidden">
            <MobileHeader
              currentUser={currentUser}
              users={users}
              celebrities={celebrities}
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab !== 'chats') setActiveConversationId(null);
              }}
              onSwitchUser={handleSwitchUser}
              onOpenAdmin={() => navigateTo('/admin')}
              onOpenCelebrityDash={() => navigateTo('/celebrity')}
              onOpenPhpExporter={() => setShowPhpModal(true)}
              onOpenAuth={() => setShowAuthModal(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </div>

          {/* 2. Desktop Headers (>= md) */}
          <div className="hidden md:block">
            <Header
              currentUser={currentUser}
              users={users}
              celebrities={celebrities}
              unreadTotal={unreadMessagesCount}
              onSwitchUser={handleSwitchUser}
              onOpenAdmin={() => navigateTo('/admin')}
              onOpenCelebrityDash={() => navigateTo('/celebrity')}
              onOpenPhpExporter={() => setShowPhpModal(true)}
              onOpenAuth={() => setShowAuthModal(true)}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <NavigationHeader
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              currentUser={currentUser}
              unreadNotificationCount={unreadNotificationsCount}
              totalUnreadMessageCount={unreadMessagesCount}
            />
          </div>

          {/* 3. Main Body Container */}
          <main className={`flex-1 flex overflow-hidden min-h-0 ${!isMobileInChat ? 'pb-14 md:pb-0' : 'pb-0'}`}>
            {activeTab === 'chats' && (
              <div className="flex-1 flex overflow-hidden w-full max-w-full">
                {/* Sidebar View on Mobile vs Desktop */}
                <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 ${activeConversationId ? 'hidden md:block' : 'block'}`}>
                  <Sidebar
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={(id) => setActiveConversationId(id)}
                    currentUser={currentUser}
                    celebrities={celebrities}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    onOpenInviteModal={() => navigateTo('/admin')}
                    onOpenRegisterFan={() => setShowAuthModal(true)}
                    onSelectTab={(tab) => setActiveTab(tab)}
                  />
                </div>

                {/* Chat Window View on Mobile vs Desktop */}
                <div className={`flex-1 flex flex-col min-w-0 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
                  <ChatWindow
                    activeConversation={activeConv}
                    messages={activeMessages}
                    currentUser={currentUser}
                    celebrities={celebrities}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onReportUser={(reportedUserId, reportedUserName, msgId, msgText) => {
                      setReportTarget({ userId: reportedUserId, userName: reportedUserName, msgId, msgText });
                    }}
                    onBackToConversations={() => setActiveConversationId(null)}
                    isOffline={isOffline}
                  />
                </div>
              </div>
            )}

            {activeTab === 'calls' && (
              <CallsPage
                currentUser={currentUser}
                celebrities={celebrities}
                conversations={conversations}
                onStartCall={(convId) => {
                  setActiveConversationId(convId);
                  setActiveTab('chats');
                }}
              />
            )}

            {activeTab === 'search' && (
              <GlobalSearchPage
                currentUser={currentUser}
                celebrities={celebrities}
                onOpenConversation={(convId) => {
                  setActiveConversationId(convId);
                  setActiveTab('chats');
                }}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationCenterPage
                currentUser={currentUser}
                notifications={notifications}
                onMarkRead={handleMarkNotificationRead}
                onMarkAllRead={handleMarkAllNotificationsRead}
                onDeleteNotification={handleDeleteNotification}
                onOpenConversation={(convId) => {
                  setActiveConversationId(convId);
                  setActiveTab('chats');
                }}
              />
            )}

            {activeTab === 'web_intelligence' && <WebIntelligencePage />}

            {activeTab === 'discover' && (
              <DiscoverPage
                celebrities={celebrities}
                currentUser={currentUser}
                onStartChat={async (celebId) => {
                  try {
                    const res = await fetch('/api/conversations/start', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ celebrityId: celebId }),
                    });
                    const data = await res.json();
                    if (data.status === 'success' && data.conversation) {
                      await loadBootstrap();
                      setActiveConversationId(data.conversation.id);
                      setActiveTab('chats');
                    }
                  } catch (err) {
                    console.error('Failed to start chat session:', err);
                  }
                }}
              />
            )}

            {activeTab === 'profile' && <ProfilePage currentUser={currentUser} />}

            {activeTab === 'privacy_center' && <PrivacyCenterPage currentUser={currentUser} />}

            {activeTab === 'app_store_compliance' && <AppStoreCompliancePage />}

            {activeTab === 'system_health' && currentUser.role === 'super_admin' && (
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto bg-slate-950">
                <SystemHealthDashboard auditLogs={auditLogs} />
              </div>
            )}
          </main>

          {/* 4. Mobile Fixed Bottom Navigation (< md) - Hidden inside active Chat view */}
          {!isMobileInChat && (
            <MobileBottomNav
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                if (tab !== 'chats') setActiveConversationId(null);
              }}
              unreadMessagesCount={unreadMessagesCount}
              unreadNotificationsCount={unreadNotificationsCount}
            />
          )}
        </div>
      )}

      {/* Floating Interactive Dev Workspace Navigation Controller (Only in Development/Demo mode) */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed bottom-16 right-4 z-50 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-xl flex items-center gap-1 text-[11px] font-bold backdrop-blur-md">
          <span className="text-slate-500 px-1.5 font-mono uppercase tracking-wider text-[10px]">Dev Route:</span>
          <button
            onClick={() => navigateTo('/app')}
            className={`px-2.5 py-1 rounded-xl transition ${currentRoute === '/app' ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}
          >
            Fan App
          </button>
          <button
            onClick={() => navigateTo('/celebrity')}
            className={`px-2.5 py-1 rounded-xl transition ${currentRoute === '/celebrity' ? 'bg-teal-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}
          >
            Celeb Hub
          </button>
          <button
            onClick={() => navigateTo('/admin')}
            className={`px-2.5 py-1 rounded-xl transition ${currentRoute === '/admin' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-950 text-slate-400 hover:text-slate-200'}`}
          >
            Admin Panel
          </button>
        </div>
      )}

      {/* Global PWA Install Banner */}
      <PwaInstallPrompt />

      {/* MODALS */}
      {showPhpModal && <PHPCodeViewerModal files={phpFiles} onClose={() => setShowPhpModal(false)} />}

      {showAuthModal && (
        <AuthModal
          celebrities={celebrities}
          users={users}
          onClose={() => setShowAuthModal(false)}
          onLogin={(email) => {
            const matched = users.find((u) => u.email === email);
            if (matched) handleSwitchUser(matched.id);
          }}
          onRegisterFan={handleRegisterFan}
          onActivateInvite={handleActivateInvite}
        />
      )}

      {reportTarget && (
        <ReportModal
          reportedUserId={reportTarget.userId}
          reportedUserName={reportTarget.userName}
          messageId={reportTarget.msgId}
          messageText={reportTarget.msgText}
          onClose={() => setReportTarget(null)}
          onSubmitReport={handleSubmitReport}
        />
      )}
    </div>
  );
}
