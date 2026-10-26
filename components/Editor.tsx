'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from './LanguageContext';
import { markdownToHtml, SAMPLE_MARKDOWN_PRESETS } from '@/lib/markdown-to-html';
import { renderLatexHtml } from '@/lib/latex-to-omml';
import { importDocxFile, htmlToMarkdown } from '@/lib/docx-import';
import { WordRibbon, WordFormattingOptions, ViewMode } from './WordRibbon';
import { WordRuler } from './WordRuler';
import { DocumentStatsModal } from './DocumentStatsModal';
import { FindReplaceModal } from './FindReplaceModal';
import { InsertImageModal } from './InsertImageModal';
import { InsertLinkModal } from './InsertLinkModal';
import { SymbolPaletteModal } from './SymbolPaletteModal';
import { WatermarkModal } from './WatermarkModal';
import type { EigenDocxEditorHandle } from './EigenDocxEditor';
import { downloadDocxBuffer } from '@/lib/docx-export';
import { bufferToBase64, base64ToBuffer } from '@/lib/utils';
import { saveUserDocument } from '@/lib/firebase';
import { useSession, deductCredit } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import confetti from 'canvas-confetti';
import {
  FileText,
  Eye,
  FileCode2,
  Split,
  Table as TableIcon,
  Sigma,
  Code,
  Upload,
  Check,
  Sparkles,
  ArrowRight,
  Layers,
  ZoomIn,
  ZoomOut,
  Save,
  FileDown,
  Printer,
  Share2,
  Loader2,
  AlertCircle,
  Clock,
  Undo2,
  Redo2,
  ExternalLink,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// CRITICAL: Load the DOCX editor strictly on the client.
// @docx-editor.dev/core reads DOM APIs and uses top-level await, so it MUST
// never be evaluated during SSR / static prerendering. `ssr: false` keeps the
// whole module (and its dependency graph) out of the server bundle.
// ---------------------------------------------------------------------------
const EigenDocxEditor = dynamic(
  () => import('./EigenDocxEditor').then(mod => mod.EigenDocxEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center min-h-[720px] bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <span className="text-xs font-semibold text-slate-500">
          Loading Word Engine...
        </span>
      </div>
    ),
  }
) as typeof import('./EigenDocxEditor').EigenDocxEditor;

export interface EditorHandle {
  exportDocument: () => Promise<void>;
}

interface EditorProps {
  markdown: string;
  onChangeMarkdown: (markdown: string) => void;
  documentTitle: string;
  onChangeTitle: (title: string) => void;
  onOpenInsertModal: () => void;
  onExportDocx?: () => void;
  onExportPdf?: () => void;
  onCopyGoogleDocs?: () => void;
  onSaveDoc?: () => void;
  onClearDoc?: () => void;
  isExporting?: boolean;
  currentDocId?: string;
  docxBase64?: string;
}

