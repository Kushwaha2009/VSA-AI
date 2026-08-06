import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ChatMessage, ChatSession, ChatAttachment, AIPersona, CustomPrompt } from '../../types';
import { AI_PERSONAS } from './personas';
import { CURATED_PROMPTS } from './promptLibrary';
import { ChatMessageItem } from './ChatMessageItem';
import { AiChatPdfToImageStudio } from './AiChatPdfToImageStudio';
import { LiveVoiceLab } from './LiveVoiceLab';
import { TriviLegalStudio } from './TriviLegalStudio';
import { EmailToolsStudio } from '../tools/EmailToolsStudio';
import { TextToolsStudio } from '../tools/TextToolsStudio';
import { InChatImageEditorModal } from './InChatImageEditorModal';
import {
  VOICES_CATALOG,
  VoicePersona,
  auditionVoice,
  getSelectedVoice,
  setSelectedVoiceId,
} from '../../services/voiceRegistry';
import { VsaLogo, VsaEmblem } from '../common/VsaLogo';
import { trackFeatureUsage } from '../../services/usageTracker';
import { SidebarFeedbackWidget } from '../feedback/SidebarFeedbackWidget';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Download,
  Search,
  Bot,
  FileText,
  X,
  Pin,
  ChevronRight,
  MessageSquare,
  Globe,
  Sliders,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Share2,
  Bookmark,
  Zap,
  Cpu,
  Brain,
  Cloud,
  Check,
  Copy,
  Folder,
  FileImage,
  Scale,
  Radio,
  Mail,
  Wand2,
  Volume2,
  Volume1,
  HelpCircle,
  Layers,
  ArrowRight,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MODEL_OPTIONS = [
  {
    id: 'gemini-3.6-flash',
    name: 'VSA Ultra Flash',
    badge: 'Fast & Smart',
    desc: 'High-speed reasoning, coding, and multimodal fluency',
    icon: Zap,
    color: 'text-indigo-500',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'VSA Deep Pro',
    badge: 'Deep Reasoning',
    desc: 'Complex math, STEM problems, deep analysis & architecture',
    icon: Brain,
    color: 'text-purple-500',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'VSA Flash Lite',
    badge: 'Ultra Fast',
    desc: 'Lowest latency for quick conversational Q&A',
    icon: Cpu,
    color: 'text-emerald-500',
  },
];

