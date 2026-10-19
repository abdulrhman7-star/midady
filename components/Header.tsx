'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';
import { GuestSession } from '@/types';
import {
  FileText,
  Sparkles,
  Coins,
  Globe,
  FolderOpen,
  User,
  LogOut,
  Moon,
  Sun,
  ShieldCheck,
  Menu,
  X,
  Layers,
  Tag,
  MessageSquare,
  Home,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  session: GuestSession;
  savedDocsCount: number;
  onOpenSavedDocs: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  session,
  savedDocsCount,
  onOpenSavedDocs,
  onOpenAuthModal,
  onLogout,
  isDark,
  onToggleTheme,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const pathname = usePathname() || '/';
  const isAr = language === 'ar';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: isAr ? 'الرئيسية' : 'Home', icon: Home },
    { href: '/templates', label: isAr ? 'القوالب' : 'Templates', icon: Layers, badge: '22' },
    { href: '/pricing', label: isAr ? 'الأسعار' : 'Pricing', icon: Tag },
    { href: '/contact', label: isAr ? 'تواصل' : 'Contact', icon: MessageSquare },
  ];

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse shrink-0">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-2.5 rtl:space-x-reverse group">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-lg sm:text-xl">✒️</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                <span className="font-extrabold text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  {isAr ? 'مداد' : 'midadd'}
                </span>
                <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">
                  AI Docs
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block leading-tight">
                {isAr ? 'محوّل Markdown لمستندات Word & PDF' : 'AI Markdown to Word & PDF'}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 rtl:space-x-reverse" aria-label="Main Navigation">
          {navLinks.map(item => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
              >
                <IconComponent className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Mobile Navigation Trigger */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 rtl:space-x-reverse shrink-0">
          {/* Credits Counter Pill */}
          <Link
            href="/pricing"
            className="flex items-center space-x-1 sm:space-x-1.5 rtl:space-x-reverse px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-[11px] sm:text-xs font-semibold hover:border-amber-400 transition shrink-0"
            title="Export Credits - 1 credit per export. Click to top up."
          >
            <Coins className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold">{session.credits}</span>
            <span className="text-slate-400 text-[10px] hidden xs:inline">/ {session.maxCredits}</span>
            <span className="hidden xl:inline text-[11px] text-amber-700 dark:text-amber-300">
              {t.creditsLabel}
            </span>
          </Link>

          {/* Saved Documents Button (Visible on tablet & desktop) */}
          <button
            type="button"
            onClick={onOpenSavedDocs}
            className="hidden sm:flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
            title={t.savedDocsTitle}
          >
            <FolderOpen className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span className="hidden md:inline">{t.savedDocsTitle}</span>
            {savedDocsCount > 0 && (
              <span className="h-4.5 w-4.5 flex items-center justify-center rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold">
                {savedDocsCount}
              </span>
            )}
          </button>

          {/* Language Switcher (Visible on tablet & desktop) */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="hidden sm:flex items-center space-x-1 rtl:space-x-reverse px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Switch Language / تبديل اللغة"
          >
            <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>

          {/* Theme Toggle (Visible on tablet & desktop) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="hidden sm:flex p-1.5 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {/* User Account / Upgrade (Visible on tablet & desktop) */}
          {session.isGuest ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link
                href="/login"
                className="hidden lg:inline-flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
              >
                <span>{isAr ? 'دخول' : 'Sign In'}</span>
              </Link>
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="inline-flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>{t.convertAccount}</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2 rtl:space-x-reverse">
              <Link
                href="/profile"
                className="flex items-center space-x-1.5 rtl:space-x-reverse px-2.5 py-1 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 text-xs rounded-full font-semibold hover:border-green-400 transition"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                <span className="max-w-[100px] truncate">{session.name || session.email}</span>
              </Link>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-md transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button (Visible on mobile screens < md) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer active:scale-95 touch-target flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة الرئيسية'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md px-4 py-4 space-y-3 shadow-xl animate-fadeIn">
          {/* Mobile Navigation Links */}
          <div className="space-y-1">
            {navLinks.map(item => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent className="h-4 w-4 text-indigo-500" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-400 rtl:rotate-180" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile Fast Actions: Saved Docs, Language, Theme */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            {/* Language Switch */}
            <button
              type="button"
              onClick={() => {
                toggleLanguage();
              }}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              <Globe className="h-4 w-4 text-indigo-500" />
              <span>{language === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>{isAr ? 'الوضع النهاري' : 'Light Mode'}</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-slate-600" />
                  <span>{isAr ? 'الوضع الليلي' : 'Dark Mode'}</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Documents button on mobile */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenSavedDocs();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-red-500" />
              <span>{t.savedDocsTitle}</span>
            </div>
            {savedDocsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold">
                {savedDocsCount}
              </span>
            )}
          </button>

          {/* Mobile Auth / Account Section */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {session.isGuest ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  <User className="h-4 w-4" />
                  <span>{t.loginSignup}</span>
                </button>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
                  >
                    {isAr ? 'تسجيل الدخول' : 'Sign In'}
                  </Link>
                  <span>•</span>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold"
                  >
                    {isAr ? 'إنشاء حساب جديد' : 'Sign Up'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/40 rounded-xl border border-green-200 dark:border-green-800">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-bold text-green-800 dark:text-green-300"
                >
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>{session.name || session.email}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-xs text-red-600 dark:text-red-400 font-bold p-1 hover:underline"
                >
                  {isAr ? 'خروج' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
