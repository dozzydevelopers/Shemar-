import React, { useState, useEffect } from 'react';
import {
  Mic,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Activity,
  UserCheck,
  Radio,
  Clock,
  Settings2,
} from 'lucide-react';
import { CelebrityPersonalityProfile, AIVoiceMetrics, AISafetyReport } from '../../types';
import { personalityEngine } from '../../ai/personality/personalityEngine';
import { aiVoiceService } from '../../services/aiVoiceService';
import { memoryStore } from '../../ai/memory/memoryStore';

export const AIVoiceAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'personality' | 'metrics' | 'safety' | 'sessions'>('personality');
  const [profile, setProfile] = useState<CelebrityPersonalityProfile>(
    personalityEngine.getProfile('shemar-moore')
  );
  const [metrics, setMetrics] = useState<AIVoiceMetrics>(aiVoiceService.getMetrics());
  const [reports, setReports] = useState<AISafetyReport[]>(aiVoiceService.getSafetyReports());
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Form Inputs
  const [greetingInput, setGreetingInput] = useState<string>('');
  const [ruleInput, setRuleInput] = useState<string>('');
  const [restrictedTopicInput, setRestrictedTopicInput] = useState<string>('');

  useEffect(() => {
    setMetrics(aiVoiceService.getMetrics());
  }, []);

  const handleSaveProfile = () => {
    personalityEngine.updateProfile('shemar-moore', profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddGreeting = () => {
    if (!greetingInput.trim()) return;
    setProfile((prev) => ({
      ...prev,
      preferred_greetings: [...prev.preferred_greetings, greetingInput.trim()],
    }));
    setGreetingInput('');
  };

  const handleAddRule = () => {
    if (!ruleInput.trim()) return;
    setProfile((prev) => ({
      ...prev,
      conversation_rules: [...prev.conversation_rules, ruleInput.trim()],
    }));
    setRuleInput('');
  };

  const handleAddRestrictedTopic = () => {
    if (!restrictedTopicInput.trim()) return;
    setProfile((prev) => ({
      ...prev,
      restricted_topics: [...prev.restricted_topics, restrictedTopicInput.trim()],
    }));
    setRestrictedTopicInput('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Mic className="w-6 h-6 text-emerald-400" />
            <span>AI Voice Call Engine Management</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure Shemar Moore authorized voice settings, AI personality profiles, safety guardrails, and voice call session telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('personality')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'personality'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Personality Profile
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'metrics'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'safety'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Safety Logs ({reports.length})
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>AI Personality & Voice Engine configuration updated successfully!</span>
        </div>
      )}

      {/* TAB 1: PERSONALITY PROFILE CONFIGURATION */}
      {activeTab === 'personality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Tone & Style */}
            <div className="space-y-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Tone & Communication Style</span>
              </h3>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tone Description</label>
                <input
                  type="text"
                  value={profile.tone}
                  onChange={(e) => setProfile({ ...profile, tone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Communication Style</label>
                <input
                  type="text"
                  value={profile.communication_style}
                  onChange={(e) => setProfile({ ...profile, communication_style: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Response Length</label>
                  <select
                    value={profile.response_length}
                    onChange={(e) =>
                      setProfile({ ...profile, response_length: e.target.value as any })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  >
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Humor Level</label>
                  <select
                    value={profile.humor_level}
                    onChange={(e) => setProfile({ ...profile, humor_level: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                  >
                    <option value="playful">Playful</option>
                    <option value="moderate">Moderate</option>
                    <option value="subtle">Subtle</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversation Rules */}
            <div className="space-y-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-400" />
                <span>Behavioral Rules & Licensing Guardrails</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {profile.conversation_rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-between"
                  >
                    <span>{rule}</span>
                    <button
                      onClick={() =>
                        setProfile({
                          ...profile,
                          conversation_rules: profile.conversation_rules.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-rose-400 hover:text-rose-300 font-bold ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                  placeholder="Add new conversation rule..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-white"
                />
                <button
                  onClick={handleAddRule}
                  className="px-3 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20"
            >
              Save AI Voice Profile
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: TELEMETRY & PERFORMANCE */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Active Live Voice Sessions</span>
            <p className="text-2xl font-black text-emerald-400">{metrics.activeSessions}</p>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Total Voice Calls</span>
            <p className="text-2xl font-black text-white">{metrics.totalVoiceSessions}</p>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Avg Audio Latency</span>
            <p className="text-2xl font-black text-sky-400">{metrics.avgResponseMs} ms</p>
          </div>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 font-semibold">Safety Events</span>
            <p className="text-2xl font-black text-rose-400">{metrics.safetyEvents}</p>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY REPORTS */}
      {activeTab === 'safety' && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No abuse or safety reports flagged for AI voice sessions.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-400 uppercase tracking-wide">
                    {report.reason}
                  </span>
                  <span className="text-slate-500">{new Date(report.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-slate-300">{report.details}</p>
                <div className="p-2 bg-slate-900 rounded-xl text-slate-400 italic">
                  "{report.transcriptSnippet}"
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
