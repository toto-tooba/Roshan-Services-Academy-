import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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
// AI Studio development previews run inside iframe containers where gRPC/WebSockets are blocked,
// so force long-polling is required there. But in deployed production domains like Vercel,
// we must use standard WebSockets with automatic fallback to prevent offline connection timeouts.
const isSandboxEnv = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname.endsWith('.run.app') ||
   window.location.hostname.includes('run.app') ||
   window.location.hostname.includes('aistudio') ||
   window.self !== window.top);

const firestoreSettings: any = {
  useFetchStreams: false
};

if (isSandboxEnv) {
  firestoreSettings.experimentalForceLongPolling = true;
} else {
  firestoreSettings.experimentalAutoDetectLongPolling = true;
}

export const db = initializeFirestore(app, firestoreSettings, finalConfig.firestoreDatabaseId || '(default)');

if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn("Firestore offline persistence failed to enable:", err.code);
  });
}

export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
