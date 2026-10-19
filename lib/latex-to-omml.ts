import {
  Math as DocxMath,
  MathRun,
  MathFraction,
  MathRadical,
  MathSuperScript,
  MathSubScript,
  MathSubSuperScript,
  MathSum,
  MathIntegral,
  MathRoundBrackets,
  MathComponent,
} from 'docx';
import katex from 'katex';

// Greek letters and math symbols mapping
const LATEX_SYMBOLS: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\delta': 'δ',
  '\\epsilon': 'ε',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\vartheta': 'ϑ',
  '\\iota': 'ι',
  '\\kappa': 'κ',
  '\\lambda': 'λ',
  '\\mu': 'μ',
  '\\nu': 'ν',
  '\\xi': 'ξ',
  '\\pi': 'π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\tau': 'τ',
  '\\upsilon': 'υ',
  '\\phi': 'φ',
  '\\varphi': 'ϕ',
  '\\chi': 'χ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Gamma': 'Γ',
  '\\Delta': 'Δ',
  '\\Theta': 'Θ',
  '\\Lambda': 'Λ',
  '\\Xi': 'Ξ',
  '\\Pi': 'Π',
  '\\Sigma': 'Σ',
  '\\Upsilon': 'Υ',
  '\\Phi': 'Φ',
  '\\Psi': 'Ψ',
  '\\Omega': 'Ω',
  '\\pm': '±',
  '\\mp': '∓',
  '\\times': '×',
  '\\div': '÷',
  '\\cdot': '·',
  '\\ast': '*',
  '\\star': '★',
  '\\circ': '∘',
  '\\bullet': '•',
  '\\leq': '≤',
  '\\le': '≤',
  '\\geq': '≥',
  '\\ge': '≥',
  '\\neq': '≠',
  '\\ne': '≠',
  '\\approx': '≈',
  '\\sim': '~',
  '\\equiv': '≡',
  '\\infty': '∞',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\supset': '⊃',
  '\\subseteq': '⊆',
  '\\supseteq': '⊇',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\forall': '∀',
  '\\exists': '∃',
  '\\nexists': '∄',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\to': '→',
  '\\rightarrow': '→',
  '\\leftarrow': '←',
  '\\Rightarrow': '⇒',
  '\\Leftarrow': '⇐',
  '\\leftrightarrow': '↔',
  '\\Leftrightarrow': '⇔',
  '\\dots': '…',
  '\\cdots': '⋯',
  '\\quad': '  ',
  '\\qquad': '    ',
  '\\,': ' ',
  '\\;': ' ',
  '\\!': '',
};

/**
 * Extracts balanced curly braces content from string starting at index
 */
function extractBracedGroup(str: string, startIndex: number): { content: string; nextIndex: number } | null {
  if (startIndex >= str.length || str[startIndex] !== '{') {
    // If not '{', take single character
    if (startIndex < str.length) {
      if (str[startIndex] === '\\') {
        // take command
        const match = str.slice(startIndex).match(/^\\[a-zA-Z]+/);
        if (match) {
          return { content: match[0], nextIndex: startIndex + match[0].length };
        }
      }
      return { content: str[startIndex], nextIndex: startIndex + 1 };
    }
    return null;
  }

  let depth = 0;
  let start = startIndex + 1;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') {
      depth--;
      if (depth === 0) {
        return { content: str.slice(start, i), nextIndex: i + 1 };
      }
    }
  }
  return { content: str.slice(start), nextIndex: str.length };
}

/**
 * Parses LaTeX string into docx MathComponent elements
 */
