'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from './LanguageContext';
import {
  FileText,
  FileDown,
  Printer,
  Copy,
  Save,
  Sparkles,
  Search,
  Replace,
  FolderOpen,
  Upload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Indent,
  Outdent,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Table as TableIcon,
  Sigma,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Stamp,
  Eye,
  Type,
  ChevronDown,
  Split,
  FileCode2,
  Undo2,
  Redo2,
  RemoveFormatting,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ListTree,
} from 'lucide-react';

export type RibbonTab = 'home' | 'insert' | 'layout' | 'review' | 'view' | 'file';
export type ViewMode = 'docx' | 'print' | 'web' | 'split' | 'source';

export interface WordFormattingOptions {
  fontFamily: string;
  fontSize: number;
  orientation: 'portrait' | 'landscape';
  paperSize: 'a4' | 'letter' | 'legal';
  margins: 'normal' | 'narrow' | 'wide';
  lineSpacing: '1.0' | '1.15' | '1.5' | '2.0';
  watermark: string;
  showRuler: boolean;
  zoomLevel: number;
}

interface WordRibbonProps {
  formatting: WordFormattingOptions;
  onChangeFormatting: (opts: Partial<WordFormattingOptions>) => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onWrapSelection: (before: string, after?: string) => void;
  onApplyBlockStyle: (prefix: string) => void;
  onExecCommand?: (command: string, value?: string, mdBefore?: string, mdAfter?: string) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenInsertModal: () => void;
  onOpenTableDialog: () => void;
  onOpenMathDialog: () => void;
  onOpenCodeDialog: () => void;
  onOpenImageModal: () => void;
  onOpenLinkModal: () => void;
  onOpenSymbolModal: () => void;
  onOpenStatsModal: () => void;
  onOpenFindReplaceModal: () => void;
  onOpenWatermarkModal: () => void;
  onImportDocx: (file: File) => void;
  onExportDocx: () => void;
  onExportPdf: () => void;
  onCopyGoogleDocs: () => void;
  onSaveDoc: () => void;
  onClearDoc: () => void;
  onLoadTemplate: (templateKey: string) => void;
  onInsertTableOfContents: () => void;
  isExporting: boolean;
}

