import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ActiveTab } from './Header';
import {
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useLanguage();

  const navItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'chat', label: t('nav.chat') || 'AI Chat', icon: MessageSquare },
    { id: 'pdf', label: t('nav.pdf') || 'PDF Tools', icon: FileText },
    { id: 'image', label: t('nav.image') || 'Image AI', icon: ImageIcon },
    { id: 'video', label: t('nav.video') || 'Video', icon: Video },
    { id: 'dashboard', label: t('nav.dashboard') || 'Profile', icon: LayoutDashboard },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`mobile-bottom-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 px-1 transition-all select-none touch-manipulation ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {/* Active Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="mobile-bottom-nav-active-pill"
                  className="absolute top-1.5 w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                />
              )}

              <div
                className={`relative p-1.5 rounded-xl transition-transform duration-200 ${
                  isActive ? 'scale-110 bg-indigo-50 dark:bg-indigo-950/50' : 'active:scale-95'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[10px] tracking-tight leading-none mt-0.5 truncate max-w-[64px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
