import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Sparkles,
  Wand2,
  Sliders,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  X,
  Undo2,
  Download,
  Send,
  Sun,
  Contrast,
  Palette,
  Eye,
  Type,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Bot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InChatImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  onSaveEditedImage: (newImageUrl: string, editPrompt?: string) => void;
}

const AI_QUICK_PRESETS = [
  { id: 'relight', label: 'Studio Relight', prompt: 'Enhance lighting with warm studio softbox illumination and cinematic contrast', icon: Sun },
  { id: 'bg_swap', label: 'Modern Studio BG', prompt: 'Place subject in a modern minimalist clean studio backdrop with soft shadows', icon: Layers },
  { id: 'anime', label: 'Anime / Manga', prompt: 'Convert into high-quality Japanese anime artwork style with vibrant colors', icon: Palette },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', prompt: 'Transform image with glowing futuristic cyberpunk neon lighting and reflective colors', icon: Sparkles },
  { id: 'retouch', label: 'Clarity & Retouch', prompt: 'Enhance clarity, smooth textures, sharpen fine details and optimize exposure', icon: Wand2 },
  { id: 'watercolor', label: 'Watercolor Painting', prompt: 'Transform into a delicate hand-painted watercolor masterpiece with soft color bleeding', icon: Palette },
];