export const ChatContainer: React.FC = () => {
  const { user, token } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  // Sessions state stored in localStorage + Cloud
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('vsa_chat_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    const defaultSessionId = `session_${Date.now()}`;
    return [
      {
        id: defaultSessionId,
        title: 'Welcome to VSA AI',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personaId: 'general',
        messages: [
          {
            id: 'msg_welcome',
            role: 'assistant',
            content: `### Welcome to **VSA AI Studio**! 🚀\n\nAsk questions or type whatever you need — I am ready to help with answers, documents, code, and creative tasks!\n\n- 🤖 **Ask Any Question**: General knowledge, coding, STEM, translations, and deep explanations.\n- 📄 **PDF & Document Tools**: Extract, convert PDF pages to images, and summarize files.\n- ✉️ **AI Email Drafter**: Write formal business emails, cold pitches, and client replies.\n- ✍️ **AI Text Suite**: Instant summaries, grammar correction, tone switching, and paraphrasing.\n- 🎨 **In-Chat Image Editing**: Click **Edit in Chat** on any image to apply AI transformations, styles, and filters.\n- 🎙️ **20 AI Voice Personas**: Choose from 10 female & 10 male voices with real-time speech output.\n\n*What would you like to explore or create today?*`,
            timestamp: new Date().toISOString(),
            persona: 'General Assistant',
          },
        ],
      },
    ];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return sessions[0]?.id || `session_${Date.now()}`;
  });

  // Custom user prompts
  const [customPrompts, setCustomPrompts] = useState<CustomPrompt[]>(() => {
    const saved = localStorage.getItem('vsa_custom_prompts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'cp_1',
        title: 'Generate TypeScript Interface',
        prompt: 'Generate a clean TypeScript interface and Zod schema with JSDoc comments for: ',
        category: 'coding',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'cp_2',
        title: 'Translate to Hindi & Explain',
        prompt: 'Translate the following text into natural, fluent Hindi and provide a 2-sentence summary: ',
        category: 'translation',
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [selectedPersona, setSelectedPersona] = useState<AIPersona>(AI_PERSONAS[0]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.6-flash');
  const [streamingEnabled, setStreamingEnabled] = useState<boolean>(true);
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('all');

  const [inputPrompt, setInputPrompt] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  // 10 Voices Selection State (Synced globally)
  const [activeVoice, setActiveVoice] = useState<VoicePersona>(() => getSelectedVoice());
  const [isVoicePickerModalOpen, setIsVoicePickerModalOpen] = useState(false);
  const [voiceAuditioningId, setVoiceAuditioningId] = useState<string | null>(null);
  const [voiceFilterGender, setVoiceFilterGender] = useState<'all' | 'female' | 'male'>('all');

  // Listen to external voice persona change events
  useEffect(() => {
    const handleVoiceChange = () => {
      setActiveVoice(getSelectedVoice());
    };
    window.addEventListener('vsa-voice-changed', handleVoiceChange);
    return () => {
      window.removeEventListener('vsa-voice-changed', handleVoiceChange);
    };
  }, []);


  // In-Chat Image Editor Modal State
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [editingImageUrl, setEditingImageUrl] = useState<string>('');
  const [editingImageName, setEditingImageName] = useState<string>('chat_image.png');
  const [editingTargetAttachmentId, setEditingTargetAttachmentId] = useState<string | null>(null);
  const [editingTargetMessageId, setEditingTargetMessageId] = useState<string | null>(null);

  // Modals & Panels (Right Column / Left Tools Dock)
  const [rightPanelMode, setRightPanelMode] = useState<'none' | 'pdf-to-image' | 'voice-lab' | 'trivi-legal' | 'email-tools' | 'text-tools'>('none');
  const [isPromptLibraryOpen, setIsPromptLibraryOpen] = useState(false);
  const [promptCategoryFilter, setPromptCategoryFilter] = useState<string>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newPromptTitle, setNewPromptTitle] = useState('');
  const [newPromptBody, setNewPromptBody] = useState('');
  const [newPromptCategory, setNewPromptCategory] = useState('coding');
  const [isSavingCustomPrompt, setIsSavingCustomPrompt] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync sessions with localStorage
  useEffect(() => {
    localStorage.setItem('vsa_chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Sync custom prompts with localStorage
  useEffect(() => {
    localStorage.setItem('vsa_custom_prompts', JSON.stringify(customPrompts));
  }, [customPrompts]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, isLoading]);

  // Adjust persona when session changes
  useEffect(() => {
    if (currentSession?.personaId) {
      const persona = AI_PERSONAS.find((p) => p.id === currentSession.personaId);
      if (persona) setSelectedPersona(persona);
    }
  }, [currentSessionId]);

  // Cloud Sync on load if user is logged in
  useEffect(() => {
    if (token) {
      fetch('/api/user/sync', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.syncData?.chatSessions && data.syncData.chatSessions.length > 0) {
            // Merged
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Handle Cloud Sync trigger
  const handleCloudSync = async () => {
    if (!token) {
      showToast('info', 'Login Required', 'Please log in to sync your chats to the cloud.');
      return;
    }
    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatSessions: sessions,
          customPrompts,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'Cloud Synced', 'Your conversations and prompts are securely backed up.');
      }
    } catch (e) {
      showToast('error', 'Sync Failed', 'Could not sync to cloud.');
    }
  };

  // Voice Input (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast('warning', 'Voice Input Unavailable', 'Your browser does not support Web Speech Recognition.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const langMap: Record<string, string> = {
        en: 'en-US',
        hi: 'hi-IN',
        mai: 'hi-IN',
        bho: 'hi-IN',
        pa: 'pa-IN',
      };
      recognition.lang = langMap[language] || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('info', 'Listening...', 'Speak your question or thoughts');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        showToast('error', 'File Too Large', `${file.name} exceeds 20MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        const newAttachment: ChatAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Open Image Editor for a given image
  const handleOpenImageEditor = (imageUrl: string, imageName: string = 'image.png', messageId?: string, attachmentId?: string) => {
    setEditingImageUrl(imageUrl);
    setEditingImageName(imageName);
    setEditingTargetMessageId(messageId || null);
    setEditingTargetAttachmentId(attachmentId || null);
    setIsImageEditorOpen(true);
  };

  // Save edited image back into chat
  const handleSaveEditedImageInChat = (newImageUrl: string, editPrompt?: string) => {
    if (editingTargetAttachmentId) {
      // It was in composer attachments
      setAttachments((prev) =>
        prev.map((att) =>
          att.id === editingTargetAttachmentId ? { ...att, dataUrl: newImageUrl, name: `edited_${att.name}` } : att
        )
      );
    } else {
      // Add as a new attachment to the composer or append to message
      const newAttachment: ChatAttachment = {
        id: `att_edited_${Date.now()}`,
        name: `edited_${editingImageName}`,
        size: Math.round(newImageUrl.length * 0.75),
        type: 'image/png',
        dataUrl: newImageUrl,
      };
      setAttachments((prev) => [...prev, newAttachment]);
      setInputPrompt((prev) => prev ? `${prev} (Edited image attached)` : `I edited this image with AI: "${editPrompt || 'Enhanced details'}"`);
    }
  };

  // Create New Chat Session
  const createNewSession = (personaId?: string) => {
    const persona = AI_PERSONAS.find((p) => p.id === personaId) || selectedPersona;
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: `${persona.name} Chat`,
      personaId: persona.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setSelectedPersona(persona);
    setAttachments([]);
    setInputPrompt('');
  };

  // Delete Session
  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = sessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      const fresh: ChatSession = {
        id: `session_${Date.now()}`,
        title: 'New Conversation',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      setSessions([fresh]);
      setCurrentSessionId(fresh.id);
    } else {
      setSessions(remaining);
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id);
      }
    }
    showToast('info', 'Chat Deleted');
  };

  // Pin / Unpin Session
  const togglePinSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
    showToast('info', 'Chat Pin Toggled');
  };

  // Save Renamed Title
  const saveRenamedTitle = (id: string) => {
    if (!editTitleText.trim()) {
      setEditingTitleId(null);
      return;
    }
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: editTitleText.trim() } : s))
    );
    setEditingTitleId(null);
  };

  // Save Custom Prompt
  const handleSaveCustomPrompt = () => {
    if (!newPromptTitle.trim() || !newPromptBody.trim()) {
      showToast('error', 'Missing Information', 'Please provide a title and prompt text.');
      return;
    }
    const newPrompt: CustomPrompt = {
      id: `cp_${Date.now()}`,
      title: newPromptTitle.trim(),
      prompt: newPromptBody.trim(),
      category: newPromptCategory,
      createdAt: new Date().toISOString(),
    };
    setCustomPrompts((prev) => [newPrompt, ...prev]);
    setNewPromptTitle('');
    setNewPromptBody('');
    setIsSavingCustomPrompt(false);
    showToast('success', 'Custom Prompt Saved', 'You can now use this prompt anytime.');
  };

  // Send Message with SSE streaming or standard POST
  const handleSendMessage = async (customPromptText?: string) => {
    const textToSend = customPromptText !== undefined ? customPromptText : inputPrompt;

    if (!textToSend.trim() && attachments.length === 0) return;
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    let sessionTitle = currentSession.title;
    if (currentSession.messages.filter((m) => m.role === 'user').length === 0 && textToSend.trim()) {
      sessionTitle = textToSend.trim().slice(0, 30) + (textToSend.length > 30 ? '...' : '');
    }

    const updatedMessages = [...currentSession.messages, userMessage];

    // Optimistically update UI
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: new Date().toISOString(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setInputPrompt('');
    setAttachments([]);
    setIsLoading(true);

    const assistantMsgId = `msg_ai_${Date.now()}`;

    if (streamingEnabled) {
      const placeholderAiMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        persona: selectedPersona.name,
        model: selectedModel,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, placeholderAiMessage] }
            : s
        )
      );

      try {
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend.trim(),
            systemInstruction: `${selectedPersona.systemPrompt}\nVoice Persona tone: ${activeVoice.systemPromptStyle || ''}`,
            persona: selectedPersona.name,
            model: selectedModel,
            attachments: userMessage.attachments,
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) throw new Error('Streaming connection failed');

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') break;
                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.chunk) {
                    accumulatedText += parsed.chunk;
                  } else if (parsed.error && !accumulatedText) {
                    accumulatedText = parsed.error;
                  }

                  if (accumulatedText) {
                    setSessions((prev) =>
                      prev.map((s) =>
                        s.id === currentSessionId
                          ? {
                              ...s,
                              messages: s.messages.map((m) =>
                                m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                              ),
                            }
                          : s
                      )
                    );
                  }
                } catch (e) {}
              }
            }
          }
        }

        if (!accumulatedText.trim()) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === currentSessionId
                ? {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMsgId
                        ? { ...m, content: "Response connection completed. You can ask further questions anytime." }
                        : m
                    ),
                  }
                : s
            )
          );
        }

        trackFeatureUsage('ai-chat', `AI Query (${selectedPersona.name})`, {
          persona: selectedPersona.name,
          details: textToSend.slice(0, 60),
          status: 'success',
          subFeature: selectedPersona.id,
        });
      } catch (streamErr: any) {
        showToast('error', 'AI Query Issue', streamErr.message || 'Stream interrupted');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Standard POST fallback
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend.trim(),
            systemInstruction: `${selectedPersona.systemPrompt}\nVoice Persona tone: ${activeVoice.systemPromptStyle || ''}`,
            persona: selectedPersona.name,
            model: selectedModel,
            attachments: userMessage.attachments,
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to generate response');

        const finalMsg: ChatMessage = {
          id: assistantMsgId,
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toISOString(),
          persona: selectedPersona.name,
          model: data.model || selectedModel,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId ? { ...s, messages: [...s.messages, finalMsg] } : s
          )
        );

        trackFeatureUsage('ai-chat', `AI Query (${selectedPersona.name})`, {
          persona: selectedPersona.name,
          details: textToSend.slice(0, 60),
          status: 'success',
          subFeature: selectedPersona.id,
        });
      } catch (err: any) {
        showToast('error', 'AI Query Failed', err.message);
        const errMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Request failed**: ${err.message}\n\nPlease try again shortly.`,
          timestamp: new Date().toISOString(),
        };
        setSessions((prev) =>
          prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [...s.messages, errMsg] } : s))
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Export / Download Chat
  const handleExportChat = (format: 'markdown' | 'txt' | 'json') => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify(currentSession, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else if (format === 'markdown') {
      content = `# ${currentSession.title}\n\n*Exported from VSA AI Studio on ${new Date().toLocaleString()}*\n\n---\n\n`;
      currentSession.messages.forEach((m) => {
        content += `### ${m.role === 'user' ? 'User' : 'VSA AI'}\n${m.content}\n\n`;
      });
      mimeType = 'text/markdown';
      ext = 'md';
    } else {
      content = `${currentSession.title}\nExported: ${new Date().toLocaleString()}\n\n`;
      currentSession.messages.forEach((m) => {
        content += `[${m.role.toUpperCase()} - ${m.timestamp}]:\n${m.content}\n\n`;
      });
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VSA_Chat_${currentSession.title.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Chat Exported', `Saved as .${ext}`);
  };

  // Filtered Sessions
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const filteredSessions = sortedSessions.filter((s) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFolderFilter === 'pinned') return matchesSearch && s.pinned;
    return matchesSearch;
  });

  const filteredCatalogVoices = VOICES_CATALOG.filter((v) => {
    if (voiceFilterGender === 'all') return true;
    return v.gender === voiceFilterGender;
  });

  return (
    <div
      id="chat-workspace-container"
      className="flex h-[calc(100dvh-4rem)] md:h-[calc(100vh-4rem)] w-full bg-slate-100/50 dark:bg-[#09090b] overflow-hidden relative pb-16 md:pb-0"
    >
      {/* Mobile Backdrop for Sidebar */}
      {isSidebarOpen && (
        <div
          id="chat-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* LEFT SIDEBAR & TOOLS DOCK: AI Chat, PDFs, Email, Text, & Voice Assistant */}
      <div
        id="chat-history-sidebar"
        className={`${
          isSidebarOpen ? 'w-80 max-w-[85vw] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'
        } fixed md:relative top-0 bottom-0 left-0 shrink-0 bg-white dark:bg-[#111114] border-r border-slate-200 dark:border-white/10 flex flex-col transition-all duration-300 overflow-hidden z-50 md:z-20 h-full shadow-2xl md:shadow-none`}
      >
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-white/10 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <button
              id="btn-new-chat"
              onClick={() => createNewSession()}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-lg shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{t('chat.newChat')}</span>
            </button>
            <button
              id="btn-cloud-sync"
              onClick={handleCloudSync}
              className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Cloud Sync History"
            >
              <Cloud className="w-4 h-4" />
            </button>
            <button
              id="btn-close-chat-sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="input-search-chats"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('chat.searchHistory')}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <button
              onClick={() => setActiveFolderFilter('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeFolderFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              All Chats
            </button>
            <button
              onClick={() => setActiveFolderFilter('pinned')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                activeFolderFilter === 'pinned'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Pin className="w-3 h-3" />
              <span>Pinned</span>
            </button>
          </div>

          {/* LEFT SIDEBAR TOOLS DOCK: AI Chat, PDFs, Email, & Text Tools */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-white/5 space-y-1.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Left Tools Suite</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500 font-semibold">
                Quick Access
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1">
              {/* 1. AI Chat Tools */}
              <button
                id="btn-left-ai-chat"
                onClick={() => createNewSession()}
                className="flex items-center justify-between p-2 rounded-lg text-xs font-semibold bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-indigo-500" />
                  <span>AI Chat Assistant</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  Active
                </span>
              </button>

              {/* 2. PDF Tools */}
              <button
                id="btn-left-pdf-tools"
                onClick={() => setRightPanelMode(rightPanelMode === 'pdf-to-image' ? 'none' : 'pdf-to-image')}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  rightPanelMode === 'pdf-to-image'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-[#18181c] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileImage className="w-3.5 h-3.5 text-indigo-500" />
                  <span>PDF & Image Tools</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10">
                  Tools
                </span>
              </button>

              {/* 3. AI Email Tools */}
              <button
                id="btn-left-email-tools"
                onClick={() => setRightPanelMode(rightPanelMode === 'email-tools' ? 'none' : 'email-tools')}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  rightPanelMode === 'email-tools'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-[#18181c] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-sky-500" />
                  <span>AI Email Drafter</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-600 dark:text-sky-400">
                  Writer
                </span>
              </button>

              {/* 4. AI Text Tools */}
              <button
                id="btn-left-text-tools"
                onClick={() => setRightPanelMode(rightPanelMode === 'text-tools' ? 'none' : 'text-tools')}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  rightPanelMode === 'text-tools'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-[#18181c] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>AI Text & Polish</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  Studio
                </span>
              </button>

              {/* 5. Live Voice Lab with 10 HD Voices */}
              <button
                id="btn-left-live-voice"
                onClick={() => setRightPanelMode(rightPanelMode === 'voice-lab' ? 'none' : 'voice-lab')}
                className={`flex items-center justify-between p-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  rightPanelMode === 'voice-lab'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                  <span>Live Voice Lab (10 Voices)</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {t('chat.noChats')}
            </div>
          ) : (
            filteredSessions.map((s) => {
              const isSelected = s.id === currentSessionId;
              const isEditing = editingTitleId === s.id;

              return (
                <div
                  key={s.id}
                  id={`chat-session-item-${s.id}`}
                  onClick={() => setCurrentSessionId(s.id)}
                  className={`group flex items-center justify-between p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {s.pinned ? (
                      <Pin className="w-3.5 h-3.5 shrink-0 text-amber-500 fill-amber-500" />
                    ) : (
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitleText}
                        onChange={(e) => setEditTitleText(e.target.value)}
                        onBlur={() => saveRenamedTitle(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRenamedTitle(s.id);
                          if (e.key === 'Escape') setEditingTitleId(null);
                        }}
                        autoFocus
                        className="bg-white dark:bg-[#18181c] border border-indigo-500 rounded px-1.5 py-0.5 text-xs w-full text-slate-900 dark:text-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate block">{s.title}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-pin-session-${s.id}`}
                      onClick={(e) => togglePinSession(s.id, e)}
                      className="p-1 text-slate-400 hover:text-amber-500 rounded"
                      title={s.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      id={`btn-edit-title-${s.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitleId(s.id);
                        setEditTitleText(s.title);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      id={`btn-delete-session-${s.id}`}
                      onClick={(e) => deleteSession(s.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Feedback */}
        <div className="p-2.5 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0c0c0e]/50">
          <SidebarFeedbackWidget currentCategory="ai-chat" />
        </div>

        {/* Persona Switcher in Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0c0c0e]">
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Active Assistant Persona
          </label>
          <select
            id="select-sidebar-persona"
            value={selectedPersona.id}
            onChange={(e) => {
              const p = AI_PERSONAS.find((item) => item.id === e.target.value);
              if (p) setSelectedPersona(p);
            }}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {AI_PERSONAS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN CHAT WORKSPACE */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#09090b]">
        {/* Workspace Top Toolbar */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/90 dark:bg-[#0c0c0e]/90 backdrop-blur shrink-0 gap-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {!isSidebarOpen && (
              <button
                id="btn-open-chat-sidebar"
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors shrink-0"
                title="Open Chat History & Left Tools"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 min-w-0">
                <span className="truncate max-w-[95px] sm:max-w-xs">{currentSession.title}</span>
                <span className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                  {selectedPersona.name}
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* 10 Voices Selector Quick Button */}
            <button
              id="btn-quick-voice-picker"
              onClick={() => setIsVoicePickerModalOpen(true)}
              className="flex items-center gap-1.5 py-1 px-2 sm:px-2.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-100 transition-colors"
              title="Select from 10 Male & Female Voices"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="truncate max-w-[100px] sm:max-w-none">
                {activeVoice.name} ({activeVoice.gender === 'female' ? '♀ Female' : '♂ Male'})
              </span>
            </button>

            {/* Quick Action Tools */}
            <div className="hidden lg:flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#18181c] border border-slate-200 dark:border-white/10">
              <button
                id="btn-top-pdf-to-image"
                onClick={() => setRightPanelMode(rightPanelMode === 'pdf-to-image' ? 'none' : 'pdf-to-image')}
                className={`flex items-center gap-1 py-1 px-2 rounded-md text-xs font-semibold transition-all ${
                  rightPanelMode === 'pdf-to-image'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                }`}
                title="PDF to Image"
              >
                <FileImage className="w-3.5 h-3.5" />
                <span>PDF Tools</span>
              </button>

              <button
                id="btn-top-email-studio"
                onClick={() => setRightPanelMode(rightPanelMode === 'email-tools' ? 'none' : 'email-tools')}
                className={`flex items-center gap-1 py-1 px-2 rounded-md text-xs font-semibold transition-all ${
                  rightPanelMode === 'email-tools'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400'
                }`}
                title="AI Email Generator"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                id="btn-top-text-studio"
                onClick={() => setRightPanelMode(rightPanelMode === 'text-tools' ? 'none' : 'text-tools')}
                className={`flex items-center gap-1 py-1 px-2 rounded-md text-xs font-semibold transition-all ${
                  rightPanelMode === 'text-tools'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400'
                }`}
                title="AI Text & Summarizer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Text</span>
              </button>

              <button
                id="btn-top-live-voice"
                onClick={() => setRightPanelMode(rightPanelMode === 'voice-lab' ? 'none' : 'voice-lab')}
                className={`flex items-center gap-1 py-1 px-2 rounded-md text-xs font-semibold transition-all ${
                  rightPanelMode === 'voice-lab'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                }`}
                title="Live Audio Voice Lab"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Voice Lab</span>
              </button>
            </div>

            {/* Model Selector Dropdown */}
            <div className="relative">
              <select
                id="select-chat-model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="py-1 sm:py-1.5 px-2 sm:px-3 bg-slate-100 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-lg text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer max-w-[105px] sm:max-w-none truncate"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt Library Button */}
            <button
              id="btn-open-prompt-library"
              onClick={() => setIsPromptLibraryOpen(true)}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors"
              title="Browse Prompts Library"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Prompts</span>
            </button>

            {/* Share Chat Modal Button */}
            <button
              id="btn-open-share-modal"
              onClick={() => setIsShareModalOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Share Conversation"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Right Panel Toggle Button */}
            <button
              id="btn-toggle-right-panel"
              onClick={() =>
                setRightPanelMode(rightPanelMode === 'none' ? 'pdf-to-image' : 'none')
              }
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                rightPanelMode !== 'none'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
              title={rightPanelMode !== 'none' ? 'Close Tool Panel' : 'Open Tool Panel'}
            >
              {rightPanelMode !== 'none' ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRight className="w-4 h-4" />
              )}
            </button>

            <button
              id="btn-clear-chat"
              onClick={() => {
                setSessions((prev) =>
                  prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [] } : s))
                );
                showToast('info', 'Chat Cleared');
              }}
              className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Clear messages"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dual Pane: Chat Messages + Right Column Tool Dock */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          {/* Main Messages & Composer Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Messages Stream Area */}
            <div
              id="chat-messages-scroll"
              className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 bg-slate-50/50 dark:bg-[#09090b]"
            >
              {currentSession.messages.length === 0 ? (
                <div className="max-w-2xl mx-auto py-8 text-center space-y-5">
                  <div className="flex justify-center">
                    <VsaLogo variant="stacked" size="xl" showTagline={true} className="animate-fade-in" />
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{selectedPersona.name} · Ask questions or type whatever you need</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                      {selectedPersona.description}
                    </p>
                  </div>

                  {/* Fast Action Suggestion Chips */}
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleSendMessage('Explain how this concept works with clear real-world examples: ')}
                      className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Ask Any Question</span>
                    </button>
                    <button
                      onClick={() => setRightPanelMode('email-tools')}
                      className="px-3 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-semibold hover:bg-sky-100 transition-colors flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Draft an Email</span>
                    </button>
                    <button
                      onClick={() => setRightPanelMode('pdf-to-image')}
                      className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                    >
                      <FileImage className="w-3.5 h-3.5" />
                      <span>PDF to Image</span>
                    </button>
                    <button
                      onClick={() => setRightPanelMode('text-tools')}
                      className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Polish Text</span>
                    </button>
                  </div>

                  {/* Starter Prompt Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-left">
                    {selectedPersona.starterPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        id={`starter-prompt-${idx}`}
                        onClick={() => handleSendMessage(prompt)}
                        className="p-3 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all text-xs text-slate-700 dark:text-slate-300 flex items-start justify-between group"
                      >
                        <span className="leading-snug">{prompt}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 mt-0.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {currentSession.messages.map((msg) => (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      activeVoice={activeVoice}
                      onEditImage={(url, name) => handleOpenImageEditor(url, name, msg.id)}
                      onRetry={() => {
                        const lastUser = [...currentSession.messages]
                          .reverse()
                          .find((m) => m.role === 'user');
                        if (lastUser) handleSendMessage(lastUser.content);
                      }}
                      onQuickAction={(quickPrompt) => handleSendMessage(quickPrompt)}
                    />
                  ))}

                  {isLoading && !streamingEnabled && (
                    <div className="flex items-center gap-3 p-3.5 max-w-4xl mx-auto rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-lg shadow-black/20">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white/10 flex items-center justify-center p-0.5 border border-indigo-500/20">
                        <VsaEmblem className="w-6 h-6 animate-pulse" idPrefix="loading-vsa" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            VSA AI is formulating response with {selectedModel}
                          </span>
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
                              style={{ animationDelay: '0.2s' }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce"
                              style={{ animationDelay: '0.4s' }}
                            />
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Multimodal reasoning and synthesized output...
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Composer Box (Compact & Sleek Layout) */}
            <div className="py-2 px-3 sm:px-4 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#101014] shrink-0">
              <div className="max-w-4xl mx-auto space-y-1.5">
                {/* Attachment preview pills with Edit in Chat trigger */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-0.5">
                    {attachments.map((att) => {
                      const isImage = att.type.startsWith('image/');
                      return (
                        <div
                          key={att.id}
                          className="flex items-center gap-1.5 py-0.5 px-2 rounded-md bg-indigo-600/10 border border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-300 font-medium"
                        >
                          {isImage ? (
                            <img src={att.dataUrl} alt={att.name} className="w-4 h-4 rounded object-cover" />
                          ) : (
                            <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          )}
                          <span className="truncate max-w-[120px]">{att.name}</span>

                          {isImage && (
                            <button
                              type="button"
                              onClick={() => handleOpenImageEditor(att.dataUrl, att.name, undefined, att.id)}
                              className="px-1.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold flex items-center gap-0.5 transition-colors"
                              title="Edit this image with AI inside chat"
                            >
                              <Wand2 className="w-2.5 h-2.5" />
                              <span>Edit</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="text-indigo-400 hover:text-rose-500 ml-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Compact Input Box & Action buttons */}
                <div className="relative rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#16161a] shadow-xs focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
                  <textarea
                    ref={textareaRef}
                    id="input-chat-prompt"
                    rows={1}
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Ask questions, type whatever you need, paste code, drop files..."
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none min-h-[36px] max-h-[120px] leading-relaxed"
                  />

                  <div className="flex items-center justify-between px-2.5 py-1 border-t border-slate-200/50 dark:border-white/5">
                    <div className="flex items-center gap-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.tsx,.json,.py,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="chat-file-upload-input"
                      />
                      <button
                        type="button"
                        id="btn-chat-attach-file"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors"
                        title={t('chat.attachFile')}
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        id="btn-chat-voice-dictation"
                        onClick={toggleSpeechRecognition}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isListening
                            ? 'bg-rose-500 text-white animate-pulse'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5'
                        }`}
                        title="Voice input (Speech to Text)"
                      >
                        {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      </button>

                      {/* Quick Voice Persona Indicator / Modal Trigger */}
                      <button
                        type="button"
                        id="btn-quick-voice-picker"
                        onClick={() => setIsVoicePickerModalOpen(true)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-semibold border border-indigo-500/20 transition-colors"
                        title="Change AI Voice Persona"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span className="truncate max-w-[70px] sm:max-w-[100px]">{activeVoice.name}</span>
                      </button>

                      {/* Streaming mode toggle */}
                      <button
                        type="button"
                        id="btn-toggle-streaming"
                        onClick={() => setStreamingEnabled(!streamingEnabled)}
                        className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          streamingEnabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-200/60 dark:bg-white/5 text-slate-500'
                        }`}
                        title={streamingEnabled ? 'Live streaming' : 'Standard POST'}
                      >
                        <Zap className="w-2.5 h-2.5" />
                        <span>{streamingEnabled ? 'Stream' : 'Standard'}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      id="btn-chat-send"
                      disabled={isLoading || (!inputPrompt.trim() && attachments.length === 0)}
                      onClick={() => handleSendMessage()}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-md shadow-indigo-500/20 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <span>{t('chat.send')}</span>
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 px-1 font-mono">
                  <span>Enter to send · Shift+Enter for newline</span>
                  <span className="hidden sm:inline">Active Voice: {activeVoice.name} ({activeVoice.gender})</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column Studio Dock Panel */}
          <AnimatePresence>
            {rightPanelMode !== 'none' && (
              <motion.div
                id="right-column-studio-dock"
                initial={{ opacity: 0, width: 0, x: 50 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: 50 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="w-full md:w-[420px] lg:w-[480px] xl:w-[520px] shrink-0 border-l border-slate-200 dark:border-white/10 flex flex-col h-full bg-white dark:bg-[#0c0c0e] shadow-xl z-20 overflow-hidden"
              >
                {/* Right Column Top Tab Bar */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50/90 dark:bg-[#121216]/90 border-b border-slate-200 dark:border-white/10 shrink-0">
                  <div className="flex items-center gap-1 overflow-x-auto">
                    <button
                      onClick={() => setRightPanelMode('pdf-to-image')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                        rightPanelMode === 'pdf-to-image'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
                      }`}
                    >
                      <FileImage className="w-3.5 h-3.5" />
                      <span>PDF Tools</span>
                    </button>

                    <button
                      onClick={() => setRightPanelMode('email-tools')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                        rightPanelMode === 'email-tools'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>

                    <button
                      onClick={() => setRightPanelMode('text-tools')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                        rightPanelMode === 'text-tools'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Text</span>
                    </button>

                    <button
                      onClick={() => setRightPanelMode('voice-lab')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                        rightPanelMode === 'voice-lab'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Voice Lab</span>
                    </button>
                  </div>

                  <button
                    id="btn-close-right-studio-dock"
                    onClick={() => setRightPanelMode('none')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors shrink-0 ml-2"
                    title="Close Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Right Column Content Area */}
                <div className="flex-1 overflow-y-auto">
                  {rightPanelMode === 'pdf-to-image' && (
                    <AiChatPdfToImageStudio
                      onAttachToMainChat={(att) => {
                        setAttachments((prev) => [
                          ...prev,
                          {
                            id: `att_${Date.now()}`,
                            name: att.name,
                            size: att.size,
                            type: att.type,
                            dataUrl: att.dataUrl,
                          },
                        ]);
                        showToast('success', 'PDF Image Attached to Chat!');
                      }}
                      onClose={() => setRightPanelMode('none')}
                    />
                  )}
                  {rightPanelMode === 'email-tools' && (
                    <EmailToolsStudio
                      onInsertToChat={(email) => {
                        setInputPrompt((prev) => (prev ? `${prev}\n\n${email}` : email));
                        setRightPanelMode('none');
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      onClose={() => setRightPanelMode('none')}
                    />
                  )}
                  {rightPanelMode === 'text-tools' && (
                    <TextToolsStudio
                      onInsertToChat={(text) => {
                        setInputPrompt((prev) => (prev ? `${prev}\n\n${text}` : text));
                        setRightPanelMode('none');
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      onClose={() => setRightPanelMode('none')}
                    />
                  )}
                  {rightPanelMode === 'voice-lab' && (
                    <LiveVoiceLab
                      onSendToChat={(text) => {
                        setInputPrompt(text);
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      onClose={() => setRightPanelMode('none')}
                    />
                  )}
                  {rightPanelMode === 'trivi-legal' && (
                    <TriviLegalStudio
                      onAskTrivi={(prompt) => {
                        const trivi = AI_PERSONAS.find((p) => p.id === 'trivi') || AI_PERSONAS[0];
                        setSelectedPersona(trivi);
                        setInputPrompt(prompt);
                        if (textareaRef.current) textareaRef.current.focus();
                      }}
                      onClose={() => setRightPanelMode('none')}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 10 HD VOICE PICKER MODAL */}
      <AnimatePresence>
        {isVoicePickerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Voice Modal Header */}
              <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>AI Voice Assistant Selection</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                        10 Voice Models (5 Female · 5 Male)
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Choose your preferred voice assistant for real-time conversation and speech read-aloud
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsVoicePickerModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Gender Filter Tabs */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0c0c0e] border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setVoiceFilterGender('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      voiceFilterGender === 'all'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                    }`}
                  >
                    All Voices ({VOICES_CATALOG.length})
                  </button>
                  <button
                    onClick={() => setVoiceFilterGender('female')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      voiceFilterGender === 'female'
                        ? 'bg-pink-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                    }`}
                  >
                    👩 10 Female Voices
                  </button>
                  <button
                    onClick={() => setVoiceFilterGender('male')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      voiceFilterGender === 'male'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5'
                    }`}
                  >
                    👨 10 Male Voices
                  </button>
                </div>

                <span className="text-xs font-medium text-slate-500">
                  Active: <strong className="text-emerald-600 dark:text-emerald-400">{activeVoice.name}</strong>
                </span>
              </div>

              {/* Voices Grid */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCatalogVoices.map((voice) => {
                  const isSelected = activeVoice.id === voice.id;
                  const isAuditioning = voiceAuditioningId === voice.id;

                  return (
                    <div
                      key={voice.id}
                      onClick={() => {
                        setActiveVoice(voice);
                        showToast('success', `Voice Assistant: ${voice.name}`, `${voice.gender === 'female' ? 'Female' : 'Male'} · ${voice.title}`);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-[#18181c] border-slate-200 dark:border-white/5 hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              voice.gender === 'female'
                                ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20'
                                : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            }`}>
                              {voice.gender === 'female' ? 'Female Voice' : 'Male Voice'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {voice.accent}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              <span>Active</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {voice.name} · <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{voice.title}</span>
                        </h4>

                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                          {voice.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5 flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setVoiceAuditioningId(voice.id);
                            auditionVoice(
                              voice,
                              () => setVoiceAuditioningId(voice.id),
                              () => setVoiceAuditioningId(null)
                            );
                          }}
                          className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isAuditioning
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-white dark:bg-white/10 hover:bg-slate-100 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10'
                          }`}
                        >
                          <Play className="w-3 h-3" />
                          <span>{isAuditioning ? 'Playing Sample...' : 'Audition Voice'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveVoice(voice);
                            setIsVoicePickerModalOpen(false);
                            showToast('success', `Voice set to ${voice.name}`);
                          }}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-200/70 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Use Voice'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* IN-CHAT IMAGE EDITOR MODAL */}
      <InChatImageEditorModal
        isOpen={isImageEditorOpen}
        imageUrl={editingImageUrl}
        imageName={editingImageName}
        onClose={() => setIsImageEditorOpen(false)}
        onSaveEditedImage={handleSaveEditedImageInChat}
      />

      {/* PROMPT LIBRARY MODAL */}
      <AnimatePresence>
        {isPromptLibraryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Power Prompt Library
                  </h3>
                </div>
                <button
                  onClick={() => setIsPromptLibraryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-[#0c0c0e] border-b border-slate-200 dark:border-white/10 overflow-x-auto">
                {['all', 'coding', 'translation', 'document', 'writing', 'creative', 'business', 'custom'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPromptCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      promptCategoryFilter === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-white/5'
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {promptCategoryFilter === 'custom' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Your Custom Saved Prompts
                      </span>
                      <button
                        onClick={() => setIsSavingCustomPrompt(!isSavingCustomPrompt)}
                        className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isSavingCustomPrompt ? 'Cancel' : 'New Custom Prompt'}</span>
                      </button>
                    </div>

                    {isSavingCustomPrompt && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 space-y-2.5">
                        <input
                          type="text"
                          placeholder="Prompt Title"
                          value={newPromptTitle}
                          onChange={(e) => setNewPromptTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200"
                        />
                        <textarea
                          rows={3}
                          placeholder="Enter your prompt instructions..."
                          value={newPromptBody}
                          onChange={(e) => setNewPromptBody(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-200 resize-none"
                        />
                        <button
                          onClick={handleSaveCustomPrompt}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500"
                        >
                          Save Prompt
                        </button>
                      </div>
                    )}

                    {customPrompts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No custom prompts saved yet.</p>
                    ) : (
                      customPrompts.map((cp) => (
                        <div
                          key={cp.id}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 group"
                        >
                          <div className="space-y-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {cp.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                              {cp.prompt}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                setInputPrompt(cp.prompt);
                                setIsPromptLibraryOpen(false);
                              }}
                              className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-500"
                            >
                              Use
                            </button>
                            <button
                              onClick={() => setCustomPrompts((prev) => prev.filter((p) => p.id !== cp.id))}
                              className="p-1 text-slate-400 hover:text-rose-500"
                              title="Delete Prompt"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  CURATED_PROMPTS.filter((p) =>
                    promptCategoryFilter === 'all' ? true : p.category === promptCategoryFilter
                  ).map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 flex items-start justify-between gap-3 hover:border-indigo-500/40 transition-all group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {p.title}
                          </h4>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                            {p.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {p.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setInputPrompt(p.prompt);
                          setIsPromptLibraryOpen(false);
                          if (textareaRef.current) textareaRef.current.focus();
                        }}
                        className="shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Use
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARE CHAT MODAL */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Share Conversation</span>
                </h3>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Share this conversation or copy the formatted transcript.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    const fullText = currentSession.messages
                      .map((m) => `**${m.role === 'user' ? 'User' : 'VSA AI'}**: ${m.content}`)
                      .join('\n\n---\n\n');
                    navigator.clipboard.writeText(fullText);
                    showToast('success', 'Copied to Clipboard', 'Full conversation transcript copied.');
                    setIsShareModalOpen(false);
                  }}
                  className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Markdown Transcript</span>
                </button>

                <button
                  onClick={() => handleExportChat('json')}
                  className="w-full py-2.5 px-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON Schema</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
