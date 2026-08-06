import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { X, Mail, Phone, Lock, HelpCircle, ShieldCheck, KeyRound, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onOpenLogin,
}) => {
  const { forgotPasswordVerify, resetPassword } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [step, setStep] = useState<'IDENTIFY' | 'QUESTION' | 'NEW_PASSWORD' | 'SUCCESS'>('IDENTIFY');
  const [identifier, setIdentifier] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Step 1: Query security question for identifier
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await forgotPasswordVerify(identifier.trim());
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.securityQuestion) {
      setSecurityQuestion(res.securityQuestion);
      setStep('QUESTION');
    }
  };

  // Step 2: Answer security question
  const handleAnswerQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityAnswer.trim()) {
      setError('Please provide your secret security answer.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await forgotPasswordVerify(identifier.trim(), securityAnswer.trim());
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else if (res.resetToken) {
      setResetToken(res.resetToken);
      setStep('NEW_PASSWORD');
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      setError('Please enter and confirm your new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await resetPassword(resetToken, newPassword);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setStep('SUCCESS');
      showToast('success', 'Password Reset Successful', 'You can now sign in with your new password.');
    }
  };

  const handleResetFlow = () => {
    setStep('IDENTIFY');
    setIdentifier('');
    setSecurityQuestion('');
    setSecurityAnswer('');
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
    >
      <motion.div
        id="forgot-password-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Ribbon Header */}
        <div className="bg-gradient-to-r from-amber-600 to-indigo-600 px-6 py-5 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white shadow-inner">
                <KeyRound className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">{t('auth.forgotTitle')}</h3>
                <p className="text-xs text-amber-100/90">{t('auth.forgotSubtitle')}</p>
              </div>
            </div>
            <button
              id="btn-close-forgot"
              onClick={() => {
                handleResetFlow();
                onClose();
              }}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {step === 'IDENTIFY' && (
            <form onSubmit={handleIdentify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.identifier')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="input-forgot-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t('auth.identifierPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                  Enter the email or mobile number linked to your VSA AI account.
                </p>
              </div>

              <button
                id="btn-forgot-identify-next"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Next: Answer Security Question</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'QUESTION' && (
            <form onSubmit={handleAnswerQuestion} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 block mb-0.5">
                      Your Registered Security Question:
                    </span>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                      {securityQuestion}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.securityAnswer')} *
                </label>
                <input
                  id="input-forgot-security-answer"
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Enter your security answer exactly as registered"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('IDENTIFY')}
                  className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  id="btn-forgot-verify-answer"
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Answer</span>
                      <ShieldCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.newPassword')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="input-forgot-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t('auth.confirmNewPassword')} *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="input-forgot-confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                id="btn-forgot-submit-new-password"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('auth.resetPasswordBtn')}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Password Updated!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your credentials have been securely updated. You can now log in with your new password.
                </p>
              </div>
              <button
                type="button"
                id="btn-forgot-success-login"
                onClick={() => {
                  handleResetFlow();
                  onClose();
                  onOpenLogin();
                }}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
              >
                Go to Log In
              </button>
            </div>
          )}

          <div className="mt-5 text-center">
            <button
              type="button"
              id="btn-back-to-login"
              onClick={() => {
                handleResetFlow();
                onClose();
                onOpenLogin();
              }}
              className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Remember your password? Sign In
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
