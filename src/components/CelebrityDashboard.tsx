import React, { useState } from 'react';
import { User, Celebrity, Conversation, Fan } from '../types';
import { Sparkles, MessageSquare, Users, CheckCheck, X, ToggleLeft, ToggleRight, Send } from 'lucide-react';

interface CelebrityDashboardProps {
  currentUser: User;
  celebrities: Celebrity[];
  conversations: Conversation[];
  fans: Fan[];
  onClose: () => void;
  onSendMessage: (conversationId: string, text: string) => void;
}

const CANNED_RESPONSES = [
  'Thank you so much for the love! Appreciate your support! ❤️',
  'Exclusive behind-the-scenes update coming up shortly! Stay tuned! 🎥',
  'Hey! Hope you are having an incredible week! ✨',
  'Sending warm hugs and positive vibes your way! 🌟',
];

export const CelebrityDashboard: React.FC<CelebrityDashboardProps> = ({
  currentUser,
  celebrities,
  conversations,
  fans,
  onClose,
  onSendMessage,
}) => {
  const currentCeleb = celebrities.find((c) => c.userId === currentUser.id) || celebrities[0];
  const myConversations = conversations.filter((c) => c.celebrityId === currentCeleb.id);
  const myFans = fans.filter((f) => f.assignedCelebrityId === currentCeleb.id);

  const [isOnline, setIsOnline] = useState(true);
  const [selectedConvId, setSelectedConvId] = useState<string>(myConversations[0]?.id || '');

  const handleSendCanned = (text: string) => {
    if (!selectedConvId) return;
    onSendMessage(selectedConvId, text);
  };

  const unreadCount = myConversations.reduce((sum, c) => sum + c.unreadCountCelebrity, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <img src={currentCeleb.avatar} alt={currentCeleb.displayName} className="w-10 h-10 rounded-full object-cover ring-2 ring-teal-500 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-1.5 truncate">
                <span>{currentCeleb.displayName} — VIP Hub</span>
                <span className="bg-teal-500/20 text-teal-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-teal-500/30 shrink-0">
                  Isolated Scope
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">Private fan conversations and instant replies</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-2xl hover:bg-slate-800 transition-colors shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Vertical Stacking on Mobile) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-200 text-xs w-full max-w-full">
          {/* Metrics Stack */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider">Celebrity Private Status</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl flex items-center justify-between shadow">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                  <p className="text-xs font-bold text-emerald-400">{isOnline ? 'Online & Chatting' : 'Away / Offline'}</p>
                </div>
                <button onClick={() => setIsOnline(!isOnline)} className="text-teal-400 hover:scale-105 transition-transform">
                  {isOnline ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7 text-slate-500" />}
                </button>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl space-y-0.5 shadow">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Unread Chats</p>
                <p className="text-xl font-black text-rose-400">{unreadCount}</p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 p-3.5 rounded-2xl space-y-0.5 shadow">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Active VIP Fans</p>
                <p className="text-xl font-black text-teal-400">{myFans.length}</p>
              </div>
            </div>
          </div>

          {/* Quick Fan Response Templates */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-xs">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Quick Fan Response Templates</span>
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-slate-400 font-bold text-xs shrink-0">Send To Fan:</label>
              <select
                value={selectedConvId}
                onChange={(e) => setSelectedConvId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none w-full"
              >
                {myConversations.map((conv) => (
                  <option key={conv.id} value={conv.id}>
                    {conv.fanName} ({conv.fanEmail})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CANNED_RESPONSES.map((tmpl, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendCanned(tmpl)}
                  className="text-left bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 p-3 rounded-xl transition-all flex items-center justify-between group"
                >
                  <span className="text-slate-300 font-medium pr-2 text-xs">{tmpl}</span>
                  <Send className="w-3.5 h-3.5 text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Conversations Vertical Stack */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider text-slate-400">Recent Fan Conversations</h3>
            <div className="space-y-2">
              {myConversations.map((conv) => (
                <div key={conv.id} className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl flex items-center gap-3">
                  <img src={conv.fanAvatar} alt={conv.fanName} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-200 text-xs truncate">{conv.fanName}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{conv.lastMessageText}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">{conv.lastMessageTime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
