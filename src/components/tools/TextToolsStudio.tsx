import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Send,
  Wand2,
  RefreshCw,
  Sliders,
  AlignLeft,
  ListOrdered,
  Feather,
  CheckCheck,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TextToolsStudioProps {
  onInsertToChat?: (textContent: string) => void;
  onClose?: () => void;
}

const TEXT_TASKS = [
  {
    id: 'summarize',
    label: 'Executive Summary',
    desc: 'Condense long text into key insights',
    icon: AlignLeft,
    promptPrefix: 'Provide an executive summary with key bullet points for the following text: ',
  },
  {
    id: 'grammar',
    label: 'Fix Grammar & Flow',
    desc: 'Fix typos, grammar, and improve sentence flow',
    icon: CheckCheck,
    promptPrefix: 'Proofread, fix all grammatical errors, improve sentence rhythm, and polish the following text: ',
  },
  {
    id: 'paraphrase',
    label: 'Paraphrase / Rewrite',
    desc: 'Rewrite text with fresh wording while preserving meaning',
    icon: Wand2,
    promptPrefix: 'Paraphrase and rewrite the following text in an engaging, original style: ',
  },
  {
    id: 'bullets',
    label: 'Extract Action Bullets',
    desc: 'Turn messy text into crisp actionable checklists',
    icon: ListOrdered,
    promptPrefix: 'Extract the critical actionable takeaways and formatted bullet points from this text: ',
  },
  {
    id: 'simplify',
    label: 'Explain Simply (ELI5)',
    desc: 'Explain complex concepts in simple plain English',
    icon: Feather,
    promptPrefix: 'Rewrite this complex text so that anyone or a high-schooler can understand it easily (ELI5): ',
  },
];

export const TextToolsStudio: React.FC<TextToolsStudioProps> = ({
  onInsertToChat,
  onClose,
}) => {
  const { showToast } = useToast();
  const [selectedTask, setSelectedTask] = useState(TEXT_TASKS[0]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleProcessText = async () => {
    if (!inputText.trim()) {
      showToast('warning', 'Text Required', 'Please enter or paste the text to process.');
      return;
    }

    setIsProcessing(true);
    showToast('info', 'AI Processing Text...', 'Refining and structuring output.');

    try {
      const fullPrompt = `${selectedTask.promptPrefix}\n\n"""\n${inputText}\n"""`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          systemInstruction: 'You are an elite editorial, copy-polishing, and text enhancement AI engine. Return clean, well-formatted text.',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process text');

      setOutputText(data.text || '');
      showToast('success', 'Text Processed!', 'Ready for review.');
      trackFeatureUsage('ai-chat', 'AI Text Tool Studio', {
        subFeature: selectedTask.id,
        details: `Task: ${selectedTask.label}`,
        status: 'success',
      });
    } catch (err: any) {
      showToast('error', 'Processing Error', err.message || 'Failed to process text.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    showToast('success', 'Copied to Clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl text-xs sm:text-sm">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#111114]/90 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>AI Text & Writing Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                Left Dock Tool
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Summarize, proofread, paraphrase, and polish text
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

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {/* Task Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Writing Transformation
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEXT_TASKS.map((task) => {
              const Icon = task.icon;
              const isSelected = selectedTask.id === task.id;
              return (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-300 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-[#18181c] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-[11px] truncate">{task.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Original Text to Transform *
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your paragraphs, notes, draft, article, or essay here..."
            rows={5}
            className="w-full p-3 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />

          <button
            onClick={handleProcessText}
            disabled={isProcessing || !inputText.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isProcessing ? 'Polishing Text with AI...' : `Apply ${selectedTask.label}`}</span>
          </button>
        </div>

        {/* Output Result */}
        {outputText && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Refined Output</span>
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
                      onInsertToChat(outputText);
                      showToast('success', 'Inserted to Chat!');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send to Chat</span>
                  </button>
                )}
              </div>
            </div>

            <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 dark:text-slate-200 max-h-64 overflow-y-auto p-2 bg-white dark:bg-black/30 rounded-lg border border-slate-100 dark:border-white/5">
              {outputText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
