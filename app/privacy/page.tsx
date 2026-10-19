'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { useSession, useSavedDocsList, logoutAccount } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import { ShieldCheck, Lock, EyeOff, Server, Database, Check } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();
  const isAr = language === 'ar';

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

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isAr ? 'حماية البيانات والخصوصية' : 'Data Privacy First'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {isAr ? 'سياسة الخصوصية وأمان المستندات' : 'Privacy Policy & Document Safety'}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              {isAr ? 'آخر تحديث: أكتوبر 2026' : 'Last updated: October 2026'}
            </p>
          </div>

          {/* Core Privacy Pillar */}
          <div className="p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
            <h2 className="font-bold text-sm text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>{isAr ? 'المبدأ الأساسي: معالجة طرفية داخل متصفحك (Client-Side)' : 'Core Principle: Client-Side Conversion'}</span>
            </h2>
            <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
              {isAr
                ? 'مداد مصمم بنظام معالجة وتصدير محلي. عندما تقوم بلصق نصوص الذكاء الاصطناعي أو تحويلها إلى Word أو PDF، فإن كافة خوارزميات التنسيق وتوليد الملفات تعمل داخل متصفح جهازك مباشرة دون إرسال نصوصك أو أبحاثك إلى أي خادم خارجي.'
                : 'midadd processes and renders document files directly within your browser. Your raw document contents and research drafts are not sent to or stored on external processing servers.'}
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '1. البيانات التي نجمعها' : '1. Information We Collect'}
              </h3>
              <p>
                {isAr
                  ? 'نقوم بجمع الحد الأدنى اللازم لتقديم الخدمة: عنوان بريدك الإلكتروني واسمك عند إنشاء حساب، بالإضافة إلى رصيد التصدير المتاح وسجل العمليات لحسابك.'
                  : 'We collect minimal necessary account information: your email and display name upon registration, credit balances, and basic usage logs.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '2. المستندات والمسودات المحفوظة' : '2. Document Content & Drafts'}
              </h3>
              <p>
                {isAr
                  ? 'المستندات التي تقوم بحفظها في المحرر تُخزن بأمان في التخزين المحلي لمتصفحك (localStorage). يمكنك تصديرها أو حذفها في أي وقت بنقرة واحدة.'
                  : 'Documents saved in the editor reside in your browser local storage. You can delete or export them at any time.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '3. معالجة المدفوعات' : '3. Payment Processing'}
              </h3>
              <p>
                {isAr
                  ? 'تتم عمليات الدفع وشحن الرصيد عبر بوابات دفع آمنة ومشفرة بالكامل (مثل PayPal). نحن لا نطلع على ولا نخزن أي أرقام لبطاقاتك الائتمانية أو بياناتك البنكية الحساسة.'
                  : 'All credit purchases are processed via encrypted gateways like PayPal. We never handle or store your credit card numbers directly.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '4. ملفات تعريف الارتباط (Cookies)' : '4. Cookies & Local Storage'}
              </h3>
              <p>
                {isAr
                  ? 'نستخدم التخزين المحلي لحفظ تفضيلاتك كاللغة المختارة (العربية/الإنجليزية) والوضع الليلي/النهاري، لضمان استمرارية تجربتك السلسة.'
                  : 'Local storage is used to remember your theme and language preferences across sessions.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '5. التواصل والاستفسارات' : '5. Contact Regarding Privacy'}
              </h3>
              <p>
                {isAr
                  ? 'إذا كان لديك أي سؤال حول سياسة الخصوصية أو ترغب في حذف حسابك وبياناتك بالكامل، يمكنك التواصل معنا عبر صفحة '
                  : 'If you have any questions or wish to remove your account, please reach out via our '}
                <Link href="/contact" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  {isAr ? 'تواصل معنا' : 'Contact page'}
                </Link>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
