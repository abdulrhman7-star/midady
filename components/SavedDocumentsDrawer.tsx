'use client';

import React from 'react';
import { useLanguage } from './LanguageContext';
import { SavedDocument } from '@/types';
import {
  X,
  FileText,
  Trash2,
  FolderOpen,
  Calendar,
  FileDown,
  ExternalLink,
  Plus,
} from 'lucide-react';

interface SavedDocumentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: SavedDocument[];
  onSelectDoc: (doc: SavedDocument) => void;
  onDeleteDoc: (id: string) => void;
  onExportDocx: (markdown: string, title: string) => void;
  onNewDoc: () => void;
}

export const SavedDocumentsDrawer: React.FC<SavedDocumentsDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  onSelectDoc,
  onDeleteDoc,
  onExportDocx,
  onNewDoc,
}) => {
  const { direction, language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden modal-backdrop">
      <div
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 ${
          direction === 'rtl' ? 'left-0' : 'right-0'
        } max-w-full flex`}
      >
        <div className="w-screen max-w-[90vw] sm:max-w-md bg-white dark:bg-slate-900 border-l rtl:border-l-0 rtl:border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <FolderOpen className="h-5 w-5 text-red-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {t.savedDocsTitle}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {documents.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Document Button */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                onNewDoc();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 hover:bg-red-50/40 dark:hover:bg-red-950/20 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 rtl:space-x-reverse transition"
            >
              <Plus className="h-4 w-4 text-red-600" />
              <span>{language === 'ar' ? 'إنشاء مستند فارغ' : 'Create Blank Document'}</span>
            </button>
          </div>

          {/* Documents List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {documents.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  {t.noSavedDocs}
                </p>
              </div>
            ) : (
              documents.map(doc => {
                const words = doc.markdown.trim().split(/\s+/).filter(Boolean).length;
                const dateStr = new Date(doc.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 transition group space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <h3
                        onClick={() => {
                          onSelectDoc(doc);
                          onClose();
                        }}
                        className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-red-600 cursor-pointer truncate max-w-[240px]"
                      >
                        {doc.title}
                      </h3>
                      <button
                        onClick={() => onDeleteDoc(doc.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition opacity-75 hover:opacity-100"
                        title={language === 'ar' ? 'حذف المستند' : 'Delete Document'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-mono">
                      {doc.markdown.slice(0, 140)}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dateStr}
                      </span>
                      <span>
                        {words} {t.wordCount}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          onSelectDoc(doc);
                          onClose();
                        }}
                        className="flex-1 py-1 px-2.5 rounded bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition"
                      >
                        {language === 'ar' ? 'فتح في المحرر' : 'Open Editor'}
                      </button>
                      <button
                        onClick={() => {
                          if (doc.docxBase64) {
                            try {
                              const { base64ToBuffer } = require('@/lib/utils');
                              const { downloadDocxBuffer } = require('@/lib/docx-export');
                              downloadDocxBuffer(base64ToBuffer(doc.docxBase64), `${doc.title}.docx`);
                              return;
                            } catch {}
                          }
                          onExportDocx(doc.markdown, doc.title);
                        }}
                        className="p-1.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition cursor-pointer"
                        title={language === 'ar' ? 'تنزيل DOCX سريع' : 'Quick Download DOCX'}
                      >
                        <FileDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
