export interface GuestSession {
  id: string;
  isGuest: boolean;
  email?: string;
  name?: string;
  credits: number;
  maxCredits: number;
  lastRefreshed: number;
  createdAt: number;
}

export interface SavedDocument {
  id: string;
  title: string;
  markdown: string;
  html: string;
  docxBase64?: string; // Real DOCX binary bytes stored as base64 for complete fidelity
  updatedAt: number;
  isPublic?: boolean;
  userId?: string;
}

export type SupportedLanguage = 'en' | 'ar';
