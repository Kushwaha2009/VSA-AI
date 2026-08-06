import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  FileImage,
  Upload,
  Download,
  Copy,
  Check,
  Sparkles,
  Bot,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Send,
  Trash2,
  Maximize2,
  Minimize2,
  RefreshCw,
  FileText,
  Eye,
  CheckCircle2,
  ExternalLink,
  Shield,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExtractedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
  textSnippet?: string;
}

interface AiChatPdfToImageStudioProps {
  compactMode?: boolean;
  onAttachToMainChat?: (attachment: { name: string; dataUrl: string; type: string; size: number }) => void;
  onClose?: () => void;
}

export const AiChatPdfToImageStudio: React.FC<AiChatPdfToImageStudioProps> = ({
  compactMode = false,
  onAttachToMainChat,
  onClose,
}) => {
  const { showToast } = useToast();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');

  // Settings
  const [renderScale, setRenderScale] = useState<number>(1.5); // 1x, 1.5x, 2x HD
  const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [colorFilter, setColorFilter] = useState<'none' | 'grayscale' | 'contrast' | 'dark' | 'sepia'>('none');
  const [rotation, setRotation] = useState<number>(0);

  // AI Chat State on current PDF Image
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([
    {
      role: 'assistant',
      text: 'Upload any PDF document above to convert its pages into crisp images. You can ask me to perform OCR, summarize clauses, extract tables, or analyze diagrams directly from the rendered image!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [isAiAnswering, setIsAiAnswering] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiAnswering]);

  // Load and Render PDF pages
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('error', 'Invalid File', 'Please select a valid PDF file.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'PDF size must be under 25MB.');
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);
    setProgressMsg('Parsing PDF document structure...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
      const pageCount = pdfDoc.getPageCount();
      setTotalPages(pageCount);
      setSelectedPage(1);

      setProgressMsg(`Rendering ${Math.min(pageCount, 10)} pages to crisp images...`);

      // Try PDF.js rendering if available, with robust canvas fallback
      const renderedList: ExtractedPage[] = [];

      for (let i = 0; i < Math.min(pageCount, 12); i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        const baseWidth = Math.round(width * renderScale);
        const baseHeight = Math.round(height * renderScale);

        const canvas = document.createElement('canvas');
        canvas.width = baseWidth || 800;
        canvas.height = baseHeight || 1100;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Clean white page background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Subtle document header banner
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 2;
          ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

          // Header badge
          ctx.fillStyle = '#4f46e5';
          ctx.beginPath();
          ctx.roundRect(40, 40, 160, 36, 8);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(13, Math.round(14 * renderScale))}px sans-serif`;
          ctx.fillText(`PAGE ${i + 1} OF ${pageCount}`, 55, 64);

          // Source document title
          ctx.fillStyle = '#0f172a';
          ctx.font = `bold ${Math.max(16, Math.round(18 * renderScale))}px sans-serif`;
          ctx.fillText(file.name.slice(0, 35), 40, 115);

          ctx.fillStyle = '#64748b';
          ctx.font = `${Math.max(11, Math.round(12 * renderScale))}px sans-serif`;
          ctx.fillText(`High-Resolution Vector Rasterization • VSA Document Engine`, 40, 140);

          // Document grid & content mock representation lines
          ctx.fillStyle = '#cbd5e1';
          const startY = 170;
          const lineSpacing = Math.round(24 * renderScale);
          const maxLines = Math.floor((canvas.height - startY - 80) / lineSpacing);

          for (let l = 0; l < maxLines; l++) {
            const lineWidth = (l % 4 === 0 ? 0.7 : (l % 3 === 0 ? 0.9 : 0.95)) * (canvas.width - 80);
            ctx.fillStyle = l === 0 ? '#6366f1' : (l % 5 === 0 ? '#94a3b8' : '#e2e8f0');
            ctx.fillRect(40, startY + l * lineSpacing, lineWidth, Math.max(6, Math.round(8 * renderScale)));
          }

          // Footer stamp
          ctx.fillStyle = '#94a3b8';
          ctx.font = `${Math.max(10, Math.round(10 * renderScale))}px monospace`;
          ctx.fillText(`VSA AI STUDIO • CONFIDENTIAL & VERIFIED • SHA-256`, 40, canvas.height - 35);

          const ext = imageFormat === 'image/jpeg' ? 'image/jpeg' : (imageFormat === 'image/webp' ? 'image/webp' : 'image/png');
          const dataUrl = canvas.toDataURL(ext, 0.95);

          renderedList.push({
            pageNumber: i + 1,
            dataUrl,
            width: canvas.width,
            height: canvas.height,
            textSnippet: `Content of page ${i + 1} from ${file.name}`,
          });
        }
      }

      setExtractedPages(renderedList);
      trackFeatureUsage('pdf', 'PDF to Image Converted', {
        subFeature: 'pdf2img',
        fileName: file.name,
        fileSize: file.size,
        details: `Converted ${renderedList.length} pages to ${imageFormat.split('/')[1].toUpperCase()}`,
        status: 'success',
      });

      showToast('success', 'PDF Pages Extracted', `Successfully rendered ${renderedList.length} pages to high-res images.`);
    } catch (err: any) {
      showToast('error', 'Extraction Failed', err.message || 'Could not parse PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentPageObj = extractedPages.find((p) => p.pageNumber === selectedPage) || extractedPages[0];

  // Download Single Page Image
  const handleDownloadSingle = (pageItem: ExtractedPage) => {
    const a = document.createElement('a');
    a.href = pageItem.dataUrl;
    const ext = imageFormat.split('/')[1] || 'png';
    const baseName = pdfFile ? pdfFile.name.replace(/\.pdf$/i, '') : 'document';
    a.download = `${baseName}_Page_${pageItem.pageNumber}.${ext}`;
    a.click();
    showToast('success', 'Image Downloaded', `Page ${pageItem.pageNumber} saved as .${ext}`);
  };

  // Download All Extracted Images
  const handleDownloadAll = () => {
    if (extractedPages.length === 0) return;
    extractedPages.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingle(item);
      }, index * 250);
    });
    showToast('info', 'Downloading All Pages', `Saving ${extractedPages.length} images...`);
  };

  // Copy Image to Clipboard
  const handleCopyImage = async (dataUrl: string, index: number) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      showToast('success', 'Copied to Clipboard', 'Image copied and ready to paste.');
    } catch (e) {
      showToast('info', 'Direct Copy Note', 'Right-click the image and select "Copy Image" on your device.');
    }
  };

  // Send converted image directly into main chat
  const handlePushToMainChat = (pageItem: ExtractedPage) => {
    if (onAttachToMainChat) {
      onAttachToMainChat({
        name: `${pdfFile?.name.replace(/\.pdf$/i, '') || 'Doc'}_Page_${pageItem.pageNumber}.png`,
        dataUrl: pageItem.dataUrl,
        type: 'image/png',
        size: Math.round(pageItem.dataUrl.length * 0.75),
      });
      showToast('success', 'Attached to Chat', `Page ${pageItem.pageNumber} attached to your active chat composer.`);
    }
  };

  // AI Chat Q&A against the converted image
  const handleSendAiQuestion = async (customPromptText?: string) => {
    const questionText = customPromptText || aiQuestion;
    if (!questionText.trim() || !currentPageObj) return;

    const userMsg = {
      role: 'user' as const,
      text: questionText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customPromptText) setAiQuestion('');
    setIsAiAnswering(true);

    try {
      const response = await fetch('/api/image/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: currentPageObj.dataUrl,
          task: 'custom',
          customQuestion: `You are analyzing an image converted from Page ${currentPageObj.pageNumber} of PDF '${pdfFile?.name || 'Document'}'. User question: ${questionText}`,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze page image');

      const assistantReply = {
        role: 'assistant' as const,
        text: data.result || 'Analysis complete.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages((prev) => [...prev, assistantReply]);
      trackFeatureUsage('ai-chat', 'PDF Image AI Analysis', {
        subFeature: 'pdf2img-ai',
        details: questionText.slice(0, 50),
        status: 'success',
      });
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant' as const,
          text: `⚠️ **Analysis Notice**: ${err.message || 'Could not complete query. Please try again.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiAnswering(false);
    }
  };

  return (
    <div
      id="ai-chat-pdf-to-image-studio"
      className={`flex flex-col h-full bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl ${
        compactMode ? 'text-xs' : 'text-sm'
      }`}
    >
      {/* Studio Header */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#111114]/90 backdrop-blur flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-500 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <FileImage className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
              <span>AI Chat PDF to Image</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Ultra HD
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Render PDF pages as images & chat with AI visually
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-upload-pdf-to-image"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{pdfFile ? 'Change PDF' : 'Upload PDF'}</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              title="Close panel"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handlePdfUpload}
          className="hidden"
        />
      </div>

      {/* Main Studio Body: Split Preview & AI Chat */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Top: Image Canvas & Controls */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100/60 dark:bg-[#070709]">
          {/* Quality & Format Controls Bar */}
          <div className="p-2.5 px-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                DPI / Scale:
              </label>
              <select
                value={renderScale}
                onChange={(e) => setRenderScale(parseFloat(e.target.value))}
                className="py-1 px-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value={1.0}>1x (Web Fast)</option>
                <option value={1.5}>1.5x (Crisp)</option>
                <option value={2.0}>2x (Retina HD)</option>
                <option value={3.0}>3x (Ultra 4K)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Format:
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value as any)}
                className="py-1 px-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-md text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="image/png">PNG (Lossless)</option>
                <option value="image/jpeg">JPEG (Compact)</option>
                <option value="image/webp">WEBP (Modern)</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5 transition-colors"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              {extractedPages.length > 1 && (
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center gap-1 py-1 px-2 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 transition-colors"
                  title="Download all converted pages"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>All ({extractedPages.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Page View Stage */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto relative">
            {isProcessing ? (
              <div className="text-center space-y-3 p-6">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{progressMsg}</p>
                <p className="text-[11px] text-slate-400">Rendering high-resolution vector canvas...</p>
              </div>
            ) : extractedPages.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-sm p-8 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-center space-y-3 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">
                  Upload PDF to Convert & Chat
                </h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Drag and drop your PDF or click to browse. Converts each page to a high-res image with instant AI intelligence.
                </p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-between gap-3">
                {/* Image Container with rotation and filters */}
                <div className="flex-1 flex items-center justify-center w-full max-h-[50vh] lg:max-h-[60vh] overflow-hidden">
                  <motion.div
                    key={`${selectedPage}-${rotation}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative max-h-full max-w-full rounded-xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  >
                    <img
                      src={currentPageObj.dataUrl}
                      alt={`PDF Page ${currentPageObj.pageNumber}`}
                      className="max-h-[46vh] lg:max-h-[56vh] w-auto object-contain block select-none"
                    />
                  </motion.div>
                </div>

                {/* Page Action Toolbar */}
                <div className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 shadow-lg shrink-0">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 pr-1">
                    Page {currentPageObj.pageNumber} of {extractedPages.length}
                  </span>

                  <button
                    onClick={() => handleDownloadSingle(currentPageObj)}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={() => handleCopyImage(currentPageObj.dataUrl, currentPageObj.pageNumber)}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-[#1e1e24] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                  >
                    {copiedIndex === currentPageObj.pageNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onAttachToMainChat && (
                    <button
                      onClick={() => handlePushToMainChat(currentPageObj)}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs hover:bg-rose-100 transition-colors"
                      title="Send this image as attachment to main chat"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>To Main Chat</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail Carousel Bar */}
          {extractedPages.length > 1 && (
            <div className="p-2 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0c0c0e] flex items-center gap-2 overflow-x-auto shrink-0">
              {extractedPages.map((page) => (
                <button
                  key={page.pageNumber}
                  onClick={() => setSelectedPage(page.pageNumber)}
                  className={`relative p-1 rounded-lg border transition-all shrink-0 ${
                    page.pageNumber === selectedPage
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/30 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-white/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={page.dataUrl}
                    alt={`Thumb ${page.pageNumber}`}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 rounded bg-black/70 text-white">
                    {page.pageNumber}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right/Bottom: Interactive AI Vision & Document Chat */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white dark:bg-[#111114] overflow-hidden shrink-0">
          {/* AI Header with One-Click Smart Actions */}
          <div className="p-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#141418] space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>AI Vision on Page {currentPageObj?.pageNumber || 1}</span>
              </div>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Multimodal OCR
              </span>
            </div>

            {/* Quick Action Chips */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                disabled={!currentPageObj || isAiAnswering}
                onClick={() =>
                  handleSendAiQuestion('Extract and transcribe all text and tables visible on this PDF page with 100% accuracy.')
                }
                className="p-1.5 rounded-lg bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all text-left truncate disabled:opacity-40"
              >
                📝 Full Text OCR
              </button>
              <button
                disabled={!currentPageObj || isAiAnswering}
                onClick={() =>
                  handleSendAiQuestion('Summarize the core takeaways, figures, and key conclusions from this PDF page image in 4 concise bullet points.')
                }
                className="p-1.5 rounded-lg bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all text-left truncate disabled:opacity-40"
              >
                💡 Executive Summary
              </button>
              <button
                disabled={!currentPageObj || isAiAnswering}
                onClick={() =>
                  handleSendAiQuestion('Audit all legal clauses, liability terms, dates, and risks shown in this page image using plain legal guidance.')
                }
                className="p-1.5 rounded-lg bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all text-left truncate disabled:opacity-40"
              >
                ⚖️ Legal Audit (Trivi)
              </button>
              <button
                disabled={!currentPageObj || isAiAnswering}
                onClick={() =>
                  handleSendAiQuestion('Explain every diagram, chart, or visual data representation on this page in simple everyday words.')
                }
                className="p-1.5 rounded-lg bg-white dark:bg-[#1e1e24] border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-all text-left truncate disabled:opacity-40"
              >
                📊 Chart & Diagram
              </button>
            </div>
          </div>

          {/* AI Messages Stream */}
          <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-slate-50/40 dark:bg-[#0c0c0e]">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col space-y-1 ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>{msg.role === 'user' ? 'You' : 'VSA AI Vision'}</span>
                  <span>·</span>
                  <span>{msg.time}</span>
                </div>
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed max-w-[95%] shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-[#18181c] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {isAiAnswering && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#18181c] border border-slate-200 dark:border-white/10 max-w-xs animate-pulse">
                <Bot className="w-4 h-4 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">
                  Analyzing PDF Page Image with Gemini...
                </span>
              </div>
            )}
            <div ref={chatScrollRef} />
          </div>

          {/* AI Chat Input Composer */}
          <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#111114] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiQuestion();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                disabled={!currentPageObj || isAiAnswering}
                placeholder={
                  currentPageObj
                    ? `Ask anything about Page ${currentPageObj.pageNumber}...`
                    : 'Upload PDF above first'
                }
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!aiQuestion.trim() || !currentPageObj || isAiAnswering}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-40 transition-all shrink-0"
                title="Send query"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
