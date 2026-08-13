import React, { useState } from 'react';
import { Star, MessageSquare, ShieldCheck, Users, Search, CheckCircle2, Radio, Sparkles } from 'lucide-react';
import { Celebrity, User } from '../types';

interface DiscoverPageProps {
  celebrities: Celebrity[];
  currentUser: User;
  onStartChat: (celebrityId: string) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ celebrities, currentUser, onStartChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'featured' | 'popular' | 'online' | 'recent'>('featured');

  // Filter celebrities made public by Admin
  const publicCelebrities = celebrities.filter((c) => c.status === 'active');

  const filteredCelebrities = publicCelebrities.filter((c) => {
    const matchesQuery =
      c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bio.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesQuery) return false;

    if (activeCategory === 'online') {
      return true; // All online
    }
    return true;
  });

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 flex flex-col h-full overflow-y-auto p-4 md:p-6 space-y-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-emerald-400" />
                <span>Discover Verified Celebrities</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Explore official celebrity profiles on Shemar Chat. Subscribe to direct messaging feeds and access VIP voice & video sessions.
              </p>
            </div>

            <div className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold flex items-center gap-2 self-start shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Official VIP Network</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-xl">
            <Search className="w-4.5 h-4.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search celebrities by name or handle..."
              className="w-full h-12 bg-slate-950/90 border border-slate-800 rounded-2xl pl-11 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
          </div>

          {/* Filter Categories */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
            {[
              { id: 'featured', label: 'Featured' },
              { id: 'popular', label: 'Popular' },
              { id: 'online', label: 'Online Now' },
              { id: 'recent', label: 'Recently Added' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Celebrity Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCelebrities.map((celeb) => (
            <div
              key={celeb.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl transition-all group"
            >
              {/* Cover Photo Banner */}
              <div className="h-28 bg-gradient-to-r from-emerald-900 via-slate-800 to-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              {/* Profile Card Body */}
              <div className="px-5 pb-5 pt-0 -mt-10 relative z-10 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <img
                      src={celeb.avatar}
                      alt={celeb.displayName}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-slate-900 ring-2 ring-emerald-500/40 shadow-xl shrink-0"
                    />
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="font-bold text-slate-200">{celeb.fanCount.toLocaleString()}</span>
                      <span>Fans</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-1.5 group-hover:text-emerald-400 transition-colors">
                      <span>{celeb.displayName}</span>
                      <CheckCircle2 className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                    </h3>
                    <p className="text-xs font-mono text-emerald-400">@{celeb.username}</p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 bg-slate-950 p-3 rounded-2xl border border-slate-800/80 leading-relaxed font-sans">
                    {celeb.bio}
                  </p>
                </div>

                <button
                  onClick={() => onStartChat(celeb.id)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat with {celeb.displayName.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
