import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocFromCache,
  setDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

interface UserProfile {
  uid: string;
  email?: string;
  isActivated?: boolean;
  role?: string;
  username?: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  accessCode?: string;
  promoCode?: string;
  institution?: string;
  age?: number;
  class?: string;
  city?: string;
  examDate?: string;
  targetExam?: string;
  createdAt: any;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthorized: boolean;
  adminPassword: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signUpWithAccessCode: (data: { 
    email: string, 
    pass: string, 
    name: string, 
    code: string,
    age?: number,
    city?: string,
    institution?: string,
    promoCode?: string,
    class?: string
  }) => Promise<{ success: boolean; error?: string; data?: any }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  linkAccessCode: (code: string, details: { name?: string, age?: number, class?: string, city?: string, institution?: string, promoCode?: string }) => Promise<{ success: boolean; error?: string }>;
  authorizeAdmin: (password: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adminPassword, setAdminPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    // 1. Immediately load fast-path cached profile from localStorage if present
    const localCached = localStorage.getItem(`user_profile_${uid}`);
    if (localCached) {
      try {
        setProfile(JSON.parse(localCached) as UserProfile);
      } catch (e) {
        console.warn('Error parsing local cached profile:', e);
      }
    }

    try {
      const docRef = doc(db, 'users', uid);
      let docSnap = null;
      
      try {
        // Try getting from server
        docSnap = await getDoc(docRef);
      } catch (networkErr: any) {
        console.warn('Network getDoc failed/offline. Trying Firestore offline cache...', networkErr);
        // Fallback to offline cached doc
        try {
          docSnap = await getDocFromCache(docRef);
        } catch (cacheErr) {
          console.error('Firestore cache getDoc failed too:', cacheErr);
        }
      }

      if (docSnap && docSnap.exists()) {
        const profileData = docSnap.data() as UserProfile;
        setProfile(profileData);
        localStorage.setItem(`user_profile_${uid}`, JSON.stringify(profileData));
      } else if (!docSnap) {
        // We are offline/network blocked and no firestore cache doc was found.
        // If we don't even have localStorage, set up a generic offline fallback profile to keep the UI interactive.
        if (!localCached) {
          const fallbackProfile: UserProfile = {
            uid,
            email: auth.currentUser?.email || '',
            isActivated: true, // Let them browse available items offline
            role: 'user',
            displayName: auth.currentUser?.displayName || 'Student',
            photoURL: auth.currentUser?.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
        }
      } else {
        // Doc snap exists but doesn't exist in backend/cache: means account needs a new profile
        const newProfile: UserProfile = {
          uid,
          email: auth.currentUser?.email || '',
          isActivated: false,
          role: 'user',
          displayName: auth.currentUser?.displayName || 'Student',
          photoURL: auth.currentUser?.photoURL || '',
          createdAt: serverTimestamp(),
        };
        try {
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
          localStorage.setItem(`user_profile_${uid}`, JSON.stringify(newProfile));
        } catch (writeErr) {
          console.error('Failed to save initial profile on server (offline/blocked):', writeErr);
          setProfile(newProfile);
          localStorage.setItem(`user_profile_${uid}`, JSON.stringify(newProfile));
        }
      }
    } catch (err) {
      console.error('Error fetching profile in safe top-level wrapper:', err);
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
        
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setProfile(docSnap.data() as UserProfile);
            }
          }, (err) => {
            console.error('Real-time profile listener error:', err);
          });
        } catch (e) {
          console.error('Failed to attach real-time profile listener:', e);
        }
      } else {
        setProfile(null);
        setAdminPassword(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const msg = (err?.message || err?.code || '').toLowerCase();
      if (
        msg.includes('closed') || 
        msg.includes('cancelled') || 
        msg.includes('blocked') || 
        msg.includes('cancel') ||
        msg.includes('popup')
      ) {
        console.warn('Google Sign-In popup closed or blocked in iframe:', err);
      } else {
        console.error('Google Sign-In failed:', err);
      }
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      console.error('Email Sign-In failed:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      // Profile creation is handled by onAuthStateChanged -> fetchProfile
    } catch (err) {
      console.error('Email Sign-Up failed:', err);
      throw err;
    }
  };

  const signUpWithAccessCode = async (data: { 
    email: string, 
    pass: string, 
    name: string, 
    code: string,
    age?: number,
    city?: string,
    institution?: string,
    promoCode?: string,
    class?: string
  }) => {
    try {
      const cleanCode = data.code.trim().toUpperCase();
      // 1. Check if code is valid first
      const codeRef = doc(db, 'global_access_codes', cleanCode);
      const codeSnap = await getDoc(codeRef);
      
      if (!codeSnap.exists() && cleanCode !== 'ADMIN123' && cleanCode !== 'ADMIN124') {
        return { success: false, error: 'Invalid access code' };
      }
      
      if (codeSnap.exists()) {
        const codeData = codeSnap.data();
        if (codeData.used_at) {
          return { success: false, error: 'Access code already used' };
        }
      }

      // 2. Create account
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      await updateProfile(userCredential.user, { displayName: data.name });

      // 3. Link code and set profile
      const details = {
        age: data.age || 0,
        city: data.city || '',
        institution: data.institution || '',
        promoCode: data.promoCode || '',
        class: data.class || 'Student'
      };

      if (cleanCode === 'ADMIN123' || cleanCode === 'ADMIN124') {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: data.email,
          displayName: data.name,
          accessCode: cleanCode,
          isAdmin: true,
          isActivated: true,
          createdAt: serverTimestamp(),
          ...details
        }, { merge: true });
      } else {
        const codeData = codeSnap.data();
        const role = codeData?.role || 'student';

        // Update code doc
        await updateDoc(codeRef, {
          used_at: serverTimestamp(),
          device_id: userCredential.user.uid,
          name: data.name,
          email: data.email,
          ...details
        });

        if (data.promoCode) {
          const promoRef = doc(db, 'promocodes', data.promoCode.trim().toUpperCase());
          const promoSnap = await getDoc(promoRef);
          if (promoSnap.exists()) {
            await updateDoc(promoRef, {
              usedCount: (promoSnap.data().usedCount || 0) + 1
            });
          }
        }

        // Update user profile
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: data.email,
          displayName: data.name,
          accessCode: cleanCode,
          isAdmin: role === 'admin',
          isActivated: true,
          createdAt: serverTimestamp(),
          ...details
        }, { merge: true });
      }

      return { success: true, data: codeSnap.exists() ? codeSnap.data() : null };
    } catch (err: any) {
      console.error('Sign up with access code failed:', err);
      if (err.code === 'auth/email-already-in-use') {
        return { success: false, error: 'This email is already registered.' };
      }
      if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
        return { success: false, error: 'auth/operation-not-allowed' };
      }
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, data, { merge: true });
      setProfile(prev => prev ? { ...prev, ...data } : (data as UserProfile));
    } catch (err) {
      console.error('Update profile failed:', err);
      throw err;
    }
  };

  const linkAccessCode = async (code: string, details: { name?: string, age?: number, class?: string, city?: string, institution?: string, promoCode?: string }) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const cleanCode = code.trim().toUpperCase();
      // Fast local fallback for dev admin testing
      if (cleanCode === 'ADMIN123' || cleanCode === 'ADMIN124') {
        await updateUserProfile({ 
          accessCode: cleanCode,
          isAdmin: true,
          ...details
        });
        return { success: true };
      }

      const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      
      const codeRef = doc(db, 'global_access_codes', cleanCode);
      const codeSnap = await getDoc(codeRef);
      
      if (!codeSnap.exists()) {
        return { success: false, error: 'Invalid access code' };
      }
      
      const codeData = codeSnap.data();
      if (codeData.used_at) {
        if (codeData.device_id !== user.uid) {
          return { success: false, error: 'Access code already used' };
        }
        // If used by current user, proceed to ensure profile is updated
      }

      await updateDoc(codeRef, {
        used_at: codeData.used_at || serverTimestamp(),
        device_id: user.uid,
        name: user.displayName || details.name || '',
        email: user.email || '',
        ...details
      });

      if (details.promoCode) {
        const promoRef = doc(db, 'promocodes', details.promoCode.trim().toUpperCase());
        const promoSnap = await getDoc(promoRef);
        if (promoSnap.exists()) {
          await updateDoc(promoRef, {
            usedCount: (promoSnap.data().usedCount || 0) + 1
          });
        }
      }

      const role = codeData.role || 'student';

      await updateUserProfile({ 
        accessCode: cleanCode,
        isAdmin: role === 'admin',
        isActivated: true,
        ...details
      });
      return { success: true };
    } catch (err) {
      console.error('Code verification error:', err);
      return { success: false, error: 'Connection error' };
    }
  };

  const authorizeAdmin = async (password: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      // Basic static admin check if we don't have backend API
      if (password === 'roshanservices123') {
        await updateUserProfile({ isAdmin: true });
        setAdminPassword(password);
        return { success: true };
      }
      else {
          return { success: false, error: 'Invalid admin password' };
      }
    } catch (err) {
      return { success: false, error: 'Connection error' };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.uid);
    }
  };

  const isAuthorized = !!profile?.accessCode || !!profile?.isAdmin || !!profile?.isActivated;

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAuthorized, 
      adminPassword,
      signInWithGoogle, 
      signInWithEmail,
      signUpWithEmail,
      signUpWithAccessCode,
      logout, 
      updateUserProfile, 
      linkAccessCode,
      authorizeAdmin,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
