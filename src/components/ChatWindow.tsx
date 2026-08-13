import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, User, Celebrity, Attachment } from '../types';
import { PaymentModal } from './PaymentModal';
import { AIVoiceCallModal } from './AIVoice/AIVoiceCallModal';
import {
  Send,
  Paperclip,
  Smile,
  CheckCheck,
  ShieldCheck,
  Trash2,
  Flag,
  MoreVertical,
  Image as ImageIcon,
  FileText,
  X,
  Lock,
  MessageSquare,
  ArrowLeft,
  WifiOff,
  Video,
  Phone,
  Sparkles,
  Bot,
  Radio,
} from 'lucide-react';

interface ChatWindowProps {
  activeConversation: Conversation | null;
  messages: Message[];
  currentUser: User;
  celebrities: Celebrity[];
  onSendMessage: (conversationId: string, text: string, attachment?: Attachment) => void;
  onDeleteMessage: (messageId: string) => void;
  onReportUser: (reportedUserId: string, reportedUserName: string, messageId?: string, messageText?: string) => void;
  onBackToConversations?: () => void;
  isOffline?: boolean;
}

const EMOJI_LIST = ['❤️', '🔥', '✨', '🎥', '🎬', '😍', '👏', '🙌', '💯', '🤩', '👍', '🙏', '🎉', '💪'];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeConversation,
  messages,
  currentUser,
  celebrities,
  onSendMessage,
  onDeleteMessage,
  onReportUser,
  onBackToConversations,
  isOffline = false,
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Restore unsent draft from localStorage when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const draftKey = `shemar_draft_${activeConversation.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      setInputText(savedDraft || '');
    } else {
      setInputText('');
    }
    setSelectedAttachment(null);
  }, [activeConversation?.id]);

  // Save unsent draft to localStorage on text change
  const handleInputChange = (text: string) => {
    setInputText(text);
    if (activeConversation) {
      const draftKey = `shemar_draft_${activeConversation.id}`;
      if (text.trim()) {
        localStorage.setItem(draftKey, text);
      } else {
        localStorage.removeItem(draftKey);
      }
    }
  };

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeConversation) {
    return (
      <main className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none h-full">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mb-4 shadow-xl">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Welcome to SHEMAR Private Chat</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
          Select a celebrity conversation from the list or accept an invite to start a private messaging session.
        </p>
        <div className="mt-6 flex items-center gap-2 text-[11px] text-slate-500 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>End-to-End Multi-Tenant Data Isolation Active</span>
        </div>
      </main>
    );
  }

  const celebObj = celebrities.find((c) => c.id === activeConversation.celebrityId);
  const headerName = currentUser.role === 'fan' ? celebObj?.displayName || 'Celebrity' : activeConversation.fanName;
  const headerAvatar = currentUser.role === 'fan' ? celebObj?.avatar || activeConversation.fanAvatar : activeConversation.fanAvatar;
  const headerBio = currentUser.role === 'fan' ? celebObj?.bio || 'Verified Celebrity' : activeConversation.fanEmail;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedAttachment) return;

    onSendMessage(activeConversation.id, inputText.trim(), selectedAttachment || undefined);
    
    // Clear local draft upon send
    if (activeConversation) {
      localStorage.removeItem(`shemar_draft_${activeConversation.id}`);
    }

    setInputText('');
    setSelectedAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const attachmentObj: Attachment = {
      id: `att_${Date.now()}`,
      type: isImage ? 'image' : 'file',
      url: URL.createObjectURL(file),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    };
    setSelectedAttachment(attachmentObj);
  };

  return (
    <main className="flex-1 bg-slate-950 flex flex-col h-full relative min-w-0">
      {/* 1. Chat Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 shadow-sm z-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back Button */}
          {onBackToConversations && (
            <button
              onClick={onBackToConversations}
              className="md:hidden p-2 -ml-1 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="relative shrink-0">
            <img src={headerAvatar} alt={headerName} className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-700" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-slate-100 truncate">{headerName}</h2>
              {currentUser.role === 'fan' && <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />}
            </div>
            <p className="text-xs text-slate-400 truncate">{headerBio}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentUser.role === 'fan' && celebObj && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="p-2 sm:px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              title="Unlock $1,000 Celebrity VIP Pass"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">VIP Pass</span>
            </button>
          )}

          <button
            onClick={() => setShowVoiceCall(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition"
            title="Start Shemar AI Voice Call"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>AI Voice Call</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1 text-xs text-slate-200 z-50">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onReportUser(
                      currentUser.role === 'fan' ? celebObj?.userId || '' : activeConversation.fanId,
                      headerName,
                      undefined,
                      'User behavior flag'
                    );
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-amber-400"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report User / Spam</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Messages Display Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Date Stamp */}
        <div className="text-center my-2">
          <span className="bg-slate-900/90 text-slate-400 border border-slate-800 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full">
            Today — Encrypted Connection
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isDeleted = msg.isDeleted;

          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}>
              <div
                className={`max-w-[88%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-md relative text-xs leading-relaxed ${
                  isMe
                    ? 'bg-emerald-700 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none'
                }`}
              >
                {/* Sender Tag */}
                {!isMe && (
                  <div className="text-[10px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                    <span>{msg.senderName}</span>
                    {msg.senderRole === 'celebrity' && <ShieldCheck className="w-3 h-3 text-sky-400" />}
                  </div>
                )}

                {/* Message Content */}
                {isDeleted ? (
                  <p className="italic text-slate-300/70 text-[11px] flex items-center gap-1">
                    <Trash2 className="w-3 h-3" />
                    <span>This message was deleted</span>
                  </p>
                ) : (
                  <>
                    {/* Attachment rendering */}
                    {msg.attachment && (
                      <div className="mb-2 rounded-lg overflow-hidden border border-black/20 bg-slate-950/40 p-1">
                        {msg.attachment.type === 'image' ? (
                          <img
                            src={msg.attachment.url}
                            alt={msg.attachment.name}
                            className="max-h-60 w-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-2">
                            <FileText className="w-6 h-6 text-emerald-400" />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-xs truncate">{msg.attachment.name}</p>
                              <span className="text-[10px] opacity-75">{msg.attachment.size}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}
                  </>
                )}

                {/* Message Footer: Timestamp + Status Checkmarks */}
                <div
                  className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                    isMe ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-300" />}
                </div>

                {/* Action Hover Button (Delete) */}
                {!isDeleted && (isMe || currentUser.role === 'super_admin') && (
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="absolute top-1 right-1 p-1 bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Message"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Attachment Preview Chip */}
      {selectedAttachment && (
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <ImageIcon className="w-4 h-4" />
            <span>Attached: {selectedAttachment.name}</span>
          </div>
          <button
            onClick={() => setSelectedAttachment(null)}
            className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 bg-slate-900 border border-slate-800 rounded-xl p-2 shadow-2xl flex flex-wrap gap-2 max-w-xs z-30">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleInputChange(inputText + emoji)}
              className="text-lg hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Hidden File Input for Native Photo/File Pickers */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf"
      />

      {/* 5. Chat Input Controls */}
      <form
        onSubmit={handleSend}
        className="bg-slate-900 border-t border-slate-800 p-2.5 sm:p-3 flex items-center gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Add Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Attach Image / File"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={isOffline ? "Type message (saved as draft offline)..." : "Type a message..."}
          className="flex-1 bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !selectedAttachment}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-bold shadow-md shadow-emerald-900/30 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* VIP Payment Modal */}
      {showPaymentModal && celebObj && (
        <PaymentModal
          celebrity={celebObj}
          currentUser={currentUser}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(record) => {
            console.log('Payment completed', record);
          }}
        />
      )}

      {/* AI Voice Call Modal */}
      {showVoiceCall && (
        <AIVoiceCallModal
          currentUser={currentUser}
          celebrityId={activeConversation.celebrityId}
          celebrityName={headerName}
          celebrityAvatar={headerAvatar}
          onClose={() => setShowVoiceCall(false)}
        />
      )}
    </main>
  );
};
