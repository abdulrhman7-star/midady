import { useEffect, useSyncExternalStore } from 'react';

const THEME_KEY = 'massivemark_theme';
let cachedTheme: boolean | null = null;
const themeListeners = new Set<() => void>();

function notifyThemeListeners() {
  themeListeners.forEach(cb => cb());
}

export function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  if (typeof window === 'undefined') return () => {};

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handleMediaChange = () => {
    cachedTheme = null;
    callback();
  };
  mql.addEventListener('change', handleMediaChange);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) {
      cachedTheme = null;
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    themeListeners.delete(callback);
    mql.removeEventListener('change', handleMediaChange);
    window.removeEventListener('storage', handleStorage);
  };
}

export function getThemeSnapshot(): boolean {
  if (cachedTheme !== null) return cachedTheme;
  if (typeof window === 'undefined') return false;

  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark') {
      cachedTheme = true;
      return true;
    }
    if (saved === 'light') {
      cachedTheme = false;
      return false;
    }
  } catch {}

  cachedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return cachedTheme;
}

export function getThemeServerSnapshot(): boolean {
  return false;
}

export function toggleThemeMode(): boolean {
  const current = getThemeSnapshot();
  const next = !current;
  cachedTheme = next;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(THEME_KEY, next ? 'dark' : 'light');
    } catch {}
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  notifyThemeListeners();
  return next;
}

export function useTheme(): [boolean, () => void] {
  const isDark = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [isDark]);

  return [isDark, toggleThemeMode];
}
