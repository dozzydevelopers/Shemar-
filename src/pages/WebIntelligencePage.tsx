import React, { useState } from 'react';
import {
  Globe,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Newspaper,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Bookmark,
} from 'lucide-react';
import { WebIntelligenceResult, FactCheckResult, NewsIntelligenceResult } from '../types';

export const WebIntelligencePage: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'research' | 'fact_check' | 'news'>('research');
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WebIntelligenceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = {
    research: [
      'What are today\'s top trending celebrity entertainment stories?',
      'Who won the latest major European football / soccer matches today?',
      'What is happening in Shemar Moore\'s career and latest TV projects?',
    ],
    fact_check: [
      'Fact check: Did Shemar Moore announce a new Criminal Minds spinoff?',
      'Fact check: Is Sofia Vergara starring in a new Netflix series this month?',
      'Fact check: Did Michael B. Jordan confirm Creed 4 filming dates?',
    ],
    news: [
      'Latest breaking world news headlines today',
      'Today\'s box office numbers and entertainment news',
      'What are the latest tech developments in AI Studio and Gemini models?',
    ],
  };

  const handleExecute = async (overrideQuery?: string) => {
    const targetQuery = overrideQuery !== undefined ? overrideQuery : inputQuery;
    if (!targetQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const endpointMap = {
      research: '/api/ai/research',
      fact_check: '/api/ai/fact-check',
      news: '/api/ai/news',
    };

    const payloadKeyMap = {
      research: 'query',
      fact_check: 'claim',
      news: 'query',
    };

    try {
      const endpoint = endpointMap[activeMode];
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [payloadKeyMap[activeMode]]: targetQuery }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setResult(data.result);
      } else {
        setError(data.error || 'Web intelligence request failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to AI Web Research Agent.');
    } finally {
      setLoading(false);
    }
  };

  const renderVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'TRUE':
        return (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>VERDICT: TRUE</span>
          </span>
        );
      case 'FALSE':
        return (
          <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold text-xs flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>VERDICT: FALSE</span>
          </span>
        );
      case 'PARTIALLY_TRUE':
        return (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-bold text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>VERDICT: PARTIALLY TRUE</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full font-bold text-xs flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>VERDICT: UNVERIFIED</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-full overflow-y-auto">
      {/* Header Banner */}
      <div className="p-4 md:p-6 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Globe className="w-6 h-6 text-emerald-400" />
                <span>Web Intelligence AI Agent</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time internet search, claim verification, and news intelligence with source citations.
              </p>
            </div>

            <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold flex items-center gap-1.5 self-start">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Search Grounded</span>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'research', label: 'Web Research', icon: Globe },
              { id: 'fact_check', label: 'Fact Checker', icon: ShieldCheck },
              { id: 'news', label: 'Breaking News', icon: Newspaper },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveMode(tab.id as any);
                    setResult(null);
                    setError(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Bar Input */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 focus-within:border-emerald-500 transition-all shadow-xl">
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              placeholder={
                activeMode === 'fact_check'
                  ? 'Enter claim to fact check (e.g. "Did Shemar Moore release a new movie?")'
                  : activeMode === 'news'
                  ? 'Enter news topic (e.g. "European football results today")'
                  : 'Ask any real-time web research question...'
              }
              className="w-full bg-transparent border-none px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
            />

            <button
              disabled={loading || !inputQuery.trim()}
              onClick={() => handleExecute()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Research</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Prompt Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center mr-1">
              Suggestions:
            </span>
            {samplePrompts[activeMode].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(prompt);
                  handleExecute(prompt);
                }}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-full text-xs font-mono transition-all flex items-center gap-1 text-left"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[260px] sm:max-w-xs">{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Results Display */}
      <div className="max-w-5xl mx-auto w-full p-4 md:p-6 flex-1 space-y-6">
        {error && (
          <div className="bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-slate-200">Executing Gemini Web Grounding Agent...</h3>
              <p className="text-xs text-slate-400 mt-1">
                Searching real-time web index, verifying citations, and synthesizing intelligence report.
              </p>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Fact Check Card layout */}
            {result.mode === 'fact_check' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Claim Under Review
                    </span>
                    <h2 className="text-base font-bold text-white mt-1">"{result.claim}"</h2>
                  </div>
                  {renderVerdictBadge((result as FactCheckResult).verdict)}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Analysis & Explanation</p>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                    {(result as FactCheckResult).explanation}
                  </p>
                </div>
              </div>
            ) : (
              /* News / Research Intelligence Card */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" /> Real-time Synthesis •{' '}
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                  <h2 className="text-lg font-bold text-white mt-1">{(result as NewsIntelligenceResult).latestInformation}</h2>
                </div>

                {/* Key Bullet Point Updates */}
                {(result as NewsIntelligenceResult).keyUpdates?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Key Confirmed Updates</p>
                    <div className="space-y-2">
                      {(result as NewsIntelligenceResult).keyUpdates.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-200">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Breakdown */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Report</p>
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                    {(result as NewsIntelligenceResult).whatWeKnow}
                  </div>
                </div>
              </div>
            )}

            {/* Source Citations Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-indigo-400" />
                <span>Verified Web Sources ({result.sources.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {result.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all block group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1">
                      <span className="truncate max-w-[180px]">
                        {src.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <p className="font-bold text-xs text-slate-200 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                      {src.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center space-y-3 my-8">
            <Globe className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">Query the Web Research Agent</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Type any question, claim, or breaking news topic above to query Google Search Grounded intelligence.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
