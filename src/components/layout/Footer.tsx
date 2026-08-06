import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from './Header';
import { VsaLogo } from '../common/VsaLogo';
import { Sparkles, Shield, Cpu, Lock, CheckCircle2, Instagram, Info, User, ExternalLink } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  const { t } = useLanguage();

  const handleOpenAbout = () => {
    window.dispatchEvent(new CustomEvent('vsa-open-about-modal'));
  };

  return (
    <footer
      id="main-app-footer"
      className="bg-slate-100 dark:bg-[#0c0c0e] border-t border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Developer Highlight */}
          <div className="md:col-span-1 space-y-3">
            <VsaLogo variant="horizontal" size="md" showTagline={true} />
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('brand.tagline')}
            </p>

            {/* Developer Tag */}
            <div className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Solo Developer
                </span>
                <a
                  href="https://instagram.com/Kushwaha_2009"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-700 dark:text-pink-400 text-[10px] font-bold flex items-center gap-0.5"
                >
                  <Instagram className="w-3 h-3" />
                  <span>@Kushwaha_2009</span>
                </a>
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                विशाल कुमार (Vishal Kumar)
              </p>
              <p className="text-[11px] text-slate-500">
                Founder & Solo Developer
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span>All Systems Operational (99.9%)</span>
            </div>
          </div>

          {/* AI & Media Tools */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Media & AI Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-link-chat"
                  onClick={() => setActiveTab('chat')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('nav.chat')} (Google Gemini 3.6 Flash & 3.1 Pro)
                </button>
              </li>
              <li>
                <button
                  id="footer-link-pdf"
                  onClick={() => setActiveTab('pdf')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('nav.pdf')} (Merge, Split, Sign, Encrypt)
                </button>
              </li>
              <li>
                <button
                  id="footer-link-image"
                  onClick={() => setActiveTab('image')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('nav.image')} (Resize, Compress, Cutout)
                </button>
              </li>
              <li>
                <button
                  id="footer-link-video"
                  onClick={() => setActiveTab('video')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {t('nav.video')} (Trim, Merge, Convert)
                </button>
              </li>
            </ul>
          </div>

          {/* Supported Languages */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Languages & Voices
            </h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                <span>145+ Global & Regional Languages</span>
              </div>
              <p className="text-[11px] text-slate-500">
                All 22 Official Indian Languages, Nepali, Bhojpuri, and 120+ International Languages.
              </p>
              <div className="pt-2 flex flex-col gap-1.5">
                <button
                  id="footer-btn-goto-languages"
                  onClick={() => setActiveTab('dashboard')}
                  className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 text-left"
                >
                  Explore 20 AI Voices & Languages →
                </button>
                <button
                  id="footer-btn-open-about"
                  onClick={handleOpenAbout}
                  className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-left"
                >
                  <Info className="w-3 h-3" />
                  <span>About Developer & Model Transparency →</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security & Architecture */}
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Security & Privacy
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>Client-side PDF & Image sandbox processing for total data privacy.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>JWT Authentication & bcrypt hashed security credentials (No OTP).</span>
              </div>
              <div className="flex items-start gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>AI Capabilities powered by Google GenAI Services.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sleek Status Bar */}
      <div className="bg-slate-200/70 dark:bg-[#09090b] border-t border-slate-300/60 dark:border-white/5 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-mono">
        <div className="flex items-center gap-4">
          <span className="text-slate-600 dark:text-slate-400 font-bold">VSA-AI-STABLE-2.4.0</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Lock className="w-3 h-3 text-emerald-500" />
            SECURE END-TO-END
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>DEVELOPED BY VISHAL KUMAR (@Kushwaha_2009) • © {new Date().getFullYear()} VSA AI STUDIO</span>
        </div>
      </div>
    </footer>
  );
};


