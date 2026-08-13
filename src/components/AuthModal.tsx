import React, { useState } from 'react';
import { Celebrity, User } from '../types';
import { KeyRound, Mail, UserPlus, Sparkles, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  celebrities: Celebrity[];
  users: User[];
  onClose: () => void;
  onLogin: (email: string) => void;
  onRegisterFan: (data: { name: string; email: string; password: string; celebrityId: string }) => void;
  onActivateInvite: (token: string, password: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  celebrities,
  users,
  onClose,
  onLogin,
  onRegisterFan,
  onActivateInvite,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'invite'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedCelebId, setSelectedCelebId] = useState(celebrities[0]?.id || '');
  const [inviteToken, setInviteToken] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onLogin(email);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !selectedCelebId) return;
    onRegisterFan({ name, email, password, celebrityId: selectedCelebId });
    setSuccessMsg('Account registered successfully! Welcome to the VIP Chat!');
    setTimeout(() => onClose(), 1500);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteToken || !password) return;
    onActivateInvite(inviteToken, password);
    setSuccessMsg('Celebrity account activated successfully!');
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Title */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shrink-0">
              <img src="/shemar-logo.png" alt="Shemar Chat" className="w-full h-full object-cover rounded-md" />
            </div>
            <h2 className="text-sm font-bold text-white">SHEMAR CHAT Authentication</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-800/80 p-1 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              tab === 'login' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              tab === 'register' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Fan
          </button>
          <button
            onClick={() => setTab('invite')}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              tab === 'invite' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Activate Invite
          </button>
        </div>

        <div className="p-6 text-slate-200 text-xs space-y-4">
          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Account or Enter Email</label>
                <select
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500 mb-2"
                >
                  <option value="">-- Choose Existing User --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.role.replace('_', ' ')}) - {u.email}
                    </option>
                  ))}
                </select>

                <input
                  type="email"
                  placeholder="Or enter custom email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  defaultValue="password123"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Sign In to Private Chat
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jessica Reynolds"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Select Celebrity To Connect With</label>
                <select
                  value={selectedCelebId}
                  onChange={(e) => setSelectedCelebId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                >
                  {celebrities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName} (@{c.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Register & Join Celebrity VIP Space
              </button>
            </form>
          )}

          {tab === 'invite' && (
            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Invitation Token</label>
                <input
                  type="text"
                  placeholder="e.g. CELEB_INV_MBJ_8892A"
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">Set Account Password</label>
                <input
                  type="password"
                  placeholder="Create secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Activate Celebrity Account
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
