export interface Translations {
  appName: string;
  tagline: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  insertButton: string;
  insertTooltip: string;
  exportDocx: string;
  exportPdf: string;
  copyGDocs: string;
  copiedGDocs: string;
  saveDoc: string;
  savedDocsTitle: string;
  clearDoc: string;
  clearConfirm: string;
  creditsLabel: string;
  guestUser: string;
  freeAccount: string;
  convertAccount: string;
  loginSignup: string;
  outOfCreditsTitle: string;
  outOfCreditsDesc: string;
  dontChangeMarkdownNotice: string;
  tabRawMarkdown: string;
  tabShareLink: string;
  pasteClipboard: string;
  presetsLabel: string;
  insertAction: string;
  replaceAction: string;
  shareLinkPlaceholder: string;
  fetchLinkAction: string;
  fetching: string;
  editorPlaceholder: string;
  wordCount: string;
  charCount: string;
  readingTime: string;
  tableInsert: string;
  tableRows: string;
  tableCols: string;
  addRow: string;
  addCol: string;
  deleteRow: string;
  deleteCol: string;
  mathInsert: string;
  mathPlaceholder: string;
  mathPreview: string;
  codeInsert: string;
  codeLanguage: string;
  codeContent: string;
  saveSuccess: string;
  exportSuccess: string;
  creditDeducted: string;
  noSavedDocs: string;
  deleteConfirm: string;
  close: string;
  cancel: string;
  confirm: string;
  emailLabel: string;
  nameLabel: string;
  passwordLabel: string;
  createAccountBtn: string;
}

