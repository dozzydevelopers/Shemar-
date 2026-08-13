import React, { useState } from 'react';
import { User, Celebrity, NavigationTab } from '../types';
import {
  MessageSquare,
  ShieldCheck,
  Code2,
  LogIn,
  Moon,
  Sun,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Globe,
  Star,
  Users,
  Settings,
  Bell,
  Search,
} from 'lucide-react';

interface MobileHeaderProps {
  currentUser: User;
  users: User[];
  celebrities: Celebrity[];
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onSwitchUser: (userId: string) => void;
  onOpenAdmin: () => void;
  onOpenCelebrityDash: () => void;
  onOpenPhpExporter: () => void;
  onOpenAuth: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentUser,
  users,
  celebrities,
  activeTab,
  onTabChange,
  onSwitchUser,
  onOpenAdmin,
  onOpenCelebrityDash,
  onOpenPhpExporter,
  onOpenAuth,
  darkMode,
  setDarkMode,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-white px-4 h-14 flex items-center justify-between sticky top-0 z-40 shadow-md select-none pt-[env(safe-area-inset-top)]">
        {/* Brand Logo & Name */}
        <div
          onClick={() => onTabChange('chats')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-900/30 shrink-0">
            <img src="/shemar-logo.png" alt="Shemar Chat Logo" className="w-full h-full object-cover rounded-[9px]" />
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-extrabold tracking-tight text-white font-sans">SHEMAR CHAT</h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 tracking-wide">
              VIP CHAT
            </span>
          </div>
        </div>

        {/* Right Action Icons: User Avatar & Menu Button */}
        <div className="flex items-center gap-2">
          {/* Quick Dashboard shortcut for Super Admin or Celebrity */}
          {currentUser.role === 'super_admin' && (
            <button
              onClick={onOpenAdmin}
              className="p-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-emerald-600/30 transition-all"
              title="Super Admin Panel"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline text-[11px]">Admin</span>
            </button>
          )}

          {currentUser.role === 'celebrity' && (
            <button
              onClick={onOpenCelebrityDash}
              className="p-1.5 bg-teal-600/20 text-teal-400 border border-teal-500/30 rounded-xl text-xs font-semibold flex items-center gap-1 hover:bg-teal-600/30 transition-all"
              title="Celebrity VIP Hub"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline text-[11px]">Hub</span>
            </button>
          )}

          {/* User Avatar */}
          <button
            onClick={() => onTabChange('profile')}
            className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/50"
            />
          </button>

          {/* Mobile Slide-Over Drawer Toggle button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Slide-Over Drawer Menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setDrawerOpen(false)} />

          {/* Drawer Container */}
          <div className="relative w-full max-w-xs bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl z-10 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold uppercase">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-4 space-y-5 text-xs text-slate-200">
              {/* Role Switcher Demo Box (Guarded: fans NEVER see this!) */}
              {currentUser.role !== 'fan' && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Switch Test Account</span>
                  </p>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u.id);
                          setDrawerOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl font-medium flex items-center justify-between transition-all ${
                          currentUser.id === u.id
                            ? 'bg-emerald-600 text-white font-bold shadow'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                          <span className="truncate">{u.name}</span>
                        </div>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-300">
                          {u.role.split('_')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Role Action Buttons */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                  Navigation Control
                </p>

                {currentUser.role === 'super_admin' && (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenAdmin();
                    }}
                    className="w-full text-left p-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-2xl font-bold flex items-center gap-2.5 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Super Admin Control Panel</span>
                  </button>
                )}

                {currentUser.role === 'celebrity' && (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenCelebrityDash();
                    }}
                    className="w-full text-left p-3 bg-teal-600/20 hover:bg-teal-600/30 border border-teal-500/30 text-teal-300 rounded-2xl font-bold flex items-center gap-2.5 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Celebrity VIP Hub</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onTabChange('web_intelligence');
                  }}
                  className="w-full text-left p-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 rounded-2xl font-bold flex items-center gap-2.5 transition-all"
                >
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Web AI Intelligence Agent</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onTabChange('privacy_center');
                  }}
                  className="w-full text-left p-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-2xl font-bold flex items-center gap-2.5 transition-all"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Privacy Center & Data Sovereignty</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onTabChange('app_store_compliance');
                  }}
                  className="w-full text-left p-3 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 text-cyan-300 rounded-2xl font-bold flex items-center gap-2.5 transition-all"
                >
                  <Settings className="w-4 h-4 text-cyan-400" />
                  <span>App Store & Play Store Specs</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenPhpExporter();
                  }}
                  className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-slate-200 rounded-2xl font-bold flex items-center gap-2.5 transition-all"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Export PHP / MySQL Codebase</span>
                </button>
              </div>

              {/* Utility Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl font-semibold flex items-center justify-between text-slate-200 transition-all"
                >
                  <div className="flex items-center gap-2">
                    {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
                    <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{darkMode ? 'Dark ON' : 'Light ON'}</span>
                </button>

                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left p-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-2xl font-bold flex items-center gap-2.5 transition-all"
                >
                  <LogIn className="w-4 h-4 text-rose-400" />
                  <span>Login / Register New Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
