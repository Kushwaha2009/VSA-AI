import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { trackFeatureUsage } from '../../services/usageTracker';
import {
  Upload,
  Download,
  PenTool,
  Type,
  Image as ImageIcon,
  Stamp,
  Trash2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Move,
  Maximize2,
  Calendar,
  User,
  ShieldCheck,
  Layers,
  Copy,
  FileCheck,
  RefreshCw,
} from 'lucide-react';
import { motion } from 'motion/react';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export interface PlacedItem {
  id: string;
  type: 'signature' | 'initial' | 'text' | 'date' | 'stamp';
  dataUrl: string;
  pageNumber: number;
  x: number; // percentage of page width (0 to 100)
  y: number; // percentage of page height (0 to 100)
  width: number; // percentage of page width
  height: number; // percentage of page height
  label?: string;
}

export const PdfSignatureStudio: React.FC = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();

  // PDF File & Document State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDocProxy, setPdfDocProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.2);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sign Mode & Creation State
  const [signTab, setSignTab] = useState<'draw' | 'type' | 'upload' | 'stamp'>('draw');
  const [inkColor, setInkColor] = useState<string>('#0f172a');
  const [penSize, setPenSize] = useState<number>(3);
  const [typedName, setTypedName] = useState<string>('Alex Morgan');
  const [typedFont, setTypedFont] = useState<string>('Dancing Script, cursive');
  const [stampText, setStampText] = useState<string>('APPROVED');
  const [signerDate, setSignerDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [signerTitle, setSignerTitle] = useState<string>('Authorized Signatory');

  // Drawing Canvas Ref
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnStroke, setHasDrawnStroke] = useState<boolean>(false);

  // Placed Items on PDF
  const [placedItems, setPlacedItems] = useState<PlacedItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Page Render Canvas & Container Ref
  const pageCanvasRef = useRef<HTMLCanvasElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [pageSizePx, setPageSizePx] = useState<{ width: number; height: number }>({ width: 600, height: 800 });

  // Saved Signatures in localStorage
  const [savedSignatures, setSavedSignatures] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vsa_saved_signatures');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSignatureToLibrary = (dataUrl: string) => {
    setSavedSignatures((prev) => {
      const updated = [dataUrl, ...prev.filter((item) => item !== dataUrl).slice(0, 4)];
      localStorage.setItem('vsa_saved_signatures', JSON.stringify(updated));
      return updated;
    });
  };

  // Render PDF Page when PDF or currentPage or zoomScale changes
  const renderPdfPage = useCallback(
    async (doc: pdfjsLib.PDFDocumentProxy, pageNum: number, scale: number) => {
      if (!pageCanvasRef.current) return;
      try {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = pageCanvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Use standard device pixel ratio for crisp text
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        setPageSizePx({ width: viewport.width, height: viewport.height });

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: transform,
        };

        await page.render(renderContext as any).promise;
      } catch (err: any) {
        console.error('Error rendering PDF page:', err);
      }
    },
    []
  );

  // Load PDF document on file selection
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      showToast('error', 'Invalid File', 'Please upload a valid PDF document.');
      return;
    }

    setIsLoadingPdf(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const doc = await loadingTask.promise;

      setPdfFile(file);
      setPdfDocProxy(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setPlacedItems([]);

      await renderPdfPage(doc, 1, zoomScale);
      showToast('success', 'PDF Loaded', `Opened "${file.name}" (${doc.numPages} pages). Ready to sign!`);
    } catch (err: any) {
      showToast('error', 'Load Error', `Failed to open PDF: ${err.message}`);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Re-render when page or zoom changes
  useEffect(() => {
    if (pdfDocProxy) {
      renderPdfPage(pdfDocProxy, currentPage, zoomScale);
    }
  }, [pdfDocProxy, currentPage, zoomScale, renderPdfPage]);

  // ================= SIGNATURE CREATION HELPERS =================

  // Drawing Pad Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = penSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawnStroke(true);
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnStroke(false);
  };

  // Convert Typed Name to Calligraphic Signature Data URL
  const generateTypedSignatureDataUrl = (text: string, font: string, color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `italic 42px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 200, 80);

    return canvas.toDataURL('image/png');
  };

  // Generate Stamp / Badge Data URL
  const generateStampDataUrl = (text: string, subText: string, color: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 140;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 300, 120);

    // Inner dashed border
    ctx.setLineDash([6, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(16, 16, 288, 108);
    ctx.setLineDash([]);

    // Stamp text
    ctx.fillStyle = color;
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), 160, 55);

    // Subtext
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(subText, 160, 95);

    return canvas.toDataURL('image/png');
  };

  // Upload scanned signature and make background transparent
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Make white / light paper pixels transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Light pixels
          if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0; // Alpha 0
          }
        }
        ctx.putImageData(imgData, 0, 0);
        const transparentDataUrl = canvas.toDataURL('image/png');
        insertItemToPage(transparentDataUrl, 'signature', 28, 12, 'Scanned Signature');
        saveSignatureToLibrary(transparentDataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // ================= INSERT ITEM TO PDF PAGE =================
  const insertItemToPage = (
    dataUrl: string,
    type: 'signature' | 'initial' | 'text' | 'date' | 'stamp',
    widthPct: number = 25,
    heightPct: number = 10,
    label?: string
  ) => {
    if (!pdfDocProxy) {
      showToast('error', 'Upload PDF First', 'Please upload a PDF document before inserting a signature.');
      return;
    }

    const newItem: PlacedItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type,
      dataUrl,
      pageNumber: currentPage,
      x: 35, // default centered-ish
      y: 65, // default lower half
      width: widthPct,
      height: heightPct,
      label: label || type,
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    showToast('success', 'Signature Added to Page', 'Drag it anywhere on the page to position it.');
  };

  // Apply Hand-Drawn Signature
  const handleApplyDrawnSignature = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas || !hasDrawnStroke) {
      showToast('error', 'Signature Empty', 'Please draw your signature on the pad before adding.');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    saveSignatureToLibrary(dataUrl);
    insertItemToPage(dataUrl, 'signature', 28, 12, 'Drawn Signature');
  };

  // Apply Typed Signature
  const handleApplyTypedSignature = () => {
    if (!typedName.trim()) {
      showToast('error', 'Name Required', 'Please enter your name.');
      return;
    }
    const dataUrl = generateTypedSignatureDataUrl(typedName.trim(), typedFont, inkColor);
    saveSignatureToLibrary(dataUrl);
    insertItemToPage(dataUrl, 'signature', 30, 12, `Signed by ${typedName}`);
  };

  // Apply Stamp
  const handleApplyStamp = () => {
    const dataUrl = generateStampDataUrl(stampText, `DATE: ${signerDate} • ${signerTitle}`, inkColor);
    insertItemToPage(dataUrl, 'stamp', 32, 14, `${stampText} Stamp`);
  };

  // Apply Date Stamp
  const handleApplyDate = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillStyle = inkColor;
    ctx.textBaseline = 'middle';
    ctx.fillText(`Date: ${signerDate}`, 10, 30);
    const dataUrl = canvas.toDataURL('image/png');
    insertItemToPage(dataUrl, 'date', 20, 6, 'Date Stamp');
  };

  // ================= DRAG & RESIZE INTERACTIVE LOGIC =================
  const handleItemMouseDown = (e: React.MouseEvent | React.TouchEvent, item: PlacedItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setDraggingItemId(item.id);

    if (pageContainerRef.current) {
      const containerRect = pageContainerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const itemPixelX = (item.x / 100) * containerRect.width;
      const itemPixelY = (item.y / 100) * containerRect.height;
      setDragOffset({
        x: clientX - containerRect.left - itemPixelX,
        y: clientY - containerRect.top - itemPixelY,
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent | React.TouchEvent, item: PlacedItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setResizingItemId(item.id);
  };

  const handleContainerMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!pageContainerRef.current) return;
    const containerRect = pageContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (draggingItemId) {
      const posX = clientX - containerRect.left - dragOffset.x;
      const posY = clientY - containerRect.top - dragOffset.y;

      let newXPct = (posX / containerRect.width) * 100;
      let newYPct = (posY / containerRect.height) * 100;

      // Bound to container
      newXPct = Math.max(0, Math.min(90, newXPct));
      newYPct = Math.max(0, Math.min(90, newYPct));

      setPlacedItems((prev) =>
        prev.map((item) => (item.id === draggingItemId ? { ...item, x: newXPct, y: newYPct } : item))
      );
    } else if (resizingItemId) {
      const currentItem = placedItems.find((i) => i.id === resizingItemId);
      if (!currentItem) return;

      const itemLeftPx = (currentItem.x / 100) * containerRect.width;
      const itemTopPx = (currentItem.y / 100) * containerRect.height;
      const mouseX = clientX - containerRect.left;
      const mouseY = clientY - containerRect.top;

      const newWidthPx = Math.max(40, mouseX - itemLeftPx);
      const newHeightPx = Math.max(20, mouseY - itemTopPx);

      const newWidthPct = Math.min(80, (newWidthPx / containerRect.width) * 100);
      const newHeightPct = Math.min(60, (newHeightPx / containerRect.height) * 100);

      setPlacedItems((prev) =>
        prev.map((item) =>
          item.id === resizingItemId ? { ...item, width: newWidthPct, height: newHeightPct } : item
        )
      );
    }
  };

  const handleContainerMouseUp = () => {
    setDraggingItemId(null);
    setResizingItemId(null);
  };

  const handlePageClick = (e: React.MouseEvent) => {
    if (draggingItemId || resizingItemId) return;
    if (!pageContainerRef.current) return;
    
    // If a signature is currently selected, clicking moves it to that exact spot
    if (selectedItemId) {
      const containerRect = pageContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;
      
      const currentItem = placedItems.find((i) => i.id === selectedItemId);
      if (currentItem) {
        const itemWidthPx = (currentItem.width / 100) * containerRect.width;
        const itemHeightPx = (currentItem.height / 100) * containerRect.height;
        
        let newXPct = ((clickX - itemWidthPx / 2) / containerRect.width) * 100;
        let newYPct = ((clickY - itemHeightPx / 2) / containerRect.height) * 100;
        
        newXPct = Math.max(0, Math.min(90, newXPct));
        newYPct = Math.max(0, Math.min(90, newYPct));
        
        setPlacedItems((prev) =>
          prev.map((item) => (item.id === selectedItemId ? { ...item, x: newXPct, y: newYPct } : item))
        );
      }
    }
  };

  const removeItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPlacedItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
    showToast('info', 'Item Removed', 'Signature removed from document.');
  };

  const duplicateItemToAllPages = (item: PlacedItem) => {
    const newItems: PlacedItem[] = [];
    for (let p = 1; p <= totalPages; p++) {
      if (p !== item.pageNumber) {
        newItems.push({
          ...item,
          id: `item_${Date.now()}_p${p}`,
          pageNumber: p,
        });
      }
    }
    setPlacedItems((prev) => [...prev, ...newItems]);
    showToast('success', 'Applied to All Pages', `Signature placed across all ${totalPages} pages.`);
  };

  // ================= EMBED & EXPORT SIGNED PDF =================
  const handleExportSignedPdf = async () => {
    if (!pdfFile || placedItems.length === 0) {
      showToast('error', 'No Signatures', 'Please place at least one signature on the document before exporting.');
      return;
    }

    setIsExporting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      // Group items by page
      for (const item of placedItems) {
        const pageIndex = item.pageNumber - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { width: pdfPageWidth, height: pdfPageHeight } = page.getSize();

        // Convert base64 dataUrl to bytes
        const base64Data = item.dataUrl.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
        const embeddedImage = await pdfDoc.embedPng(imageBytes);

        // Convert percentage coordinates to PDF coordinates
        // PDF coordinate system origin is at the BOTTOM-LEFT
        const imgPdfWidth = (item.width / 100) * pdfPageWidth;
        const imgPdfHeight = (item.height / 100) * pdfPageHeight;
        const imgPdfX = (item.x / 100) * pdfPageWidth;
        const imgPdfY = pdfPageHeight - (item.y / 100) * pdfPageHeight - imgPdfHeight;

        page.drawImage(embeddedImage, {
          x: imgPdfX,
          y: imgPdfY,
          width: imgPdfWidth,
          height: imgPdfHeight,
        });
      }

      // Save signed PDF
      const signedPdfBytes = await pdfDoc.save();
      const signedBlob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const signedUrl = URL.createObjectURL(signedBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = signedUrl;
      const rawName = pdfFile.name.replace(/\.pdf$/i, '');
      downloadLink.download = `${rawName}_Signed.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(signedUrl);

      trackFeatureUsage('pdf', 'Visual Sign PDF Completed', {
        subFeature: 'sign-interactive',
        fileName: `${rawName}_Signed.pdf`,
        fileSize: signedPdfBytes.length,
        details: `Embedded ${placedItems.length} signature elements across ${totalPages} pages`,
        status: 'success',
      });

      showToast('success', 'PDF Signed Successfully!', 'Your digitally signed document is ready.');
    } catch (err: any) {
      showToast('error', 'Signing Failed', err.message || 'Error generating signed PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const inkColors = [
    { label: 'Executive Black', color: '#0f172a' },
    { label: 'Navy Blue', color: '#1e3a8a' },
    { label: 'Royal Blue', color: '#2563eb' },
    { label: 'Emerald Green', color: '#047857' },
    { label: 'Crimson Red', color: '#b91c1c' },
  ];

  const fontOptions = [
    { label: 'Calligraphy Script', font: 'Dancing Script, cursive' },
    { label: 'Executive Hand', font: 'Caveat, cursive' },
    { label: 'Classic Signature', font: 'Great Vibes, cursive' },
    { label: 'Modern Cursive', font: 'Pacifico, cursive' },
  ];

  const activePageItems = placedItems.filter((i) => i.pageNumber === currentPage);

  return (
    <div id="pdf-signature-studio" className="w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Visual PDF Signer & Document Studio
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                Freeform Placement
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Open any PDF, draw or type your written signature, and drag to insert anywhere.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {pdfDocProxy && (
            <button
              id="export-signed-pdf-btn"
              onClick={handleExportSignedPdf}
              disabled={isExporting || placedItems.length === 0}
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-lg ${
                placedItems.length > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Embedding Signatures...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download Signed PDF ({placedItems.length})
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Area */}
      {!pdfDocProxy ? (
        /* Empty State / Upload Prompt */
        <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Upload a PDF Document to Sign</h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            Open your contract, agreement, form, or invoice. You can create your written signature, type in calligraphy, and place it freely on any page.
          </p>

          <label
            htmlFor="pdf-signer-upload-input"
            className="cursor-pointer px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-2 transition shadow-lg shadow-indigo-600/25"
          >
            <Upload className="w-4 h-4" />
            Select PDF Document
            <input
              id="pdf-signer-upload-input"
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handlePdfUpload}
            />
          </label>
        </div>
      ) : (
        /* Active PDF Signing Studio */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Panel: Signature Creation Studio (4 cols) */}
          <div className="lg:col-span-4 p-4 sm:p-5 bg-slate-950/50 flex flex-col gap-5 overflow-y-auto max-h-[85vh]">
            {/* File details banner */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium text-slate-300 truncate">{pdfFile?.name}</span>
              </div>
              <label
                htmlFor="change-pdf-input"
                className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer font-medium underline shrink-0"
              >
                Change
                <input
                  id="change-pdf-input"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={handlePdfUpload}
                />
              </label>
            </div>

            {/* Signature Method Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                id="sign-tab-draw"
                onClick={() => setSignTab('draw')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  signTab === 'draw' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Draw
              </button>
              <button
                id="sign-tab-type"
                onClick={() => setSignTab('type')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  signTab === 'type' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                Type
              </button>
              <button
                id="sign-tab-upload"
                onClick={() => setSignTab('upload')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  signTab === 'upload' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Upload
              </button>
              <button
                id="sign-tab-stamp"
                onClick={() => setSignTab('stamp')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  signTab === 'stamp' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Stamp className="w-3.5 h-3.5" />
                Stamp
              </button>
            </div>

            {/* Ink Color Selector */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Ink Color Palette</label>
              <div className="flex items-center gap-2">
                {inkColors.map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setInkColor(c.color)}
                    className={`w-7 h-7 rounded-full transition flex items-center justify-center border ${
                      inkColor === c.color ? 'border-white ring-2 ring-indigo-500 scale-110' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  >
                    {inkColor === c.color && <CheckCircle2 className="w-3.5 h-3.5 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: DRAW SIGNATURE */}
            {signTab === 'draw' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">Write Signature Below</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Thickness:</span>
                    <button
                      onClick={() => setPenSize(1.5)}
                      className={`text-xs px-2 py-0.5 rounded ${penSize === 1.5 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                    >
                      Fine
                    </button>
                    <button
                      onClick={() => setPenSize(3)}
                      className={`text-xs px-2 py-0.5 rounded ${penSize === 3 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                    >
                      Medium
                    </button>
                    <button
                      onClick={() => setPenSize(5)}
                      className={`text-xs px-2 py-0.5 rounded ${penSize === 5 ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
                    >
                      Bold
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-36 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
                  <canvas
                    ref={drawCanvasRef}
                    width={380}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={drawMove}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={drawMove}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair touch-none w-full h-full"
                  />
                  {!hasDrawnStroke && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-500 text-xs gap-1">
                      <PenTool className="w-5 h-5 opacity-40" />
                      <span>Draw with mouse or finger</span>
                      <div className="w-3/4 border-b border-dashed border-slate-700 mt-2" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={clearDrawing}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Pad
                  </button>
                  <button
                    id="insert-drawn-sig-btn"
                    onClick={handleApplyDrawnSignature}
                    disabled={!hasDrawnStroke}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow ${
                      hasDrawnStroke
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Place on Page {currentPage}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: TYPE SIGNATURE */}
            {signTab === 'type' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Full Name or Initials</label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Handwriting Font Style</label>
                  <select
                    value={typedFont}
                    onChange={(e) => setTypedFont(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.font} value={f.font}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Preview Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center min-h-[90px]">
                  <span style={{ fontFamily: typedFont, color: inkColor, fontSize: '32px' }}>
                    {typedName || 'Your Signature'}
                  </span>
                </div>

                <button
                  id="insert-typed-sig-btn"
                  onClick={handleApplyTypedSignature}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow shadow-indigo-600/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Place Typed Signature on Page {currentPage}
                </button>
              </div>
            )}

            {/* TAB 3: UPLOAD SIGNATURE */}
            {signTab === 'upload' && (
              <div className="flex flex-col gap-3">
                <label className="text-xs font-medium text-slate-400">Upload Signature Scan / Image</label>
                <label className="cursor-pointer p-6 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/60 flex flex-col items-center justify-center text-center transition">
                  <ImageIcon className="w-8 h-8 text-indigo-400 mb-2" />
                  <span className="text-xs font-semibold text-white">Select Signature Image</span>
                  <span className="text-[11px] text-slate-500 mt-1">Auto-removes white background paper</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleSignatureUpload}
                  />
                </label>
              </div>
            )}

            {/* TAB 4: STAMP & DATE */}
            {signTab === 'stamp' && (
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Stamp Text</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {['APPROVED', 'SIGNED', 'VERIFIED', 'CONFIDENTIAL'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStampText(st)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition border ${
                          stampText === st
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={stampText}
                    onChange={(e) => setStampText(e.target.value)}
                    placeholder="Custom Stamp Text"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Sign Date</label>
                    <input
                      type="date"
                      value={signerDate}
                      onChange={(e) => setSignerDate(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Signer Role</label>
                    <input
                      type="text"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      placeholder="Title"
                      className="w-full px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleApplyStamp}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    Place Stamp
                  </button>
                  <button
                    onClick={handleApplyDate}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Place Date
                  </button>
                </div>
              </div>
            )}

            {/* Quick Signature Library */}
            {savedSignatures.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <label className="text-xs font-medium text-slate-400 mb-2 block">Quick Signature Library</label>
                <div className="grid grid-cols-2 gap-2">
                  {savedSignatures.map((sigUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => insertItemToPage(sigUrl, 'signature', 28, 12, `Saved Signature #${idx + 1}`)}
                      className="group cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 flex items-center justify-center h-16 relative overflow-hidden transition"
                    >
                      <img src={sigUrl} alt="Saved Sig" className="max-h-full max-w-full object-contain filter invert" />
                      <div className="absolute inset-0 bg-indigo-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition">
                        Insert
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of placed items on this page */}
            {activePageItems.length > 0 && (
              <div className="border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Signatures on Page {currentPage} ({activePageItems.length})
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  {activePageItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${
                        selectedItemId === item.id
                          ? 'bg-indigo-950/40 border-indigo-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <PenTool className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate">{item.label || item.type}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {totalPages > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateItemToAllPages(item);
                            }}
                            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                            title="Duplicate to all pages"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={(e) => removeItem(item.id, e)}
                          className="p-1 hover:bg-rose-500/20 rounded text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive Visual PDF Canvas & Drag Stage (8 cols) */}
          <div className="lg:col-span-8 p-4 sm:p-6 bg-slate-950/90 flex flex-col items-center">
            {/* Viewport Toolbar */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-xl mb-4 shadow">
              {/* Page Navigator */}
              <div className="flex items-center gap-2">
                <button
                  id="pdf-prev-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  id="pdf-next-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomScale((z) => Math.max(0.7, z - 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-slate-400">{Math.round(zoomScale * 100)}%</span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.0, z + 0.2))}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale(1.0)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Reset
                </button>
              </div>

              {/* Summary Indicator */}
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{placedItems.length} Total Signatures Placed</span>
              </div>
            </div>

            {/* PDF Canvas Viewport Container */}
            <div
              className="relative overflow-auto max-w-full max-h-[75vh] p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex justify-center"
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              onTouchMove={handleContainerMouseMove}
              onTouchEnd={handleContainerMouseUp}
            >
              <div
                ref={pageContainerRef}
                onClick={handlePageClick}
                className="relative bg-white shadow-2xl rounded-sm select-none cursor-crosshair"
                style={{
                  width: `${pageSizePx.width}px`,
                  height: `${pageSizePx.height}px`,
                }}
              >
                {/* Rendered PDF Canvas */}
                <canvas ref={pageCanvasRef} className="block w-full h-full pointer-events-none" />

                {/* Overlaid Interactive Signatures on Current Page */}
                {activePageItems.map((item) => {
                  const isSelected = selectedItemId === item.id;
                  return (
                    <div
                      key={item.id}
                      onMouseDown={(e) => handleItemMouseDown(e, item)}
                      onTouchStart={(e) => handleItemMouseDown(e, item)}
                      className={`absolute cursor-move group transition-shadow ${
                        isSelected
                          ? 'ring-2 ring-indigo-500 shadow-xl bg-indigo-500/10'
                          : 'hover:ring-1 hover:ring-indigo-400/60'
                      }`}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        width: `${item.width}%`,
                        height: `${item.height}%`,
                      }}
                    >
                      {/* Signature Image */}
                      <img
                        src={item.dataUrl}
                        alt="Signature Overlay"
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                      />

                      {/* Controls visible when selected */}
                      {isSelected && (
                        <>
                          {/* Label badge */}
                          <div className="absolute -top-6 left-0 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 whitespace-nowrap pointer-events-none">
                            <Move className="w-2.5 h-2.5" />
                            {item.label || 'Signature'}
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={(e) => removeItem(item.id, e)}
                            className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow hover:bg-rose-500 z-10"
                            title="Delete Signature"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          {/* Resize Handle */}
                          <div
                            onMouseDown={(e) => handleResizeMouseDown(e, item)}
                            onTouchStart={(e) => handleResizeMouseDown(e, item)}
                            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-indigo-600 border border-white rounded-full cursor-se-resize flex items-center justify-center shadow z-10"
                            title="Drag to Resize"
                          >
                            <Maximize2 className="w-2 h-2 text-white transform rotate-90" />
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instruction Tip */}
            <p className="text-xs text-slate-500 mt-3 text-center">
              💡 Tip: Click and drag any signature to position it. Use the bottom-right handle to resize. When finished, click "Download Signed PDF".
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
