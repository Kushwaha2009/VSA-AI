import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileText,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Send,
  BookOpen,
  UserCheck,
  Sparkles,
  Info,
  ChevronRight,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TriviLegalStudioProps {
  onAskTrivi: (prompt: string) => void;
  compactMode?: boolean;
  onClose?: () => void;
}

export const TriviLegalStudio: React.FC<TriviLegalStudioProps> = ({
  onAskTrivi,
  compactMode = false,
  onClose,
}) => {
  const { showToast } = useToast();
  const [selectedTopic, setSelectedTopic] = useState<string>('consumer');
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const legalCategories = [
    {
      id: 'consumer',
      title: 'Consumer Rights & Claims',
      icon: ShieldCheck,
      description: 'Defective products, seller refunds, delayed deliveries, and consumer court claims.',
      samplePrompt: 'I purchased a laptop that arrived defective, and the online seller is refusing a refund within the return window. Explain my consumer rights and draft a formal demand letter.',
    },
    {
      id: 'tenancy',
      title: 'Tenant & Rental Law',
      icon: FileText,
      description: 'Unlawful security deposit withholdings, rent agreements, and eviction notice laws.',
      samplePrompt: 'My landlord is deducting 50% of my security deposit without showing repair bills for normal paint wear. Explain tenant deposit protection laws and how to demand a full refund.',
    },
    {
      id: 'employment',
      title: 'Employment & Labor Rights',
      icon: UserCheck,
      description: 'Wrongful termination, unpaid wages, notice periods, and freelance service agreements.',
      samplePrompt: 'My former employer has delayed my final settlement and gratuity payment by over 60 days. What legal notices can I serve, and what are my labor law remedies?',
    },
    {
      id: 'contracts',
      title: 'Contract & NDA Drafting',
      icon: BookOpen,
      description: 'Plain-language drafting of Non-Disclosure Agreements, service contracts, and partnership terms.',
      samplePrompt: 'Draft a standard 1-page mutual Non-Disclosure Agreement (NDA) in plain English protecting software designs and financial ideas for 2 years.',
    },
    {
      id: 'rti',
      title: 'RTI & Public Grievances',
      icon: HelpCircle,
      description: 'Right to Information filings for delayed public services, civic works, and municipal records.',
      samplePrompt: 'Draft an RTI (Right to Information) query to the Municipal Commissioner seeking inspection records and budget allocation for delayed road repairs in my ward.',
    },
  ];

  const handleLaunchPrompt = (promptText: string) => {
    onAskTrivi(promptText);
    trackFeatureUsage('ai-chat', 'Trivi Legal Query Launched', {
      details: promptText.slice(0, 50),
      status: 'success',
    });
    showToast('info', 'Trivi Legal Active', 'Your question has been sent to Trivi for plain-language legal guidance.');
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    showToast('success', 'Copied to Clipboard');
  };

  return (
    <div
      id="trivi-legal-studio-container"
      className={`flex flex-col h-full bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl ${
        compactMode ? 'text-xs' : 'text-sm'
      }`}
    >
      {/* Trivi Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#111114]/90 backdrop-blur flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white shadow-md shadow-amber-500/20 shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span>Trivi · Legal AI Advisor</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Non-Technical Law
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Answers any legal question in plain English • Strictly filters illegal requests
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Safety & Non-Technical Promise Banner */}
      <div className="p-3 bg-amber-500/5 border-b border-amber-500/15 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 shrink-0">
        <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900 dark:text-white">
            Simple, Jargon-Free Legal Guidance for Everyone
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Trivi breaks down complex statutes, contracts, and rights into everyday language without coding or legal jargon. Requests involving illegal activities or violations are strictly declined with lawful alternatives provided.
          </p>
        </div>
      </div>

      {/* Main Categories and Quick Prompts */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50/50 dark:bg-[#070709]">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Popular Legal Categories
          </h4>
          <div className="space-y-2">
            {legalCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-white dark:bg-[#111114] border border-slate-200 dark:border-white/10 hover:border-amber-500/50 transition-all shadow-sm space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {cat.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleLaunchPrompt(cat.samplePrompt)}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold text-xs hover:bg-amber-100 transition-colors"
                    >
                      <span>Ask Trivi</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {cat.description}
                  </p>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#18181c] border border-slate-200/60 dark:border-white/5 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2">
                    <span className="truncate">"{cat.samplePrompt}"</span>
                    <button
                      onClick={() => handleCopyText(cat.samplePrompt, cat.id)}
                      className="p-1 hover:text-amber-500 shrink-0"
                      title="Copy sample prompt"
                    >
                      {copiedId === cat.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Direct Legal Query Input */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#111114] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customQuestion.trim()) {
              handleLaunchPrompt(customQuestion.trim());
              setCustomQuestion('');
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            placeholder="Ask Trivi any legal question (e.g. consumer rights, leases, contracts)..."
            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={!customQuestion.trim()}
            className="p-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-40 transition-all shrink-0"
            title="Ask Trivi"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
