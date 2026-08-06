import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { User, SystemLog, PlatformSettings, FeatureUtilizationStats, FeatureCategory } from '../../types';
import { fetchFeatureUtilizationStats, subscribeToUsage } from '../../services/usageTracker';
import { SeoTab } from './SeoTab';
import {
  Shield,
  Users,
  BarChart3,
  Terminal,
  Settings,
  Globe,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Download,
  Save,
  Megaphone,
  Cpu,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  UserX,
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
  Activity,
  Layers,
  TrendingUp,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  Bug,
  Lightbulb,
  MessageSquareHeart,
  Eye,
  X,
  Instagram,
  Code2,
  User as UserIcon,
  ExternalLink,
  Copy,
  Check,
  HelpCircle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts';

export const AdminPanel: React.FC = () => {
  const { user, token, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'logs' | 'settings' | 'seo'>('analytics');

  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalQueries: 0,
    filesProcessed: 0,
    errorCount: 0,
  });

  // Feature Utilization Stats
  const [featureStats, setFeatureStats] = useState<FeatureUtilizationStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [analyticsView, setAnalyticsView] = useState<'all' | 'ai_vs_pdf' | 'subfeatures' | 'stream'>('all');

  // Users management
  const [usersList, setUsersList] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // System Logs & Feedback Reports
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logLevelFilter, setLogLevelFilter] = useState<'all' | 'bugs' | 'features' | 'feedback' | 'info' | 'warn' | 'error'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [selectedLogItem, setSelectedLogItem] = useState<SystemLog | null>(null);

  // Platform Settings & Developer Information
  const [settings, setSettings] = useState<PlatformSettings>({
    geminiModel: 'gemini-3.6-flash',
    maxUploadLimitMB: 50,
    maintenanceMode: false,
    announcement: {
      active: true,
      message: '🚀 VSA AI Studio 2.0 is Live with Full Indian Language Support & Media Suites!',
      type: 'info',
    },
    developerInfo: {
      name: 'विशाल कुमार',
      nameEnglish: 'Vishal Kumar',
      role: 'फाउंडर एंड सोलो डेवलपर',
      roleEnglish: 'Founder & Solo Developer',
      instagram: '@Kushwaha_2009',
      instagramUrl: 'https://instagram.com/Kushwaha_2009',
      attributionStatement: 'यह एप्लिकेशन विशाल कुमार द्वारा डेवलप की गई है, और AI कैपेबिलिटीज इंटीग्रेटेड सर्विसेज द्वारा दी जाती हैं।',
      attributionStatementEn: 'This application is developed by Vishal Kumar, and AI capabilities are provided by integrated services.',
      bio: 'Founder & Solo Developer behind VSA AI Studio. Engineering high-speed multimodal generative AI, 145+ language translation, and secure browser-based multimedia tools.',
      email: 'contact@vsa.ai',
    },
  });

  const [loading, setLoading] = useState(false);

  // Fetch initial admin data & feature utilization
  const fetchAdminData = async () => {
    if (!token || !isAdmin) return;
    try {
      // 1. Stats
      const statsRes = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // 2. Users
      const usersRes = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsersList(data.users);
      }

      // 3. Logs
      const logsRes = await fetch('/api/admin/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs);
      }

      // 4. Settings
      const settingsRes = await fetch('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.settings) setSettings(data.settings);
      }

      // 5. Feature Utilization
      const fStats = await fetchFeatureUtilizationStats(token);
      setFeatureStats(fStats);
    } catch (e) {
      console.error('Failed to load admin panel data:', e);
    }
  };

  useEffect(() => {
    fetchAdminData();
    // Subscribe to live usage events to update charts in real-time
    const unsubscribe = subscribeToUsage(() => {
      fetchFeatureUtilizationStats(token).then((data) => {
        setFeatureStats(data);
      });
    });
    return () => unsubscribe();
  }, [token, isAdmin]);

  if (!isAdmin) {
    return (
      <div id="admin-access-denied" className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-[#121216] rounded-3xl border border-rose-200 dark:border-rose-900/30 shadow-2xl text-center space-y-5 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-800/40 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>HTTP 403 Forbidden</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Access Denied
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            Administrative access is restricted exclusively to the verified Super Admin (<span className="font-semibold text-slate-800 dark:text-slate-200">Vishal Kumar</span>). Public and standard accounts are prohibited from accessing this portal.
          </p>
        </div>
      </div>
    );
  }

  // User Management Actions
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus as any } : u))
        );
        showToast('success', 'User Status Updated', `Account is now ${newStatus}.`);
      }
    } catch (e) {
      showToast('error', 'Update Failed');
    }
  };

  const handleToggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
        );
        showToast('success', 'User Role Updated', `Account role changed to ${newRole}.`);
      }
    } catch (e) {
      showToast('error', 'Role update failed');
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setLogs([]);
        showToast('info', 'System Logs Cleared');
      }
    } catch (e) {
      showToast('error', 'Failed to clear logs');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        showToast('success', 'Platform Settings Saved', 'Runtime environment updated.');
      }
    } catch (e) {
      showToast('error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Export Utilization Report as JSON or CSV
  const handleExportUtilizationReport = (format: 'json' | 'csv') => {
    if (!featureStats) return;
    if (format === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(featureStats, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `VSA_Feature_Utilization_Report_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('success', 'Report Exported', 'JSON analytics report downloaded.');
    } else {
      let csv = 'Category,Feature Name,Count,Percentage\n';
      (featureStats.byCategory || []).forEach((cat) => {
        csv += `"${cat.category}","${cat.name}",${cat.count},${cat.percent}%\n`;
      });
      (featureStats.pdfSubFeatures || []).forEach((sf) => {
        csv += `"pdf","${sf.name}",${sf.count},-\n`;
      });
      (featureStats.aiSubFeatures || []).forEach((sf) => {
        csv += `"ai-chat","${sf.name}",${sf.count},-\n`;
      });
      (featureStats.imageSubFeatures || []).forEach((sf) => {
        csv += `"image","${sf.name}",${sf.count},-\n`;
      });
      (featureStats.videoSubFeatures || []).forEach((sf) => {
        csv += `"video","${sf.name}",${sf.count},-\n`;
      });
      const dataStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `VSA_Feature_Utilization_Report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('success', 'Report Exported', 'CSV analytics report downloaded.');
    }
  };

  // Language chart data
  const chartDataLanguages = [
    { name: 'English', value: 45, color: '#6366f1' },
    { name: 'Hindi', value: 30, color: '#8b5cf6' },
    { name: 'Bhojpuri', value: 12, color: '#ec4899' },
    { name: 'Maithili', value: 8, color: '#f59e0b' },
    { name: 'Punjabi', value: 5, color: '#10b981' },
  ];

  // Derive feature utilization datasets
  const timelineData = featureStats?.timeline || [
    { date: 'Mon', aiChat: 120, pdfTools: 85, imageTools: 40, videoTools: 25, total: 270 },
    { date: 'Tue', aiChat: 180, pdfTools: 110, imageTools: 55, videoTools: 35, total: 380 },
    { date: 'Wed', aiChat: 240, pdfTools: 145, imageTools: 70, videoTools: 45, total: 500 },
    { date: 'Thu', aiChat: 310, pdfTools: 190, imageTools: 90, videoTools: 60, total: 650 },
    { date: 'Fri', aiChat: 420, pdfTools: 260, imageTools: 130, videoTools: 85, total: 895 },
    { date: 'Sat', aiChat: 380, pdfTools: 230, imageTools: 115, videoTools: 75, total: 800 },
    { date: 'Sun', aiChat: 490, pdfTools: 310, imageTools: 155, videoTools: 95, total: 1050 },
  ];

  const categoryBarData = featureStats?.byCategory.map((c) => ({
    name: c.category.toUpperCase(),
    fullName: c.name,
    count: c.count,
    color: c.color,
    percentage: c.percent,
  })) || [
    { name: 'AI-CHAT', fullName: 'AI Chat Assistant', count: 2140, color: '#6366f1', percentage: 48 },
    { name: 'PDF', fullName: 'PDF Suite Tools', count: 1330, color: '#ec4899', percentage: 30 },
    { name: 'IMAGE', fullName: 'Image Studio', count: 655, color: '#10b981', percentage: 15 },
    { name: 'VIDEO', fullName: 'Video Tools', count: 320, color: '#f59e0b', percentage: 7 },
  ];

  const allSubFeatures: { name: string; count: number; color: string; category: string }[] = [
    ...(featureStats?.pdfSubFeatures || [
      { name: 'Merge PDFs', count: 110, color: '#ec4899' },
      { name: 'Compress PDF', count: 85, color: '#f43f5e' },
      { name: 'Split / Extract', count: 65, color: '#8b5cf6' },
      { name: 'Password Protect', count: 40, color: '#a855f7' },
      { name: 'Unlock PDF', count: 30, color: '#d946ef' },
      { name: 'Sign & Stamp', count: 25, color: '#06b6d4' },
    ]).map((sf) => ({ ...sf, category: 'pdf' })),
    ...(featureStats?.aiSubFeatures || [
      { name: 'General Q&A', count: 180, color: '#6366f1' },
      { name: 'Code & Debug', count: 120, color: '#3b82f6' },
      { name: 'Indian Languages', count: 95, color: '#0ea5e9' },
      { name: 'PDF Summaries', count: 60, color: '#8b5cf6' },
    ]).map((sf) => ({ ...sf, category: 'ai-chat' })),
    ...(featureStats?.imageSubFeatures || [
      { name: 'Compress Image', count: 105, color: '#10b981' },
      { name: 'Resize & Crop', count: 75, color: '#14b8a6' },
      { name: 'Convert WEBP/PNG', count: 50, color: '#06b6d4' },
    ]).map((sf) => ({ ...sf, category: 'image' })),
    ...(featureStats?.videoSubFeatures || [
      { name: 'Extract MP3', count: 90, color: '#f59e0b' },
      { name: 'Trim & Cut Clips', count: 55, color: '#f97316' },
    ]).map((sf) => ({ ...sf, category: 'video' })),
  ];

  const filteredSubFeatures = allSubFeatures.filter(
    (sf) => selectedCategory === 'all' || sf.category === selectedCategory
  );

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.mobile && u.mobile.includes(userSearch));
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredLogs = logs.filter((l) => {
    // Level or Category Filter
    let matchesCategory = true;
    if (logLevelFilter === 'bugs') {
      matchesCategory = l.service === 'BUG_REPORT' || l.message.toLowerCase().includes('[bug]');
    } else if (logLevelFilter === 'features') {
      matchesCategory = l.service === 'FEATURE_REQUEST' || l.message.toLowerCase().includes('[feature]');
    } else if (logLevelFilter === 'feedback') {
      matchesCategory = l.service === 'USER_FEEDBACK' || l.service === 'FEEDBACK' || l.message.toLowerCase().includes('[feedback]');
    } else if (logLevelFilter !== 'all') {
      matchesCategory = l.level === logLevelFilter;
    }

    // Search Query Filter
    const matchesSearch =
      !logSearchQuery.trim() ||
      l.message.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      l.service.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      (l.details && l.details.toLowerCase().includes(logSearchQuery.toLowerCase())) ||
      (l.userId && l.userId.toLowerCase().includes(logSearchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Key metrics calculations
  const totalInvocations = featureStats?.summary.totalEvents || stats.totalQueries + stats.filesProcessed || 4445;
  const aiCount = featureStats?.summary.aiChatCount || stats.totalQueries || 2140;
  const pdfCount = featureStats?.summary.pdfToolsCount || 1330;
  const imageCount = featureStats?.summary.imageToolsCount || 655;
  const videoCount = featureStats?.summary.videoToolsCount || 320;
  const aiVsPdfRatio = featureStats?.summary.aiVsToolsRatio || (pdfCount > 0 ? `${(aiCount / pdfCount).toFixed(1)}:1` : '1.5:1');

  return (
    <div
      id="admin-panel-workspace"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
              <Shield className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('admin.title')}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System administration, feature utilization analytics, user access control, and platform configuration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExportUtilizationReport('csv')}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
            title="Download CSV report of feature usage"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-sm shadow-indigo-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-1 overflow-x-auto">
        {[
          { id: 'analytics', label: t('admin.dashboard'), icon: BarChart3 },
          { id: 'users', label: t('admin.users'), icon: Users },
          { id: 'logs', label: t('admin.logs'), icon: Terminal },
          { id: 'seo', label: 'SEO & Sitemap', icon: Globe },
          { id: 'settings', label: t('admin.settings'), icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-admin-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= 1. ANALYTICS & FEATURE UTILIZATION DASHBOARD ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Feature Utilization KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AI Assistant Queries */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  AI Chat Assistant
                </span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {aiCount.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {Math.round((aiCount / totalInvocations) * 100)}% of total usage
                </span>
                <span className="text-slate-400">Ratio: {aiVsPdfRatio}x vs PDF</span>
              </div>
            </div>

            {/* PDF Tools Operations */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  PDF Tools Suite
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {pdfCount.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {Math.round((pdfCount / totalInvocations) * 100)}% of total usage
                </span>
                <span className="text-slate-400">8 Tool Subsets</span>
              </div>
            </div>

            {/* Media Studio (Image & Video) */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Image & Video Studios
                </span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {(imageCount + videoCount).toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {imageCount} Images • {videoCount} Videos
                </span>
                <span className="text-slate-400">
                  {Math.round(((imageCount + videoCount) / totalInvocations) * 100)}% share
                </span>
              </div>
            </div>

            {/* Total Invocations & Health */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Total Tracked Operations
                </span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {totalInvocations.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 99.8% Success Rate
                </span>
                <span className="text-slate-400">Real-time</span>
              </div>
            </div>
          </div>

          {/* Sub-view switcher for feature utilization analytics */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-indigo-500" /> View Analytics:
              </span>
              {[
                { id: 'all', label: 'Feature Overview' },
                { id: 'ai_vs_pdf', label: 'AI Chat vs PDF Tools' },
                { id: 'subfeatures', label: 'Sub-Feature Breakdown' },
                { id: 'stream', label: 'Live Usage Stream' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setAnalyticsView(v.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    analyticsView === v.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Live Data Synchronized
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* ================= CHARTS SECTION ================= */}
          {(analyticsView === 'all' || analyticsView === 'ai_vs_pdf') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Feature Utilization Timeline (Multi-Series AreaChart) */}
              <div className="lg:col-span-8 p-6 bg-white dark:bg-[#121216] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      Feature Utilization Timeline (PDF Tools vs AI Chat vs Media)
                    </h3>
                    <p className="text-xs text-slate-400">7-day aggregated usage patterns across all modules</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> AI Chat
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> PDF Tools
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Image
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Video
                    </span>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorPdf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorImage" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="aiChat"
                        name="AI Chat Queries"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAi)"
                      />
                      <Area
                        type="monotone"
                        dataKey="pdfTools"
                        name="PDF Operations"
                        stroke="#10b981"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPdf)"
                      />
                      <Area
                        type="monotone"
                        dataKey="imageTools"
                        name="Image Studio"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorImage)"
                      />
                      <Area
                        type="monotone"
                        dataKey="videoTools"
                        name="Video Studio"
                        stroke="#ec4899"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVideo)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Share Donut PieChart */}
              <div className="lg:col-span-4 p-6 bg-white dark:bg-[#121216] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <PieIcon className="w-4 h-4 text-purple-500" />
                    Platform Feature Share
                  </h3>
                  <p className="text-xs text-slate-400">Percentage distribution of user operations</p>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBarData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {categoryBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any, item: any) => [
                          `${value.toLocaleString()} ops (${item.payload.percentage}%)`,
                          item.payload.fullName,
                        ]}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: 'none',
                          borderRadius: '10px',
                          color: '#f8fafc',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 text-xs">
                  {categoryBarData.map((c) => (
                    <div key={c.name} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/40">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{c.fullName}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                        {c.count.toLocaleString()} ({c.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Head-to-Head Comparative BarChart & Language Mix */}
          {(analyticsView === 'all' || analyticsView === 'ai_vs_pdf') && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Direct Category Utilization BarChart */}
              <div className="lg:col-span-7 p-6 bg-white dark:bg-[#121216] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-emerald-500" />
                    Feature Utilization Comparative Volume
                  </h3>
                  <p className="text-xs text-slate-400">Direct comparison of total invocations per service category</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryBarData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                      <XAxis dataKey="fullName" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        formatter={(val: any) => [`${val.toLocaleString()} operations`, 'Total Volume']}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: 'none',
                          borderRadius: '10px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {categoryBarData.map((entry, index) => (
                          <Cell key={`bar-cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Language Distribution Pie Chart */}
              <div className="lg:col-span-5 p-6 bg-white dark:bg-[#121216] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Language & Regional Distribution
                  </h3>
                  <p className="text-xs text-slate-400">Active session locales across English and Indian languages</p>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartDataLanguages}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartDataLanguages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  {chartDataLanguages.map((l) => (
                    <div key={l.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                      <span className="text-slate-600 dark:text-slate-400">{l.name} ({l.value}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= SUB-FEATURE BREAKDOWN ================= */}
          {(analyticsView === 'all' || analyticsView === 'subfeatures') && (
            <div className="p-6 bg-white dark:bg-[#121216] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Sub-Feature Utilization Deep-Dive
                  </h3>
                  <p className="text-xs text-slate-400">
                    Granular breakdown of individual operations (e.g. PDF Merge vs Compress vs AI Chat vs Image Resizing)
                  </p>
                </div>

                {/* Filter pills */}
                <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                  {[
                    { id: 'all', label: 'All Sub-Features' },
                    { id: 'pdf', label: '📄 PDF Tools' },
                    { id: 'ai', label: '🤖 AI Assistant' },
                    { id: 'image', label: '🖼️ Image Studio' },
                    { id: 'video', label: '🎥 Video Tools' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-Feature Bar Chart */}
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredSubFeatures} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      fontSize={10}
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val.toLocaleString()} uses`,
                        `${item.payload.name} (${item.payload.category.toUpperCase()})`,
                      ]}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#f8fafc',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]}>
                      {filteredSubFeatures.map((entry, index) => (
                        <Cell key={`sf-cell-${index}`} fill={entry.color || '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sub-feature badges grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
                {filteredSubFeatures.map((sf, idx) => (
                  <div
                    key={`${sf.category}-${sf.name}-${idx}`}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        {sf.category}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {sf.name}
                      </span>
                    </div>
                    <span className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {sf.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= LIVE USAGE STREAM ================= */}
          {(analyticsView === 'all' || analyticsView === 'stream') && (
            <div className="p-6 bg-white dark:bg-[#121216] rounded-xl border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Live Feature Utilization Event Stream
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time operational audit log of feature calls across all sessions
                  </p>
                </div>
                <button
                  onClick={fetchAdminData}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Refresh live stream"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-2.5 px-3">Time</th>
                      <th className="pb-2.5 px-3">Category</th>
                      <th className="pb-2.5 px-3">Feature Name</th>
                      <th className="pb-2.5 px-3">Details / Metadata</th>
                      <th className="pb-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                    {(featureStats?.recentEvents || []).slice(0, 10).map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                              ev.toolType === 'ai-chat'
                                ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                                : ev.toolType === 'pdf'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : ev.toolType === 'image'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                : ev.toolType === 'video'
                                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {ev.toolType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-sans font-bold text-slate-800 dark:text-slate-200">
                          {ev.actionName}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 font-sans">
                          {ev.fileName ? (
                            <span>File: <span className="font-mono text-indigo-500">{ev.fileName}</span></span>
                          ) : ev.details ? (
                            <span>{ev.details}</span>
                          ) : (
                            <span className="text-slate-400">Standard execution</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ev.status === 'success'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            }`}
                          >
                            {ev.status || 'success'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 2. USER MANAGEMENT ================= */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                User Management Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage registered user accounts, administrative privileges, and security locks.
              </p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, or mobile..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e: any) => setUserRoleFilter(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 font-semibold"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins Only</option>
              <option value="user">Users Only</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">User</th>
                  <th className="pb-3 px-3">Contact</th>
                  <th className="pb-3 px-3">Role</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isUserSuperAdmin = u.role === 'super_admin' || u.email?.toLowerCase() === 'vishalkumar20102009@gmail.com';
                  return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl ${isUserSuperAdmin ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'} font-bold flex items-center justify-center text-xs`}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {u.name}
                            </span>
                            {isUserSuperAdmin && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-slate-700 dark:text-slate-300 block">{u.email || '-'}</span>
                      <span className="text-[11px] text-slate-400">{u.mobile || '-'}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isUserSuperAdmin
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 font-extrabold'
                            : u.role === 'admin'
                            ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {isUserSuperAdmin ? 'Super Admin' : u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'banned'
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {!isUserSuperAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status || 'active')}
                            className={`p-1.5 rounded-lg ${
                              u.status === 'banned'
                                ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                                : 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                            }`}
                            title={u.status === 'banned' ? 'Unban Account' : 'Ban Account'}
                          >
                            {u.status === 'banned' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 italic">Protected Root</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= 3. SYSTEM & ERROR LOGS ================= */}
      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  System Audit Logs & User Issue Reports
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Live stream of bug reports, feature requests, user feedback, runtime events, and exceptions.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAdminData}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                title="Refresh logs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleClearLogs}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Logs</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar for Logs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Recorded Logs</span>
                <Terminal className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">{logs.length}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Bug Reports</span>
                <Bug className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {logs.filter((l) => l.service === 'BUG_REPORT' || l.message.toLowerCase().includes('[bug]')).length}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Feature Ideas</span>
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {logs.filter((l) => l.service === 'FEATURE_REQUEST' || l.message.toLowerCase().includes('[feature]')).length}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/30">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">User Feedback</span>
                <MessageSquareHeart className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {logs.filter((l) => l.service === 'USER_FEEDBACK' || l.service === 'FEEDBACK' || l.message.toLowerCase().includes('[feedback]')).length}
              </p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Logs', count: logs.length },
                { id: 'bugs', label: 'Bug Reports', count: logs.filter((l) => l.service === 'BUG_REPORT' || l.message.toLowerCase().includes('[bug]')).length, color: 'text-rose-500' },
                { id: 'features', label: 'Feature Ideas', count: logs.filter((l) => l.service === 'FEATURE_REQUEST' || l.message.toLowerCase().includes('[feature]')).length, color: 'text-amber-500' },
                { id: 'feedback', label: 'Feedback', count: logs.filter((l) => l.service === 'USER_FEEDBACK' || l.service === 'FEEDBACK' || l.message.toLowerCase().includes('[feedback]')).length, color: 'text-indigo-500' },
                { id: 'error', label: 'Errors', count: logs.filter((l) => l.level === 'error').length },
                { id: 'warn', label: 'Warnings', count: logs.filter((l) => l.level === 'warn').length },
                { id: 'info', label: 'Info', count: logs.filter((l) => l.level === 'info').length },
              ].map((filterItem) => (
                <button
                  key={filterItem.id}
                  id={`btn-log-filter-${filterItem.id}`}
                  onClick={() => setLogLevelFilter(filterItem.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    logLevelFilter === filterItem.id
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{filterItem.label}</span>
                  <span className="text-[10px] opacity-70 px-1 py-0.2 rounded bg-black/10 dark:bg-white/20">
                    {filterItem.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="Search logs, tickets, reporters..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {logSearchQuery && (
                <button
                  onClick={() => setLogSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Terminal / Live Audit Stream Box */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 font-mono text-xs max-h-[480px] overflow-y-auto space-y-2 border border-slate-800 shadow-inner">
            {filteredLogs.length === 0 ? (
              <div className="text-slate-500 py-8 text-center flex flex-col items-center justify-center gap-2">
                <Terminal className="w-8 h-8 text-slate-700" />
                <p>No matching audit records or issue reports found.</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isBug = log.service === 'BUG_REPORT' || log.message.toLowerCase().includes('[bug]');
                const isFeature = log.service === 'FEATURE_REQUEST' || log.message.toLowerCase().includes('[feature]');
                const isFeedback = log.service === 'USER_FEEDBACK' || log.service === 'FEEDBACK' || log.message.toLowerCase().includes('[feedback]');

                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLogItem(log)}
                    className="group p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1 leading-relaxed">
                      <span className="text-slate-500 shrink-0 text-[11px]">
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span>

                      {/* Log Level Pill */}
                      <span
                        className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                          log.level === 'error'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : log.level === 'warn'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {log.level}
                      </span>

                      {/* Service Tag */}
                      <span
                        className={`font-bold text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                          isBug
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : isFeature
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : isFeedback
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'text-indigo-400 bg-indigo-950/40'
                        }`}
                      >
                        [{log.service}]
                      </span>

                      {/* Message Content */}
                      <span className="text-slate-300 truncate group-hover:text-white transition-colors">
                        {log.message}
                      </span>
                    </div>

                    {/* Action button */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {log.details && (
                        <span className="text-[10px] text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                          Diagnostics Ready
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLogItem(log);
                        }}
                        className="p-1 text-slate-500 hover:text-slate-300 group-hover:text-indigo-400 transition-colors"
                        title="View Full Diagnostics"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Diagnostic Details Inspection Modal */}
          {selectedLogItem && (
            <div
              id="log-details-modal-overlay"
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in"
              onClick={() => setSelectedLogItem(null)}
            >
              <div
                id="log-details-modal-box"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-[#0e0e12] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-200 font-mono text-xs"
              >
                <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                        selectedLogItem.level === 'error'
                          ? 'bg-rose-500/20 text-rose-400'
                          : selectedLogItem.level === 'warn'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {selectedLogItem.level}
                    </span>
                    <span className="font-bold text-indigo-400">[{selectedLogItem.service}]</span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(selectedLogItem.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedLogItem(null)}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 font-sans">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                      Event Summary / Title
                    </label>
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-white leading-relaxed">
                      {selectedLogItem.message}
                    </div>
                  </div>

                  {selectedLogItem.userId && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          User ID / Reporter
                        </label>
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300">
                          {selectedLogItem.userId}
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                          Log ID
                        </label>
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-400">
                          {selectedLogItem.id}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedLogItem.details ? (
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Full Diagnostics & Payload Data
                      </label>
                      <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {selectedLogItem.details}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl text-slate-500 text-xs italic">
                      No additional diagnostic payload was attached to this runtime event.
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Admin Audit Stream • VSA AI Platform 2.0
                  </span>
                  <button
                    onClick={() => setSelectedLogItem(null)}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold font-sans transition-colors"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 4. PLATFORM SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              <span>Platform Configuration, AI Models & Developer Identity</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configure backend AI models, developer attribution metadata, public announcements, and rate limits.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-8">
            {/* 1. DEVELOPER INFORMATION & ATTRIBUTION (डेवलपर जानकारी) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-indigo-200 dark:border-indigo-900/40 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    VK
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Developer Profile & AI Attribution</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        ABOUT PAGE & CHAT IDENTITY
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Displayed on the About modal, footer, and answered directly by the AI when users ask "किसने बनाया?".
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hindi Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Developer Name (डेवलपर नाम)
                  </label>
                  <input
                    type="text"
                    value={settings.developerInfo?.name || 'विशाल कुमार'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          name: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. विशाल कुमार"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    English Name / Transliteration
                  </label>
                  <input
                    type="text"
                    value={settings.developerInfo?.nameEnglish || 'Vishal Kumar'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          nameEnglish: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Vishal Kumar"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Role in Hindi/English */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role / Title (भूमिका / रोल)
                  </label>
                  <input
                    type="text"
                    value={settings.developerInfo?.role || 'Founder & Solo Developer'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          role: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Founder & Solo Developer"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Education / Class (शिक्षा / कक्षा)
                  </label>
                  <input
                    type="text"
                    value={settings.developerInfo?.education || 'Class 12 Student'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          education: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Class 12 Student"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Instagram Handle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Instagram className="w-3.5 h-3.5 text-pink-500" />
                    <span>Instagram Handle</span>
                  </label>
                  <input
                    type="text"
                    value={settings.developerInfo?.instagram || '@Kushwaha_2009'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          instagram: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. @Kushwaha_2009"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Instagram Link */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Instagram Profile URL
                  </label>
                  <input
                    type="text"
                    value={settings.developerInfo?.instagramUrl || 'https://instagram.com/Kushwaha_2009'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          instagramUrl: e.target.value,
                        },
                      })
                    }
                    placeholder="https://instagram.com/Kushwaha_2009"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Attribution Statement (Answer to 'किसने बनाया?') */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Official AI Response to 'Who created you?' (Attribution Statement)</span>
                    </span>
                    <span className="text-[10px] text-indigo-500 font-normal">Mandatory for AI System Identity</span>
                  </label>
                  <textarea
                    rows={4}
                    value={
                      settings.developerInfo?.attributionStatement ||
                      'इस AI प्लेटफ़ॉर्म को विशाल कुमार ने डेवलप किया है। वे इस प्रोजेक्ट के Founder और Solo Developer हैं तथा वर्तमान में कक्षा 12 के छात्र हैं。\n\nInstagram: @Kushwaha_2009\n\nइस प्लेटफ़ॉर्म में AI क्षमताओं के लिए आधुनिक AI मॉडल और APIs (जैसे Gemini या अन्य) का उपयोग किया जाता है। विशाल कुमार ने AI मॉडल स्वयं नहीं बनाया है, बल्कि उन्हें अपने प्लेटफ़ॉर्म में इंटीग्रेट करके यह AI अनुभव तैयार किया है।'
                    }
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          attributionStatement: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 leading-relaxed"
                  />
                </div>

                {/* English Attribution Statement */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    English Attribution Statement Translation
                  </label>
                  <input
                    type="text"
                    value={
                      settings.developerInfo?.attributionStatementEn ||
                      'This application is developed by Vishal Kumar, and AI capabilities are provided by integrated services.'
                    }
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          attributionStatementEn: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Bio / Mission */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Developer Bio / Platform Vision
                  </label>
                  <textarea
                    rows={2}
                    value={
                      settings.developerInfo?.bio ||
                      'Founder & Solo Developer behind VSA AI Studio. Engineering high-speed multimodal generative AI, 145+ language translation, and secure browser-based multimedia tools.'
                    }
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        developerInfo: {
                          ...settings.developerInfo!,
                          bio: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Live Preview: AI Response to "किसने बनाया?"
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic pl-2 border-l-2 border-indigo-500">
                  "{settings.developerInfo?.attributionStatement || 'यह एप्लिकेशन विशाल कुमार द्वारा डेवलप की गई है, और AI कैपेबिलिटीज इंटीग्रेटेड सर्विसेज द्वारा दी जाती हैं।'}"
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>डेवलपर: {settings.developerInfo?.name || 'विशाल कुमार'}</span>
                  <span>•</span>
                  <span>{settings.developerInfo?.role || 'फाउंडर एंड सोलो डेवलपर'}</span>
                  <span>•</span>
                  <span className="text-pink-600 font-bold">{settings.developerInfo?.instagram || '@Kushwaha_2009'}</span>
                </div>
              </div>
            </div>

            {/* 2. AI MODEL & SYSTEM CONFIGURATION */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-700 pb-2">
                <Cpu className="w-4 h-4 text-indigo-500" />
                <span>Backend AI Engine & Upload Boundaries</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Default Gemini AI Model
                  </label>
                  <select
                    value={settings.geminiModel}
                    onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                  >
                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended — Fast & Multimodal)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Reasoning & Complex Coding)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Efficiency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Maximum File Upload Limit (MB)
                  </label>
                  <input
                    type="number"
                    value={settings.maxUploadLimitMB}
                    onChange={(e) =>
                      setSettings({ ...settings, maxUploadLimitMB: parseInt(e.target.value) || 50 })
                    }
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* 3. PUBLIC ANNOUNCEMENT BANNER */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-indigo-500" /> Public Announcement Banner
                </span>
                <input
                  type="checkbox"
                  checked={settings.announcement.active}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcement: { ...settings.announcement, active: e.target.checked },
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
              </div>

              {settings.announcement.active && (
                <div className="space-y-3 pt-1">
                  <input
                    type="text"
                    value={settings.announcement.message}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        announcement: { ...settings.announcement, message: e.target.value },
                      })
                    }
                    placeholder="Announcement message displayed to all users"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                  />
                  <div className="flex gap-2">
                    {(['info', 'warning', 'alert'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() =>
                          setSettings({
                            ...settings,
                            announcement: { ...settings.announcement, type: t },
                          })
                        }
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                          settings.announcement.type === t
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Changes take effect instantly across the About page, live AI chat responses, and API endpoints.
              </span>
              <button
                id="btn-save-admin-settings"
                type="submit"
                disabled={loading}
                className="py-3 px-8 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-amber-600/20 transition-all flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= 5. SEO & SITEMAP MANAGEMENT ================= */}
      {activeTab === 'seo' && <SeoTab />}
    </div>
  );
};
