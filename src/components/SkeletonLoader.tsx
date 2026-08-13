import React from 'react';

interface SkeletonLoaderProps {
  type: 'chat_list' | 'chat_messages' | 'discover_grid' | 'notifications' | 'profile' | 'dashboard';
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  if (type === 'chat_list') {
    return (
      <div className="space-y-3 p-3 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800/60 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 bg-slate-800 rounded-md" />
                <div className="h-3 w-12 bg-slate-800/80 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chat_messages') {
    return (
      <div className="space-y-4 p-4 animate-pulse flex-1">
        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
          <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 w-52">
            <div className="h-3 bg-slate-800 rounded w-full" />
            <div className="h-3 bg-slate-800 rounded w-2/3" />
          </div>
        </div>

        <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
          <div className="space-y-2 bg-emerald-950/40 p-3.5 rounded-2xl rounded-tr-none border border-emerald-800/40 w-60">
            <div className="h-3 bg-emerald-800/40 rounded w-full" />
            <div className="h-3 bg-emerald-800/40 rounded w-4/5" />
          </div>
        </div>

        <div className="flex gap-3 max-w-[80%]">
          <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
          <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-2xl rounded-tl-none border border-slate-800 w-44">
            <div className="h-3 bg-slate-800 rounded w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'discover_grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-slate-800 rounded-md" />
                <div className="h-3 w-20 bg-slate-800/80 rounded" />
              </div>
            </div>
            <div className="h-3 w-full bg-slate-800/60 rounded" />
            <div className="h-9 w-full bg-slate-800 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'notifications') {
    return (
      <div className="space-y-3 p-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-48 bg-slate-800 rounded" />
              <div className="h-3 w-2/3 bg-slate-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-pulse max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-slate-800 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-5 w-40 bg-slate-800 rounded" />
          <div className="h-3 w-28 bg-slate-800/80 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-slate-900 border border-slate-800 rounded-2xl" />
        <div className="h-20 bg-slate-900 border border-slate-800 rounded-2xl" />
      </div>
    </div>
  );
};
