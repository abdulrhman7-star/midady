'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import {
  useSession,
  useSavedDocsList,
  logoutAccount,
  deleteDocument,
  convertGuestToFullAccount,
} from '@/lib/guest-session';
import { exportToDocx } from '@/lib/docx-export';
import { useTheme } from '@/lib/theme';
import {
  User,
  ShieldCheck,
  Coins,
  FolderOpen,
  FileText,
  FileDown,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  LogOut,
  Edit2,
  Check,
} from 'lucide-react';

export default function ProfilePage() {
  const { language } = useLanguage();
  const router = useRouter();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();
  const isAr = language === 'ar';

  const [editName, setEditName] = useState(false);
  const [userName, setUserName] = useState(session.name || 'User');
  const [nameSaved, setNameSaved] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    convertGuestToFullAccount(session.email || 'user@midadd.com', userName.trim());
    setEditName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleOpenDoc = (doc: typeof savedDocs[0]) => {
    try {
      localStorage.setItem(
        'midaddExternalTemplate',
        JSON.stringify({
          title: doc.title,
          markdown: doc.markdown,
          source: 'profile_doc',
          timestamp: Date.now(),
        })
      );
    } catch {}
    router.push('/');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) {
      deleteDocument(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header
        session={session}
        savedDocsCount={savedDocs.length}
        onOpenSavedDocs={() => {}}
        onOpenAuthModal={() => {}}
        onLogout={logoutAccount}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 transition-colors">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md shadow-indigo-500/20">
                {(session.name || session.email || 'U')[0].toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  {editName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userName}
                        onChange={e => setUserName(e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-indigo-400 bg-slate-50 dark:bg-slate-950 text-sm font-bold"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <h1 className="text-xl font-black text-slate-900 dark:text-white">
                        {session.name || (isAr ? 'مستخدم زائر' : 'Guest User')}
                      </h1>
                      <button
                        type="button"
                        onClick={() => setEditName(true)}
                        className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                        title="Edit name"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{session.email || (isAr ? 'جلسة محلية آمنة' : 'Local Secure Session')}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{session.isGuest ? (isAr ? 'حساب تجريبي' : 'Guest Tier') : (isAr ? 'حساب دائم' : 'Verified Tier')}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {session.isGuest ? (
                <Link
                  href="/signup"
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition text-center"
                >
                  {isAr ? 'ترقية لحساب دائم' : 'Upgrade Account'}
                </Link>
              ) : (
                <button
                  onClick={logoutAccount}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                  {isAr ? 'رصيد التصدير' : 'Export Credits'}
                </span>
                <Coins className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
                  {session.credits}
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-300">
                  / {session.maxCredits}
                </span>
              </div>
              <Link
                href="/pricing"
                className="mt-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:underline flex items-center gap-1"
              >
                <span>{isAr ? '+ شحن رصيد' : '+ Buy Credits'}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">
                  {isAr ? 'المستندات المحفوظة' : 'Saved Documents'}
                </span>
                <FolderOpen className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-2xl font-black text-indigo-900 dark:text-indigo-100">
                {savedDocs.length}
              </span>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-2">
                {isAr ? 'محفوظة بأمان محلياً' : 'Saved locally on device'}
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                  {isAr ? 'معالجة LaTeX' : 'LaTeX Math'}
                </span>
                <Sparkles className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-bold text-purple-900 dark:text-purple-100">
                OMML Native
              </span>
              <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-2">
                {isAr ? 'تحويل المعادلات لمعادلات Word أصلية' : 'Full native equation conversion'}
              </p>
            </div>
          </div>
        </div>

        {/* Saved Documents Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'مستنداتي المحفوظة' : 'My Saved Documents'}
              </h2>
            </div>
            <Link
              href="/"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>{isAr ? '+ إنشاء مستند جديد' : '+ New Document'}</span>
            </Link>
          </div>

          {savedDocs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                {isAr ? 'لا توجد مستندات محفوظة بعد' : 'No Saved Documents Yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                {isAr
                  ? 'عند كتابة أو استيراد أي محتوى داخل المحرر، اضغط على زر "حفظ" في الشريط العلوي لتتمكن من الوصول إليه وتعديله في أي وقت.'
                  : 'Start typing in the editor and click "Save" to keep your drafts here.'}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
              >
                <span>{isAr ? 'الانتقال إلى المحرر' : 'Open Editor'}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedDocs.map(doc => (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between hover:shadow-md transition group"
                >
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {doc.title || (isAr ? 'مستند بدون عنوان' : 'Untitled Document')}
                      </h3>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-md transition"
                        title={isAr ? 'حذف المستند' : 'Delete'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{doc.markdown.length} {isAr ? 'حرف' : 'chars'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => handleOpenDoc(doc)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition cursor-pointer"
                    >
                      {isAr ? 'فتح وتعديل' : 'Open & Edit'}
                    </button>

                    <button
                      onClick={() => exportToDocx(doc.markdown, `${doc.title}.docx`)}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                      title="Download DOCX"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>DOCX</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
