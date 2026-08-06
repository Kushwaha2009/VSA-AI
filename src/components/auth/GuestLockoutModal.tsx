import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { VsaEmblem } from '../common/VsaLogo';
import { Clock, LogIn, UserPlus, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface GuestLockoutModalProps {
  isOpen: boolean;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const GuestLockoutModal: React.FC<GuestLockoutModalProps> = ({
  isOpen,
  onOpenLogin,
  onOpenSignup,
}) => {
  const { quickDemoLogin } = useAuth();
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div
      id="guest-lockout-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fade-in"
    >
      <motion.div
        id="guest-lockout-card"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white dark:bg-[#121216] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden text-center"
      >
        {/* Decorative Top Gradient Accent */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600" />

        <div className="p-8 space-y-6">
          {/* Badge & Icon */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              <span>⏱️ Guest Mode Expired</span>
            </div>
          </div>

          {/* Heading & Information */}
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              2-Minute Guest Session Ended
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your free guest preview time has expired. Please log in or create a free account to unlock unlimited access without losing any of your current progress.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              id="btn-guest-expired-login"
              onClick={onOpenLogin}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group"
            >
              <LogIn className="w-4 h-4 text-white/80 group-hover:text-white" />
              <span>Log In to Continue</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              id="btn-guest-expired-signup"
              onClick={onOpenSignup}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs border border-slate-200 dark:border-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-indigo-500" />
              <span>Create Free Account (30s)</span>
            </button>

            <button
              id="btn-guest-expired-demo"
              onClick={() => quickDemoLogin('user')}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline transition-colors pt-1"
            >
              Explore instant demo account
            </button>
          </div>

          {/* Privacy & Guarantee note */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure 256-bit encryption • Zero data loss</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
