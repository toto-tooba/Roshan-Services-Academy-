import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const recordPayment = async (data: {
  email: string;
  code: string;
  amount: number;
  tid?: string;
  screenshotUrl?: string;
  promoCode?: string | null;
}) => {
  const path = 'payments';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...data,
      uid: auth.currentUser?.uid || null,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
};

export const approvePaymentAndActivateUser = async (paymentId: string, email: string) => {
  const paymentPath = `payments/${paymentId}`;
  try {
    // 1. Update Payment Status
    const paymentRef = doc(db, 'payments', paymentId);
    await updateDoc(paymentRef, {
      status: 'approved',
      verifiedAt: serverTimestamp(),
    });

    // 2. Activate User Account
    // We search for user by email if they aren't the current user, 
    // but usually, we activate the current user if they just paid.
    const userUid = auth.currentUser?.uid;
    if (userUid) {
      const userRef = doc(db, 'users', userUid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        await updateDoc(userRef, {
          isActivated: true
        });
      } else {
        // Create user doc if it doesn't exist
        await setDoc(userRef, {
          uid: userUid,
          email: email,
          isActivated: true,
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
    }
    
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, paymentPath);
  }
};

export const checkUserActivation = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const userSnap = await getDoc(doc(db, 'users', uid));
    if (userSnap.exists()) {
      return userSnap.data().isActivated === true;
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const getOrCreatePaymentRefCode = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().paymentRefCode) {
      return userSnap.data().paymentRefCode as string;
    }
    
    // Generate unique reference code: RSA-XXXXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newCode = `RSA-${result}`;
    
    // Store in user record
    await setDoc(userRef, { paymentRefCode: newCode }, { merge: true });
    
    return newCode;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
};

export interface PaymentSettings {
  receiverName: string;
  receiverNumber: string;
  courseFee: number;
  raastId: string;
}

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
  const path = 'settings/payment';
  try {
    const docRef = doc(db, 'settings', 'payment');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        receiverName: data.receiverName || "Shamas ud Din",
        receiverNumber: data.receiverNumber || "03205998280",
        courseFee: typeof data.courseFee === 'number' ? data.courseFee : 980,
        raastId: data.raastId || "03205998280"
      };
    } else {
      return {
        receiverName: "Shamas ud Din",
        receiverNumber: "03205998280",
        courseFee: 980,
        raastId: "03205998280"
      };
    }
  } catch (error) {
    console.error("error loading payment settings, returning defaults:", error);
    return {
      receiverName: "Shamas ud Din",
      receiverNumber: "03205998280",
      courseFee: 980,
      raastId: "03205998280"
    };
  }
};

export const updatePaymentSettings = async (settings: PaymentSettings) => {
  const path = 'settings/payment';
  try {
    const docRef = doc(db, 'settings', 'payment');
    await setDoc(docRef, settings, { merge: true });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
};

export const checkDuplicateTransaction = async (transactionId: string, currentPaymentId?: string): Promise<boolean> => {
  if (!transactionId) return false;
  const path = 'payments';
  try {
    const q = query(
      collection(db, path),
      where('tid', '==', transactionId.trim())
    );
    const snap = await getDocs(q);
    if (snap.empty) return false;
    
    // Check if there are matches other than the current payment id
    const duplicates = snap.docs.filter(doc => doc.id !== currentPaymentId);
    return duplicates.length > 0;
  } catch (error) {
    console.error("Error checking duplicate transaction:", error);
    return false;
  }
};
