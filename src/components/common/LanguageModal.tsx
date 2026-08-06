import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ALL_LANGUAGES_CATALOG, searchLanguages } from '../../i18n/languages';
import { LanguageOption } from '../../types';
import { VOICES_CATALOG, speakText, stopSpeech } from '../../services/voiceRegistry';
import {
  X,
  Search,
  Globe,
  Check,
  Volume2,
  Sparkles,
  MapPin,
  Flame,
  Languages as LangIcon,
} from 'lucide-react';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterCategory = 'all' | 'indian' | 'popular' | 'asia' | 'europe' | 'africa' | 'americas';

// Native sample greetings for audio test in each language
const GREETINGS: Record<string, string> = {
  hi: 'नमस्ते! VSA AI स्टुडियोमा तपाईंलाई स्वागत छ।',
  ne: 'नमस्ते! VSA AI मा तपाईंलाई स्वागत छ। म कसरी सहयोग गर्न सक्छु?',
  mai: 'प्रणाम! VSA AI मे अपनेक स्वागत अछि।',
  bho: 'प्रणाम! VSA AI में रउवा के स्वागत बा।',
  pa: 'ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! VSA AI ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ।',
  bn: 'নমস্কার! VSA AI-তে আপনাকে স্বাগতম।',
  te: 'నమస్కారం! VSA AI కి మీకు స్వాగతం.',
  mr: 'नमस्कार! VSA AI मध्ये आपले स्वागत आहे.',
  ta: 'வணக்கம்! VSA AI க்கு உங்களை வரவேற்கிறோம்.',
  gu: 'નમસ્તે! VSA AI માં આપનું સ્વાગત છે.',
  ur: 'خوش آمدید! آپ کا VSA AI میں خیر مقدم ہے۔',
  kn: 'ನಮಸ್ಕಾರ! VSA AI ಗೆ ಸುಸ್ವಾಗತ.',
  ml: 'നമസ്കാരം! VSA AI-ലേക്ക് സ്വാഗതം.',
  or: 'ନମସ୍କାର! VSA AI ରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ।',
  as: 'নমস্কাৰ! VSA AI লৈ আপোনাক স্বাগতম।',
  sa: 'नमो नमः! VSA AI भवतां स्वागतम्।',
  en: 'Hello! Welcome to VSA AI Studio. How can I assist you today?',
  es: '¡Hola! Bienvenido a VSA AI Studio. ¿En qué puedo ayudarte?',
  fr: 'Bonjour ! Bienvenue sur VSA AI Studio. Comment puis-je vous aider ?',
  de: 'Hallo! Willkommen bei VSA AI Studio. Wie kann ich Ihnen helfen?',
  zh: '你好！欢迎来到 VSA AI 智能工作室。',
  ja: 'こんにちは！VSA AIスタジオへようこそ。',
  ar: 'مرحباً بك في استوديو VSA للذكاء الاصطناعي.',
  ru: 'Здравствуйте! Добро пожаловать в VSA AI Studio.',
  pt: 'Olá! Bem-vindo ao VSA AI Studio.',
  it: 'Ciao! Benvenuto in VSA AI Studio.',
};

