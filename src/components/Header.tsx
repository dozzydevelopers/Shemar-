import React from 'react';
import { User, Celebrity } from '../types';
import { ShieldCheck, MessageSquare, Code2, LogIn, LogOut, Moon, Sun, Search, Bell, Sparkles, UserPlus } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  users: User[];
  celebrities: Celebrity[];
  unreadTotal: number;
  onSwitchUser: (userId: string) => void;
  onOpenAdmin: () => void;
  onOpenCelebrityDash: () => void;
  onOpenPhpExporter: () => void;
  onOpenAuth: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  users,
  celebrities,
  unreadTotal,
  onSwitchUser,
  onOpenAdmin,
  onOpenCelebrityDash,
  onOpenPhpExporter,
  onOpenAuth,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/30 shrink-0">
          <img src="/shemar-logo.png" alt="Shemar Chat Logo" className="w-full h-full object-cover rounded-[10px]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold tracking-tight text-white">SHEMAR CHAT</h1>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-medium border border-emerald-500/30">
              VIP Chat
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Private Celebrity-to-Fan Platform</p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fans, celebrity chats, or messages..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Actions & Role Switcher */}
      <div className="flex items-center gap-2">
        {/* Testing Session Role Switcher Pill (Guarded so fans NEVER see it!) */}
        {currentUser.role !== 'fan' && (
          <div className="hidden lg:flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs">
            <span className="text-slate-400 px-2 font-medium">Demo Role:</span>
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  currentUser.id === u.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <img src={u.avatar} alt={u.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                <span>{u.name.split(' ')[0]}</span>
                {u.role === 'super_admin' && <ShieldCheck className="w-3 h-3 text-amber-300" />}
              </button>
            ))}
          </div>
        )}

        {/* Export PHP Codebase Button */}
        <button
          onClick={onOpenPhpExporter}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-semibold transition-all"
          title="View & Download PHP + MySQL Codebase"
        >
          <Code2 className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">PHP/MySQL Source</span>
        </button>

        {/* Dashboard Links based on Role */}
        {currentUser.role === 'super_admin' && (
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin</span>
          </button>
        )}

        {currentUser.role === 'celebrity' && (
          <button
            onClick={onOpenCelebrityDash}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrity Hub</span>
          </button>
        )}

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Current Active User Profile Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/50"
          />
          <div className="hidden md:block text-left">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-200">
              <span>{currentUser.name}</span>
              {currentUser.isVerified && <ShieldCheck className="w-3 h-3 text-sky-400" />}
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>

          <button
            onClick={onOpenAuth}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
            title="Switch Account / Login"
          >
            <LogIn className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
