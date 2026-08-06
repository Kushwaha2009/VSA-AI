import React, { useState, useEffect } from 'react';
import { pwaManager } from '../../services/pwaService';
import { useToast } from '../../context/ToastContext';
import { VsaEmblem } from '../common/VsaLogo';
import {
  Download,
  Smartphone,
  Monitor,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PwaInstallBannerProps {
  onDismiss?: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onDismiss }) => {
  const { showToast } = useToast();
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('vsa_pwa_banner_dismissed') === 'true';
  });

  useEffect(() => {
    const updateState = () => {
      setIsStandalone(pwaManager.isStandalone());
      setIsIOS(pwaManager.isIOS());
    };
    updateState();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches || pwaManager.isStandalone());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    const unsubscribe = pwaManager.subscribe((installable) => {
      setCanInstall(installable);
    });

    return () => {
      unsubscribe();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  // Do not show banner if already installed as standalone PWA or manually dismissed
  if (isStandalone || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (canInstall) {
      const outcome = await pwaManager.promptInstall();
      if (outcome === 'accepted') {
        showToast('success', 'Installing VSA AI', 'Thank you for installing VSA AI on your device!');
        setIsDismissed(true);
      }
    } else {
      // Fallback instructions modal or toast
      showToast('info', 'Install VSA AI App', 'Use your browser menu (⋮ or Share) and select "Install App" or "Add to Home Screen".');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('vsa_pwa_banner_dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  return (
    <>
      {/* Floating Bottom-Right Banner */}
      <div
        id="pwa-install-banner"
        className="fixed bottom-4 right-4 z-40 max-w-sm w-[calc(100vw-2rem)] p-4 rounded-2xl bg-white/95 dark:bg-[#121216]/95 backdrop-blur-xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 animate-fade-in transition-all"
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          aria-label="Close install banner"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-white/5 border border-indigo-500/30 p-1 shrink-0 flex items-center justify-center shadow-md">
            <VsaEmblem className="w-9 h-9" idPrefix="pwa-banner-emblem" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Native Experience</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Install VSA AI App
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Instant access, faster performance, offline tools, and full screen workspace on your device.
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" /> Fast
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure
            </span>
          </div>

          <button
            id="btn-trigger-pwa-install"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Now</span>
          </button>
        </div>
      </div>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Install on iOS (Safari)</h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button in Safari's bottom toolbar (<Share className="w-3.5 h-3.5 inline text-indigo-500" />).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  Scroll down and select <strong className="text-slate-900 dark:text-white">"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-indigo-500" />).
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  Tap <strong className="text-slate-900 dark:text-white">"Add"</strong> in the top right corner. VSA AI is now ready on your home screen!
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-md"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
