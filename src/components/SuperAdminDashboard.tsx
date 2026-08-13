import React, { useState } from 'react';
import { Celebrity, Fan, Conversation, Invitation, Report, AuditLog, SystemSettings } from '../types';
import { AIVoiceAdminPanel } from './AIVoice/AIVoiceAdminPanel';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Sparkles,
  Plus,
  Copy,
  Check,
  Ban,
  RotateCcw,
  Sliders,
  FileText,
  AlertTriangle,
  Activity,
  X,
  Send,
  Mail,
  Database,
  ArrowRight,
  Bot,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface SuperAdminDashboardProps {
  celebrities: Celebrity[];
  fans: Fan[];
  conversations: Conversation[];
  invitations: Invitation[];
  reports: Report[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  onClose: () => void;
  onInviteCelebrity: (data: { displayName: string; username: string; email: string; bio: string; avatar: string }) => void;
  onToggleCelebrityStatus: (celebrityId: string, status: 'active' | 'suspended') => void;
  onActionReport: (reportId: string, action: 'dismissed' | 'actioned') => void;
  onUpdateSettings: (newSettings: Partial<SystemSettings>) => void;
}

const ANALYTICS_DATA = [
  { day: 'Mon', messages: 120, fans: 14 },
  { day: 'Tue', messages: 210, fans: 22 },
  { day: 'Wed', messages: 340, fans: 35 },
  { day: 'Thu', messages: 480, fans: 41 },
  { day: 'Fri', messages: 620, fans: 58 },
  { day: 'Sat', messages: 890, fans: 79 },
  { day: 'Sun', messages: 1050, fans: 92 },
];

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  celebrities,
  fans,
  conversations,
  invitations,
  reports,
  auditLogs,
  settings,
  onClose,
  onInviteCelebrity,
  onToggleCelebrityStatus,
  onActionReport,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'celebrities' | 'fans' | 'ai_video' | 'reports' | 'logs' | 'settings'>('overview');

  // Invite Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !username || !email) return;

    onInviteCelebrity({
      displayName,
      username,
      email,
      bio: bio || 'VIP Celebrity Host',
      avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    });

    setDisplayName('');
    setUsername('');
    setEmail('');
    setBio('');
    setAvatar('');
  };

  const copyInviteUrl = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5 truncate">
                <span>Super Admin Panel</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30 shrink-0">
                  Full Control
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 truncate">Manage celebrities, isolation, & platform metrics</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar (Scrollable horizontally on phone) */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-3 flex items-center gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar shrink-0">
          {[
            { id: 'overview', label: 'Dashboard', icon: Activity },
            { id: 'celebrities', label: 'Celebrities', icon: Sparkles },
            { id: 'fans', label: 'Fans', icon: Users },
            { id: 'ai_voice', label: 'AI Voice Engine', icon: Bot },
            { id: 'reports', label: `Reports (${reports.filter((r) => r.status === 'pending').length})`, icon: AlertTriangle },
            { id: 'logs', label: 'Audit Logs', icon: FileText },
            { id: 'settings', label: 'Settings', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-emerald-500 text-emerald-400 bg-slate-800/60 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body Contents */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-200 text-xs w-full max-w-full">
          {/* TAB 1: OVERVIEW / DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Stacked Metric Cards (1 column on mobile, 4 on desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-1 shadow">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Fans</p>
                  <p className="text-2xl font-black text-sky-400">{fans.length.toLocaleString()}</p>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-1 shadow">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Active Celebrities</p>
                  <p className="text-2xl font-black text-emerald-400">{celebrities.length}</p>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-1 shadow">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Active Chats</p>
                  <p className="text-2xl font-black text-indigo-400">{conversations.length}</p>
                </div>

                <div className="bg-slate-800/90 border border-slate-700/80 p-4 rounded-2xl space-y-1 shadow">
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Messages Today</p>
                  <p className="text-2xl font-black text-amber-400">642</p>
                </div>
              </div>

              {/* Quick Actions Stack */}
              <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-3">
                <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-slate-400">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => setActiveTab('celebrities')}
                    className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-between shadow transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Invite Celebrity
                    </span>
                    <ArrowRight className="w-4 h-4 opacity-75" />
                  </button>

                  <button
                    onClick={() => setActiveTab('fans')}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-400" /> Manage Fans
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-indigo-400" /> View Conversations
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>

                  <button
                    onClick={() => setActiveTab('reports')}
                    className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold flex items-center justify-between transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" /> View Reports
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              {/* Analytics Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-3">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2 text-xs">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Daily Message Activity</span>
                  </h3>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ANALYTICS_DATA}>
                        <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Bar dataKey="messages" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-3">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2 text-xs">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Fan Registration Growth</span>
                  </h3>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={ANALYTICS_DATA}>
                        <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                        <Line type="monotone" dataKey="fans" stroke="#38bdf8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CELEBRITIES & INVITATIONS */}
          {activeTab === 'celebrities' && (
            <div className="space-y-5">
              {/* Invite Form */}
              <form onSubmit={handleInviteSubmit} className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Invite New Celebrity Account</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    placeholder="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Avatar Image URL (optional)"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:border-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow w-full sm:w-auto"
                >
                  <Send className="w-4 h-4" />
                  <span>Generate Invitation Token</span>
                </button>
              </form>

              {/* Celebrities List Stack */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-slate-400">Celebrity Roster</h3>
                <div className="space-y-2">
                  {celebrities.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-100 text-sm">{c.displayName}</span>
                            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
                          </div>
                          <p className="text-xs text-slate-400">@{c.username} • {c.email}</p>
                          <span className="text-[10px] text-emerald-400 font-bold">{c.fanCount} VIP Fans</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 border-slate-700/50 pt-2 sm:pt-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {c.status}
                        </span>

                        {c.id !== 'celeb_shemar' && (
                          <button
                            onClick={() => onToggleCelebrityStatus(c.id, c.status === 'active' ? 'suspended' : 'active')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                              c.status === 'active'
                                ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 hover:bg-rose-600/30'
                                : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30'
                            }`}
                          >
                            {c.status === 'active' ? <Ban className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            <span>{c.status === 'active' ? 'Suspend' : 'Reactivate'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invites List Stack */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-slate-400">Invitation Links</h3>
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="bg-slate-800/60 border border-slate-700/60 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-bold text-slate-100">{inv.celebrityDisplayName}</p>
                        <p className="text-xs text-slate-400">{inv.email}</p>
                        <p className="text-xs font-mono text-emerald-400 mt-1">Token: {inv.token}</p>
                      </div>

                      <button
                        onClick={() => copyInviteUrl(inv.token)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 self-start sm:self-center"
                      >
                        {copiedToken === inv.token ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken === inv.token ? 'Copied Link!' : 'Copy Invite Link'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAN DIRECTORY */}
          {activeTab === 'fans' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-slate-400">Registered Fans ({fans.length})</h3>
              <div className="space-y-2">
                {fans.map((f) => {
                  const celeb = celebrities.find((c) => c.id === f.assignedCelebrityId);
                  return (
                    <div key={f.id} className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl flex items-center gap-3">
                      <img src={f.avatar} alt={f.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-100 text-sm truncate">{f.name}</h4>
                        <p className="text-xs text-slate-400 truncate">{f.email}</p>
                        <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                          Assigned Celeb: {celeb?.displayName || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: AI VOICE MANAGEMENT */}
          {activeTab === 'ai_voice' && (
            <AIVoiceAdminPanel />
          )}

          {/* TAB 4: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-slate-400">User Moderation Reports</h3>
              <div className="space-y-3">
                {reports.length === 0 ? (
                  <p className="text-slate-400 italic">No pending reports.</p>
                ) : (
                  reports.map((rep) => (
                    <div key={rep.id} className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-rose-400">Target: {rep.reportedUserName}</span>
                        <span className="text-slate-400 text-[10px]">by {rep.reporterName}</span>
                      </div>
                      <p className="text-slate-200 font-medium text-xs">Reason: {rep.reason}</p>
                      {rep.messageText && (
                        <p className="bg-slate-950 p-2 rounded-xl text-slate-300 font-mono text-[11px]">"{rep.messageText}"</p>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        {rep.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => onActionReport(rep.id, 'dismissed')}
                              className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-xl font-bold text-xs"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => onActionReport(rep.id, 'actioned')}
                              className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs shadow"
                            >
                              Action & Block
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-400 uppercase font-bold text-[10px]">{rep.status}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-slate-400">Security Audit Logs</h3>
              <div className="space-y-2 font-mono text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                      <span className="text-slate-500">{log.ipAddress}</span>
                    </div>
                    <p className="font-bold text-slate-200">{log.userName}: <span className="text-emerald-400">{log.action}</span></p>
                    <p className="text-slate-400 font-sans text-[11px]">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl space-y-3">
                <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>Database Host & Credentials</span>
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">DB Host</label>
                    <input
                      type="text"
                      value={settings.dbHost}
                      onChange={(e) => onUpdateSettings({ dbHost: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">DB Name</label>
                    <input
                      type="text"
                      value={settings.dbName}
                      onChange={(e) => onUpdateSettings({ dbName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-bold text-slate-100 text-xs mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-400" />
                    <span>SMTP Configuration</span>
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="SMTP Host"
                      value={settings.smtpHost}
                      onChange={(e) => onUpdateSettings({ smtpHost: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="From Email"
                      value={settings.smtpFromEmail}
                      onChange={(e) => onUpdateSettings({ smtpFromEmail: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
