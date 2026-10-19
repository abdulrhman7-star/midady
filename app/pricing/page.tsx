'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { useSession, useSavedDocsList, logoutAccount, addCredits } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import confetti from 'canvas-confetti';
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  HelpCircle,
  Coins,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
} from 'lucide-react';

export default function PricingPage() {
  const { language } = useLanguage();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();
  const isAr = language === 'ar';

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: isAr ? 'الخطة المجانية (Free)' : 'Free Plan',
      badge: isAr ? 'البداية السريعة' : 'Quick Start',
      price: '$0',
      period: isAr ? 'للأبد' : 'Forever',
      credits: 50,
      description: isAr
        ? 'مثالية للتجربة وإنجاز المستندات اليومية البسيطة.'
        : 'Perfect for trying the editor and creating standard documents.',
      popular: false,
      features: [
        isAr ? '50 رصيد تصدير شهرياً' : '50 Export Credits / month',
        isAr ? 'محرر مستندات كامل الميزات (Word-Ribbon)' : 'Full Word-Ribbon Document Editor',
        isAr ? 'تصدير DOCX و PDF و Google Docs' : 'Export to DOCX, PDF & Google Docs',
        isAr ? 'معادلات LaTeX والجداول والأكواد' : 'LaTeX Math Equations & Tables',
        isAr ? 'حفظ المستندات محلياً على جهازك' : 'Local Document Storage on Device',
      ],
      buttonText: isAr ? 'الخطة الحالية المفعّلة' : 'Current Active Plan',
      isCurrent: true,
    },
    {
      id: '100',
      name: isAr ? 'باقة 100 رصيد' : '100 Credits',
      badge: isAr ? 'الأكثر شعبية' : 'Most Popular',
      price: '$2.99',
      period: isAr ? 'دفعة واحدة' : 'One-time',
      credits: 100,
      description: isAr
        ? 'الخيار المفضل للطلاب والباحثين لإنجاز مشاريع كاملة.'
        : 'The favorite choice for students and researchers for full projects.',
      popular: true,
      features: [
        isAr ? '100 رصيد تصدير إضافي' : '100 Extra Export Credits',
        isAr ? 'رصيد دائم لا تنتهي صلاحيته' : 'Credits never expire',
        isAr ? 'معادلات LaTeX بصيغة OMML الأصلية' : 'Native OMML Word Math Equations',
        isAr ? 'تصدير متقدم مع صفحات غلاف' : 'Cover Pages & Custom Margins',
        isAr ? 'دعم كامل للغة العربية RTL' : 'Full Arabic RTL Support',
      ],
      buttonText: isAr ? 'شراء 100 رصيد بـ 2.99$' : 'Buy 100 Credits ($2.99)',
      isCurrent: false,
    },
    {
      id: '500',
      name: isAr ? 'باقة 500 رصيد' : '500 Credits',
      badge: isAr ? 'توفير 45%' : 'Save 45%',
      price: '$7.99',
      period: isAr ? 'دفعة واحدة' : 'One-time',
      credits: 500,
      description: isAr
        ? 'قيمة ممتازة للأكاديميين وفرق العمل وكتاب المحتوى.'
        : 'Superb value for academic writers and content creators.',
      popular: false,
      features: [
        isAr ? '500 رصيد تصدير فوري' : '500 Instant Export Credits',
        isAr ? 'توفير 45% مقارنة بالباقات الأساسية' : '45% discount vs standard rate',
        isAr ? 'معالجة سريعة وأولوية تصدير' : 'Priority Export Pipeline',
        isAr ? 'كافة ميزات التنسيق والألوان' : 'All Advanced Word Formatting',
        isAr ? 'دعم فني عبر البريد الإلكتروني' : 'Priority Email Support',
      ],
      buttonText: isAr ? 'شراء 500 رصيد بـ 7.99$' : 'Buy 500 Credits ($7.99)',
      isCurrent: false,
    },
    {
      id: '2000',
      name: isAr ? 'باقة 2,000 رصيد' : '2,000 Credits',
      badge: isAr ? 'أفضل قيمة' : 'Best Value',
      price: '$19.99',
      period: isAr ? 'دفعة واحدة' : 'One-time',
      credits: 2000,
      description: isAr
        ? 'الحل الشامل للمؤسسات والشركات والمكاتب الاستشارية.'
        : 'Enterprise & consulting tier for bulk document generation.',
      popular: false,
      features: [
        isAr ? '2,000 رصيد تصدير ضخم' : '2,000 Heavy Volume Credits',
        isAr ? 'أعلى خصم وتوفير' : 'Maximum savings rate',
        isAr ? 'صلاحية غير محدودة مدى الحياة' : 'Lifetime validity',
        isAr ? 'تصدير جماعي للقوالب الجاهزة' : 'Unlimited Ready Templates',
        isAr ? 'تخصيص كامل للهوامش والعلامات المائية' : 'Full Custom Watermarks & Margins',
      ],
      buttonText: isAr ? 'شراء 2,000 رصيد بـ 19.99$' : 'Buy 2,000 Credits ($19.99)',
      isCurrent: false,
    },
  ];

  const faqs = [
    {
      q: isAr ? 'كيف أحوّل نص ChatGPT أو Claude إلى مستند Word؟' : 'How do I convert ChatGPT text to a Word document?',
      a: isAr
        ? 'بكل بساطة: انسخ مخرجات الذكاء الاصطناعي، ثم الصقها في محرر مداد بالضغط على زر "إدراج محتوى الذكاء الاصطناعي" أو اختصار (Ctrl+K). سيقوم المحرر فورياً بتنسيق العناوين والجداول والمعادلات الرياضية، ثم اضغط "تصدير Word (DOCX)".'
        : 'Simply copy the output from ChatGPT, paste it into the editor using the Red Action button or Ctrl+K shortcut, and click "Export DOCX". All math, tables, and headings are converted automatically.',
    },
    {
      q: isAr ? 'هل يدعم مداد اللغة العربية واتجاه اليمين لليسار (RTL)؟' : 'Does midadd support Arabic and RTL alignment?',
      a: isAr
        ? 'نعم، مداد مصمم بالكامل ليدعم اللغة العربية كدرجة أولى، بما يشمل اتجاه الكتابة من اليمين إلى اليسار (RTL)، والخطوط العربية الشهيرة (Cairo, Amiri, Traditional Arabic)، وتنسيق الجداول العربية.'
        : 'Yes, midadd provides native first-class Arabic RTL support, curated Arabic typography, and proper right-to-left table and heading alignment.',
    },
    {
      q: isAr ? 'كيف يتم التعامل مع معادلات LaTeX الرياضية؟' : 'How are LaTeX math equations handled in Word?',
      a: isAr
        ? 'على عكس الأدوات الأخرى التي تحول المعادلات إلى صور نقطية ثابتة، يحول مداد صيغ LaTeX ($...$ و $$...$$) مباشرة إلى صيغة OMML الأصلية في مايكروسوفت وورد، مما يجعل المعادلات قابلة للتعديل بالكامل داخل برنامج Word كمعادلة أصلية.'
        : 'Unlike tools that generate static images, midadd transforms LaTeX syntax into native Microsoft Word OMML equations, allowing them to remain completely editable inside Word.',
    },
    {
      q: isAr ? 'هل بياناتي ومستنداتي آمنة وسرية؟' : 'Is my document data secure and private?',
      a: isAr
        ? 'نعم بنسبة 100%. تتم كافة عمليات المعالجة والتنسيق والتصدير داخل متصفحك مباشرة (Client-Side) بدون تخزين أو رفع نصوصك على أي خوادم طرف ثالث، مما يحمي خصوصيتك وأبحاثك وسرية بياناتك.'
        : '100% yes. All document formatting and DOCX parsing execute directly in your browser. No sensitive document text is stored on external servers.',
    },
    {
      q: isAr ? 'ما هي وسيلة الدفع المدعومة لشحن الرصيد؟' : 'What payment methods are supported?',
      a: isAr
        ? 'ندعم الدفع الآمن والمشفر بالكامل عبر PayPal والبطاقات الائتمانية والبنكية (Visa, MasterCard, Mada). يتم تفعيل الرصيد تلقائياً في حسابك فور إتمام العملية.'
        : 'We support secure encrypted payments via PayPal and major credit/debit cards. Credits are credited instantly to your account upon completion.',
    },
  ];

  const handleSimulatePurchase = (plan: typeof plans[0]) => {
    if (plan.id === 'free') {
      return;
    }

    addCredits(plan.credits);
    setPurchasedPlan(plan.name);

    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
      });
    } catch {}

    setTimeout(() => {
      setPurchasedPlan(null);
    }, 4000);
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

      {/* Hero Section */}
      <section className="py-12 sm:py-16 text-center max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold mb-4">
          <Coins className="h-3.5 w-3.5 text-amber-600" />
          <span>{isAr ? 'نظام أرصدة مرن واقتصادي' : 'Flexible Credit System'}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          {isAr ? 'خطط أسعار تناسب ' : 'Transparent Pricing for '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            {isAr ? 'الجميع دون اشتراكات معقدة' : 'Students & Professionals'}
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'ابدأ مجاناً بـ 50 رصيد، أو اشحن رصيداً إضافياً لمرة واحدة دون أي التزامات شهرية أو تجديد تلقائي مخفي. رصيدك لا تنتهي صلاحيته.'
            : 'Start free with 50 credits, or top up once without recurring lock-ins. Credits never expire and give you instant access to full document export powers.'}
        </p>

        {purchasedPlan && (
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-bold flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="h-5 w-5 text-emerald-600" />
            <span>
              {isAr
                ? `🎉 تم تفعيل ${purchasedPlan} وشحن الرصيد في حسابك بنجاح!`
                : `🎉 ${purchasedPlan} activated successfully!`}
            </span>
          </div>
        )}
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-200 ${
                plan.popular
                  ? 'bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 shadow-xl lg:-translate-y-2'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                {!plan.popular && plan.badge && (
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mb-3">
                    {plan.badge}
                  </span>
                )}

                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white mb-2">
                  {plan.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[36px]">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    / {plan.period}
                  </span>
                </div>

                <div className="space-y-2.5 mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => handleSimulatePurchase(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.isCurrent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-default'
                      : plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 active:scale-95'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95'
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  {!plan.isCurrent && <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isAr ? 'كل ما تحتاج معرفته عن مداد ونظام الرصيد والتصدير' : 'Everything you need to know about midadd'}
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4.5 text-start flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-indigo-600 shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4.5 pb-4.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 animate-slideDown">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
