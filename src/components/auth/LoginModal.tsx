import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { VsaEmblem } from '../common/VsaLogo';
import { X, Mail, Phone, Lock, Eye, EyeOff, Sparkles, Shield, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
  onOpenForgotPassword: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onOpenSignup,
  onOpenForgotPassword,
}) => {
  const { login, quickDemoLogin } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError(t('auth.identifierPlaceholder', 'Please enter email/mobile and password'));
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(identifier.trim(), password);
    setLoading(false);

    if (result.success) {
      showToast('success', 'Logged in successfully', `Welcome back!`);
      onClose();
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  const handleDemo = async (role: 'admin' | 'user') => {
    setLoading(true);
    await quickDemoLogin(role);
    setLoading(false);
    showToast('success', `${role === 'admin' ? 'Admin' : 'Demo User'} session active`);
    onClose();
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <motion.div
        id="login-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white dark:bg-[#121216] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/10 px-6 py-5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VsaEmblem className="w-9 h-9 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">VSA AI</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('auth.loginSubtitle')}</p>
              </div>
            </div>
            <button
              id="btn-close-login"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.identifier')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('auth.identifierPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('auth.password')}
                </label>
                <button
                  type="button"
                  id="btn-forgot-password-link"
                  onClick={() => {
                    onClose();
                    onOpenForgotPassword();
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {t('auth.forgotPassword')}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.signInBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for easy testing */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              id="btn-demo-user-login"
              onClick={() => handleDemo('user')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 dark:bg-white/[0.04] hover:bg-indigo-50 dark:hover:bg-indigo-600/10 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-medium border border-slate-200 dark:border-white/10 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
              <span>Explore Demo Account</span>
            </button>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('auth.noAccount')}{' '}
              <button
                type="button"
                id="btn-switch-to-signup"
                onClick={() => {
                  onClose();
                  onOpenSignup();
                }}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('auth.signupLink')}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
