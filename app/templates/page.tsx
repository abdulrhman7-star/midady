'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useLanguage } from '@/components/LanguageContext';
import { useSession, useSavedDocsList, logoutAccount } from '@/lib/guest-session';
import { useTheme } from '@/lib/theme';
import {
  Search,
  Copy,
  Check,
  FileText,
  ExternalLink,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  TrendingUp,
  Wrench,
  Code2,
  Building,
  Target,
  Calendar,
  FileCheck,
  Monitor,
  Rocket,
  FolderKanban,
  FileUser,
  Palette,
  Mail,
} from 'lucide-react';

interface TemplateItem {
  id: string;
  icon: string;
  category: string;
  name: { ar: string; en: string };
  desc: { ar: string; en: string };
  markdown: { ar: string; en: string };
}

const TEMPLATES_LIST: TemplateItem[] = [
  {
    id: 'graduation',
    icon: '🎓',
    category: 'academic',
    name: { ar: 'مشروع تخرج جامعي', en: 'Graduation Project' },
    desc: {
      ar: 'غلاف → إهداء → شكر → ملخص → فهرس → مقدمة → مشكلة → أهداف → أسئلة → فروض → حدود → دراسات سابقة → منهجية → نتائج → توصيات',
      en: 'Cover → Dedication → Abstract → TOC → Intro → Problem → Objectives → Hypotheses → Literature → Methodology → Results → Recommendations',
    },
    markdown: {
      ar: `# مشروع تخرج جامعي

**العنوان:** [أدخل عنوان المشروع هنا]
**إعداد الطالب:** [اسم الطالب] — الرقم الجامعي: [XXXXXXX]
**إشراف:** الدكتور [اسم المشرف]
**الجامعة:** [اسم الجامعة] — قسم [اسم القسم]
**العام الجامعي:** 2025 / 2026

---

## 1. الإهداء
إلى كل من أنار دربنا بالعلم والمعرفة، وإلى والدينا الكرام الذين لم يدخروا جهداً في دعمنا.

## 2. الشكر والتقدير
نتقدم بخالص الشكر والتقدير إلى أستاذنا المشرف وإلى أعضاء هيئة التدريس في الكلية.

## 3. الملخص
يهدف هذا المشروع إلى دراسة وتطوير نظام متكامل لحل مشكلة [اسم المشكلة]، معتمداً على منهجية علمية رصينة وأحدث التقنيات البرمجية.

## 4. مشكلة البحث وأهميته
- **بيان المشكلة:** تواجه المؤسسات صعوبات في معالجة البيانات بسرعة ودقة.
- **أهمية البحث:** المساهمة في تقليص التكلفة التشغيلية بنسبة 35% وزيادة الكفاءة.

## 5. أهداف المشروع
1. تصميم معمارية برمجية مرنة قابلة للتوسع.
2. تطوير واجهات مستخدم متجاوبة تدعم اللغة العربية.
3. قياس أداء النظام ومقارنته بالحلول القائمة.

## 6. المنهجية والأدوات
- **المنهج المستخدم:** منهج تطوير البرمجيات السريع (Agile Scrum).
- **أدوات التطوير:** React, Next.js, Node.js, PostgreSQL.

## 7. النتائج والتوصيات
- **أهم النتائج:** نجاح الاختبارات الوظيفية بنسبة 98%.
- **التوصيات:** التوسع في إضافة تقنيات الذكاء الاصطناعي في المراحل القادمة.
`,
      en: `# Graduation Project Report

**Project Title:** [Insert Project Title Here]
**Student:** [Student Name] — Student ID: [XXXXXXX]
**Supervisor:** Dr. [Supervisor Name]
**University:** [University Name] — Department of [Department Name]
**Academic Year:** 2025 / 2026

---

## 1. Dedication
Dedicated to our families, professors, and mentors who supported us along this journey.

## 2. Abstract
This project presents the design and implementation of a scalable software system addressing [Domain Problem], achieving high throughput and seamless user experience.

## 3. Problem Statement & Objectives
- **Problem:** Legacy systems suffer from manual bottlenecks and lack of real-time validation.
- **Primary Objectives:** Build an automated end-to-end workflow reducing processing time by 40%.

## 4. Methodology & Architecture
- **Methodology:** Agile Scrum framework.
- **Tech Stack:** TypeScript, Next.js, PostgreSQL, Tailwind CSS.

## 5. Results & Conclusions
The developed solution passed all functional integration tests and demonstrated a 99.4% uptime reliability score.
`,
    },
  },
  {
    id: 'thesis',
    icon: '📑',
    category: 'academic',
    name: { ar: 'رسالة ماجستير / دكتوراه', en: 'Master / PhD Thesis' },
    desc: {
      ar: 'ملخص → مقدمة → مشكلة → أهداف → إطار نظري → دراسات سابقة → منهجية → تحليل البيانات → نتائج → مناقشة ومراجع',
      en: 'Abstract → Intro → Problem → Theoretical Framework → Literature → Methodology → Data Analysis → Discussion → References',
    },
    markdown: {
      ar: `# رسالة علمية (ماجستير / دكتوراه)

**عنوان الأطروحة:** [أدخل عنوان الأطروحة بالكامل]
**إعداد الباحث:** [اسم الباحث]
**المشرف الرئيس:** أ.د. [اسم المشرف]
**كلية:** [اسم الكلية] — جامعة: [اسم الجامعة]

---

## المستخلص الأكاديمي
تناقش هذه الدراسة أثر المتغيرات المستقلة على كفاءة الأداء في القطاع، باستخدام نموذج انحدار خطي متعدد وعينة قوامها 450 مفردة.

## 1. مشكلة الدراسة وأسئلتها
1. ما مدى تأثير الرقمنة على تحسين الإنتاجية؟
2. هل توجد فروق ذات دلالة إحصائية تبعاً لمتغير حجم المنشأة؟

## 2. الإطار النظري والدراسات السابقة
يستند البحث إلى النظرية الهيكلية الحديثة ونتائج دراسات (Smith et al., 2022).

## 3. منهجية البحث وعينة الدراسة
- المنهج الوصفي التحليلي.
- استخدام حزمة SPSS للتحليل الإحصائي واختبار الفرضيات.
`,
      en: `# Master / PhD Dissertation

**Title:** [Full Dissertation Title]
**Researcher:** [Researcher Name]
**Advisor:** Prof. Dr. [Advisor Name]
**Faculty:** [Faculty Name] — [University Name]

---

## Abstract
This study investigates the correlation between modern automation frameworks and organizational efficiency across a sample size of 450 subjects.

## 1. Research Questions & Hypotheses
- **RQ1:** To what extent does digital transformation correlate with reduced operational error?
- **H1:** There is a statistically significant positive effect of automated tooling on productivity.
`,
    },
  },
  {
    id: 'business-plan',
    icon: '💼',
    category: 'business',
    name: { ar: 'خطة عمل تجارية', en: 'Business Plan' },
    desc: {
      ar: 'ملخص تنفيذي → وصف المشروع → تحليل السوق → المنتج/الخدمة → التسويق → التشغيل → المالية → تحليل المخاطر',
      en: 'Executive Summary → Description → Market Analysis → Product/Service → Marketing → Operations → Financials → Risks',
    },
    markdown: {
      ar: `# خطة عمل تجارية (Business Plan)

**اسم المشروع:** [أدخل اسم الشركة / المشروع]
**مؤسس المشروع:** [الاسم]
**التاريخ:** [التاريخ]

---

## 1. الملخص التنفيذي
منصة رقمية رائدة متخصصة في تقديم حلول [المجال] للشركات والأفراد في منطقة الشرق الأوسط وشمال أفريقيا.

## 2. المشكلة والحل المقترح
- **المشكلة:** فقدان التنسيق عند نسخ مخرجات الذكاء الاصطناعي وضياع الوقت في إعادة التنسيق اليدوي.
- **الحل:** محرر مداد الذكي لتحويل المستندات لحظياً إلى صيغ DOCX وPDF مع الحفاظ التام على المعادلات.

## 3. حجم السوق والجمهور المستهدف
- **TAM:** 1.2 مليار دولار إقليمياً.
- **الجمهور المستهدف:** الطلاب والباحثون، مدراء المشاريع، كتاب المحتوى والمهندسون.

## 4. نموذج الإيرادات والأسعار
- خطة مجانية برصيد شهري متجدد.
- باقات رصيد مدفوعة تبدأ من 2.99$ وتصل إلى 19.99$.
`,
      en: `# Business Plan

**Company Name:** [Company Name]
**Founder:** [Founder Name]
**Date:** [Date]

---

## 1. Executive Summary
A modern SaaS platform enabling seamless document conversion and formatting for professionals and students.

## 2. Market Opportunity & Value Proposition
- Market Size (TAM): $1.2B serviceable market in developer and academic productivity.
- Direct revenue model via flexible credits and enterprise volume licenses.
`,
    },
  },
  {
    id: 'feasibility',
    icon: '📊',
    category: 'business',
    name: { ar: 'دراسة جدوى متكاملة', en: 'Feasibility Study' },
    desc: {
      ar: 'ملخص تنفيذي → فكرة المشروع → دراسة السوق → الدراسة الفنية → الدراسة المالية → المخاطر والقرار النهائي',
      en: 'Executive Summary → Market Study → Technical Study → Financial Model → Risk Assessment → Verdict',
    },
    markdown: {
      ar: `# دراسة جدوى اقتصادية وفنية

**اسم المشروع المقترح:** [اسم المشروع]
**إعداد:** [فريق الاستشارات الاقتصادية]

---

## 1. دراسة الجدوى التسويقية
- حجم الطلب المتوقع: 50,000 عملية شهرياً خلال العام الأول.
- المنافسة المباشرة: بدائل محدودة تفتقر للدعم العربي السليم ومعادلات LaTeX الأصلية.

## 2. دراسة الجدوى الفنية والتقنية
- البنية التحتية السحابية: خوادم سريعة بتكلفة قابلة للتوسع التدريجي.
- الكفاءة التشغيلية: استهلاك منخفض للموارد ومعالجة طرفية سريعة.

## 3. دراسة الجدوى المالية
- نقطة التعادل: الشهر الخامس من التشغيل.
- العائد المتوقع على الاستثمار (ROI): 140% خلال 18 شهراً.
`,
      en: `# Project Feasibility Study

**Project Name:** [Project Name]
**Prepared by:** [Author / Team]

---

## 1. Market Feasibility
Demonstrated recurring demand among university students, researchers, and professional agencies.

## 2. Financial Feasibility
- Break-even Point: Month 5.
- Projected ROI: 140% over 18 months.
`,
    },
  },
  {
    id: 'marketing',
    icon: '📣',
    category: 'business',
    name: { ar: 'خطة تسويقية شاملة', en: 'Comprehensive Marketing Plan' },
    desc: {
      ar: 'تحليل الوضع → SWOT → الجمهور → الأهداف → الاستراتيجية → المزيج التسويقي → القنوات والميزانية',
      en: 'Situation Analysis → SWOT → Target Audience → SMART Goals → Marketing Mix (4Ps) → Channels & Budget',
    },
    markdown: {
      ar: `# خطة تسويقية سنوية

## 1. تحليل SWOT
- **نقاط القوة (Strengths):** سرعة فائقة، دعم كامل للغة العربية والـ LaTeX.
- **نقاط الضعف (Weaknesses):** علامة تجارية جديدة تتطلب زيادة الوعي.
- **الفرص (Opportunities):** التوسع الهائل في أدوات الذكاء الاصطناعي (ChatGPT, Gemini).
- **التهديدات (Threats):** ظهور أدوات مجانية مدعومة من شركات كبرى.

## 2. أهداف الخطة التسويقية (SMART)
- استقطاب 100,000 مستخدم نشط خلال 6 أشهر.
- خفض تكلفة اكتساب العميل (CAC) إلى أقل من 0.40$.
`,
      en: `# Marketing Plan & Growth Strategy

## 1. SWOT Analysis
- **Strengths:** Fast client-side conversion, native Arabic RTL support, OMML equation output.
- **Opportunities:** Surging user adoption of generative AI tools requiring export tools.

## 2. Acquisition Channels
- Organic SEO and technical tutorial content.
- University developer ambassadors.
`,
    },
  },
  {
    id: 'performance',
    icon: '📈',
    category: 'reports',
    name: { ar: 'تقرير أداء شهري / ربع سنوي', en: 'Performance Review Report' },
    desc: {
      ar: 'ملخص تنفيذي → مؤشرات KPIs → الإنجازات المحققة → المعوقات والحلول → التحليل المالي والتوصيات',
      en: 'Executive Summary → KPIs → Milestones → Blockers & Solutions → Financial Summary → Next Steps',
    },
    markdown: {
      ar: `# تقرير الأداء الربع سنوي (Q1 Performance Report)

## 1. الملخص التنفيذي
حقق الفريق نمواً بنسبة 42% في عدد العمليات المنجزة مع الحفاظ على رضا المستخدمين بنسبة 96%.

## 2. لوحة مؤشرات الأداء (KPIs)
| المؤشر | المستهدف | المحقق | نسبة الإنجاز |
| :--- | :--- | :--- | :--- |
| عدد المستندات المصدّرة | 25,000 | 28,400 | 113% |
| وقت معالجة المستند | < 1.5s | 0.9s | ممتاز |
| معدل التحويل للمدفوع | 4.0% | 4.8% | 120% |
`,
      en: `# Quarterly Performance Report

## 1. Executive Summary
The team achieved a 42% quarter-over-quarter expansion in active document exports with 96% positive CSAT.

## 2. Key Performance Indicators
| Metric | Target | Actual | Attainment |
| :--- | :--- | :--- | :--- |
| Documents Converted | 25,000 | 28,400 | 113% |
| Average Latency | < 1.5s | 0.9s | Optimal |
`,
    },
  },
  {
    id: 'engineering',
    icon: '🏗️',
    category: 'engineering',
    name: { ar: 'مقترح مشروع هندسي', en: 'Engineering Project Proposal' },
    desc: {
      ar: 'عنوان → خلفية → مشكلة → أهداف → نطاق → متطلبات فنية → جدول زمني وميزانية → معايير القبول',
      en: 'Background → Problem → Scope → Technical Specs → Gantt Chart & Milestones → Quality Acceptance',
    },
    markdown: {
      ar: `# مقترح مشروع هندسي فني

**اسم المشروع:** [مشروع هندسة وتطوير الأنظمة]
**الجهة المنفذة:** [الشركة الهندسية]

---

## 1. نطاق العمل الهندسي (Scope of Work)
يشمل المشروع تصميم واختبار البنية التحتية، وتنفيذ منظومة فحص الجودة طبقاً لمعايير ISO 9001.

## 2. المتطلبات والمواصفات الفنية
- الالتزام بالكود الهندسي المعتمد.
- ضمان عدم تجاوز نسبة الخطأ المسموح بها عن 0.02%.
`,
      en: `# Engineering Project Proposal

**Project Title:** [Engineering Infrastructure Upgrade]
**Engineering Lead:** [Lead Engineer]

---

## 1. Engineering Scope & Requirements
Covers system architecture, high-availability load testing, and compliance with ISO-9001 quality specifications.
`,
    },
  },
  {
    id: 'software',
    icon: '💻',
    category: 'tech',
    name: { ar: 'مشروع برمجي / تطبيق ذكي', en: 'Software Architecture & App Spec' },
    desc: {
      ar: 'الرؤية → المتطلبات الوظيفية وغير الوظيفية → المعمارية والتقنيات → خطة التطوير والاختبار والنشر',
      en: 'Vision → Functional & Non-Functional Specs → System Architecture → Testing Plan → DevOps CI/CD',
    },
    markdown: {
      ar: `# وثيقة متطلبات البرمجيات (Software Requirements Specification - SRS)

## 1. المتطلبات الوظيفية (Functional Requirements)
1. **استيراد الـ Markdown:** دعم الروابط المشتركة ونسخ الحافظة المباشر.
2. **محول المعادلات:** تحويل صيغ KaTeX إلى OMML وMathML متوافقة مع Microsoft Word.
3. **التصدير الفوري:** توليد حزم docx ثنائية مباشرة دون الحاجة لمعالجة خارجية.

## 2. المتطلبات غير الوظيفية (Non-Functional Requirements)
- **السرعة:** زمن الاستجابة أقل من 800 ميلي ثانية.
- **الأمان:** حماية بيانات المستخدم بالكامل بدون تخزين غير مصرح.
`,
      en: `# Software Requirements Specification (SRS)

## 1. Functional Requirements
- High-fidelity conversion from AI Markdown directly to valid OOXML / DOCX packages.
- Accurate transformation of LaTeX equation trees into native Microsoft Word OMML elements.
`,
    },
  },
  {
    id: 'ats-cv',
    icon: '📄',
    category: 'jobs',
    name: { ar: 'سيرة ذاتية متوافقة مع أنظمة ATS', en: 'ATS-Optimized Clean Resume' },
    desc: {
      ar: 'عمود واحد منظم بدون جداول معقدة، كلمات مفتاحية دقيقة، ونصوص واضحة تتجاوز فلاتر التوظيف',
      en: 'Single-column structure, keyword-optimized sections, parseable by modern Applicant Tracking Systems',
    },
    markdown: {
      ar: `# [الاسم الكامل]

**المسمى الوظيفي:** مهندس برمجيات أول (Senior Software Engineer)
📧 [البريد الإلكتروني] | 📱 [+966 50 000 0000] | 📍 [الرياض، المملكة العربية السعودية]
🔗 [رابط LinkedIn] | 💻 [رابط GitHub]

---

## الملخص المهني
مهندس برمجيات بخبرة تفوق 6 سنوات في بناء التطبيقات السحابية عالية الأداء ومنظومات معالجة النصوص، متخصص في React وTypeScript وNode.js.

## الخبرات العملية
### مهندس برمجيات أول — [اسم الشركة]
**[2022 - الآن] | [الرياض]**
- قيادة فريق من 5 مهندسين لتطوير منصة تخدم أكثر من 200,000 مستخدم نشط شهرياً.
- تحسين سرعة معالجة المستندات بنسبة 45% من خلال معالجة متوازية Client-Side.

## المهارات التقنية
- **لغات البرمجة:** TypeScript, JavaScript, Python, SQL.
- **أطر العمل:** React, Next.js, Node.js, Express, Tailwind CSS.
- **قواعد البيانات:** PostgreSQL, MongoDB, Redis.
`,
      en: `# [Full Name]

**Senior Software Engineer**
📧 [email@example.com] | 📱 [+1 555-0199] | 📍 [San Francisco, CA]
🔗 [linkedin.com/in/profile] | 💻 [github.com/username]

---

## Professional Summary
Results-oriented software engineer with 6+ years of experience engineering high-throughput web applications, document parsing engines, and modern React architectures.

## Work Experience
### Senior Software Engineer — [Tech Corp]
**[2022 - Present]**
- Architected client-side document export pipeline handling 200K+ monthly files.
- Decreased end-to-end rendering latency by 45%.
`,
    },
  },
  {
    id: 'academic-cv',
    icon: '🎓',
    category: 'jobs',
    name: { ar: 'سيرة ذاتية أكاديمية', en: 'Academic Curriculum Vitae (CV)' },
    desc: {
      ar: 'بيانات شخصية → الاهتمامات البحثية → التعليم → المنشورات العلمية → المؤتمرات → التدريس والمنح',
      en: 'Research Interests → Education → Peer-Reviewed Publications → Grants & Awards → Teaching Experience',
    },
    markdown: {
      ar: `# السيرة الذاتية الأكاديمية (Curriculum Vitae)

**د. [الاسم الكامل]**
أستاذ مساعد في علوم الحاسب والذكاء الاصطناعي
قسم علوم الحاسب — [اسم الجامعة]

---

## 1. الاهتمامات البحثية
معالجة اللغات الطبيعية (NLP)، استرجاع المعلومات، هندسة البرمجيات التوليدية.

## 2. المؤهلات العلمية
- **دكتوراه في علوم الحاسب** — جامعة [اسم الجامعة]، 2021.
- **ماجستير في هندسة البرمجيات** — جامعة [اسم الجامعة]، 2017.

## 3. الأوراق العلمية والمنشورات المحكّمة
1. [اسم البحث الأول]، مجلة IEEE Transactions on Software Engineering, 2023.
2. [اسم البحث الثاني]، مؤتمر ACM SIGKDD, 2022.
`,
      en: `# Academic Curriculum Vitae

**Dr. [Full Name]**
Assistant Professor of Computer Science
Department of Computer Science — [University Name]

---

## Research Interests
Natural Language Processing, Generative AI Systems, Information Extraction.

## Education
- **Ph.D. in Computer Science** — [University Name], 2021.
- **M.S. in Software Engineering** — [University Name], 2017.
`,
    },
  },
  {
    id: 'cover-letter',
    icon: '✉️',
    category: 'jobs',
    name: { ar: 'خطاب تقديم وظيفة (Cover Letter)', en: 'Job Application Cover Letter' },
    desc: {
      ar: 'بيانات المرسل والمستقبل → التحية المهنية → الافتتاحية القوية → الإنجازات المتقاطعة → خاتمة احترافية',
      en: 'Sender & Recipient Header → Salutation → Compelling Hook → Value Alignment → Professional Sign-off',
    },
    markdown: {
      ar: `# خطاب تقديم على وظيفة (Cover Letter)

**التاريخ:** [التاريخ الحالي]
**إلى:** مدير التوظيف الموقر
**الشركة:** [اسم الشركة المستهدفة]

---

**السلام عليكم ورحمة الله وبركاته،**

يسرني التقدم لشغل منصب **[اسم الوظيفة]** في **[اسم الشركة]**، بعد متابعة دقيقة لمشاريعكم وإنجازاتكم الملهمة في قطاع التقنية.

من خلال خبرتي الممتدة لأكثر من 5 سنوات في هذا المجال، نجحت في قيادة مبادرات مماثلة أسفرت عن رفع الكفاءة بنسبة 30% وتحقيق الأهداف المحددة قبل موعدها النهائي. أؤمن أن مهاراتي في [اسم المهارة 1] و [اسم المهارة 2] ستشكل إضافة نوعية لفريق عملكم المميز.

أتطلع بشوق لمناقشة كيفية مساهمتي في نجاح مشاريعكم القادمة في مقابلة شخصية.

**وتفضلوا بقبول فائق التحية والتقدير،**

**[اسمك الكامل]**
[رقم الهاتف] | [البريد الإلكتروني]
`,
      en: `# Professional Cover Letter

**Date:** [Current Date]
**To:** Hiring Manager, [Target Company]

---

**Dear Hiring Manager,**

I am writing to express my strong enthusiasm for the **[Job Title]** position at **[Company Name]**. Having followed your team's innovative launches, I am eager to contribute my 5+ years of software engineering expertise to your mission.

In my previous role, I spearheaded initiatives that optimized document processing workflows by 35% and scaled user engagement. My background aligns directly with the core requirements outlined in your opening.

Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications in an interview.

**Sincerely,**

**[Your Full Name]**
`,
    },
  },
  {
    id: 'sop',
    icon: '⚙️',
    category: 'ops',
    name: { ar: 'سياسة وإجراء تشغيلي قياسي (SOP)', en: 'Standard Operating Procedure (SOP)' },
    desc: {
      ar: 'رمز الوثيقة → الغرض → النطاق → المسؤوليات → خطوات التنفيذ المفصلة → معايير الجودة والتدقيق',
      en: 'Document ID → Purpose → Scope → Responsibilities → Step-by-Step Procedure → Quality Verification',
    },
    markdown: {
      ar: `# إجراء تشغيلي قياسي (Standard Operating Procedure - SOP)

**رقم الوثيقة:** SOP-OPS-2026-01
**الإصدار:** 1.2
**القسم المسؤول:** إدارة العمليات وضمان الجودة

---

## 1. الغرض من الإجراء
توحيد خطوات معالجة وفحص المستندات لضمان عدم وجود أخطاء في المخرجات الرقمية ومطابقتها للمعايير المؤسسية.

## 2. النطاق
يطبق هذا الإجراء على كافة موظفي الإدارة وفرق الدعم الفني.

## 3. الخطوات التنفيذية
1. استلام الطلب ومطابقة البيانات المدخلة.
2. تشغيل الفحص الآلي للأخطاء الإملائية والمعادلات.
3. اعتماد التصدير وحفظ نسخة احتياطية في السجل.
`,
      en: `# Standard Operating Procedure (SOP)

**Document ID:** SOP-OPS-2026-01 | **Version:** 1.2
**Department:** Quality Assurance & Operations

---

## 1. Purpose & Scope
Standardizes document validation protocols prior to executive delivery, ensuring 100% compliance with corporate guidelines.
`,
    },
  },
];

