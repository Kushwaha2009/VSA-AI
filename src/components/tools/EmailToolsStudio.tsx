import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Mail,
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  FileText,
  Briefcase,
  UserCheck,
  HelpCircle,
  XCircle,
  ThumbsUp,
  Sliders,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmailToolsStudioProps {
  onInsertToChat?: (emailContent: string) => void;
  onClose?: () => void;
}

const EMAIL_TEMPLATES = [
  {
    id: 'professional',
    label: 'Formal Business Email',
    icon: Briefcase,
    category: 'Business',
    promptTemplate: 'Draft a formal, polite, and persuasive business email regarding: ',
  },
  {
    id: 'cold_outreach',
    label: 'Cold Outreach / Sales Pitch',
    icon: Send,
    category: 'Sales',
    promptTemplate: 'Write an engaging, high-converting cold email pitch with a strong hook, clear value proposition, and low-friction call-to-action for: ',
  },
  {
    id: 'follow_up',
    label: 'Gentle Follow-Up',
    icon: Mail,
    category: 'Communication',
    promptTemplate: 'Write a courteous, concise follow-up email checking in on a previous conversation regarding: ',
  },
  {
    id: 'polite_refusal',
    label: 'Polite Decline / Refusal',
    icon: XCircle,
    category: 'Diplomacy',
    promptTemplate: 'Write a polite, respectful email declining an offer/request while maintaining a warm professional relationship regarding: ',
  },
  {
    id: 'job_application',
    label: 'Job Application / Cover Note',
    icon: UserCheck,
    category: 'Career',
    promptTemplate: 'Draft a compelling job application introduction email highlighting key achievements and enthusiasm for the role of: ',
  },
  {
    id: 'support_reply',
    label: 'Customer Support Response',
    icon: HelpCircle,
    category: 'Service',
    promptTemplate: 'Draft an empathetic, helpful, and solution-oriented customer service email addressing: ',
  },
];

export const EmailToolsStudio: React.FC<EmailToolsStudioProps> = ({
  onInsertToChat,
  onClose,
}) => {
  const { showToast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0]);
  const [recipient, setRecipient] = useState('');
  const [subjectTopic, setSubjectTopic] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [tone, setTone] = useState<'formal' | 'friendly' | 'persuasive' | 'urgent' | 'concise'>('formal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerateEmail = async () => {
    if (!subjectTopic.trim()) {
      showToast('warning', 'Topic Required', 'Please enter the email topic or purpose.');
      return;
    }

    setIsGenerating(true);
    showToast('info', 'AI Drafting Email...', 'Crafting professional email structure.');

    try {
      const prompt = `You are a world-class executive communication and email copywriting expert.
Please write a complete, polished email with Subject line, Greeting, Body paragraphs, and Sign-off.

Parameters:
- Category: ${selectedTemplate.label}
- Recipient/Audience: ${recipient || 'Client/Partner'}
- Main Topic/Goal: ${subjectTopic}
- Specific Points to Include: ${keyPoints || 'Key standard details'}
- Desired Tone: ${tone}

Format:
Subject: [Compelling Subject Line]

Dear [Name/Recipient],

[Body Paragraphs with clear spacing and bullet points if relevant]

Best regards,
[Your Name]`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemInstruction: 'You are an elite business communication assistant. Produce clean, compelling emails ready to send.',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate email');

      setGeneratedEmail(data.text || '');
      showToast('success', 'Email Drafted!', 'Your email is ready.');
      trackFeatureUsage('ai-chat', 'AI Email Tool Generator', {
        subFeature: selectedTemplate.id,
        details: `Tone: ${tone}`,
        status: 'success',
      });
    } catch (err: any) {
      showToast('error', 'Generation Error', err.message || 'Failed to generate email.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    showToast('success', 'Copied to Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl text-xs sm:text-sm">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#111114]/90 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>AI Email Generator</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                Left Dock Tool
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Draft high-impact professional emails in seconds
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Form */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Template Select Grid */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Email Purpose
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EMAIL_TEMPLATES.map((tmpl) => {
              const Icon = tmpl.icon;
              const isSelected = selectedTemplate.id === tmpl.id;
              return (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    isSelected
                      ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-300 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-[#18181c] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-[11px] truncate">{tmpl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Email Subject / Main Purpose *
            </label>
            <input
              type="text"
              value={subjectTopic}
              onChange={(e) => setSubjectTopic(e.target.value)}
              placeholder="e.g., Project kickoff meeting reschedule, Product demo proposal, Inquiring about quote..."
              className="w-full p-2.5 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Recipient / Audience
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g., Hiring Manager, Mr. Sharma, Client Team..."
                className="w-full p-2.5 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tone of Voice
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="formal">👔 Executive & Formal</option>
                <option value="friendly">😊 Warm & Friendly</option>
                <option value="persuasive">🎯 High-Conversion Persuasive</option>
                <option value="concise">⚡ Ultra-Concise & Direct</option>
                <option value="urgent">⏰ Urgent & Time-Sensitive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Key Points to Mention (Optional)
            </label>
            <textarea
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="e.g. Free trial offered, next availability on Thursday 3 PM, link to portfolio attached..."
              rows={2}
              className="w-full p-2.5 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <button
            onClick={handleGenerateEmail}
            disabled={isGenerating || !subjectTopic.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Drafting Professional Email...' : 'Generate Email with AI'}</span>
          </button>
        </div>

        {/* Generated Email Result */}
        {generatedEmail && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Generated Draft</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                {onInsertToChat && (
                  <button
                    onClick={() => {
                      onInsertToChat(generatedEmail);
                      showToast('success', 'Inserted to Chat!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Chat</span>
                  </button>
                )}
              </div>
            </div>

            <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 max-h-64 overflow-y-auto p-2 bg-white dark:bg-black/30 rounded-lg border border-slate-100 dark:border-white/5">
              {generatedEmail}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
