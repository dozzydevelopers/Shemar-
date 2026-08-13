import React from 'react';
import { MessageSquare, Compass, Phone, Bell, User as UserIcon } from 'lucide-react';
import { NavigationTab } from '../types';

interface MobileBottomNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  unreadMessagesCount,
  unreadNotificationsCount,
}) => {
  const tabs = [
    { id: 'chats' as NavigationTab, label: 'Chats', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'discover' as NavigationTab, label: 'Discover', icon: Compass },
    { id: 'calls' as NavigationTab, label: 'Calls', icon: Phone },
    { id: 'notifications' as NavigationTab, label: 'Alerts', icon: Bell, badge: unreadNotificationsCount },
    { id: 'profile' as NavigationTab, label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative min-w-[56px] min-h-[44px] ${
                isActive
                  ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-slate-950 font-black text-[9px] px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-md animate-pulse">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 leading-none tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
