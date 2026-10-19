'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Upload, Link, Check } from 'lucide-react';

interface InsertImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (imageMarkdown: string) => void;
}

export const InsertImageModal: React.FC<InsertImageModalProps> = ({
  isOpen,
  onClose,
  onInsertImage,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [altText, setAltText] = useState('Figure 1');
  const [caption, setCaption] = useState('');
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewSrc(result);
        if (!caption) setCaption(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsert = () => {
    const src = tab === 'upload' ? previewSrc : imageUrl.trim();
    if (!src) return;

    const alt = altText.trim() || 'image';
    let md = `\n\n![${alt}](${src})`;
    if (caption.trim()) {
      md += `\n*${caption.trim()}*\n\n`;
    } else {
      md += '\n\n';
    }

    onInsertImage(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <ImageIcon className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Insert Picture / Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch: Upload vs URL */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setTab('upload')}
            className={`flex-1 py-1.5 rounded-md text-center transition ${
              tab === 'upload'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Upload Computer Image
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex-1 py-1.5 rounded-md text-center transition ${
              tab === 'url'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Image Web URL
          </button>
        </div>

        {tab === 'upload' ? (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Image File
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 dark:file:bg-emerald-950 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={e => {
                setImageUrl(e.target.value);
                setPreviewSrc(e.target.value);
              }}
              placeholder="https://example.com/photo.png"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs"
            />
          </div>
        )}

        {/* Preview */}
        {previewSrc && (
          <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950/40 max-h-36 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewSrc} alt="Preview" className="max-h-32 rounded object-contain" />
          </div>
        )}

        {/* Alt & Caption */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Alt Text
            </label>
            <input
              type="text"
              value={altText}
              onChange={e => setAltText(e.target.value)}
              placeholder="Figure description"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="e.g. Figure 1: Architecture diagram"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
          </div>
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
            disabled={!previewSrc && !imageUrl}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm disabled:opacity-40"
          >
            Insert Image
          </button>
        </div>
      </div>
    </div>
  );
};
