import mammoth from 'mammoth';

/**
 * Converts HTML into Markdown for the editor
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  // Use DOMParser in the browser
  if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    function nodeToMarkdown(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const childrenText = Array.from(el.childNodes)
        .map(child => nodeToMarkdown(child))
        .join('');

      // Check for LaTeX math elements with data-latex
      const dataLatex = el.getAttribute('data-latex');
      if (dataLatex) {
        if (el.classList.contains('katex-display')) {
          return `\n\n$$\n${dataLatex}\n$$\n\n`;
        }
        return `$${dataLatex}$`;
      }

      switch (tag) {
        case 'h1':
          return `\n\n# ${childrenText.trim()}\n\n`;
        case 'h2':
          return `\n\n## ${childrenText.trim()}\n\n`;
        case 'h3':
          return `\n\n### ${childrenText.trim()}\n\n`;
        case 'h4':
          return `\n\n#### ${childrenText.trim()}\n\n`;
        case 'p':
          return `\n\n${childrenText.trim()}\n\n`;
        case 'strong':
        case 'b':
          return `**${childrenText.trim()}**`;
        case 'em':
        case 'i':
          return `*${childrenText.trim()}*`;
        case 'u':
          return `<u>${childrenText}</u>`;
        case 's':
        case 'del':
        case 'strike':
          return `~~${childrenText.trim()}~~`;
        case 'sub':
          return `<sub>${childrenText}</sub>`;
        case 'sup':
          return `<sup>${childrenText}</sup>`;
        case 'code':
          return `\`${childrenText}\``;
        case 'pre': {
          const codeEl = el.querySelector('code');
          let lang = '';
          if (codeEl) {
            const cls = codeEl.className || '';
            const match = cls.match(/language-([a-zA-Z0-9_-]+)/);
            if (match) lang = match[1];
          }
          const rawCode = (codeEl ? codeEl.textContent : el.textContent) || '';
          return `\n\n\`\`\`${lang}\n${rawCode.trim()}\n\`\`\`\n\n`;
        }
        case 'img': {
          const src = el.getAttribute('src') || '';
          const alt = el.getAttribute('alt') || 'Image';
          return `\n\n![${alt}](${src})\n\n`;
        }
        case 'blockquote':
          return `\n\n> ${childrenText.trim().replace(/\n/g, '\n> ')}\n\n`;
        case 'ul': {
          const items = Array.from(el.children)
            .map(li => `- ${nodeToMarkdown(li).trim()}`)
            .join('\n');
          return `\n\n${items}\n\n`;
        }
        case 'ol': {
          let count = 1;
          const items = Array.from(el.children)
            .map(li => `${count++}. ${nodeToMarkdown(li).trim()}`)
            .join('\n');
          return `\n\n${items}\n\n`;
        }
        case 'li':
          return childrenText.trim();
        case 'table': {
          // Parse table into markdown table
          const rows = Array.from(el.querySelectorAll('tr'));
          if (rows.length === 0) return '';

          const parsedRows: string[][] = [];
          rows.forEach(tr => {
            const cells = Array.from(tr.querySelectorAll('th, td')).map(cell =>
              nodeToMarkdown(cell).replace(/\|/g, '\\|').trim()
            );
            if (cells.length > 0) parsedRows.push(cells);
          });

          if (parsedRows.length === 0) return '';

          const maxCols = Math.max(...parsedRows.map(r => r.length));
          let mdTable = '\n\n|';

          const firstRow = parsedRows[0];
          for (let c = 0; c < maxCols; c++) {
            mdTable += ` ${firstRow[c] || `Header ${c + 1}`} |`;
          }
          mdTable += '\n|';
          for (let c = 0; c < maxCols; c++) {
            mdTable += ' :--- |';
          }

          for (let r = 1; r < parsedRows.length; r++) {
            mdTable += '\n|';
            for (let c = 0; c < maxCols; c++) {
              mdTable += ` ${parsedRows[r][c] || ''} |`;
            }
          }
          mdTable += '\n\n';
          return mdTable;
        }
        case 'hr':
          return '\n\n---\n\n';
        case 'br':
          return '\n';
        case 'a': {
          const href = el.getAttribute('href') || '#';
          return `[${childrenText}](${href})`;
        }
        case 'span': {
          if (el.style && el.style.color) {
            return `<span style="color: ${el.style.color}">${childrenText}</span>`;
          }
          return childrenText;
        }
        case 'mark': {
          if (el.style && el.style.backgroundColor) {
            return `<mark style="background-color: ${el.style.backgroundColor}">${childrenText}</mark>`;
          }
          return `<mark>${childrenText}</mark>`;
        }
        case 'font': {
          const color = el.getAttribute('color');
          if (color) {
            return `<span style="color: ${color}">${childrenText}</span>`;
          }
          return childrenText;
        }
        default:
          return childrenText;
      }
    }

    const md = nodeToMarkdown(doc.body);
    // Clean up excessive blank lines
    return md.replace(/\n{3,}/g, '\n\n').trim();
  }

  // Fallback regex cleaner
  return html
    .replace(/<h1>(.*?)<\/h1>/gi, '\n\n# $1\n\n')
    .replace(/<h2>(.*?)<\/h2>/gi, '\n\n## $1\n\n')
    .replace(/<h3>(.*?)<\/h3>/gi, '\n\n### $1\n\n')
    .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i>(.*?)<\/i>/gi, '*$1*')
    .replace(/<p>(.*?)<\/p>/gi, '\n\n$1\n\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/**
 * Imports a .docx file and returns markdown content + title
 */
export async function importDocxFile(file: File): Promise<{
  title: string;
  markdown: string;
  html: string;
  messages: string[];
}> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });

  const html = result.value;
  const markdown = htmlToMarkdown(html);

  // Extract title from filename (strip .docx)
  const cleanTitle = file.name.replace(/\.docx$/i, '').replace(/[-_]/g, ' ');

  const messages = result.messages.map(m => m.message);

  return {
    title: cleanTitle || 'Imported Document',
    markdown,
    html,
    messages,
  };
}
