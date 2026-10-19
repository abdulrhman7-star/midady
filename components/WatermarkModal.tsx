'use client';

import React, { useState } from 'react';
import { X, Stamp, Check } from 'lucide-react';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  watermark: string;
  onSetWatermark: (watermark: string) => void;
}

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  onClose,
  watermark,
  onSetWatermark,
}) => {
  const [selectedWatermark, setSelectedWatermark] = useState(watermark);
  const [customText, setCustomText] = useState(watermark);

  if (!isOpen) return null;

  const presets = ['DRAFT', 'CONFIDENTIAL', 'SAMPLE', 'DO NOT COPY', 'URGENT'];

  const handleApply = () => {
    onSetWatermark(selectedWatermark);
    onClose();
  };

  const handleRemove = () => {
    onSetWatermark('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Stamp className="h-5 w-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Document Watermark
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preset Watermark options */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Preset Watermarks
          </label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setSelectedWatermark(preset);
                  setCustomText(preset);
                }}
                className={`p-2 rounded-lg text-xs font-bold border transition text-center ${
                  selectedWatermark === preset
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom text */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Custom Watermark Text
          </label>
          <input
            type="text"
            value={customText}
            onChange={e => {
              setCustomText(e.target.value);
              setSelectedWatermark(e.target.value);
            }}
            placeholder="e.g. COMPANY NAME"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Preview of watermark badge */}
        {selectedWatermark && (
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 text-center border border-dashed border-amber-300 dark:border-amber-800">
            <span className="text-sm font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-widest rotate-[-12deg] inline-block">
              {selectedWatermark}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          >
            Remove Watermark
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm"
            >
              Apply Watermark
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
