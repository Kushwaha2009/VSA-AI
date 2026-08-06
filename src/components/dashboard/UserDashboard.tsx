import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { SECURITY_QUESTIONS } from '../../i18n/translations';
import { ActivityLog, LanguageCode, ThemeMode } from '../../types';
import {
  User,
  Shield,
  KeyRound,
  Sliders,
  History,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Download,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  Video,
  MessageSquare,
  Clock,
  ArrowUpRight,
  Save,
  Volume2,
  Bot,
  FileCode2,
  FileSpreadsheet,
} from 'lucide-react';
import { motion } from 'motion/react';
import { VoiceSettings } from './VoiceSettings';
import { LanguageModal } from '../common/LanguageModal';
import { AiInteractionHistoryExport } from './AiInteractionHistoryExport';
import { WeeklyAiInteractionsChart } from './WeeklyAiInteractionsChart';

interface UserDashboardProps {
  onOpenLogin: () => void;
  onNavigateToTab?: (tab: 'chat' | 'pdf' | 'image' | 'video' | 'dashboard' | 'admin') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onOpenLogin, onNavigateToTab }) => {
  const { user, isAuthenticated, updateProfile, changePassword } = useAuth();
  const { language, setLanguage, languages, currentLanguageOption, t } = useLanguage();
  const { mode, setMode, accent, setAccent, isDark } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'ai-history' | 'profile' | 'voice' | 'security' | 'preferences' | 'activity'>('overview');


  // Edit profile state
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [bio, setBio] = useState('AI enthusiast & multimedia creator using VSA AI Studio.');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [secQuestion, setSecQuestion] = useState(user?.securityQuestion || SECURITY_QUESTIONS[0]);
  const [secAnswer, setSecAnswer] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Activity logs state
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('all');

  // Preferences language filter state
  const [langSearch, setLangSearch] = useState('');
  const [langRegionFilter, setLangRegionFilter] = useState<'all' | 'indian' | 'global'>('all');
  const [langModalOpen, setLangModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setMobile(user.mobile);
      if (user.securityQuestion) setSecQuestion(user.securityQuestion);
      if (user.avatar) setAvatar(user.avatar);
    }
  }, [user]);

  // Fetch user activity logs from API
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/activity')
        .then((res) => res.json())
        .then((data) => {
          if (data.activities) {
            setActivities(data.activities);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, activeTab]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Sign In Required
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Please log in to view your user dashboard, profile settings, and activity history.
          </p>
        </div>
        <button
          id="btn-dashboard-sign-in"
          onClick={onOpenLogin}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('error', 'Name Required', 'Please enter your full name.');
      return;
    }

    const res = await updateProfile({
      name: name.trim(),
      mobile: mobile.trim(),
      avatar,
    });

    if (res.success) {
      showToast('success', 'Profile Updated', 'Your profile details have been saved.');
    } else {
      showToast('error', 'Update Failed', res.error);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast('error', 'Fields Required', 'Please enter your current password, new password, and confirmation.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToast('error', 'Mismatch', 'New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 8) {
      showToast('error', 'Weak Password', 'New password must be at least 8 characters long.');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    if (!hasLetter || !hasNumberOrSymbol) {
      showToast('error', 'Weak Password', 'New password must contain both letters and numbers/symbols.');
      return;
    }

    if (newPassword === currentPassword) {
      showToast('error', 'Password Reuse', 'New password cannot be the same as current password.');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword({
      currentPassword,
      newPassword,
      confirmPassword: confirmNewPassword,
      securityQuestion: secQuestion,
      securityAnswer: secAnswer || undefined,
    });
    setPasswordLoading(false);

    if (res.success) {
      showToast('success', 'Password Changed', res.message || 'Your security credentials were updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSecAnswer('');
    } else {
      showToast('error', 'Failed', res.error || 'Failed to update password.');
    }
  };

  // Filtered Activity Logs
  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.actionName.toLowerCase().includes(activitySearch.toLowerCase()) ||
      act.details?.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesFilter = activityFilter === 'all' || act.toolType === activityFilter;
    return matchesSearch && matchesFilter;
  });

  // Download Activity Logs as CSV
  const downloadActivityCSV = () => {
    let csv = 'Timestamp,Tool,Action,Status,Details\n';
    activities.forEach((act) => {
      csv += `"${act.timestamp}","${act.toolType}","${act.actionName}","${act.status}","${act.details || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VSA_Activity_Logs_${user.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Logs Exported', 'Downloaded activity log CSV.');
  };

  // Download Activity Logs as JSON
  const downloadActivityJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      totalRecords: activities.length,
      activities: activities,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VSA_Activity_Logs_${user.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Logs Exported', 'Downloaded activity log JSON.');
  };

  return (
    <div
      id="user-dashboard-workspace"
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in"
    >
      {/* Header Profile Ribbon */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-5 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 text-white font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-lg shrink-0">
            {avatar ? (
              <img src={avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight leading-none truncate">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-indigo-100 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" /> {user.email || 'No email'}
              </span>
              {user.mobile && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 shrink-0" /> {user.mobile}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto justify-end">
          <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-left sm:text-right">
            <span className="text-[10px] uppercase font-bold text-indigo-200 block">
              Account Status
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1 justify-start sm:justify-end">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Verified
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-1 overflow-x-auto">
        {[
          { id: 'overview', label: t('dashboard.overview'), icon: Sparkles },
          { id: 'ai-history', label: 'AI History & Export', icon: Bot, badge: 'JSON/CSV' },
          { id: 'profile', label: t('dashboard.profile'), icon: User },
          { id: 'voice', label: 'AI Voice Personas (20)', icon: Volume2 },
          { id: 'security', label: t('dashboard.security'), icon: Shield },
          { id: 'preferences', label: t('dashboard.preferences'), icon: Sliders },
          { id: 'activity', label: t('dashboard.activity'), icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-dashboard-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {(tab as any).badge && (
                <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-extrabold uppercase">
                  {(tab as any).badge}
                </span>
              )}
            </button>
          );
        })}
      </div>


      {/* ================= 1. OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('dashboard.stats.queries')}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {user.usage?.queriesCount || 42}
              </div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                Gemini Flash & Pro interactions
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('dashboard.stats.files')}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {user.usage?.filesProcessed || 18}
              </div>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                PDFs, Images & Videos converted
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {t('dashboard.stats.storage')}
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {user.usage?.storageUsed || '14.2 MB'}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Client sandbox cached data
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Security Tier
              </span>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Protected</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Security Question Configured
              </p>
            </div>
          </div>

          {/* Visual Charts Section: Weekly AI Interaction Counts & Breakdown (Recharts) */}
          <WeeklyAiInteractionsChart
            activities={activities}
            onNavigateToTab={onNavigateToTab}
            onNavigateToHistory={() => setActiveTab('ai-history')}
          />

          {/* AI Interaction History & Export Suite Highlight Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-indigo-900/10 via-slate-50 to-purple-900/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/40 border border-indigo-200/80 dark:border-indigo-800/40 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      AI Interaction History & Data Portability
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      JSON / CSV Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Download full conversation logs, user prompts, responses, and multimodal tool executions.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-overview-export-json"
                  onClick={() => setActiveTab('ai-history')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  <FileCode2 className="w-4 h-4" />
                  <span>Export JSON</span>
                </button>
                <button
                  id="btn-overview-export-csv"
                  onClick={() => setActiveTab('ai-history')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
                <button
                  id="btn-overview-explore-ai-history"
                  onClick={() => setActiveTab('ai-history')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs"
                >
                  <span>Explore History Archive</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Quick Shortcuts & Platform Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => onNavigateToTab ? onNavigateToTab('chat') : undefined}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-50/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      AI Assistant Chat
                    </span>
                    <span className="text-[10px] text-slate-400">Ask coding & translation</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigateToTab ? onNavigateToTab('pdf') : undefined}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-50/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      PDF Document Suite
                    </span>
                    <span className="text-[10px] text-slate-400">Merge, Sign, Lock, Split</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => onNavigateToTab ? onNavigateToTab('image') : undefined}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-50/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Image Enhancer
                    </span>
                    <span className="text-[10px] text-slate-400">Cutout, Resize, Compress</span>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. AI INTERACTION HISTORY & EXPORT ================= */}
      {activeTab === 'ai-history' && (
        <AiInteractionHistoryExport
          onNavigateToChat={() => (onNavigateToTab ? onNavigateToTab('chat') : undefined)}
        />
      )}

      {/* ================= 2. PROFILE EDIT ================= */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('dashboard.editProfile')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your personal display information and contact channels.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Bio / Status
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <button
              id="btn-save-profile"
              type="submit"
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{t('dashboard.saveChanges')}</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= 3. VOICE PERSONA SETTINGS (10 VOICES) ================= */}
      {activeTab === 'voice' && (
        <div className="max-w-3xl space-y-6">
          <VoiceSettings />
        </div>
      )}

      {/* ================= 4. SECURITY & PASSWORD ================= */}
      {activeTab === 'security' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {t('dashboard.changePassword')} & Security Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your password and recovery security questions safely (No OTP required).
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Current Password *
              </label>
              <input
                id="input-change-current-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter existing password"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password *
                </label>
                <input
                  id="input-change-new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars (letters & numbers/symbols)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  id="input-change-confirm-pass"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Update Security Recovery Question (Optional)
              </label>
              <select
                value={secQuestion}
                onChange={(e) => setSecQuestion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 mb-2"
              >
                {SECURITY_QUESTIONS.map((q, idx) => (
                  <option key={idx} value={q}>
                    {q}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={secAnswer}
                onChange={(e) => setSecAnswer(e.target.value)}
                placeholder="New secret answer (leave blank to keep current)"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              id="btn-submit-change-password"
              type="submit"
              disabled={passwordLoading}
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {passwordLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Update Password & Security</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ================= 5. PREFERENCES (THEME, LANGUAGE & AI VOICE) ================= */}
      {activeTab === 'preferences' && (
        <div className="max-w-3xl space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Appearance & Localization Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your interface theme and native Indian language.
              </p>
            </div>

            {/* Theme Mode */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t('dashboard.theme')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { mode: 'light' as ThemeMode, label: t('theme.light'), icon: Sun },
                  { mode: 'dark' as ThemeMode, label: t('theme.dark'), icon: Moon },
                  { mode: 'system' as ThemeMode, label: t('theme.system'), icon: Sliders },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode === item.mode;
                  return (
                    <button
                      key={item.mode}
                      id={`btn-pref-theme-${item.mode}`}
                      onClick={() => setMode(item.mode)}
                      className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Selection (100+ Languages) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('dashboard.language')} ({languages.length} Available)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Supports all Indian scheduled languages, Nepali, and popular global languages.
                  </p>
                </div>

                {/* Region Filter Chips & Full Explorer Button */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: `All (${languages.length})` },
                    { id: 'indian', label: '🇮🇳 Indian & Nepali (35+)' },
                    { id: 'global', label: '🌐 Global Popular' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setLangRegionFilter(filter.id as any)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        langRegionFilter === filter.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    id="btn-open-lang-modal-from-dash"
                    onClick={() => setLangModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Full Explorer & Voice Test</span>
                  </button>
                </div>
              </div>

              {/* Language Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                  placeholder="Search language by name or native script (e.g., Nepali, Hindi, Maithili, Spanish, Punjabi)..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {languages
                  .filter((lang) => {
                    const matchesSearch =
                      lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                      lang.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
                      lang.code.toLowerCase().includes(langSearch.toLowerCase());
                    const matchesRegion =
                      langRegionFilter === 'all' ||
                      (langRegionFilter === 'indian' && (lang.isIndian || lang.code === 'ne')) ||
                      (langRegionFilter === 'global' && !lang.isIndian && lang.code !== 'ne');
                    return matchesSearch && matchesRegion;
                  })
                  .map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        id={`btn-pref-lang-${lang.code}`}
                        onClick={() => {
                          setLanguage(lang.code as LanguageCode);
                          showToast('success', 'Language Changed', `Switched to ${lang.nativeName} (${lang.name})`);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{lang.flag}</span>
                          <div className="min-w-0 truncate">
                            <span className="text-xs block leading-tight font-semibold truncate">
                              {lang.nativeName}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {lang.name} {lang.isIndian ? '• Indian' : ''}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* AI Voice Persona Settings Component inside Preferences */}
          <VoiceSettings />
        </div>
      )}


      {/* ================= 5. ACTIVITY HISTORY ================= */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('dashboard.activity')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit trail of all AI chats, document processing, and media tool interactions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-export-activity-json"
                onClick={downloadActivityJSON}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 transition-colors"
                title="Download raw activity log records in JSON format"
              >
                <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export JSON</span>
              </button>
              <button
                id="btn-export-activity-csv"
                onClick={downloadActivityCSV}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
                title="Download activity log records in CSV format"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                <span>Export CSV</span>
              </button>
              <button
                id="btn-switch-to-ai-history-export"
                onClick={() => setActiveTab('ai-history')}
                className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                <span>AI Transcripts & Prompts Exporter</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search activity records..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold"
            >
              <option value="all">All Tools</option>
              <option value="ai-chat">AI Chat</option>
              <option value="pdf-tool">PDF Tool</option>
              <option value="image-tool">Image Tool</option>
              <option value="video-tool">Video Tool</option>
              <option value="auth">Authentication</option>
            </select>
          </div>

          {/* Activity Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-2">Action / Tool</th>
                  <th className="pb-3 px-2">Details</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No activity records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-2 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                        <span>{act.actionName}</span>
                      </td>
                      <td className="py-3 px-2 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {act.details || '-'}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            act.status === 'success'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {act.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(act.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LanguageModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />
    </div>
  );
};
