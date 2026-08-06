import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LanguageCode } from '../../types';
import { VsaLogo, VsaEmblem } from '../common/VsaLogo';
import {
  Sparkles,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  LayoutDashboard,
  Shield,
  Sun,
  Moon,
  Globe,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Settings,
  LogIn,
  UserPlus,
  Download,
  Smartphone,
  Bug,
  Lightbulb,
  Volume2,
  Info,
  Clock,
  KeyRound,
} from 'lucide-react';
import { pwaManager } from '../../services/pwaService';
import { useToast } from '../../context/ToastContext';
import { FeedbackModal } from '../feedback/FeedbackModal';
import { LanguageModal } from '../common/LanguageModal';
import { AboutModal } from '../common/AboutModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';

export type ActiveTab = 'chat' | 'pdf' | 'image' | 'video' | 'dashboard' | 'admin';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenSignup,
}) => {
  const { user, isAuthenticated, isAdmin, logout, guestSecondsRemaining } = useAuth();
  const { language, setLanguage, languages, currentLanguageOption, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [langFilter, setLangFilter] = useState<'all' | 'indian' | 'global'>('all');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackDefaultType, setFeedbackDefaultType] = useState<'bug' | 'feature' | 'feedback'>('bug');

  const formatGuestTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenAbout = () => setAboutModalOpen(true);
    window.addEventListener('vsa-open-about-modal', handleOpenAbout);

    const updateStandalone = () => {
      setIsStandalone(pwaManager.isStandalone());
    };
    updateStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches || pwaManager.isStandalone());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    const unsub = pwaManager.subscribe((installable) => {
      setCanInstall(installable);
    });

    return () => {
      window.removeEventListener('vsa-open-about-modal', handleOpenAbout);
      unsub();
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
    };
  }, []);

  const handleInstallApp = async () => {
    if (pwaManager.isIOS()) {
      showToast('info', 'Install on iOS', 'Tap Safari Share icon -> "Add to Home Screen" to install VSA AI.');
      return;
    }

    if (canInstall) {
      const res = await pwaManager.promptInstall();
      if (res === 'accepted') {
        showToast('success', 'Installing App', 'VSA AI is being installed to your device.');
      }
    } else {
      showToast('info', 'PWA App Install', 'Select "Install App" or "Add to Home Screen" from your browser settings menu.');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'chat', label: t('nav.chat'), icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'pdf', label: t('nav.pdf'), icon: <FileText className="w-4 h-4" /> },
    { id: 'image', label: t('nav.image'), icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'video', label: t('nav.video'), icon: <Video className="w-4 h-4" /> },
    { id: 'dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    ...(isAdmin
      ? [{ id: 'admin' as ActiveTab, label: t('nav.admin'), icon: <Shield className="w-4 h-4 text-amber-500" />, adminOnly: true }]
      : []),
  ];

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & System Status */}
          <div className="flex items-center gap-4">
            <button
              id="btn-brand-logo"
              onClick={() => setActiveTab('chat')}
              className="flex items-center group text-left transition-transform hover:opacity-95"
            >
              <VsaLogo
                variant="horizontal"
                size="sm"
                showTagline={true}
                className="group-hover:scale-[1.02] transition-transform"
              />
            </button>

            {/* Sleek Operational Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-400">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Status:</span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                Operational
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-[#111114] p-1 rounded-xl border border-slate-200/80 dark:border-white/10">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Multi-language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                id="btn-language-selector"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                title="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>{currentLanguageOption.nativeName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 opacity-60" />
              </button>

              {langDropdownOpen && (
                <div
                  id="dropdown-language-menu"
                  className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-[#121216] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-2.5 z-50 animate-fade-in space-y-2"
                >
                  <div className="px-3.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('lang.select')} ({languages.length})
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-500">
                      100+ Supported
                    </span>
                  </div>

                  {/* Search Input */}
                  <div className="px-3">
                    <input
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder="Search language or native name..."
                      className="w-full px-2.5 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Category Chips */}
                  <div className="px-3 flex items-center gap-1">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'indian', label: '🇮🇳 Indian + Nepali' },
                      { id: 'global', label: '🌐 Global' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setLangFilter(f.id as any)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                          langFilter === f.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Scrollable Language List */}
                  <div className="max-h-60 overflow-y-auto px-1 divide-y divide-slate-100/50 dark:divide-white/5">
                    {languages
                      .filter((lang) => {
                        const matchesSearch =
                          lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
                          lang.nativeName.toLowerCase().includes(langSearch.toLowerCase()) ||
                          lang.code.toLowerCase().includes(langSearch.toLowerCase());
                        const matchesFilter =
                          langFilter === 'all' ||
                          (langFilter === 'indian' && (lang.isIndian || lang.code === 'ne')) ||
                          (langFilter === 'global' && !lang.isIndian && lang.code !== 'ne');
                        return matchesSearch && matchesFilter;
                      })
                      .map((lang) => (
                        <button
                          key={lang.code}
                          id={`lang-option-${lang.code}`}
                          onClick={() => {
                            setLanguage(lang.code as LanguageCode);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            language === lang.code
                              ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className="text-sm shrink-0">{lang.flag}</span>
                            <span className="truncate">{lang.nativeName}</span>
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">{lang.name}</span>
                        </button>
                      ))}
                  </div>

                  {/* Open Full Language Explorer Modal Trigger */}
                  <div className="px-2 pt-1 border-t border-slate-100 dark:border-white/10">
                    <button
                      type="button"
                      id="btn-open-all-languages-modal"
                      onClick={() => {
                        setLangDropdownOpen(false);
                        setLangModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/20"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Browse All 145+ Languages & Voices</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* PWA Install Button (if not already running in standalone app) */}
            {!isStandalone && (
              <button
                id="btn-header-install-pwa"
                onClick={handleInstallApp}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                title="Install VSA AI as desktop or mobile app"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Dark/Light Theme Toggle */}
            <button
              id="btn-theme-toggle"
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg transition-colors"
              title={isDark ? t('theme.light') : t('theme.dark')}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* About / Developer Profile Button */}
            <button
              id="btn-header-about"
              onClick={() => setAboutModalOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg transition-colors"
              title="About VSA AI & Developer Info (विशाल कुमार)"
              aria-label="About VSA AI"
            >
              <Info className="w-4 h-4 text-indigo-500" />
            </button>

            {/* Authentication Buttons / User Profile */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userRef}>
                <button
                  id="btn-user-avatar-menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block leading-tight truncate max-w-[100px]">
                      {user.name.split(' ')[0]}
                    </span>
                    {(user.role === 'super_admin' || user.email?.toLowerCase() === 'vishalkumar20102009@gmail.com') ? (
                      <span className="text-[9px] font-extrabold uppercase text-amber-600 dark:text-amber-400 leading-none">
                        Super Admin
                      </span>
                    ) : user.role === 'admin' ? (
                      <span className="text-[9px] font-bold uppercase text-indigo-600 dark:text-indigo-400 leading-none">
                        Admin
                      </span>
                    ) : null}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="dropdown-user-menu"
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#121216] rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 py-2 z-50 animate-fade-in"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email || user.mobile}
                      </p>
                    </div>

                    <div className="py-1">
                      <button
                        id="menu-item-dashboard"
                        onClick={() => {
                          setActiveTab('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{t('nav.profile')} & Settings</span>
                      </button>

                      <button
                        id="menu-item-voice-settings"
                        onClick={() => {
                          setActiveTab('dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span>AI Voice Settings (20 Personas)</span>
                      </button>

                      <button
                        id="menu-item-change-password"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsChangePasswordOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Change Password</span>
                      </button>

                      {!isStandalone && (
                        <button
                          id="menu-item-install-pwa"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleInstallApp();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Install Desktop/Mobile App</span>
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          id="menu-item-admin"
                          onClick={() => {
                            setActiveTab('admin');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>{t('nav.admin')}</span>
                        </button>
                      )}

                      <button
                        id="menu-item-about"
                        onClick={() => {
                          setAboutModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Info className="w-3.5 h-3.5 text-indigo-500" />
                        <span>About VSA AI (विशाल कुमार)</span>
                      </button>

                      <button
                        id="menu-item-feedback"
                        onClick={() => {
                          setFeedbackDefaultType('bug');
                          setFeedbackModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                      >
                        <Bug className="w-3.5 h-3.5 text-rose-500" />
                        <span>Report Issue / Feedback</span>
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-white/10">
                      <button
                        id="menu-item-logout"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t('nav.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Guest Mode 2-Minute Timer Badge */}
                <button
                  id="btn-header-guest-badge"
                  onClick={onOpenLogin}
                  title="Guest Mode active (2 min limit). Click to log in and unlock full unlimited access."
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    guestSecondsRemaining <= 30
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 animate-pulse'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${guestSecondsRemaining <= 30 ? 'text-rose-500' : 'text-amber-500'}`} />
                  <span className="font-mono tracking-tight font-bold">{formatGuestTimer(guestSecondsRemaining)}</span>
                  <span className="hidden sm:inline text-[10px] font-medium opacity-80">(Guest)</span>
                </button>

                <button
                  id="btn-header-login"
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{t('nav.login')}</span>
                </button>
                <button
                  id="btn-header-signup"
                  onClick={onOpenSignup}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2e15e5] hover:bg-[#2e15e5]/90 text-white shadow-lg shadow-[#2e15e5]/20 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{t('nav.signup')}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-drawer"
            className="md:hidden py-3 border-t border-slate-200 dark:border-white/10 space-y-1 animate-fade-in"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              id="mobile-nav-about"
              onClick={() => {
                setMobileMenuOpen(false);
                setAboutModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-500/20 transition-all"
            >
              <Info className="w-4 h-4 text-indigo-500" />
              <span>About & Developer Profile (विशाल कुमार)</span>
            </button>

            {!isStandalone && (
              <button
                id="mobile-nav-install-pwa"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleInstallApp();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-500/20 transition-all"
              >
                <Download className="w-4 h-4 text-indigo-500" />
                <span>Install VSA AI App</span>
              </button>
            )}

            <button
              id="mobile-nav-lang-picker"
              onClick={() => {
                setMobileMenuOpen(false);
                setLangModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-all"
            >
              <span className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-indigo-500" />
                <span>Language / भाषा ({languages.length}+)</span>
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {currentLanguageOption.flag} {currentLanguageOption.nativeName}
              </span>
            </button>

            <button
              id="mobile-nav-feedback"
              onClick={() => {
                setMobileMenuOpen(false);
                setFeedbackDefaultType('bug');
                setFeedbackModalOpen(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-500/20 transition-all"
            >
              <Bug className="w-4 h-4 text-rose-500" />
              <span>Report an Issue / Share Feedback</span>
            </button>
          </div>
        )}
      </div>

      <LanguageModal
        isOpen={langModalOpen}
        onClose={() => setLangModalOpen(false)}
      />

      <FeedbackModal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        defaultType={feedbackDefaultType}
        defaultCategory="general"
      />

      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
};