export function parseLatexToDocxMathComponents(latex: string): MathComponent[] {
  let cleaned = latex.trim();
  // Strip surrounding $ or $$ or \[ \]
  if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('$') && cleaned.endsWith('$')) {
    cleaned = cleaned.slice(1, -1).trim();
  } else if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
    cleaned = cleaned.slice(2, -2).trim();
  } else if (cleaned.startsWith('\\(') && cleaned.endsWith('\\)')) {
    cleaned = cleaned.slice(2, -2).trim();
  }

  const components: MathComponent[] = [];
  let i = 0;

  while (i < cleaned.length) {
    // Skip whitespace
    if (/\s/.test(cleaned[i])) {
      components.push(new MathRun(' '));
      i++;
      continue;
    }

    // Check fraction \frac{num}{den}
    if (cleaned.startsWith('\\frac', i)) {
      i += 5;
      while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
      const numGroup = extractBracedGroup(cleaned, i);
      if (numGroup) {
        i = numGroup.nextIndex;
        while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
        const denGroup = extractBracedGroup(cleaned, i);
        if (denGroup) {
          i = denGroup.nextIndex;
          components.push(
            new MathFraction({
              numerator: parseLatexToDocxMathComponents(numGroup.content),
              denominator: parseLatexToDocxMathComponents(denGroup.content),
            })
          );
          continue;
        }
      }
    }

    // Check square root \sqrt{arg} or \sqrt[n]{arg}
    if (cleaned.startsWith('\\sqrt', i)) {
      i += 5;
      while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
      // check optional [degree]
      if (cleaned[i] === '[') {
        const closeBracket = cleaned.indexOf(']', i);
        if (closeBracket !== -1) {
          i = closeBracket + 1;
        }
      }
      const argGroup = extractBracedGroup(cleaned, i);
      if (argGroup) {
        i = argGroup.nextIndex;
        components.push(
          new MathRadical({
            children: parseLatexToDocxMathComponents(argGroup.content),
          })
        );
        continue;
      }
    }

    // Check sum \sum_{low}^{high}
    if (cleaned.startsWith('\\sum', i)) {
      i += 4;
      while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
      let subContent = '';
      let supContent = '';

      if (cleaned[i] === '_') {
        i++;
        const g = extractBracedGroup(cleaned, i);
        if (g) {
          subContent = g.content;
          i = g.nextIndex;
        }
      }
      while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
      if (cleaned[i] === '^') {
        i++;
        const g = extractBracedGroup(cleaned, i);
        if (g) {
          supContent = g.content;
          i = g.nextIndex;
        }
      }

      components.push(
        new MathSum({
          children: [new MathRun('∑')],
          subScript: subContent ? parseLatexToDocxMathComponents(subContent) : undefined,
          superScript: supContent ? parseLatexToDocxMathComponents(supContent) : undefined,
        })
      );
      continue;
    }

    // Check integral \int_{a}^{b}
    if (cleaned.startsWith('\\int', i)) {
      i += 4;
      while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
      let subContent = '';
      let supContent = '';

      if (cleaned[i] === '_') {
        i++;
        const g = extractBracedGroup(cleaned, i);
        if (g) {
          subContent = g.content;
          i = g.nextIndex;
        }
      }
      while (i < cleaned.length && /\s/.test(cleaned[i])) i++;
      if (cleaned[i] === '^') {
        i++;
        const g = extractBracedGroup(cleaned, i);
        if (g) {
          supContent = g.content;
          i = g.nextIndex;
        }
      }

      components.push(
        new MathIntegral({
          children: [new MathRun('∫')],
          subScript: subContent ? parseLatexToDocxMathComponents(subContent) : undefined,
          superScript: supContent ? parseLatexToDocxMathComponents(supContent) : undefined,
        })
      );
      continue;
    }

    // Check commands: Greek letters, symbols, functions
    if (cleaned[i] === '\\') {
      const match = cleaned.slice(i).match(/^\\[a-zA-Z,;!]+/);
      if (match) {
        const cmd = match[0];
        i += cmd.length;

        if (LATEX_SYMBOLS[cmd]) {
          components.push(new MathRun(LATEX_SYMBOLS[cmd]));
          continue;
        }

        // Functions like \sin, \cos, \tan, \log, \ln, \lim, \max, \min
        const funcNames = ['\\sin', '\\cos', '\\tan', '\\log', '\\ln', '\\lim', '\\max', '\\min', '\\exp', '\\det'];
        if (funcNames.includes(cmd)) {
          components.push(new MathRun(cmd.slice(1) + ' '));
          continue;
        }

        // Text command \text{...}
        if (cmd === '\\text' || cmd === '\\mathrm' || cmd === '\\mathbf') {
          const g = extractBracedGroup(cleaned, i);
          if (g) {
            i = g.nextIndex;
            components.push(new MathRun(g.content));
            continue;
          }
        }

        // Default: strip backslash and push
        components.push(new MathRun(cmd.replace(/^\\/, '')));
        continue;
      }
    }

    // Check superscripts / subscripts on single token or previous run
    if (cleaned[i] === '^') {
      i++;
      const supGroup = extractBracedGroup(cleaned, i);
      if (supGroup) {
        i = supGroup.nextIndex;
        const lastComponent = components.pop();
        if (lastComponent) {
          components.push(
            new MathSuperScript({
              children: [lastComponent],
              superScript: parseLatexToDocxMathComponents(supGroup.content),
            })
          );
        } else {
          components.push(
            new MathSuperScript({
              children: [new MathRun('')],
              superScript: parseLatexToDocxMathComponents(supGroup.content),
            })
          );
        }
        continue;
      }
    }

    if (cleaned[i] === '_') {
      i++;
      const subGroup = extractBracedGroup(cleaned, i);
      if (subGroup) {
        i = subGroup.nextIndex;
        const lastComponent = components.pop();
        if (lastComponent) {
          // Check if followed by ^
          let supContent = '';
          if (i < cleaned.length && cleaned[i] === '^') {
            i++;
            const supGroup = extractBracedGroup(cleaned, i);
            if (supGroup) {
              supContent = supGroup.content;
              i = supGroup.nextIndex;
            }
          }

          if (supContent) {
            components.push(
              new MathSubSuperScript({
                children: [lastComponent],
                subScript: parseLatexToDocxMathComponents(subGroup.content),
                superScript: parseLatexToDocxMathComponents(supContent),
              })
            );
          } else {
            components.push(
              new MathSubScript({
                children: [lastComponent],
                subScript: parseLatexToDocxMathComponents(subGroup.content),
              })
            );
          }
        } else {
          components.push(
            new MathSubScript({
              children: [new MathRun('')],
              subScript: parseLatexToDocxMathComponents(subGroup.content),
            })
          );
        }
        continue;
      }
    }

    // Check round brackets (a + b)
    if (cleaned[i] === '(') {
      let depth = 0;
      let start = i + 1;
      let found = false;
      for (let j = i; j < cleaned.length; j++) {
        if (cleaned[j] === '(') depth++;
        else if (cleaned[j] === ')') {
          depth--;
          if (depth === 0) {
            const inner = cleaned.slice(start, j);
            components.push(
              new MathRoundBrackets({
                children: parseLatexToDocxMathComponents(inner),
              })
            );
            i = j + 1;
            found = true;
            break;
          }
        }
      }
      if (found) continue;
    }

    // Normal character/operator
    components.push(new MathRun(cleaned[i]));
    i++;
  }

  return components.length > 0 ? components : [new MathRun(cleaned)];
}

/**
 * Creates a native docx Math object from LaTeX
 */
export function createDocxMathFromLatex(latex: string): DocxMath {
  const children = parseLatexToDocxMathComponents(latex);
  return new DocxMath({
    children,
  });
}

/**
 * Renders LaTeX to MathML HTML string via KaTeX
 */
export function latexToMathML(latex: string): string {
  try {
    return katex.renderToString(latex, {
      output: 'mathml',
      throwOnError: false,
    });
  } catch {
    return `<math><mtext>${latex}</mtext></math>`;
  }
}

/**
 * Renders LaTeX to HTML with KaTeX
 */
export function renderLatexHtml(latex: string, displayMode = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
    });
  } catch {
    return `<span class="katex-error font-mono text-red-500">${latex}</span>`;
  }
}
