'use client';

import React, { useState } from 'react';
import { X, Search, Replace, Check, AlertCircle } from 'lucide-react';

interface FindReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  onReplaceMarkdown: (newMarkdown: string) => void;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  onClose,
  markdown,
  onReplaceMarkdown,
}) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate occurrences
  const countMatches = () => {
    if (!findText) return 0;
    const flags = matchCase ? 'g' : 'gi';
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = markdown.match(new RegExp(escaped, flags));
    return matches ? matches.length : 0;
  };

  const matchesCount = countMatches();

  const handleReplaceFirst = () => {
    if (!findText) return;
    const flags = matchCase ? '' : 'i';
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    if (regex.test(markdown)) {
      const updated = markdown.replace(regex, replaceText);
      onReplaceMarkdown(updated);
      setMessage('Replaced 1 occurrence.');
      setTimeout(() => setMessage(null), 2500);
    } else {
      setMessage('No match found.');
      setTimeout(() => setMessage(null), 2500);
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const flags = matchCase ? 'g' : 'gi';
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);
    const count = countMatches();

    if (count > 0) {
      const updated = markdown.replace(regex, replaceText);
      onReplaceMarkdown(updated);
      setMessage(`Replaced ${count} occurrence(s).`);
      setTimeout(() => setMessage(null), 2500);
    } else {
      setMessage('No matches found to replace.');
      setTimeout(() => setMessage(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Replace className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Find & Replace
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Find input */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Find Text
          </label>
          <div className="relative">
            <input
              type="text"
              value={findText}
              onChange={e => setFindText(e.target.value)}
              placeholder="Text to find..."
              className="w-full pl-9 pr-16 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            {findText && (
              <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-500">
                {matchesCount} found
              </span>
            )}
          </div>
        </div>

        {/* Replace input */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Replace With
          </label>
          <input
            type="text"
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            placeholder="New replacement text..."
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Options */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse pt-1 text-xs">
          <input
            type="checkbox"
            id="matchCase"
            checked={matchCase}
            onChange={e => setMatchCase(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="matchCase" className="text-slate-700 dark:text-slate-300 cursor-pointer">
            Match case (case sensitive)
          </label>
        </div>

        {/* Status message */}
        {message && (
          <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReplaceFirst}
            disabled={!findText || matchesCount === 0}
            className="px-3.5 py-2 rounded-lg border border-blue-600 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-40"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={handleReplaceAll}
            disabled={!findText || matchesCount === 0}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm disabled:opacity-40"
          >
            Replace All ({matchesCount})
          </button>
        </div>
      </div>
    </div>
  );
};
