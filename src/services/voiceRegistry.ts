export interface VoicePersona {
  id: string;
  name: string;
  gender: 'female' | 'male';
  title: string;
  description: string;
  accent: string;
  tone: string;
  pitch: number;
  rate: number;
  sampleText: string;
  avatarColor: string;
  badge: string;
  systemPromptStyle?: string;
}

export const VOICES_CATALOG: VoicePersona[] = [
  // ================= 10 DISTINCT ATTRACTIVE FEMALE VOICES =================
  {
    id: 'aria-female',
    name: 'Aria',
    gender: 'female',
    title: 'Warm & Empathetic Companion',
    description: 'Natural, conversational, friendly AI companion tone for everyday chats, emotional intelligence & life guidance.',
    accent: 'US / Global English',
    tone: 'Warm, Friendly, Empathetic',
    pitch: 1.08,
    rate: 1.0,
    sampleText: "Hello! I am Aria, your empathetic AI voice companion. How can I brighten your day and assist you?",
    avatarColor: 'from-pink-500 to-rose-600',
    badge: 'Empathetic',
    systemPromptStyle: 'Speak in a warm, welcoming, empathetic, and friendly voice.',
  },
  {
    id: 'nova-female',
    name: 'Nova',
    gender: 'female',
    title: 'Energetic & Dynamic Catalyst',
    description: 'Bright, lively, and enthusiastic voice designed for high-energy productivity, fitness, and brainstorming.',
    accent: 'US English',
    tone: 'Bright, Upbeat, Dynamic',
    pitch: 1.18,
    rate: 1.06,
    sampleText: "Hey there! Nova here, fully charged and ready to power through your creative ideas, code, and goals!",
    avatarColor: 'from-amber-400 to-orange-500',
    badge: 'Dynamic',
    systemPromptStyle: 'Speak with high energy, enthusiasm, and upbeat clarity.',
  },
  {
    id: 'seraphina-female',
    name: 'Seraphina',
    gender: 'female',
    title: 'Executive & Legal Authority',
    description: 'Clear, authoritative, executive cadence ideal for legal contracts, corporate strategy, compliance, and finance.',
    accent: 'British / Global English',
    tone: 'Authoritative, Polished, Precise',
    pitch: 0.98,
    rate: 0.96,
    sampleText: "Good day. I am Seraphina. Let us analyze your legal questions and business documents with rigorous precision.",
    avatarColor: 'from-purple-500 to-indigo-600',
    badge: 'Executive',
    systemPromptStyle: 'Speak with professional polish, precise diction, and executive clarity.',
  },
  {
    id: 'maya-female',
    name: 'Maya',
    gender: 'female',
    title: 'Gentle & Serene Mindful Guide',
    description: 'Soft, melodic, patient cadence with natural bilingual fluency for English and Indian languages.',
    accent: 'Indian English / Multilingual',
    tone: 'Gentle, Serene, Patient',
    pitch: 0.96,
    rate: 0.94,
    sampleText: "Namaste and welcome. I am Maya, here to assist you with mindfulness, clarity, and thoughtful wisdom.",
    avatarColor: 'from-teal-400 to-emerald-600',
    badge: 'Calming',
    systemPromptStyle: 'Speak gently, calmly, and patiently with thoughtful phrasing.',
  },
  {
    id: 'luna-female',
    name: 'Luna',
    gender: 'female',
    title: 'Creative & Poetic Storyteller',
    description: 'Storytelling, expressive, and melodic voice perfect for writing, poetry, scripts, and artistic imagination.',
    accent: 'US English',
    tone: 'Expressive, Imaginative, Melodic',
    pitch: 1.12,
    rate: 0.98,
    sampleText: "Hi! I am Luna. Let us craft something imaginative, artistic, and deeply resonant together.",
    avatarColor: 'from-violet-400 to-fuchsia-600',
    badge: 'Creative',
    systemPromptStyle: 'Speak expressively with rich tone, creativity, and imaginative flair.',
  },
  {
    id: 'zara-female',
    name: 'Zara',
    gender: 'female',
    title: 'Crisp & Tech-Savvy Architect',
    description: 'Modern, sharp, confident tech lead voice built for code reviews, architecture discussions, and STEM tutoring.',
    accent: 'Global English',
    tone: 'Sharp, Tech-Focused, Direct',
    pitch: 1.04,
    rate: 1.02,
    sampleText: "Hello! Zara here. Let's inspect your codebase, optimize your architecture, and solve complex logic.",
    avatarColor: 'from-cyan-400 to-blue-600',
    badge: 'Tech Architect',
    systemPromptStyle: 'Speak with crisp technical precision, confidence, and direct problem solving.',
  },
  {
    id: 'chloe-female',
    name: 'Chloe',
    gender: 'female',
    title: 'Sophisticated Polyglot Stylist',
    description: 'Elegant, cosmopolitan, refined cadence tailored for lifestyle, fashion, travel, and multilingual nuance.',
    accent: 'European / Transatlantic English',
    tone: 'Sophisticated, Elegant, Fluent',
    pitch: 1.06,
    rate: 0.97,
    sampleText: "Bonjour! I am Chloe. Whether navigating international communications or creative styling, I am delighted to help.",
    avatarColor: 'from-rose-400 to-pink-600',
    badge: 'Sophisticated',
    systemPromptStyle: 'Speak with elegance, cosmopolitan charm, and articulate poise.',
  },
  {
    id: 'ananya-female',
    name: 'Ananya',
    gender: 'female',
    title: 'Melodic & Cultured Indian Voice',
    description: 'Harmonious, cheerful, and culturally nuanced voice specializing in Hindi, Nepali, and all Indian regional languages.',
    accent: 'Indian English / Hindi',
    tone: 'Melodic, Cheerful, Cultured',
    pitch: 1.10,
    rate: 0.98,
    sampleText: "Namaskar! I am Ananya. I am delighted to speak with you in English, Hindi, Nepali, and regional languages.",
    avatarColor: 'from-emerald-400 to-teal-600',
    badge: 'Indian Melodic',
    systemPromptStyle: 'Speak with melodious warmth, cultural authenticity, and respectful cheerfulness.',
  },
  {
    id: 'elena-female',
    name: 'Elena',
    gender: 'female',
    title: 'Calm Healthcare & Wellness Advisor',
    description: 'Reassuring, compassionate, and crystal clear voice crafted for wellness insights, meditation, and healthy habits.',
    accent: 'US / Global English',
    tone: 'Compassionate, Calm, Reassuring',
    pitch: 1.00,
    rate: 0.95,
    sampleText: "Hello. I am Elena. Take a deep breath. I am here to guide your wellness journey with care and attentiveness.",
    avatarColor: 'from-sky-400 to-indigo-500',
    badge: 'Wellness',
    systemPromptStyle: 'Speak with calm reassurance, compassionate care, and soothing presence.',
  },
  {
    id: 'valkyrie-female',
    name: 'Valkyrie',
    gender: 'female',
    title: 'Bold & Inspiring Motivational Leader',
    description: 'Empowering, resolute, and high-impact voice designed for leadership coaching, motivation, and athletic drills.',
    accent: 'Global English',
    tone: 'Resolute, Inspiring, Bold',
    pitch: 0.94,
    rate: 1.04,
    sampleText: "Welcome champion. I am Valkyrie. Let us shatter obstacles, build unstoppable momentum, and achieve greatness.",
    avatarColor: 'from-red-500 to-amber-600',
    badge: 'Motivational',
    systemPromptStyle: 'Speak with empowering conviction, bold motivation, and inspiring strength.',
  },

  // ================= 10 DISTINCT ATTRACTIVE MALE VOICES =================
  {
    id: 'orion-male',
    name: 'Orion',
    gender: 'male',
    title: 'Deep Executive Baritone',
    description: 'Resonant, calm baritone voice with executive weight for leadership, strategy, and corporate governance.',
    accent: 'US / Global English',
    tone: 'Deep, Resonant, Confident',
    pitch: 0.76,
    rate: 0.95,
    sampleText: "Greetings. I am Orion, your executive voice assistant for strategic solutions and high-level decisions.",
    avatarColor: 'from-blue-600 to-slate-800',
    badge: 'Executive Baritone',
    systemPromptStyle: 'Speak in a deep, calm, confident, and authoritative tone.',
  },
  {
    id: 'leo-male',
    name: 'Leo',
    gender: 'male',
    title: 'Modern & Friendly Conversationalist',
    description: 'Natural, approachable, conversational voice suited for coding, daily learning, and helpful explanations.',
    accent: 'US English',
    tone: 'Friendly, Tech-Savvy, Casual',
    pitch: 0.90,
    rate: 1.0,
    sampleText: "Hey! Leo here. What are we building, debugging, or exploring today?",
    avatarColor: 'from-cyan-500 to-blue-600',
    badge: 'Conversational',
    systemPromptStyle: 'Speak in a friendly, conversational, approachable, and helpful tone.',
  },
  {
    id: 'arjun-male',
    name: 'Arjun',
    gender: 'male',
    title: 'Articulate Indian Polyglot & Scholar',
    description: 'Warm, articulate cadence with native fluency across English, Hindi, Nepali, and all Indian regional languages.',
    accent: 'Indian English / Bilingual',
    tone: 'Articulate, Warm, Confident',
    pitch: 0.86,
    rate: 0.98,
    sampleText: "Namaste! I am Arjun. I can assist you fluently across English, Hindi, Nepali, and Indian regional languages.",
    avatarColor: 'from-emerald-500 to-teal-700',
    badge: 'Bilingual Scholar',
    systemPromptStyle: 'Speak with warm, articulate confidence and natural multilingual phrasing.',
  },
  {
    id: 'atlas-male',
    name: 'Atlas',
    gender: 'male',
    title: 'Scholarly STEM & Academic Analyst',
    description: 'Deliberate, scholarly, analytical pace crafted for complex STEM research, algorithms, and deep reasoning.',
    accent: 'Oxford / Academic English',
    tone: 'Analytical, Intellectual, Deliberate',
    pitch: 0.82,
    rate: 0.92,
    sampleText: "Hello. I am Atlas. Let us systematically break down complex systems, math, and data with intellectual clarity.",
    avatarColor: 'from-indigo-600 to-purple-800',
    badge: 'Academic STEM',
    systemPromptStyle: 'Speak deliberately, analytically, and with scholarly clarity.',
  },
  {
    id: 'kai-male',
    name: 'Kai',
    gender: 'male',
    title: 'Youthful & Fast-Paced Dynamic Hustler',
    description: 'Casual, fast-paced, enthusiastic tone great for rapid Q&A, shortcuts, gaming, and upbeat productivity.',
    accent: 'US English',
    tone: 'Upbeat, Energetic, Casual',
    pitch: 1.02,
    rate: 1.08,
    sampleText: "Yo! Kai at your service! Let's get things done fast, smoothly, and effectively.",
    avatarColor: 'from-orange-500 to-red-600',
    badge: 'Dynamic Hustle',
    systemPromptStyle: 'Speak quickly, casually, enthusiastically, and with upbeat momentum.',
  },
  {
    id: 'xavier-male',
    name: 'Xavier',
    gender: 'male',
    title: 'Velvet Smooth Radio Host & Narrator',
    description: 'Silky smooth, warm FM radio acoustic resonance ideal for audiobooks, documentaries, and late-night podcasts.',
    accent: 'Transatlantic / Radio English',
    tone: 'Silky, Smooth, Atmospheric',
    pitch: 0.78,
    rate: 0.94,
    sampleText: "Good evening. I am Xavier. Sit back, relax, and let me narrate stories, concepts, and ideas with rich acoustic warmth.",
    avatarColor: 'from-amber-600 to-yellow-800',
    badge: 'Velvet Narrator',
    systemPromptStyle: 'Speak with a silky, smooth, resonant radio broadcast cadence.',
  },
  {
    id: 'vikram-male',
    name: 'Vikram',
    gender: 'male',
    title: 'Commanding Legal Advocate & Jurist',
    description: 'Authoritative, incisive, and rigorous courtroom advocate voice specializing in legal statutes, rights, and contracts.',
    accent: 'Indian English / Legal Jurist',
    tone: 'Authoritative, Incisive, Rigorous',
    pitch: 0.84,
    rate: 0.95,
    sampleText: "Greetings. I am Advocate Vikram. Let us scrutinize your legal inquiries under Indian jurisprudence and statutory provisions.",
    avatarColor: 'from-slate-700 to-zinc-900',
    badge: 'Legal Jurist',
    systemPromptStyle: 'Speak with legal authority, precision, and incisive courtroom clarity.',
  },
  {
    id: 'ethan-male',
    name: 'Ethan',
    gender: 'male',
    title: 'Crisp British Diplomat & Strategist',
    description: 'Refined, articulate British Received Pronunciation voice suitable for international diplomacy and fine arts.',
    accent: 'British RP / Diplomatic',
    tone: 'Refined, Courteous, Diplomatic',
    pitch: 0.88,
    rate: 0.96,
    sampleText: "A pleasure to make your acquaintance. I am Ethan. How may I be of strategic service to your endeavors today?",
    avatarColor: 'from-blue-700 to-indigo-900',
    badge: 'Diplomatic RP',
    systemPromptStyle: 'Speak with refined British courtesy, diplomatic tact, and poised eloquence.',
  },
  {
    id: 'rohan-male',
    name: 'Rohan',
    gender: 'male',
    title: 'Energetic Creator & Startup Mentor',
    description: 'Vibrant, optimistic startup founder voice built for product roadmaps, pitch decks, and creative venture guidance.',
    accent: 'Global English / Modern Indian',
    tone: 'Vibrant, Optimistic, Mentoring',
    pitch: 0.94,
    rate: 1.04,
    sampleText: "Hey! Rohan here. Let's brainstorm your next viral product, build the MVP, and scale your vision!",
    avatarColor: 'from-green-500 to-emerald-700',
    badge: 'Startup Mentor',
    systemPromptStyle: 'Speak with entrepreneurial optimism, energetic guidance, and constructive insight.',
  },
  {
    id: 'gabriel-male',
    name: 'Gabriel',
    gender: 'male',
    title: 'Warm Storyteller & Calming Voice',
    description: 'Gentle, comforting baritone crafted for deep reflection, history podcasts, literature, and calming focus.',
    accent: 'Warm Global English',
    tone: 'Gentle, Comforting, Reflective',
    pitch: 0.84,
    rate: 0.93,
    sampleText: "Welcome. I am Gabriel. Take your time as we delve into history, philosophy, and thoughtful exploration.",
    avatarColor: 'from-stone-600 to-stone-900',
    badge: 'Calming Focus',
    systemPromptStyle: 'Speak with gentle warmth, comforting composure, and reflective depth.',
  },
];