export const LanguageModal: React.FC<LanguageModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [playingCode, setPlayingCode] = useState<string | null>(null);

  const currentOption = useMemo(
    () => ALL_LANGUAGES_CATALOG.find((l) => l.code === language) || ALL_LANGUAGES_CATALOG[0],
    [language]
  );

  const filteredLanguages = useMemo(() => {
    let list = ALL_LANGUAGES_CATALOG;

    if (searchQuery.trim()) {
      list = searchLanguages(searchQuery);
    }

    if (selectedCategory === 'indian') {
      list = list.filter((l) => l.isIndian || l.code === 'ne');
    } else if (selectedCategory === 'popular') {
      const top = [
        'en',
        'hi',
        'ne',
        'mai',
        'bho',
        'pa',
        'bn',
        'te',
        'mr',
        'ta',
        'gu',
        'kn',
        'ml',
        'ur',
        'es',
        'fr',
        'de',
        'zh',
        'ja',
        'ar',
        'ru',
        'pt',
        'it',
        'id',
        'th',
        'vi',
      ];
      list = list.filter((l) => top.includes(l.code));
    } else if (selectedCategory === 'asia') {
      list = list.filter(
        (l) =>
          l.isIndian ||
          l.region?.toLowerCase().includes('asia') ||
          l.region?.toLowerCase().includes('china') ||
          l.region?.toLowerCase().includes('japan') ||
          l.region?.toLowerCase().includes('korea') ||
          l.region?.toLowerCase().includes('middle east') ||
          ['zh', 'ja', 'ko', 'ar', 'fa', 'he', 'vi', 'id', 'th', 'my', 'km', 'lo'].includes(l.code)
      );
    } else if (selectedCategory === 'europe') {
      list = list.filter(
        (l) =>
          l.region?.toLowerCase().includes('europe') ||
          l.region?.toLowerCase().includes('uk') ||
          l.region?.toLowerCase().includes('france') ||
          l.region?.toLowerCase().includes('germany') ||
          l.region?.toLowerCase().includes('spain') ||
          l.region?.toLowerCase().includes('italy') ||
          l.region?.toLowerCase().includes('russia') ||
          [
            'en-gb',
            'es',
            'fr',
            'de',
            'it',
            'ru',
            'uk',
            'pl',
            'nl',
            'sv',
            'no',
            'da',
            'fi',
            'el',
            'cs',
            'ro',
            'hu',
            'pt-pt',
          ].includes(l.code)
      );
    } else if (selectedCategory === 'africa') {
      list = list.filter(
        (l) =>
          l.region?.toLowerCase().includes('africa') ||
          ['sw', 'am', 'yo', 'ig', 'ha', 'so', 'zu', 'xh', 'af', 'rw', 'rn', 'lg', 'ny', 'wo', 'bm', 'ti', 'om'].includes(l.code)
      );
    } else if (selectedCategory === 'americas') {
      list = list.filter(
        (l) =>
          l.region?.toLowerCase().includes('america') ||
          l.region?.toLowerCase().includes('brazil') ||
          l.region?.toLowerCase().includes('hawaii') ||
          ['en', 'es', 'pt', 'haw'].includes(l.code)
      );
    }

    return list;
  }, [searchQuery, selectedCategory]);

  const handleSelect = (lang: LanguageOption) => {
    setLanguage(lang.code);
    onClose();
  };

  const handlePlayGreeting = (e: React.MouseEvent, lang: LanguageOption) => {
    e.stopPropagation();
    stopSpeech();

    const voice = VOICES_CATALOG[0]; // Default or saved voice
    const text =
      GREETINGS[lang.code] ||
      `Hello in ${lang.name}! Welcome to VSA AI Studio.`;

    setPlayingCode(lang.code);
    speakText(
      text,
      voice.id,
      () => setPlayingCode(lang.code),
      () => setPlayingCode(null),
      () => setPlayingCode(null)
    );
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-language-picker-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        id="modal-language-picker-container"
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-8 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t('lang.select', 'Select Language')}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {ALL_LANGUAGES_CATALOG.length}+ Languages Supported
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose your native language for AI interactions, PDF/Image tools, and voice personas.
              </p>
            </div>
          </div>

          <button
            id="btn-close-lang-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Language Strip */}
        <div className="px-5 sm:px-8 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Language:</span>
            <span className="text-base">{currentOption.flag}</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {currentOption.nativeName} ({currentOption.name})
            </span>
            {currentOption.region && (
              <span className="hidden sm:inline-block text-[11px] text-slate-400">
                • {currentOption.region}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Instant Live Switch
          </span>
        </div>

        {/* Search & Category Navigation */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/5 space-y-3 bg-slate-50/30 dark:bg-white/[0.01]">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              id="input-search-languages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language name, native script, country or ISO code (e.g. Nepali, Hindi, Español, Bengali, French)..."
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-xs"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'all', label: `All (${ALL_LANGUAGES_CATALOG.length})`, icon: Globe },
              { id: 'indian', label: '🇮🇳 Indian & Nepali (35+)', icon: Sparkles },
              { id: 'popular', label: '🔥 Most Popular (25)', icon: Flame },
              { id: 'asia', label: '🌏 Asia & Middle East', icon: MapPin },
              { id: 'europe', label: '🇪🇺 Europe', icon: MapPin },
              { id: 'africa', label: '🌍 Africa', icon: MapPin },
              { id: 'americas', label: '🌎 Americas', icon: MapPin },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`btn-lang-cat-${tab.id}`}
                  onClick={() => setSelectedCategory(tab.id as FilterCategory)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all text-xs ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-h-[55vh]">
          {filteredLanguages.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <LangIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No languages found matching "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredLanguages.map((lang) => {
                const isSelected = language === lang.code;
                const isPlaying = playingCode === lang.code;

                return (
                  <div
                    key={lang.code}
                    id={`card-lang-${lang.code}`}
                    onClick={() => handleSelect(lang)}
                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-md'
                        : 'bg-white dark:bg-[#18181c] border-slate-200/80 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        {lang.flag}
                      </span>
                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate ${
                              isSelected
                                ? 'text-indigo-600 dark:text-indigo-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {lang.nativeName}
                          </span>
                          {lang.isIndian && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                              IN
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                          {lang.name}
                        </span>
                        {lang.region && (
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate">
                            {lang.region}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Audio Greeting preview button */}
                      <button
                        type="button"
                        id={`btn-listen-${lang.code}`}
                        title={`Listen to greeting in ${lang.name}`}
                        onClick={(e) => handlePlayGreeting(e, lang)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isPlaying
                            ? 'bg-indigo-600 text-white animate-bounce'
                            : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-slate-300 dark:border-white/10 group-hover:border-indigo-400 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Check className="w-3 h-3 text-indigo-500" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & stats */}
        <div className="px-5 sm:px-8 py-3.5 border-t border-slate-100 dark:border-white/10 bg-slate-50/80 dark:bg-[#0e0e11] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Showing {filteredLanguages.length} of {ALL_LANGUAGES_CATALOG.length} Languages
            </span>
            <span className="hidden sm:inline">• UTF-8 Native Scripts Supported</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLanguage('en');
                onClose();
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Reset to English (US)
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
