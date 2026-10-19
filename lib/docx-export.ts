import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  BorderStyle,
  WidthType,
  ShadingType,
  AlignmentType,
  Math as DocxMath,
  PageOrientation,
} from 'docx';
import { parseLatexToDocxMathComponents } from './latex-to-omml';

export interface DocxExportOptions {
  orientation?: 'portrait' | 'landscape';
  margins?: 'normal' | 'narrow' | 'wide';
  fontFamily?: string;
  fontSize?: number;
  headerText?: string;
}

/**
 * Parses markdown into docx elements and triggers browser download
 */
export async function exportToDocx(
  markdown: string,
  filename = 'MassiveMark-Document.docx',
  options?: DocxExportOptions
): Promise<boolean> {
  try {
    const bytes = await markdownToDocxBytes(markdown, options);
    downloadDocxBuffer(bytes, filename);
    return true;
  } catch (err) {
    console.error('Failed to export DOCX:', err);
    throw err;
  }
}

/**
 * Converts markdown text into raw DOCX binary Uint8Array bytes
 */
export async function markdownToDocxBytes(
  markdown: string,
  options?: DocxExportOptions
): Promise<Uint8Array> {
  const doc = generateDocxDocument(markdown, options);
  const blob = await Packer.toBlob(doc);
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Triggers a browser download of any raw DOCX binary buffer
 */
export function downloadDocxBuffer(
  buffer: ArrayBuffer | Uint8Array,
  filename = 'document.docx'
): void {
  const blob = new Blob([buffer as any], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts markdown text into a full docx Document
 */
export function generateDocxDocument(markdown: string, options?: DocxExportOptions): Document {
  const lines = markdown.split('\n');
  const children: (Paragraph | Table)[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let codeLang = '';

  let inTable = false;
  let tableRowsData: string[][] = [];

  const flushCodeBlock = () => {
    if (inCodeBlock) {
      const codeText = codeBlockLines.join('\n');
      // Create code block paragraph with gray/dark shading and monospace font
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: codeText,
              font: 'Consolas',
              size: 19, // 9.5 pt
              color: '1E293B',
            }),
          ],
          shading: {
            fill: 'F1F5F9',
            type: ShadingType.CLEAR,
          },
          border: {
            left: { style: BorderStyle.SINGLE, size: 8, color: '94A3B8' },
            top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' },
          },
          spacing: {
            before: 180,
            after: 180,
            line: 260,
          },
          indent: {
            left: 240,
            right: 240,
          },
        })
      );
      codeBlockLines = [];
      inCodeBlock = false;
    }
  };

  const flushTable = () => {
    if (inTable && tableRowsData.length > 0) {
      const rows: TableRow[] = [];

      tableRowsData.forEach((rowCells, rowIndex) => {
        const isHeader = rowIndex === 0;
        const cells: TableCell[] = rowCells.map(cellText => {
          const inlines = parseInlineDocx(cellText.trim());
          return new TableCell({
            children: [
              new Paragraph({
                children: inlines,
                alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
                spacing: { before: 80, after: 80 },
              }),
            ],
            shading: isHeader
              ? { fill: 'F1F5F9', type: ShadingType.CLEAR }
              : rowIndex % 2 === 0
              ? { fill: 'F8FAFC', type: ShadingType.CLEAR }
              : undefined,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              bottom: { style: BorderStyle.SINGLE, size: isHeader ? 8 : 4, color: isHeader ? '64748B' : 'CBD5E1' },
              left: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
              right: { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' },
            },
            margins: {
              top: 120,
              bottom: 120,
              left: 140,
              right: 140,
            },
          });
        });

        rows.push(
          new TableRow({
            children: cells,
            tableHeader: isHeader,
          })
        );
      });

      children.push(
        new Table({
          rows,
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        })
      );

      // Spacer after table
      children.push(new Paragraph({ spacing: { after: 160 } }));

      tableRowsData = [];
      inTable = false;
    }
  };

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

    // 1. Code block fence
    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushTable();
        inCodeBlock = true;
        codeLang = trimmed.slice(3).trim();
        codeBlockLines = [];
      } else {
        flushCodeBlock();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // 2. Table row
    if (isTableRow(line)) {
      if (isTableSeparator(line)) {
        // Skip markdown separator line |---|---|
        continue;
      }
      inTable = true;
      const cells = line.trim().slice(1, -1).split('|').map(c => c.trim());
      tableRowsData.push(cells);
      continue;
    } else {
      flushTable();
    }

    // 3. Display Math $$...$$
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) {
      const formula = trimmed.slice(2, -2).trim();
      try {
        const mathChildren = parseLatexToDocxMathComponents(formula);
        children.push(
          new Paragraph({
            children: [new DocxMath({ children: mathChildren })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 180 },
          })
        );
      } catch (err) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: formula, italics: true })],
            alignment: AlignmentType.CENTER,
          })
        );
      }
      continue;
    }

    // Multiline $$
    if (trimmed === '$$' || trimmed === '\\[') {
      let mathLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== '$$' && lines[i].trim() !== '\\]') {
        mathLines.push(lines[i]);
        i++;
      }
      const formula = mathLines.join(' ').trim();
      try {
        const mathChildren = parseLatexToDocxMathComponents(formula);
        children.push(
          new Paragraph({
            children: [new DocxMath({ children: mathChildren })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 180, after: 180 },
          })
        );
      } catch {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: formula, italics: true })],
            alignment: AlignmentType.CENTER,
          })
        );
      }
      continue;
    }

    // 4. Empty line
    if (!trimmed) {
      continue;
    }

    // 5. Horizontal rule
    if (/^(---+|\*\*\*+|___+)$/.test(trimmed)) {
      children.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' },
          },
          spacing: { before: 120, after: 120 },
        })
      );
      continue;
    }

    // 6. Blockquote
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s?/, '');
      const inlines = parseInlineDocx(quoteText);
      children.push(
        new Paragraph({
          children: inlines,
          border: {
            left: { style: BorderStyle.SINGLE, size: 24, color: '6366F1' },
          },
          indent: { left: 360 },
          shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
          spacing: { before: 140, after: 140 },
        })
      );
      continue;
    }

    // 7. Headings
    if (trimmed.startsWith('# ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(2),
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 180 },
        })
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(3),
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 140 },
        })
      );
      continue;
    }
    if (trimmed.startsWith('### ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(4),
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 220, after: 100 },
        })
      );
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      children.push(
        new Paragraph({
          text: trimmed.slice(5),
          heading: HeadingLevel.HEADING_4,
          spacing: { before: 180, after: 80 },
        })
      );
      continue;
    }

    // 8. Bullet Lists
    if (/^[-*]\s+/.test(trimmed)) {
      const text = trimmed.replace(/^[-*]\s+/, '');
      const inlines = parseInlineDocx(text);
      children.push(
        new Paragraph({
          children: inlines,
          bullet: { level: 0 },
          spacing: { before: 60, after: 60 },
        })
      );
      continue;
    }

    // 9. Numbered Lists
    const numMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (numMatch) {
      const inlines = parseInlineDocx(numMatch[1]);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: trimmed.match(/^\d+\.\s+/)?.[0] || '1. ', bold: true }),
            ...inlines,
          ],
          indent: { left: 360 },
          spacing: { before: 60, after: 60 },
        })
      );
      continue;
    }

    // 10. Normal Paragraph with inline parsing (Bold, Italic, Math, Code)
    const inlines = parseInlineDocx(line);
    children.push(
      new Paragraph({
        children: inlines,
        spacing: { before: 100, after: 100, line: 276 },
      })
    );
  }

  flushCodeBlock();
  flushTable();

  const marginVal =
    options?.margins === 'narrow' ? 720 : options?.margins === 'wide' ? 2160 : 1440;
  const isLandscape = options?.orientation === 'landscape';
  const fontFamily = options?.fontFamily || 'Segoe UI';
  const fontSize = (options?.fontSize || 11) * 2;

  return new Document({
    styles: {
      default: {
        document: {
          run: {
            font: fontFamily,
            size: fontSize,
            color: '1E293B',
          },
          paragraph: {
            spacing: { line: 276 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginVal,
              right: marginVal,
              bottom: marginVal,
              left: marginVal,
            },
            ...(isLandscape
              ? {
                  size: {
                    orientation: PageOrientation.LANDSCAPE,
                    width: 16838, // A4 Landscape
                    height: 11906,
                  },
                }
              : {
                  size: {
                    orientation: PageOrientation.PORTRAIT,
                    width: 11906, // A4 Portrait
                    height: 16838,
                  },
                }),
          },
        },
        children,
      },
    ],
  });
}

/**
 * Parses inline markdown into docx TextRun and Math components
 */
export function parseInlineDocx(text: string): (TextRun | DocxMath)[] {
  const result: (TextRun | DocxMath)[] = [];
  if (!text) return result;

  // Tokenize regex for inline math $...$, bold **...**, italic *...*, code `...`
  const tokenRegex = /(\$[^$\n]+\$|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  const parts = text.split(tokenRegex);

  for (const part of parts) {
    if (!part) continue;

    // Inline math $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const formula = part.slice(1, -1);
      try {
        const mathChildren = parseLatexToDocxMathComponents(formula);
        result.push(new DocxMath({ children: mathChildren }));
      } catch {
        result.push(new TextRun({ text: formula, italics: true }));
      }
      continue;
    }

    // Bold **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      result.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true,
        })
      );
      continue;
    }

    // Italic *...*
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      result.push(
        new TextRun({
          text: part.slice(1, -1),
          italics: true,
        })
      );
      continue;
    }

    // Inline code `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      result.push(
        new TextRun({
          text: part.slice(1, -1),
          font: 'Consolas',
          size: 19,
          color: 'DC2626',
          shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
        })
      );
      continue;
    }

    // Plain text
    result.push(new TextRun({ text: part }));
  }

  return result;
}
