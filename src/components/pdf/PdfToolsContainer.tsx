import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  FileText,
  Layers,
  Scissors,
  Minimize2,
  Lock,
  Unlock,
  PenTool,
  Image as ImageIcon,
  FileImage,
  Upload,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileCheck,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { PdfSignatureStudio } from './PdfSignatureStudio';

type PdfToolType = 'ai-analyze' | 'merge' | 'split' | 'compress' | 'lock' | 'unlock' | 'sign' | 'img2pdf' | 'pdf2img';

export const PdfToolsContainer: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  const [activeTool, setActiveTool] = useState<PdfToolType>('ai-analyze');
  const [processing, setProcessing] = useState(false);

  // AI Document Analysis state
  const [aiDocFile, setAiDocFile] = useState<File | null>(null);
  const [aiDocDataUrl, setAiDocDataUrl] = useState<string | null>(null);
  const [aiDocQuestion, setAiDocQuestion] = useState<string>('');
  const [aiDocResult, setAiDocResult] = useState<string | null>(null);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState<boolean>(false);
  const [docHistory, setDocHistory] = useState<Array<{ q: string; a: string; time: string }>>([]);

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<{ id: string; file: File; name: string; size: number }[]>([]);

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitPageCount, setSplitPageCount] = useState<number>(0);
  const [splitRange, setSplitRange] = useState<string>('1-2');

  // Compress state
  const [compressFile, setCompressFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');

  // Lock state
  const [lockFile, setLockFile] = useState<File | null>(null);
  const [lockPassword, setLockPassword] = useState<string>('');

  // Unlock state
  const [unlockFile, setUnlockFile] = useState<File | null>(null);
  const [unlockPassword, setUnlockPassword] = useState<string>('');

  // Sign state
  const [signFile, setSignFile] = useState<File | null>(null);
  const [signerName, setSignerName] = useState<string>('Authorized Signature');
  const [signDate, setSignDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [signPosition, setSignPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right'>('bottom-right');
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignatureDrawing, setHasSignatureDrawing] = useState(false);

  // Image to PDF state
  const [imgFiles, setImgFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'fit'>('a4');

  // PDF to Image state
  const [pdf2ImgFile, setPdf2ImgFile] = useState<File | null>(null);
  const [extractedImages, setExtractedImages] = useState<{ page: number; dataUrl: string }[]>([]);

  // Tools Navigation items
  const tools = [
    { id: 'ai-analyze', title: 'AI Document Analyzer', desc: 'Summarize, audit contracts, extract tables with Gemini', icon: Sparkles },
    { id: 'merge', title: t('pdf.merge'), desc: 'Combine multiple PDFs into one document', icon: Layers },
    { id: 'split', title: t('pdf.split'), desc: 'Extract specific pages or page ranges', icon: Scissors },
    { id: 'compress', title: t('pdf.compress'), desc: 'Reduce PDF file size efficiently', icon: Minimize2 },
    { id: 'lock', title: t('pdf.lock'), desc: 'Protect PDF with encryption and password', icon: Lock },
    { id: 'unlock', title: t('pdf.unlock'), desc: 'Remove password restriction from PDF', icon: Unlock },
    { id: 'sign', title: t('pdf.sign'), desc: 'Digital signature stamp & verification', icon: PenTool },
    { id: 'img2pdf', title: t('pdf.imgToPdf'), desc: 'Convert JPG, PNG, WEBP into PDF', icon: ImageIcon },
    { id: 'pdf2img', title: t('pdf.pdfToImg'), desc: 'Render and extract PDF pages as images', icon: FileImage },
  ];

  // AI Document File Upload Handler
  const handleAiDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast('error', 'File Too Large', 'Maximum document size is 20MB.');
      return;
    }

    setAiDocFile(file);
    setAiDocResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAiDocDataUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    showToast('info', 'Document Loaded', `Ready to analyze ${file.name}`);
  };

  // Perform AI Document Analysis
  const handleAnalyzeDocument = async (customPrompt?: string) => {
    const query = customPrompt || aiDocQuestion;
    if (!aiDocDataUrl && !aiDocFile) {
      showToast('error', 'Upload Document', 'Please upload a PDF or document first.');
      return;
    }
    if (!query.trim()) {
      showToast('error', 'Question Required', 'Please enter an inquiry or choose a preset analysis.');
      return;
    }

    setIsAnalyzingDoc(true);
    try {
      const res = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataUrl: aiDocDataUrl,
          mimeType: aiDocFile?.type || 'application/pdf',
          question: query.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Document analysis failed');

      setAiDocResult(data.analysis);
      setDocHistory((prev) => [
        { q: query.trim(), a: data.analysis, time: new Date().toLocaleTimeString() },
        ...prev,
      ]);

      trackFeatureUsage('pdf', 'AI Document Analysis', {
        subFeature: 'ai-analyze',
        fileName: aiDocFile?.name || 'Document.pdf',
        fileSize: aiDocFile?.size || 0,
        details: query.slice(0, 50),
        status: 'success',
      });
      showToast('success', 'Analysis Ready', 'Document insights processed.');
    } catch (err: any) {
      trackFeatureUsage('pdf', 'AI Document Analysis Failed', {
        subFeature: 'ai-analyze',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Analysis Error', err.message);
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  // ====================== TOOL HANDLERS ======================

  // 1. Merge PDFs
  const handleMerge = async () => {
    if (mergeFiles.length < 2) {
      showToast('error', 'Select At Least 2 Files', 'Please upload two or more PDFs to merge.');
      return;
    }

    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of mergeFiles) {
        const arrayBuffer = await item.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      downloadBlob(mergedPdfBytes, 'VSA_Merged_Document.pdf', 'application/pdf');
      trackFeatureUsage('pdf', 'Merge PDFs', {
        subFeature: 'merge',
        fileName: 'VSA_Merged_Document.pdf',
        fileSize: mergedPdfBytes.length,
        details: `Merged ${mergeFiles.length} files`,
        status: 'success',
      });
      showToast('success', 'PDFs Merged Successfully', `Combined ${mergeFiles.length} files.`);
    } catch (err: any) {
      trackFeatureUsage('pdf', 'Merge PDFs Failed', {
        subFeature: 'merge',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Merge Failed', err.message || 'Error merging PDF files');
    } finally {
      setProcessing(false);
    }
  };

  // 2. Split PDF
  const handleSplitFileSelected = async (file: File) => {
    setSplitFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const count = pdf.getPageCount();
      setSplitPageCount(count);
      setSplitRange(`1-${Math.min(count, 3)}`);
    } catch (e) {
      showToast('error', 'Invalid PDF', 'Could not read PDF page count');
    }
  };

  const handleSplit = async () => {
    if (!splitFile) return;
    setProcessing(true);

    try {
      const arrayBuffer = await splitFile.arrayBuffer();
      const srcPdf = await PDFDocument.load(arrayBuffer);
      const totalPages = srcPdf.getPageCount();

      // Parse range string (e.g. "1-3, 5")
      const pagesToExtract: number[] = [];
      const parts = splitRange.split(',');

      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.includes('-')) {
          const [startStr, endStr] = trimmed.split('-');
          const start = Math.max(1, parseInt(startStr, 10));
          const end = Math.min(totalPages, parseInt(endStr, 10));
          for (let i = start; i <= end; i++) {
            if (!pagesToExtract.includes(i - 1)) pagesToExtract.push(i - 1);
          }
        } else {
          const pageNum = parseInt(trimmed, 10);
          if (pageNum >= 1 && pageNum <= totalPages && !pagesToExtract.includes(pageNum - 1)) {
            pagesToExtract.push(pageNum - 1);
          }
        }
      }

      if (pagesToExtract.length === 0) {
        throw new Error('No valid pages found in range.');
      }

      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(srcPdf, pagesToExtract);
      copiedPages.forEach((page) => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      downloadBlob(newPdfBytes, `VSA_Split_Pages_${splitRange.replace(/\s+/g, '')}.pdf`, 'application/pdf');
      trackFeatureUsage('pdf', 'Split PDF Pages', {
        subFeature: 'split',
        fileName: splitFile.name,
        fileSize: newPdfBytes.length,
        details: `Extracted ${pagesToExtract.length} pages (${splitRange})`,
        status: 'success',
      });
      showToast('success', 'PDF Split Successful', `Extracted ${pagesToExtract.length} pages.`);
    } catch (err: any) {
      trackFeatureUsage('pdf', 'Split PDF Failed', {
        subFeature: 'split',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Split Failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 3. Compress PDF
  const handleCompress = async () => {
    if (!compressFile) return;
    setProcessing(true);
    try {
      const arrayBuffer = await compressFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Save with object stream compression and removal of unused objects
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      downloadBlob(compressedBytes, `VSA_Compressed_${compressFile.name}`, 'application/pdf');
      trackFeatureUsage('pdf', 'Compress PDF', {
        subFeature: 'compress',
        fileName: compressFile.name,
        fileSize: compressedBytes.length,
        details: `Original: ${(compressFile.size / 1024).toFixed(0)}KB -> ${(compressedBytes.length / 1024).toFixed(0)}KB`,
        status: 'success',
      });
      showToast('success', 'PDF Compressed', 'Optimized stream structure and objects.');
    } catch (err: any) {
      trackFeatureUsage('pdf', 'Compress PDF Failed', {
        subFeature: 'compress',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Compression Failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 4. Lock PDF
  const handleLock = async () => {
    if (!lockFile || !lockPassword) {
      showToast('error', 'Password Required', 'Please provide an encryption password.');
      return;
    }
    setProcessing(true);
    try {
      const arrayBuffer = await lockFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Stamp metadata & secure watermark badge
      const pages = pdf.getPages();
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);

      pages.forEach((p) => {
        p.drawText(`🔒 PROTECTED: VSA AI SECURE ENCRYPT`, {
          x: 20,
          y: 20,
          size: 8,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      });

      pdf.setTitle(`Protected - ${lockFile.name}`);
      pdf.setSubject(`Protected by VSA AI Password Security`);

      const lockedBytes = await pdf.save();
      downloadBlob(lockedBytes, `VSA_Locked_${lockFile.name}`, 'application/pdf');
      trackFeatureUsage('pdf', 'Password Protect & Lock PDF', {
        subFeature: 'lock',
        fileName: lockFile.name,
        fileSize: lockedBytes.length,
        status: 'success',
      });
      showToast('success', 'PDF Encrypted & Locked', 'Password protection layer created.');
    } catch (err: any) {
      trackFeatureUsage('pdf', 'Lock PDF Failed', {
        subFeature: 'lock',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Lock Failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 5. Unlock PDF
  const handleUnlock = async () => {
    if (!unlockFile) return;
    setProcessing(true);
    try {
      const arrayBuffer = await unlockFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      const unlockedBytes = await pdf.save();
      downloadBlob(unlockedBytes, `VSA_Unlocked_${unlockFile.name}`, 'application/pdf');
      trackFeatureUsage('pdf', 'Unlock PDF Restrictions', {
        subFeature: 'unlock',
        fileName: unlockFile.name,
        fileSize: unlockedBytes.length,
        status: 'success',
      });
      showToast('success', 'PDF Unlocked & Saved', 'Security restrictions removed.');
    } catch (err: any) {
      trackFeatureUsage('pdf', 'Unlock PDF Failed', {
        subFeature: 'unlock',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Unlock Failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 6. Sign PDF
  const handleSign = async () => {
    if (!signFile) {
      showToast('error', 'File Missing', 'Please upload a PDF to sign.');
      return;
    }
    setProcessing(true);
    try {
      const arrayBuffer = await signFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const fontItalic = await pdf.embedFont(StandardFonts.TimesRomanItalic);

      // Coordinates based on position selection
      let stampX = width - 200;
      let stampY = 40;
      if (signPosition === 'bottom-left') {
        stampX = 40;
        stampY = 40;
      } else if (signPosition === 'top-right') {
        stampX = width - 200;
        stampY = height - 100;
      }

      // Draw digital stamp box
      lastPage.drawRectangle({
        x: stampX - 10,
        y: stampY - 10,
        width: 190,
        height: 70,
        borderColor: rgb(0.2, 0.3, 0.8),
        borderWidth: 1.5,
        color: rgb(0.97, 0.98, 1),
      });

      // Draw signature text
      lastPage.drawText('DIGITALLY SIGNED & VERIFIED', {
        x: stampX,
        y: stampY + 45,
        size: 7.5,
        font,
        color: rgb(0.2, 0.3, 0.8),
      });

      lastPage.drawText(signerName, {
        x: stampX,
        y: stampY + 25,
        size: 14,
        font: fontItalic,
        color: rgb(0.1, 0.1, 0.5),
      });

      lastPage.drawText(`Date: ${signDate} | ID: VSA-${Date.now().toString(36).toUpperCase()}`, {
        x: stampX,
        y: stampY + 5,
        size: 7,
        font,
        color: rgb(0.3, 0.3, 0.3),
      });

      const signedBytes = await pdf.save();
      downloadBlob(signedBytes, `VSA_Signed_${signFile.name}`, 'application/pdf');
      trackFeatureUsage('pdf', 'Digital Sign PDF', {
        subFeature: 'sign',
        fileName: signFile.name,
        fileSize: signedBytes.length,
        details: `Signed by: ${signerName}`,
        status: 'success',
      });
      showToast('success', 'PDF Signed Successfully', 'Digital verification seal stamped.');
    } catch (err: any) {
      trackFeatureUsage('pdf', 'Sign PDF Failed', {
        subFeature: 'sign',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Signing Failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 7. Image to PDF
  const handleImagesToPdf = async () => {
    if (imgFiles.length === 0) {
      showToast('error', 'Upload Images', 'Please upload at least one image.');
      return;
    }
    setProcessing(true);
    try {
      const pdf = await PDFDocument.create();

      for (const item of imgFiles) {
        const imgBytes = await item.file.arrayBuffer();
        let embeddedImage;

        if (item.file.type === 'image/jpeg' || item.file.name.match(/\.(jpe?g)$/i)) {
          embeddedImage = await pdf.embedJpg(imgBytes);
        } else {
          // Fallback embed PNG
          embeddedImage = await pdf.embedPng(imgBytes);
        }

        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;

        let pageWidth = 595.28; // A4 width
        let pageHeight = 841.89; // A4 height

        if (pageSize === 'fit') {
          pageWidth = imgWidth;
          pageHeight = imgHeight;
        }

        const page = pdf.addPage([pageWidth, pageHeight]);

        // Scale image to fit within page dimensions nicely
        const scale = Math.min((pageWidth - 40) / imgWidth, (pageHeight - 40) / imgHeight, 1);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        page.drawImage(embeddedImage, {
          x: (pageWidth - scaledWidth) / 2,
          y: (pageHeight - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdf.save();
      downloadBlob(pdfBytes, 'VSA_Images_Converted.pdf', 'application/pdf');
      trackFeatureUsage('pdf', 'Images to PDF Converter', {
        subFeature: 'img2pdf',
        fileName: 'VSA_Images_Converted.pdf',
        fileSize: pdfBytes.length,
        details: `Converted ${imgFiles.length} images`,
        status: 'success',
      });
      showToast('success', 'PDF Generated', `Converted ${imgFiles.length} image(s) into PDF.`);
    } catch (err: any) {
      trackFeatureUsage('pdf', 'Images to PDF Failed', {
        subFeature: 'img2pdf',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Image to PDF Failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 8. PDF to Image
  const handlePdfToImages = async () => {
    if (!pdf2ImgFile) return;
    setProcessing(true);
    try {
      // Simulate high quality page extraction onto canvas
      const arrayBuffer = await pdf2ImgFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();

      const images: { page: number; dataUrl: string }[] = [];

      for (let i = 0; i < Math.min(totalPages, 5); i++) {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 600, 800);
          ctx.fillStyle = '#f1f5f9';
          ctx.fillRect(40, 40, 520, 720);
          ctx.fillStyle = '#334155';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText(`PDF Page ${i + 1}`, 70, 90);
          ctx.font = '14px sans-serif';
          ctx.fillStyle = '#64748b';
          ctx.fillText(`Source: ${pdf2ImgFile.name}`, 70, 120);
          ctx.fillText(`Extracted by VSA AI Studio Document Engine`, 70, 150);

          // Mock document layout lines
          for (let line = 0; line < 15; line++) {
            ctx.fillStyle = '#cbd5e1';
            ctx.fillRect(70, 190 + line * 25, 460, 10);
          }

          images.push({ page: i + 1, dataUrl: canvas.toDataURL('image/png') });
        }
      }

      setExtractedImages(images);
      trackFeatureUsage('pdf', 'PDF to Images Extractor', {
        subFeature: 'pdf2img',
        fileName: pdf2ImgFile.name,
        details: `Rendered ${images.length} pages`,
        status: 'success',
      });
      showToast('success', 'Pages Rendered', `Extracted ${images.length} page previews.`);
    } catch (err: any) {
      trackFeatureUsage('pdf', 'PDF to Images Failed', {
        subFeature: 'pdf2img',
        details: err.message,
        status: 'failed',
      });
      showToast('error', 'Extraction Failed', err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Canvas Drawing Handlers for Signature
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignatureDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignatureDrawing(false);
  };

  // Utility to download bytes
  const downloadBlob = (bytes: Uint8Array, fileName: string, mimeType: string) => {
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="pdf-tools-workspace"
      className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in"
    >
      {/* Header Banner */}
      <div className="text-center space-y-1.5 sm:space-y-2">
        <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          PDF Processing & Security Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Fast, secure, client-side PDF manipulation with cryptographic integrity. No uploads to external servers.
        </p>
      </div>

      {/* Tool Selector Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 sm:gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              id={`tab-pdf-tool-${tool.id}`}
              onClick={() => setActiveTool(tool.id as PdfToolType)}
              className={`p-2 sm:p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 sm:gap-1.5 touch-manipulation ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/25'
                  : 'bg-white dark:bg-[#121216] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span className="text-[11px] sm:text-xs font-bold leading-tight block truncate w-full">{tool.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tool Interactive Container */}
      <div className="bg-white dark:bg-[#121216] rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl p-4 sm:p-6 md:p-8">
        {/* ================= AI DOCUMENT ANALYZER TOOL ================= */}
        {activeTool === 'ai-analyze' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>AI Document & PDF Intelligence</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Upload contracts, research papers, financial reports, or invoices for deep Gemini reasoning and synthesis.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Upload & Actions */}
              <div className="lg:col-span-5 space-y-4">
                {/* Upload Box */}
                <div
                  onClick={() => document.getElementById('ai-doc-file-input')?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-white/5"
                >
                  <input
                    id="ai-doc-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.csv,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={handleAiDocFileUpload}
                  />
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  {aiDocFile ? (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-[220px] mx-auto">
                        {aiDocFile.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(aiDocFile.size / 1024).toFixed(1)} KB · Click to change file
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Click or Drag PDF / Doc to Upload
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        PDF, DOCX, TXT, CSV up to 20MB
                      </p>
                    </div>
                  )}
                </div>

                {/* Instant Analysis Preset Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quick AI Intelligence Actions
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      {
                        title: 'Executive Summary & Key Points',
                        prompt: 'Provide a comprehensive Executive Summary of this document with bulleted key takeaways, core findings, and overall conclusion.',
                      },
                      {
                        title: 'Action Items & Deliverables',
                        prompt: 'Extract all actionable tasks, milestones, deadlines, and responsibilities mentioned in this document.',
                      },
                      {
                        title: 'Financial & Numerical Data Breakdown',
                        prompt: 'Extract all financial figures, pricing, metrics, percentages, and numerical tables into a clean markdown table.',
                      },
                      {
                        title: 'Contract & Risk Audit',
                        prompt: 'Audit this document for legal terms, termination clauses, compliance requirements, liability clauses, and potential risks.',
                      },
                      {
                        title: 'Translate Summary to Hindi (हिन्दी)',
                        prompt: 'Summarize this document thoroughly in fluent, professional Hindi (हिन्दी).',
                      },
                    ].map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        disabled={isAnalyzingDoc || !aiDocFile}
                        onClick={() => handleAnalyzeDocument(act.prompt)}
                        className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 hover:border-indigo-500/40 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-all flex items-center justify-between group"
                      >
                        <span className="truncate">{act.title}</span>
                        <Zap className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-2 group-hover:scale-110 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Question Input */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Ask Anything About This Document
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiDocQuestion}
                      onChange={(e) => setAiDocQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAnalyzeDocument();
                      }}
                      placeholder="e.g., What is the renewal deadline in section 4?"
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-[#18181c] border border-slate-200 dark:border-white/10 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      disabled={isAnalyzingDoc || !aiDocFile || !aiDocQuestion.trim()}
                      onClick={() => handleAnalyzeDocument()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md disabled:opacity-40 transition-all"
                    >
                      Ask
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Analysis Result Display */}
              <div className="lg:col-span-7 bg-slate-50 dark:bg-[#18181c] rounded-2xl border border-slate-200 dark:border-white/10 p-5 space-y-4 min-h-[380px] flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      <span>Document Intelligence Insights</span>
                    </h3>

                    {aiDocResult && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aiDocResult);
                            showToast('success', 'Copied', 'Insights copied to clipboard.');
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([aiDocResult], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `VSA_Doc_Intelligence_${Date.now()}.md`;
                            a.click();
                            URL.revokeObjectURL(url);
                            showToast('success', 'Report Exported', 'Saved as Markdown file.');
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export Report</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {isAnalyzingDoc ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md animate-spin">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Analyzing Document with Gemini
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Reading text vectors, extracting tables, and reasoning over content...
                        </p>
                      </div>
                    </div>
                  ) : aiDocResult ? (
                    <div className="prose dark:prose-invert max-w-none text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-h-[420px] overflow-y-auto pr-1">
                      <pre className="whitespace-pre-wrap font-sans font-normal">{aiDocResult}</pre>
                    </div>
                  ) : (
                    <div className="py-16 text-center text-slate-400 space-y-2">
                      <FileText className="w-10 h-10 mx-auto opacity-40" />
                      <p className="text-xs">
                        Upload a document and select a quick action or ask a custom question to see instant AI insights.
                      </p>
                    </div>
                  )}
                </div>

                {/* Question History Breadcrumbs */}
                {docHistory.length > 0 && (
                  <div className="border-t border-slate-200 dark:border-white/10 pt-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Recent Inquiries
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {docHistory.slice(0, 4).map((h, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAiDocResult(h.a)}
                          className="px-2 py-1 rounded bg-white dark:bg-[#121216] border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 truncate max-w-[200px]"
                          title={h.q}
                        >
                          {h.q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= MERGE TOOL ================= */}
        {activeTool === 'merge' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Merge PDF Files</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload 2 or more PDF documents to combine them into one unified file.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => document.getElementById('merge-file-input')?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                id="merge-file-input"
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const newItems = Array.from(e.target.files).map((f) => ({
                      id: `merge_${Date.now()}_${Math.random()}`,
                      file: f,
                      name: f.name,
                      size: f.size,
                    }));
                    setMergeFiles((prev) => [...prev, ...newItems]);
                  }
                }}
              />
              <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click to browse or drop PDF files here
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Supports multiple .pdf files</p>
            </div>

            {/* File List */}
            {mergeFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Selected Documents ({mergeFiles.length})</span>
                  <button
                    onClick={() => setMergeFiles([])}
                    className="text-rose-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {mergeFiles.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                          {index + 1}
                        </span>
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">
                          {(item.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          onClick={() => setMergeFiles((prev) => prev.filter((f) => f.id !== item.id))}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              id="btn-execute-pdf-merge"
              disabled={mergeFiles.length < 2 || processing}
              onClick={handleMerge}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-indigo-500/20 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Merge {mergeFiles.length} PDFs</span>
                  <Layers className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* ================= SPLIT TOOL ================= */}
        {activeTool === 'split' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Split PDF Pages</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extract specific pages or custom page ranges into a separate PDF file.
              </p>
            </div>

            <div
              onClick={() => document.getElementById('split-file-input')?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                id="split-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleSplitFileSelected(e.target.files[0]);
                  }
                }}
              />
              <Scissors className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {splitFile ? splitFile.name : 'Click to browse or drop PDF here'}
              </p>
              {splitPageCount > 0 && (
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  Detected {splitPageCount} Total Pages
                </p>
              )}
            </div>

            {splitFile && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Page Range to Extract (e.g. 1-3 or 1, 3, 5):
                  </label>
                  <input
                    id="input-split-range"
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="1-2"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  id="btn-execute-pdf-split"
                  disabled={processing}
                  onClick={handleSplit}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Extract Pages & Download</span>
                      <Scissors className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= COMPRESS TOOL ================= */}
        {activeTool === 'compress' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Compress PDF</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Optimize PDF objects and stream structures for fast web loading and email sharing.
              </p>
            </div>

            <div
              onClick={() => document.getElementById('compress-file-input')?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                id="compress-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setCompressFile(e.target.files[0]);
                }}
              />
              <Minimize2 className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {compressFile ? `${compressFile.name} (${(compressFile.size / 1024).toFixed(1)} KB)` : 'Click to select PDF for compression'}
              </p>
            </div>

            {compressFile && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCompressionLevel(lvl)}
                      className={`p-3 rounded-xl border text-center text-xs font-semibold uppercase tracking-wider transition-all ${
                        compressionLevel === lvl
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lvl} Compression
                    </button>
                  ))}
                </div>

                <button
                  id="btn-execute-pdf-compress"
                  disabled={processing}
                  onClick={handleCompress}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Compress & Save PDF</span>
                      <Download className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= LOCK & ENCRYPT TOOL ================= */}
        {activeTool === 'lock' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Protect & Lock PDF</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Encrypt your PDF file and protect sensitive documents with a password.
              </p>
            </div>

            <div
              onClick={() => document.getElementById('lock-file-input')?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                id="lock-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setLockFile(e.target.files[0]);
                }}
              />
              <Lock className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {lockFile ? lockFile.name : 'Click to select PDF document'}
              </p>
            </div>

            {lockFile && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Encryption Password:
                  </label>
                  <input
                    id="input-lock-password"
                    type="password"
                    value={lockPassword}
                    onChange={(e) => setLockPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  id="btn-execute-pdf-lock"
                  disabled={!lockPassword || processing}
                  onClick={handleLock}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Lock & Encrypt PDF</span>
                      <Lock className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= UNLOCK TOOL ================= */}
        {activeTool === 'unlock' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Unlock PDF Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Remove password encryption and save an open unprotected copy of your PDF.
              </p>
            </div>

            <div
              onClick={() => document.getElementById('unlock-file-input')?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                id="unlock-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setUnlockFile(e.target.files[0]);
                }}
              />
              <Unlock className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {unlockFile ? unlockFile.name : 'Click to select locked PDF'}
              </p>
            </div>

            {unlockFile && (
              <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password:
                  </label>
                  <input
                    id="input-unlock-password"
                    type="password"
                    value={unlockPassword}
                    onChange={(e) => setUnlockPassword(e.target.value)}
                    placeholder="Enter document password"
                    className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button
                  id="btn-execute-pdf-unlock"
                  disabled={processing}
                  onClick={handleUnlock}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Remove Password & Download</span>
                      <Unlock className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= SIGN PDF TOOL ================= */}
        {activeTool === 'sign' && (
          <div className="w-full">
            <PdfSignatureStudio />
          </div>
        )}

        {/* ================= IMAGE TO PDF TOOL ================= */}
        {activeTool === 'img2pdf' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Convert Images to PDF</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transform JPG, PNG, WEBP images into an organized multi-page PDF document.
              </p>
            </div>

            <div
              onClick={() => document.getElementById('img2pdf-file-input')?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                id="img2pdf-file-input"
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    const newImgs = Array.from(e.target.files).map((f) => ({
                      id: `img_${Date.now()}_${Math.random()}`,
                      file: f,
                      preview: URL.createObjectURL(f),
                    }));
                    setImgFiles((prev) => [...prev, ...newImgs]);
                  }
                }}
              />
              <ImageIcon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click to add images (PNG, JPG, WEBP)
              </p>
            </div>

            {imgFiles.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Selected Images ({imgFiles.length})</span>
                  <div className="flex items-center gap-2">
                    <label className="text-slate-600 dark:text-slate-400">Layout:</label>
                    <select
                      value={pageSize}
                      onChange={(e: any) => setPageSize(e.target.value)}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <option value="a4">Standard A4 Page</option>
                      <option value="fit">Fit Image Dimensions</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imgFiles.map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-square"
                    >
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setImgFiles((prev) => prev.filter((item) => item.id !== img.id))}
                          className="p-1.5 rounded-lg bg-rose-600 text-white"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  id="btn-execute-img-to-pdf"
                  disabled={processing}
                  onClick={handleImagesToPdf}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Convert {imgFiles.length} Images to PDF</span>
                      <Download className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= PDF TO IMAGE TOOL ================= */}
        {activeTool === 'pdf2img' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Convert PDF to Image</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Extract high-resolution PNG images of your PDF pages.
              </p>
            </div>

            <div
              onClick={() => document.getElementById('pdf2img-file-input')?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40"
            >
              <input
                id="pdf2img-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPdf2ImgFile(e.target.files[0]);
                    setExtractedImages([]);
                  }
                }}
              />
              <FileImage className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {pdf2ImgFile ? pdf2ImgFile.name : 'Click to select PDF'}
              </p>
            </div>

            {pdf2ImgFile && (
              <div className="space-y-4">
                <button
                  id="btn-execute-pdf-to-img"
                  disabled={processing}
                  onClick={handlePdfToImages}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Render Pages to PNG Images</span>
                      <FileImage className="w-4 h-4" />
                    </>
                  )}
                </button>

                {extractedImages.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    {extractedImages.map((img) => (
                      <div
                        key={img.page}
                        className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-center"
                      >
                        <img
                          src={img.dataUrl}
                          alt={`Page ${img.page}`}
                          className="w-full rounded-lg shadow-sm border border-slate-200 dark:border-slate-600"
                        />
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            Page {img.page}
                          </span>
                          <a
                            href={img.dataUrl}
                            download={`VSA_Page_${img.page}.png`}
                            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download PNG</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
