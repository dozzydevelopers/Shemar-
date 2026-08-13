import React, { useState } from 'react';
import { Flag, X, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  reportedUserId: string;
  reportedUserName: string;
  messageId?: string;
  messageText?: string;
  onClose: () => void;
  onSubmitReport: (data: { reportedUserId: string; reportedUserName: string; messageId?: string; messageText?: string; reason: string }) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportedUserId,
  reportedUserName,
  messageId,
  messageText,
  onClose,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmitReport({
      reportedUserId,
      reportedUserName,
      messageId,
      messageText,
      reason: reason.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5" />
            <span>Report User to Super Admin</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-200">
          <p className="text-slate-300">
            Filing a report against <span className="font-bold text-rose-400">{reportedUserName}</span>. This alert will be reviewed directly by Shemar (Super Admin).
          </p>

          {messageText && (
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] italic font-mono text-slate-400">
              "{messageText}"
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-400 mb-1">Reason for Report</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe spam, harassment, or security concern..."
              rows={3}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-100 outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow transition-all"
          >
            Submit Report to Shemar
          </button>
        </form>
      </div>
    </div>
  );
};
