'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';
import { translations, Translations } from '@/lib/translations';
import { SupportedLanguage } from '@/types';

interface LanguageContextType {
  language: SupportedLanguage;
  direction: 'ltr' | 'rtl';
  t: Translations;
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const langListeners = new Set<() => void>();

function notifyLangListeners() {
  langListeners.forEach(cb => cb());
}

function subscribeLanguage(callback: () => void) {
  langListeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === 'massivemark_lang') {
      callback();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    langListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function getLangSnapshot(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('massivemark_lang') as SupportedLanguage;
    if (saved === 'ar' || saved === 'en') return saved;
  } catch {}
  return 'en';
}

function getLangServerSnapshot(): SupportedLanguage {
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribeLanguage, getLangSnapshot, getLangServerSnapshot);

  const setLanguage = (lang: SupportedLanguage) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('massivemark_lang', lang);
      } catch {}
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
    notifyLangListeners();
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const t = translations[language];

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction;
      document.documentElement.lang = language;
    }
  }, [direction, language]);

  return (
    <LanguageContext.Provider value={{ language, direction, t, setLanguage, toggleLanguage }}>
      <div dir={direction} className={language === 'ar' ? 'font-sans' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
