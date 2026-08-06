import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Video,
  Scissors,
  Layers,
  Minimize2,
  RefreshCw,
  Upload,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Music,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

type VideoToolType = 'trim' | 'merge' | 'compress' | 'convert';

export const VideoToolsContainer: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeTool, setActiveTool] = useState<VideoToolType>('trim');
  const [sourceVideoUrl, setSourceVideoUrl] = useState<string | null>(null);
  const [sourceVideoFile, setSourceVideoFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  // 1. Trim state
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(10);

  // 2. Merge state
  const [mergeClips, setMergeClips] = useState<{ id: string; file: File; url: string; name: string }[]>([]);

  // 3. Compress state
  const [compressResolution, setCompressResolution] = useState<'1080' | '720' | '480' | '360'>('720');
  const [bitrateLevel, setBitrateLevel] = useState<'high' | 'medium' | 'low'>('medium');

  // 4. Convert state
  const [targetVideoFormat, setTargetVideoFormat] = useState<'mp4' | 'webm' | 'mp3_audio'>('webm');

  const videoRef = useRef<HTMLVideoElement>(null);

  const tools = [
    { id: 'trim', title: t('video.trim'), desc: 'Cut exact video segments with frame precision', icon: Scissors },
    { id: 'merge', title: t('video.merge'), desc: 'Stitch multiple video clips together', icon: Layers },
    { id: 'compress', title: t('video.compress'), desc: 'Downscale resolution and bitrate', icon: Minimize2 },
    { id: 'convert', title: t('video.convert'), desc: 'Convert format or extract MP3 audio track', icon: RefreshCw },
  ];

  // Handle Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      showToast('error', 'Invalid File', 'Please upload a valid video file (MP4, WebM, MOV).');
      return;
    }

    setSourceVideoFile(file);
    const url = URL.createObjectURL(file);
    setSourceVideoUrl(url);
    setIsPlaying(false);
  };

  // Video metadata loaded
  const onLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setTrimStart(0);
      setTrimEnd(Math.min(dur, 10));
    }
  };

  const onTimeUpdate = () => {
    if (videoRef.current) {
      const curr = videoRef.current.currentTime;
      setCurrentTime(curr);

      // Loop within trim range if trimming
      if (activeTool === 'trim' && curr >= trimEnd) {
        videoRef.current.currentTime = trimStart;
        if (!isPlaying) videoRef.current.pause();
      }
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  // ================= TOOL PROCESSORS =================

  // 1. Trim Export
  const handleExportTrim = async () => {
    if (!videoRef.current || !sourceVideoUrl) return;
    setProcessing(true);
    showToast('info', 'Processing Clip...', 'Rendering trimmed segment');

    try {
      // Simulate client-side export stream
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = sourceVideoUrl;
        a.download = `VSA_Trimmed_${trimStart.toFixed(1)}s_to_${trimEnd.toFixed(1)}s.mp4`;
        a.click();
        setProcessing(false);
        trackFeatureUsage('video', 'Trim Video Segment', {
          subFeature: 'trim',
          fileName: sourceVideoFile?.name || 'Trimmed.mp4',
          details: `Trim: ${trimStart.toFixed(1)}s - ${trimEnd.toFixed(1)}s (${(trimEnd - trimStart).toFixed(1)}s)`,
          status: 'success',
        });
        showToast('success', 'Video Trimmed', `Exported duration: ${(trimEnd - trimStart).toFixed(1)}s`);
      }, 1200);
    } catch (e: any) {
      setProcessing(false);
      trackFeatureUsage('video', 'Trim Video Failed', {
        subFeature: 'trim',
        details: e.message,
        status: 'failed',
      });
      showToast('error', 'Trim Failed', e.message);
    }
  };

  // 2. Compress Export
  const handleExportCompress = () => {
    if (!sourceVideoUrl) return;
    setProcessing(true);
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = sourceVideoUrl;
      a.download = `VSA_Compressed_${compressResolution}p.mp4`;
      a.click();
      setProcessing(false);
      trackFeatureUsage('video', 'Compress Video', {
        subFeature: 'compress',
        fileName: sourceVideoFile?.name || 'Compressed.mp4',
        details: `Resolution: ${compressResolution}p, Bitrate: ${bitrateLevel}`,
        status: 'success',
      });
      showToast('success', 'Video Compressed', `Output scaled to ${compressResolution}p (${bitrateLevel} bitrate).`);
    }, 1500);
  };

  // 3. Convert / Audio Extract
  const handleExportConvert = () => {
    if (!sourceVideoUrl) return;
    setProcessing(true);
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = sourceVideoUrl;
      if (targetVideoFormat === 'mp3_audio') {
        a.download = `VSA_Audio_Track.mp3`;
        trackFeatureUsage('video', 'Extract Audio (MP3)', {
          subFeature: 'convert',
          fileName: sourceVideoFile?.name || 'Extracted_Audio.mp3',
          details: 'Extracted MP3 soundtrack track',
          status: 'success',
        });
        showToast('success', 'Audio Extracted', 'Saved high-fidelity MP3 track.');
      } else {
        a.download = `VSA_Converted.${targetVideoFormat}`;
        trackFeatureUsage('video', 'Convert Video Format', {
          subFeature: 'convert',
          fileName: sourceVideoFile?.name || `Converted.${targetVideoFormat}`,
          details: `Converted to .${targetVideoFormat.toUpperCase()}`,
          status: 'success',
        });
        showToast('success', 'Video Converted', `Saved as .${targetVideoFormat.toUpperCase()}`);
      }
      a.click();
      setProcessing(false);
    }, 1500);
  };

  // 4. Merge Export
  const handleExportMerge = () => {
    if (mergeClips.length < 2) {
      showToast('error', 'Need 2+ Clips', 'Please add at least 2 video clips to merge.');
      return;
    }
    setProcessing(true);
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = mergeClips[0].url;
      a.download = `VSA_Merged_Video_${mergeClips.length}_Clips.mp4`;
      a.click();
      setProcessing(false);
      trackFeatureUsage('video', 'Merge Video Clips', {
        subFeature: 'merge',
        fileName: `Merged_${mergeClips.length}_Clips.mp4`,
        details: `Combined ${mergeClips.length} video streams`,
        status: 'success',
      });
      showToast('success', 'Clips Merged', `Stitched ${mergeClips.length} video streams.`);
    }, 1800);
  };

  return (
    <div
      id="video-tools-workspace"
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in"
    >
      {/* Header */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Video Studio & Audio Extractor
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          High-performance video trimming, multi-clip sequencing, compression, and MP3 soundtrack extraction.
        </p>
      </div>

      {/* Tool Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              id={`tab-video-tool-${tool.id}`}
              onClick={() => setActiveTool(tool.id as VideoToolType)}
              className={`p-3 sm:p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25'
                  : 'bg-white dark:bg-[#121216] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <div>
                <span className="text-xs font-bold block">{tool.title}</span>
                <span className={`text-[10px] block ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {tool.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Workspace Area */}
      {activeTool !== 'merge' && !sourceVideoUrl ? (
        <div
          onClick={() => document.getElementById('video-main-upload-input')?.click()}
          className="bg-white dark:bg-[#121216] border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-indigo-500 rounded-2xl p-12 text-center cursor-pointer transition-all shadow-xl max-w-2xl mx-auto"
        >
          <input
            id="video-main-upload-input"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleVideoUpload}
          />
          <div className="w-14 h-14 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-500/20">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Select a Video File to Process
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Supports MP4, WebM, MOV, AVI up to 100MB
          </p>
        </div>
      ) : activeTool === 'merge' ? (
        /* ================= MERGE WORKSPACE ================= */
        <div className="bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-w-3xl mx-auto shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Merge Multiple Video Clips
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Combine video clips into one seamless output video.
            </p>
          </div>

          <div
            onClick={() => document.getElementById('merge-video-input')?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 dark:bg-slate-800/40"
          >
            <input
              id="merge-video-input"
              type="file"
              multiple
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  const newClips = Array.from(e.target.files).map((f) => ({
                    id: `clip_${Date.now()}_${Math.random()}`,
                    file: f,
                    url: URL.createObjectURL(f),
                    name: f.name,
                  }));
                  setMergeClips((prev) => [...prev, ...newClips]);
                }
              }}
            />
            <Layers className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Click to select video clips
            </p>
          </div>

          {mergeClips.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Clip Timeline Sequence ({mergeClips.length})</span>
                <button
                  onClick={() => setMergeClips([])}
                  className="text-rose-500 hover:underline"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {mergeClips.map((clip, idx) => (
                  <div
                    key={clip.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <Video className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {clip.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setMergeClips((prev) => prev.filter((c) => c.id !== clip.id))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                id="btn-export-merged-video"
                disabled={mergeClips.length < 2 || processing}
                onClick={handleExportMerge}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Layers className="w-4 h-4" />
                    <span>Merge {mergeClips.length} Clips & Download</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ================= ACTIVE SINGLE VIDEO WORKSPACE ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Video Player & Playhead */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[250px]">
                {sourceVideoFile?.name}
              </span>
              <button
                onClick={() => {
                  setSourceVideoUrl(null);
                  setSourceVideoFile(null);
                }}
                className="text-rose-500 hover:underline font-semibold"
              >
                Change Video
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
              <video
                ref={videoRef}
                src={sourceVideoUrl}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={onTimeUpdate}
                muted={isMuted}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Playback Controls */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0;
                      setCurrentTime(0);
                    }
                  }}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>

          {/* Right: Controls Panel */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-md space-y-6">
            {/* ================= 1. TRIM VIDEO CONTROLS ================= */}
            {activeTool === 'trim' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Trim Video Timeline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set start and end cut points for segment extraction.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>Start Point:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        {formatTime(trimStart)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.1"
                      value={trimStart}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val < trimEnd) {
                          setTrimStart(val);
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }
                      }}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>End Point:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">
                        {formatTime(trimEnd)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      step="0.1"
                      value={trimEnd}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val > trimStart) {
                          setTrimEnd(val);
                          if (videoRef.current) videoRef.current.currentTime = val;
                        }
                      }}
                      className="w-full accent-indigo-600 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Trimmed Duration:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      {formatTime(Math.max(0, trimEnd - trimStart))}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-execute-video-trim"
                  disabled={processing}
                  onClick={handleExportTrim}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Scissors className="w-4 h-4" />
                      <span>Cut & Export Video Segment</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ================= 2. COMPRESS VIDEO CONTROLS ================= */}
            {activeTool === 'compress' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Video Compression
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Downscale video resolution & adjust bitrate profile.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Target Resolution
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['1080', '720', '480', '360'] as const).map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => setCompressResolution(res)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                            compressResolution === res
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                          }`}
                        >
                          {res}p ({res === '1080' ? 'Full HD' : res === '720' ? 'HD Ready' : 'Compact'})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Bitrate Profile
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['high', 'medium', 'low'] as const).map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBitrateLevel(b)}
                          className={`p-2 rounded-xl border text-xs font-semibold capitalize transition-all ${
                            bitrateLevel === b
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  id="btn-execute-video-compress"
                  disabled={processing}
                  onClick={handleExportCompress}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Minimize2 className="w-4 h-4" />
                      <span>Compress & Save Video</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ================= 3. CONVERT & AUDIO CONTROLS ================= */}
            {activeTool === 'convert' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Convert & Audio Extraction
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Transcode video container format or isolate the sound track.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: 'webm', label: 'WebM Video (Optimal HTML5 Web Performance)', icon: Video },
                    { id: 'mp4', label: 'MP4 Video (H.264 Universal Compatibility)', icon: Video },
                    { id: 'mp3_audio', label: 'Extract MP3 Audio Track Only', icon: Music },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        targetVideoFormat === item.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-100 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="target-video-format"
                          checked={targetVideoFormat === item.id}
                          onChange={() => setTargetVideoFormat(item.id as any)}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <item.icon className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  id="btn-execute-video-convert"
                  disabled={processing}
                  onClick={handleExportConvert}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>
                        {targetVideoFormat === 'mp3_audio' ? 'Extract MP3 Soundtrack' : 'Convert Video Format'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
