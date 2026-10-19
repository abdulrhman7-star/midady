'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { useSession, useSavedDocsList, logoutAccount } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import confetti from 'canvas-confetti';
import {
  Mail,
  MessageSquare,
  Send,
  Check,
  HelpCircle,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function ContactPage() {
  const { language } = useLanguage();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();
  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('support');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    }, 800);
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

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold mb-3">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{isAr ? 'فريق الدعم الفني لمداد' : 'midadd Support Team'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {isAr ? 'نحن هنا لمساعدتك والإجابة عن استفساراتك' : 'Get in Touch with Us'}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {isAr
              ? 'هل لديك اقتراح لتطوير المحرر، استفسار عن خطط الدفع، أو ترغب في شراكة أكاديمية؟ تواصل معنا وسيجيبك فريقنا في غضون 24 ساعة.'
              : 'Have a feature request, question about export formatting, or partnership proposal? Reach out and we will respond promptly.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Quick Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Mail className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {isAr ? 'البريد الإلكتروني المباشر' : 'Direct Email Support'}
              </h3>
              <p className="text-xs text-slate-500 mb-2">
                {isAr ? 'للاستفسارات والملاحظات التقنية' : 'For technical and general inquiries'}
              </p>
              <a
                href="mailto:support@midadd.com"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                support@midadd.com
              </a>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {isAr ? 'سرعة الاستجابة' : 'Response Time'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isAr
                  ? 'يقوم فريق الدعم بمراجعة كافة الرسائل والرد في غضون 24 ساعة كحد أقصى على مدار أيام الأسبوع.'
                  : 'We respond to inquiries within 24 hours on business days.'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                {isAr ? 'إجابات فورية' : 'Instant Answers'}
              </h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                {isAr
                  ? 'تفقد صفحة الأسعار والأسئلة الشائعة للحصول على إجابات فورية.'
                  : 'Check our FAQ section on the pricing page for instant help.'}
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
              >
                <span>{isAr ? 'عرض الأسئلة الشائعة' : 'Browse FAQ'}</span>
                <ExternalLink className="h-3 w-3 rtl:rotate-180" />
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4 animate-fadeIn">
                  <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                    <Check className="h-8 w-8 stroke-[3]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {isAr ? 'تم استلام رسالتك بنجاح!' : 'Message Received!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    {isAr
                      ? `شكراً لتواصلك معنا يا ${name}. سنقوم بالرد على بريدك الإلكتروني (${email}) في أقرب وقت ممكن.`
                      : `Thank you for reaching out, ${name}. We will review your message and reply to ${email} soon.`}
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setMessage('');
                      setSubject('');
                    }}
                    className="mt-4 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {isAr ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isAr ? 'الاسم الكامل *' : 'Your Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder={isAr ? 'أحمد محمد' : 'John Doe'}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        {isAr ? 'البريد الإلكتروني *' : 'Email Address *'}
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
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isAr ? 'نوع الاستفسار' : 'Inquiry Category'}
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="support">{isAr ? 'دعم فني ومشاكل التصدير' : 'Technical & Export Support'}</option>
                      <option value="credits">{isAr ? 'استفسار عن الرصيد والدفع' : 'Credits & Billing Inquiry'}</option>
                      <option value="feature">{isAr ? 'اقتراح ميزة جديدة أو قالب' : 'Feature or Template Request'}</option>
                      <option value="business">{isAr ? 'تعاون تجاري أو أكاديمي' : 'Partnership & Universities'}</option>
                      <option value="other">{isAr ? 'استفسار عام آخر' : 'Other'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isAr ? 'عنوان الرسالة' : 'Subject'}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder={isAr ? 'استفسار بخصوص تصدير معادلات LaTeX' : 'Question regarding LaTeX export'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {isAr ? 'الرسالة والتفاصيل *' : 'Message Details *'}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={isAr ? 'اكتب استفسارك بالتفصيل وسنسعد بمساعدتك...' : 'Write your inquiry here...'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{isAr ? 'جارٍ الإرسال...' : 'Sending...'}</span>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{isAr ? 'إرسال الرسالة الآن' : 'Send Message'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
