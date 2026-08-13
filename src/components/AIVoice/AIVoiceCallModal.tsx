import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Radio,
  Lock,
  RotateCcw,
  Flag,
  Sparkles,
  AlertTriangle,
  Wifi,
  WifiOff,
  Send,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { User, AIVoiceSession } from '../../types';
import { aiVoiceService } from '../../services/aiVoiceService';
import { voiceSessionManager } from '../../voice/sessionManager';
import { speechRecognizer } from '../../ai/speech/speechRecognizer';
import { voiceStreamingPipeline } from '../../voice/streaming';
import { memoryStore } from '../../ai/memory/memoryStore';
import { PaymentModal } from '../PaymentModal';

interface AIVoiceCallModalProps {
  currentUser: User;
  celebrityId: string;
  celebrityName: string;
  celebrityAvatar: string;
  onClose: () => void;
}

export const AIVoiceCallModal: React.FC<AIVoiceCallModalProps> = ({
  currentUser,
  celebrityId,
  celebrityName,
  celebrityAvatar,
  onClose,
}) => {
  const [callState, setCallState] = useState<'preview' | 'connecting' | 'connected' | 'ended'>('preview');
  const [activeSession, setActiveSession] = useState<AIVoiceSession | null>(null);
  const [aiState, setAiState] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  
  // Controls
  const [micMuted, setMicMuted] = useState<boolean>(false);
  const [speakerOn, setSpeakerOn] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  
  // Timer & Reconnection
  const [seconds, setSeconds] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  // Captions & Memory
  const [lastResponseText, setLastResponseText] = useState<string>(
    "Hey! It's good to hear from you. How are you doing today?"
  );
  const [inputText, setInputText] = useState<string>('');

  // Sub-Modals
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('harassment');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const isEligible = aiVoiceService.checkEligibility(currentUser);

  // Timer interval for call duration
  useEffect(() => {
    if (callState !== 'connected') return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  // Network simulation check
  useEffect(() => {
    const handleOnline = () => setIsConnected(true);
    const handleOffline = () => setIsConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleStartCall = () => {
    if (!isEligible) {
      setShowPaymentModal(true);
      return;
    }

    setCallState('connecting');
    try {
      const session = voiceSessionManager.createSession(currentUser, celebrityId, celebrityName);
      setActiveSession(session);
      setTimeout(() => {
        setCallState('connected');
        startSpeechListening();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to initialize AI Voice Call.');
      setCallState('preview');
    }
  };

  const startSpeechListening = () => {
    if (!speechRecognizer.isSupported()) return;
    setMicActive(true);
    speechRecognizer.startListening({
      onTranscript: (transcript, isFinal) => {
        if (isFinal) {
          voiceStreamingPipeline.processStream(
            transcript,
            celebrityId,
            currentUser.id,
            (response) => setLastResponseText(response),
            (state) => setAiState(state)
          );
        }
      },
      onInterruption: () => {
        // Voice Interruption (barge-in): fan speaking halts AI speech
        voiceStreamingPipeline.interruptStream();
      },
      onError: (err) => {
        console.warn('Speech recognition error:', err);
      },
    });
  };

  const handleEndCall = () => {
    if (activeSession) {
      voiceSessionManager.endSession(activeSession.id);
    }
    voiceStreamingPipeline.interruptStream();
    speechRecognizer.stopListening();
    setCallState('ended');
  };

  const handleSendText = async () => {
    if (!inputText.trim() || callState !== 'connected') return;
    const userMsg = inputText.trim();
    setInputText('');

    await voiceStreamingPipeline.processStream(
      userMsg,
      celebrityId,
      currentUser.id,
      (response) => setLastResponseText(response),
      (state) => setAiState(state)
    );
  };

  const toggleMicMute = () => {
    if (micMuted) {
      setMicMuted(false);
      startSpeechListening();
    } else {
      setMicMuted(true);
      speechRecognizer.stopListening();
      setMicActive(false);
    }
  };

  const handleClearMemory = () => {
    memoryStore.clearMemory(currentUser.id, celebrityId);
    alert('AI conversation memory cleared.');
    setShowOptionsMenu(false);
  };

  const handleSubmitReport = () => {
    if (!activeSession) return;
    aiVoiceService.reportAbuse({
      sessionId: activeSession.id,
      fanId: currentUser.id,
      celebrityId,
      reason: reportReason as any,
      details: reportDetails,
      transcriptSnippet: lastResponseText,
    });
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setShowReportModal(false);
      setShowOptionsMenu(false);
    }, 1500);
  };

  const formatTime = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 select-none overflow-hidden">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md h-[90vh] max-h-[720px] flex flex-col justify-between relative shadow-2xl overflow-hidden">
        
        {/* TOP BAR */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between z-20 shrink-0">
          <button
            onClick={callState === 'connected' ? handleEndCall : onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center">
            <h2 className="text-sm font-black text-white flex items-center gap-1">
              <span>{celebrityName}</span>
              <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20" />
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold mt-0.5">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>AI-generated interaction</span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Options Dropdown Menu */}
            {showOptionsMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-30 text-xs">
                <button
                  onClick={handleClearMemory}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clear AI Memory</span>
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-800 rounded-xl flex items-center gap-2"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Report Response</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RECONNECTION / NETWORK ERROR BANNER */}
        {!isConnected && (
          <div className="bg-rose-500/20 border-b border-rose-500/30 px-4 py-1.5 text-center text-xs text-rose-300 font-bold flex items-center justify-center gap-1.5 animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Reconnecting network connection...</span>
          </div>
        )}

        {/* PREVIEW SCREEN */}
        {callState === 'preview' && (
          <div className="flex-1 p-6 flex flex-col items-center justify-between text-center space-y-6 overflow-y-auto">
            <div className="space-y-4 max-w-sm my-auto">
              <div className="relative w-28 h-28 mx-auto">
                <img
                  src={celebrityAvatar}
                  alt={celebrityName}
                  className="w-full h-full rounded-full object-cover ring-4 ring-emerald-500/40 shadow-2xl"
                />
                <span className="absolute bottom-0 right-0 bg-emerald-500 text-slate-950 p-1.5 rounded-full border-2 border-slate-900 shadow">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-white">AI Voice Call</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Start a real-time natural voice conversation with an AI representation powered by an authorized Shemar Moore voice.
                </p>
              </div>

              {/* Membership Status Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">VIP Voice Access</span>
                  {isEligible ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Voice Call ✓</span>
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      <span>Voice Call 🔒</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {isEligible
                    ? 'Verified Fan Membership active. Start call anytime.'
                    : 'Verified Fan Membership required.'}
                </p>
              </div>
            </div>

            {/* Start Button */}
            <div className="w-full space-y-3">
              <button
                onClick={handleStartCall}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>{isEligible ? 'Start AI Voice Call' : 'Become a Verified Fan'}</span>
              </button>
            </div>
          </div>
        )}

        {/* CONNECTING SCREEN */}
        {callState === 'connecting' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <div>
              <p className="text-base font-bold text-white">Connecting AI Voice Line...</p>
              <p className="text-xs text-slate-400 mt-1">Initializing authorized voice session...</p>
            </div>
          </div>
        )}

        {/* CONNECTED LIVE CALL INTERFACE */}
        {callState === 'connected' && (
          <div className="flex-1 flex flex-col items-center justify-between p-6 space-y-6 overflow-hidden">
            
            {/* Center Avatar Display */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 my-auto">
              <div className="relative">
                <img
                  src={celebrityAvatar}
                  alt={celebrityName}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-emerald-500/50 shadow-2xl"
                />
                {/* Audio Waves Pulsing Effect */}
                <div
                  className={`absolute inset-0 rounded-full border-4 border-emerald-400 ${
                    aiState === 'speaking'
                      ? 'animate-ping opacity-75'
                      : aiState === 'thinking'
                      ? 'animate-pulse opacity-40'
                      : 'opacity-0'
                  }`}
                />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-white">AI Voice Call</h3>
                
                {/* Status Indicator */}
                <p className="text-xs font-bold text-emerald-400 capitalize tracking-wide flex items-center justify-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${aiState === 'speaking' ? 'bg-emerald-400 animate-ping' : aiState === 'thinking' ? 'bg-amber-400 animate-pulse' : 'bg-sky-400'}`} />
                  <span>{aiState === 'speaking' ? 'Speaking...' : aiState === 'thinking' ? 'Thinking...' : 'Listening...'}</span>
                </p>

                {/* Call Timer Display */}
                <p className="text-sm font-mono font-bold text-slate-300 pt-1">
                  {formatTime(seconds)}
                </p>
              </div>

              {/* Live Caption Text Box */}
              <div className="w-full bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl text-center shadow-xl space-y-1 max-w-xs">
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">
                  {celebrityName} AI
                </p>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  "{lastResponseText}"
                </p>
              </div>
            </div>

            {/* Text Input Row inside Call */}
            <div className="w-full flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder="Type a message or speak..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSendText}
                disabled={!inputText.trim()}
                className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl font-bold hover:brightness-110 disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* CALL CONTROLS ROW */}
            <div className="w-full flex items-center justify-around bg-slate-950 border border-slate-800/80 p-3 rounded-2xl shadow-xl">
              {/* Mute Mic */}
              <button
                onClick={toggleMicMute}
                className={`p-3.5 rounded-2xl transition ${
                  micMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
                title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Active Listening Trigger / Mic Toggle */}
              <button
                onClick={startSpeechListening}
                className="p-3.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-2xl hover:bg-emerald-500/30 transition"
                title="Speak Now"
              >
                <Radio className="w-5 h-5 animate-pulse" />
              </button>

              {/* Speaker Toggle */}
              <button
                onClick={() => setSpeakerOn(!speakerOn)}
                className={`p-3.5 rounded-2xl transition ${
                  speakerOn
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'bg-slate-800 text-slate-500'
                }`}
                title={speakerOn ? 'Speaker On' : 'Speaker Muted'}
              >
                {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* END CALL BUTTON */}
              <button
                onClick={handleEndCall}
                className="p-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold shadow-lg transition"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ENDED SCREEN */}
        {callState === 'ended' && (
          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Voice Call Ended</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Call duration: {formatTime(seconds)}. Session logged securely.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-500 text-slate-950 font-extrabold rounded-2xl text-xs"
            >
              Return to Chat
            </button>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          celebrityName="Shemar VIP Voice Pass"
          amount={1000}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            setShowPaymentModal(false);
            currentUser.isVerified = true;
          }}
        />
      )}

      {/* Abuse Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Report AI Response</span>
            </h3>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl text-center font-bold">
                Report submitted successfully.
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Reason</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="harassment">Harassment or Abuse</option>
                    <option value="sexual">Inappropriate Content</option>
                    <option value="impersonation_claim">Impersonation Claim Violation</option>
                    <option value="private_info">Private Info Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Details</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide details about the issue..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white h-20"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl"
                  >
                    Submit Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
