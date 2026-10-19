import { renderLatexHtml } from './latex-to-omml';

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let tableAlignments: string[] = [];

  let inBlockquote = false;
  let blockquoteContent: string[] = [];

  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  const flushList = () => {
    if (inList) {
      htmlParts.push(`</${listType}>`);
      inList = false;
    }
  };

  const flushBlockquote = () => {
    if (inBlockquote) {
      const quoteText = blockquoteContent.join('<br/>');
      htmlParts.push(`<blockquote class="border-l-4 border-indigo-500 pl-4 py-1.5 my-3 italic bg-indigo-50/50 dark:bg-indigo-950/30 rounded-r text-slate-700 dark:text-slate-300">${parseInlineMarkdown(quoteText)}</blockquote>`);
      blockquoteContent = [];
      inBlockquote = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      let tableHtml = '<div class="overflow-x-auto my-4"><table class="editor-table border-collapse w-full border border-slate-300 dark:border-slate-700 text-sm">';
      
      // Header row
      const headers = tableRows[0];
      tableHtml += '<thead><tr class="bg-slate-100 dark:bg-slate-800">';
      headers.forEach((h, idx) => {
        const align = tableAlignments[idx] || 'left';
        tableHtml += `<th class="border border-slate-300 dark:border-slate-700 px-3 py-2 font-semibold text-${align}">${parseInlineMarkdown(h)}</th>`;
      });
      tableHtml += '</tr></thead>';

      // Body rows
      tableHtml += '<tbody>';
      for (let r = 1; r < tableRows.length; r++) {
        const row = tableRows[r];
        const zebra = r % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/50' : 'bg-white dark:bg-slate-950';
        tableHtml += `<tr class="${zebra}">`;
        row.forEach((cell, idx) => {
          const align = tableAlignments[idx] || 'left';
          tableHtml += `<td class="border border-slate-300 dark:border-slate-700 px-3 py-2 text-${align}">${parseInlineMarkdown(cell)}</td>`;
        });
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table></div>';
      htmlParts.push(tableHtml);

      tableRows = [];
      tableAlignments = [];
      inTable = false;
    }
  };

  // Helper to check table row
  const isTableRow = (line: string) => {
    const trimmed = line.trim();
    return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|');
  };

  const isTableSeparator = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|') || !trimmed.endsWith('|')) return false;
    const inner = trimmed.slice(1, -1);
    return /^(\s*:?-+:?\s*\|)*\s*:?-+:?\s*$/.test(inner);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Code block handling
    if (trimmed.startsWith('```')) {
      flushList();
      flushBlockquote();
      flushTable();

      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = trimmed.slice(3).trim() || 'code';
        codeBlockContent = [];
      } else {
        inCodeBlock = false;
        const codeText = escapeHtml(codeBlockContent.join('\n'));
        htmlParts.push(
          `<div class="my-4 rounded-lg border border-slate-800 bg-slate-950 text-slate-100 overflow-hidden shadow-sm">
            <div class="flex items-center justify-between px-4 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span class="font-medium">${codeBlockLang}</span>
              <span>Code Block</span>
            </div>
            <pre class="editor-code-block p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed"><code class="language-${codeBlockLang}">${codeText}</code></pre>
          </div>`
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // 2. Display math $$...$$ on multiple or single line
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) {
      flushList();
      flushBlockquote();
      flushTable();
      const mathFormula = trimmed.slice(2, -2).trim();
      const renderedMath = renderLatexHtml(mathFormula, true);
      htmlParts.push(
        `<div class="katex-display my-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-center overflow-x-auto" data-latex="${escapeHtml(mathFormula)}">${renderedMath}</div>`
      );
      continue;
    }

    // Display math block multiline
    if (trimmed === '$$' || trimmed === '\\[') {
      flushList();
      flushBlockquote();
      flushTable();
      let mathLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '$$' && lines[i].trim() !== '\\]') {
        mathLines.push(lines[i]);
        i++;
      }
      const mathFormula = mathLines.join(' ').trim();
      const renderedMath = renderLatexHtml(mathFormula, true);
      htmlParts.push(
        `<div class="katex-display my-4 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-center overflow-x-auto" data-latex="${escapeHtml(mathFormula)}">${renderedMath}</div>`
      );
      continue;
    }

    // 3. Table handling
    if (isTableRow(line)) {
      flushList();
      flushBlockquote();

      if (isTableSeparator(line)) {
        // Table separator row, parse alignments
        const cols = line.trim().slice(1, -1).split('|');
        tableAlignments = cols.map(c => {
          const t = c.trim();
          if (t.startsWith(':') && t.endsWith(':')) return 'center';
          if (t.endsWith(':')) return 'right';
          return 'left';
        });
      } else {
        inTable = true;
        const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // 4. Blockquotes
    if (trimmed.startsWith('>')) {
      flushList();
      inBlockquote = true;
      blockquoteContent.push(trimmed.replace(/^>\s?/, ''));
      continue;
    } else {
      flushBlockquote();
    }

    // 5. Empty lines
    if (!trimmed) {
      flushList();
      continue;
    }

    // 6. Horizontal Rule
    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      flushList();
      htmlParts.push('<hr class="my-6 border-slate-200 dark:border-slate-800" />');
      continue;
    }

    // 7. Headings
    if (trimmed.startsWith('#')) {
      flushList();
      if (trimmed.startsWith('#### ')) {
        htmlParts.push(`<h4 class="text-base font-semibold mt-4 mb-2 text-slate-800 dark:text-slate-100">${parseInlineMarkdown(trimmed.slice(5))}</h4>`);
      } else if (trimmed.startsWith('### ')) {
        htmlParts.push(`<h3 class="text-lg font-bold mt-5 mb-2 text-slate-900 dark:text-slate-50">${parseInlineMarkdown(trimmed.slice(4))}</h3>`);
      } else if (trimmed.startsWith('## ')) {
        htmlParts.push(`<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900 dark:text-slate-50 pb-1 border-b border-slate-200 dark:border-slate-800">${parseInlineMarkdown(trimmed.slice(3))}</h2>`);
      } else if (trimmed.startsWith('# ')) {
        htmlParts.push(`<h1 class="text-2xl sm:text-3xl font-extrabold mt-6 mb-4 text-slate-900 dark:text-slate-50 tracking-tight">${parseInlineMarkdown(trimmed.slice(2))}</h1>`);
      }
      continue;
    }

    // 8. Lists (Task lists, unordered, ordered)
    // Task list: - [ ] or - [x]
    const taskMatch = line.match(/^(\s*)[-*]\s+\[([ xX])\]\s+(.*)$/);
    if (taskMatch) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
        htmlParts.push('<ul class="my-3 space-y-1.5 list-none pl-1">');
      }
      const checked = taskMatch[2].toLowerCase() === 'x';
      const text = taskMatch[3];
      htmlParts.push(
        `<li class="flex items-center space-x-2 space-x-reverse:false">
          <input type="checkbox" ${checked ? 'checked' : ''} disabled class="h-4 w-4 rounded text-red-600 border-slate-300" />
          <span class="${checked ? 'line-through text-slate-400' : ''}">${parseInlineMarkdown(text)}</span>
        </li>`
      );
      continue;
    }

    // Unordered list: - or *
    const ulMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
        htmlParts.push('<ul class="my-3 space-y-1.5 list-disc pl-6 text-slate-700 dark:text-slate-300">');
      }
      htmlParts.push(`<li>${parseInlineMarkdown(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list: 1.
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
        htmlParts.push('<ol class="my-3 space-y-1.5 list-decimal pl-6 text-slate-700 dark:text-slate-300">');
      }
      htmlParts.push(`<li>${parseInlineMarkdown(olMatch[2])}</li>`);
      continue;
    }

    // Standard Paragraph
    flushList();
    htmlParts.push(`<p class="my-3 leading-relaxed text-slate-700 dark:text-slate-300">${parseInlineMarkdown(line)}</p>`);
  }

  flushList();
  flushBlockquote();
  flushTable();

  return htmlParts.join('\n');
}

/**
 * Parses inline markdown: inline math ($...$), bold, italic, code, links, strikethrough
 */
export function parseInlineMarkdown(text: string): string {
  if (!text) return '';

  let out = text;

  // 1. Inline LaTeX math: $...$ or \(...\)
  out = out.replace(/\$([^\$\n]+)\$/g, (match, formula) => {
    try {
      const rendered = renderLatexHtml(formula.trim(), false);
      return `<span class="katex-inline inline-block px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-serif" data-latex="${escapeHtml(formula.trim())}">${rendered}</span>`;
    } catch {
      return match;
    }
  });

  out = out.replace(/\\\(([^\(\)\n]+)\\\)/g, (match, formula) => {
    try {
      const rendered = renderLatexHtml(formula.trim(), false);
      return `<span class="katex-inline inline-block px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-serif" data-latex="${escapeHtml(formula.trim())}">${rendered}</span>`;
    } catch {
      return match;
    }
  });

  // 2. Inline code: `...`
  out = out.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-red-600 dark:text-red-400 rounded border border-slate-200 dark:border-slate-700">$1</code>');

  // 3. Bold: **text** or __text__
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');

  // 4. Italic: *text* or _text_
  out = out.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  out = out.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // 5. Strikethrough: ~~text~~
  out = out.replace(/~~([^~]+)~~/g, '<del class="line-through text-slate-400">$1</del>');

  // 6. Links: [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline font-medium">$1</a>');

  return out;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Built-in Preset Markdown Templates
 */
export const SAMPLE_MARKDOWN_PRESETS = [
  {
    id: 'scientific',
    titleEn: 'Scientific Paper (LaTeX + Table + Code)',
    titleAr: 'بحث علمي متقدم (معادلات + جداول + كود بايثون)',
    markdown: `# Quantum Harmonic Oscillator & Wave Mechanics

Modern quantum mechanics describes the state of a particle using the Schrödinger wave equation. Below is the time-independent formulation:

$$-\\frac{\\hbar^2}{2m} \\frac{d^2\\psi}{dx^2} + V(x)\\psi(x) = E\\psi(x)$$

Where $\\hbar$ represents the reduced Planck constant ($\\hbar = 1.0545718 \\times 10^{-34} \\text{ J}\\cdot\\text{s}$) and $m$ is the particle mass.

### Energy Eigenvalues
For a one-dimensional potential $V(x) = \\frac{1}{2}m\\omega^2 x^2$, the permissible discrete energy levels are:

$$E_n = \\hbar\\omega\\left(n + \\frac{1}{2}\\right), \\quad n = 0, 1, 2, \\dots$$

The ground state wave function is given by:

$$\\psi_0(x) = \\left(\\frac{m\\omega}{\\pi\\hbar}\\right)^{1/4} e^{-\\frac{m\\omega x^2}{2\\hbar}}$$

### Experimental Energy Comparison Table

| Quantum State ($n$) | Theoretical $E_n$ (eV) | Measured $E_{exp}$ (eV) | Relative Error (%) |
| :--- | :---: | :---: | :---: |
| Ground State ($n=0$) | $0.0250$ | $0.0249$ | $-0.40\\%$ |
| First Excited ($n=1$) | $0.0750$ | $0.0752$ | $+0.27\\%$ |
| Second Excited ($n=2$) | $0.1250$ | $0.1248$ | $-0.16\\%$ |
| Third Excited ($n=3$) | $0.1750$ | $0.1754$ | $+0.23\\%$ |

### Numerical Simulation Code (Python)

\`\`\`python
import numpy as np
import scipy.constants as const

def harmonic_energy(n: int, omega: float) -> float:
    """Calculates quantum harmonic oscillator energy level in Joules."""
    hbar = const.hbar
    return hbar * omega * (n + 0.5)

# Calculate first 5 states for omega = 1.0e14 rad/s
omega_val = 1.0e14
energies = [harmonic_energy(n, omega_val) for n in range(5)]
for idx, E in enumerate(energies):
    print(f"E_{idx} = {E * 6.242e18:.4f} eV")
\`\`\`

> **Key Observation:** The zero-point energy $E_0 = \\frac{1}{2}\\hbar\\omega$ is a pure quantum mechanical phenomenon with no classical analog.`,
  },
  {
    id: 'financial',
    titleEn: 'Business & Tax Report (Saudi VAT SAR Table)',
    titleAr: 'تقرير مالي وضريبي (جدول ضريبة القيمة المضافة SAR)',
    markdown: `# Q3 Corporate Revenue & Saudi VAT Compliance Report

**Company Name:** Al-Wafaa Technologies Ltd.  
**Tax Registration Number (VAT):** 300123456700003  
**Currency:** Saudi Riyal (SAR)

This quarterly financial summary complies with standard corporate governance and ZATCA tax invoice filing requirements.

### Revenue Breakdown by Business Unit

| Service Division | Taxable Base (SAR) | VAT Rate (15%) | Total Inclusive (SAR) | Compliance Status |
| :--- | :---: | :---: | :---: | :---: |
| Enterprise Cloud Hosting | 450,000.00 | 67,500.00 | 517,500.00 | Approved |
| ERP Software Implementation | 820,000.00 | 123,000.00 | 943,000.00 | Approved |
| Maintenance & Support SLA | 185,000.00 | 27,750.00 | 212,750.00 | Approved |
| Hardware & Point of Sale | 120,000.00 | 18,000.00 | 138,000.00 | Approved |
| **Total Quarterly Figures** | **1,575,000.00** | **236,250.00** | **1,811,250.00** | **Fully Reconciled** |

### Key Performance Indices
The Net Profit Margin formula applied across all branches:

$$\\text{Net Margin} = \\frac{\\text{Gross Revenue} - \\text{COGS} - \\text{OPEX}}{\\text{Gross Revenue}} \\times 100\\%$$

- **Gross Margin:** $38.4\\%$
- **Operating Margin:** $22.1\\%$
- **Days Sales Outstanding (DSO):** $34.2 \\text{ days}$

> **Audit Recommendation:** Maintain electronic archives of all UBL 2.1 XML invoices and cryptographic stamps for a statutory period of 5 years.`,
  },
  {
    id: 'deeplearning',
    titleEn: 'AI & Neural Networks Architecture',
    titleAr: 'توثيق معمارية الذكاء الاصطناعي وخوارزميات التعلم العميق',
    markdown: `# Transformer Attention Mechanism & Loss Formulation

The core innovation of transformer architecture is the Scaled Dot-Product Attention:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Where $Q, K, V$ denote Query, Key, and Value matrices respectively, and $d_k$ is the dimensionality of queries and keys.

### Multi-Head Attention
Instead of performing a single attention function, Multi-Head Attention projects $Q, K, V$ linearly $h$ times:

$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h)W^O$$

$$\\text{where } \\text{head}_i = \\text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

### Layer Benchmark & Parameter Count

| Model Layer | Input Dim ($d_{in}$) | Output Dim ($d_{out}$) | Parameters | Activation |
| :--- | :---: | :---: | :---: | :---: |
| Embedding Layer | $32,000$ | $4,096$ | $131,072,000$ | Linear |
| Multi-Head Attention | $4,096$ | $4,096$ | $67,108,864$ | Softmax |
| Feed-Forward Layer 1 | $4,096$ | $16,384$ | $67,108,864$ | SwiGLU |
| Feed-Forward Layer 2 | $16,384$ | $4,096$ | $67,108,864$ | Linear |

\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F

class ScaledDotProductAttention(nn.Module):
    def __init__(self, temperature: float):
        super().__init__()
        self.temperature = temperature

    def forward(self, q, k, v, mask=None):
        scores = torch.matmul(q, k.transpose(-2, -1)) / self.temperature
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn = F.softmax(scores, dim=-1)
        return torch.matmul(attn, v), attn
\`\`\`
`,
  }
];
