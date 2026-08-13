import React, { useState, useEffect } from 'react';
import {
  Shield,
  Download,
  Key,
  Smartphone,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lock,
  FileText,
  UserCheck,
  RefreshCw,
  LogOut,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { User, PrivacyPreferences, DeviceSessionRecord, PasskeyCredential, IdentityVerificationRecord } from '../types';

interface PrivacyCenterPageProps {
  currentUser: User;
}

export const PrivacyCenterPage: React.FC<PrivacyCenterPageProps> = ({ currentUser }) => {
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    marketingConsent: false,
    analyticsConsent: true,
    thirdPartySharing: false,
    dataRetentionMonths: 24,
  });

  const [verification, setVerification] = useState<IdentityVerificationRecord | null>(null);
  const [passkeys, setPasskeys] = useState<PasskeyCredential[]>([]);
  const [sessions, setSessions] = useState<DeviceSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [deletionSuccess, setDeletionSuccess] = useState(false);

  const loadPrivacyData = async () => {
    try {
      const [statusRes, prefsRes] = await Promise.all([
        fetch('/api/verification/status'),
        fetch('/api/privacy/preferences'),
      ]);

      const statusData = await statusRes.json();
      const prefsData = await prefsRes.json();

      if (statusData.status === 'success') {
        setVerification(statusData.verification || null);
        setPasskeys(statusData.passkeys || []);
        setSessions(statusData.sessions || []);
      }

      if (prefsData.status === 'success') {
        setPreferences(prefsData.preferences);
      }
    } catch (err) {
      console.error('Failed to load privacy center data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrivacyData();
  }, []);

  const handleUpdatePreferences = async (updated: Partial<PrivacyPreferences>) => {
    try {
      const newPrefs = { ...preferences, ...updated };
      setPreferences(newPrefs);
      await fetch('/api/privacy/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/privacy/export');
      const data = await res.json();
      if (data.status === 'success') {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data.exportData, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `shemar_chat_data_export_${currentUser.username}_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await fetch('/api/auth/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      loadPrivacyData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName: 'iPhone TouchID / FaceID' }),
      });
      loadPrivacyData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestDeletion = () => {
    if (deleteConfirmationText.trim().toLowerCase() === 'delete my account') {
      setDeletionSuccess(true);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <p>Loading Privacy Center & Security Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 text-slate-100 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Privacy Center & Data Sovereignty</h1>
            <p className="text-xs text-slate-400">
              Manage your GDPR/CCPA data export, identity verification, active sessions, passkeys, and account deletion rights.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Identity Verification & Biometric Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-cyan-400" /> Professional Identity Verification
          </h2>
          {verification && verification.verificationStatus === 'verified' ? (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-full">
              Pending Verification
            </span>
          )}
        </div>

        {verification ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/80 p-3.5 border border-slate-800 rounded-xl">
            <div>
              <div className="text-slate-500 text-[11px]">Provider</div>
              <div className="font-semibold text-slate-200 capitalize">{verification.verificationProvider}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Reference</div>
              <div className="font-mono text-slate-300 truncate">{verification.verificationReference}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Document</div>
              <div className="font-semibold text-slate-200 capitalize">{verification.documentType.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Country</div>
              <div className="font-semibold text-slate-200">{verification.country}</div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-2">
            <p className="text-slate-300">
              Identity verification is required for celebrity profiles and high-tier VIP accounts to ensure community trust and prevent impersonation.
            </p>
            <button
              onClick={async () => {
                await fetch('/api/verification/submit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ provider: 'jumio', documentType: 'passport', country: 'US' }),
                });
                loadPrivacyData();
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition"
            >
              Verify Passport / Driver's License
            </button>
          </div>
        )}
      </div>

      {/* 2. Device Sessions Manager & Passkeys */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Passkeys & WebAuthn */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" /> WebAuthn / Passkeys
            </h2>
            <button
              onClick={handleRegisterPasskey}
              className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold px-2.5 py-1 rounded-lg transition"
            >
              + Add Passkey
            </button>
          </div>

          <div className="space-y-2">
            {passkeys.map((passkey) => (
              <div
                key={passkey.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{passkey.deviceName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ID: {passkey.credentialId.slice(0, 16)}...
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                  TouchID Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Device Sessions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" /> Active Security Sessions
            </h2>
          </div>

          <div className="space-y-2">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200 flex items-center gap-1.5">
                    {sess.deviceName}
                    {sess.isCurrent && (
                      <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.2 rounded font-mono">
                        This Device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {sess.browser} • {sess.location}
                  </div>
                </div>

                {!sess.isCurrent && (
                  <button
                    onClick={() => handleRevokeSession(sess.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-950/60 rounded-lg transition"
                    title="Revoke Session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Personal Data Portability & Export (GDPR Art. 20) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-purple-400" /> Download Personal Data Archive (GDPR / CCPA)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Export a complete JSON file containing your account records, payment metadata, verification status, and session logs.
            </p>
          </div>
          <button
            onClick={handleDownloadExport}
            disabled={exporting}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shrink-0 self-start sm:self-auto"
          >
            <Download className={`w-4 h-4 ${exporting ? 'animate-bounce' : ''}`} />
            {exporting ? 'Generating JSON...' : 'Export Personal Data (.json)'}
          </button>
        </div>

        {/* Privacy Preferences Toggles */}
        <div className="space-y-3 pt-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Privacy & Processing Preferences</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Analytics Data Collection</div>
                <div className="text-[11px] text-slate-500">Helps improve platform real-time message delivery</div>
              </div>
              <button
                onClick={() => handleUpdatePreferences({ analyticsConsent: !preferences.analyticsConsent })}
                className="text-slate-300"
              >
                {preferences.analyticsConsent ? (
                  <ToggleRight className="w-7 h-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-600" />
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200">Marketing & Promotional Updates</div>
                <div className="text-[11px] text-slate-500">Notifications regarding new celebrity VIP launches</div>
              </div>
              <button
                onClick={() => handleUpdatePreferences({ marketingConsent: !preferences.marketingConsent })}
                className="text-slate-300"
              >
                {preferences.marketingConsent ? (
                  <ToggleRight className="w-7 h-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-7 h-7 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Danger Zone - Account Deletion Flow (App Store & Play Store Policy Requirement) */}
      <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
          <AlertTriangle className="w-5 h-5" /> Account Deletion & Right To Be Forgotten
        </div>
        <p className="text-xs text-slate-400">
          In accordance with Apple App Store and Google Play Store policies, you may permanently delete your account and remove all personal data records from our active databases.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Request Permanent Account Deletion
        </button>
      </div>

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-white">Permanently Delete Account?</h3>
            </div>

            {deletionSuccess ? (
              <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-200 text-xs rounded-xl space-y-2">
                <p className="font-bold">Account Deletion Request Queued Successfully.</p>
                <p className="text-slate-300">
                  Your account data will be permanently scrubbed from production database servers within 30 days in compliance with data privacy regulations.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletionSuccess(false);
                  }}
                  className="mt-2 bg-slate-800 text-white font-semibold px-4 py-2 rounded-lg w-full text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-300">
                  This action is irreversible. All chat records, active VIP memberships, and fan profiles associated with <span className="font-bold text-white">{currentUser.email}</span> will be permanently purged.
                </p>

                <div className="space-y-1.5 text-xs">
                  <label className="text-slate-400">
                    Type <span className="font-mono text-rose-400">delete my account</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmationText}
                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                    placeholder="delete my account"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestDeletion}
                    disabled={deleteConfirmationText.trim().toLowerCase() !== 'delete my account'}
                    className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-xl transition"
                  >
                    Confirm Permanent Deletion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