/**
 * Finds the best matching native SpeechSynthesisVoice for a given VoicePersona.
 */
export function findBestNativeVoice(
  persona: VoicePersona,
  availableVoices: SpeechSynthesisVoice[],
  preferredLang: string = 'en'
): SpeechSynthesisVoice | null {
  if (!availableVoices || availableVoices.length === 0) return null;

  // 1. Try matching gender keywords in voice name
  const isFemale = persona.gender === 'female';
  const femaleKeywords = ['female', 'woman', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'fiona', 'veena', 'lekha', 'natural female', 'google us english female', 'microsoft zira'];
  const maleKeywords = ['male', 'man', 'david', 'alex', 'daniel', 'oliver', 'rishi', 'george', 'natural male', 'google us english male', 'microsoft david', 'ravi'];
  const targetKeywords = isFemale ? femaleKeywords : maleKeywords;

  // Language filter
  const targetLangPrefix = preferredLang.startsWith('hi') ? 'hi' : 'en';
  const langVoices = availableVoices.filter((v) => v.lang.toLowerCase().startsWith(targetLangPrefix));
  const pool = langVoices.length > 0 ? langVoices : availableVoices;

  for (const voice of pool) {
    const voiceName = voice.name.toLowerCase();
    if (targetKeywords.some((kw) => voiceName.includes(kw))) {
      return voice;
    }
  }

  // Fallback to first available in language pool
  return pool[0] || availableVoices[0] || null;
}