export const WordRibbon: React.FC<WordRibbonProps> = ({
  formatting,
  onChangeFormatting,
  viewMode,
  onChangeViewMode,
  onWrapSelection,
  onApplyBlockStyle,
  onExecCommand,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenInsertModal,
  onOpenTableDialog,
  onOpenMathDialog,
  onOpenCodeDialog,
  onOpenImageModal,
  onOpenLinkModal,
  onOpenSymbolModal,
  onOpenStatsModal,
  onOpenFindReplaceModal,
  onOpenWatermarkModal,
  onImportDocx,
  onExportDocx,
  onExportPdf,
  onCopyGoogleDocs,
  onSaveDoc,
  onClearDoc,
  onLoadTemplate,
  onInsertTableOfContents,
  isExporting,
}) => {
  const { direction, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [tableGridHover, setTableGridHover] = useState({ rows: 3, cols: 3 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatting execution handler supporting contentEditable execCommand & Markdown fallback
  const handleFormat = (command: string, value?: string, mdBefore?: string, mdAfter?: string) => {
    if (onExecCommand) {
      onExecCommand(command, value, mdBefore, mdAfter);
    } else if (mdBefore) {
      onWrapSelection(mdBefore, mdAfter);
    }
  };

  // Text Color Palette
  const textColors = [
    { label: 'Black', hex: '#0f172a' },
    { label: 'Dark Slate', hex: '#334155' },
    { label: 'Navy Blue', hex: '#1e3a8a' },
    { label: 'Primary Blue', hex: '#2563eb' },
    { label: 'Crimson Red', hex: '#dc2626' },
    { label: 'Forest Green', hex: '#16a34a' },
    { label: 'Purple', hex: '#9333ea' },
    { label: 'Amber', hex: '#d97706' },
  ];

  // Highlight Color Palette
  const highlightColors = [
    { label: 'Yellow', hex: '#fef08a' },
    { label: 'Green', hex: '#bbf7d0' },
    { label: 'Cyan', hex: '#a5f3fc' },
    { label: 'Magenta', hex: '#fbcfe8' },
    { label: 'Orange', hex: '#fed7aa' },
    { label: 'None', hex: 'transparent' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportDocx(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyColor = (colorHex: string) => {
    handleFormat('foreColor', colorHex, `<span style="color: ${colorHex}">`, '</span>');
    setShowColorPicker(false);
  };

  const handleApplyHighlight = (bgHex: string) => {
    if (bgHex === 'transparent') {
      handleFormat('removeFormat', undefined, '', '');
    } else {
      handleFormat('hiliteColor', bgHex, `<mark style="background-color: ${bgHex}">`, '</mark>');
    }
    setShowHighlightPicker(false);
  };

  const handleInsertGridTable = (rows: number, cols: number) => {
    let mdTable = '\n\n|';
    for (let c = 1; c <= cols; c++) mdTable += ` Column ${c} |`;
    mdTable += '\n|';
    for (let c = 1; c <= cols; c++) mdTable += ' :--- |';
    for (let r = 1; r <= rows; r++) {
      mdTable += '\n|';
      for (let c = 1; c <= cols; c++) mdTable += ` Data ${r}-${c} |`;
    }
    mdTable += '\n\n';
    onWrapSelection(mdTable, '');
    setShowTableGrid(false);
  };

  const handleInsertPageBreak = () => {
    onWrapSelection('\n\n<div style="page-break-after: always; height: 1px; margin: 30px 0; border-bottom: 2px dashed #cbd5e1;"></div>\n\n');
  };

  const handleInsertCallout = (type: 'info' | 'warning' | 'success') => {
    onWrapSelection(`\n\n> [!${type.toUpperCase()}]\n> **${type.toUpperCase()}**: Add important message here.\n\n`);
  };

  // Reusable button styles
  // Reusable button styles with cohesive Word Ribbon finish
  const btnIconClass =
    'h-8 w-8 inline-flex items-center justify-center rounded-md border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-slate-300/80 dark:hover:border-slate-700 active:scale-95 transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500';

  const btnTextClass =
    'h-8 px-2.5 inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-slate-300/80 dark:hover:border-slate-700 active:scale-95 transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500';

  const groupCardClass =
    'flex items-center gap-1 p-1 bg-slate-50/90 dark:bg-slate-950/80 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs shrink-0';

  const dividerClass = 'h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0';

  return (
    <div className="no-print w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs select-none transition-colors">
      {/* Hidden DOCX File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Top Ribbon Tabs Header (Selector 2) */}
      <div className="flex items-center px-3 sm:px-6 border-b border-slate-200/90 dark:border-slate-800 bg-gradient-to-b from-slate-100 to-slate-100/70 dark:from-slate-950 dark:to-slate-900 gap-1 overflow-x-auto text-xs font-semibold text-slate-700 dark:text-slate-300 py-1.5 shadow-2xs">
        {/* Word File Tab (Iconic Blue) */}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setActiveTab('file')}
          className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
            activeTab === 'file'
              ? 'bg-[#185abd] text-white shadow-xs ring-1 ring-blue-700'
              : 'bg-[#185abd]/90 hover:bg-[#185abd] text-white shadow-2xs'
          }`}
          title="File Operations & DOCX Export"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          <span>File</span>
        </button>

        {/* Home Tab */}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setActiveTab('home')}
          className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'home'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-900 shadow-2xs'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Home</span>
        </button>

        {/* Insert Tab */}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setActiveTab('insert')}
          className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'insert'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-900 shadow-2xs'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Insert</span>
        </button>

        {/* Layout Tab */}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setActiveTab('layout')}
          className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'layout'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-900 shadow-2xs'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Layout</span>
        </button>

        {/* Review Tab */}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setActiveTab('review')}
          className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'review'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-900 shadow-2xs'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>Review</span>
        </button>

        {/* View Tab */}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setActiveTab('view')}
          className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'view'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold border border-slate-200 dark:border-slate-700 border-b-white dark:border-b-slate-900 shadow-2xs'
              : 'hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <span>View</span>
        </button>

        {/* Right side shortcuts: Undo/Redo & Quick AI Insert */}
        <div className="ml-auto flex items-center gap-1.5 py-0.5">
          {onUndo && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onUndo}
              disabled={!canUndo}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 transition ${
                canUndo
                  ? 'hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs active:scale-95'
                  : 'opacity-40 cursor-not-allowed text-slate-400'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
          )}

          {onRedo && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onRedo}
              disabled={!canRedo}
              className={`h-7 w-7 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700 transition ${
                canRedo
                  ? 'hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs active:scale-95'
                  : 'opacity-40 cursor-not-allowed text-slate-400'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={onOpenInsertModal}
            className="inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1 rounded-md bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
            title="Paste AI Markdown (Ctrl+K)"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Paste</span>
          </button>
        </div>
      </div>

      {/* Tab Action Strip (Selector 3) */}
      <div className="px-3 sm:px-6 py-2.5 overflow-x-auto min-h-[62px] flex items-center gap-2 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800/80 shadow-2xs transition-colors">
        {/* ===================== TAB: HOME ===================== */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-2 text-xs flex-nowrap">
          </div>
        )}

        {/* ===================== TAB: INSERT ===================== */}
        {activeTab === 'insert' && (
          <div className="flex items-center gap-2 text-xs flex-nowrap">
            {/* Table with Grid Dropdown */}
            <div className="relative shrink-0">
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setShowTableGrid(!showTableGrid)}
                className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 font-semibold hover:border-blue-400 hover:bg-blue-50/50 shadow-2xs cursor-pointer transition"
                title="Insert Table Grid"
              >
                <TableIcon className="h-4 w-4 text-blue-600" />
                <span>Table</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {showTableGrid && (
                <div className="absolute top-9 left-0 z-50 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl space-y-2 w-48">
                  <span className="text-[11px] font-bold text-slate-500 block">
                    {tableGridHover.rows} × {tableGridHover.cols} Table
                  </span>
                  <div className="grid grid-cols-6 gap-1">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const r = Math.floor(i / 6) + 1;
                      const c = (i % 6) + 1;
                      const isHovered = r <= tableGridHover.rows && c <= tableGridHover.cols;
                      return (
                        <div
                          key={i}
                          onMouseEnter={() => setTableGridHover({ rows: r, cols: c })}
                          onClick={() => handleInsertGridTable(r, c)}
                          className={`h-5 w-5 rounded border cursor-pointer transition ${
                            isHovered
                              ? 'bg-blue-500 border-blue-600'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTableGrid(false);
                      onOpenTableDialog();
                    }}
                    className="w-full text-center text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline pt-1 cursor-pointer"
                  >
                    Custom Table Dialog...
                  </button>
                </div>
              )}
            </div>

            {/* Word Equation (LaTeX to OMML) */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onOpenMathDialog}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/40 shadow-2xs cursor-pointer transition"
              title="Word Native Math Equation (LaTeX)"
            >
              <Sigma className="h-4 w-4 text-purple-600" />
              <span>Word Equation</span>
            </button>

            {/* Picture / Image */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onOpenImageModal}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 font-semibold hover:border-emerald-300 hover:bg-emerald-50/50 shadow-2xs cursor-pointer transition"
              title="Insert Picture or Upload Image"
            >
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              <span>Picture</span>
            </button>

            {/* Code Block */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onOpenCodeDialog}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs cursor-pointer transition"
              title="Insert Code Snippet"
            >
              <Code className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>Code Block</span>
            </button>

            {/* Link */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onOpenLinkModal}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:border-blue-400 hover:bg-blue-50/40 shadow-2xs cursor-pointer transition"
              title="Insert Hyperlink"
            >
              <LinkIcon className="h-4 w-4 text-blue-500" />
              <span>Link</span>
            </button>

            {/* Symbols */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onOpenSymbolModal}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:border-purple-300 hover:bg-purple-50/40 shadow-2xs cursor-pointer transition"
              title="Special Characters and Greek Symbols"
            >
              <span className="font-serif font-bold text-sm text-purple-600">Ω</span>
              <span>Symbol</span>
            </button>

            {/* Page Break */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={handleInsertPageBreak}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold hover:border-slate-400 shadow-2xs cursor-pointer transition"
              title="Insert A4 Page Break"
            >
              <Split className="h-4 w-4 text-slate-500" />
              <span>Page Break</span>
            </button>

            {/* Table of Contents */}
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={onInsertTableOfContents}
              className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 shadow-2xs cursor-pointer transition"
              title="Automatically scan headings and insert Table of Contents"
            >
              <ListTree className="h-4 w-4 text-indigo-600" />
              <span>Table of Contents</span>
            </button>

            <div className={dividerClass} />

            {/* Callouts */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleInsertCallout('info')}
                className="h-8 px-2.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-semibold text-xs hover:bg-blue-100 transition cursor-pointer"
                title="Insert Note Box"
              >
                + Note
              </button>
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleInsertCallout('warning')}
                className="h-8 px-2.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold text-xs hover:bg-amber-100 transition cursor-pointer"
                title="Insert Warning Box"
              >
                + Warning
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB: LAYOUT ===================== */}
        {activeTab === 'layout' && (
          <div className="flex items-center gap-3 text-xs flex-nowrap">
            {/* Orientation */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-slate-500 font-medium px-1 text-[11px]">Orientation:</span>
              <button
                type="button"
                onClick={() => onChangeFormatting({ orientation: 'portrait' })}
                className={`h-7 px-2.5 rounded font-semibold transition cursor-pointer ${
                  formatting.orientation === 'portrait'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Portrait
              </button>
              <button
                type="button"
                onClick={() => onChangeFormatting({ orientation: 'landscape' })}
                className={`h-7 px-2.5 rounded font-semibold transition cursor-pointer ${
                  formatting.orientation === 'landscape'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Landscape
              </button>
            </div>

            <div className={dividerClass} />

            {/* Margins */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
              <span className="text-slate-500 font-medium px-1 text-[11px]">Margins:</span>
              {(['normal', 'narrow', 'wide'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChangeFormatting({ margins: m })}
                  className={`h-7 px-2.5 rounded font-semibold capitalize transition cursor-pointer ${
                    formatting.margins === m
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className={dividerClass} />

            {/* Watermark Button */}
            <button
              type="button"
              onClick={onOpenWatermarkModal}
              className={`h-8 px-3 rounded-lg border font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                formatting.watermark
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-700 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <Stamp className="h-3.5 w-3.5 text-amber-600" />
              <span>Watermark: {formatting.watermark || 'None'}</span>
            </button>

            {/* Ruler Toggle */}
            <button
              type="button"
              onClick={() => onChangeFormatting({ showRuler: !formatting.showRuler })}
              className={`h-8 px-3 rounded-lg border font-semibold transition cursor-pointer shrink-0 ${
                formatting.showRuler
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <span>Ruler: {formatting.showRuler ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        )}

        {/* ===================== TAB: REVIEW ===================== */}
        {activeTab === 'review' && (
          <div className="flex items-center gap-2 text-xs flex-nowrap">
            <button
              type="button"
              onClick={onOpenStatsModal}
              className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 hover:bg-blue-50/50 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs transition cursor-pointer shrink-0"
            >
              <Type className="h-4 w-4 text-blue-600" />
              <span>Word Count & Statistics</span>
            </button>

            <button
              type="button"
              onClick={onOpenFindReplaceModal}
              className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-400 hover:bg-blue-50/50 text-blue-700 dark:text-blue-300 font-semibold shadow-2xs transition cursor-pointer shrink-0"
            >
              <Replace className="h-4 w-4 text-blue-600" />
              <span>Find & Replace</span>
            </button>

            <div className={dividerClass} />

            <button
              type="button"
              onClick={onOpenInsertModal}
              className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 font-semibold border border-red-200 dark:border-red-900/60 hover:bg-red-100 transition cursor-pointer shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-red-600" />
              <span>AI Polish / Rephrase</span>
            </button>
          </div>
        )}

        {/* ===================== TAB: VIEW ===================== */}
        {activeTab === 'view' && (
          <div className="flex items-center gap-3 text-xs flex-nowrap">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => onChangeViewMode('docx')}
                className={`h-7 px-2.5 rounded font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'docx'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Word DOCX Editor (Genuine EigenPal Engine)"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Word DOCX Editor</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('print')}
                className={`h-7 px-2.5 rounded font-semibold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'print'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Print Layout (Realistic A4 Pages)"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Print Layout (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('web')}
                className={`h-7 px-2.5 rounded font-semibold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'web'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Continuous Web Canvas"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Continuous Web</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('split')}
                className={`h-7 px-2.5 rounded font-semibold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Split View (Preview + Source)"
              >
                <Split className="h-3.5 w-3.5" />
                <span>Split View</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeViewMode('source')}
                className={`h-7 px-2.5 rounded font-semibold transition flex items-center gap-1 cursor-pointer ${
                  viewMode === 'source'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
                title="Raw Markdown Source"
              >
                <FileCode2 className="h-3.5 w-3.5" />
                <span>Source Code</span>
              </button>
            </div>

            <div className={dividerClass} />

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() =>
                  onChangeFormatting({ zoomLevel: Math.max(75, formatting.zoomLevel - 10) })
                }
                className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono font-bold text-xs w-12 text-center text-slate-800 dark:text-slate-200">
                {formatting.zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() =>
                  onChangeFormatting({ zoomLevel: Math.min(150, formatting.zoomLevel + 10) })
                }
                className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeFormatting({ zoomLevel: 100 })}
                className="h-7 px-2 text-[11px] font-semibold text-slate-500 hover:text-blue-600 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              >
                100%
              </button>
            </div>
          </div>
        )}

        {/* ===================== TAB: FILE / DOCX ===================== */}
        {activeTab === 'file' && (
          <div className="flex items-center gap-2 text-xs flex-nowrap">
            {/* Import DOCX */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Import and convert Microsoft Word document (.docx) into editor"
            >
              <Upload className="h-4 w-4" />
              <span>Import Word (.docx)</span>
            </button>

            {/* Export DOCX */}
            <button
              type="button"
              onClick={onExportDocx}
              disabled={isExporting}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 transition cursor-pointer shrink-0"
              title="Download Microsoft Word document"
            >
              <FileDown className="h-4 w-4 text-blue-600" />
              <span>Export Word (.docx)</span>
            </button>

            {/* Export PDF */}
            <button
              type="button"
              onClick={onExportPdf}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>Export PDF / Print</span>
            </button>

            {/* Copy Google Docs */}
            <button
              type="button"
              onClick={onCopyGoogleDocs}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Copy className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              <span>Copy for Google Docs</span>
            </button>

            {/* Save */}
            <button
              type="button"
              onClick={onSaveDoc}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              <Save className="h-4 w-4 text-green-600" />
              <span>Save Document</span>
            </button>

            <div className={dividerClass} />

            {/* Templates */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-slate-500 font-medium text-[11px]">Templates:</span>
              <button
                type="button"
                onClick={() => onLoadTemplate('quantum')}
                className="h-7 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold cursor-pointer transition"
              >
                Physics Paper
              </button>
              <button
                type="button"
                onClick={() => onLoadTemplate('saudi_vat')}
                className="h-7 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold cursor-pointer transition"
              >
                Saudi VAT Report
              </button>
              <button
                type="button"
                onClick={() => onLoadTemplate('neural_network')}
                className="h-7 px-2.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold cursor-pointer transition"
              >
                Technical Spec
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
