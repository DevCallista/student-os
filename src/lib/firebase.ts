import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Check if Firebase is configured
const isConfigured = Object.values(firebaseConfig).every((v) => v);

let app: any;
let auth: any;
let db: any;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    
    // Initialize Firestore with offline persistence
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    
    // Enable offline persistence as a fallback
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open; offline persistence disabled.');
      } else if (err.code === 'unimplemented') {
        console.warn('Browser does not support offline persistence.');
      }
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

export const googleProvider = new GoogleAuthProvider();

export async function initAuth(callback: (user: any) => void) {
  if (!isConfigured || !auth) {
    console.warn('Firebase not configured; running in local-only mode.');
    return;
  }

  onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

export async function signInWithGoogle() {
  if (!auth) throw new Error('Firebase not configured');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

export async function signOutUser() {
  if (!auth) throw new Error('Firebase not configured');
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

export { auth, db, isConfigured };
