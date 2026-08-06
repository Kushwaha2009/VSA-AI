import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import { VOICES_CATALOG, VoicePersona, findBestNativeVoice, auditionVoice } from '../../services/voiceRegistry';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  RotateCcw,
  Play,
  Square,
  Copy,
  Check,
  Send,
  Sliders,
  Globe,
  Settings,
  Scale,
  Brain,
  Zap,
  Activity,
  Bot,
  User,
  Volume1,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceTranscriptItem {
  id: string;
  sender: 'user' | 'lab';
  text: string;
  timestamp: string;
  audioDuration?: number;
}

interface LiveVoiceLabProps {
  compactMode?: boolean;
  onSendToChat?: (text: string) => void;
  onClose?: () => void;
}

export const LiveVoiceLab: React.FC<LiveVoiceLabProps> = ({
  compactMode = false,
  onSendToChat,
  onClose,
}) => {
  const { language } = useLanguage();
  const { showToast } = useToast();

  const [isLiveListening, setIsLiveListening] = useState<boolean>(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
  const [handsFreeMode, setHandsFreeMode] = useState<boolean>(true);
  const [liveSpeechLanguage, setLiveSpeechLanguage] = useState<string>(language || 'en');
  const [selectedVoicePersona, setSelectedVoicePersona] = useState<'trivi' | 'general' | 'developer'>('trivi');

  // Transcripts
  const [currentLiveTranscript, setCurrentLiveTranscript] = useState<string>('');
  const [transcriptHistory, setTranscriptHistory] = useState<VoiceTranscriptItem[]>([
    {
      id: 'tx_init',
      sender: 'lab',
      text: 'Welcome to the VSA Live Audio & Voice Lab! Choose from 10 distinct male & female AI voices, tap "Talk to Lab Live" or activate Hands-Free mode to talk in real-time.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // 10 Voices Selection State
  const [activeVoice, setActiveVoice] = useState<VoicePersona>(VOICES_CATALOG[0]); // Aria by default
  const [voiceGenderFilter, setVoiceGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [isAuditioning, setIsAuditioning] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [isVoicePickerOpen, setIsVoicePickerOpen] = useState<boolean>(false);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize SpeechSynthesis voices
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update pitch and rate when active voice changes
  useEffect(() => {
    if (activeVoice) {
      setSpeechPitch(activeVoice.pitch);
      setSpeechRate(activeVoice.rate);
    }
  }, [activeVoice]);

  // Auto-scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptHistory, currentLiveTranscript, isProcessingAi, isAiSpeaking]);

  // Animated Visualizer Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Base intensity based on active state
      const intensity = isLiveListening
        ? 35 + Math.sin(phase * 4) * 15
        : isAiSpeaking
        ? 28 + Math.cos(phase * 3) * 12
        : isProcessingAi
        ? 15 + Math.sin(phase * 6) * 8
        : 6;

      // Draw background ambient glow
      const grad = ctx.createRadialGradient(width / 2, centerY, 5, width / 2, centerY, width / 2);
      if (isLiveListening) {
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
        grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else if (isAiSpeaking) {
        grad.addColorStop(0, 'rgba(99, 102, 241, 0.25)');
        grad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else {
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Multiple harmonic sine waves
      const waves = [
        { freq: 0.015, speed: 0.08, color: isLiveListening ? '#ef4444' : isAiSpeaking ? '#6366f1' : '#10b981', amp: intensity },
        { freq: 0.025, speed: -0.06, color: isLiveListening ? '#f97316' : isAiSpeaking ? '#a855f7' : '#06b6d4', amp: intensity * 0.7 },
        { freq: 0.035, speed: 0.04, color: isLiveListening ? '#fbbf24' : isAiSpeaking ? '#38bdf8' : '#34d399', amp: intensity * 0.4 },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.lineWidth = isLiveListening || isAiSpeaking ? 2.5 : 1.5;
        ctx.strokeStyle = w.color;

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * w.freq + phase * w.speed * 20) * w.amp * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      phase += 0.05;
      animFrameRef.current = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLiveListening, isAiSpeaking, isProcessingAi]);

  // Speech Synthesis Output (AI Speaks Aloud with chosen Voice Persona)
  const speakTextAloud = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`>]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = speechRate || activeVoice.rate;
    utterance.pitch = speechPitch || activeVoice.pitch;

    const nativeVoice = findBestNativeVoice(activeVoice, availableVoices, liveSpeechLanguage);
    if (nativeVoice) {
      utterance.voice = nativeVoice;
    }

    utterance.onstart = () => {
      setIsAiSpeaking(true);
    };

    utterance.onend = () => {
      setIsAiSpeaking(false);
      // If hands-free mode is on, resume listening for user response!
      if (handsFreeMode) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    utterance.onerror = () => {
      setIsAiSpeaking(false);
      if (handsFreeMode) {
        startListening();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Play Sample Audio for a Voice
  const handleAudition = (voice: VoicePersona, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAuditioning(voice.id);
    auditionVoice(
      voice,
      () => setIsAuditioning(voice.id),
      () => setIsAuditioning(null)
    );
  };

  // Process User Speech with Gemini AI
  const processLiveUserQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userEntry: VoiceTranscriptItem = {
      id: `tx_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setTranscriptHistory((prev) => [...prev, userEntry]);
    setCurrentLiveTranscript('');
    setIsProcessingAi(true);

    try {
      // Persona instructions with voice style
      let systemPrompt = '';
      if (selectedVoicePersona === 'trivi') {
        systemPrompt = `You are Trivi, speaking live through the VSA Live Voice Lab to a user. Voice Style: ${activeVoice.systemPromptStyle || ''}.
Give clear, spoken, conversational legal guidance in plain words without jargon. Keep answers concise, clear, and easy to listen to (3-4 sentences max).`;
      } else {
        systemPrompt = `You are VSA AI speaking live in voice audio mode as ${activeVoice.name}. Voice Style: ${activeVoice.systemPromptStyle || ''}. Keep responses conversational, concise, natural, and friendly (3-4 sentences max for spoken audio).`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          systemInstruction: systemPrompt,
          persona: selectedVoicePersona === 'trivi' ? 'Trivi (Legal AI)' : `${activeVoice.name} (${activeVoice.gender})`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process voice query');

      const labReply: VoiceTranscriptItem = {
        id: `tx_lab_${Date.now()}`,
        sender: 'lab',
        text: data.text || 'I have processed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setTranscriptHistory((prev) => [...prev, labReply]);

      trackFeatureUsage('ai-chat', 'Live Voice Lab Speech Query', {
        persona: selectedVoicePersona,
        subFeature: `${activeVoice.id} (${activeVoice.gender})`,
        details: queryText.slice(0, 50),
        status: 'success',
      });

      // Speak response aloud to the customer live
      speakTextAloud(data.text);
    } catch (err: any) {
      const errorMsg = `I had trouble connecting to the network. ${err.message}`;
      setTranscriptHistory((prev) => [
        ...prev,
        {
          id: `tx_err_${Date.now()}`,
          sender: 'lab',
          text: errorMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      speakTextAloud('Sorry, I encountered an error. Please try speaking again.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  // Start Live Speech Recognition
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('warning', 'Voice Input Not Supported', 'Web Speech API is unavailable in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        mai: 'hi-IN',
        bho: 'hi-IN',
        pa: 'pa-IN',
      };
      recognition.lang = langMap[liveSpeechLanguage] || 'en-US';

      recognition.onstart = () => {
        setIsLiveListening(true);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        setCurrentLiveTranscript(final || interim);

        if (final) {
          setIsLiveListening(false);
          processLiveUserQuery(final);
        }
      };

      recognition.onerror = () => {
        setIsLiveListening(false);
      };

      recognition.onend = () => {
        setIsLiveListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsLiveListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsLiveListening(false);
  };

  const stopAiSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  };

  const filteredVoices = VOICES_CATALOG.filter((v) => {
    if (voiceGenderFilter === 'all') return true;
    return v.gender === voiceGenderFilter;
  });

  return (
    <div
      id="live-voice-lab-container"
      className={`flex flex-col h-full bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl ${
        compactMode ? 'text-xs' : 'text-sm'
      }`}
    >
      {/* Voice Lab Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#111114]/90 backdrop-blur flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span>Live AI Voice Lab</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                10 HD Voices
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Speaking as <strong className="text-indigo-600 dark:text-indigo-400">{activeVoice.name}</strong> ({activeVoice.gender === 'female' ? 'Female' : 'Male'} · {activeVoice.title})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setIsVoicePickerOpen(!isVoicePickerOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              isVoicePickerOpen
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-[#18181c] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Select Voice (10)</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 10 Voice Selection Panel Dropdown */}
      <AnimatePresence>
        {isVoicePickerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] p-3.5 space-y-3 overflow-hidden shrink-0 shadow-inner"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Choose Voice Assistant (5 Female & 5 Male)</span>
              </span>

              {/* Gender Filter Tabs */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-200 dark:bg-[#18181c] text-[11px] font-bold">
                <button
                  onClick={() => setVoiceGenderFilter('all')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    voiceGenderFilter === 'all' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  All (10)
                </button>
                <button
                  onClick={() => setVoiceGenderFilter('female')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    voiceGenderFilter === 'female' ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  👩 5 Female
                </button>
                <button
                  onClick={() => setVoiceGenderFilter('male')}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    voiceGenderFilter === 'male' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  👨 5 Male
                </button>
              </div>
            </div>

            {/* Voices Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredVoices.map((voice) => {
                const isSelected = activeVoice.id === voice.id;
                const isPlaying = isAuditioning === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => {
                      setActiveVoice(voice);
                      showToast('info', `Voice Selected: ${voice.name}`, `${voice.gender === 'female' ? 'Female' : 'Male'} · ${voice.title}`);
                    }}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                        : 'bg-white dark:bg-[#18181c] border-slate-200 dark:border-white/5 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          voice.gender === 'female'
                            ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        }`}>
                          {voice.gender === 'female' ? 'Female' : 'Male'}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {voice.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {voice.title}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleAudition(voice, e)}
                      className={`mt-2 py-1 px-2 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                        isPlaying
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>{isPlaying ? 'Playing...' : 'Audition'}</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Pitch & Speed Fine-Tuning */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Pitch (Tone Depth)</span>
                  <span>{speechPitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.5"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Speech Rate (Speed)</span>
                  <span>{speechRate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.5"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Audio Visualizer Stage */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden shrink-0 min-h-[140px]">
        <canvas
          ref={canvasRef}
          width={600}
          height={140}
          className="w-full h-[120px] object-cover rounded-xl"
        />

        {/* Floating status badge */}
        <div className="absolute top-3 left-4 flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLiveListening
                ? 'bg-rose-500 animate-ping'
                : isAiSpeaking
                ? 'bg-indigo-500 animate-pulse'
                : isProcessingAi
                ? 'bg-amber-400 animate-bounce'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-[11px] font-mono font-bold text-slate-300">
            {isLiveListening
              ? '🎤 LISTENING LIVE...'
              : isAiSpeaking
              ? `🔊 ${activeVoice.name.toUpperCase()} SPEAKING ALOUD...`
              : isProcessingAi
              ? '⚡ REASONING...'
              : `READY (VOICE: ${activeVoice.name.toUpperCase()})`}
          </span>
        </div>

        {/* Live Talk Trigger Buttons */}
        <div className="absolute bottom-3 flex items-center gap-2">
          {!isLiveListening ? (
            <button
              id="btn-start-live-talk"
              onClick={startListening}
              className="flex items-center gap-2 py-2 px-5 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-bold text-xs rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Talk to Lab Live</span>
            </button>
          ) : (
            <button
              id="btn-stop-live-talk"
              onClick={stopListening}
              className="flex items-center gap-2 py-2 px-5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full shadow-lg shadow-rose-600/30 animate-pulse transition-all"
            >
              <MicOff className="w-4 h-4" />
              <span>Stop Listening</span>
            </button>
          )}

          {isAiSpeaking && (
            <button
              onClick={stopAiSpeech}
              className="flex items-center gap-1.5 py-2 px-3 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-semibold rounded-full border border-white/20 backdrop-blur transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Mute</span>
            </button>
          )}
        </div>
      </div>

      {/* Hands-Free & Language Settings Strip */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111114] flex flex-wrap items-center justify-between gap-2 shrink-0">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={handsFreeMode}
            onChange={(e) => setHandsFreeMode(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Hands-Free Continuous Loop
          </span>
        </label>

        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={liveSpeechLanguage}
            onChange={(e) => setLiveSpeechLanguage(e.target.value)}
            className="py-0.5 px-2 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="en">English (US/UK)</option>
            <option value="hi">हिन्दी (Hindi)</option>
            <option value="mai">मैथिली (Maithili)</option>
            <option value="bho">भोजपुरी (Bhojpuri)</option>
            <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
          </select>
        </div>
      </div>

      {/* Live Transcript Stream */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50/50 dark:bg-[#09090b]">
        {transcriptHistory.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col space-y-1 ${
              item.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <span>{item.sender === 'user' ? 'Customer (Live)' : `Lab (${activeVoice.name} · ${activeVoice.gender === 'female' ? 'Female' : 'Male'})`}</span>
              <span>·</span>
              <span>{item.timestamp}</span>
            </div>
            <div
              className={`p-3 rounded-xl text-xs leading-relaxed max-w-[90%] shadow-sm ${
                item.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-[#18181c] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{item.text}</p>
              {item.sender === 'lab' && (
                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => speakTextAloud(item.text)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Replay with {activeVoice.name}</span>
                  </button>
                  {onSendToChat && (
                    <button
                      onClick={() => onSendToChat(item.text)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send to Chat</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {currentLiveTranscript && (
          <div className="flex flex-col items-end space-y-1 animate-pulse">
            <span className="text-[10px] text-rose-500 font-mono font-bold">Transcribing Live...</span>
            <div className="p-3 rounded-xl text-xs bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 max-w-[90%]">
              {currentLiveTranscript}
            </div>
          </div>
        )}

        {isProcessingAi && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-white/10 max-w-xs animate-pulse">
            <Bot className="w-4 h-4 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-500 font-medium">{activeVoice.name} is formulating spoken response...</span>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Manual Input Fallback */}
      <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#111114] flex items-center gap-2 shrink-0">
        <input
          type="text"
          placeholder={`Or type a question to hear ${activeVoice.name} speak live...`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
              processLiveUserQuery((e.target as HTMLInputElement).value.trim());
              (e.target as HTMLInputElement).value = '';
            }
          }}
          className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={() => {
            setTranscriptHistory([]);
            showToast('info', 'Transcript Cleared');
          }}
          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          title="Clear transcript"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
