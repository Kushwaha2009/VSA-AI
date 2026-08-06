import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { VsaEmblem } from '../common/VsaLogo';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { user, changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(user?.securityQuestion || '');
  const [securityAnswer, setSecurityAnswer] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password Strength Calculations
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const strengthScore = [hasMinLength, hasLetter, hasNumberOrSymbol, newPassword.length >= 12].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!newPassword) return '';
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore === 2) return 'Fair';
    if (strengthScore === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-rose-500 text-rose-500';
    if (strengthScore === 2) return 'bg-amber-500 text-amber-500';
    if (strengthScore === 3) return 'bg-blue-500 text-blue-500';
    return 'bg-emerald-500 text-emerald-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (!hasMinLength) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (!hasLetter || !hasNumberOrSymbol) {
      setError('New password must contain both letters and numbers or symbols.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password cannot be the same as your current password.');
      return;
    }

    setLoading(true);

    const res = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword,
      securityQuestion: securityQuestion.trim() || undefined,
      securityAnswer: securityAnswer.trim() || undefined,
    });

    setLoading(false);

    if (res.success) {
      showToast('success', 'Password Updated', res.message || 'Your password was changed successfully.');
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSecurityAnswer('');
      onClose();
    } else {
      setError(res.error || 'Failed to change password. Please check your credentials.');
    }
  };

  return (
    <div
      id="change-password-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <motion.div
        id="change-password-card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white dark:bg-[#121216] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
      >
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/10 px-6 py-5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Change Password
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your security credentials
                </p>
              </div>
            </div>
            <button
              id="btn-close-change-password"
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
            <div className="mb-4 p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current (Old) Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-current-password"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password <span className="text-rose-500">*</span>
                </label>
                {newPassword && (
                  <span className={`text-[11px] font-bold ${getStrengthColor().split(' ')[1]}`}>
                    {getStrengthLabel()}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters (letters & numbers/symbols)"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-new-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1.5">
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    <div className={`rounded-full ${strengthScore >= 1 ? getStrengthColor().split(' ')[0] : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`rounded-full ${strengthScore >= 2 ? getStrengthColor().split(' ')[0] : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`rounded-full ${strengthScore >= 3 ? getStrengthColor().split(' ')[0] : 'bg-slate-200 dark:bg-white/10'}`} />
                    <div className={`rounded-full ${strengthScore >= 4 ? getStrengthColor().split(' ')[0] : 'bg-slate-200 dark:bg-white/10'}`} />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className={hasMinLength ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
                      ✓ 8+ chars
                    </span>
                    <span className={hasLetter ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
                      ✓ Letters
                    </span>
                    <span className={hasNumberOrSymbol ? 'text-emerald-600 dark:text-emerald-400 font-medium' : ''}>
                      ✓ Numbers/Symbols
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  id="input-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-white/[0.04] border ${
                    confirmPassword && !passwordsMatch
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-200 dark:border-white/10 focus:border-indigo-500'
                  } rounded-lg text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none transition-all`}
                  required
                />
                <button
                  type="button"
                  id="btn-toggle-confirm-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && (
                <p className={`text-[11px] mt-1 ${passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Optional Security Recovery Update */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                <span>Security Recovery Question (Optional Update)</span>
              </label>
              <input
                id="input-change-sec-question"
                type="text"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                placeholder="e.g., What is your favorite childhood city?"
                className="w-full px-3.5 py-2 mb-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
              />
              {securityQuestion && (
                <input
                  id="input-change-sec-answer"
                  type="text"
                  value={securityAnswer}
                  onChange={(e) => setSecurityAnswer(e.target.value)}
                  placeholder="Answer to security question"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
              )}
            </div>

            <div className="pt-2">
              <button
                id="btn-submit-change-password"
                type="submit"
                disabled={loading || !hasMinLength || (confirmPassword.length > 0 && !passwordsMatch)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
