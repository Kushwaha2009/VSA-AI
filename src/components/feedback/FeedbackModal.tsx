import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { FeedbackCategory, FeedbackSeverity, FeedbackType } from '../../types';
import {
  X,
  Bug,
  Lightbulb,
  MessageSquareHeart,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Monitor,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: FeedbackType;
  defaultCategory?: FeedbackCategory;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'bug',
  defaultCategory = 'general' as FeedbackCategory,
}) => {
  const { user, token, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [feedbackType, setFeedbackType] = useState<FeedbackType>(defaultType);
  const [category, setCategory] = useState<FeedbackCategory>(defaultCategory);
  const [severity, setSeverity] = useState<FeedbackSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showSystemInfo, setShowSystemInfo] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState('');

  // Auto-fill user info if authenticated
  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserEmail(user.email || '');
    }
  }, [user]);

  // Set default type whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFeedbackType(defaultType);
      setCategory(defaultCategory);
      setIsSubmitted(false);
      setSubmittedTicketId('');
    }
  }, [isOpen, defaultType, defaultCategory]);

  // Gather browser/environment diagnostics
  const systemDiagnostics = {
    browser: navigator.userAgent.includes('Chrome')
      ? 'Google Chrome / Chromium'
      : navigator.userAgent.includes('Firefox')
      ? 'Mozilla Firefox'
      : navigator.userAgent.includes('Safari')
      ? 'Apple Safari'
      : 'Web Browser',
    os: navigator.platform || 'Unknown OS',
    screenResolution: `${window.innerWidth}x${window.innerHeight} (Device Pixel Ratio: ${window.devicePixelRatio || 1})`,
    language: language.toUpperCase(),
    currentUrl: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast('warning', 'Title Required', 'Please enter a brief summary of the issue or idea.');
      return;
    }

    if (!description.trim()) {
      showToast('warning', 'Description Required', 'Please provide some details.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: feedbackType,
        title: title.trim(),
        description: description.trim(),
        category,
        severity: feedbackType === 'bug' ? severity : undefined,
        stepsToReproduce: feedbackType === 'bug' && stepsToReproduce ? stepsToReproduce.trim() : undefined,
        expectedBehavior: feedbackType === 'bug' && expectedBehavior ? expectedBehavior.trim() : undefined,
        userName: userName.trim() || (user ? user.name : 'Anonymous User'),
        userEmail: userEmail.trim() || (user ? user.email : 'guest@vsa.ai'),
        systemInfo: systemDiagnostics,
      };

      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback');
      }

      setSubmittedTicketId(data.ticketId || `fb_${Date.now().toString(36)}`);
      setIsSubmitted(true);
      showToast(
        'success',
        feedbackType === 'bug' ? 'Issue Logged' : 'Feedback Received',
        'Your report was sent directly to the administrative system logs.'
      );

      // Reset form fields
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setExpectedBehavior('');
    } catch (err: any) {
      showToast('error', 'Submission Failed', err.message || 'Could not send report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setSubmittedTicketId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="feedback-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={handleResetAndClose}
    >
      <div
        id="feedback-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                feedbackType === 'bug'
                  ? 'bg-rose-500/10 text-rose-500'
                  : feedbackType === 'feature'
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'bg-indigo-500/10 text-indigo-500'
              }`}
            >
              {feedbackType === 'bug' ? (
                <Bug className="w-4 h-4" />
              ) : feedbackType === 'feature' ? (
                <Lightbulb className="w-4 h-4" />
              ) : (
                <MessageSquareHeart className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {feedbackType === 'bug'
                  ? 'Report an Issue / Bug'
                  : feedbackType === 'feature'
                  ? 'Suggest a Feature'
                  : 'Share Your Feedback'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Directly feeds into Admin system audit logs & engineer queues
              </p>
            </div>
          </div>

          <button
            id="btn-close-feedback-modal"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Report Successfully Sent to Admin Logs!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Thank you for helping us improve VSA AI Studio. Your submission has been securely written into our live administrative audit stream.
                </p>
              </div>

              {submittedTicketId && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400">Ticket ID:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{submittedTicketId}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  id="btn-feedback-done"
                  onClick={handleResetAndClose}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Done & Return
                </button>
                <button
                  id="btn-feedback-another"
                  onClick={() => setIsSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
                >
                  Submit Another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher Pills */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Feedback Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    id="btn-type-bug"
                    onClick={() => setFeedbackType('bug')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      feedbackType === 'bug'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 ring-2 ring-rose-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>Bug Report</span>
                  </button>

                  <button
                    type="button"
                    id="btn-type-feature"
                    onClick={() => setFeedbackType('feature')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      feedbackType === 'feature'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 ring-2 ring-amber-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Feature Idea</span>
                  </button>

                  <button
                    type="button"
                    id="btn-type-feedback"
                    onClick={() => setFeedbackType('feedback')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      feedbackType === 'feedback'
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 ring-2 ring-indigo-500/20 shadow-sm'
                        : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <MessageSquareHeart className="w-3.5 h-3.5" />
                    <span>Feedback</span>
                  </button>
                </div>
              </div>

              {/* Module Category & Severity Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Feature / Module
                  </label>
                  <select
                    id="feedback-category-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value="ai-chat">AI Chat & Coding Assistant</option>
                    <option value="pdf">PDF Tools Suite</option>
                    <option value="image">Image Art & Editor</option>
                    <option value="video">Video Studio & Audio</option>
                    <option value="auth">Account & Security</option>
                    <option value="ui">User Interface & Layout</option>
                    <option value="performance">Speed & Performance</option>
                    <option value="general">Other / General</option>
                  </select>
                </div>

                {feedbackType === 'bug' ? (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Severity Level
                    </label>
                    <select
                      id="feedback-severity-select"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as FeedbackSeverity)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                    >
                      <option value="low">Low - Minor cosmetic / UI issue</option>
                      <option value="medium">Medium - Functional glitch with workaround</option>
                      <option value="high">High - Feature failure / unexpected error</option>
                      <option value="critical">Critical - Crash / blocker / data issue</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Priority / Value
                    </label>
                    <div className="h-[38px] px-3 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Directly reviewed by product team</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Summary / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="feedback-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? 'e.g. PDF split button throws memory alert on large document'
                      : feedbackType === 'feature'
                      ? 'e.g. Add dark mode toggle to PDF signature canvas'
                      : 'e.g. Really loved the Indian languages AI fluency!'
                  }
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="feedback-description-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    feedbackType === 'bug'
                      ? 'Describe what happened, what you were trying to do, and any error message you saw...'
                      : feedbackType === 'feature'
                      ? 'Explain the idea, how it would work, and why it would be helpful...'
                      : 'Share your thoughts, suggestions, or feedback...'
                  }
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
                />
              </div>

              {/* Bug-Specific: Steps to Reproduce (Collapsible / Optional) */}
              {feedbackType === 'bug' && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Steps to Reproduce (Optional)
                    </label>
                    <input
                      id="feedback-steps-input"
                      type="text"
                      value={stepsToReproduce}
                      onChange={(e) => setStepsToReproduce(e.target.value)}
                      placeholder="1. Upload file -> 2. Click Split -> 3. Error occurs"
                      className="w-full px-3.5 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information (Auto-populated or optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Your Name
                  </label>
                  <input
                    id="feedback-username-input"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    id="feedback-email-input"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              {/* Auto-Captured Environment Diagnostics Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  id="btn-toggle-diagnostics"
                  onClick={() => setShowSystemInfo(!showSystemInfo)}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
                >
                  <Monitor className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Auto-Captured Environment Diagnostics</span>
                  {showSystemInfo ? (
                    <ChevronUp className="w-3 h-3 ml-auto" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-auto" />
                  )}
                </button>

                {showSystemInfo && (
                  <div className="mt-2 p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-mono text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
                    <div>Browser: <span className="text-slate-900 dark:text-slate-200">{systemDiagnostics.browser}</span></div>
                    <div>Screen: <span className="text-slate-900 dark:text-slate-200">{systemDiagnostics.screenResolution}</span></div>
                    <div>Active Language: <span className="text-slate-900 dark:text-slate-200">{systemDiagnostics.language}</span></div>
                    <div>Platform: <span className="text-slate-900 dark:text-slate-200">{systemDiagnostics.os}</span></div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="btn-cancel-feedback"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  id="btn-submit-feedback-final"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Logging to Admin Stream...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Admin Logs</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
