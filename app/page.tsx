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
import { SAMPLE_MARKDOWN_PRESETS, markdownToHtml } from '@/lib/markdown-to-html';
import { SavedDocument } from '@/types';

// ---------------------------------------------------------------------------
// Load the Editor strictly on the client. This keeps @docx-editor.dev/core
// (which uses top-level await and DOM APIs) out of the server bundle and
// silences the "topLevelAwait" warnings during `next build`.
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

// Safe fallback used when SAMPLE_MARKDOWN_PRESETS is empty.
// This guarantees the useState initializer never dereferences undefined.
const FALLBACK_DOC: InitialDocData = {
  markdown:
    '# Untitled Document\n\nStart typing or paste your AI-generated markdown here (Ctrl+K).\n',
  title: 'Untitled Document',
};

function PlaygroundApp() {
  const { t } = useLanguage();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();

  // Initial document state (preloaded with rich preset so playground is immediately stunning)
  const defaultPreset = SAMPLE_MARKDOWN_PRESETS[0]; // may be undefined
  const [initialData] = useState<InitialDocData>(() => {
    // SSR-safe default: use the preset if available, otherwise the fallback.
    const safeDefault: InitialDocData = defaultPreset
      ? {
          markdown: defaultPreset.markdown,
          title: defaultPreset.titleEn || FALLBACK_DOC.title,
        }
      : FALLBACK_DOC;

    // localStorage is only available in the browser; guard with typeof check.
    if (typeof window === 'undefined') {
      return safeDefault;
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
          markdown: parsed.markdown || safeDefault.markdown,
          title: parsed.title || safeDefault.title,
        };
      }
    } catch {}
    return safeDefault;
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

  // Global keyboard shortcuts (Ctrl+K or Cmd+K to open insert modal)
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

  // Insert markdown from modal
  const handleInsertMarkdown = (newMd: string, replace: boolean) => {
    if (replace) {
      setMarkdown(newMd);
      // Auto-extract first heading as title
      const headingMatch = newMd.match(/^#\s+(.+)$/m);
      if (headingMatch && headingMatch[1]) {
        setDocumentTitle(headingMatch[1].trim());
      }
    } else {
      setMarkdown((prev: string) => prev + '\n\n' + newMd);
    }
  };

  // Export DOCX with credit check and native equations
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

      // Deduct credit
      deductCredit();

      // Celebrate with confetti
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

  // Export PDF (clean print view)
  const handleExportPdf = () => {
    if (session.credits <= 0) {
      setIsOutOfCreditsOpen(true);
      return;
    }

    deductCredit();
    window.print();
  };

  // Copy for Google Docs
  const handleCopyGoogleDocs = async (): Promise<boolean> => {
    return await copyForGoogleDocs(markdown, true);
  };

  // Save current document
  const handleSaveDoc = () => {
    const html = markdownToHtml(markdown);
    const saved = saveDocument(documentTitle, markdown, html, currentDocId);
    setCurrentDocId(saved.id);
  };

  // Clear document
  const handleClearDoc = () => {
    if (window.confirm(t.clearConfirm)) {
      setMarkdown('');
      setDocumentTitle('Untitled Document');
      setCurrentDocId(undefined);
    }
  };

  // Load saved document into editor
  const handleSelectSavedDoc = (doc: SavedDocument) => {
    setMarkdown(doc.markdown);
    setDocumentTitle(doc.title);
    setCurrentDocId(doc.id);
    setDocxBase64(doc.docxBase64);
  };

  // Delete saved doc
  const handleDeleteSavedDoc = (id: string) => {
    if (window.confirm(t.deleteConfirm)) {
      deleteDocument(id);
      if (currentDocId === id) {
        setCurrentDocId(undefined);
        setDocxBase64(undefined);
      }
    }
  };

  // Create new blank document
  const handleNewDoc = () => {
    setMarkdown('');
    setDocumentTitle('Untitled Document');
    setCurrentDocId(undefined);
    setDocxBase64(undefined);
  };

  // Convert account / Upgrade
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

  // Logout
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

      {/* Export Bar with Red Action Button */}
      <ExportBar
        onOpenInsertModal={() => setIsInsertModalOpen(true)}
        onExportDocx={handleExportDocx}
        onExportPdf={handleExportPdf}
        onCopyGoogleDocs={handleCopyGoogleDocs}
        onSaveDoc={handleSaveDoc}
        onClearDoc={handleClearDoc}
        isExporting={isExporting}
      />

      {/* Main Interactive Editor Canvas */}
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

      {/* User Upgrade & Credit Top-up Modal */}
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

      {/* Comprehensive Site Footer */}
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
