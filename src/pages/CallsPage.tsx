import React, { useState } from 'react';
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { User, Celebrity, Conversation, CallRecord } from '../types';
import { TelephonyService } from '../services/telephonyService';

interface CallsPageProps {
  currentUser: User;
  celebrities: Celebrity[];
  conversations: Conversation[];
  onStartCall: (conversationId: string) => void;
}

export const CallsPage: React.FC<CallsPageProps> = ({
  currentUser,
  celebrities,
  conversations,
  onStartCall,
}) => {
  const [filter, setFilter] = useState<'all' | 'missed' | 'incoming' | 'outgoing'>('all');

  // Mock initial calls enriched with conversation details
  const [calls] = useState<CallRecord[]>([
    {
      id: 'call_1',
      conversationId: conversations[0]?.id || 'conv_1',
      tenantId: 'celeb_shemar',
      callerId: 'usr_celeb_shemar',
      callerName: 'Shemar Moore',
      callerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      receiverId: currentUser.id,
      receiverName: currentUser.name,
      callType: 'ai_voice',
      status: 'ended',
      durationSeconds: 312,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    },
    {
      id: 'call_2',
      conversationId: conversations[0]?.id || 'conv_1',
      tenantId: 'celeb_shemar',
      callerId: currentUser.id,
      callerName: currentUser.name,
      callerAvatar: currentUser.avatar,
      receiverId: 'usr_celeb_shemar',
      receiverName: 'Shemar Moore',
      callType: 'ai_voice',
      status: 'ended',
      durationSeconds: 180,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
    },
    {
      id: 'call_3',
      conversationId: conversations[0]?.id || 'conv_1',
      tenantId: 'celeb_shemar',
      callerId: 'usr_celeb_shemar',
      callerName: 'Shemar Moore',
      callerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      receiverId: currentUser.id,
      receiverName: currentUser.name,
      callType: 'ai_voice',
      status: 'missed',
      durationSeconds: 0,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    },
  ]);

  const filteredCalls = calls.filter((c) => {
    const isIncoming = c.receiverId === currentUser.id;
    const isOutgoing = c.callerId === currentUser.id;
    const isMissed = c.status === 'missed';

    if (filter === 'missed') return isMissed;
    if (filter === 'incoming') return isIncoming && !isMissed;
    if (filter === 'outgoing') return isOutgoing;
    return true;
  });

  const formatDuration = (secs: number) => {
    if (secs === 0) return '';
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}m ${remaining}s`;
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="max-w-3xl mx-auto w-full space-y-5">
        {/* Header & New Call Button */}
        <div className="flex items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-400" />
              <span>Calls</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure AI Voice conversations using authorized celebrity voice likenesses.
            </p>
          </div>

          {conversations.length > 0 && (
            <button
              onClick={() => onStartCall(conversations[0].id)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:brightness-110 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Start AI Voice Call</span>
            </button>
          )}
        </div>

        {/* Filter Segment Tabs */}
        <div className="flex items-center bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs w-full">
          {(['all', 'missed', 'incoming', 'outgoing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-2 text-center font-bold capitalize rounded-xl transition-all ${
                filter === tab
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Call Logs List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
          {filteredCalls.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2">
              <Phone className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-bold text-slate-300">No call history</p>
              <p className="text-xs text-slate-500">
                Calls with verified celebrities will appear here.
              </p>
            </div>
          ) : (
            filteredCalls.map((call) => {
              const isIncoming = call.receiverId === currentUser.id;
              const isOutgoing = call.callerId === currentUser.id;
              const isMissed = call.status === 'missed';
              const name = isOutgoing ? call.receiverName : call.callerName;
              const avatar = isOutgoing ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' : call.callerAvatar;

              return (
                <div
                  key={call.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={avatar}
                      alt={name}
                      className="w-12 h-12 rounded-2xl object-cover shrink-0 border border-slate-700"
                    />

                    <div className="min-w-0 space-y-1">
                      <h4 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                        <span>{name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 fill-sky-400/20 shrink-0" />
                      </h4>

                      <div className="flex items-center gap-2 text-xs">
                        {isMissed ? (
                          <span className="flex items-center gap-1 text-rose-400 font-semibold">
                            <PhoneMissed className="w-3.5 h-3.5" />
                            <span>Missed AI Voice call</span>
                          </span>
                        ) : isIncoming ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <PhoneIncoming className="w-3.5 h-3.5" />
                            <span>Incoming AI Voice call</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sky-400 font-medium">
                            <PhoneOutgoing className="w-3.5 h-3.5" />
                            <span>Outgoing AI Voice call</span>
                          </span>
                        )}

                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 font-mono text-[11px]">{formatTime(call.createdAt)}</span>
                        {call.durationSeconds > 0 && (
                          <>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 text-[11px]">{formatDuration(call.durationSeconds)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Call Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onStartCall(call.conversationId)}
                      className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      title="Start AI Voice Call"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
