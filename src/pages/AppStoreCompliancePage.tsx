import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
  FileText,
  Lock,
  Camera,
  Mic,
  Bell,
  CheckCircle2,
  ExternalLink,
  Layers,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

export const AppStoreCompliancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'manifest' | 'privacy_policy' | 'terms' | 'permissions'>('manifest');

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">App Store & Play Store Production Readiness</h1>
            <p className="text-xs text-slate-400">
              Commercial metadata, iOS/Android package parameters, privacy disclosures, permissions manifests, and legal terms.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('manifest')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === 'manifest' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          App Metadata & Package Specs
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === 'permissions' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Permissions Manifests
        </button>

        <button
          onClick={() => setActiveTab('privacy_policy')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === 'privacy_policy' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Privacy Policy Disclosure
        </button>

        <button
          onClick={() => setActiveTab('terms')}
          className={`px-3.5 py-2 rounded-xl transition ${
            activeTab === 'terms' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          Terms of Service
        </button>
      </div>

      {/* Tab 1: Manifest */}
      {activeTab === 'manifest' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" /> Application Identifiers
              </h3>
              <div className="space-y-2 text-xs font-mono text-slate-300">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-500">App Name:</span>
                  <span className="font-bold text-white">Shemar Chat</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-500">Android Package:</span>
                  <span className="font-bold text-cyan-400">com.shemarchat.app</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-500">iOS Bundle ID:</span>
                  <span className="font-bold text-cyan-400">com.shemarchat.app</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex justify-between">
                  <span className="text-slate-500">Version Name:</span>
                  <span className="font-bold text-emerald-400">1.0.0 Enterprise</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Store Policy Checklists
              </h3>
              <ul className="text-xs text-slate-300 space-y-2">
                <li className="flex items-center gap-2 bg-slate-950 p-2.5 border border-slate-800 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Account Deletion Flow in Privacy Center
                </li>
                <li className="flex items-center gap-2 bg-slate-950 p-2.5 border border-slate-800 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  In-App Payment Disclosures for $1,000 VIP Pass
                </li>
                <li className="flex items-center gap-2 bg-slate-950 p-2.5 border border-slate-800 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  UGC Content Moderation & Reporting Mechanics
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white">Runtime Device Permissions Explanations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Camera className="w-4 h-4" /> NSCameraUsageDescription
              </div>
              <p className="text-slate-400 text-[11px]">
                "Shemar Chat requires camera access for WebRTC 1-on-1 HD video calling with celebrity VIP hosts."
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Mic className="w-4 h-4" /> NSMicrophoneUsageDescription
              </div>
              <p className="text-slate-400 text-[11px]">
                "Shemar Chat requires microphone access to transmit real-time voice streams during encrypted calls."
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold">
                <Bell className="w-4 h-4" /> Push Notifications
              </div>
              <p className="text-slate-400 text-[11px]">
                "Shemar Chat requests push notification permissions to notify you immediately when a celebrity replies."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Privacy Policy */}
      {activeTab === 'privacy_policy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-xs text-slate-300 space-y-4">
          <h2 className="text-lg font-bold text-white">Privacy Policy</h2>
          <p>
            This Privacy Policy governs the collection, processing, and protection of user data across the Shemar Chat platform and mobile applications (<span className="font-mono text-cyan-400">com.shemarchat.app</span>).
          </p>

          <h3 className="text-sm font-bold text-white pt-2">1. Information We Collect</h3>
          <p>
            We collect account registration information (name, email), device session indicators, identity verification references (provided by Jumio/Onfido), and payment transaction metadata. Raw credit card numbers and facial biometric templates are NEVER stored on our servers.
          </p>

          <h3 className="text-sm font-bold text-white pt-2">2. Data Retention & Isolation</h3>
          <p>
            All messages and media transferred between celebrities and fans are protected under multi-tenant database Row Level Security. Data is retained for as long as your account remains active or until an explicit account deletion request is initiated in the Privacy Center.
          </p>
        </div>
      )}

      {/* Tab 4: Terms */}
      {activeTab === 'terms' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-xs text-slate-300 space-y-4">
          <h2 className="text-lg font-bold text-white">Terms of Service & Commercial Conditions</h2>
          <p>
            Welcome to Shemar Chat. By accessing or using our VIP private chat platform, you agree to comply with the following commercial terms.
          </p>

          <h3 className="text-sm font-bold text-white pt-2">1. Celebrity VIP Memberships</h3>
          <p>
            The $1,000 Celebrity VIP Pass grants direct messaging and calling privileges with the selected celebrity community. All transactions are securely processed through Stripe or designated payment providers.
          </p>

          <h3 className="text-sm font-bold text-white pt-2">2. Conduct & Moderation Policy</h3>
          <p>
            Harassment, hate speech, or inappropriate content is strictly prohibited. Violations will result in immediate account suspension without refund and logging of audit trails.
          </p>
        </div>
      )}
    </div>
  );
};
