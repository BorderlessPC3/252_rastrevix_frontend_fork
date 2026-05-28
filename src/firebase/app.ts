import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import {
  enableNetwork,
  getFirestore,
  initializeFirestore,
  type Firestore,
} from 'firebase/firestore';
import { firestoreDatabaseId } from '../config/firebase';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firestoreSettings = {
  experimentalAutoDetectLongPolling: true,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let networkReady: Promise<void> | null = null;
let analytics: Analytics | null = null;
let analyticsInit: Promise<Analytics | null> | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

function createFirestore(): Firestore {
  const firebaseApp = getFirebaseApp();
  const databaseId = firestoreDatabaseId();

  try {
    return databaseId
      ? initializeFirestore(firebaseApp, firestoreSettings, databaseId)
      : initializeFirestore(firebaseApp, firestoreSettings);
  } catch {
    return databaseId
      ? getFirestore(firebaseApp, databaseId)
      : getFirestore(firebaseApp);
  }
}

export function getDb(): Firestore {
  if (!db) {
    db = createFirestore();
    networkReady = enableNetwork(db).catch(() => undefined);
  }
  return db;
}

/** Garante conexão ativa com o Firestore antes de operações críticas. */
export async function ensureFirestoreOnline(): Promise<void> {
  getDb();
  await networkReady;
}

export function getFirestoreDatabaseLabel(): string {
  return firestoreDatabaseId() ?? '(default)';
}

/** Analytics (somente em ambiente browser com suporte). */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) return Promise.resolve(analytics);
  if (!analyticsInit) {
    analyticsInit = isSupported().then((supported) => {
      if (!supported || !firebaseConfig.measurementId) return null;
      analytics = getAnalytics(getFirebaseApp());
      return analytics;
    });
  }
  return analyticsInit;
}
