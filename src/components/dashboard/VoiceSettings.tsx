import React, { useState, useEffect } from 'react';
import {
  VOICES_CATALOG,
  VoicePersona,
  getSelectedVoiceId,
  setSelectedVoiceId,
  getVoiceById,
  speakText,
  stopSpeech,
  isSpeaking,
} from '../../services/voiceRegistry';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Check,
  Sparkles,
  User,
  Sliders,
  Radio,
  Music,
  Scale,
  Code,
  Compass,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceSettingsProps {
  onVoiceChanged?: (newVoice: VoicePersona) => void;
  compact?: boolean;
}

export const VoiceSettings: React.FC<VoiceSettingsProps> = ({
  onVoiceChanged,
  compact = false,
}) => {
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string>(getSelectedVoiceId());
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [genderFilter, setGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [customTestPhrase, setCustomTestPhrase] = useState<string>('');
  const [pitchModifier, setPitchModifier] = useState<number>(1.0);
  const [rateModifier, setRateModifier] = useState<number>(1.0);

  const currentPersona = getVoiceById(selectedId) || VOICES_CATALOG[0];

  const femaleVoices = VOICES_CATALOG.filter((v) => v.gender === 'female');
  const maleVoices = VOICES_CATALOG.filter((v) => v.gender === 'male');

  // Listen to external voice change events
  useEffect(() => {
    const handleVoiceChange = (e: any) => {
      if (e.detail?.voiceId) {
        setSelectedId(e.detail.voiceId);
      }
    };
    window.addEventListener('vsa-voice-changed', handleVoiceChange);
    return () => {
      stopSpeech();
      window.removeEventListener('vsa-voice-changed', handleVoiceChange);
    };
  }, []);

  const handleSelectVoice = (id: string) => {
    setSelectedId(id);
    setSelectedVoiceId(id);
    const persona = getVoiceById(id);
    if (persona && onVoiceChanged) {
      onVoiceChanged(persona);
    }
    trackFeatureUsage('ai-chat', 'Voice Persona Changed', {
      persona: persona?.name || id,
      subFeature: `${persona?.gender || 'voice'} (${id})`,
      status: 'success',
    });
    showToast('success', 'AI Voice Updated', `Active voice set to ${persona?.name || id}`);
  };

  const handleToggleAudition = () => {
    if (isPlayingAudio || isSpeaking()) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const textToPlay =
        customTestPhrase.trim() ||
        currentPersona.sampleText ||
        `Hello! I am ${currentPersona.name}, your selected AI voice assistant.`;

      speakText(
        textToPlay,
        currentPersona.id,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        (err) => {
          setIsPlayingAudio(false);
          showToast('error', 'Voice Audition Failed', err?.message || 'Speech Synthesis error');
        }
      );
    }
  };

  return (
    <div
      id="voice-settings-module"
      className={`bg-white dark:bg-[#111114] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm ${
        compact ? 'p-3.5 space-y-3' : 'p-5 sm:p-6 space-y-5'
      }`}
    >
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>AI Voice Persona Settings</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                20 HD Personas (10 Female, 10 Male)
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select your preferred attractive AI voice persona for Text-to-Speech playback, audio summaries, and live chat.
            </p>
          </div>
        </div>

        {/* Live Active Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active: {currentPersona.name} ({currentPersona.gender === 'female' ? 'Female' : 'Male'})
          </span>
        </div>
      </div>

      {/* Primary Requirement: Dropdown Menu to select from 20 distinct AI voice personas (10 female, 10 male) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="select-ai-voice-persona"
            className="block text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Choose Voice Persona (Drop-down Menu)
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            ID: {currentPersona.id}
          </span>
        </div>

        <div className="relative">
          <select
            id="select-ai-voice-persona"
            value={selectedId}
            onChange={(e) => handleSelectVoice(e.target.value)}
            className="w-full py-2.5 px-3.5 bg-slate-50 dark:bg-[#18181c] border border-slate-300 dark:border-white/10 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer shadow-xs"
          >
            <optgroup label="✨ 10 Attractive Female AI Personas">
              {femaleVoices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Female) — {v.title} [{v.accent}]
                </option>
              ))}
            </optgroup>

            <optgroup label="🎙️ 10 Attractive Male AI Personas">
              {maleVoices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Male) — {v.title} [{v.accent}]
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Active Persona Details Card */}
      <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#16161a] border border-slate-200/80 dark:border-white/5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${currentPersona.avatarColor} text-white flex items-center justify-center font-bold text-base shadow-md`}
            >
              {currentPersona.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentPersona.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                  {currentPersona.gender}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200/60 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  {currentPersona.badge}
                </span>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {currentPersona.title} • {currentPersona.accent}
              </p>
            </div>
          </div>

          {/* Audition Button */}
          <button
            id="btn-voice-audition"
            type="button"
            onClick={handleToggleAudition}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 ${
              isPlayingAudio
                ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-indigo-500/20'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop Playing</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen Sample Voice</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {currentPersona.description}
        </p>

        {/* Audio Waveform Animation when Playing */}
        {isPlayingAudio && (
          <div className="flex items-center gap-1.5 py-1 px-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs text-indigo-600 dark:text-indigo-400">
            <Radio className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
            <span className="text-[11px] font-medium">
              Playing live voice sample with {currentPersona.name}...
            </span>
            <div className="flex items-center gap-0.5 ml-auto">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-indigo-600 rounded-full animate-pulse"
                  style={{
                    height: `${10 + ((i * 5) % 15)}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Persona Parameters Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/50 dark:border-white/5 text-[11px]">
          <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20 border border-slate-200/50 dark:border-white/5">
            <span className="text-[10px] text-slate-400 block font-semibold">Pitch Factor</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {currentPersona.pitch}x
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20 border border-slate-200/50 dark:border-white/5">
            <span className="text-[10px] text-slate-400 block font-semibold">Speaking Pace</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {currentPersona.rate}x
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20 border border-slate-200/50 dark:border-white/5">
            <span className="text-[10px] text-slate-400 block font-semibold">Tone Resonance</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
              {currentPersona.tone.split(',')[0]}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/80 dark:bg-black/20 border border-slate-200/50 dark:border-white/5">
            <span className="text-[10px] text-slate-400 block font-semibold">TTS & Chat Sync</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Quick Test Phrase input */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          Custom Audition Phrase (Optional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customTestPhrase}
            onChange={(e) => setCustomTestPhrase(e.target.value)}
            placeholder={`e.g. "Hello, I am testing ${currentPersona.name}'s voice across all Indian and global languages."`}
            className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleToggleAudition}
            className="py-1.5 px-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3" />
            <span>Test</span>
          </button>
        </div>
      </div>

      {/* Quick Visual Persona Grid / Gallery */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Quick Persona Selector (20 Options)
          </span>
          <div className="flex items-center gap-1">
            {(['all', 'female', 'male'] as const).map((gender) => (
              <button
                key={gender}
                type="button"
                onClick={() => setGenderFilter(gender)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  genderFilter === gender
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {gender === 'all' ? 'All 20' : gender === 'female' ? '10 Female' : '10 Male'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
          {VOICES_CATALOG.filter((v) => genderFilter === 'all' || v.gender === genderFilter).map(
            (persona) => {
              const isSelected = persona.id === selectedId;
              return (
                <button
                  key={persona.id}
                  type="button"
                  id={`btn-select-voice-${persona.id}`}
                  onClick={() => handleSelectVoice(persona.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-white ring-1 ring-indigo-500 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-[#18181c]/60 border-slate-200/80 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div
                      className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${persona.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                    >
                      {persona.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block leading-tight truncate">
                        {persona.name}
                      </span>
                      <span className="text-[9px] text-slate-400 block truncate">
                        {persona.gender === 'female' ? 'Female' : 'Male'}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                    {persona.title}
                  </p>

                  {isSelected && (
                    <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                      <Check className="w-2.5 h-2.5" /> Selected
                    </div>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
};
