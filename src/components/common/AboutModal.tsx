import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  User,
  Sparkles,
  Cpu,
  Globe,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Heart,
  MessageSquare,
  Instagram,
  Terminal,
  Zap,
  Code2,
  Lock,
  Layers,
  HelpCircle,
  ArrowRight,
  Info,
} from 'lucide-react';
import { VsaLogo, VsaEmblem } from './VsaLogo';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChatWithPrompt?: (prompt: string) => void;
}

interface AboutData {
  developer: {
    name: string;
    nameEnglish?: string;
    role: string;
    roleHindi?: string;
    roleEnglish?: string;
    education?: string;
    educationHindi?: string;
    instagram: string;
    instagramUrl: string;
    attributionStatement: string;
    attributionStatementEn?: string;
    bio?: string;
    email?: string;
  };
  system: {
    appName: string;
    version: string;
    activeModel: string;
    activeModelDisplayName: string;
    languagesCount: number;
    voicePersonasCount: number;
    status: string;
  };
  attribution: string;
}

const DEFAULT_ABOUT_DATA: AboutData = {
  developer: {
    name: 'विशाल कुमार',
    nameEnglish: 'Vishal Kumar',
    role: 'Founder & Solo Developer',
    roleHindi: 'फाउंडर एवं सोलो डेवलपर',
    roleEnglish: 'Founder & Solo Developer',
    education: 'Class 12 Student',
    educationHindi: 'कक्षा 12 के छात्र',
    instagram: '@Kushwaha_2009',
    instagramUrl: 'https://instagram.com/Kushwaha_2009',
    attributionStatement: 'इस AI प्लेटफ़ॉर्म को विशाल कुमार ने डेवलप किया है। वे इस प्रोजेक्ट के Founder और Solo Developer हैं तथा वर्तमान में कक्षा 12 के छात्र हैं।\n\nInstagram: @Kushwaha_2009\n\nइस प्लेटफ़ॉर्म में AI क्षमताओं के लिए आधुनिक AI मॉडल और APIs (जैसे Gemini या अन्य) का उपयोग किया जाता है। विशाल कुमार ने AI मॉडल स्वयं नहीं बनाया है, बल्कि उन्हें अपने प्लेटफ़ॉर्म में इंटीग्रेट करके यह AI अनुभव तैयार किया है।',
    attributionStatementEn: 'This AI platform is developed by Vishal Kumar, who is the Founder and Solo Developer of this project and currently a Class 12 student. For AI capabilities, modern AI models and APIs (like Google Gemini) are integrated. Vishal Kumar developed the platform and engineered the integration.',
    bio: 'Founder & Solo Developer behind VSA AI Studio. Class 12 student engineering high-speed multimodal generative AI, 145+ language translation, and secure browser-based multimedia tools.',
    email: 'contact@vsa.ai',
  },
  system: {
    appName: 'VSA AI Studio',
    version: '2.4.0',
    activeModel: 'gemini-3.6-flash',
    activeModelDisplayName: 'Google Gemini 3.6 Flash (Fast Multimodal)',
    languagesCount: 145,
    voicePersonasCount: 20,
    status: 'operational',
  },
  attribution: 'इस AI प्लेटफ़ॉर्म को विशाल कुमार ने डेवलप किया है। वे इस प्रोजेक्ट के Founder और Solo Developer हैं तथा वर्तमान में कक्षा 12 के छात्र हैं।',
};

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onOpenChatWithPrompt,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [data, setData] = useState<AboutData>(DEFAULT_ABOUT_DATA);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'developer' | 'ai-model' | 'features'>('developer');

  // Fetch live developer & platform settings
  useEffect(() => {
    if (isOpen) {
      fetch('/api/about')
        .then((res) => res.json())
        .then((resData) => {
          if (resData && resData.developer) {
            setData(resData);
          }
        })
        .catch(() => {
          // Fallback to default
        });
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, fieldId: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast('success', 'Copied to Clipboard', `${label} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleTestPrompt = (prompt: string) => {
    onClose();
    if (onOpenChatWithPrompt) {
      onOpenChatWithPrompt(prompt);
    } else {
      window.dispatchEvent(
        new CustomEvent('vsa-chat-starter-prompt', { detail: { prompt } })
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="about-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      >
        <motion.div
          id="about-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-white dark:bg-[#101014] border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="relative px-6 py-5 border-b border-slate-100 dark:border-white/10 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-slate-50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VsaEmblem className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                    About VSA AI Studio
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    v{data.system.version}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Developer Profile • AI Model Architecture • Attribution
                </p>
              </div>
            </div>

            <button
              id="btn-close-about-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-slate-100 dark:border-white/10 px-6 bg-slate-50/50 dark:bg-black/20 gap-2">
            <button
              id="tab-about-developer"
              onClick={() => setActiveTab('developer')}
              className={`py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'developer'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Developer (विशाल कुमार)</span>
            </button>

            <button
              id="tab-about-ai-model"
              onClick={() => setActiveTab('ai-model')}
              className={`py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'ai-model'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AI Engine & Models</span>
            </button>

            <button
              id="tab-about-features"
              onClick={() => setActiveTab('features')}
              className={`py-3 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === 'features'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Capabilities</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 dark:text-slate-300">
            {/* 1. DEVELOPER PROFILE TAB */}
            {activeTab === 'developer' && (
              <div className="space-y-6">
                {/* Main Developer Hero Card */}
                <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-100 dark:from-indigo-950/40 dark:via-purple-950/20 dark:to-slate-900/40 border border-indigo-200/80 dark:border-indigo-500/20 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20">
                        <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-xl text-indigo-600 dark:text-indigo-400">
                          VK
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            {data.developer.name}
                          </h3>
                          <span className="text-xs text-slate-400 font-medium">
                            ({data.developer.nameEnglish || 'Vishal Kumar'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            ★ {data.developer.role || 'Founder & Solo Developer'}
                          </span>
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            • {data.developer.education || 'Class 12 Student'} (कक्षा 12 के छात्र)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Instagram Badge Button */}
                    <a
                      id="btn-developer-instagram"
                      href={data.developer.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all hover:scale-105 shrink-0"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>{data.developer.instagram}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>
                  </div>

                  {/* Quick Profile Summary Key-Value Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/70 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Developer</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Vishal Kumar</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/70 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Role</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Founder & Solo Dev</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/70 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Education</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Class 12 Student</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/30 border border-slate-200/70 dark:border-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Instagram</span>
                      <a href={data.developer.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline">
                        @Kushwaha_2009
                      </a>
                    </div>
                  </div>

                  {/* Bio */}
                  {data.developer.bio && (
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 pt-1">
                      {data.developer.bio}
                    </p>
                  )}
                </div>

                {/* Official Attribution Statement Quote Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Official Attribution / प्रमाणन
                    </span>
                    <button
                      id="btn-copy-attribution"
                      onClick={() =>
                        copyToClipboard(
                          data.developer.attributionStatement,
                          'attr',
                          'Attribution Statement'
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {copiedField === 'attr' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Statement</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Hindi Statement */}
                  <blockquote className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed border-l-3 border-indigo-600 pl-3.5 py-0.5">
                    "{data.developer.attributionStatement}"
                  </blockquote>

                  {/* English Translation */}
                  {data.developer.attributionStatementEn && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-3.5 italic">
                      "{data.developer.attributionStatementEn}"
                    </p>
                  )}
                </div>

                {/* Interactive Test in AI Chat */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                      Try asking VSA AI in chat:
                    </span>
                    <span className="text-[10px] text-slate-400">Click to ask instantly</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      id="btn-test-prompt-creator"
                      onClick={() => handleTestPrompt('किसने बनाया?')}
                      className="p-3 text-left rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          "किसने बनाया?"
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Tests the developer attribution & solo founder introduction.
                      </p>
                    </button>

                    <button
                      id="btn-test-prompt-model"
                      onClick={() => handleTestPrompt('कौन सा मॉडल इस्तेमाल हो रहा है?')}
                      className="p-3 text-left rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          "कौन सा मॉडल इस्तेमाल हो रहा है?"
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Verifies transparent AI model reporting (Google Gemini).
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. AI MODEL & ARCHITECTURE TAB */}
            {activeTab === 'ai-model' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-500" /> Active Underlying Model
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      LIVE ON GOOGLE GENAI
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                        {data.system.activeModelDisplayName || 'Google Gemini 3.6 Flash'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{data.system.activeModel}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Powered by the official Google GenAI TypeScript SDK with multimodal understanding, deep code generation, and low-latency streaming.
                    </p>
                  </div>
                </div>

                {/* Multilingual Voice Engine */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Globe className="w-4 h-4 text-purple-500" />
                      <span>145+ Global & Indian Languages</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All 22 Official Indian Scheduled Languages, Nepali, Bhojpuri, Rajasthani, and 120+ International Languages.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>20 AI Voice Personas</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      10 Female & 10 Male expressive voices with pitch, rate, and multilingual neural speech synthesis.
                    </p>
                  </div>
                </div>

                {/* Security & Client-Side Privacy */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Lock className="w-4 h-4 text-emerald-500" />
                    <span>Total Sandbox Privacy for PDFs & Images</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sensitive document operations (PDF split, merge, signature stamping, watermarking, image resizing) are executed client-side in the browser. Your confidential files are never sold or stored on external servers.
                  </p>
                </div>
              </div>
            )}

            {/* 3. CAPABILITIES TAB */}
            {activeTab === 'features' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> Multimodal AI Assistant
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Reasoning, code debugging, legal companion (Trivi), and document analysis with attachments.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" /> Complete PDF Suite
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Merge, split, compress, watermark, rotate, protect, signature stamp, and PDF to Image conversion.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Image Studio & AI Cutout
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Resize, crop, convert formats, canvas filters, and in-chat AI image adjustments.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" /> Video Tools Suite
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Video trim, merge, frame capture, audio extraction, and format conversion.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-center space-y-2">
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    Need a custom feature or want to connect with the developer?
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={data.developer.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Message on Instagram ({data.developer.instagram})</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-black/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {data.developer.name}
              </span>
              <span>•</span>
              <a
                href={data.developer.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <span>{data.developer.instagram}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-close-about-bottom"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white rounded-xl font-bold transition-colors"
              >
                Close
              </button>
              <button
                id="btn-open-chat-from-about"
                onClick={() => {
                  onClose();
                  handleTestPrompt('किसने बनाया?');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask VSA AI</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
