import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MessageSquare,
  Users,
  Star,
  FileText,
  Calendar,
  CheckCircle2,
  Paperclip,
  X,
  History,
  ArrowRight,
  Filter,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  User,
  Celebrity,
  SearchCategoryFilter,
  SearchQueryOptions,
  SearchResultItem,
  SearchResponse,
} from '../types';

interface GlobalSearchPageProps {
  currentUser: User;
  celebrities: Celebrity[];
  onOpenConversation: (conversationId: string) => void;
  onSelectCelebrityProfile?: (celebrityId: string) => void;
}

const RECENT_SEARCHES_KEY = 'shemar_chat_recent_searches';

export const GlobalSearchPage: React.FC<GlobalSearchPageProps> = ({
  currentUser,
  celebrities,
  onOpenConversation,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategoryFilter>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCelebrityId, setSelectedCelebrityId] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [hasAttachments, setHasAttachments] = useState(false);
  const [page, setPage] = useState(1);

  // State
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load recent search history from client storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Perform backend search call
  const performSearch = async (overrideQuery?: string, overridePage?: number) => {
    const activeQuery = overrideQuery !== undefined ? overrideQuery : query;
    const activePage = overridePage !== undefined ? overridePage : page;

    setLoading(true);
    try {
      const payload: SearchQueryOptions = {
        query: activeQuery,
        category,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        celebrityId: selectedCelebrityId || undefined,
        unreadOnly,
        hasAttachments,
        page: activePage,
        limit: 12,
      };

      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.status === 'success') {
        setSearchResults(data);
        setSuggestions(data.suggestions || []);
        if (activeQuery) saveRecentSearch(activeQuery);
      }
    } catch (err) {
      console.error('Search request failed', err);
    } finally {
      setLoading(false);
    }
  };

  // Execute debounced search when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, category, startDate, endDate, selectedCelebrityId, unreadOnly, hasAttachments]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    performSearch(query, newPage);
  };

  const getRoleScopeBadge = () => {
    if (currentUser.role === 'super_admin') {
      return { text: 'Super Admin: Platform-Wide Search', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
    }
    if (currentUser.role === 'celebrity') {
      return { text: 'Celebrity: Assigned Fans & Private Convs', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    }
    return { text: 'Fan: Own Convs & Public Celebrity Profiles', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  };

  const scopeBadge = getRoleScopeBadge();

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-full overflow-y-auto">
      {/* Search Header Banner */}
      <div className="p-4 md:p-6 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Search className="w-6 h-6 text-emerald-400" />
                <span>Global Search Index</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Search messages, celebrities, fans, dates, attachments and conversations with database-level isolation.
              </p>
            </div>

            <div className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 self-start ${scopeBadge.bg}`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{scopeBadge.text}</span>
            </div>
          </div>

          {/* Main Search Input Bar */}
          <div className="relative">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1.5 focus-within:border-emerald-500 transition-all shadow-xl">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5" />
              </div>

              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search conversations, messages, @usernames, files..."
                className="w-full bg-transparent border-none px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none"
              />

              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setSearchResults(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showAdvanced ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Suggestions & Search History Dropdown */}
            {showSuggestions && (query.length > 0 || recentSearches.length > 0) && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-30 space-y-3">
                {query && suggestions.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Instant Suggestions
                    </p>
                    <div className="space-y-1">
                      {suggestions.map((sugg, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(sugg);
                            setShowSuggestions(false);
                            performSearch(sugg, 1);
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-slate-800 text-xs text-slate-200 flex items-center justify-between font-mono"
                        >
                          <span className="truncate">{sugg}</span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <History className="w-3 h-3 text-indigo-400" /> Recent Searches
                      </p>
                      <button onClick={handleClearHistory} className="text-[10px] text-slate-400 hover:text-rose-400">
                        Clear History
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuery(term);
                            setShowSuggestions(false);
                            performSearch(term, 1);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-1"
                        >
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Primary Category Filters Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'all', label: 'All Results', icon: Filter },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'people', label: 'People', icon: Users },
              { id: 'celebrities', label: 'Celebrities', icon: Star },
              { id: 'conversations', label: 'Conversations', icon: FileText },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id as SearchCategoryFilter);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Advanced Filter Options Drawer */}
          {showAdvanced && (
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-4 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                <span>Advanced Query Parameters</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {/* Date Range Start */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Date Range End */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Celebrity Dropdown */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Celebrity</label>
                  <select
                    value={selectedCelebrityId}
                    onChange={(e) => setSelectedCelebrityId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200 outline-none focus:border-emerald-500"
                  >
                    <option value="">All Celebrities</option>
                    {celebrities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Checkbox Toggles */}
                <div className="flex flex-col justify-end gap-2 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={unreadOnly}
                      onChange={(e) => setUnreadOnly(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span>Unread Only</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasAttachments}
                      onChange={(e) => setHasAttachments(e.target.checked)}
                      className="accent-emerald-500 rounded"
                    />
                    <span>Has Attachments (📎)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-5xl mx-auto w-full p-4 md:p-6 space-y-4 flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold">Indexing Shemar Chat Database...</p>
          </div>
        ) : searchResults ? (
          <>
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
              <p>
                Found <span className="font-bold text-emerald-400">{searchResults.totalResults}</span> matching items
              </p>
              <p>
                Page {searchResults.page} of {searchResults.totalPages}
              </p>
            </div>

            {searchResults.results.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center space-y-3 my-6">
                <Search className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">No Matching Results Found</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Try adjusting your search query or clear active filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.results.map((item: SearchResultItem) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.conversationId) onOpenConversation(item.conversationId);
                    }}
                    className="bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl transition-all cursor-pointer flex items-start gap-3.5 group shadow-lg"
                  >
                    {item.avatar ? (
                      <img src={item.avatar} alt={item.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                        {item.title.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
                          {item.title}
                        </p>
                        {item.badge && (
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700 shrink-0 font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>

                      {item.snippet && (
                        <p className="text-xs text-slate-300 bg-slate-950 p-2 rounded-xl mt-2 border border-slate-800/80 line-clamp-2 font-sans">
                          "{item.snippet}"
                        </p>
                      )}

                      {item.timestamp && (
                        <span className="text-[10px] text-slate-500 mt-2 block">
                          {new Date(item.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {searchResults.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <span className="text-xs text-slate-400 font-mono">
                  Page {page} / {searchResults.totalPages}
                </span>

                <button
                  disabled={page >= searchResults.totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <Search className="w-12 h-12 mx-auto text-slate-700" />
            <p className="text-xs">Type a query above to search Shemar Chat index.</p>
          </div>
        )}
      </div>
    </div>
  );
};
