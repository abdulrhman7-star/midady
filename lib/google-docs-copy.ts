import { markdownToHtml } from './markdown-to-html';

/**
 * Prepares rich HTML with inline CSS specifically formatted for Google Docs & MS Word clipboard
 */
export function prepareGoogleDocsHtml(htmlOrMarkdown: string, isMarkdown = false): string {
  const baseHtml = isMarkdown ? markdownToHtml(htmlOrMarkdown) : htmlOrMarkdown;

  // Wrap in a styled container and transform elements into inlined CSS styles
  let formatted = baseHtml
    // Tables
    .replace(
      /<table([^>]*)>/gi,
      '<table style="border-collapse: collapse; width: 100%; margin: 18px 0; border: 1px solid #cbd5e1; font-family: Segoe UI, Roboto, Arial, sans-serif; font-size: 14px;">'
    )
    .replace(
      /<th([^>]*)>/gi,
      '<th style="border: 1px solid #cbd5e1; padding: 10px 14px; background-color: #f1f5f9; font-weight: bold; color: #1e293b; text-align: left;">'
    )
    .replace(
      /<td([^>]*)>/gi,
      '<td style="border: 1px solid #cbd5e1; padding: 9px 14px; color: #334155; text-align: left;">'
    )
    // Code blocks
    .replace(
      /<pre([^>]*)>/gi,
      '<pre style="background-color: #0f172a; color: #f8fafc; padding: 16px; border-radius: 6px; font-family: Consolas, Courier New, monospace; font-size: 13px; line-height: 1.6; margin: 16px 0; overflow-x: auto; border: 1px solid #1e293b;">'
    )
    .replace(
      /<code([^>]*)>/gi,
      '<code style="font-family: Consolas, Courier New, monospace; background-color: #f1f5f9; color: #dc2626; padding: 2px 6px; border-radius: 4px; font-size: 13px; border: 1px solid #e2e8f0;">'
    )
    // Blockquotes
    .replace(
      /<blockquote([^>]*)>/gi,
      '<blockquote style="border-left: 4px solid #6366f1; padding: 8px 16px; margin: 14px 0; background-color: #f8fafc; color: #475569; font-style: italic; font-size: 14px;">'
    )
    // Headings
    .replace(
      /<h1([^>]*)>/gi,
      '<h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin-top: 24px; margin-bottom: 12px; font-family: Segoe UI, Roboto, sans-serif; line-height: 1.3;">'
    )
    .replace(
      /<h2([^>]*)>/gi,
      '<h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 20px; margin-bottom: 10px; font-family: Segoe UI, Roboto, sans-serif; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">'
    )
    .replace(
      /<h3([^>]*)>/gi,
      '<h3 style="font-size: 17px; font-weight: 600; color: #1e293b; margin-top: 16px; margin-bottom: 8px; font-family: Segoe UI, Roboto, sans-serif;">'
    )
    .replace(
      /<h4([^>]*)>/gi,
      '<h4 style="font-size: 15px; font-weight: 600; color: #334155; margin-top: 14px; margin-bottom: 6px; font-family: Segoe UI, Roboto, sans-serif;">'
    )
    // Paragraphs
    .replace(
      /<p([^>]*)>/gi,
      '<p style="margin: 10px 0; line-height: 1.65; color: #334155; font-family: Segoe UI, Roboto, Arial, sans-serif; font-size: 14.5px;">'
    )
    // Lists
    .replace(
      /<ul([^>]*)>/gi,
      '<ul style="margin: 10px 0 10px 24px; padding: 0; list-style-type: disc; color: #334155; font-family: Segoe UI, Roboto, sans-serif;">'
    )
    .replace(
      /<ol([^>]*)>/gi,
      '<ol style="margin: 10px 0 10px 24px; padding: 0; list-style-type: decimal; color: #334155; font-family: Segoe UI, Roboto, sans-serif;">'
    )
    .replace(
      /<li([^>]*)>/gi,
      '<li style="margin: 4px 0; line-height: 1.6; font-size: 14.5px;">'
    )
    // Math display
    .replace(
      /<div class="katex-display([^>]*)>/gi,
      '<div style="text-align: center; margin: 18px 0; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-family: Cambria Math, KaTeX_Main, Times New Roman, serif; font-size: 16px;">'
    );

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body style="font-family: Segoe UI, Roboto, Helvetica, Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.6;">${formatted}</body></html>`;
}

/**
 * Copies formatted rich content to clipboard targeting Google Docs & Word
 */
export async function copyForGoogleDocs(content: string, isMarkdown = true): Promise<boolean> {
  const fullHtml = prepareGoogleDocsHtml(content, isMarkdown);
  const plainText = content.replace(/[#*`~>\[\]]/g, '');

  try {
    if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([fullHtml], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      return true;
    } else {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = plainText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch (err) {
    console.error('Clipboard write failed, trying fallback:', err);
    try {
      const textarea = document.createElement('textarea');
      textarea.value = plainText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}
