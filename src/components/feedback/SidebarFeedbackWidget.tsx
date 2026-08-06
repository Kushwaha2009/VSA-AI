import React, { useState } from 'react';
import { Bug, Lightbulb, MessageSquareHeart, HelpCircle, Sparkles } from 'lucide-react';
import { FeedbackCategory, FeedbackType } from '../../types';
import { FeedbackModal } from './FeedbackModal';

interface SidebarFeedbackWidgetProps {
  currentCategory?: FeedbackCategory;
  compact?: boolean;
}

export const SidebarFeedbackWidget: React.FC<SidebarFeedbackWidgetProps> = ({
  currentCategory = 'general' as FeedbackCategory,
  compact = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType>('bug');

  const handleOpen = (type: FeedbackType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  if (compact) {
    return (
      <>
        <button
          id="btn-sidebar-feedback-compact"
          onClick={() => handleOpen('feedback')}
          title="Report Issue or Share Feedback"
          className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all group"
        >
          <Bug className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>

        <FeedbackModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          defaultType={selectedType}
          defaultCategory={currentCategory}
        />
      </>
    );
  }

  return (
    <>
      <div
        id="sidebar-feedback-widget"
        className="p-3 bg-gradient-to-br from-slate-100/90 to-slate-50 dark:from-white/[0.04] dark:to-white/[0.01] border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm space-y-2.5 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Feedback & Help
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Live Admin Sync</span>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Found an error or have an idea? Send directly to the engineer logs.
        </p>

        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          <button
            id="btn-sidebar-report-bug"
            onClick={() => handleOpen('bug')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white dark:bg-[#18181c] hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-500/30 rounded-xl text-[11px] font-semibold text-rose-600 dark:text-rose-400 shadow-xs transition-all"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Report Issue</span>
          </button>

          <button
            id="btn-sidebar-share-feedback"
            onClick={() => handleOpen('feature')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white dark:bg-[#18181c] hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-500/30 rounded-xl text-[11px] font-semibold text-amber-600 dark:text-amber-400 shadow-xs transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Feedback</span>
          </button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={selectedType}
        defaultCategory={currentCategory}
      />
    </>
  );
};
