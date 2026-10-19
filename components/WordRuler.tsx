'use client';

import React from 'react';

interface WordRulerProps {
  margins: 'normal' | 'narrow' | 'wide';
  orientation: 'portrait' | 'landscape';
}

export const WordRuler: React.FC<WordRulerProps> = ({ margins, orientation }) => {
  // Total width units
  const totalInches = orientation === 'landscape' ? 11 : 8.5;
  const marginInch = margins === 'narrow' ? 0.5 : margins === 'wide' ? 1.5 : 1.0;

  const leftMarginPercent = (marginInch / totalInches) * 100;
  const rightMarginPercent = 100 - leftMarginPercent;

  // Generate tick marks
  const ticks = [];
  const tickStep = 0.25; // quarter inch
  const totalTicks = Math.floor(totalInches / tickStep);

  for (let i = 0; i <= totalTicks; i++) {
    const val = i * tickStep;
    const isMajor = Number.isInteger(val);
    const isHalf = val % 1 === 0.5;
    const pos = (val / totalInches) * 100;

    ticks.push(
      <div
        key={i}
        className="absolute top-0 bottom-0 flex flex-col items-center justify-end"
        style={{ left: `${pos}%` }}
      >
        {isMajor && val > 0 && val < totalInches && (
          <span className="text-[9px] font-sans text-slate-500 dark:text-slate-400 -translate-y-2 select-none">
            {val}
          </span>
        )}
        <div
          className={`w-px ${
            isMajor
              ? 'h-3 bg-slate-400 dark:bg-slate-500'
              : isHalf
              ? 'h-2 bg-slate-300 dark:bg-slate-600'
              : 'h-1 bg-slate-200 dark:bg-slate-700'
          }`}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[850px] mx-auto mb-2 px-6 sm:px-12 select-none no-print">
      <div className="relative h-6 bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded shadow-2xs overflow-hidden flex items-end">
        {/* Left margin shaded area */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-slate-200/70 dark:bg-slate-700/60 border-r border-slate-400 dark:border-slate-500"
          style={{ width: `${leftMarginPercent}%` }}
          title={`Left margin: ${marginInch} inch`}
        />

        {/* Right margin shaded area */}
        <div
          className="absolute right-0 top-0 bottom-0 bg-slate-200/70 dark:bg-slate-700/60 border-l border-slate-400 dark:border-slate-500"
          style={{ width: `${leftMarginPercent}%` }}
          title={`Right margin: ${marginInch} inch`}
        />

        {/* Ticks container */}
        <div className="relative w-full h-full">{ticks}</div>

        {/* Margin Indent Markers (triangles) */}
        <div
          className="absolute bottom-0 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-600 dark:border-b-blue-400"
          style={{ left: `${leftMarginPercent}%` }}
        />
        <div
          className="absolute bottom-0 translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-blue-600 dark:border-b-blue-400"
          style={{ right: `${leftMarginPercent}%` }}
        />
      </div>
    </div>
  );
};
