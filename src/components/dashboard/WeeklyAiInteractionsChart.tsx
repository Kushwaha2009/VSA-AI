import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Sparkles,
  Bot,
  Zap,
  Layers,
  Activity,
  ArrowUpRight,
  RefreshCw,
  PieChart as PieIcon,
  LineChart as LineIcon,
  FileText,
  Image as ImageIcon,
  Video,
  Info,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ActivityLog, ChatSession } from '../../types';

interface WeeklyAiInteractionsChartProps {
  activities?: ActivityLog[];
  onNavigateToTab?: (tab: 'chat' | 'pdf' | 'image' | 'video' | 'dashboard' | 'admin') => void;
  onNavigateToHistory?: () => void;
}

export type ChartViewType = 'bar' | 'area' | 'donut';
export type TimeRangeType = '7d' | '14d' | '30d';

interface DayDataPoint {
  dateKey: string;
  dayLabel: string;
  fullDate: string;
  chatInteractions: number;
  toolInteractions: number;
  totalInteractions: number;
}

const CATEGORY_COLORS = {
  chat: '#6366f1', // Indigo
  tools: '#10b981', // Emerald
  vision: '#8b5cf6', // Purple
  media: '#f59e0b', // Amber
};

const PIE_PALETTE = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899'];

export const WeeklyAiInteractionsChart: React.FC<WeeklyAiInteractionsChartProps> = ({
  activities = [],
  onNavigateToTab,
  onNavigateToHistory,
}) => {
  const { isDark } = useTheme();

  const [chartView, setChartView] = useState<ChartViewType>('bar');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'chat' | 'tools'>('all');
  const [localSessions, setLocalSessions] = useState<ChatSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load chat sessions from local storage to get message timestamps
  const loadLocalSessions = () => {
    try {
      const raw = localStorage.getItem('vsa_chat_sessions');
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        setLocalSessions(parsed);
      }
    } catch (e) {
      console.warn('Failed to parse local chat sessions for weekly chart', e);
    }
  };

  useEffect(() => {
    loadLocalSessions();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLocalSessions();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Generate date timeline for the chosen range (7d, 14d, 30d)
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const now = new Date();
    const result: DayDataPoint[] = [];

    // Map of YYYY-MM-DD -> { chat: count, tools: count }
    const dayBuckets: Record<string, { chat: number; tools: number; fullDate: string; dayLabel: string }> = {};

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(undefined, {
        weekday: daysCount <= 7 ? 'short' : undefined,
        month: 'numeric',
        day: 'numeric',
      });
      const fullDate = d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      dayBuckets[dateKey] = {
        chat: 0,
        tools: 0,
        fullDate,
        dayLabel,
      };
    }

    // 1. Accumulate Chat Messages
    localSessions.forEach((session) => {
      (session.messages || []).forEach((msg) => {
        if (!msg.timestamp) return;
        const msgDateKey = msg.timestamp.split('T')[0];
        if (dayBuckets[msgDateKey]) {
          dayBuckets[msgDateKey].chat += 1;
        }
      });
    });

    // 2. Accumulate Activity logs (Tools, OCR, AI conversions)
    activities.forEach((act) => {
      if (!act.timestamp) return;
      const actDateKey = act.timestamp.split('T')[0];
      if (dayBuckets[actDateKey]) {
        dayBuckets[actDateKey].tools += 1;
      }
    });

    // Build ordered array
    Object.keys(dayBuckets)
      .sort()
      .forEach((dateKey) => {
        const item = dayBuckets[dateKey];
        result.push({
          dateKey,
          dayLabel: item.dayLabel,
          fullDate: item.fullDate,
          chatInteractions: item.chat,
          toolInteractions: item.tools,
          totalInteractions: item.chat + item.tools,
        });
      });

    return result;
  }, [timeRange, localSessions, activities]);

  // Aggregate category statistics for Donut chart & breakdown
  const categoryStats = useMemo(() => {
    let chatCount = 0;
    let pdfCount = 0;
    let imageVisionCount = 0;
    let videoMediaCount = 0;
    let otherCount = 0;

    localSessions.forEach((s) => {
      chatCount += (s.messages || []).length;
    });

    activities.forEach((a) => {
      const type = a.toolType?.toLowerCase();
      const action = a.actionName?.toLowerCase() || '';
      if (type === 'ai-chat' || action.includes('chat') || action.includes('prompt')) {
        chatCount += 1;
      } else if (type === 'pdf' || action.includes('pdf') || action.includes('ocr')) {
        pdfCount += 1;
      } else if (type === 'image' || action.includes('image') || action.includes('vision')) {
        imageVisionCount += 1;
      } else if (type === 'video' || action.includes('video') || action.includes('audio')) {
        videoMediaCount += 1;
      } else {
        otherCount += 1;
      }
    });

    const list = [
      { name: 'AI Chat & Personas', value: chatCount, color: '#6366f1' },
      { name: 'PDF & OCR AI', value: pdfCount, color: '#10b981' },
      { name: 'Image Studio & Vision', value: imageVisionCount, color: '#8b5cf6' },
      { name: 'Media & Voice Tools', value: videoMediaCount, color: '#f59e0b' },
    ].filter((item) => item.value > 0);

    if (list.length === 0) {
      list.push(
        { name: 'AI Chat & Personas', value: 12, color: '#6366f1' },
        { name: 'PDF & OCR AI', value: 5, color: '#10b981' },
        { name: 'Image Studio & Vision', value: 4, color: '#8b5cf6' },
        { name: 'Media & Voice Tools', value: 3, color: '#f59e0b' }
      );
    }

    return list;
  }, [localSessions, activities]);

  // Metrics summary
  const totalPeriodInteractions = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.totalInteractions, 0);
  }, [chartData]);

  const totalChatInteractions = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.chatInteractions, 0);
  }, [chartData]);

  const totalToolInteractions = useMemo(() => {
    return chartData.reduce((acc, d) => acc + d.toolInteractions, 0);
  }, [chartData]);

  const peakDay = useMemo(() => {
    if (chartData.length === 0) return null;
    let max = chartData[0];
    chartData.forEach((d) => {
      if (d.totalInteractions > max.totalInteractions) {
        max = d;
      }
    });
    return max;
  }, [chartData]);

  const dailyAverage = useMemo(() => {
    if (chartData.length === 0) return '0';
    return (totalPeriodInteractions / chartData.length).toFixed(1);
  }, [totalPeriodInteractions, chartData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint: DayDataPoint = payload[0]?.payload;
      return (
        <div className="p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-700/80 text-white shadow-2xl text-xs space-y-2 min-w-[170px]">
          <div className="border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span className="font-bold text-slate-200 text-[11px]">
              {dataPoint?.fullDate || label}
            </span>
            <span className="text-[10px] text-indigo-400 font-mono font-bold">
              {dataPoint?.totalInteractions} total
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>AI Chat Turns:</span>
              </span>
              <strong className="text-white font-mono">{dataPoint?.chatInteractions || 0}</strong>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Tool AI Operations:</span>
              </span>
              <strong className="text-white font-mono">{dataPoint?.toolInteractions || 0}</strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const axisStroke = isDark ? '#475569' : '#cbd5e1';
  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  return (
    <div
      id="weekly-ai-interactions-visualizer"
      className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 animate-fade-in"
    >
      {/* Header with Title and Control Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
            <Activity className="w-3 h-3 text-indigo-500" />
            <span>Interactive Visual Analytics</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Weekly AI Interaction Trends</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time visual monitoring of chat prompts, multi-model inferences, and tool executions.
          </p>
        </div>

        {/* View Controls Strip */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            {[
              { id: '7d' as TimeRangeType, label: '7 Days' },
              { id: '14d' as TimeRangeType, label: '14 Days' },
              { id: '30d' as TimeRangeType, label: '30 Days' },
            ].map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Chart View Mode Selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              id="btn-chart-mode-bar"
              onClick={() => setChartView('bar')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                chartView === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Stacked Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

            <button
              id="btn-chart-mode-area"
              onClick={() => setChartView('area')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                chartView === 'area'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Smooth Trend Area Chart"
            >
              <LineIcon className="w-4 h-4" />
            </button>

            <button
              id="btn-chart-mode-donut"
              onClick={() => setChartView('donut')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                chartView === 'donut'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Category Distribution Donut"
            >
              <PieIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            id="btn-refresh-chart-data"
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs transition-all active:scale-95"
            title="Refresh Timeline Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stats Highlight Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            <span>Period Total</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalPeriodInteractions}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            {timeRange === '7d' ? 'Past 7 Days' : timeRange === '14d' ? 'Past 14 Days' : 'Past 30 Days'}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Bot className="w-3 h-3" />
            <span>Chat Queries</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalChatInteractions}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Multi-model Q&A turns
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Daily Average</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {dailyAverage}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Avg actions per active day
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Peak Activity</span>
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1 truncate">
            {peakDay ? peakDay.dayLabel : 'Today'}
          </div>
          <div className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold truncate">
            {peakDay ? `${peakDay.totalInteractions} interactions` : '0 interactions'}
          </div>
        </div>
      </div>

      {/* Main Recharts Visualizer Canvas */}
      <div className="pt-2">
        {chartView === 'bar' && (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="dayLabel"
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
                />
                <YAxis
                  stroke={axisStroke}
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                {(selectedMetric === 'all' || selectedMetric === 'chat') && (
                  <Bar
                    dataKey="chatInteractions"
                    name="AI Chat Prompts"
                    fill={CATEGORY_COLORS.chat}
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'tools') && (
                  <Bar
                    dataKey="toolInteractions"
                    name="AI Tool Operations"
                    fill={CATEGORY_COLORS.tools}
                    radius={[4, 4, 0, 0]}
                    stackId="a"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartView === 'area' && (
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CATEGORY_COLORS.chat} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CATEGORY_COLORS.chat} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="toolsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CATEGORY_COLORS.tools} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={CATEGORY_COLORS.tools} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis
                  dataKey="dayLabel"
                  stroke={axisStroke}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
                />
                <YAxis
                  stroke={axisStroke}
                  fontSize={11}
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: axisStroke, strokeWidth: 1 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
                {(selectedMetric === 'all' || selectedMetric === 'chat') && (
                  <Area
                    type="monotone"
                    dataKey="chatInteractions"
                    name="AI Chat Prompts"
                    stroke={CATEGORY_COLORS.chat}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#chatGradient)"
                  />
                )}
                {(selectedMetric === 'all' || selectedMetric === 'tools') && (
                  <Area
                    type="monotone"
                    dataKey="toolInteractions"
                    name="AI Tool Operations"
                    stroke={CATEGORY_COLORS.tools}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#toolsGradient)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {chartView === 'donut' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-60 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PIE_PALETTE[index % PIE_PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val} actions`, name]}
                    contentStyle={{
                      backgroundColor: isDark ? '#09090b' : '#ffffff',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Table */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Interaction Distribution by Studio
              </h4>
              <div className="space-y-2">
                {categoryStats.map((item, idx) => {
                  const total = categoryStats.reduce((a, b) => a + b.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-md"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {item.value} ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation & Deep Dive Links */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Interactions are automatically logged from Gemini multi-model chat and tool operations.</span>
        </div>

        {onNavigateToHistory && (
          <button
            id="btn-chart-explore-export-history"
            onClick={onNavigateToHistory}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
          >
            <span>Export & View Interaction History</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
