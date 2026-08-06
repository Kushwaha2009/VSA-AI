import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Sliders,
  Layers,
  Wand2,
  Dice5,
  Eye,
  CheckCircle2,
  Upload,
  Sun,
  Palette,
  Scissors,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AiImageStudioProps {
  onUseInEditor: (imageUrl: string) => void;
}

const promptIdeas = [
  'Futuristic neon-lit Mumbai with flying cars and holographic banners, cinematic lighting 8k',
  'Majestic snow leopard resting on icy Himalayan cliff at golden hour, hyperrealistic photography',
  'Cozy Nordic glass cabin surrounded by pine forest in snow under Aurora Borealis, warm lights',
  'Cute robotic barista serving a cup of glowing starry coffee, Pixar 3D animated style',
  'Traditional Indian Diwali festival celebration with glowing clay diyas and fireworks over river Ganges',
  'Cyberpunk samurai standing in rainy Tokyo alley with glowing energy katana, reflections on wet road',
];

const styles = [
  { id: 'photorealistic', name: 'Photorealistic', icon: '📸', desc: '8K Ultra-realistic camera capture' },
  { id: 'anime', name: 'Anime & Manga', icon: '✨', desc: 'Studio Ghibli & Shinkai aesthetic' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', icon: '🌆', desc: 'Glowing holograms & futuristic nights' },
  { id: '3d-render', name: '3D Pixar Style', icon: '🧸', desc: 'Soft ray-traced characters & clay' },
  { id: 'oil', name: 'Classical Oil', icon: '🎨', desc: 'Textured canvas & rich impasto' },
  { id: 'watercolor', name: 'Watercolor Art', icon: '🖌️', desc: 'Ethereal pastel bleeds & gradients' },
  { id: 'sketch', name: 'Pencil Sketch', icon: '✏️', desc: 'Architectural graphite line art' },
  { id: 'vintage', name: 'Vintage 70s', icon: '📼', desc: 'Kodachrome analog film mood' },
  { id: 'vector', name: 'Flat Vector', icon: '📐', desc: 'Modern minimalist graphic style' },
];

export const AiImageStudio: React.FC<AiImageStudioProps> = ({ onUseInEditor }) => {
  const { showToast } = useToast();

  const [studioMode, setStudioMode] = useState<'text2img' | 'remix'>('text2img');

  // Text2Img State
  const [prompt, setPrompt] = useState<string>(promptIdeas[0]);
  const [style, setStyle] = useState<string>('photorealistic');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [quality, setQuality] = useState<'high' | 'ultra'>('high');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [engineUsed, setEngineUsed] = useState<string>('');

  // Remix & Edit State
  const [remixSourceImage, setRemixSourceImage] = useState<string | null>(null);
  const [remixPrompt, setRemixPrompt] = useState<string>('Add soft golden hour sunlight and cinematic depth of field');
  const [remixTask, setRemixTask] = useState<'relight' | 'style_transfer' | 'bg_swap' | 'retouch' | 'edit'>('relight');
  const remixFileInputRef = useRef<HTMLInputElement>(null);

  const [history, setHistory] = useState<
    Array<{ id: string; url: string; prompt: string; style: string; timestamp: string; engine?: string }>
  >(() => {
    try {
      const saved = localStorage.getItem('vsa_ai_generated_images');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vsa_ai_generated_images', JSON.stringify(history));
  }, [history]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast('error', 'Prompt Required', 'Please enter a description for your image.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          style,
          aspectRatio,
          quality,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate image');

      setGeneratedImage(data.imageUrl);
      setEngineUsed(data.engine || 'AI Engine');

      const newEntry = {
        id: `gen_${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        style,
        timestamp: new Date().toLocaleTimeString(),
        engine: data.engine,
      };

      setHistory((prev) => [newEntry, ...prev.slice(0, 11)]);

      trackFeatureUsage('image', 'AI Image Generated', {
        subFeature: 'ai-generate',
        details: `Style: ${style}, Engine: ${data.engine}`,
        status: 'success',
      });

      showToast('success', 'Artwork Created!', 'Your AI image has been generated.');
    } catch (err: any) {
      showToast('error', 'Generation Error', err.message || 'Image generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemixGenerate = async () => {
    if (!remixSourceImage) {
      showToast('error', 'Image Required', 'Please upload a base image to remix or edit.');
      return;
    }
    if (!remixPrompt.trim()) {
      showToast('error', 'Prompt Required', 'Please enter editing instructions.');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/image/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: remixSourceImage,
          prompt: remixPrompt.trim(),
          task: remixTask,
          style,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to edit image');

      setGeneratedImage(data.imageUrl);
      setEngineUsed(data.engine || 'AI Remix Engine');

      const newEntry = {
        id: `remix_${Date.now()}`,
        url: data.imageUrl,
        prompt: remixPrompt.trim(),
        style: remixTask,
        timestamp: new Date().toLocaleTimeString(),
        engine: data.engine,
      };

      setHistory((prev) => [newEntry, ...prev.slice(0, 11)]);
      showToast('success', 'AI Remix Complete!', 'Image transformed successfully.');
    } catch (err: any) {
      showToast('error', 'Remix Failed', err.message || 'Image edit failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemixUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setRemixSourceImage(event.target?.result as string);
      showToast('info', 'Image Loaded', 'Base image ready for AI Remix.');
    };
    reader.readAsDataURL(file);
  };

  const handleSurpriseMe = () => {
    const randomIndex = Math.floor(Math.random() * promptIdeas.length);
    setPrompt(promptIdeas[randomIndex]);
    showToast('info', 'Prompt Selected', 'Idea loaded into prompt field.');
  };

  const handleDownload = (imgUrl: string, promptText: string) => {
    const link = document.createElement('a');
    link.href = imgUrl;
    link.download = `VSA_AI_${promptText.slice(0, 20).replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Downloaded', 'Image saved to your downloads.');
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    showToast('info', 'Copied', 'Image data URL copied to clipboard.');
  };

  return (
    <div id="ai-image-studio" className="flex flex-col gap-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Image Generator & Neural Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Turn your imagination into high-resolution visuals and edit existing images with Gemini & Imagen 3.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setStudioMode('text2img')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              studioMode === 'text2img'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Text to Image
          </button>
          <button
            onClick={() => setStudioMode('remix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              studioMode === 'remix'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            AI Image Remix & Edit
          </button>
        </div>
      </div>

      {/* Main Grid: Prompt Controls (Left) & Live Canvas / Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {studioMode === 'text2img' ? (
            <>
              {/* Prompt Area */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span>Prompt Description</span>
                    <span className="text-[11px] text-slate-500">({prompt.length} chars)</span>
                  </label>
                  <button
                    onClick={handleSurpriseMe}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                  >
                    <Dice5 className="w-3 h-3" />
                    Surprise Me
                  </button>
                </div>
                <textarea
                  id="ai-prompt-input"
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to create in vivid detail..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />

                {/* Quick Inspiration Chips */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-500 self-center mr-1">Try:</span>
                  {['Cyberpunk City', 'Himalayan Tiger', 'Glass Villa', 'Anime Galaxy'].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPrompt(`${chip}, cinematic volumetric lighting, 8k masterpiece`)}
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 hover:text-white transition"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio & Quality Selector */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-2 block">Aspect Ratio</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: '1:1', label: '1:1 Square' },
                      { id: '16:9', label: '16:9 Banner' },
                      { id: '9:16', label: '9:16 Story' },
                      { id: '4:3', label: '4:3 Standard' },
                    ].map((ar) => (
                      <button
                        key={ar.id}
                        onClick={() => setAspectRatio(ar.id as any)}
                        className={`py-2 rounded-xl text-xs font-bold transition border ${
                          aspectRatio === ar.id
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {ar.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs font-semibold text-slate-300">Rendering Resolution</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setQuality('high')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        quality === 'high'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      High (1K)
                    </button>
                    <button
                      onClick={() => setQuality('ultra')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        quality === 'ultra'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Ultra HD (2K)
                    </button>
                  </div>
                </div>
              </div>

              {/* Style Presets */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300 mb-2 block">Aesthetic Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {styles.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStyle(st.id)}
                      className={`p-2 rounded-xl text-left border transition ${
                        style === st.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-base mb-1">{st.icon}</div>
                      <div className="text-[11px] font-bold truncate">{st.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-600/25 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating AI Visual...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Artwork
                  </>
                )}
              </button>
            </>
          ) : (
            /* REMIX & EDIT MODE */
            <div className="flex flex-col gap-4">
              {/* Upload reference */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-3">
                <label className="text-xs font-semibold text-slate-300">Base Image to Edit</label>
                {remixSourceImage ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 h-40 bg-slate-950 flex items-center justify-center">
                    <img src={remixSourceImage} alt="Remix Source" className="max-h-full max-w-full object-contain" />
                    <button
                      onClick={() => setRemixSourceImage(null)}
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/70 text-white text-[10px] hover:bg-black"
                    >
                      Replace
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => remixFileInputRef.current?.click()}
                    className="cursor-pointer border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 flex flex-col items-center justify-center text-center transition bg-slate-950/50"
                  >
                    <Upload className="w-6 h-6 text-indigo-400 mb-2" />
                    <span className="text-xs font-bold text-slate-300">Upload Reference Image</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, or WEBP</span>
                    <input
                      ref={remixFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleRemixUpload}
                    />
                  </div>
                )}
              </div>

              {/* Task selector */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300 mb-2 block">Remix Preset</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'relight', label: 'Cinematic Relight', icon: Sun, prompt: 'Add dramatic volumetric lighting and warm rim light' },
                    { id: 'style_transfer', label: 'Style Transfer', icon: Palette, prompt: 'Transform image into anime illustration style' },
                    { id: 'bg_swap', label: 'Replace Background', icon: Scissors, prompt: 'Place subject against a futuristic cyberpunk backdrop' },
                    { id: 'retouch', label: 'Retouch & Enhance', icon: Eye, prompt: 'Sharpen details, clean noise, and enhance color vibrancy' },
                  ].map((tsk) => (
                    <button
                      key={tsk.id}
                      onClick={() => {
                        setRemixTask(tsk.id as any);
                        setRemixPrompt(tsk.prompt);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition text-xs flex flex-col gap-1 ${
                        remixTask === tsk.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold flex items-center gap-1">
                        <tsk.icon className="w-3.5 h-3.5" />
                        {tsk.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Instruction Prompt */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300">Editing Instructions</label>
                <textarea
                  rows={3}
                  value={remixPrompt}
                  onChange={(e) => setRemixPrompt(e.target.value)}
                  placeholder="Describe how AI should modify this image..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Execute Remix Button */}
              <button
                onClick={handleRemixGenerate}
                disabled={isGenerating || !remixSourceImage || !remixPrompt.trim()}
                className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 transition shadow-xl shadow-indigo-600/25 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Transforming Image...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Remix with AI
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Active Result & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          {/* Main Visual Display */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
            {generatedImage ? (
              <div className="w-full flex flex-col items-center gap-4">
                <div className="w-full max-h-[500px] flex items-center justify-center overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
                  <img
                    src={generatedImage}
                    alt="AI Generated Artwork"
                    className="max-h-[500px] w-auto object-contain rounded-lg"
                  />
                </div>

                {/* Quick Action Toolbar */}
                <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                      Engine: {engineUsed}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyUrl(generatedImage)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => onUseInEditor(generatedImage)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Edit in Photo Studio</span>
                    </button>

                    <button
                      onClick={() => handleDownload(generatedImage, prompt)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/20"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Canvas Ready for Generation</h3>
                <p className="text-xs text-slate-400 max-w-sm">
                  Enter your prompt or upload an image on the left, then click Generate to create AI visuals.
                </p>
              </div>
            )}
          </div>

          {/* Creation History Tray */}
          {history.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Recent Creations ({history.length})
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setGeneratedImage(item.url);
                      setPrompt(item.prompt);
                    }}
                    className="group relative cursor-pointer aspect-square rounded-xl overflow-hidden border border-slate-800 hover:border-indigo-500 transition bg-slate-950"
                  >
                    <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition p-1.5 flex flex-col justify-end">
                      <p className="text-[9px] text-white font-medium line-clamp-2">{item.prompt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