export const Editor = forwardRef<EditorHandle, EditorProps>((props, ref) => {
  const {
    markdown,
    onChangeMarkdown,
    documentTitle,
    onChangeTitle,
    onOpenInsertModal,
    onExportDocx = () => {},
    onExportPdf = () => {},
    onCopyGoogleDocs = () => {},
    onSaveDoc = () => {},
    onClearDoc = () => {},
    isExporting = false,
    currentDocId,
    docxBase64,
  } = props;
  const { direction, t } = useLanguage();
  const session = useSession();
  const [isDark] = useTheme();

  // Word Editor Formatting & Layout Settings
  const [formatting, setFormatting] = useState<WordFormattingOptions>({
    fontFamily: 'Segoe UI',
    fontSize: 11,
    orientation: 'portrait',
    paperSize: 'a4',
    margins: 'normal',
    lineSpacing: '1.15',
    watermark: '',
    showRuler: true,
    zoomLevel: 100,
  });

  // Default viewMode is genuine 'docx' EigenPal editor engine!
  const [viewMode, setViewMode] = useState<ViewMode>('docx');
  const [history, setHistory] = useState<string[]>([markdown]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // EigenPal DOCX Engine references and bytes
  const eigenEditorRef = useRef<EigenDocxEditorHandle>(null);
  
  useImperativeHandle(ref, () => ({
    exportDocument: handleDownloadRealDocx,
  }));



  const lastPackedMarkdownRef = useRef<string>(markdown);
  const [docxBytes, setDocxBytes] = useState<Uint8Array | null>(null);
  const [isInitializingDocx, setIsInitializingDocx] = useState(false);

  // Save status states
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'error'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Drag & drop status for .docx files
  const [isDraggingDocx, setIsDraggingDocx] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Modals state
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showSymbolModal, setShowSymbolModal] = useState(false);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);

  // Math, Table, Code dialogs
  const [showMathDialog, setShowMathDialog] = useState(false);
  const [mathInput, setMathInput] = useState('\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRowsCount, setTableRowsCount] = useState(3);
  const [tableColsCount, setTableColsCount] = useState(3);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [codeLang, setCodeLang] = useState('python');
  const [codeSnippet, setCodeSnippet] = useState('def calculate_result():\n    return 42');

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const splitTextareaRef = useRef<HTMLTextAreaElement>(null);
  const paperEditableRef = useRef<HTMLDivElement>(null);
  const savedSelectionRange = useRef<Range | null>(null);
  const isTypingDirectlyRef = useRef(false);
  const isSyncingRef = useRef(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize DOCX bytes on mount or when docxBase64 / markdown changes
  useEffect(() => {
    let active = true;

    async function initBytes() {
      // Priority 1: If markdown prop changed or docxBytes is not yet initialized for non-empty markdown, re-pack it.
      if (markdown !== lastPackedMarkdownRef.current || (!docxBytes && markdown)) {
        try {
          setIsInitializingDocx(true);
          const bytes = await markdownToDocxBytes(markdown);
          if (active) {
            setDocxBytes(bytes);
            if (eigenEditorRef.current) {
              eigenEditorRef.current.loadDocument(bytes);
            }
            lastPackedMarkdownRef.current = markdown;
          }
        } catch (e) {
          console.warn('Failed to pack markdown to docx:', e);
        } finally {
          if (active) setIsInitializingDocx(false);
        }
        return;
      }

      // Priority 2: Initial load from docxBase64 prop
      if (docxBase64 && !docxBytes) {
        try {
          const buf = base64ToBuffer(docxBase64);
          if (active) {
            setDocxBytes(buf);
            if (eigenEditorRef.current) {
              eigenEditorRef.current.loadDocument(buf);
            }
            lastPackedMarkdownRef.current = markdown;
          }
          return;
        } catch (e) {
          console.warn('Failed to parse docxBase64:', e);
        }
      }
    }

    initBytes();

    return () => {
      active = false;
    };
  }, [docxBase64, markdown, docxBytes]);

  // Sync internal history with markdown prop if it changes externally
  useEffect(() => {
    if (markdown !== history[historyIndex]) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), markdown]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [markdown, history, historyIndex]);

  // Unsaved changes warning before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Perform save (autosave or manual)
  const performSave = useCallback(
    async (isManual = false) => {
      setSaveStatus('saving');
      try {
        let base64String: string | undefined = undefined;

        if (eigenEditorRef.current) {
          const buffer = await eigenEditorRef.current.saveDocument();
          if (buffer) {
            base64String = bufferToBase64(buffer);
          }
        }

        const html = markdownToHtml(markdown);
        await saveUserDocument({
          id: currentDocId,
          title: documentTitle,
          markdown,
          html,
          docxBase64: base64String,
          userId: session.id,
        });

        setIsDirty(false);
        setSaveStatus('saved');
        const now = new Date();
        setLastSavedTime(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );

        if (isManual) {
          try {
            confetti({
              particleCount: 30,
              spread: 45,
              origin: { y: 0.8 },
            });
          } catch {}
        }
      } catch (err) {
        console.error('Save failed:', err);
        setSaveStatus('error');
      }
    },
    [currentDocId, documentTitle, markdown, session.id]
  );

  // Debounced autosave
  const scheduleAutosave = useCallback(() => {
    setIsDirty(true);
    setSaveStatus('dirty');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      performSave(false);
    }, 2500);
  }, [performSave]);

  const handleDocxChange = useCallback(() => {
    scheduleAutosave();
  }, [scheduleAutosave]);

  const handleManualSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    performSave(true);
  }, [performSave]);

  const handleSaveDoc = handleManualSave;
  const handleClearDoc = onClearDoc;

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  // Download real DOCX binary file from EigenPal editor
  const handleDownloadRealDocx = useCallback(async () => {
    if (session.credits <= 0) {
      onExportDocx();
      return;
    }

    try {
      if (eigenEditorRef.current) {
        const buffer = await eigenEditorRef.current.saveDocument();
        if (buffer) {
          const filename = `${documentTitle.replace(/[^a-zA-Z0-9_\-\u0600-\u06FF]/g, '_')}.docx`;
          downloadDocxBuffer(buffer, filename);
          deductCredit();
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
            });
          } catch {}
          return;
        }
      }
      onExportDocx();
    } catch (e) {
      console.warn('Real DOCX buffer save failed, falling back to generator:', e);
      onExportDocx();
    }
  }, [documentTitle, onExportDocx, session.credits]);


  // Export PDF via genuine print pipeline
  const handlePrintDocx = async () => {
    if (session.credits <= 0) {
      onExportPdf();
      return;
    }

    deductCredit();
    if (eigenEditorRef.current) {
      try {
        await eigenEditorRef.current.printDocument();
        return;
      } catch {}
    }
    window.print();
  };

  // Share document
  const handleShareDocument = () => {
    if (typeof window !== 'undefined') {
      try {
        navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      } catch {}
    }
  };

  // Save selection range on mouseup/keyup in browser
  const saveSelection = useCallback(() => {
    if (typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedSelectionRange.current = sel.getRangeAt(0).cloneRange();
      }
    }
  }, []);

  // Restore selection range
  const restoreSelection = useCallback(() => {
    if (typeof window !== 'undefined' && savedSelectionRange.current) {
      const sel = window.getSelection();
      if (sel) {
        try {
          sel.removeAllRanges();
          sel.addRange(savedSelectionRange.current);
        } catch {}
      }
    }
  }, []);

  // Update markdown with history
  const updateMarkdownWithHistory = useCallback((newMd: string) => {
    onChangeMarkdown(newMd);
    setHistory(prev => {
      const next = prev.slice(0, historyIndex + 1);
      next.push(newMd);
      return next;
    });
    setHistoryIndex(prev => prev + 1);
    scheduleAutosave();
  }, [historyIndex, onChangeMarkdown, scheduleAutosave]);

  // Undo / Redo handlers
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      const prevMd = history[newIdx];
      onChangeMarkdown(prevMd);
      if (paperEditableRef.current) {
        paperEditableRef.current.innerHTML = markdownToHtml(prevMd);
      }
      scheduleAutosave();
    }
  }, [history, historyIndex, onChangeMarkdown, scheduleAutosave]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      const nextMd = history[newIdx];
      onChangeMarkdown(nextMd);
      if (paperEditableRef.current) {
        paperEditableRef.current.innerHTML = markdownToHtml(nextMd);
      }
      scheduleAutosave();
    }
  }, [history, historyIndex, onChangeMarkdown, scheduleAutosave]);

  // Keep paper content in sync with markdown when not actively typing or syncing
  useEffect(() => {
    if (!isSyncingRef.current && !isTypingDirectlyRef.current && paperEditableRef.current) {
      const rendered = markdownToHtml(markdown);
      if (paperEditableRef.current.innerHTML !== rendered) {
        paperEditableRef.current.innerHTML = rendered;
      }
    }
    isSyncingRef.current = false;
  }, [markdown]);

  // Sync paper DOM back into markdown
  const syncPaperToMarkdown = useCallback(() => {
    if (paperEditableRef.current) {
      const html = paperEditableRef.current.innerHTML;
      const md = htmlToMarkdown(html);
      if (md && md.trim() !== markdown.trim()) {
        isSyncingRef.current = true;
        updateMarkdownWithHistory(md);
      }
    }
  }, [markdown, updateMarkdownWithHistory]);

  const handlePaperInput = (e: React.FormEvent<HTMLDivElement>) => {
    isTypingDirectlyRef.current = true;
    saveSelection();
    const html = e.currentTarget.innerHTML;
    const md = htmlToMarkdown(html);
    if (md) {
      onChangeMarkdown(md);
      scheduleAutosave();
    }
  };

  const handlePaperBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    isTypingDirectlyRef.current = false;
    syncPaperToMarkdown();
  };

  // Central Tool Command Execution Handler
  const handleExecCommand = useCallback((
    command: string,
    value?: string,
    mdBefore?: string,
    mdAfter?: string
  ) => {
    const activeTextarea =
      viewMode === 'source'
        ? textareaRef.current
        : viewMode === 'split'
        ? splitTextareaRef.current
        : null;

    if (
      activeTextarea &&
      (document.activeElement === activeTextarea ||
        activeTextarea.selectionStart !== activeTextarea.selectionEnd)
    ) {
      const start = activeTextarea.selectionStart;
      const end = activeTextarea.selectionEnd;
      const selected = markdown.substring(start, end);
      const before =
        mdBefore !== undefined
          ? mdBefore
          : command === 'bold'
          ? '**'
          : command === 'italic'
          ? '*'
          : command === 'underline'
          ? '<u>'
          : '';
      const after =
        mdAfter !== undefined
          ? mdAfter
          : command === 'underline'
          ? '</u>'
          : before;
      const replacement = `${before}${selected || 'Formatted Text'}${after}`;
      const updated = markdown.substring(0, start) + replacement + markdown.substring(end);
      updateMarkdownWithHistory(updated);
      setTimeout(() => {
        activeTextarea.focus();
        activeTextarea.setSelectionRange(start + before.length, end + before.length);
      }, 50);
      return;
    }

    if (paperEditableRef.current) {
      paperEditableRef.current.focus();
    }
    restoreSelection();

    if (command && typeof document !== 'undefined') {
      try {
        const handledInPaper = document.execCommand(command, false, value);
        if (handledInPaper && paperEditableRef.current) {
          syncPaperToMarkdown();
          saveSelection();
          return;
        }
      } catch {}
    }

    const before =
      mdBefore !== undefined
        ? mdBefore
        : command === 'bold'
        ? '**'
        : command === 'italic'
        ? '*'
        : command === 'underline'
        ? '<u>'
        : '';
    const after =
      mdAfter !== undefined
        ? mdAfter
        : command === 'underline'
        ? '</u>'
        : before;

    updateMarkdownWithHistory(`${markdown}\n\n${before}Formatted Text${after}`);
  }, [
    markdown,
    restoreSelection,
    saveSelection,
    syncPaperToMarkdown,
    updateMarkdownWithHistory,
    viewMode,
  ]);

  const updateFormatting = (opts: Partial<WordFormattingOptions>) => {
    setFormatting(prev => ({ ...prev, ...opts }));
  };

  const handleInsertTable = () => {
    let mdTable = '\n\n|';
    for (let c = 1; c <= tableColsCount; c++) mdTable += ` Column ${c} |`;
    mdTable += '\n|';
    for (let c = 1; c <= tableColsCount; c++) mdTable += ' :--- |';
    for (let r = 1; r <= tableRowsCount; r++) {
      mdTable += '\n|';
      for (let c = 1; c <= tableColsCount; c++) mdTable += ` Data ${r}-${c} |`;
    }
    mdTable += '\n\n';
    updateMarkdownWithHistory(markdown + mdTable);
    setShowTableDialog(false);
  };

  const handleInsertMath = () => {
    if (mathInput.trim()) {
      const mdMath = `\n\n$$\n${mathInput.trim()}\n$$\n\n`;
      updateMarkdownWithHistory(markdown + mdMath);
      setShowMathDialog(false);
    }
  };

  const handleInsertCode = () => {
    const mdCode = `\n\n\`\`\`${codeLang}\n${codeSnippet}\n\`\`\`\n\n`;
    updateMarkdownWithHistory(markdown + mdCode);
    setShowCodeDialog(false);
  };

  const handleInsertTableOfContents = () => {
    const lines = markdown.split('\n');
    const headings: { level: number; text: string }[] = [];
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim().replace(/[*_`[\]()]/g, '');
        headings.push({ level, text });
      }
    }

    if (headings.length === 0) {
      alert(
        direction === 'rtl'
          ? 'لم يتم العثور على عناوين (#) في المستند لتوليد جدول المحتويات.'
          : 'No headings (#) found in the document to generate Table of Contents.'
      );
      return;
    }

    let tocMd = '\n\n## Table of Contents\n\n';
    for (const h of headings) {
      const indent = '  '.repeat(Math.max(0, h.level - 1));
      const slug = h.text
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      tocMd += `${indent}- [${h.text}](#${slug})\n`;
    }
    tocMd += '\n---\n\n';

    updateMarkdownWithHistory(markdown + tocMd);
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}
  };

  // DOCX Import File Handler (validated and fed directly into EigenPal engine)
  const handleImportDocx = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setImportNotification('Invalid file type: Please select a valid Microsoft Word (.docx) file.');
      setTimeout(() => setImportNotification(null), 4000);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setImportNotification('File too large: .docx files must be under 25MB.');
      setTimeout(() => setImportNotification(null), 4000);
      return;
    }

    try {
      setImportNotification('Loading DOCX file into Word Editor...');
      const buffer = await file.arrayBuffer();

      // Load binary directly into EigenPal DOCX Engine!
      if (eigenEditorRef.current) {
        eigenEditorRef.current.loadDocument(buffer);
      }
      setDocxBytes(new Uint8Array(buffer));

      // Also parse markdown summary for search and stats
      try {
        const result = await importDocxFile(file);
        updateMarkdownWithHistory(result.markdown);
        onChangeTitle(result.title);
      } catch {
        const cleanName = file.name.replace(/\.docx$/i, '');
        onChangeTitle(cleanName);
      }

      setImportNotification(`Successfully imported: "${file.name}" with full fidelity!`);
      setTimeout(() => setImportNotification(null), 4000);
      scheduleAutosave();
    } catch (err) {
      console.error('Failed to import DOCX:', err);
      setImportNotification('Failed to parse .docx file. Please check file format.');
      setTimeout(() => setImportNotification(null), 4000);
    }
  };

  // Drag and drop events for .docx files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocx(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocx(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingDocx(false);
    const files = Array.from(e.dataTransfer.files);
    const docxFile = files.find(f => f.name.toLowerCase().endsWith('.docx'));
    if (docxFile) {
      await handleImportDocx(docxFile);
    }
  };

  const handleLoadTemplate = async (key: string) => {
    const preset =
      SAMPLE_MARKDOWN_PRESETS.find(p => p.id === key) ||
      (key === 'saudi_vat' ? SAMPLE_MARKDOWN_PRESETS[1] : SAMPLE_MARKDOWN_PRESETS[0]);

    if (!preset) {
      // Guard against an empty SAMPLE_MARKDOWN_PRESETS array so we never
      // dereference `preset.markdown` on `undefined`.
      setImportNotification(
        direction === 'rtl'
          ? 'لا توجد قوالب جاهزة متاحة حالياً.'
          : 'No sample templates are currently available.'
      );
      setTimeout(() => setImportNotification(null), 4000);
      return;
    }

    updateMarkdownWithHistory(preset.markdown);
    onChangeTitle(direction === 'rtl' ? preset.titleAr : preset.titleEn);
    try {
      const bytes = await markdownToDocxBytes(preset.markdown);
      setDocxBytes(bytes);
      if (eigenEditorRef.current) {
        eigenEditorRef.current.loadDocument(bytes);
      }
    } catch {}
    scheduleAutosave();
  };

  // Word & Page Metrics
  const words = useMemo(() => {
    return markdown.trim().split(/\s+/).filter(Boolean).length;
  }, [markdown]);

  const chars = useMemo(() => markdown.length, [markdown]);
  const lines = useMemo(() => linesCount(markdown), [markdown]);
  const estimatedPages = useMemo(() => Math.max(1, Math.ceil(words / 320)), [words]);

  const paperOrientationWidth =
    formatting.orientation === 'landscape'
      ? 'max-w-[1050px] min-h-[600px]'
      : 'max-w-[850px] min-h-[920px]';

  const paperMarginClasses =
    formatting.margins === 'narrow'
      ? 'p-6 sm:p-8'
      : formatting.margins === 'wide'
      ? 'p-12 sm:p-16'
      : 'p-8 sm:p-12';

  const fontFamilyStyle: React.CSSProperties = {
    fontFamily:
      formatting.fontFamily === 'Cairo'
        ? 'Cairo, Segoe UI, sans-serif'
        : formatting.fontFamily === 'Amiri'
        ? 'Amiri, Traditional Arabic, serif'
        : formatting.fontFamily === 'Traditional Arabic'
        ? 'Traditional Arabic, Amiri, serif'
        : formatting.fontFamily,
    fontSize: `${formatting.fontSize}pt`,
    lineHeight: formatting.lineSpacing,
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex flex-col items-center w-full min-h-screen py-4 sm:py-6 px-2 sm:px-4 md:px-6 transition-colors"
    >
      {/* Hidden DOCX File Input for Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleImportDocx(file);
        }}
        className="hidden"
      />

      {/* Drag & Drop Overlay */}
      {isDraggingDocx && (
        <div className="fixed inset-0 z-50 bg-indigo-600/20 backdrop-blur-xs flex flex-col items-center justify-center p-6 border-4 border-dashed border-indigo-500 rounded-3xl m-4 pointer-events-none animate-fadeIn">
          <Upload className="h-16 w-16 text-indigo-600 mb-3 animate-bounce" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-1">
            Drop .docx file to import into Word Editor
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Midadd will immediately load headings, tables, equations, and genuine DOCX formatting!
          </p>
        </div>
      )}

      {/* Import Notification Banner */}
      {importNotification && (
        <div className="no-print w-full max-w-6xl mb-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-slideDown">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{importNotification}</span>
          </div>
          <button
            onClick={() => setImportNotification(null)}
            className="text-xs hover:underline text-indigo-600 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Microsoft Word-Like Editor Container */}
      <div className="w-full max-w-6xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col transition-colors">
        {/* Professional Word-Style Top Navigation & Document Header */}
        <div className="no-print px-3 sm:px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
          {/* Left: Brand + Document Title + Save Status */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Return to Dashboard / Home */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-100 transition text-xs font-bold shrink-0"
              title="Return to Home / Dashboard"
            >
              <span className="text-sm">✒️</span>
              <span className="hidden sm:inline">مداد | midadd</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* Quick Undo / Redo */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition cursor-pointer"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition cursor-pointer"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

            {/* Editable Document Title */}
            <div className="relative flex-1 min-w-[150px] max-w-md flex items-center">
              <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400 absolute left-2 rtl:left-auto rtl:right-2 pointer-events-none shrink-0" />
              <input
                type="text"
                value={documentTitle}
                onChange={e => {
                  onChangeTitle(e.target.value);
                  setIsDirty(true);
                  scheduleAutosave();
                }}
                placeholder="Document Title"
                className="w-full pl-8 pr-2 rtl:pl-2 rtl:pr-8 py-1 rounded-md text-xs sm:text-sm font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition"
              />
            </div>

            {/* Live Save Status Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold shrink-0">
              {saveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  <span className="hidden sm:inline">Saved {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
                  <span className="sm:hidden">Saved</span>
                </span>
              )}
              {saveStatus === 'dirty' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50/80 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping" />
                  <span>Unsaved</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <button
                  type="button"
                  onClick={handleManualSave}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 cursor-pointer"
                >
                  <AlertCircle className="h-3 w-3" />
                  <span>Save failed (Retry)</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions (Empty) */}
          <div className="flex items-center gap-1.5 shrink-0">
          </div>
        </div>

        {/* Word Ribbon Toolbar */}
        <WordRibbon
          formatting={formatting}
          onChangeFormatting={updateFormatting}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          onWrapSelection={(before, after) => handleExecCommand('', undefined, before, after)}
          onApplyBlockStyle={prefix => handleExecCommand('formatBlock', prefix, prefix, '')}
          onExecCommand={handleExecCommand}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onOpenInsertModal={onOpenInsertModal}
          onOpenTableDialog={() => setShowTableDialog(true)}
          onOpenMathDialog={() => setShowMathDialog(true)}
          onOpenCodeDialog={() => setShowCodeDialog(true)}
          onOpenImageModal={() => setShowImageModal(true)}
          onOpenLinkModal={() => setShowLinkModal(true)}
          onOpenSymbolModal={() => setShowSymbolModal(true)}
          onOpenStatsModal={() => setShowStatsModal(true)}
          onOpenFindReplaceModal={() => setShowFindReplaceModal(true)}
          onOpenWatermarkModal={() => setShowWatermarkModal(true)}
          onImportDocx={handleImportDocx}
          onExportDocx={onExportDocx}
          onExportPdf={onExportPdf}
          onCopyGoogleDocs={onCopyGoogleDocs}
          onSaveDoc={handleSaveDoc}
          onClearDoc={handleClearDoc}
          onLoadTemplate={handleLoadTemplate}
          onInsertTableOfContents={handleInsertTableOfContents}
          isExporting={isExporting}
        />

        {/* Visual Ruler (Word-style) */}
        {formatting.showRuler && (viewMode === 'print' || viewMode === 'web') && (
          <div className="pt-2 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <WordRuler margins={formatting.margins} orientation={formatting.orientation} />
          </div>
        )}

        {/* Editor Canvas Area */}
        <div className="w-full bg-slate-100/90 dark:bg-slate-950 p-2 sm:p-4 md:p-6 flex justify-center overflow-x-auto min-h-[500px] sm:min-h-[750px] lg:min-h-[850px]">
          {/* ===================== VIEW: EIGENPAL DOCX EDITOR (WORD ENGINE) ===================== */}
          {viewMode === 'docx' && (
            <div className="w-full max-w-[1150px] h-full flex flex-col items-center">
              <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[720px]">
                <EigenDocxEditor
                  ref={eigenEditorRef}
                  initialBytes={docxBytes}
                  documentTitle={documentTitle}
                  isDark={isDark}
                  onChange={handleDocxChange}
                  onReady={() => {
                    setIsDirty(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* ===================== VIEW: PRINT LAYOUT (PAGINATED A4) ===================== */}
          {viewMode === 'print' && (
            <div className="flex flex-col items-center gap-6 w-full max-w-[1100px]">
              {markdown.trim() ? (
                <div
                  className={`relative paper-canvas print-area w-full ${paperOrientationWidth} ${paperMarginClasses} rounded-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xl transition-all`}
                  style={fontFamilyStyle}
                >
                  {/* Page Header (Word Header) */}
                  <div className="pb-3 mb-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
                    <span className="truncate max-w-[300px] font-semibold">{documentTitle}</span>
                    <span>
                      {formatting.paperSize.toUpperCase()} •{' '}
                      {formatting.orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                    </span>
                  </div>

                  {/* Watermark Display */}
                  {formatting.watermark && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
                      <span className="text-6xl sm:text-7xl font-black text-slate-200/50 dark:text-slate-800/40 uppercase tracking-widest rotate-[-35deg]">
                        {formatting.watermark}
                      </span>
                    </div>
                  )}

                  {/* Unified Interactive & Editable Paper Content */}
                  <div
                    ref={paperEditableRef}
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    onInput={handlePaperInput}
                    onBlur={handlePaperBlur}
                    onMouseUp={saveSelection}
                    onKeyUp={saveSelection}
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
                    className="relative z-10 prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 focus:outline-none min-h-[350px] sm:min-h-[600px] lg:min-h-[750px]"
                  />

                  {/* Page Footer (Word Footer) */}
                  <div className="pt-4 mt-12 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 select-none">
                    <span>Midadd Word Document</span>
                    <span className="font-semibold">
                      Page 1 of {estimatedPages}
                    </span>
                  </div>
                </div>
              ) : (
                /* Empty state prompt */
                <div
                  onClick={onOpenInsertModal}
                  className="paper-canvas w-full max-w-[850px] min-h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl cursor-pointer hover:border-indigo-400 group transition p-8 text-center bg-white dark:bg-slate-900 shadow-lg"
                >
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <FileText className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Empty Document
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mb-4">
                    Paste AI Markdown (Ctrl+K), type directly, or drop any .docx file here to import.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-4 py-2 rounded-xl bg-red-600 group-hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20">
                      {t.insertButton} (Ctrl+K)
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleLoadTemplate('quantum');
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold cursor-pointer"
                    >
                      Load Sample Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== VIEW: WEB LAYOUT (CONTINUOUS) ===================== */}
          {viewMode === 'web' && (
            <div
              className={`paper-canvas print-area w-full ${paperOrientationWidth} ${paperMarginClasses} rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-xl transition-all`}
              style={fontFamilyStyle}
            >
              {markdown.trim() ? (
                <div
                  ref={paperEditableRef}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={handlePaperInput}
                  onBlur={handlePaperBlur}
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
                  className="prose dark:prose-invert max-w-none text-slate-900 dark:text-slate-100 focus:outline-none min-h-[350px] sm:min-h-[600px]"
                />
              ) : (
                <div className="text-center py-24 text-slate-400">
                  <p>Document is empty. Click to type or use Ribbon tools above to start writing.</p>
                </div>
              )}
            </div>
          )}

          {/* ===================== VIEW: SPLIT VIEW (PAPER + SOURCE) ===================== */}
          {viewMode === 'split' && (
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Interactive Paper */}
              <div
                className="paper-canvas p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 shadow-md overflow-y-auto max-h-[750px]"
                style={fontFamilyStyle}
              >
                <div
                  ref={paperEditableRef}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={handlePaperInput}
                  onBlur={handlePaperBlur}
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }}
                  className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              {/* Right: Markdown Source Code */}
              <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Markdown Source</span>
                  <span>{words} words</span>
                </div>
                <textarea
                  ref={splitTextareaRef}
                  value={markdown}
                  onChange={e => updateMarkdownWithHistory(e.target.value)}
                  placeholder="Paste or write AI markdown here..."
                  className="w-full flex-1 p-4 font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 focus:outline-none resize-none min-h-[600px]"
                />
              </div>
            </div>
          )}

          {/* ===================== VIEW: RAW MARKDOWN SOURCE ===================== */}
          {viewMode === 'source' && (
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
              <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-indigo-400" />
                  <span className="font-bold text-slate-200">Raw AI Markdown Editor</span>
                </div>
                <span>
                  {lines} lines • {chars} characters
                </span>
              </div>
              <textarea
                ref={textareaRef}
                value={markdown}
                onChange={e => updateMarkdownWithHistory(e.target.value)}
                placeholder="Paste AI-generated markdown (Ctrl+K or direct paste)..."
                className="w-full p-6 font-mono text-xs sm:text-sm bg-slate-900 text-slate-100 focus:outline-none resize-none min-h-[650px] leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          WORD DIALOGS & MODALS
          ======================================================== */}
      {/* Document Stats Modal */}
      <DocumentStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        markdown={markdown}
        documentTitle={documentTitle}
      />

      {/* Find and Replace Modal */}
      <FindReplaceModal
        isOpen={showFindReplaceModal}
        onClose={() => setShowFindReplaceModal(false)}
        markdown={markdown}
        onReplaceMarkdown={updateMarkdownWithHistory}
      />

      {/* Insert Image Modal */}
      <InsertImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        onInsertImage={imgMd => {
          updateMarkdownWithHistory(`${markdown}\n\n${imgMd}\n\n`);
        }}
      />

      {/* Insert Link Modal */}
      <InsertLinkModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onInsertLink={linkMd => {
          updateMarkdownWithHistory(`${markdown} ${linkMd} `);
        }}
      />

      {/* Symbol Palette Modal */}
      <SymbolPaletteModal
        isOpen={showSymbolModal}
        onClose={() => setShowSymbolModal(false)}
        onInsertSymbol={sym => {
          updateMarkdownWithHistory(`${markdown} ${sym} `);
        }}
      />

      {/* Watermark Configuration Modal */}
      <WatermarkModal
        isOpen={showWatermarkModal}
        onClose={() => setShowWatermarkModal(false)}
        watermark={formatting.watermark}
        onSetWatermark={wm => {
          updateFormatting({ watermark: wm });
        }}
      />

      {/* Insert LaTeX Math Dialog */}
      {showMathDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sigma className="h-5 w-5 text-purple-600" />
              LaTeX Math Equation
            </h3>
            <p className="text-xs text-slate-500">
              Converts to native Microsoft Word OMML formula on export.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LaTeX Formula
              </label>
              <textarea
                value={mathInput}
                onChange={e => setMathInput(e.target.value)}
                rows={3}
                className="w-full p-2.5 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Live KaTeX Preview */}
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 overflow-x-auto text-center min-h-[50px] flex items-center justify-center">
              <div
                dangerouslySetInnerHTML={{
                  __html: renderLatexHtml(mathInput, true),
                }}
              />
            </div>

            <div className="flex flex-wrap gap-1 text-[11px]">
              {[
                { label: 'Quadratic', val: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
                { label: 'Integral', val: '\\int_{a}^{b} f(x) \\, dx' },
                { label: 'Sum', val: '\\sum_{i=1}^{n} i^2' },
              ].map(s => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setMathInput(s.val)}
                  className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMathDialog(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertMath}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Insert Word Equation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Table Dialog */}
      {showTableDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TableIcon className="h-5 w-5 text-indigo-600" />
              Custom Table
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  min={1}
                  max={25}
                  value={tableRowsCount}
                  onChange={e => setTableRowsCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={tableColsCount}
                  onChange={e => setTableColsCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowTableDialog(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Insert Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Code Dialog */}
      {showCodeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Code className="h-5 w-5 text-emerald-600" />
              Code Block
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Language
              </label>
              <select
                value={codeLang}
                onChange={e => setCodeLang(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm cursor-pointer"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="sql">SQL</option>
                <option value="bash">Bash / Shell</option>
                <option value="json">JSON</option>
                <option value="cpp">C++</option>
                <option value="html">HTML / CSS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Code Content
              </label>
              <textarea
                value={codeSnippet}
                onChange={e => setCodeSnippet(e.target.value)}
                rows={6}
                className="w-full p-3 font-mono text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCodeDialog(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertCode}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Insert Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

Editor.displayName = 'Editor';

function linesCount(str: string): number {
  return str.split('\n').length;
}
