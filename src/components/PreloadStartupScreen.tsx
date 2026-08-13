import React, { useState, useEffect } from 'react';

interface PreloadStartupScreenProps {
  onComplete: () => void;
}

export const PreloadStartupScreen: React.FC<PreloadStartupScreenProps> = ({ onComplete }) => {
  const [stageText, setStageText] = useState('Loading securely...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if app shell is already cached or previously loaded
    const isCached = sessionStorage.getItem('shemar_app_cached') === 'true';
    const durationMultiplier = isCached ? 0.3 : 1.0;

    const stages = [
      { text: 'Initializing App Shell...', ms: 100 * durationMultiplier, prog: 20 },
      { text: 'Loading Authentication State...', ms: 250 * durationMultiplier, prog: 45 },
      { text: 'Loading User Profile & Tier...', ms: 400 * durationMultiplier, prog: 70 },
      { text: 'Loading Critical Chat Data...', ms: 550 * durationMultiplier, prog: 90 },
      { text: 'Connecting Realtime Signaling...', ms: 700 * durationMultiplier, prog: 100 },
    ];

    const timeouts: NodeJS.Timeout[] = [];

    stages.forEach((stage) => {
      const t = setTimeout(() => {
        setStageText(stage.text);
        setProgress(stage.prog);
      }, stage.ms);
      timeouts.push(t);
    });

    const finalTimeout = setTimeout(() => {
      sessionStorage.setItem('shemar_app_cached', 'true');
      onComplete();
    }, 780 * durationMultiplier);

    timeouts.push(finalTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 z-50 select-none">
      <div className="max-w-xs w-full flex flex-col items-center justify-center text-center space-y-6">
        {/* Official Shemar Chat Icon */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-slate-900 to-slate-950 p-1 border border-emerald-500/40 shadow-2xl animate-pulse">
            <img
              src="/shemar-logo.png"
              alt="Shemar Chat"
              className="w-full h-full object-cover rounded-2xl shadow-lg"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-ping" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-widest uppercase">
            SHEMAR CHAT
          </h1>
          <p className="text-xs text-slate-400 font-medium">{stageText}</p>
        </div>

        {/* Animated Dots */}
        <div className="flex items-center gap-2 pt-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" />
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 border border-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
