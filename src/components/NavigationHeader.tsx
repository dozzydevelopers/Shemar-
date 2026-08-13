import React from 'react';
import {
  MessageSquare,
  Search,
  Globe,
  Bell,
  User,
  Star,
  Users,
  LayoutDashboard,
  ShieldAlert,
  FileCode,
  Settings,
  Sparkles,
  Menu,
  X,
  Compass,
  FileText,
  Activity,
  ShieldCheck,
  Smartphone,
  Phone,
} from 'lucide-react';
import { NavigationTab, User as UserType } from '../types';

interface NavigationHeaderProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  currentUser: UserType;
  unreadNotificationCount: number;
  totalUnreadMessageCount: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  unreadNotificationCount,
  totalUnreadMessageCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Tab configurations per role
  const getRoleTabs = () => {
    if (currentUser.role === 'super_admin') {
      return [
        { id: 'chats', label: 'Chats', icon: MessageSquare, badge: totalUnreadMessageCount },
        { id: 'system_health', label: 'System Health', icon: Activity },
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'celebrities', label: 'Celebrities', icon: Star },
        { id: 'fans', label: 'Fans', icon: Users },
        { id: 'search', label: 'Search', icon: Search },
        { id: 'web_intelligence', label: 'Web AI', icon: Globe },
        { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationCount },
        { id: 'privacy_center', label: 'Privacy Center', icon: ShieldCheck },
        { id: 'app_store_compliance', label: 'App Store Info', icon: Smartphone },
        { id: 'audit_logs', label: 'Audit Logs', icon: ShieldAlert },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }

    if (currentUser.role === 'celebrity') {
      return [
        { id: 'chats', label: 'Private Conversations', icon: MessageSquare, badge: totalUnreadMessageCount },
        { id: 'fans', label: 'My Fans', icon: Users },
        { id: 'search', label: 'Search', icon: Search },
        { id: 'web_intelligence', label: 'Web AI', icon: Globe },
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount },
        { id: 'privacy_center', label: 'Privacy Center', icon: ShieldCheck },
        { id: 'app_store_compliance', label: 'App Store Specs', icon: Smartphone },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }

    // Fan tabs
    return [
      { id: 'chats', label: 'Chats', icon: MessageSquare, badge: totalUnreadMessageCount },
      { id: 'discover', label: 'Discover', icon: Compass },
      { id: 'calls', label: 'Calls', icon: Phone },
      { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadNotificationCount },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  };

  const tabs = getRoleTabs();

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/30 shrink-0">
              <img src="/shemar-logo.png" alt="Shemar Chat Official Logo" className="w-full h-full object-cover rounded-[10px]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                SHEMAR CHAT
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-semibold">
                  PRIVATE CHAT
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Celebrity Private Messaging</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as NavigationTab)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all relative ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
                  <span>{tab.label}</span>

                  {Boolean(tab.badge && tab.badge > 0) && (
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Pill & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('profile')}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-mono">{currentUser.role.replace('_', ' ')}</p>
              </div>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl lg:hidden hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 py-3 space-y-1 animate-in slide-in-from-top duration-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id as NavigationTab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  isActive ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>

                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
