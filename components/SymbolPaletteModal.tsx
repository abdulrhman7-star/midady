'use client';

import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface SymbolPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSymbol: (symbol: string) => void;
}

const SYMBOL_CATEGORIES = [
  {
    name: 'Common Math',
    symbols: ['±', '×', '÷', '≠', '≈', '≤', '≥', '∞', '∑', '∏', '√', '∫', '∂', '∇', '∆', '∈', '∉', '⊂', '⊆', '∩', '∪', '∴', '∵', '‰'],
  },
  {
    name: 'Greek Letters',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω'],
  },
  {
    name: 'Arrows & Geometry',
    symbols: ['←', '↑', '→', '↓', '↔', '↕', '⇒', '⇐', '⇔', '⇑', '⇓', '∠', '°', '⊥', '∥', '■', '□', '▲', '△', '▼', '▽', '◆', '◇', '○', '●'],
  },
  {
    name: 'Currency & Legal',
    symbols: ['SAR', '﷼', '$', '€', '£', '¥', '₹', '₽', '₩', '¢', '©', '®', '™', '§', '¶', '†', '‡', '•', '·', '…', '«', '»', '“', '”'],
  },
];

export const SymbolPaletteModal: React.FC<SymbolPaletteModalProps> = ({
  isOpen,
  onClose,
  onInsertSymbol,
}) => {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <span className="font-mono font-bold text-base text-purple-600">Ω</span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Special Symbols & Characters
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Categories */}
        <div className="flex space-x-1.5 rtl:space-x-reverse overflow-x-auto pb-1 text-xs font-semibold">
          {SYMBOL_CATEGORIES.map((cat, idx) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(idx)}
              className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeCategory === idx
                  ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Symbol Grid */}
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 max-h-52 overflow-y-auto">
          {SYMBOL_CATEGORIES[activeCategory].symbols.map(sym => (
            <button
              key={sym}
              onClick={() => {
                onInsertSymbol(sym);
                onClose();
              }}
              className="h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-100 font-serif text-lg font-medium flex items-center justify-center transition shadow-2xs hover:scale-105"
              title={`Insert ${sym}`}
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
