'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import dynamic from 'next/dynamic';
import { LanguageProvider, useLanguage } from '@/components/LanguageContext';
import { Header } from '@/components/Header';
import { ExportBar } from '@/components/ExportBar';
import { Footer } from '@/components/Footer';
import { InsertContentModal } from '@/components/InsertContentModal';
import { AuthModal } from '@/components/AuthModals';
import { SavedDocumentsDrawer } from '@/components/SavedDocumentsDrawer';
import { exportToDocx } from '@/lib/docx-export';
import { copyForGoogleDocs } from '@/lib/google-docs-copy';
import {
  useSession,
  useSavedDocsList,
  deductCredit,
  convertGuestToFullAccount,
  logoutAccount,
  saveDocument,
  deleteDocument,
} from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import { markdownToHtml } from '@/lib/markdown-to-html';
import { SavedDocument } from '@/types';

// ---------------------------------------------------------------------------
// تحميل المحرر على العميل فقط (ssr: false)
// هذا يمنع @docx-editor.dev/core من العمل على السيرفر ويلغي تحذيرات
// topLevelAwait أثناء next build.
// ---------------------------------------------------------------------------
const Editor = dynamic(
  () => import('@/components/Editor').then(m => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[600px] text-slate-400 text-sm font-semibold">
        Loading editor…
      </div>
    ),
  }
);

type InitialDocData = {
  markdown: string;
  title: string;
};

// المستند يبدأ فاضي تماماً
const EMPTY_DOC: InitialDocData = {
  markdown: '',
  title: 'Untitled Document',
};

