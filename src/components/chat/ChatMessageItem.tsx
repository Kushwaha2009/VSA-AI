import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../../types';
import Markdown from 'react-markdown';
import { VsaEmblem } from '../common/VsaLogo';
import {
  VoicePersona,
  findBestNativeVoice,
  getSelectedVoice,
  speakText,
  stopSpeech,
  cleanTextForSpeech,
} from '../../services/voiceRegistry';
import {
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Volume2,
  VolumeX,
  Download,
  Terminal,
  Wand2,
  Maximize2,
  ExternalLink,
  Edit3,
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
  onQuickAction?: (prompt: string) => void;
  onEditImage?: (imageUrl: string, imageName: string) => void;
  activeVoice?: VoicePersona;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRetry,
  onQuickAction,
  onEditImage,
  activeVoice,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech when unmounted
  useEffect(() => {
    return () => {
      if (window.speechSynthesis && isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-To-Speech Toggle using Active / Selected Voice Persona
  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      const voiceToUse = activeVoice || getSelectedVoice();
      speakText(
        message.content,
        voiceToUse.id,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };


  // Code block download
  const handleDownloadCode = (codeContent: string, lang: string) => {
    const extMap: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      tsx: 'tsx',
      jsx: 'jsx',
      python: 'py',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      sh: 'sh',
      bash: 'sh',
    };
    const ext = extMap[lang.toLowerCase()] || 'txt';
    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vsa_snippet_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sleek, compact User message to maximize room for chatting
  if (isUser) {
    return (
      <div
        id={`chat-msg-${message.id}`}
        className="flex justify-end max-w-4xl mx-auto py-1 px-2 group"
      >
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%] space-y-1">
          <div className="flex items-center gap-2 pr-1 text-[10px] text-slate-400 font-mono">
            <span>You</span>
            <span>·</span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm shadow-md shadow-indigo-600/10 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 pt-1">
              {message.attachments.map((att) => {
                const isImage = att.type.startsWith('image/');
                return (
                  <div
                    key={att.id}
                    className="relative group/att rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-800 shadow-sm"
                  >
                    {isImage ? (
                      <div className="relative">
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl"
                        />
                        {onEditImage && (
                          <button
                            onClick={() => onEditImage(att.dataUrl, att.name)}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover/att:opacity-100 flex flex-col items-center justify-center gap-1 text-white text-[11px] font-bold transition-opacity p-1"
                            title="Edit image with AI in chat"
                          >
                            <Wand2 className="w-4 h-4 text-indigo-400" />
                            <span>Edit in Chat</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 text-xs text-slate-700 dark:text-slate-200">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <span className="truncate max-w-[120px] font-medium">{att.name}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Assistant Message (Detailed, spacious, rich formatting)
  return (
    <div
      id={`chat-msg-${message.id}`}
      className="flex gap-3 max-w-4xl mx-auto py-3.5 px-3.5 sm:px-4 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-lg shadow-black/5 transition-colors"
    >
      {/* Avatar Icon */}
      <div className="shrink-0 mt-0.5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-900 dark:bg-white/10 flex items-center justify-center shadow-md p-0.5 border border-indigo-500/20">
          <VsaEmblem className="w-6 h-6" idPrefix={`msg-bot-${message.id}`} />
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-white/5 pb-1.5">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              VSA AI
            </span>
            {message.persona && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                {message.persona}
              </span>
            )}
            {message.model && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-mono">
                {message.model.replace('gemini-', '')}
              </span>
            )}
            {activeVoice && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
                <span>🔊 {activeVoice.name}</span>
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
            {/* Audio Voice Player for AI Responses */}
            <button
              id={`btn-tts-msg-${message.id}`}
              onClick={handleToggleSpeech}
              className={`p-1 rounded-md transition-colors ${
                isSpeaking
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
              title={isSpeaking ? 'Stop voice reading' : `Read aloud with ${activeVoice ? activeVoice.name : 'AI Voice'}`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              id={`btn-copy-msg-${message.id}`}
              onClick={handleCopy}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {onRetry && (
              <button
                id={`btn-retry-msg-${message.id}`}
                onClick={onRetry}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                title="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Assistant Attachments / Generated Images */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-1">
            {message.attachments.map((att) => {
              const isImage = att.type.startsWith('image/');
              return (
                <div
                  key={att.id}
                  className="relative group/att rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#18181c] shadow-sm"
                >
                  {isImage ? (
                    <div className="relative">
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="max-h-60 sm:max-h-72 object-contain rounded-xl"
                      />
                      {onEditImage && (
                        <button
                          onClick={() => onEditImage(att.dataUrl, att.name)}
                          className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-[11px] font-bold shadow-lg backdrop-blur flex items-center gap-1.5 transition-all hover:scale-105"
                          title="Edit this image with AI inside chat"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Edit Image in Chat</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 text-xs text-slate-700 dark:text-slate-200">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span className="truncate max-w-[140px] font-medium">{att.name}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Markdown Rendered Text with In-Chat Image Detection and Code Blocks */}
        <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-xs sm:text-sm leading-relaxed overflow-x-auto">
          <div className="markdown-body">
            <Markdown
              components={{
                img({ node, src, alt, ...props }: any) {
                  return (
                    <div className="my-3 relative group/img inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md">
                      <img src={src} alt={alt || 'Image'} className="max-h-72 object-contain rounded-xl" {...props} />
                      {onEditImage && src && (
                        <button
                          onClick={() => onEditImage(src, alt || 'chat_image.png')}
                          className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-600 text-white text-[11px] font-bold shadow-lg backdrop-blur flex items-center gap-1.5 transition-all hover:scale-105"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Edit in Chat</span>
                        </button>
                      )}
                    </div>
                  );
                },
                code({ node, inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const lang = match ? match[1] : '';
                  const codeString = String(children).replace(/\n$/, '');

                  if (!inline && (match || codeString.includes('\n'))) {
                    return (
                      <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 font-mono text-xs shadow-md">
                        {/* Code Header Bar */}
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="uppercase text-slate-300 font-semibold">{lang || 'CODE'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Copy code"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </button>
                            <button
                              onClick={() => handleDownloadCode(codeString, lang)}
                              className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                              title="Download code file"
                            >
                              <Download className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                        {/* Code Body */}
                        <div className="p-3.5 overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-mono text-xs" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};
