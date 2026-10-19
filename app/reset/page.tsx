'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { useSession, useSavedDocsList, logoutAccount } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import {
  KeyRound,
  Mail,
  Send,
  Check,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const { language } = useLanguage();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();
  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg(isAr ? 'الرجاء إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
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

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-all">
          <div className="text-center mb-6">
            <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl mb-3 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <span>🔑</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {isAr ? 'استعادة كلمة المرور' : 'Reset Password'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً لتعيين كلمة مرور جديدة.'
                : 'Enter your registered email address and we will send you a recovery link.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="h-14 w-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                <Check className="h-7 w-7 stroke-[3]" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'تم إرسال رابط الاستعادة!' : 'Recovery Link Sent!'}
              </h3>

              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                {isAr
                  ? `أرسلنا رسالة تأكيد إلى (${email}). تفقد صندوق الوارد أو البريد غير المرغوب فيه (Spam) واتبع التعليمات لتعيين كلمة المرور.`
                  : `We sent instructions to (${email}). Please check your inbox or spam folder.`}
              </p>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition"
                >
                  <span>{isAr ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}</span>
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAr ? 'البريد الإلكتروني المسجل' : 'Registered Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{isAr ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{isAr ? 'إرسال رابط استعادة الحساب' : 'Send Reset Link'}</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs">
                <Link href="/login" className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold">
                  {isAr ? '← تذكرت كلمة المرور؟ تسجيل الدخول' : '← Remember your password? Sign In'}
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