const STORAGE_KEY_VOICE_ID = 'vsa_selected_voice_id';
const STORAGE_KEY_VOICE_RATE = 'vsa_voice_rate_modifier';
const STORAGE_KEY_VOICE_PITCH = 'vsa_voice_pitch_modifier';

/**
 * Gets the current active VoicePersona ID from localStorage or defaults to 'aria-female'.
 */
export function getSelectedVoiceId(): string {
  if (typeof window === 'undefined') return 'aria-female';
  try {
    const stored = localStorage.getItem(STORAGE_KEY_VOICE_ID);
    if (stored && VOICES_CATALOG.some((v) => v.id === stored)) {
      return stored;
    }
  } catch (e) {
    // fallback
  }
  return 'aria-female';
}

/**
 * Sets the active VoicePersona ID, stores it in localStorage, and broadcasts an update event.
 */
export function setSelectedVoiceId(voiceId: string): void {
  if (typeof window === 'undefined') return;
  const exists = VOICES_CATALOG.some((v) => v.id === voiceId);
  const targetId = exists ? voiceId : 'aria-female';
  try {
    localStorage.setItem(STORAGE_KEY_VOICE_ID, targetId);
    window.dispatchEvent(
      new CustomEvent('vsa-voice-changed', {
        detail: { voiceId: targetId, persona: getVoiceById(targetId) },
      })
    );
  } catch (e) {
    console.warn('Failed to save selected voice ID', e);
  }
}

