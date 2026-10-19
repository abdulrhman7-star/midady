import type { Metadata, Viewport } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import { AppProviders } from '@/components/AppProviders';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export const metadata: Metadata = {
  title: 'مداد | midadd — AI Markdown to DOCX, PDF & Google Docs',
  description:
    'حوّل نصوص Markdown من ChatGPT وClaude وGemini إلى مستندات Word وPDF وGoogle Docs منسقة مع الحفاظ على المعادلات الرياضية LaTeX والجداول والأكواد البرمجية.',
  openGraph: {
    title: 'مداد | midadd — AI Markdown to DOCX, PDF & Google Docs',
    description:
      'حوّل نصوص الذكاء الاصطناعي إلى مستندات Word وPDF احترافية مع دعم كامل للغة العربية والمعادلات الرياضية.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مداد | midadd — AI Markdown to DOCX, PDF & Google Docs',
    description:
      'حوّل نصوص الذكاء الاصطناعي إلى مستندات Word وPDF احترافية مع دعم كامل للغة العربية والمعادلات الرياضية.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-600"
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
