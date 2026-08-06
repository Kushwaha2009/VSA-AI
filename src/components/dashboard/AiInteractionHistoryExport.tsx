import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ChatSession, ChatMessage, ActivityItem } from '../../types';
import {
  Download,
  FileText,
  FileCode2,
  FileSpreadsheet,
  Copy,
  Check,
  Search,
  Filter,
  Calendar,
  Bot,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Database,
  Layers,
  ArrowUpRight,
  Zap,
  Brain,
  Shield,
  Clock,
  User,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AiInteractionHistoryExportProps {
  onNavigateToChat?: () => void;
}

export type ExportFormat = 'json' | 'csv';
export type ExportScope = 'all' | 'chats_only' | 'tools_only';
export type DateRangeFilter = 'all' | '24h' | '7d' | '30d' | 'custom';

export const AiInteractionHistoryExport: React.FC<AiInteractionHistoryExportProps> = ({
  onNavigateToChat,
}) => {
  const { user, token, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  // Sessions and activity data
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Export options
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [exportScope, setExportScope] = useState<ExportScope>('all');
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [includeSystemMessages, setIncludeSystemMessages] = useState<boolean>(true);
  const [includeAttachmentsMeta, setIncludeAttachmentsMeta] = useState<boolean>(true);
  const [prettyPrintJson, setPrettyPrintJson] = useState<boolean>(true);

  // Search & UI states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());
  const [showRawPreview, setShowRawPreview] = useState<boolean>(false);
  const [copiedState, setCopiedState] = useState<boolean>(false);

  // Load all local and cloud data
  const loadData = async () => {
    setIsLoading(true);

    // 1. Read local storage sessions
    let localSessions: ChatSession[] = [];
    try {
      const rawSessions = localStorage.getItem('vsa_chat_sessions');
      if (rawSessions) {
        localSessions = JSON.parse(rawSessions);
      }
    } catch (e) {
      console.warn('Could not parse local chat sessions', e);
    }

    // 2. Read local storage activity logs
    let localActivities: ActivityItem[] = [];
    try {
      const rawActivities = localStorage.getItem('vsa_feature_utilization_v1');
      if (rawActivities) {
        localActivities = JSON.parse(rawActivities);
      }
    } catch (e) {
      console.warn('Could not parse local activity events', e);
    }

    // 3. If authenticated, fetch cloud sync & server activities
    if (token) {
      try {
        const [syncRes, actRes] = await Promise.allSettled([
          fetch('/api/user/sync', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/activity', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (syncRes.status === 'fulfilled' && syncRes.value.ok) {
          const syncJson = await syncRes.value.json();
          if (syncJson.syncData?.chatSessions && Array.isArray(syncJson.syncData.chatSessions)) {
            // Merge unique sessions by ID
            const sessionMap = new Map<string, ChatSession>();
            localSessions.forEach((s) => sessionMap.set(s.id, s));
            syncJson.syncData.chatSessions.forEach((s: ChatSession) => {
              if (!sessionMap.has(s.id) || (s.updatedAt && sessionMap.get(s.id)!.updatedAt < s.updatedAt)) {
                sessionMap.set(s.id, s);
              }
            });
            localSessions = Array.from(sessionMap.values());
          }
        }

        if (actRes.status === 'fulfilled' && actRes.value.ok) {
          const actJson = await actRes.value.json();
          if (actJson.activities && Array.isArray(actJson.activities)) {
            const actMap = new Map<string, ActivityItem>();
            localActivities.forEach((a) => actMap.set(a.id, a));
            actJson.activities.forEach((a: ActivityItem) => {
              actMap.set(a.id, a);
            });
            localActivities = Array.from(actMap.values());
          }
        }
      } catch (e) {
        console.warn('Background cloud fetch error:', e);
      }
    }

    // Sort sessions descending by updatedAt/createdAt
    localSessions.sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return timeB - timeA;
    });

    // Filter AI-relevant activities
    const aiActivities = localActivities.filter((a) => {
      return (
        a.toolType === 'ai-chat' ||
        a.toolType === 'pdf' ||
        a.toolType === 'image' ||
        a.toolType === 'video' ||
        a.actionName?.toLowerCase().includes('ai') ||
        a.actionName?.toLowerCase().includes('gemini') ||
        a.actionName?.toLowerCase().includes('ocr') ||
        a.actionName?.toLowerCase().includes('vision') ||
        a.actionName?.toLowerCase().includes('translate') ||
        a.actionName?.toLowerCase().includes('voice')
      );
    });

    setSessions(localSessions);
    setActivities(aiActivities);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    showToast('info', 'Refreshed', 'AI interaction history reloaded with latest session data.');
  };

  // Date filtering logic
  const isWithinDateRange = (timestampStr: string): boolean => {
    if (!timestampStr) return true;
    const itemDate = new Date(timestampStr).getTime();
    if (isNaN(itemDate)) return true;

    const now = Date.now();

    if (dateFilter === '24h') {
      return now - itemDate <= 24 * 60 * 60 * 1000;
    }
    if (dateFilter === '7d') {
      return now - itemDate <= 7 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === '30d') {
      return now - itemDate <= 30 * 24 * 60 * 60 * 1000;
    }
    if (dateFilter === 'custom') {
      if (customStartDate) {
        const start = new Date(customStartDate).getTime();
        if (itemDate < start) return false;
      }
      if (customEndDate) {
        // Include full day of end date
        const end = new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1;
        if (itemDate > end) return false;
      }
    }
    return true;
  };

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions
      .map((session) => {
        // Filter messages inside session
        const msgs = (session.messages || []).filter((msg) => {
          if (!includeSystemMessages && msg.role === 'system') return false;
          if (!isWithinDateRange(msg.timestamp)) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const contentMatch = msg.content?.toLowerCase().includes(q);
            const modelMatch = msg.model?.toLowerCase().includes(q);
            const personaMatch = msg.persona?.toLowerCase().includes(q);
            const sessionTitleMatch = session.title?.toLowerCase().includes(q);
            return contentMatch || modelMatch || personaMatch || sessionTitleMatch;
          }
          return true;
        });

        return {
          ...session,
          filteredMessages: msgs,
        };
      })
      .filter((session) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatches = session.title?.toLowerCase().includes(q);
          return titleMatches || session.filteredMessages.length > 0;
        }
        return session.filteredMessages.length > 0;
      });
  }, [sessions, dateFilter, customStartDate, customEndDate, includeSystemMessages, searchQuery]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      if (!isWithinDateRange(act.timestamp)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const actionMatch = act.actionName?.toLowerCase().includes(q);
        const detailsMatch = act.details?.toLowerCase().includes(q);
        const toolMatch = act.toolType?.toLowerCase().includes(q);
        return actionMatch || detailsMatch || toolMatch;
      }
      return true;
    });
  }, [activities, dateFilter, customStartDate, customEndDate, searchQuery]);

  // Total counts
  const totalFilteredMessagesCount = useMemo(() => {
    return filteredSessions.reduce((acc, s) => acc + s.filteredMessages.length, 0);
  }, [filteredSessions]);

  const uniqueModelsUsed = useMemo(() => {
    const set = new Set<string>();
    filteredSessions.forEach((s) => {
      s.filteredMessages.forEach((m) => {
        if (m.model) set.add(m.model);
      });
    });
    if (set.size === 0) set.add('gemini-3.6-flash');
    return Array.from(set);
  }, [filteredSessions]);

  // Build JSON Export Payload
  const generateJsonPayload = () => {
    const exportMetadata = {
      platform: 'VSA AI - Smart Solutions, Smarter Future',
      version: '2.4.0',
      exportedAt: new Date().toISOString(),
      user: {
        id: user?.id || 'usr_guest',
        name: user?.name || 'Guest User',
        email: user?.email || '',
        role: user?.role || 'user',
      },
      exportFilters: {
        scope: exportScope,
        dateRange: dateFilter,
        customStartDate: customStartDate || null,
        customEndDate: customEndDate || null,
        includeSystemMessages,
        includeAttachmentsMeta,
      },
      summary: {
        totalConversations: exportScope !== 'tools_only' ? filteredSessions.length : 0,
        totalMessages: exportScope !== 'tools_only' ? totalFilteredMessagesCount : 0,
        totalToolInteractions: exportScope !== 'chats_only' ? filteredActivities.length : 0,
        modelsUsed: uniqueModelsUsed,
      },
    };

    const payload: Record<string, any> = {
      exportMetadata,
    };

    if (exportScope === 'all' || exportScope === 'chats_only') {
      payload.chatSessions = filteredSessions.map((s) => ({
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        personaId: s.personaId || 'general',
        messageCount: s.filteredMessages.length,
        messages: s.filteredMessages.map((m) => {
          const msgObj: Record<string, any> = {
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            wordCount: m.content ? m.content.trim().split(/\s+/).length : 0,
            characterCount: m.content ? m.content.length : 0,
          };
          if (m.model) msgObj.model = m.model;
          if (m.persona) msgObj.persona = m.persona;
          if (includeAttachmentsMeta && m.attachments && m.attachments.length > 0) {
            msgObj.attachments = m.attachments.map((att) => ({
              id: att.id,
              name: att.name,
              size: att.size,
              type: att.type,
            }));
          }
          return msgObj;
        }),
      }));
    }

    if (exportScope === 'all' || exportScope === 'tools_only') {
      payload.aiToolInteractions = filteredActivities.map((a) => ({
        id: a.id,
        toolCategory: a.toolType,
        actionName: a.actionName,
        details: a.details,
        status: a.status,
        fileName: a.fileName || null,
        fileSize: a.fileSize || 0,
        timestamp: a.timestamp,
      }));
    }

    return prettyPrintJson ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
  };

  // Build CSV Export Payload (RFC 4180 Escaped)
  const generateCsvPayload = (): string => {
    const escapeCsv = (str: string | undefined | null): string => {
      if (str === undefined || str === null) return '""';
      const clean = String(str).replace(/"/g, '""');
      return `"${clean}"`;
    };

    if (exportScope === 'tools_only') {
      let csv = 'Activity ID,Timestamp,Tool Category,Action Name,Status,File Name,File Size (Bytes),Details\n';
      filteredActivities.forEach((act) => {
        csv += [
          escapeCsv(act.id),
          escapeCsv(act.timestamp),
          escapeCsv(act.toolType),
          escapeCsv(act.actionName),
          escapeCsv(act.status),
          escapeCsv(act.fileName),
          escapeCsv(act.fileSize?.toString() || '0'),
          escapeCsv(act.details),
        ].join(',') + '\n';
      });
      return csv;
    }

    if (exportScope === 'chats_only') {
      let csv = 'Session ID,Session Title,Message ID,Role,Persona,AI Model,Timestamp,Word Count,Has Attachments,Attachment Names,Message Content\n';
      filteredSessions.forEach((session) => {
        session.filteredMessages.forEach((msg) => {
          const wordCount = msg.content ? msg.content.trim().split(/\s+/).length : 0;
          const hasAtt = msg.attachments && msg.attachments.length > 0 ? 'Yes' : 'No';
          const attNames = msg.attachments ? msg.attachments.map((a) => a.name).join('; ') : '';

          csv += [
            escapeCsv(session.id),
            escapeCsv(session.title),
            escapeCsv(msg.id),
            escapeCsv(msg.role),
            escapeCsv(msg.persona || session.personaId || 'General Assistant'),
            escapeCsv(msg.model || 'Gemini 3.6 Flash'),
            escapeCsv(msg.timestamp),
            escapeCsv(wordCount.toString()),
            escapeCsv(hasAtt),
            escapeCsv(attNames),
            escapeCsv(msg.content),
          ].join(',') + '\n';
        });
      });
      return csv;
    }

    // Consolidated 'all' CSV
    let csv = 'Record Type,Session or Tool ID,Title or Action,Message ID,Role or Status,Persona or Model,Timestamp,Details or Content\n';
    
    // 1. Chat Messages
    filteredSessions.forEach((session) => {
      session.filteredMessages.forEach((msg) => {
        csv += [
          escapeCsv('Chat Message'),
          escapeCsv(session.id),
          escapeCsv(session.title),
          escapeCsv(msg.id),
          escapeCsv(msg.role),
          escapeCsv(msg.model || msg.persona || 'AI Assistant'),
          escapeCsv(msg.timestamp),
          escapeCsv(msg.content),
        ].join(',') + '\n';
      });
    });

    // 2. Tool Executions
    filteredActivities.forEach((act) => {
      csv += [
        escapeCsv('AI Tool Event'),
        escapeCsv(act.id),
        escapeCsv(act.actionName),
        escapeCsv('-'),
        escapeCsv(act.status),
        escapeCsv(act.toolType),
        escapeCsv(act.timestamp),
        escapeCsv(act.details || (act.fileName ? `File: ${act.fileName}` : 'Tool Execution')),
      ].join(',') + '\n';
    });

    return csv;
  };

  // Perform File Download
  const handleDownload = (format: ExportFormat) => {
    try {
      const nowStr = new Date().toISOString().split('T')[0];
      const userNameClean = (user?.name || 'User').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `VSA_AI_Interaction_History_${userNameClean}_${nowStr}.${format}`;

      let content = '';
      let mimeType = '';

      if (format === 'json') {
        content = generateJsonPayload();
        mimeType = 'application/json;charset=utf-8;';
      } else {
        content = generateCsvPayload();
        mimeType = 'text/csv;charset=utf-8;';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        'success',
        'Export Successful',
        `Downloaded ${filename} (${(blob.size / 1024).toFixed(1)} KB)`
      );
    } catch (err: any) {
      showToast('error', 'Export Failed', err?.message || 'Could not generate export file.');
    }
  };

  // Copy to Clipboard
  const handleCopyClipboard = async () => {
    try {
      const content = selectedFormat === 'json' ? generateJsonPayload() : generateCsvPayload();
      await navigator.clipboard.writeText(content);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 2500);
      showToast(
        'success',
        'Copied to Clipboard',
        `${selectedFormat.toUpperCase()} data copied to your clipboard.`
      );
    } catch (e) {
      showToast('error', 'Copy Failed', 'Clipboard access was blocked by the browser.');
    }
  };

  const toggleExpandSession = (id: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAllSessions = () => {
    setExpandedSessionIds(new Set(filteredSessions.map((s) => s.id)));
  };

  const collapseAllSessions = () => {
    setExpandedSessionIds(new Set());
  };

  return (
    <div id="ai-interaction-history-export-suite" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/80 dark:to-slate-950 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              <span>Data Portability & Audit Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>AI Interaction History & Export</span>
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Export your entire multi-model AI conversation transcripts, user prompts, assistant
              responses, and multimodal tool executions as structured <span className="text-indigo-300 font-bold">JSON</span> or tabular <span className="text-indigo-300 font-bold">CSV</span> files.
            </p>
          </div>

          {/* Instant Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              id="btn-export-quick-json"
              onClick={() => handleDownload('json')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileCode2 className="w-4 h-4" />
              <span>Export JSON</span>
            </button>

            <button
              id="btn-export-quick-csv"
              onClick={() => handleDownload('csv')}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              id="btn-refresh-history-data"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Conversations</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {filteredSessions.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {sessions.length} total saved threads
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Message Turns</span>
            <Bot className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalFilteredMessagesCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Prompts & AI responses
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tool Operations</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {filteredActivities.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            OCR, Vision, PDF & Media AI
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Models Active</span>
            <Brain className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white truncate pt-1">
            {uniqueModelsUsed[0] ? uniqueModelsUsed[0].replace('gemini-', 'Gemini ') : 'Gemini 3.6'}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
            {uniqueModelsUsed.length} model variants
          </p>
        </div>
      </div>

      {/* Main Configuration & Customizer Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              <span>Export Customization & Filters</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure file structure, time boundaries, and specific metadata inclusions.
            </p>
          </div>

          {/* Live Preview Toggle Button */}
          <div className="flex items-center gap-2">
            <button
              id="btn-toggle-raw-preview"
              onClick={() => setShowRawPreview(!showRawPreview)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showRawPreview
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {showRawPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showRawPreview ? 'Hide File Preview' : 'Preview Output Code'}</span>
            </button>
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Format Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Export Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-select-format-json"
                onClick={() => setSelectedFormat('json')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  selectedFormat === 'json'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    <FileCode2 className="w-4 h-4 text-indigo-500" />
                    JSON (.json)
                  </span>
                  {selectedFormat === 'json' && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Hierarchical structure with full message objects & metadata
                </span>
              </button>

              <button
                id="btn-select-format-csv"
                onClick={() => setSelectedFormat('csv')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  selectedFormat === 'csv'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    CSV (.csv)
                  </span>
                  {selectedFormat === 'csv' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                  Tabular spreadsheet format for Excel, Google Sheets, Pandas
                </span>
              </button>
            </div>
          </div>

          {/* 2. Scope Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Data Scope
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'all' as ExportScope, label: 'All AI History (Chats & Tools)', desc: 'Complete backup of all interactions' },
                { id: 'chats_only' as ExportScope, label: 'Chat Conversations Only', desc: 'Q&A prompt turns & transcripts' },
                { id: 'tools_only' as ExportScope, label: 'AI Tool Logs Only', desc: 'OCR, Vision, Audio & Media logs' },
              ].map((scope) => (
                <label
                  key={scope.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    exportScope === scope.id
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="radio"
                      name="export-scope"
                      checked={exportScope === scope.id}
                      onChange={() => setExportScope(scope.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="truncate">
                      <span className="text-xs text-slate-800 dark:text-slate-200 block truncate">
                        {scope.label}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {scope.desc}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Time Filter & Inclusions */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              3. Date Range & Inclusions
            </label>
            <div className="space-y-2">
              <select
                id="select-export-date-range"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateRangeFilter)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold"
              >
                <option value="all">All Time (Complete History)</option>
                <option value="24h">Past 24 Hours</option>
                <option value="7d">Past 7 Days</option>
                <option value="30d">Past 30 Days</option>
                <option value="custom">Custom Date Range...</option>
              </select>

              {dateFilter === 'custom' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeSystemMessages}
                    onChange={(e) => setIncludeSystemMessages(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include Welcome & System prompts</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeAttachmentsMeta}
                    onChange={(e) => setIncludeAttachmentsMeta(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Include Attachment filenames & sizes</span>
                </label>

                {selectedFormat === 'json' && (
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prettyPrintJson}
                      onChange={(e) => setPrettyPrintJson(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Formatted 2-space indented JSON</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live File Preview (Collapsible) */}
        <AnimatePresence>
          {showRawPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-slate-100 dark:border-slate-800 pt-4"
            >
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Live Generated Output ({selectedFormat.toUpperCase()})
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono">
                    ~{((selectedFormat === 'json' ? generateJsonPayload().length : generateCsvPayload().length) / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button
                  id="btn-copy-preview-content"
                  onClick={handleCopyClipboard}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedState ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-[11px] border border-slate-800 select-all">
                <pre className="whitespace-pre-wrap break-all">
                  {selectedFormat === 'json' ? generateJsonPayload() : generateCsvPayload()}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Download Footer Ribbon */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 -mx-5 -mb-5 sm:-mx-7 sm:-mb-7 p-4 sm:p-5 rounded-b-3xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>
              Target filename:{' '}
              <strong className="text-slate-800 dark:text-slate-200 font-mono text-[11px]">
                VSA_AI_Interaction_History_{user?.name ? user.name.replace(/\s+/g, '_') : 'User'}_{new Date().toISOString().split('T')[0]}.{selectedFormat}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              id="btn-copy-data-clipboard"
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-all shadow-xs"
            >
              {copiedState ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedState ? 'Copied' : 'Copy Data'}</span>
            </button>

            <button
              id="btn-download-selected-format"
              onClick={() => handleDownload(selectedFormat)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md active:scale-95 ${
                selectedFormat === 'json'
                  ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Download {selectedFormat.toUpperCase()} File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive History Search & Session Explorer */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Interaction Archive Explorer</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse, filter, and inspect individual conversations and prompt turns.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={expandAllSessions}
              className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Expand All
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={collapseAllSessions}
              className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            id="input-search-history"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords in prompts, AI answers, models, or session titles..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sessions & Messages Accordion List */}
        {filteredSessions.length === 0 && filteredActivities.length === 0 ? (
          <div className="py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No matching AI interactions found
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try broadening your search keywords or resetting the date filter.'
                  : 'Start a conversation with the VSA AI Assistant to build your interaction history.'}
              </p>
            </div>
            {onNavigateToChat && (
              <button
                id="btn-goto-chat-from-history"
                onClick={onNavigateToChat}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all shadow-xs"
              >
                <span>Open AI Chat</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const isExpanded = expandedSessionIds.has(session.id);
              const messageCount = session.filteredMessages.length;

              return (
                <div
                  key={session.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 overflow-hidden transition-all"
                >
                  {/* Session Header Clickable */}
                  <div
                    onClick={() => toggleExpandSession(session.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                          {session.title || 'Untitled Conversation'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{new Date(session.updatedAt || session.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{messageCount} {messageCount === 1 ? 'message' : 'messages'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                        {session.personaId || 'general'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Message Items Dropdown */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-slate-200/80 dark:border-slate-700/80 p-4 space-y-3 bg-white/70 dark:bg-slate-900/60"
                      >
                        {session.filteredMessages.map((msg) => {
                          const isUser = msg.role === 'user';
                          const isAssistant = msg.role === 'assistant';

                          return (
                            <div
                              key={msg.id}
                              className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                                isUser
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-slate-800 dark:text-slate-200 ml-4 sm:ml-8'
                                  : isAssistant
                                  ? 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 mr-4 sm:mr-8'
                                  : 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-center text-[11px]'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold opacity-75">
                                <span className="flex items-center gap-1">
                                  {isUser ? (
                                    <>
                                      <User className="w-3 h-3 text-indigo-500" />
                                      <span>User Prompt</span>
                                    </>
                                  ) : isAssistant ? (
                                    <>
                                      <Bot className="w-3 h-3 text-purple-500" />
                                      <span>{msg.persona || 'VSA Assistant'} ({msg.model || 'Gemini 3.6 Flash'})</span>
                                    </>
                                  ) : (
                                    <span>System Announcement</span>
                                  )}
                                </span>
                                <span className="font-mono text-[10px]">
                                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <p className="whitespace-pre-wrap leading-relaxed text-xs">
                                {msg.content}
                              </p>

                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="pt-1 flex flex-wrap gap-1">
                                  {msg.attachments.map((att) => (
                                    <span
                                      key={att.id}
                                      className="px-2 py-0.5 rounded-md bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-mono"
                                    >
                                      📎 {att.name} ({(att.size / 1024).toFixed(0)} KB)
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