export default function TemplatesPage() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const session = useSession();
  const savedDocs = useSavedDocsList();
  const [isDark, toggleTheme] = useTheme();

  const isAr = language === 'ar';
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: isAr ? 'الكل' : 'All' },
    { id: 'academic', label: isAr ? 'أكاديمي وبحثي' : 'Academic' },
    { id: 'business', label: isAr ? 'أعمال واستراتيجية' : 'Business' },
    { id: 'reports', label: isAr ? 'تقارير أداء' : 'Reports' },
    { id: 'engineering', label: isAr ? 'هندسة ومشاريع' : 'Engineering' },
    { id: 'tech', label: isAr ? 'تقنية وبرمجة' : 'Tech & App' },
    { id: 'jobs', label: isAr ? 'سير ذاتية ووظائف' : 'Careers & CVs' },
    { id: 'ops', label: isAr ? 'تشغيل وسياسات' : 'Operations' },
  ];

  const filtered = TEMPLATES_LIST.filter(item => {
    const matchesCat = selectedCat === 'all' || item.category === selectedCat;
    const nameStr = item.name[language] || item.name.en;
    const descStr = item.desc[language] || item.desc.en;
    const matchesSearch =
      !searchQuery.trim() ||
      nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      descStr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleUseTemplate = (tpl: TemplateItem) => {
    const md = tpl.markdown[language] || tpl.markdown.en;
    const title = tpl.name[language] || tpl.name.en;

    try {
      localStorage.setItem(
        'midaddExternalTemplate',
        JSON.stringify({
          title,
          markdown: md,
          source: 'templates_page',
        })
      );
    } catch {}

    router.push('/');
  };

  const handleCopyMarkdown = async (tpl: TemplateItem) => {
    const md = tpl.markdown[language] || tpl.markdown.en;
    try {
      await navigator.clipboard.writeText(md);
      setCopiedId(tpl.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
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
      <section className="relative overflow-hidden py-12 sm:py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 text-xs font-bold mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isAr ? 'مكتبة قوالب Word الاحترافية' : '22 Professional Word Templates'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            {isAr ? 'قوالب جاهزة ' : 'Ready-to-Use Templates '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {isAr ? 'لكل مشروع وبحث' : 'For Any Project'}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            {isAr
              ? 'اختر القالب الأنسب لاحتياجاتك، عاين بنيته الكاملة، ثم انقر لفتحه فورياً داخل محرر مداد لتعديله وتصديره إلى Word (DOCX) أو PDF بنقرة واحدة.'
              : 'Explore structured templates for graduation projects, business plans, CVs, and technical proposals. Preview the Markdown and open directly in the editor.'}
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <Search className="h-5 w-5 absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن قالب (مشروع تخرج، خطة عمل، سيرة ذاتية...)' : 'Search templates...'}
              className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Category Filter Chips */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCat === cat.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="text-xs text-slate-400 font-semibold ml-auto rtl:ml-0 rtl:mr-auto shrink-0">
            {filtered.length} {isAr ? 'قالب' : 'templates'}
          </span>
        </div>
      </div>

      {/* Templates Grid */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(tpl => {
            const title = tpl.name[language] || tpl.name.en;
            const desc = tpl.desc[language] || tpl.desc.en;

            return (
              <div
                key={tpl.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg hover:border-indigo-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                      {tpl.icon}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 uppercase">
                      {tpl.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition cursor-pointer"
                  >
                    <span>{isAr ? 'استخدام القالب' : 'Use Template'}</span>
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </button>

                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition text-xs font-semibold cursor-pointer"
                    title={isAr ? 'معاينة القالب' : 'Preview'}
                  >
                    <FileText className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleCopyMarkdown(tpl)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition text-xs font-semibold cursor-pointer"
                    title={isAr ? 'نسخ Markdown' : 'Copy'}
                  >
                    {copiedId === tpl.id ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slideDown">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{previewTemplate.icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {previewTemplate.name[language] || previewTemplate.name.en}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {previewTemplate.desc[language] || previewTemplate.desc.en}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200 select-all">
              {previewTemplate.markdown[language] || previewTemplate.markdown.en}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
              <button
                onClick={() => handleCopyMarkdown(previewTemplate)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {copiedId === previewTemplate.id ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>{isAr ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>{isAr ? 'نسخ نص القالب' : 'Copy Structure'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleUseTemplate(previewTemplate)}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                <span>{isAr ? 'فتح في المحرر الآن' : 'Open in Editor'}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
