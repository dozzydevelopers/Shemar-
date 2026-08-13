import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, Share, PlusSquare, ShieldCheck } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome / Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setShowBanner(false);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    });

    // If on iOS and not standalone, show banner option
    if (isIosDevice && !isStandaloneMode) {
      const iosDismissed = localStorage.getItem('shemar_ios_install_dismissed');
      if (!iosDismissed) {
        setShowBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosGuide(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    if (isIOS) {
      localStorage.setItem('shemar_ios_install_dismissed', 'true');
    }
  };

  if (isStandalone) {
    return null; // Already running as installed PWA
  }

  return (
    <>
      {/* Installation Success Toast */}
      {installedSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-100" />
          <span className="text-sm font-semibold">Shemar Chat installed successfully! Launching app mode...</span>
        </div>
      )}

      {/* Main PWA Install Floating Banner */}
      {showBanner && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 p-4 rounded-2xl shadow-2xl text-slate-100 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-lg flex-shrink-0">
                <img src="/pwa-192x192.png" alt="Shemar Logo" className="w-full h-full object-cover rounded-[10px]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Install Shemar App
                  <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                </h4>
                <p className="text-xs text-slate-400">
                  {isIOS
                    ? 'Add to iPhone Home Screen for full-screen VIP chat & push alerts.'
                    : 'Install directly on Android / PC for native app speed and offline access.'}
                </p>
              </div>
            </div>
            <button
              onClick={dismissBanner}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Close install prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isIOS ? (
                <>
                  <Share className="w-4 h-4" />
                  Add to Home Screen
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Install Application
                </>
              )}
            </button>
            <button
              onClick={dismissBanner}
              className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Step-By-Step Installation Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-slate-100 flex flex-col gap-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Follow these two quick steps in Safari to install <strong className="text-emerald-400">Shemar Chat</strong> directly onto your iOS Home Screen:
            </p>

            <div className="space-y-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  Tap the <strong className="text-white">Share</strong> button at the bottom or top of Safari:
                  <span className="inline-flex items-center gap-1 mx-1 bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-semibold">
                    <Share className="w-3.5 h-3.5 inline" /> Share
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  Scroll down and select <strong className="text-white">Add to Home Screen</strong>:
                  <span className="inline-flex items-center gap-1 mx-1 bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-semibold">
                    <PlusSquare className="w-3.5 h-3.5 inline" /> Add to Home Screen
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
