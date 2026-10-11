import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';

export const firebaseConfig = {
  projectId: "sonorous-heading-pn2tx",
  appId: "1:865139828790:web:524b53949759fd6ec8d097",
  apiKey: "AIzaSyDPGLnZ3pzPFef8Cz4aSreBL5ZUmhZozXw",
  authDomain: "sonorous-heading-pn2tx.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-alteregosceneswa-18262271-a1fe-4ea8-9882-dbf4dc44f9fa",
  storageBucket: "sonorous-heading-pn2tx.firebasestorage.app",
  messagingSenderId: "865139828790",
  measurementId: "",
  oAuthClientId: "865139828790-3skp7ovpj93qh8flark2nmchmrl23uqh.apps.googleusercontent.com",
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with the provisioned database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Validate connection per Firebase Skill specifications
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection test: client is currently offline.');
    }
    return false;
  }
}

// Data synchronization interfaces for AlterEgo
export interface SavedAlterEgoData {
  alterEgoResult: any;
  currentChapter: number;
  chapterStartedAt: number;
  priorChaptersXp: number;
  completedQuestIds: number[];
  isSovereignPro: boolean;
  dailyStreak?: number;
  lastClaimedAffirmationDate?: string;
  dailyBonusXp?: number;
  updatedAt: string;
}

/**
 * Save user AlterEgo character state to Firestore
 */
export async function saveUserAlterEgoData(userId: string, data: Partial<SavedAlterEgoData>) {
  if (!userId) return;
  const userRef = doc(db, 'users', userId);
  const charRef = doc(db, 'users', userId, 'alterego', 'character');

  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await Promise.all([
    setDoc(userRef, {
      uid: userId,
      is_sovereign_pro: data.isSovereignPro ?? false,
      updated_at: new Date().toISOString(),
    }, { merge: true }),
    setDoc(charRef, payload, { merge: true }),
  ]);
}

/**
 * Load user AlterEgo character state from Firestore
 */
export async function loadUserAlterEgoData(userId: string): Promise<SavedAlterEgoData | null> {
  if (!userId) return null;
  const charRef = doc(db, 'users', userId, 'alterego', 'character');
  const snap = await getDoc(charRef);
  if (snap.exists()) {
    return snap.data() as SavedAlterEgoData;
  }
  return null;
}

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
};