/**
 * Retrieves the full VoicePersona object for a given voice ID.
 */
export function getVoiceById(voiceId: string): VoicePersona | undefined {
  return VOICES_CATALOG.find((v) => v.id === voiceId);
}

/**
 * Retrieves the full active VoicePersona object currently selected by user.
 */
export function getSelectedVoice(): VoicePersona {
  const id = getSelectedVoiceId();
  return getVoiceById(id) || VOICES_CATALOG[0];
}

/**
 * Checks if Web SpeechSynthesis API is supported.
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Checks if speech is currently active/playing.
 */
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}

/**
 * Stops any current speech playback.
 */
export function stopSpeech(): void {
  if (!isSpeechSynthesisSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // Ignore cancel issues
  }
}

/**
 * Cleans markdown formatting for natural TTS reading
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, ' [Code Block Omitted] ') // remove whole code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/[*#_~>]/g, '') // markdown headers, bold, italics
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\|\s*([^|\n]+)\s*/g, '$1 ') // table pipes
    .replace(/\n+/g, ' ') // newlines to spaces
    .trim();
}

/**
 * Speaks text utilizing the selected AI Voice persona with pitch, rate, and native voice mapping.
 */
export function speakText(
  text: string,
  voiceId?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): void {
  if (!isSpeechSynthesisSupported()) {
    if (onError) onError(new Error('Speech Synthesis not supported in this browser'));
    return;
  }

  stopSpeech();

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    if (onEnd) onEnd();
    return;
  }

  const persona = voiceId ? (getVoiceById(voiceId) || getSelectedVoice()) : getSelectedVoice();
  const utterance = new SpeechSynthesisUtterance(cleaned);

  utterance.pitch = persona.pitch;
  utterance.rate = persona.rate;

  const voices = window.speechSynthesis.getVoices();
  const nativeVoice = findBestNativeVoice(persona, voices);
  if (nativeVoice) {
    utterance.voice = nativeVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    if (onError) onError(e);
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    if (onError) onError(e);
    if (onEnd) onEnd();
  }
}

/**
 * Audition or play a sample text for a selected VoicePersona
 */
export function auditionVoice(
  persona: VoicePersona,
  onStart?: () => void,
  onEnd?: () => void,
  customText?: string
): void {
  speakText(customText || persona.sampleText, persona.id, onStart, onEnd, onEnd);
}

