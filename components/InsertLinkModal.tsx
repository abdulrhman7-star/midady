'use client';

import React, { useState } from 'react';
import { X, Link as LinkIcon } from 'lucide-react';

interface InsertLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertLink: (linkMarkdown: string) => void;
}

export const InsertLinkModal: React.FC<InsertLinkModalProps> = ({
  isOpen,
  onClose,
  onInsertLink,
}) => {
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen) return null;

  const handleInsert = () => {
    if (!url.trim()) return;
    const displayText = text.trim() || url.trim();
    const md = `[${displayText}](${url.trim()})`;
    onInsertLink(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Insert Hyperlink
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Display Text
          </label>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. Official Documentation"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Web URL
          </label>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!url.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-40"
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
};