export const InChatImageEditorModal: React.FC<InChatImageEditorModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName = 'chat_image.png',
  onSaveEditedImage,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ai' | 'filters' | 'transform' | 'text'>('ai');

  // Working image states
  const [currentImage, setCurrentImage] = useState<string>(imageUrl);
  const [originalImage, setOriginalImage] = useState<string>(imageUrl);
  const [history, setHistory] = useState<string[]>([imageUrl]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // AI edit prompt state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [aiTaskType, setAiTaskType] = useState<string>('edit');

  // Visual filter controls
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);

  // Transform controls
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Text overlay
  const [overlayText, setOverlayText] = useState<string>('');
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textSize, setTextSize] = useState<number>(28);

  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen && imageUrl) {
      setCurrentImage(imageUrl);
      setOriginalImage(imageUrl);
      setHistory([imageUrl]);
      setHistoryIndex(0);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setWarmth(0);
      setBlur(0);
      setGrayscale(0);
      setSepia(0);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setOverlayText('');
      setAiPrompt('');
    }
  }, [isOpen, imageUrl]);

  // AI Edit Execution
  const handleRunAiEdit = async (customPrompt?: string, task: string = 'edit') => {
    const promptToUse = customPrompt || aiPrompt;
    if (!promptToUse.trim()) {
      showToast('warning', 'Prompt Required', 'Please enter editing instructions for the AI.');
      return;
    }

    setIsAiProcessing(true);
    showToast('info', 'AI is Editing Image...', 'Generating modifications with VSA AI Vision Engine.');

    try {
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentImage,
          prompt: promptToUse,
          task,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to edit image');
      }

      if (data.imageUrl) {
        const newImg = data.imageUrl;
        setCurrentImage(newImg);
        const newHist = [...history.slice(0, historyIndex + 1), newImg];
        setHistory(newHist);
        setHistoryIndex(newHist.length - 1);

        showToast('success', 'AI Edit Applied!', 'Image updated successfully.');
        trackFeatureUsage('image', 'In-Chat AI Image Edit', {
          details: `Prompt: ${promptToUse.slice(0, 40)}`,
          status: 'success',
        });
      }
    } catch (err: any) {
      showToast('error', 'AI Edit Error', err.message || 'Could not complete AI edit.');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Apply Canvas Adjustments (Filters, Rotation, Text Overlay)
  const applyCanvasAdjustments = (): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(currentImage);
          return;
        }

        const isRotated90or270 = rotation % 180 !== 0;
        canvas.width = isRotated90or270 ? img.naturalHeight : img.naturalWidth;
        canvas.height = isRotated90or270 ? img.naturalWidth : img.naturalHeight;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) ${blur > 0 ? `blur(${blur}px)` : ''}`;
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        // Warmth overlay
        if (warmth !== 0) {
          ctx.save();
          ctx.fillStyle = warmth > 0 ? `rgba(255, 170, 0, ${warmth / 250})` : `rgba(0, 150, 255, ${Math.abs(warmth) / 250})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        // Text Overlay
        if (overlayText.trim()) {
          ctx.save();
          const calculatedFontSize = Math.max(18, Math.round((canvas.width / 800) * textSize));
          ctx.font = `bold ${calculatedFontSize}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = textColor;
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillText(overlayText, canvas.width / 2, canvas.height - 40);
          ctx.restore();
        }

        const resultDataUrl = canvas.toDataURL('image/png');
        resolve(resultDataUrl);
      };
      img.src = currentImage;
    });
  };

  // Undo Last Action
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setCurrentImage(history[prevIndex]);
      showToast('info', 'Undo Applied');
    }
  };

  // Save and Inject to Chat
  const handleSaveToChat = async () => {
    const finalDataUrl = await applyCanvasAdjustments();
    onSaveEditedImage(finalDataUrl, aiPrompt || 'Edited in Chat');
    showToast('success', 'Saved to Chat!', 'The edited image has been updated in your chat.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-5xl h-[92vh] max-h-[850px] bg-slate-900 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl text-slate-100"
        >
          {/* Top Bar */}
          <div className="px-4 py-3 border-b border-white/10 bg-slate-950/80 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md">
                <Wand2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>In-Chat Image Editor</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    AI Powered
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 truncate max-w-xs">{imageName}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  historyIndex > 0
                    ? 'text-slate-200 hover:bg-white/10'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
                title="Undo edit"
              >
                <Undo2 className="w-4 h-4" />
                <span className="hidden sm:inline">Undo</span>
              </button>

              <button
                onMouseDown={() => setShowOriginalComparison(true)}
                onMouseUp={() => setShowOriginalComparison(false)}
                onTouchStart={() => setShowOriginalComparison(true)}
                onTouchEnd={() => setShowOriginalComparison(false)}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 font-medium flex items-center gap-1.5 transition-colors select-none"
                title="Hold to see original"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Hold for Original</span>
              </button>

              <button
                onClick={handleSaveToChat}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-105"
              >
                <Check className="w-4 h-4" />
                <span>Apply to Chat</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Body */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left/Main Canvas Viewer */}
            <div className="flex-1 bg-slate-950/60 p-4 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="relative max-w-full max-h-[50vh] md:max-h-[65vh] flex items-center justify-center p-2 rounded-xl border border-white/5 bg-slate-900/40">
                <img
                  src={showOriginalComparison ? originalImage : currentImage}
                  alt="Editor Canvas"
                  style={{
                    filter: !showOriginalComparison
                      ? `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) ${blur > 0 ? `blur(${blur}px)` : ''}`
                      : 'none',
                    transform: !showOriginalComparison
                      ? `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`
                      : 'none',
                  }}
                  className="max-h-[46vh] md:max-h-[60vh] object-contain rounded-lg shadow-2xl transition-all"
                />

                {/* Warmth overlay preview */}
                {warmth !== 0 && !showOriginalComparison && (
                  <div
                    className="absolute inset-2 rounded-lg pointer-events-none"
                    style={{
                      backgroundColor:
                        warmth > 0
                          ? `rgba(255, 170, 0, ${warmth / 300})`
                          : `rgba(0, 150, 255, ${Math.abs(warmth) / 300})`,
                    }}
                  />
                )}

                {/* Text overlay preview */}
                {overlayText.trim() && !showOriginalComparison && (
                  <div
                    className="absolute bottom-6 inset-x-4 text-center font-bold pointer-events-none drop-shadow-md"
                    style={{ color: textColor, fontSize: `${textSize}px` }}
                  >
                    {overlayText}
                  </div>
                )}

                {showOriginalComparison && (
                  <div className="absolute top-4 left-4 bg-indigo-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                    Viewing Original
                  </div>
                )}
              </div>

              {isAiProcessing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
                  <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 animate-spin">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white">AI is Processing Image...</p>
                    <p className="text-xs text-slate-400">Applying neural transformations & rendering</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Tools Drawer */}
            <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-white/10 bg-slate-900 flex flex-col overflow-hidden shrink-0">
              {/* Tab Selector */}
              <div className="grid grid-cols-4 p-2 border-b border-white/10 bg-slate-950/40 text-xs font-bold text-slate-400">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'ai'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Magic</span>
                </button>
                <button
                  onClick={() => setActiveTab('filters')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'filters'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>
                <button
                  onClick={() => setActiveTab('transform')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'transform'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Crop/Rotate</span>
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === 'text'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {activeTab === 'ai' && (
                  <div className="space-y-4">
                    {/* Prompt Input Box */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>AI Edit Instruction</span>
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Relight with warm neon colors, swap background to cyberpunk city, add cinematic lens flare..."
                        rows={3}
                        className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => handleRunAiEdit()}
                        disabled={isAiProcessing || !aiPrompt.trim()}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>{isAiProcessing ? 'Modifying Image...' : 'Execute AI Edit'}</span>
                      </button>
                    </div>

                    {/* 1-Click AI Presets */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        1-Click AI Presets
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {AI_QUICK_PRESETS.map((preset) => {
                          const Icon = preset.icon;
                          return (
                            <button
                              key={preset.id}
                              onClick={() => {
                                setAiPrompt(preset.prompt);
                                handleRunAiEdit(preset.prompt, preset.id);
                              }}
                              disabled={isAiProcessing}
                              className="p-2.5 rounded-xl bg-slate-950/70 hover:bg-indigo-600/20 border border-white/5 hover:border-indigo-500/40 text-left transition-all group"
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <Icon className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                                  {preset.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                                {preset.prompt}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'filters' && (
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Saturation</span>
                        <span>{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Warmth Tint</span>
                        <span>{warmth > 0 ? `+${warmth}` : warmth}</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={warmth}
                        onChange={(e) => setWarmth(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Grayscale (B&W)</span>
                        <span>{grayscale}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={grayscale}
                        onChange={(e) => setGrayscale(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                        <span>Sepia (Vintage)</span>
                        <span>{sepia}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sepia}
                        onChange={(e) => setSepia(Number(e.target.value))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setBrightness(100);
                        setContrast(100);
                        setSaturation(100);
                        setWarmth(0);
                        setGrayscale(0);
                        setSepia(0);
                      }}
                      className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 rounded-lg transition-colors"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}

                {activeTab === 'transform' && (
                  <div className="space-y-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Orientation & Orientation
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setRotation((prev) => (prev + 90) % 360)}
                        className="p-3 rounded-xl bg-slate-950 hover:bg-white/10 border border-white/10 flex flex-col items-center gap-1 text-xs font-semibold text-slate-200"
                      >
                        <RotateCw className="w-4 h-4 text-indigo-400" />
                        <span>Rotate 90°</span>
                      </button>

                      <button
                        onClick={() => setFlipH((prev) => !prev)}
                        className={`p-3 rounded-xl border border-white/10 flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                          flipH ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <FlipHorizontal className="w-4 h-4" />
                        <span>Flip Horiz</span>
                      </button>

                      <button
                        onClick={() => setFlipV((prev) => !prev)}
                        className={`p-3 rounded-xl border border-white/10 flex flex-col items-center gap-1 text-xs font-semibold transition-colors ${
                          flipV ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-200 hover:bg-white/10'
                        }`}
                      >
                        <FlipVertical className="w-4 h-4" />
                        <span>Flip Vert</span>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-300 block">Overlay Text</label>
                    <input
                      type="text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      placeholder="Type text to overlay on the image..."
                      className="w-full p-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="flex-1">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Font Size</span>
                        <input
                          type="range"
                          min="16"
                          max="72"
                          value={textSize}
                          onChange={(e) => setTextSize(Number(e.target.value))}
                          className="w-full accent-indigo-500"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 block mb-1">Color</span>
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded border border-white/20 bg-transparent cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
