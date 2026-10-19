import { useSyncExternalStore } from 'react';
import { GuestSession, SavedDocument } from '@/types';

const SESSION_KEY = 'massivemark_session';
const SAVED_DOCS_KEY = 'massivemark_saved_docs';
const MAX_CREDITS = 5;
const REFRESH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const DEFAULT_SERVER_SESSION: GuestSession = {
  id: 'guest_init',
  isGuest: true,
  credits: MAX_CREDITS,
  maxCredits: MAX_CREDITS,
  lastRefreshed: 0,
  createdAt: 0,
};

let cachedSession: GuestSession | null = null;
const sessionListeners = new Set<() => void>();

function notifySessionListeners() {
  sessionListeners.forEach(cb => cb());
}

export function subscribeSession(callback: () => void) {
  sessionListeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === SESSION_KEY) {
      cachedSession = null;
      callback();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    sessionListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function getSessionSnapshot(): GuestSession {
  if (cachedSession) return cachedSession;
  cachedSession = getOrCreateSession();
  return cachedSession;
}

export function getSessionServerSnapshot(): GuestSession {
  return DEFAULT_SERVER_SESSION;
}

export function useSession(): GuestSession {
  return useSyncExternalStore(subscribeSession, getSessionSnapshot, getSessionServerSnapshot);
}

export function getOrCreateSession(): GuestSession {
  if (typeof window === 'undefined') {
    return DEFAULT_SERVER_SESSION;
  }

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session: GuestSession = JSON.parse(raw);
      // Check if time passed to refresh credits
      const now = Date.now();
      const elapsed = now - (session.lastRefreshed || session.createdAt);
      if (elapsed > REFRESH_INTERVAL_MS && session.credits < MAX_CREDITS) {
        const added = Math.min(MAX_CREDITS - session.credits, Math.floor(elapsed / REFRESH_INTERVAL_MS));
        session.credits = Math.min(MAX_CREDITS, session.credits + added);
        session.lastRefreshed = now;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
      return session;
    }
  } catch (err) {
    console.warn('Failed to parse session:', err);
  }

  // Create new guest session
  const newSession: GuestSession = {
    id: `guest_${Math.random().toString(36).substring(2, 11)}`,
    isGuest: true,
    credits: MAX_CREDITS,
    maxCredits: MAX_CREDITS,
    lastRefreshed: Date.now(),
    createdAt: Date.now(),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    document.cookie = `mm_session=${newSession.id}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {}

  return newSession;
}

export function saveSession(session: GuestSession): void {
  cachedSession = session;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {}
  }
  notifySessionListeners();
}

export function deductCredit(): { success: boolean; session: GuestSession } {
  const current = getSessionSnapshot();
  const session: GuestSession = { ...current };
  if (session.credits <= 0) {
    return { success: false, session };
  }
  session.credits -= 1;
  saveSession(session);
  return { success: true, session };
}

export function addCredits(amount: number): GuestSession {
  const current = getSessionSnapshot();
  const session: GuestSession = { ...current };
  session.credits += amount;
  session.maxCredits = Math.max(session.maxCredits, session.credits);
  saveSession(session);
  return session;
}

export function convertGuestToFullAccount(email: string, name: string): GuestSession {
  const current = getSessionSnapshot();
  const session: GuestSession = { ...current };
  session.isGuest = false;
  session.email = email;
  session.name = name;
  session.credits = Math.max(session.credits, 20); // Bonus 20 credits upon signup!
  session.maxCredits = 20;
  saveSession(session);
  return session;
}

export function logoutAccount(): GuestSession {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
  }
  cachedSession = null;
  const fresh = getOrCreateSession();
  cachedSession = fresh;
  notifySessionListeners();
  return fresh;
}

// Saved documents management
const DEFAULT_SAVED_DOCS: SavedDocument[] = [];
let cachedDocs: SavedDocument[] | null = null;
const docsListeners = new Set<() => void>();

function notifyDocsListeners() {
  docsListeners.forEach(cb => cb());
}

export function subscribeSavedDocs(callback: () => void) {
  docsListeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === SAVED_DOCS_KEY) {
      cachedDocs = null;
      callback();
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }
  return () => {
    docsListeners.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function getSavedDocsSnapshot(): SavedDocument[] {
  if (cachedDocs) return cachedDocs;
  cachedDocs = getSavedDocuments();
  return cachedDocs;
}

export function getSavedDocsServerSnapshot(): SavedDocument[] {
  return DEFAULT_SAVED_DOCS;
}

export function useSavedDocsList(): SavedDocument[] {
  return useSyncExternalStore(subscribeSavedDocs, getSavedDocsSnapshot, getSavedDocsServerSnapshot);
}

export function getSavedDocuments(): SavedDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDocument(
  title: string,
  markdown: string,
  html: string,
  id?: string,
  docxBase64?: string,
  userId?: string
): SavedDocument {
  const docs = [...getSavedDocuments()];
  const docId = id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanTitle = title.trim() || 'Untitled Document';
  
  const existingIdx = docs.findIndex(d => d.id === docId);
  const existingDoc = existingIdx >= 0 ? docs[existingIdx] : undefined;

  const newDoc: SavedDocument = {
    id: docId,
    title: cleanTitle,
    markdown,
    html,
    docxBase64: docxBase64 !== undefined ? docxBase64 : existingDoc?.docxBase64,
    updatedAt: Date.now(),
    isPublic: false,
    userId: userId || existingDoc?.userId,
  };

  if (existingIdx >= 0) {
    docs[existingIdx] = newDoc;
  } else {
    docs.unshift(newDoc);
  }

  cachedDocs = docs;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(docs.slice(0, 50)));
    } catch {}
  }
  notifyDocsListeners();

  return newDoc;
}

export function deleteDocument(id: string): SavedDocument[] {
  let docs = getSavedDocuments().filter(d => d.id !== id);
  cachedDocs = docs;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SAVED_DOCS_KEY, JSON.stringify(docs));
    } catch {}
  }
  notifyDocsListeners();
  return docs;
}
