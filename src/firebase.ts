import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// In 2026, browsers strictly block third-party cookies.
// To bypass this for custom domains like Vercel (https://roshan-services-academy.vercel.app/),
// we dynamically set authDomain to the current page hostname if it's deployed.
// Combined with vercel.json rewrites for /__/auth/*, this handles auth in first-party context cleanly.
const isCustomDomain = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  !window.location.hostname.endsWith('.run.app');

const finalConfig = {
  ...firebaseConfig,
  authDomain: isCustomDomain ? window.location.hostname : firebaseConfig.authDomain
};

let app;
try {
  app = initializeApp(finalConfig);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  // Fallback or re-throw
  throw error;
}

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, finalConfig.firestoreDatabaseId || '(default)');
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