function PlaygroundApp() {
  const { t } = useLanguage();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();

  // الحالة الأولية: مستند فاضي دائماً، إلا إذا كان هناك قالب خارجي
  // محفوظ في localStorage (يأتي من صفحة /templates عند اختيار قالب).
  const [initialData] = useState<InitialDocData>(() => {
    // SSR-safe: على السيرفر نرجع المستند الفاضي
    if (typeof window === 'undefined') {
      return EMPTY_DOC;
    }

    try {
      const raw = localStorage.getItem('midaddExternalTemplate');
      if (raw) {
        const parsed = JSON.parse(raw) as {
          markdown?: string;
          title?: string;
        };
        localStorage.removeItem('midaddExternalTemplate');
        return {
          markdown: parsed.markdown ?? '',
          title: parsed.title ?? 'Untitled Document',
        };
      }
    } catch {}

    return EMPTY_DOC;
  });

  const [markdown, setMarkdown] = useState<string>(initialData.markdown);
  const [documentTitle, setDocumentTitle] = useState<string>(initialData.title);
  const [currentDocId, setCurrentDocId] = useState<string | undefined>(undefined);
  const [docxBase64, setDocxBase64] = useState<string | undefined>(undefined);

  // Modals & Drawers
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isOutOfCreditsOpen, setIsOutOfCreditsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // اختصارات لوحة المفاتيح (Ctrl+K / Cmd+K لفتح نافذة الإدراج)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsInsertModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // إدراج محتوى Markdown من النافذة
  const handleInsertMarkdown = (newMd: string, replace: boolean) => {
    if (replace) {
      setMarkdown(newMd);
      const headingMatch = newMd.match(/^#\s+(.+)$/m);
      if (headingMatch && headingMatch[1]) {
        setDocumentTitle(headingMatch[1].trim());
      }
    } else {
      setMarkdown((prev: string) => (prev ? prev + '\n\n' + newMd : newMd));
    }
  };

  // تصدير DOCX مع فحص الأرصدة
  const handleExportDocx = async () => {
    if (session.credits <= 0) {
      setIsOutOfCreditsOpen(true);
      return;
    }

    setIsExporting(true);
    try {
      const filename = `${documentTitle.replace(
        /[^a-zA-Z0-9_\-\u0600-\u06FF]/g,
        '_'
      )}.docx`;
      await exportToDocx(markdown, filename);

      deductCredit();

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch {}
    } catch (err) {
      console.error('Error exporting DOCX:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // تصدير PDF عبر الطباعة
  const handleExportPdf = () => {
    if (session.credits <= 0) {
      setIsOutOfCreditsOpen(true);
      return;
    }

    deductCredit();
    window.print();
  };

  // نسخ إلى Google Docs
  const handleCopyGoogleDocs = async (): Promise<boolean> => {
    return await copyForGoogleDocs(markdown, true);
  };

  // حفظ المستند الحالي
  const handleSaveDoc = () => {
    const html = markdownToHtml(markdown);
    const saved = saveDocument(documentTitle, markdown, html, currentDocId);
    setCurrentDocId(saved.id);
  };

  // تفريغ المستند
  const handleClearDoc = () => {
    if (window.confirm(t.clearConfirm)) {
      setMarkdown('');
      setDocumentTitle('Untitled Document');
      setCurrentDocId(undefined);
      setDocxBase64(undefined);
    }
  };

  // تحميل مستند محفوظ
  const handleSelectSavedDoc = (doc: SavedDocument) => {
    setMarkdown(doc.markdown);
    setDocumentTitle(doc.title);
    setCurrentDocId(doc.id);
    setDocxBase64(doc.docxBase64);
  };

  // حذف مستند محفوظ
  const handleDeleteSavedDoc = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      deleteDocument(id);
      if (currentDocId === id) {
        setCurrentDocId(undefined);
        setDocxBase64(undefined);
      }
    }
  };

  // مستند جديد فاضي
  const handleNewDoc = () => {
    setMarkdown('');
    setDocumentTitle('Untitled Document');
    setCurrentDocId(undefined);
    setDocxBase64(undefined);
  };

  // ترقية الحساب
  const handleRegister = (email: string, name: string) => {
    convertGuestToFullAccount(email, name);
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  // تسجيل الخروج
  const handleLogout = () => {
    logoutAccount();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        session={session}
        savedDocsCount={savedDocs.length}
        onOpenSavedDocs={() => setIsSavedDrawerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      {/* Export Bar */}
      <ExportBar
        onOpenInsertModal={() => setIsInsertModalOpen(true)}
        onExportDocx={handleExportDocx}
        onExportPdf={handleExportPdf}
        onCopyGoogleDocs={handleCopyGoogleDocs}
        onSaveDoc={handleSaveDoc}
        onClearDoc={handleClearDoc}
        isExporting={isExporting}
      />

      {/* Editor Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        <Editor
          markdown={markdown}
          onChangeMarkdown={setMarkdown}
          documentTitle={documentTitle}
          onChangeTitle={setDocumentTitle}
          onOpenInsertModal={() => setIsInsertModalOpen(true)}
          onExportDocx={handleExportDocx}
          onExportPdf={handleExportPdf}
          onCopyGoogleDocs={handleCopyGoogleDocs}
          onSaveDoc={handleSaveDoc}
          onClearDoc={handleClearDoc}
          isExporting={isExporting}
          currentDocId={currentDocId}
          docxBase64={docxBase64}
        />
      </main>

      {/* Insert AI Content Modal (Ctrl+K) */}
      <InsertContentModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        onInsertMarkdown={handleInsertMarkdown}
      />

      {/* Auth / Out of Credits Modal */}
      <AuthModal
        isOpen={isAuthModalOpen || isOutOfCreditsOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setIsOutOfCreditsOpen(false);
        }}
        onRegister={handleRegister}
        isOutOfCredits={isOutOfCreditsOpen}
      />

      {/* Saved Documents Drawer */}
      <SavedDocumentsDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        documents={savedDocs}
        onSelectDoc={handleSelectSavedDoc}
        onDeleteDoc={handleDeleteSavedDoc}
        onExportDocx={(md, title) => exportToDocx(md, `${title}.docx`)}
        onNewDoc={handleNewDoc}
      />

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <PlaygroundApp />
    </LanguageProvider>
  );
}
