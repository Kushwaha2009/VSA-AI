import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Sliders,
  Crop,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Scissors,
  Type,
  PenTool,
  Maximize2,
  Minimize2,
  RefreshCw,
  Download,
  Upload,
  Sun,
  Eye,
  CheckCircle2,
  Layers,
  Palette,
  Sparkles,
  Zap,
  Undo2,
  Trash2,
  Wand2,
} from 'lucide-react';
import { motion } from 'motion/react';

interface PhotoEditorStudioProps {
  initialImage?: string | null;
}

export type EditorSubTab =
  | 'ai-magic'
  | 'adjust'
  | 'filter'
  | 'crop'
  | 'transform'
  | 'bg-remove'
  | 'watermark'
  | 'annotate'
  | 'resize'
  | 'compress';

export const PhotoEditorStudio: React.FC<PhotoEditorStudioProps> = ({ initialImage }) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<EditorSubTab>('ai-magic');
  const [sourceImage, setSourceImage] = useState<string | null>(initialImage || null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 600,
  });

  // AI Magic Edit State
  const [aiEditPrompt, setAiEditPrompt] = useState<string>('Make the lighting dramatic and cinematic with soft atmospheric glow');
  const [aiEditTask, setAiEditTask] = useState<'relight' | 'style_transfer' | 'bg_swap' | 'retouch' | 'edit'>('relight');
  const [aiEditStyle, setAiEditStyle] = useState<string>('cinematic');
  const [isAiEditing, setIsAiEditing] = useState<boolean>(false);
  const [aiEditResult, setAiEditResult] = useState<string | null>(null);

  // Adjustments State
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [warmth, setWarmth] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [invert, setInvert] = useState<number>(0);

  // Transform State
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Crop State
  const [cropAspect, setCropAspect] = useState<'free' | '1:1' | '16:9' | '9:16' | '4:3' | 'circle'>('free');

  // Background Remove State
  const [bgTolerance, setBgTolerance] = useState<number>(25);
  const [bgKeyColor, setBgKeyColor] = useState<string>('#ffffff');
  const [replaceBgType, setReplaceBgType] = useState<'transparent' | 'solid' | 'gradient'>('transparent');
  const [solidBgColor, setSolidBgColor] = useState<string>('#0f172a');
  const [gradientBg, setGradientBg] = useState<string>('linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)');

  // Watermark / Text State
  const [watermarkText, setWatermarkText] = useState<string>('VSA AI STUDIO');
  const [watermarkColor, setWatermarkColor] = useState<string>('#ffffff');
  const [watermarkBgOpacity, setWatermarkBgOpacity] = useState<number>(60);
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'center'>(
    'bottom-right'
  );
  const [watermarkSize, setWatermarkSize] = useState<number>(24);

  // Annotation Brush State
  const [brushColor, setBrushColor] = useState<string>('#ff0055');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  // Resize State
  const [resizeW, setResizeW] = useState<number>(800);
  const [resizeH, setResizeH] = useState<number>(600);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatioVal, setAspectRatioVal] = useState<number>(800 / 600);

  // Compress & Format Convert State
  const [compressQuality, setCompressQuality] = useState<number>(85);
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif'>(
    'image/webp'
  );
  const [previewFileSize, setPreviewFileSize] = useState<number>(0);

  // Preview Stage Canvas Ref
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Load Image Data & Dimensions
  useEffect(() => {
    if (initialImage) {
      setSourceImage(initialImage);
    }
  }, [initialImage]);

  useEffect(() => {
    if (!sourceImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setResizeW(img.width);
      setResizeH(img.height);
      setAspectRatioVal(img.width / img.height);
      renderLiveCanvas();
    };
    img.src = sourceImage;
  }, [
    sourceImage,
    brightness,
    contrast,
    saturation,
    warmth,
    blur,
    sepia,
    grayscale,
    hueRotate,
    invert,
    rotation,
    flipH,
    flipV,
    watermarkText,
    watermarkColor,
    watermarkBgOpacity,
    watermarkPosition,
    watermarkSize,
    bgTolerance,
    bgKeyColor,
    replaceBgType,
    solidBgColor,
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      resetAdjustments();
      showToast('success', 'Image Uploaded', 'Loaded into creative studio.');
    };
    reader.readAsDataURL(file);
  };

  const resetAdjustments = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setHueRotate(0);
    setInvert(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  // Render Canvas with all adjustments applied
  const renderLiveCanvas = () => {
    if (!sourceImage || !previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const isRotated = rotation % 180 !== 0;
      const w = isRotated ? img.height : img.width;
      const h = isRotated ? img.width : img.height;

      canvas.width = w;
      canvas.height = h;

      ctx.save();
      ctx.clearRect(0, 0, w, h);

      // Background Replacement (if active)
      if (replaceBgType === 'solid') {
        ctx.fillStyle = solidBgColor;
        ctx.fillRect(0, 0, w, h);
      }

      // Center & Transformations
      ctx.translate(w / 2, h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg) invert(${invert}%)`;

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Warmth / Color Tint Overlay
      if (warmth !== 0) {
        ctx.save();
        ctx.fillStyle = warmth > 0 ? `rgba(255, 140, 0, ${warmth / 200})` : `rgba(0, 100, 255, ${Math.abs(warmth) / 200})`;
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // Watermark Overlay
      if (watermarkText.trim()) {
        ctx.save();
        ctx.font = `bold ${watermarkSize}px system-ui, sans-serif`;
        const textMetrics = ctx.measureText(watermarkText);
        const padding = 12;
        const boxWidth = textMetrics.width + padding * 2;
        const boxHeight = watermarkSize + padding * 1.5;

        let posX = w - boxWidth - 20;
        let posY = h - boxHeight - 20;

        if (watermarkPosition === 'bottom-left') {
          posX = 20;
          posY = h - boxHeight - 20;
        } else if (watermarkPosition === 'top-right') {
          posX = w - boxWidth - 20;
          posY = 20;
        } else if (watermarkPosition === 'center') {
          posX = (w - boxWidth) / 2;
          posY = (h - boxHeight) / 2;
        }

        // Watermark background badge
        ctx.fillStyle = `rgba(0, 0, 0, ${watermarkBgOpacity / 100})`;
        ctx.beginPath();
        ctx.roundRect(posX, posY, boxWidth, boxHeight, 8);
        ctx.fill();

        // Watermark text
        ctx.fillStyle = watermarkColor;
        ctx.textBaseline = 'middle';
        ctx.fillText(watermarkText, posX + padding, posY + boxHeight / 2);
        ctx.restore();
      }

      // Estimate compressed size
      canvas.toBlob(
        (blob) => {
          if (blob) setPreviewFileSize(blob.size);
        },
        targetFormat,
        compressQuality / 100
      );
    };
    img.src = sourceImage;
  };

  // Preset Filters
  const applyPresetFilter = (preset: string) => {
    resetAdjustments();
    if (preset === 'cyberpunk') {
      setContrast(140);
      setSaturation(160);
      setHueRotate(180);
      setBrightness(110);
    } else if (preset === 'noir') {
      setGrayscale(100);
      setContrast(160);
      setBrightness(95);
    } else if (preset === 'golden') {
      setWarmth(45);
      setBrightness(115);
      setSaturation(130);
      setContrast(110);
    } else if (preset === 'emerald') {
      setHueRotate(90);
      setSaturation(140);
      setContrast(120);
    } else if (preset === 'vintage') {
      setSepia(60);
      setContrast(115);
      setWarmth(20);
      setBrightness(105);
    } else if (preset === 'pop') {
      setSaturation(170);
      setContrast(130);
      setBrightness(110);
    }
    showToast('info', 'Filter Applied', `Applied ${preset.toUpperCase()} aesthetic.`);
  };

  // Apply Background Removal
  const handleRemoveBackground = () => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Convert hex key color to rgb
    const hex = bgKeyColor.replace('#', '');
    const kr = parseInt(hex.substring(0, 2), 16) || 255;
    const kg = parseInt(hex.substring(2, 4), 16) || 255;
    const kb = parseInt(hex.substring(4, 6), 16) || 255;

    const tol = (bgTolerance / 100) * 441; // Euclidean max distance in RGB space

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const dist = Math.sqrt((r - kr) ** 2 + (g - kg) ** 2 + (b - kb) ** 2);
      if (dist < tol) {
        data[i + 3] = 0; // Transparent
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setSourceImage(canvas.toDataURL('image/png'));
    showToast('success', 'Background Cut Out', 'Isolated subject onto transparent canvas.');
  };

  // Freehand Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && previewCanvasRef.current) {
      setIsDrawing(false);
      setSourceImage(previewCanvasRef.current.toDataURL('image/png'));
    }
  };

  // Download Output File
  const handleDownload = () => {
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const ext = targetFormat.split('/')[1] || 'png';
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VSA_Artwork_${canvas.width}x${canvas.height}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        trackFeatureUsage('image', 'Photo Studio Export', {
          subFeature: activeTab,
          fileSize: blob.size,
          status: 'success',
        });

        showToast('success', 'Image Exported', `Saved as ${canvas.width}x${canvas.height} ${ext.toUpperCase()}`);
      },
      targetFormat,
      compressQuality / 100
    );
  };

  // AI Magic Edit Request Handler
  const handlePerformAiEdit = async () => {
    if (!sourceImage || !aiEditPrompt.trim()) {
      showToast('error', 'Prompt Required', 'Please describe the edit you want AI to make.');
      return;
    }

    setIsAiEditing(true);
    try {
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: sourceImage,
          prompt: aiEditPrompt.trim(),
          task: aiEditTask,
          style: aiEditStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to edit image with AI');

      if (data.imageUrl) {
        setAiEditResult(data.imageUrl);
        setSourceImage(data.imageUrl);
        showToast('success', 'AI Magic Applied!', `Enhanced image with ${aiEditTask.replace('_', ' ')}.`);
        trackFeatureUsage('image', 'AI Photo Edit Applied', {
          subFeature: 'ai-magic',
          details: `Task: ${aiEditTask}`,
          status: 'success',
        });
      }
    } catch (err: any) {
      showToast('error', 'AI Edit Error', err.message || 'Could not process AI edit');
    } finally {
      setIsAiEditing(false);
    }
  };

  const socialPresets = [
    { name: 'IG Square', w: 1080, h: 1080 },
    { name: 'IG Story', w: 1080, h: 1920 },
    { name: 'YouTube', w: 1280, h: 720 },
    { name: 'Twitter', w: 1500, h: 500 },
    { name: 'LinkedIn', w: 1584, h: 396 },
  ];

  return (
    <div id="photo-editor-studio" className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Photo Studio & Digital Editor
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Adjust lighting, apply cinematic filters, crop, remove backgrounds, annotate, and export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {sourceImage && (
            <>
              <button
                onClick={resetAdjustments}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>

              <button
                id="export-edited-image-btn"
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                Export Artwork ({(previewFileSize / 1024).toFixed(0)} KB)
              </button>
            </>
          )}
        </div>
      </div>

      {!sourceImage ? (
        /* Empty Upload Prompt */
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Upload a Photo to Edit</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-6">
            Supports PNG, JPG, WEBP, and AI generated images.
          </p>
          <label
            htmlFor="editor-photo-upload"
            className="cursor-pointer px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/25"
          >
            <Upload className="w-4 h-4" />
            Select Image from Device
            <input
              id="editor-photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      ) : (
        /* Active Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tool Tabs & Controls (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Subtool Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
              {[
                { id: 'ai-magic', label: 'AI Magic Touch', icon: Sparkles, badge: 'Smart' },
                { id: 'adjust', label: 'Color & Light', icon: Sliders },
                { id: 'filter', label: 'FX Filters', icon: Palette },
                { id: 'transform', label: 'Rotate & Flip', icon: RotateCw },
                { id: 'bg-remove', label: 'Cutout BG', icon: Scissors },
                { id: 'watermark', label: 'Watermark', icon: Type },
                { id: 'annotate', label: 'Draw & Brush', icon: PenTool },
                { id: 'resize', label: 'Crop & Size', icon: Maximize2 },
                { id: 'compress', label: 'Export & File', icon: Minimize2 },
              ].map((tb) => {
                const Icon = tb.icon;
                const isActive = activeTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    onClick={() => setActiveTab(tb.id as any)}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                      isActive ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5" />
                      {tb.badge && (
                        <span className="text-[9px] px-1 rounded bg-amber-400/20 text-amber-300 font-bold">
                          {tb.badge}
                        </span>
                      )}
                    </div>
                    <span className="truncate max-w-full">{tb.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-4">
              {/* 0. AI Magic Touch */}
              {activeTab === 'ai-magic' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      AI Magic Touch & Neural Editing
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                      Gemini Vision
                    </span>
                  </div>

                  {/* AI Task Presets */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'relight', label: 'Cinematic Relight', icon: Sun, prompt: 'Apply warm cinematic studio relighting with volumetric depth' },
                      { id: 'style_transfer', label: 'Style Transfer', icon: Palette, prompt: 'Transform image into modern digital concept art' },
                      { id: 'bg_swap', label: 'AI BG Replace', icon: Scissors, prompt: 'Place subject in a modern luxury studio with soft blurred backdrop' },
                      { id: 'retouch', label: 'Clarity Retouch', icon: Eye, prompt: 'Enhance facial clarity, remove noise, and sharpen fine details' },
                    ].map((tsk) => (
                      <button
                        key={tsk.id}
                        onClick={() => {
                          setAiEditTask(tsk.id as any);
                          setAiEditPrompt(tsk.prompt);
                        }}
                        className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col gap-1 ${
                          aiEditTask === tsk.id
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span className="font-bold flex items-center gap-1">
                          <tsk.icon className="w-3.5 h-3.5" />
                          {tsk.label}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate">{tsk.prompt}</span>
                      </button>
                    ))}
                  </div>

                  {/* Edit Prompt Instruction */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Edit Instruction / Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={aiEditPrompt}
                      onChange={(e) => setAiEditPrompt(e.target.value)}
                      placeholder="Describe what you want AI to change or add..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={handlePerformAiEdit}
                    disabled={isAiEditing || !aiEditPrompt.trim()}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                  >
                    {isAiEditing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Applying AI Magic Edit...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Execute AI Magic Edit
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* 1. Adjustments */}
              {activeTab === 'adjust' && (
                <div className="flex flex-col gap-3.5">
                  <h3 className="text-xs font-bold text-white">Color & Light Grading</h3>

                  {/* Brightness */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={200}
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Saturation</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={200}
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Warmth */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Warmth / Tint</span>
                      <span>{warmth > 0 ? `+${warmth}` : warmth}</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={warmth}
                      onChange={(e) => setWarmth(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Blur */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Soft Blur</span>
                      <span>{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* 2. Filters */}
              {activeTab === 'filter' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white">Cinematic Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'original', name: 'Original Look', desc: 'Default capture' },
                      { id: 'cyberpunk', name: 'Cyberpunk Neon', desc: 'Futuristic glow' },
                      { id: 'noir', name: 'Noir B&W', desc: 'Deep high contrast' },
                      { id: 'golden', name: 'Golden Hour', desc: 'Sunset amber warmth' },
                      { id: 'emerald', name: 'Emerald Teal', desc: 'Cinematic teal-orange' },
                      { id: 'vintage', name: '70s Film', desc: 'Kodachrome sepia' },
                      { id: 'pop', name: 'Vivid Pop', desc: 'Punchy saturated' },
                    ].map((flt) => (
                      <button
                        key={flt.id}
                        onClick={() => applyPresetFilter(flt.id)}
                        className="p-2.5 rounded-xl border border-slate-800 hover:border-indigo-500 bg-slate-950 text-left transition flex flex-col gap-0.5"
                      >
                        <span className="text-xs font-bold text-white">{flt.name}</span>
                        <span className="text-[10px] text-slate-400">{flt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Transform */}
              {activeTab === 'transform' && (
                <div className="flex flex-col gap-3.5">
                  <h3 className="text-xs font-bold text-white">Orientation & Geometry</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <RotateCw className="w-4 h-4 text-indigo-400" />
                      Rotate 90°
                    </button>
                    <button
                      onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                      className="py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <RotateCcw className="w-4 h-4 text-indigo-400" />
                      Rotate -90°
                    </button>
                    <button
                      onClick={() => setFlipH((f) => !f)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        flipH
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <FlipHorizontal className="w-4 h-4 text-indigo-400" />
                      Flip Horizontal
                    </button>
                    <button
                      onClick={() => setFlipV((f) => !f)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        flipV
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <FlipVertical className="w-4 h-4 text-indigo-400" />
                      Flip Vertical
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Background Remove */}
              {activeTab === 'bg-remove' && (
                <div className="flex flex-col gap-3.5">
                  <h3 className="text-xs font-bold text-white">Chroma Color Isolator & Cutout</h3>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Background Key Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgKeyColor}
                        onChange={(e) => setBgKeyColor(e.target.value)}
                        className="w-10 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgKeyColor}
                        onChange={(e) => setBgKeyColor(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Color Tolerance</span>
                      <span>{bgTolerance}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={80}
                      value={bgTolerance}
                      onChange={(e) => setBgTolerance(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <button
                    onClick={handleRemoveBackground}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Cut Out Background
                  </button>
                </div>
              )}

              {/* 5. Watermark & Text */}
              {activeTab === 'watermark' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white">Text & Watermark Badge</h3>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. © 2026 Studio"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Position</label>
                      <select
                        value={watermarkPosition}
                        onChange={(e) => setWatermarkPosition(e.target.value as any)}
                        className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                        <option value="top-right">Top Right</option>
                        <option value="center">Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Font Size</label>
                      <input
                        type="number"
                        min={12}
                        max={64}
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Annotate */}
              {activeTab === 'annotate' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white">Freehand Ink Brush</h3>
                  <div className="flex items-center gap-2">
                    {['#ff0055', '#00f0ff', '#38ef7d', '#ffe600', '#ffffff', '#0f172a'].map((col) => (
                      <button
                        key={col}
                        onClick={() => setBrushColor(col)}
                        className={`w-7 h-7 rounded-full border transition ${
                          brushColor === col ? 'ring-2 ring-indigo-500 scale-110 border-white' : 'border-slate-700'
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Brush Size</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Draw directly onto the photo canvas on the right.</p>
                </div>
              )}

              {/* 7. Resize */}
              {activeTab === 'resize' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white">Dimensions & Social Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Width (px)</label>
                      <input
                        type="number"
                        value={resizeW}
                        onChange={(e) => {
                          const w = Number(e.target.value);
                          setResizeW(w);
                          if (lockAspect && aspectRatioVal > 0) setResizeH(Math.round(w / aspectRatioVal));
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Height (px)</label>
                      <input
                        type="number"
                        value={resizeH}
                        onChange={(e) => {
                          const h = Number(e.target.value);
                          setResizeH(h);
                          if (lockAspect && aspectRatioVal > 0) setResizeW(Math.round(h * aspectRatioVal));
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {socialPresets.map((sp) => (
                      <button
                        key={sp.name}
                        onClick={() => {
                          setLockAspect(false);
                          setResizeW(sp.w);
                          setResizeH(sp.h);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300 hover:text-white transition"
                      >
                        {sp.name} ({sp.w}x{sp.h})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Compress & Format */}
              {activeTab === 'compress' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-white">Compression & Format Converter</h3>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Export Format</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['image/webp', 'image/png', 'image/jpeg', 'image/avif'].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setTargetFormat(fmt as any)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                            targetFormat === fmt
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {fmt.split('/')[1].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Quality</span>
                      <span>{compressQuality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={compressQuality}
                      onChange={(e) => setCompressQuality(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                    <span>Estimated Size:</span>
                    <span className="font-bold text-emerald-400">{(previewFileSize / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Viewport Canvas (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900 border border-slate-800 min-h-[480px]">
            <div className="relative overflow-auto max-w-full max-h-[70vh] flex items-center justify-center rounded-xl bg-slate-950/80 p-2 border border-slate-800 shadow-2xl">
              <canvas
                ref={previewCanvasRef}
                onMouseDown={startDrawing}
                onMouseMove={drawMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={`max-w-full max-h-[60vh] object-contain rounded-lg ${
                  activeTab === 'annotate' ? 'cursor-crosshair' : 'cursor-default'
                }`}
              />
            </div>

            <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-4 px-2">
              <span>
                {originalDimensions.width} × {originalDimensions.height} px
              </span>
              <span>Live GPU Canvas Engine</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
