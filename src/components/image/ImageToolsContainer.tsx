import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { Sparkles, Sliders, Eye, Wand2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { AiImageStudio } from './AiImageStudio';
import { AiImageVision } from './AiImageVision';
import { PhotoEditorStudio } from './PhotoEditorStudio';

type MainTab = 'ai-generate' | 'ai-vision' | 'editor';

export const ImageToolsContainer: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeMainTab, setActiveMainTab] = useState<MainTab>('ai-generate');
  const [sharedImage, setSharedImage] = useState<string | null>(null);
  const [sharedPrompt, setSharedPrompt] = useState<string | null>(null);

  const handleUseInEditor = (imageUrl: string) => {
    setSharedImage(imageUrl);
    setActiveMainTab('editor');
    showToast('info', 'Loaded in Editor', 'Adjust filters, crop, or annotate your AI artwork.');
  };

  const handleSendToPromptGenerator = (promptText: string) => {
    setSharedPrompt(promptText);
    setActiveMainTab('ai-generate');
  };

  const mainTabs = [
    {
      id: 'ai-generate',
      title: 'AI Image Generator',
      desc: 'Create concept art, logos, and photos with Imagen 3',
      icon: Sparkles,
    },
    {
      id: 'ai-vision',
      title: 'AI Vision & Director',
      desc: 'Reverse-engineer prompts and get color grading critique',
      icon: Eye,
    },
    {
      id: 'editor',
      title: 'Photo Editor Studio',
      desc: 'Filters, cutout background, resize, crop & export',
      icon: Sliders,
    },
  ];

  return (
    <div id="image-tools-main-container" className="w-full space-y-6">
      {/* Top Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/60 dark:bg-slate-900/90 rounded-2xl border border-slate-800">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id as any)}
              className={`flex-1 min-w-[200px] p-3 rounded-xl transition flex items-center gap-3 text-left ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div
                className={`p-2 rounded-lg ${
                  isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold truncate">{tab.title}</h4>
                <p
                  className={`text-[10px] truncate ${
                    isActive ? 'text-indigo-100' : 'text-slate-500'
                  }`}
                >
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main View Container */}
      <motion.div
        key={activeMainTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {activeMainTab === 'ai-generate' && (
          <AiImageStudio onUseInEditor={handleUseInEditor} />
        )}

        {activeMainTab === 'ai-vision' && (
          <AiImageVision
            initialImage={sharedImage}
            onSendToPromptGenerator={handleSendToPromptGenerator}
          />
        )}

        {activeMainTab === 'editor' && (
          <PhotoEditorStudio initialImage={sharedImage} />
        )}
      </motion.div>
    </div>
  );
};
