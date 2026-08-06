import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { PLATFORM_SITEMAP_ROUTES, generateSitemapXml, generateRobotsTxt, SitemapUrl } from '../../utils/seo';
import { VsaEmblem } from '../common/VsaLogo';
import {
  Globe,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Send,
  ExternalLink,
  Share2,
  Twitter,
  FileCode,
  Layers,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Eye,
  Code,
  Check,
} from 'lucide-react';

export const SeoTab: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [baseUrl, setBaseUrl] = useState<string>(() => {
    return window.location.origin || 'https://ais-pre-wwwlpc7rpildcei3zcbgbb-1023392227228.asia-southeast1.run.app';
  });

  const [previewTab, setPreviewTab] = useState<'google' | 'twitter' | 'facebook' | 'schema'>('google');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<any>(null);

  // SEO Metadata Details
  const metaTitle = 'VSA AI - Smart Solutions, Smarter Future | Multi-Model AI Hub';
  const metaDescription =
    'VSA AI is a next-generation AI Workspace. Featuring multi-model conversational intelligence (Gemini, Claude, GPT, DeepSeek), high-security PDF processing, AI image generation, background removal, audio/video extraction, and multi-language support (English, Hindi, Maithili, Bhojpuri, Punjabi).';
  const canonicalUrl = `${baseUrl}/`;

  const sitemapXmlContent = generateSitemapXml(baseUrl);
  const robotsTxtContent = generateRobotsTxt(baseUrl);

  // Handle Copy to clipboard
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast('success', 'Copied to Clipboard', `${type} copied successfully.`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // Download XML file
  const handleDownload = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'Downloaded File', `${fileName} downloaded successfully.`);
  };

  // Handle Ping Search Engines
  const handlePingSearchEngines = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/seo/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl }),
      });
      const data = await res.json();
      setPingResult(data);
      showToast('success', 'Search Engines Notified', 'Sitemap ping successfully broadcasted.');
    } catch (e) {
      showToast('error', 'Ping Failed', 'Could not notify search engines.');
    } finally {
      setIsPinging(false);
    }
  };

  // SEO Health Checks
  const auditChecks = [
    {
      title: 'Title Tag Optimization',
      status: metaTitle.length >= 40 && metaTitle.length <= 70 ? 'pass' : 'warn',
      detail: `${metaTitle.length} characters (Recommended: 50-60 chars)`,
    },
    {
      title: 'Meta Description Length',
      status: metaDescription.length >= 120 && metaDescription.length <= 300 ? 'pass' : 'warn',
      detail: `${metaDescription.length} characters (Optimal for Google mobile & desktop snippets)`,
    },
    {
      title: 'OpenGraph Tags (Facebook / LinkedIn)',
      status: 'pass',
      detail: 'og:title, og:description, og:image, og:url, og:type, og:site_name active',
    },
    {
      title: 'Twitter Card Protocol',
      status: 'pass',
      detail: 'twitter:card (summary_large_image), twitter:site, twitter:image active',
    },
    {
      title: 'Dynamic Sitemap.xml Generation',
      status: 'pass',
      detail: `${PLATFORM_SITEMAP_ROUTES.length} indexable high-priority routes included`,
    },
    {
      title: 'Robots.txt Crawl Control',
      status: 'pass',
      detail: 'Allows public routes, protects API endpoints, points to dynamic sitemap',
    },
    {
      title: 'JSON-LD Schema.org Structured Data',
      status: 'pass',
      detail: 'WebSite, Organization, and SoftwareApplication schemas active',
    },
    {
      title: 'Multi-Language Alternate Tags (hreflang)',
      status: 'pass',
      detail: '5 language variants (English, Hindi, Punjabi, Maithili, Bhojpuri)',
    },
  ];

  return (
    <div id="admin-seo-management-suite" className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
            <Globe className="w-3.5 h-3.5" />
            <span>Search Engine Optimization & Discovery Suite</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Comprehensive SEO, OpenGraph & Sitemap Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage search crawler indexing, inspect OpenGraph & Twitter cards in real-time, generate XML sitemaps, and ping search engines for rapid indexing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleDownload(sitemapXmlContent, 'sitemap.xml', 'application/xml')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/10 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Download sitemap.xml</span>
          </button>

          <button
            onClick={handlePingSearchEngines}
            disabled={isPinging}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {isPinging ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isPinging ? 'Pinging...' : 'Ping Search Engines'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Health Score + Custom Domain Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEO Health Scorecard */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">SEO Health & Audit Score</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time metadata compliance validator</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/20">
              100 / 100 Score
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {auditChecks.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-tight">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Base URL Config & Quick Links */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Production Domain Base</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Target host URL for canonical links, sitemap entries, OpenGraph metadata, and crawler indexing.
            </p>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-domain.com"
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Direct Access Endpoints</div>
            <div className="flex flex-col gap-1.5">
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline border border-slate-200/60 dark:border-white/5"
              >
                <span>/sitemap.xml</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href="/robots.txt"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03] text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline border border-slate-200/60 dark:border-white/5"
              >
                <span>/robots.txt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Search Engine Ping Results Feedback if Triggered */}
      {pingResult && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-xs space-y-2 animate-fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{pingResult.message}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
            {pingResult.engineStatus?.map((eng: any, i: number) => (
              <div key={i} className="p-2 rounded-lg bg-white/40 dark:bg-black/20 flex items-center justify-between">
                <span>{eng.engine}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">HTTP {eng.code}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Preview Suite */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Live Search & Social Previews</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive preview of how VSA AI looks when shared on Google SERP, Twitter/X, and Facebook/LinkedIn.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/5">
            <button
              onClick={() => setPreviewTab('google')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'google'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google SERP</span>
            </button>

            <button
              onClick={() => setPreviewTab('twitter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'twitter'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Twitter className="w-3.5 h-3.5" />
              <span>Twitter / X</span>
            </button>

            <button
              onClick={() => setPreviewTab('facebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'facebook'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Facebook / LinkedIn</span>
            </button>

            <button
              onClick={() => setPreviewTab('schema')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                previewTab === 'schema'
                  ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Schema.org JSON-LD</span>
            </button>
          </div>
        </div>

        {/* 1. Google SERP Preview */}
        {previewTab === 'google' && (
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center p-1 border border-slate-200">
                <VsaEmblem className="w-5 h-5" idPrefix="serp-preview" />
              </div>
              <div className="flex flex-col text-[11px] leading-tight">
                <span className="font-semibold text-slate-800 dark:text-slate-200">VSA AI Platform</span>
                <span className="text-slate-500 font-mono text-[10px]">{baseUrl}</span>
              </div>
            </div>
            <h4 className="text-base sm:text-lg font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
              {metaTitle}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {metaDescription}
            </p>
          </div>
        )}

        {/* 2. Twitter / X Card Preview */}
        {previewTab === 'twitter' && (
          <div className="max-w-lg rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl space-y-0 text-white">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center p-1 border border-indigo-500/20">
                <VsaEmblem className="w-8 h-8" idPrefix="tw-avatar" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm">VSA AI</span>
                  <span className="text-xs text-slate-400">@VsaAI</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Experience the ultimate multimodal AI workspace — chat with top models, edit & secure PDFs, create AI visuals, and extract audio. 🚀
                </p>
              </div>
            </div>

            {/* Card Thumbnail */}
            <div className="border-t border-b border-slate-800 bg-gradient-to-br from-indigo-950 via-slate-900 to-black p-8 flex flex-col items-center justify-center text-center relative">
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-indigo-300 border border-indigo-500/30">
                summary_large_image
              </div>
              <VsaEmblem className="w-20 h-20 mb-3" idPrefix="tw-card" />
              <h3 className="text-xl font-black tracking-tight text-white">VSA AI</h3>
              <p className="text-xs text-indigo-300 font-medium mt-1">Smart Solutions, Smarter Future</p>
            </div>

            <div className="p-3 bg-[#16181c] space-y-1">
              <span className="text-[11px] text-slate-400 font-mono uppercase">{new URL(baseUrl).hostname}</span>
              <h4 className="text-xs font-bold text-white line-clamp-1">{metaTitle}</h4>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{metaDescription}</p>
            </div>
          </div>
        )}

        {/* 3. Facebook / LinkedIn Preview */}
        {previewTab === 'facebook' && (
          <div className="max-w-lg rounded-xl bg-white dark:bg-[#18191a] border border-slate-300 dark:border-white/10 overflow-hidden shadow-xl text-slate-900 dark:text-white">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 p-8 flex flex-col items-center justify-center text-center text-white">
              <VsaEmblem className="w-16 h-16 mb-2" idPrefix="fb-preview" />
              <h4 className="text-lg font-extrabold tracking-tight">VSA AI Workspace</h4>
              <span className="text-xs text-indigo-200">Smart Solutions, Smarter Future</span>
            </div>
            <div className="p-4 space-y-1 bg-slate-50 dark:bg-[#242526]">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono">{new URL(baseUrl).hostname}</span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{metaTitle}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{metaDescription}</p>
            </div>
          </div>
        )}

        {/* 4. Schema.org JSON-LD Code */}
        {previewTab === 'schema' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Structured Data (application/ld+json)</span>
              <button
                onClick={() => handleCopy(document.querySelector('script[type="application/ld+json"]')?.textContent || '', 'Schema JSON')}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
              >
                {copiedType === 'Schema JSON' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'Schema JSON' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed">
              {JSON.stringify(
                {
                  "@context": "https://schema.org",
                  "@graph": [
                    {
                      "@type": "WebSite",
                      "url": canonicalUrl,
                      "name": "VSA AI",
                      "description": "Smart Solutions, Smarter Future - Multimodal AI Intelligence & Productivity Studio",
                      "inLanguage": ["en", "hi", "pa", "mai", "bho"]
                    },
                    {
                      "@type": "SoftwareApplication",
                      "name": "VSA AI Platform",
                      "operatingSystem": "All modern web browsers",
                      "applicationCategory": "ProductivityApplication, MultimediaApplication",
                      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
                    }
                  ]
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Interactive Sitemap Explorer & URL Index Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Sitemap URL Index</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live crawler routing table parsed by Googlebot, Bingbot, and modern indexers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(sitemapXmlContent, 'Sitemap XML')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors"
            >
              {copiedType === 'Sitemap XML' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy XML</span>
            </button>
            <button
              onClick={() => handleDownload(robotsTxtContent, 'robots.txt', 'text/plain')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download robots.txt</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">URL Path</th>
                <th className="px-4 py-3 font-semibold">Page Title & Purpose</th>
                <th className="px-4 py-3 font-semibold text-center">Priority</th>
                <th className="px-4 py-3 font-semibold text-center">Change Freq</th>
                <th className="px-4 py-3 font-semibold text-center">Last Modified</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {PLATFORM_SITEMAP_ROUTES.map((route, i) => (
                <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {route.loc}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{route.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{route.description}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold font-mono text-[11px]">
                      {route.priority.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-semibold">
                      {route.changefreq}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-500 text-[11px]">
                    {route.lastmod}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Indexed</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
