import React, { useState } from 'react';
import { WifiOff, RefreshCw, ShieldAlert } from 'lucide-react';

interface OfflineScreenProps {
  onRetry: () => void;
}

export const OfflineScreen: React.FC<OfflineScreenProps> = ({ onRetry }) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetryClick = async () => {
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setTimeout(() => setRetrying(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center z-50 relative">
      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6">
        {/* Official Shemar Chat Logo */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-slate-900 to-slate-950 p-1 border border-emerald-500/30 mx-auto shadow-2xl relative">
          <img
            src="/shemar-logo.png"
            alt="Shemar Chat Official Icon"
            className="w-full h-full object-cover rounded-xl"
          />
          <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-1.5 rounded-full border-2 border-slate-900">
            <WifiOff className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-wide uppercase">
            SHEMAR CHAT
          </h1>
          <p className="text-sm font-semibold text-rose-400">You're offline.</p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            Your recent conversations are unavailable until your connection is restored.
          </p>
        </div>

        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-2 text-[11px] text-slate-400 text-left">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Private chats are isolated for security and are not stored in unencrypted browser cache.</span>
        </div>

        <button
          onClick={handleRetryClick}
          disabled={retrying}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-2xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? 'Testing Connection...' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};
