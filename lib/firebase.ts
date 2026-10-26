import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { SavedDocument } from '@/types';
import { getSavedDocuments, saveDocument as saveLocalDocument, deleteDocument as deleteLocalDocument } from './guest-session';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId from firebase-applet-config.json
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Error Handling Specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate Connection to Firestore on startup
 */
export async function testConnection(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  testConnection();
}

/**
 * Save user profile in Firestore
 */
export async function syncUserProfile(user: User): Promise<void> {
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(
      userDocRef,
      {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('User profile sync warning:', err);
  }
}

/**
 * Fetch documents for a user from Firestore, falling back to local storage
 */
export async function fetchUserDocuments(userId?: string): Promise<SavedDocument[]> {
  const localDocs = getSavedDocuments();
  const currentUid = userId || auth.currentUser?.uid;

  if (!currentUid) {
    return localDocs;
  }

  const path = `users/${currentUid}/documents`;
  try {
    const colRef = collection(db, 'users', currentUid, 'documents');
    const q = query(colRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const cloudDocs: SavedDocument[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: data.id || docSnap.id,
          title: data.title || 'Untitled Document',
          markdown: data.markdown || '',
          html: data.html || '',
          docxBase64: data.docxBase64 || undefined,
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          isPublic: Boolean(data.isPublic),
          userId: currentUid,
        };
      });

      return cloudDocs;
    }
  } catch (error) {
    console.warn('Firestore fetchUserDocuments error, falling back to local docs:', error);
  }

  return localDocs;
}

/**
 * Save document to Firestore and local storage
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

  const currentUid = params.userId || auth.currentUser?.uid;

  if (currentUid && auth.currentUser) {
    const docId = localDoc.id;
    const path = `users/${currentUid}/documents/${docId}`;
    try {
      const docRef = doc(db, 'users', currentUid, 'documents', docId);
      const payload: Record<string, any> = {
        id: docId,
        userId: currentUid,
        title: params.title || 'Untitled Document',
        markdown: params.markdown || '',
        html: params.html || '',
        updatedAt: Date.now(),
        isPublic: params.isPublic ?? false,
      };

      if (params.docxBase64) {
        payload.docxBase64 = params.docxBase64;
      }

      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.warn('Firestore save warning, local copy preserved:', error);
    }
  }

  return localDoc;
}

/**
 * Delete a document from Firestore and local storage
 */
export async function deleteUserDocument(id: string, userId?: string): Promise<SavedDocument[]> {
  const remaining = deleteLocalDocument(id);
  const currentUid = userId || auth.currentUser?.uid;

  if (currentUid && auth.currentUser) {
    const path = `users/${currentUid}/documents/${id}`;
    try {
      const docRef = doc(db, 'users', currentUid, 'documents', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Firestore delete error:', error);
    }
  }

  return remaining;
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleAuthProvider);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await syncUserProfile(result.user);
  return result.user;
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