export const translations: Record<'en' | 'ar', Translations> = {
  en: {
    appName: 'MassiveMark Playground',
    tagline: 'Convert AI Markdown to DOCX, PDF & Google Docs',
    step1Title: '1. Copy from AI',
    step1Desc: 'Copy raw markdown or formulas from ChatGPT, Claude, or Gemini.',
    step2Title: '2. Paste into MassiveMark',
    step2Desc: 'Click the red button below or press Ctrl+K to paste instantly.',
    step3Title: '3. Export DOCX or PDF',
    step3Desc: 'Download with native Word editable equations and styled tables.',
    insertButton: 'Insert AI Content / Markdown',
    insertTooltip: 'Paste markdown from ChatGPT/Gemini or import share link (Ctrl+K)',
    exportDocx: 'Download DOCX',
    exportPdf: 'Download PDF',
    copyGDocs: 'Copy for Google Docs',
    copiedGDocs: 'Copied for Google Docs!',
    saveDoc: 'Save',
    savedDocsTitle: 'Saved Documents',
    clearDoc: 'Clear',
    clearConfirm: 'Are you sure you want to clear the editor? Any unsaved changes will be lost.',
    creditsLabel: 'Credits',
    guestUser: 'Guest Session',
    freeAccount: 'Registered Account',
    convertAccount: 'Upgrade / Create Account',
    loginSignup: 'Sign Up / Sign In',
    outOfCreditsTitle: 'You are out of free export credits',
    outOfCreditsDesc: 'Credits recharge automatically every 10 minutes (up to 5). You can also sign up for 20 bonus credits!',
    dontChangeMarkdownNotice: "Don't change markdown; you can edit text later once it is rendered.",
    tabRawMarkdown: 'Raw Markdown',
    tabShareLink: 'ChatGPT / Gemini Share Link',
    pasteClipboard: 'Paste from Clipboard',
    presetsLabel: 'Sample Templates',
    insertAction: 'Insert to Document',
    replaceAction: 'Replace Document',
    shareLinkPlaceholder: 'Paste https://chatgpt.com/share/... or Gemini share link',
    fetchLinkAction: 'Fetch & Render',
    fetching: 'Processing...',
    editorPlaceholder: 'Start typing here or click "Insert AI Content / Markdown" above to paste from ChatGPT or Claude...',
    wordCount: 'words',
    charCount: 'chars',
    readingTime: 'min read',
    tableInsert: 'Insert Table',
    tableRows: 'Rows',
    tableCols: 'Columns',
    addRow: 'Add Row',
    addCol: 'Add Column',
    deleteRow: 'Delete Row',
    deleteCol: 'Delete Column',
    mathInsert: 'Insert LaTeX Math',
    mathPlaceholder: 'e.g. \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} or E = mc^2',
    mathPreview: 'Live LaTeX Preview',
    codeInsert: 'Insert Code Block',
    codeLanguage: 'Language',
    codeContent: 'Code content...',
    saveSuccess: 'Document saved successfully!',
    exportSuccess: 'File exported successfully!',
    creditDeducted: '1 export credit used.',
    noSavedDocs: 'No saved documents yet. Click "Save" to keep your work.',
    deleteConfirm: 'Are you sure you want to delete this document?',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    emailLabel: 'Email Address',
    nameLabel: 'Full Name',
    passwordLabel: 'Password',
    createAccountBtn: 'Create Account (+20 Credits)',
  },
  ar: {
    appName: 'ماسيف مارك بلاي جراوند',
    tagline: 'تحويل محتوى الذكاء الاصطناعي (Markdown) إلى DOCX و PDF و Google Docs',
    step1Title: '1. انسخ من الذكاء الاصطناعي',
    step1Desc: 'انسخ نصوص Markdown أو المعادلات من ChatGPT أو Claude أو Gemini.',
    step2Title: '2. الصق في MassiveMark',
    step2Desc: 'اضغط على الزر الأحمر أو اضغط Ctrl+K للصق الفوري والمعالجة.',
    step3Title: '3. صدّر إلى Word أو PDF',
    step3Desc: 'حمّل الملف مع معادلات Word قابلة للتحرير بالكامل وجداول منسقة.',
    insertButton: 'إدراج محتوى الذكاء الاصطناعي / Markdown',
    insertTooltip: 'الصق Markdown من ChatGPT أو استورد رابط المحادثة (Ctrl+K)',
    exportDocx: 'تحميل وورد (DOCX)',
    exportPdf: 'تحميل (PDF)',
    copyGDocs: 'نسخ لـ Google Docs',
    copiedGDocs: 'تم النسخ لـ Google Docs بنجاح!',
    saveDoc: 'حفظ المستند',
    savedDocsTitle: 'المستندات المحفوظة',
    clearDoc: 'مسح المحرر',
    clearConfirm: 'هل أنت متأكد من مسح المحرر؟ ستفقد أي تغييرات غير محفوظة.',
    creditsLabel: 'الرصيد',
    guestUser: 'جلسة زائر',
    freeAccount: 'حساب مسجل',
    convertAccount: 'ترقية / إنشاء حساب',
    loginSignup: 'تسجيل الدخول / إنشاء حساب',
    outOfCreditsTitle: 'نفد رصيد التصدير المجاني',
    outOfCreditsDesc: 'يتجدد الرصيد تلقائياً كل 10 دقائق (حتى 5 نقاط). يمكنك أيضاً التسجيل للحصول على 20 نقطة إضافية!',
    dontChangeMarkdownNotice: 'لا تقم بتعديل كود الماركداون هنا؛ يمكنك تعديل النص وتنسيقه بحرية في المحرر بعد المعالجة.',
    tabRawMarkdown: 'كود Markdown المباشر',
    tabShareLink: 'رابط محادثة ChatGPT / Gemini',
    pasteClipboard: 'لصق من الحافظة',
    presetsLabel: 'نماذج جاهزة للتجربة',
    insertAction: 'إدراج في المستند',
    replaceAction: 'استبدال المستند بالكامل',
    shareLinkPlaceholder: 'الصق رابط المشاركة مثل https://chatgpt.com/share/...',
    fetchLinkAction: 'جلب ومعالجة المحتوى',
    fetching: 'جار المعالجة...',
    editorPlaceholder: 'ابدأ الكتابة هنا، أو اضغط على "إدراج محتوى الذكاء الاصطناعي" في الأعلى للصق مخرجات ChatGPT...',
    wordCount: 'كلمة',
    charCount: 'حرف',
    readingTime: 'دقيقة قراءة',
    tableInsert: 'إدراج جدول',
    tableRows: 'الصفوف',
    tableCols: 'الأعمدة',
    addRow: 'إضافة صف',
    addCol: 'إضافة عمود',
    deleteRow: 'حذف صف',
    deleteCol: 'حذف عمود',
    mathInsert: 'إدراج معادلة رياضية LaTeX',
    mathPlaceholder: 'مثال: \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} أو E = mc^2',
    mathPreview: 'معاينة المعادلة مباشرة',
    codeInsert: 'إدراج كتلة برمجية',
    codeLanguage: 'لغة البرمجة',
    codeContent: 'اكتب الكود البرمجي هنا...',
    saveSuccess: 'تم حفظ المستند بنجاح!',
    exportSuccess: 'تم تصدير الملف بنجاح!',
    creditDeducted: 'تم استخدام نقطة تصدير واحدة.',
    noSavedDocs: 'لا توجد مستندات محفوظة بعد. اضغط على "حفظ المستند" لحفظ عملك.',
    deleteConfirm: 'هل أنت متأكد من رغبتك في حذف هذا المستند؟',
    close: 'إغلاق',
    cancel: 'إلغاء',
    confirm: 'تأكيد',
    emailLabel: 'البريد الإلكتروني',
    nameLabel: 'الاسم الكامل',
    passwordLabel: 'كلمة المرور',
    createAccountBtn: 'إنشاء حساب والحصول على 20 نقطة',
  },
};
