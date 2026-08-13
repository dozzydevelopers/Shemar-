import React, { useState } from 'react';
import { Conversation, User, Celebrity } from '../types';
import {
  Search,
  ShieldCheck,
  Plus,
  Sparkles,
  MessageSquare,
  MoreVertical,
  Pin,
  VolumeX,
  Archive,
  Trash2,
  Camera,
  CheckCheck,
  CheckCircle2,
  Users,
  Radio,
  Globe,
  Settings,
  HelpCircle,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  currentUser: User;
  celebrities: Celebrity[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenInviteModal: () => void;
  onOpenRegisterFan: () => void;
  onSelectTab?: (tab: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  currentUser,
  celebrities,
  searchQuery,
  setSearchQuery,
  onOpenInviteModal,
  onOpenRegisterFan,
  onSelectTab,
}) => {
  const [subTab, setSubTab] = useState<'chats' | 'status' | 'channels' | 'communities'>('chats');
  const [filter, setFilter] = useState<'all' | 'unread' | 'vip' | 'archived'>('all');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  // Filter conversations
  const filtered = conversations.filter((conv) => {
    if (archivedIds.includes(conv.id) && filter !== 'archived') return false;
    if (!archivedIds.includes(conv.id) && filter === 'archived') return false;

    const matchesSearch =
      conv.fanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.fanEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'unread') {
      return currentUser.role === 'fan' ? conv.unreadCountFan > 0 : conv.unreadCountCelebrity > 0;
    }

    return true;
  });

  // Sort pinned conversations to the top
  const sortedConversations = [...filtered].sort((a, b) => {
    const aPinned = pinnedIds.includes(a.id);
    const bPinned = pinnedIds.includes(b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return 0;
  });

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const toggleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivedIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  return (
    <aside className="w-full max-w-full overflow-x-hidden bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none">
      {/* 1. Mobile Header & Actions */}
      <div className="px-4 py-3 border-b border-slate-800 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shrink-0">
              <img src="/shemar-logo.png" alt="Shemar Chat" className="w-full h-full object-cover rounded-[9px]" />
            </div>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              SHEMAR CHAT
            </h2>
          </div>

          {/* Quick Icon Actions */}
          <div className="flex items-center gap-1 text-slate-400">
            <button
              onClick={() => onSelectTab && onSelectTab('search')}
              className="p-2 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Search Messages"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => alert('Camera mode active for story upload')}
              className="p-2 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Camera"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* More Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                className="p-2 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {moreMenuOpen && (
                <div
                  className="absolute right-0 top-10 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1 z-50 text-xs font-semibold text-slate-200"
                  onClick={() => setMoreMenuOpen(false)}
                >
                  <button onClick={() => onSelectTab && onSelectTab('discover')} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>New chat</span>
                  </button>
                  <button onClick={() => alert('Groups functionality active')} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>New group</span>
                  </button>
                  <button onClick={() => onSelectTab && onSelectTab('profile')} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-teal-400" />
                    <span>Linked devices</span>
                  </button>
                  <button onClick={() => onSelectTab && onSelectTab('profile')} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-400" />
                    <span>Settings</span>
                  </button>
                  <button onClick={() => onSelectTab && onSelectTab('privacy_center')} className="w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Privacy</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Sub-Navigation (Chats | Status | Channels | Communities) */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs text-slate-400">
          {[
            { id: 'chats', label: 'Chats', icon: MessageSquare },
            { id: 'status', label: 'Status', icon: Radio },
            { id: 'channels', label: 'Channels', icon: Globe },
            { id: 'communities', label: 'Communities', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = subTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSubTab(item.id as any)}
                className={`flex-1 py-1.5 rounded-xl font-bold flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full h-10 bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Segment Chips */}
        <div className="flex items-center gap-1.5 text-xs">
          {(['all', 'unread', 'vip', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition ${
                filter === f
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 w-full max-w-full">
        {sortedConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-bold text-slate-300">No conversations found</p>
            <p className="text-[11px] text-slate-500">
              {filter === 'unread' ? 'You have caught up with all messages!' : 'Explore verified celebrity accounts in Discover.'}
            </p>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const celebObj = celebrities.find((c) => c.id === conv.celebrityId);
            const unreadCount = currentUser.role === 'fan' ? conv.unreadCountFan : conv.unreadCountCelebrity;

            const displayTitle = currentUser.role === 'fan' ? celebObj?.displayName || 'Celebrity' : conv.fanName;
            const displayAvatar = currentUser.role === 'fan' ? celebObj?.avatar || conv.fanAvatar : conv.fanAvatar;
            const isPinned = pinnedIds.includes(conv.id);
            const isMuted = mutedIds.includes(conv.id);

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group w-full text-left p-3.5 flex items-center gap-3 transition-colors cursor-pointer max-w-full relative ${
                  isActive
                    ? 'bg-slate-800/90 border-l-4 border-emerald-500'
                    : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                }`}
              >
                {/* Avatar with Status Indicator */}
                <div className="relative shrink-0">
                  <img
                    src={displayAvatar}
                    alt={displayTitle}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800"
                  />
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-bold text-slate-100 truncate">{displayTitle}</span>
                      <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">{conv.lastMessageTime}</span>
                  </div>

                  <p className="text-xs text-slate-300 truncate leading-snug font-sans flex items-center gap-1">
                    {conv.isTyping ? (
                      <span className="text-emerald-400 italic font-semibold">typing...</span>
                    ) : (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{conv.lastMessageText}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Badges & Indicators */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {unreadCount > 0 && (
                    <span className="bg-emerald-500 text-slate-950 font-black px-2 py-0.5 text-[10px] rounded-full shadow">
                      {unreadCount}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-slate-500">
                    {isPinned && <Pin className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    {isMuted && <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  </div>
                </div>

                {/* Quick Hover Actions (Pin / Mute / Archive) */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-700 p-1 rounded-xl shadow-lg">
                  <button onClick={(e) => togglePin(conv.id, e)} className="p-1 hover:text-amber-400 text-slate-400" title="Pin Conversation">
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => toggleMute(conv.id, e)} className="p-1 hover:text-slate-200 text-slate-400" title="Mute Notifications">
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => toggleArchive(conv.id, e)} className="p-1 hover:text-rose-400 text-slate-400" title="Archive Conversation">
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
