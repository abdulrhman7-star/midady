'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import {
  FileDown,
  Printer,
  Copy,
  Check,
  Save,
  Trash2,
  Sparkles,
  Command,
  Loader2,
} from 'lucide-react';

interface ExportBarProps {
  onOpenInsertModal: () => void;
  onExportDocx: () => Promise<void>;
  onExportPdf: () => void;
  onCopyGoogleDocs: () => Promise<boolean>;
  onSaveDoc: () => void;
  onClearDoc: () => void;
  isExporting: boolean;
}

export const ExportBar: React.FC<ExportBarProps> = ({
  onOpenInsertModal,
  onExportDocx,
  onExportPdf,
  onCopyGoogleDocs,
  onSaveDoc,
  onClearDoc,
  isExporting,
}) => {
  const { t } = useLanguage();
  const [copiedGDocs, setCopiedGDocs] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCopyGDocs = async () => {
    const success = await onCopyGoogleDocs();
    if (success) {
      setCopiedGDocs(true);
      setTimeout(() => setCopiedGDocs(false), 2500);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    onSaveDoc();
    setTimeout(() => setIsSaving(false), 1200);
  };

  return (
    <div className="no-print export-bar-container w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-2 sm:py-2.5 px-3 sm:px-6 shadow-xs sticky top-16 z-20 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4">
        {/* The Prominent Red Action Button with pulsing indicator */}
        <div className="flex items-center w-full sm:w-auto">
          <button
            onClick={onOpenInsertModal}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center space-x-2.5 rtl:space-x-reverse px-4 sm:px-5 py-2.5 min-h-[44px] rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm md:text-base shadow-md shadow-red-600/30 hover:shadow-lg hover:shadow-red-600/40 active:scale-[0.98] transition-all duration-150 cursor-pointer"
            title={t.insertTooltip}
          >
            {/* Pulsing indicator light */}
            <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white"></span>
            </span>

            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="truncate">{t.insertButton}</span>

            {/* Keyboard shortcut badge */}
            <kbd className="hidden md:inline-flex items-center space-x-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-red-800/60 rounded text-red-100 border border-red-500/40">
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Action Buttons: DOCX, PDF, Google Docs, Save, Clear */}
        <div className="w-full sm:w-auto flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          {/* Download DOCX (Primary Word Document Export) */}
          <button
            onClick={onExportDocx}
            disabled={isExporting}
            className="flex-1 sm:flex-none group relative inline-flex items-center justify-center space-x-1.5 sm:space-x-2 rtl:space-x-reverse px-3 sm:px-4 py-2 min-h-[40px] rounded-lg bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/25 hover:shadow-lg hover:shadow-blue-600/35 border border-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
            title="Download formatted Microsoft Word document (.docx) with editable native math equations"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-white shrink-0" />
            ) : (
              <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white group-hover:-translate-y-0.5 transition-transform duration-150 shrink-0" />
            )}
            <span className="font-bold tracking-tight whitespace-nowrap">{t.exportDocx}</span>
            <span className="hidden xs:inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-900/40 text-blue-100 border border-blue-400/30">
              DOCX
            </span>
          </button>

          {/* Download PDF */}
          <button
            onClick={onExportPdf}
            className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 rtl:space-x-reverse px-2.5 sm:px-3.5 py-2 min-h-[40px] rounded-lg bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition"
            title="Print or save as high quality PDF"
          >
            <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            <span className="whitespace-nowrap">{t.exportPdf}</span>
          </button>

          {/* Copy for Google Docs */}
          <button
            onClick={handleCopyGDocs}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 rtl:space-x-reverse px-2.5 sm:px-3.5 py-2 min-h-[40px] rounded-lg text-xs sm:text-sm font-semibold border transition ${
              copiedGDocs
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
            title="Copy rich text with inlined table borders and styles for Google Docs & Word paste"
          >
            {copiedGDocs ? (
              <>
                <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="whitespace-nowrap">{t.copiedGDocs}</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 shrink-0" />
                <span className="whitespace-nowrap">{t.copyGDocs}</span>
              </>
            )}
          </button>

          {/* Save Document */}
          <button
            onClick={handleSave}
            className="inline-flex items-center justify-center space-x-1 rtl:space-x-reverse p-2 sm:px-3 sm:py-2 min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium transition cursor-pointer"
            title={t.saveDoc}
          >
            {isSaving ? (
              <Check className="h-4 w-4 text-green-600 animate-bounce" />
            ) : (
              <Save className="h-4 w-4 text-slate-500" />
            )}
            <span className="hidden md:inline">{t.saveDoc}</span>
          </button>

          {/* Clear Editor */}
          <button
            onClick={onClearDoc}
            className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 transition cursor-pointer"
            title={t.clearDoc}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
