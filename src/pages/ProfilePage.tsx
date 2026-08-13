import React, { useState } from 'react';
import {
  User as UserIcon,
  ShieldCheck,
  Mail,
  Lock,
  CheckCircle2,
  Bell,
  Smartphone,
  CreditCard,
  Eye,
  Sliders,
  Globe,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Key,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { User as UserType } from '../types';
import { PaymentModal } from '../components/PaymentModal';

interface ProfilePageProps {
  currentUser: UserType;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser }) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'privacy' | 'security' | 'notifications' | 'membership' | 'devices'>('profile');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // User Settings State
  const [notifState, setNotifState] = useState({
    messages: true,
    calls: true,
    membership: true,
    announcements: true,
    sound: true,
    vibration: true,
  });

  const [privacyState, setPrivacyState] = useState({
    lastSeen: 'Everyone',
    onlineStatus: 'Everyone',
    profilePhoto: 'Everyone',
    readReceipts: true,
  });

  const [securityState, setSecurityState] = useState({
    twoFactor: true,
    passkeysEnabled: true,
    biometrics: true,
  });

  // Check if user is a Verified Fan (Active VIP Membership)
  const isVerifiedFan = currentUser.isVerified || currentUser.role === 'super_admin' || currentUser.role === 'celebrity';

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* Profile Card Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left relative z-10">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-slate-800 shadow-xl"
              />
              {isVerifiedFan && (
                <div className="absolute -bottom-1 -right-1 bg-sky-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-900 shadow-lg" title="Verified Fan">
                  <CheckCircle2 className="w-4 h-4 fill-slate-950 text-sky-500" />
                </div>
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{currentUser.name}</h1>
                
                {isVerifiedFan ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-sky-500 to-indigo-500 text-slate-950 flex items-center gap-1 shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VERIFIED FAN</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                    Standard Member
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-emerald-400">@{currentUser.username}</p>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">{currentUser.bio || 'VIP Community Member on Shemar Private Chat.'}</p>
            </div>
          </div>

          {/* Membership Badge Section */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Membership Status</p>
                <p className="text-[11px] text-slate-400">
                  {isVerifiedFan ? 'Active $1,000 VIP Membership — Premium Access Enabled' : 'Standard Member — Upgrade for Direct Celebrity Calls'}
                </p>
              </div>
            </div>

            {!isVerifiedFan && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 transition shadow-lg shrink-0"
              >
                Upgrade to $1,000 VIP Pass
              </button>
            )}
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {[
            { id: 'profile', label: 'Account', icon: UserIcon },
            { id: 'privacy', label: 'Privacy', icon: Eye },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'membership', label: 'VIP Pass', icon: Sparkles },
            { id: 'devices', label: 'Devices', icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section Content */}
        {activeSection === 'profile' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Full Name</span>
                <p className="font-semibold text-slate-100">{currentUser.name}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Username</span>
                <p className="font-mono text-emerald-400 font-semibold">@{currentUser.username}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Email Address</span>
                <p className="font-mono text-slate-200">{currentUser.email}</p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Country</span>
                <p className="font-semibold text-slate-200">United States</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Privacy Controls</span>
            </h3>

            <div className="space-y-3">
              {[
                { label: 'Last Seen', value: privacyState.lastSeen },
                { label: 'Online Status', value: privacyState.onlineStatus },
                { label: 'Profile Photo Visibility', value: privacyState.profilePhoto },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                  <span className="font-semibold text-slate-200">{item.label}</span>
                  <span className="bg-slate-800 text-emerald-400 px-3 py-1 rounded-xl border border-slate-700 font-bold">
                    {item.value}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                <div>
                  <p className="font-semibold text-slate-200">Read Receipts</p>
                  <p className="text-[10px] text-slate-400">Show blue checkmarks when messages are read.</p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyState.readReceipts}
                  onChange={(e) => setPrivacyState({ ...privacyState, readReceipts: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'security' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Security & Passkeys</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                <div>
                  <p className="font-semibold text-slate-200">Two-Step Verification</p>
                  <p className="text-[10px] text-slate-400">Require PIN or authenticator app on login.</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/30">
                  ON
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs">
                <div>
                  <p className="font-semibold text-slate-200">WebAuthn Passkeys</p>
                  <p className="text-[10px] text-slate-400">Use FaceID / TouchID biometric login.</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-bold rounded-lg border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Notification Settings</span>
            </h3>

            <div className="space-y-3 text-xs">
              {[
                { key: 'messages', label: 'Message Notifications', desc: 'Alerts for direct celebrity replies' },
                { key: 'calls', label: 'Call Notifications', desc: 'Ring alerts for incoming voice/video calls' },
                { key: 'membership', label: 'Membership Notifications', desc: 'VIP access status and renewal alerts' },
                { key: 'sound', label: 'Notification Sounds', desc: 'In-app audio chimes' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
                  <div>
                    <p className="font-semibold text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-400">{item.desc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={(notifState as any)[item.key]}
                    onChange={(e) => setNotifState({ ...notifState, [item.key]: e.target.checked })}
                    className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'devices' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span>Active Sessions & Linked Devices</span>
            </h3>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="font-bold text-white">Current Mobile Session</p>
                  <p className="text-[10px] text-slate-400">PWA / Chrome • Active Now</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded text-[10px]">
                THIS DEVICE
              </span>
            </div>
          </div>
        )}

      </div>

      {showPaymentModal && (
        <PaymentModal
          celebrityName="Shemar VIP Pass"
          amount={1000}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            currentUser.isVerified = true;
          }}
        />
      )}
    </div>
  );
};
