'use client';

import React from 'react';
import { X, FileText, Type, AlignLeft, Clock, Mic, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface DocumentStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  documentTitle: string;
}

export const DocumentStatsModal: React.FC<DocumentStatsModalProps> = ({
  isOpen,
  onClose,
  markdown,
  documentTitle,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const cleanText = markdown.replace(/[#*`~>|\[\]\-_$]/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const charactersWithSpaces = markdown.length;
  const charactersNoSpaces = markdown.replace(/\s/g, '').length;
  const paragraphs = markdown.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const sentences = markdown.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const lines = markdown.split('\n').length;

  const readingMinutes = Math.max(1, Math.ceil(words / 200));
  const speakingMinutes = Math.max(1, Math.ceil(words / 130));

  // Count tables, equations, code blocks
  const tableMatches = (markdown.match(/\|[\s\S]*?\|/g) || []).length;
  const mathMatches = (markdown.match(/\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) || []).length;
  const codeMatches = (markdown.match(/```[\s\S]*?```/g) || []).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Word Count & Statistics
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                {documentTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Primary Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Words</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {words.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
              Characters (with spaces)
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {charactersWithSpaces.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
              Characters (no spaces)
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {charactersNoSpaces.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
              Paragraphs
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {paragraphs.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
              Sentences
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {sentences.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
              Total Lines
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {lines.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Read / Speak Time */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-around text-xs">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-blue-900 dark:text-blue-200">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>
              Reading Time: <strong>~{readingMinutes} min</strong>
            </span>
          </div>
          <div className="h-4 w-px bg-blue-200 dark:bg-blue-800" />
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-blue-900 dark:text-blue-200">
            <Mic className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>
              Speaking Time: <strong>~{speakingMinutes} min</strong>
            </span>
          </div>
        </div>

        {/* Embedded Rich Content Counter */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Formulae / Math: <strong>{mathMatches}</strong></span>
          <span>Code Blocks: <strong>{codeMatches}</strong></span>
          <span>Structured Tables: <strong>{tableMatches > 0 ? 'Yes' : 'None'}</strong></span>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
