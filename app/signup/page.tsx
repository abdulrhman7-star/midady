'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { useSession, useSavedDocsList, logoutAccount, convertGuestToFullAccount } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import confetti from 'canvas-confetti';
import {
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function SignupPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();
  const isAr = language === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password || !confirmPassword) {
      setErrorMsg(isAr ? 'الرجاء ملء جميع الحقول المطلوبة.' : 'Please fill all required fields.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg(isAr ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Invalid email format.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg(isAr ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : 'Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const name = email.split('@')[0];
      convertGuestToFullAccount(email, name);

      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      setSuccessMsg(
        isAr
          ? '🎉 تم إنشاء حسابك بنجاح وحصلت على 20 رصيد إضافي! جارٍ التحويل...'
          : '🎉 Account created successfully with 20 bonus credits! Redirecting...'
      );

      setTimeout(() => {
        router.push('/');
      }, 1200);
    }, 700);
  };

  const handleGoogleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      convertGuestToFullAccount('user.google@gmail.com', 'Google User');
      setSuccessMsg(
        isAr
          ? '🎉 تم إنشاء الحساب والمتابعة عبر Google بنجاح!'
          : '🎉 Signed up with Google successfully!'
      );
      setTimeout(() => {
        router.push('/');
      }, 900);
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
              <span>✒️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
              {isAr ? 'إنشاء حساب جديد' : 'Create an Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'أنشئ حسابك الآن واحصل على رصيد إضافي مع حفظ مستنداتك السحابية.'
                : 'Sign up now and receive 20 bonus export credits.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
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

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'كلمة المرور (8 أحرف على الأقل)' : 'Password (min. 8 characters)'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rtl:pr-3.5 rtl:pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rtl:pr-3.5 rtl:pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>{isAr ? 'جارٍ إنشاء الحساب...' : 'Creating account...'}</span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>{isAr ? 'إنشاء الحساب مجاناً' : 'Create Free Account'}</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
            <span>{isAr ? 'أو' : 'OR'}</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition active:scale-95 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C41.9 34.5 44 29.6 44 24c0-1.3-.1-2.3-.4-3.5z" />
            </svg>
            <span>{isAr ? 'المتابعة بحساب Google' : 'Continue with Google'}</span>
          </button>

          {/* Links */}
          <div className="mt-6 text-center space-y-2 text-xs">
            <p className="text-slate-500">
              {isAr ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            </p>
            <p>
              <Link href="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                {isAr ? '← العودة إلى المحرر' : '← Back to Editor'}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
