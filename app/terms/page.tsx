'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { useSession, useSavedDocsList, logoutAccount } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import { FileCheck, Scale, AlertCircle, Coins, ShieldAlert } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold mb-3">
              <Scale className="h-3.5 w-3.5" />
              <span>{isAr ? 'الاتفاقية القانونية' : 'Legal Terms'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {isAr ? 'شروط وأحكام الاستخدام' : 'Terms of Service'}
            </h1>
            <p className="text-xs text-slate-400 mt-2">
              {isAr ? 'آخر تحديث: أكتوبر 2026' : 'Last updated: October 2026'}
            </p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '1. الموافقة على الشروط' : '1. Acceptance of Terms'}
              </h3>
              <p>
                {isAr
                  ? 'باستخدامك لمنصة مداد (midadd) أو الوصول إلى أي من خدماتها ومحررها وقوالبها، فإنك توافق على الالتزام بهذه الشروط والأحكام وسياسة الخصوصية التابعة لها.'
                  : 'By accessing or using midadd, you agree to be bound by these terms and our privacy policy.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '2. نظام الأرصدة والتصدير' : '2. Credit Balance & Export Usage'}
              </h3>
              <p>
                {isAr
                  ? 'يحصل كل مستخدم جديد على رصيد مجاني دوري. يُخصم رصيد واحد مقابل كل عملية تصدير لمستند بصيغة Word أو PDF. الأرصدة المشتراة ليس لها تاريخ انتهاء صلاحية وتبقى صالحة للاستخدام الدائم.'
                  : 'Users receive free initial credits. Export operations consume credits accordingly. Purchased credits do not expire.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '3. الاستخدام المقبول والمحظورات' : '3. Acceptable Use'}
              </h3>
              <p>
                {isAr
                  ? 'يُحظر استخدام المنصة لأي أغراض غير قانونية، أو محاولة تعطيل الخوادم أو التحايل على نظام الأرصدة والحدود المعمول بها.'
                  : 'You agree not to use midadd for unlawful purposes or attempt to bypass credit mechanisms.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '4. الملكية الفكرية للمستندات' : '4. Intellectual Property of Your Content'}
              </h3>
              <p>
                {isAr
                  ? 'أنت المالك الحصري والكامل لكافة المستندات والأبحاث والنصوص التي تقوم بإنشائها أو تحويلها داخل المنصة. مداد لا يدعي أي حقوق ملكية على المحتوى الذي تنشئه.'
                  : 'You retain full and exclusive copyright and ownership of all content, papers, and files converted through midadd.'}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {isAr ? '5. إخلاء المسؤولية' : '5. Disclaimer & Limitation of Liability'}
              </h3>
              <p>
                {isAr
                  ? 'يتم توفير خدمات المنصة "كما هي" دون ضمانات صريحة أو ضمنية بخلوها التام من الأخطاء التنسيقية الناتجة عن تعقيد صيغ الرياضيات أو الجداول غير المعيارية.'
                  : 'The platform is provided "as is". While we strive for 100% conversion precision, users are encouraged to review final documents.'}
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
