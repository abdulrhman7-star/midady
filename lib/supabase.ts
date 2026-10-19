import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SavedDocument } from '@/types';
import { getSavedDocuments, saveDocument as saveLocalDocument } from './guest-session';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export interface DocumentRecord {
  id: string;
  user_id?: string | null;
  title: string;
  content_markdown?: string | null;
  content_html?: string | null;
  docx_base64?: string | null;
  storage_path?: string | null;
  is_public?: boolean;
  updated_at?: string;
  created_at?: string;
}

/**
 * Fetch user documents: attempts Supabase if configured and user is signed in,
 * otherwise transparently falls back to local storage.
 */
export async function fetchUserDocuments(userId?: string): Promise<SavedDocument[]> {
  if (supabase && userId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(row => ({
          id: row.id,
          title: row.title || 'Untitled Document',
          markdown: row.content_markdown || '',
          html: row.content_html || '',
          docxBase64: row.docx_base64 || undefined,
          updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
          isPublic: row.is_public ?? false,
          userId: row.user_id,
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // Fallback to local documents
  return getSavedDocuments();
}

/**
 * Save document: saves to Supabase when configured and always syncs to local storage
 */
export async function saveUserDocument(params: {
  id?: string;
  title: string;
  markdown: string;
  html: string;
  docxBase64?: string;
  userId?: string;
  isPublic?: boolean;
}): Promise<SavedDocument> {
  const localDoc = saveLocalDocument(
    params.title,
    params.markdown,
    params.html,
    params.id,
    params.docxBase64,
    params.userId
  );

  if (supabase && params.userId) {
    try {
      const record: DocumentRecord = {
        id: localDoc.id,
        user_id: params.userId,
        title: params.title,
        content_markdown: params.markdown,
        content_html: params.html,
        docx_base64: params.docxBase64 || null,
        is_public: params.isPublic ?? false,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('documents')
        .upsert(record, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase upsert warning:', error.message);
      }
    } catch (err) {
      console.warn('Supabase save error, local copy preserved:', err);
    }
  }

  return localDoc;
}

/**
 * Helper to convert Uint8Array / ArrayBuffer to Base64 string
 */
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper to convert Base64 string to Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
