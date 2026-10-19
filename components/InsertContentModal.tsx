'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { SAMPLE_MARKDOWN_PRESETS } from '@/lib/markdown-to-html';
import {
  X,
  Sparkles,
  Clipboard,
  Link2,
  FileCode,
  AlertCircle,
  Loader2,
  Check,
  BookOpen,
} from 'lucide-react';

interface InsertContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertMarkdown: (markdown: string, replace: boolean) => void;
}

export const InsertContentModal: React.FC<InsertContentModalProps> = ({
  isOpen,
  onClose,
  onInsertMarkdown,
}) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'raw' | 'share'>('raw');
  const [rawText, setRawText] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [isFetchingLink, setIsFetchingLink] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [clipboardSuccess, setClipboardSuccess] = useState(false);

  // Keyboard shortcut listener for Ctrl+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (activeTab === 'raw' && rawText.trim()) {
          onInsertMarkdown(rawText, true);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, rawText, onClose, onInsertMarkdown]);

  if (!isOpen) return null;

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRawText(text);
          setClipboardSuccess(true);
          setTimeout(() => setClipboardSuccess(false), 2000);
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleApplyPreset = (presetId: string) => {
    const preset = SAMPLE_MARKDOWN_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setRawText(preset.markdown);
    }
  };

  const handleFetchShareLink = async () => {
    if (!shareUrl.trim()) return;
    setIsFetchingLink(true);
    setLinkError(null);

    try {
      const res = await fetch('/api/fetch-share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: shareUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setLinkError(data.error || 'Failed to fetch share link');
      } else if (data.markdown) {
        onInsertMarkdown(data.markdown, true);
        onClose();
      }
    } catch (err: any) {
      setLinkError(err.message || 'Network error fetching share link.');
    } finally {
      setIsFetchingLink(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200 modal-backdrop">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="p-2 rounded-lg bg-red-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.insertButton}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ChatGPT, Claude, Gemini Markdown & Share Links
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Vital Notice Banner */}
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex items-center space-x-2.5 rtl:space-x-reverse text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{t.dontChangeMarkdownNotice}</span>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'raw'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>{t.tabRawMarkdown}</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition ${
              activeTab === 'share'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>{t.tabShareLink}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'raw' ? (
            <div className="space-y-4">
              {/* Presets and Paste bar */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-sm"
                >
                  {clipboardSuccess ? (
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5 text-slate-500" />
                  )}
                  <span>{t.pasteClipboard}</span>
                </button>

                {/* Preset Templates */}
                <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {t.presetsLabel}:
                  </span>
                  {SAMPLE_MARKDOWN_PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p.id)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {language === 'ar' ? p.titleAr.split(' ')[0] : p.titleEn.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="# Enter or paste Markdown here...&#10;&#10;Equations: $$E = mc^2$$&#10;Tables: | Col1 | Col2 |&#10;Code: ```python&#10;..."
                  rows={8}
                  className="w-full p-3 sm:p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-red-500 resize-y min-h-[140px] sm:min-h-[220px]"
                />
              </div>

              {rawText.trim().length > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {rawText.trim().split(/\s+/).length} {t.wordCount} | {rawText.length} {t.charCount}
                  </span>
                  <span>Press Ctrl+Enter to insert</span>
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: Share Link */
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.tabShareLink}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={shareUrl}
                    onChange={e => setShareUrl(e.target.value)}
                    placeholder={t.shareLinkPlaceholder}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={handleFetchShareLink}
                    disabled={isFetchingLink || !shareUrl.trim()}
                    className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-sm transition"
                  >
                    {isFetchingLink ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t.fetching}</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4" />
                        <span>{t.fetchLinkAction}</span>
                      </>
                    )}
                  </button>
                </div>
                {linkError && (
                  <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {linkError}
                  </p>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Supported formats:</p>
                <ul className="list-disc pl-5 rtl:pr-5 space-y-0.5">
                  <li>ChatGPT: <code className="text-red-600">https://chatgpt.com/share/67...</code></li>
                  <li>Gemini: <code className="text-red-600">https://gemini.google.com/share/...</code></li>
                  <li>Claude or other public conversation links</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition"
          >
            {t.cancel}
          </button>

          {activeTab === 'raw' && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={() => {
                  if (rawText.trim()) {
                    onInsertMarkdown(rawText, true);
                    onClose();
                  }
                }}
                disabled={!rawText.trim()}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition"
              >
                {t.insertAction}
              </button>
              <button
                onClick={() => {
                  if (rawText.trim()) {
                    onInsertMarkdown(rawText, false);
                    onClose();
                  }
                }}
                disabled={!rawText.trim()}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold transition"
              >
                {t.replaceAction} (إلحاق/تعديل)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
