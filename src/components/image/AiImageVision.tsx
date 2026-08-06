import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Sparkles,
  Upload,
  Eye,
  Sliders,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  Sun,
  Palette,
  Camera,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AiImageVisionProps {
  initialImage?: string | null;
  onApplyGrade?: (brightness: number, contrast: number, saturation: number, warmth: number) => void;
  onSendToPromptGenerator?: (prompt: string) => void;
}

export const AiImageVision: React.FC<AiImageVisionProps> = ({
  initialImage,
  onApplyGrade,
  onSendToPromptGenerator,
}) => {
  const { showToast } = useToast();

  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const [selectedTask, setSelectedTask] = useState<'enhance_prompt' | 'color_grading' | 'describe' | 'custom'>(
    'enhance_prompt'
  );
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setAnalysisResult(null);
      showToast('info', 'Image Loaded', 'Select an analysis tool and run Gemini vision.');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageSrc) {
      showToast('error', 'Image Required', 'Please upload or select an image to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/image/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageSrc,
          task: selectedTask,
          customQuestion: customQuestion.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Vision analysis failed');

      setAnalysisResult(data.result);
      trackFeatureUsage('image', 'AI Image Vision Analysis', {
        subFeature: 'ai-vision',
        details: `Task: ${selectedTask}`,
        status: 'success',
      });
      showToast('success', 'Analysis Complete', 'Gemini vision processed your image.');
    } catch (err: any) {
      showToast('error', 'Analysis Failed', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResult = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', 'Copied', 'Analysis copied to clipboard.');
  };

  const handleUseAsPrompt = () => {
    if (!analysisResult || !onSendToPromptGenerator) return;
    onSendToPromptGenerator(analysisResult);
    showToast('success', 'Prompt Sent', 'Switched to AI Image Generator with this prompt.');
  };

  const tasks = [
    {
      id: 'enhance_prompt',
      title: 'Reverse-Engineer Prompt',
      desc: 'Extract prompt & camera settings to recreate in Midjourney or Imagen',
      icon: Sparkles,
    },
    {
      id: 'color_grading',
      title: 'Color & Lighting Critique',
      desc: 'Expert recommendations for contrast, shadows, and temperature',
      icon: Sun,
    },
    {
      id: 'describe',
      title: 'Deep Scene Breakdown',
      desc: 'Comprehensive inventory of subjects, atmosphere, and textures',
      icon: Eye,
    },
    {
      id: 'custom',
      title: 'Custom AI Inquiry',
      desc: 'Ask any question about composition, artistic flaws, or objects',
      icon: MessageSquare,
    },
  ];

  return (
    <div id="ai-image-vision" className="flex flex-col gap-6">
      {/* Vision Header */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-400" />
            AI Image Vision & Creative Director
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal analysis powered by Gemini 3.6 Flash. Reverse-engineer prompts, critique lighting, and get color grading.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Task Selection (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Image Upload Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-300">Target Photo</label>
            {imageSrc ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 max-h-60 flex items-center justify-center">
                <img src={imageSrc} alt="Vision Source" className="max-h-60 w-auto object-contain" />
                <label
                  htmlFor="change-vision-img"
                  className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 border border-slate-700 cursor-pointer shadow"
                >
                  Change Photo
                  <input
                    id="change-vision-img"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            ) : (
              <label
                htmlFor="upload-vision-img"
                className="cursor-pointer p-8 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-950/60 flex flex-col items-center justify-center text-center transition"
              >
                <Upload className="w-8 h-8 text-indigo-400 mb-2" />
                <span className="text-xs font-bold text-white">Upload Any Image</span>
                <span className="text-[11px] text-slate-500 mt-1">Supports JPG, PNG, WEBP</span>
                <input
                  id="upload-vision-img"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>

          {/* Analysis Mode Cards */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2.5">
            <label className="text-xs font-semibold text-slate-300">Choose Vision Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {tasks.map((t) => {
                const IconComponent = t.icon;
                const isSelected = selectedTask === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t.id as any)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedTask === 'custom' && (
              <div className="mt-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="e.g. How can I improve the lighting and color balance?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Run Analysis Button */}
          <button
            id="run-vision-analysis-btn"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !imageSrc}
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing with Gemini Vision...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run AI Vision Analysis
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Analysis Output & Director Tools (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Gemini Vision Insights & Recommendations
              </h3>

              {analysisResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResult}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>

                  {onSendToPromptGenerator && selectedTask === 'enhance_prompt' && (
                    <button
                      onClick={handleUseAsPrompt}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition shadow"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      Create Art with This
                    </button>
                  )}
                </div>
              )}
            </div>

            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3">
                <div className="w-12 h-12 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
                <p className="text-xs text-slate-300 font-semibold">Inspecting pixels, colors & geometry...</p>
              </div>
            ) : analysisResult ? (
              <div className="flex-1 flex flex-col justify-between">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {analysisResult}
                </div>

                {/* 1-Click Auto Grading Presets when color critique is done */}
                {selectedTask === 'color_grading' && onApplyGrade && (
                  <div className="mt-4 p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">Apply Cinematic Color Grade</h4>
                      <p className="text-[11px] text-slate-400">
                        Automatically adjust Brightness (+15%), Contrast (+25%), and Vibrance (+20%)
                      </p>
                    </div>
                    <button
                      onClick={() => onApplyGrade(115, 125, 120, 10)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition shadow"
                    >
                      Apply to Photo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-3 text-slate-500">
                <Camera className="w-12 h-12 stroke-1 opacity-40" />
                <p className="text-xs text-slate-400">
                  Upload an image and run Gemini Vision to receive artistic feedback, reverse-engineered prompts, or
                  lighting improvements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
