'use client';

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import {
  X,
  Coins,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (email: string, name: string) => void;
  isOutOfCredits?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  isOutOfCredits = false,
}) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    onRegister(email.trim(), name.trim());
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150 modal-backdrop">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center space-x-2.5 rtl:space-x-reverse">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                {isOutOfCredits ? t.outOfCreditsTitle : t.convertAccount}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                +20 Free Credits upon account creation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isOutOfCredits && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs sm:text-sm">
              <p className="font-semibold">{t.outOfCreditsDesc}</p>
            </div>
          )}

          {isSuccess ? (
            <div className="py-8 text-center space-y-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Account Created!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                20 export credits have been added to your account.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Abdulrahman"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.passwordLabel}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center space-x-2 rtl:space-x-reverse py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/20 transition"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t.createAccountBtn}</span>
                </button>
              </div>

              <div className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-xs text-slate-400 pt-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>Guest documents and history will be automatically merged.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
