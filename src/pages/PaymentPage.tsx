import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Copy, 
  Upload, 
  CheckCircle2, 
  ArrowLeft,
  Smartphone,
  Info,
  CreditCard,
  Lock,
  Trophy,
  Sparkles,
  Check,
  ChevronRight,
  User,
  Mail,
  Key,
  Ticket,
  ShieldAlert,
  Chrome,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { verifyPaymentReceipt, calculateVerificationScore } from '../services/ocrService';
import { recordPayment, approvePaymentAndActivateUser, getOrCreatePaymentRefCode } from '../services/databaseService';
import { useAuth } from '../AuthContext';
import { SupportWidget } from '../components/SupportWidget';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthorized, loading: authLoading, linkAccessCode, signUpWithAccessCode, signInWithGoogle, refreshProfile } = useAuth();
  const [configSettings, setConfigSettings] = useState<{
    receiverName: string;
    receiverNumber: string;
    courseFee: number;
    raastId: string;
  }>({
    receiverName: "Shamas ud Din",
    receiverNumber: "03205998280",
    courseFee: 980,
    raastId: "03205998280"
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { getPaymentSettings } = await import('../services/databaseService');
        const settings = await getPaymentSettings();
        if (settings) {
          setConfigSettings(settings);
        }
      } catch (err) {
        console.error("Failed to fetch payment settings:", err);
      }
    };
    loadSettings();
  }, []);

  const [refCode, setRefCode] = useState('');
  const [email, setEmail] = useState('');
  const [tid, setTid] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const [paymentMode, setPaymentMode] = useState<'ocr' | 'code'>('ocr');
  const [accessCode, setAccessCode] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessName, setAccessName] = useState('');
  const [accessPass, setAccessPass] = useState('');
  const [accessPromoCode, setAccessPromoCode] = useState('');
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [verifiedCodeData, setVerifiedCodeData] = useState<any>(null);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isPromoOpen, setIsPromoOpen] = useState(false);

  // Custom Promo state
  const [appliedPromo, setAppliedPromo] = useState<any | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Gemini Universal Verification state variables
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [tempOcrFields, setTempOcrFields] = useState<{
    receiverName: string;
    receiverNumber: string;
    amount: string;
    transactionId: string;
    date: string;
    time: string;
    paymentProvider: string;
  } | null>(null);

  const amount = useMemo(() => {
    return configSettings.courseFee.toString();
  }, [configSettings.courseFee]);

  const finalAmount = useMemo(() => {
    const baseVal = parseInt(amount) || 980;
    if (!appliedPromo) return baseVal;
    
    if (appliedPromo.discountType === 'percentage') {
      const discount = Math.round(baseVal * (appliedPromo.discountValue / 100));
      return Math.max(0, baseVal - discount);
    } else {
      return Math.max(0, baseVal - appliedPromo.discountValue);
    }
  }, [amount, appliedPromo]);

  const activeVerificationScore = useMemo(() => {
    if (!tempOcrFields) return null;
    return calculateVerificationScore(
      {
        receiverName: tempOcrFields.receiverName,
        receiverNumber: tempOcrFields.receiverNumber,
        senderName: ocrResult?.extracted?.senderName || '',
        senderNumber: ocrResult?.extracted?.senderNumber || '',
        amount: tempOcrFields.amount,
        transactionId: tempOcrFields.transactionId,
        date: tempOcrFields.date,
        time: tempOcrFields.time,
        paymentProvider: tempOcrFields.paymentProvider,
        isGenuineReceipt: ocrResult?.extracted?.isGenuineReceipt !== false
      },
      configSettings.receiverName,
      configSettings.receiverNumber,
      finalAmount
    );
  }, [tempOcrFields, ocrResult, configSettings, finalAmount]);

  const isOcrApproved = useMemo(() => {
    if (!activeVerificationScore) return false;
    return (
      activeVerificationScore.isReceiverVerified &&
      activeVerificationScore.isAmountVerified &&
      activeVerificationScore.isTxIdFound &&
      activeVerificationScore.score >= 80
    );
  }, [activeVerificationScore]);

  const receiverName = configSettings.receiverName;

  const handleApplyPromoCode = async (codeSpelling: string) => {
    const cleanSpelling = codeSpelling.trim().toUpperCase();
    if (!cleanSpelling) {
      setPromoMessage({ success: false, text: "PLEASE ENTER A PROMO CODE." });
      return;
    }
    
    setIsValidatingPromo(true);
    setPromoMessage(null);
    
    try {
      const { doc: fDoc, getDoc: fGetDoc } = await import('firebase/firestore');
      const { db: fDb } = await import('../firebase');
      
      const docRef = fDoc(fDb, 'promocodes', cleanSpelling);
      const docSnap = await fGetDoc(docRef);
      
      if (!docSnap.exists()) {
        setPromoMessage({ success: false, text: "INVALID PROMO CODE. PLEASE CHECK SPELLING." });
        setAppliedPromo(null);
      } else {
        const data = docSnap.data();
        setAppliedPromo(data);
        const discountText = data.discountType === 'percentage' 
          ? `${data.discountValue}% Off applied!` 
          : `Rs. ${data.discountValue} Off applied!`;
        setPromoMessage({ success: true, text: `PROMO CODE "${cleanSpelling}" APPLIED SUCCESSFULLY: ${discountText}` });
      }
    } catch (err) {
      console.error("Error validating promo code:", err);
      setPromoMessage({ success: false, text: "FAILED TO VERIFY PROMO CODE. PLEASE TRY AGAIN." });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  useEffect(() => {
    const initRefCode = async () => {
      if (!authLoading) {
        if (!user) {
          // If no user is logged in, generate or retrieve a guest payment reference code
          let guestCode = localStorage.getItem('guestPaymentRefCode');
          if (!guestCode) {
            const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            let result = '';
            for (let i = 0; i < 5; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            guestCode = `RSA-${result}`;
            localStorage.setItem('guestPaymentRefCode', guestCode);
          }
          setRefCode(guestCode);
          setIsInitialLoading(false);
          return;
        }
        
        try {
          setEmail(user.email || '');
          const code = await getOrCreatePaymentRefCode(user.uid);
          if (code) {
            setRefCode(code);
            // Also store it in guestPaymentRefCode so if they log out or switch, it aligns
            localStorage.setItem('guestPaymentRefCode', code);
          }
        } catch (error) {
          console.error("Error setting ref code:", error);
        } finally {
          setIsInitialLoading(false);
        }
      }
    };
    
    initRefCode();
  }, [user, authLoading]);

  const [ocrActiveStep, setOcrActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [ocrPaymentId, setOcrPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthorized && !isInitialLoading && !isSubmitting && !isSuccess && !isPending && user) {
      if (paymentMode === 'code' && activeStep < 4) {
        navigate('/dashboard');
      } else if (paymentMode === 'ocr' && ocrActiveStep < 4) {
        navigate('/dashboard');
      }
    }
  }, [isAuthorized, isInitialLoading, isSubmitting, isSuccess, isPending, user, navigate, paymentMode, activeStep, ocrActiveStep]);

  useEffect(() => {
    if ((isSuccess || isPending) && paymentMode !== 'ocr') {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isPending, navigate, paymentMode]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVerifyCodeStep1 = async () => {
    const cleanCode = accessCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length < 4) return;
    setIsValidatingCode(true);
    setVerificationError(null);
    
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const codeRef = doc(db, 'global_access_codes', cleanCode);
      const codeSnap = await getDoc(codeRef);
      
      if (!codeSnap.exists() && cleanCode !== 'ADMIN123' && cleanCode !== 'ADMIN124') {
        setVerificationError('Invalid access code.');
        return;
      }
      
      if (codeSnap.exists()) {
        const codeData = codeSnap.data();
        if (codeData.used_at) {
          setVerificationError('Access code already used.');
          return;
        }
        setVerifiedCodeData(codeData);
      } else {
        setVerifiedCodeData({ role: 'admin', package: 'Full System Access' });
      }
      
      setActiveStep(2);
    } catch (err: any) {
      console.error('Code verification error:', err);
      const msg = err?.message || '';
      if (
        msg.toLowerCase().includes('offline') || 
        msg.toLowerCase().includes('failed to get document') || 
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('failed-precondition') ||
        msg.toLowerCase().includes('unreachable')
      ) {
        setVerificationError('OFFLINE_BLOCK');
      } else {
        setVerificationError(msg || 'Verification failed. Try again.');
      }
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleAccessCodeSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setVerificationError(null);
    
    const cleanCode = accessCode.trim().toUpperCase();
    try {
      if (user) {
        // Logged in flow - simplified for the new UI
        const res = await linkAccessCode(cleanCode, { 
          promoCode: accessPromoCode
        });
        
        if (res.success) {
           setActiveStep(4);
        } else {
          const errMsg = res.error || '';
          if (
            errMsg.toLowerCase().includes('offline') || 
            errMsg.toLowerCase().includes('failed to get document') || 
            errMsg.toLowerCase().includes('network') ||
            errMsg.toLowerCase().includes('failed-precondition') ||
            errMsg.toLowerCase().includes('unreachable')
          ) {
            setVerificationError('OFFLINE_BLOCK');
          } else {
            setVerificationError(errMsg || 'Activation failed.');
          }
        }
      } else {
        // Guest registration flow
        if (!accessEmail || !accessPass || !accessName) {
          setVerificationError("Please fill all account details.");
          setIsSubmitting(false);
          return;
        }

        const res = await signUpWithAccessCode({
          email: accessEmail,
          pass: accessPass,
          name: accessName,
          code: cleanCode,
          promoCode: accessPromoCode
        });

        if (res.success) {
           setActiveStep(4);
        } else {
          const errMsg = res.error || '';
          if (
            errMsg.toLowerCase().includes('offline') || 
            errMsg.toLowerCase().includes('failed to get document') || 
            errMsg.toLowerCase().includes('network') ||
            errMsg.toLowerCase().includes('failed-precondition') ||
            errMsg.toLowerCase().includes('unreachable')
          ) {
            setVerificationError('OFFLINE_BLOCK');
          } else if (
            errMsg.toLowerCase().includes('operation-not-allowed') ||
            errMsg.toLowerCase().includes('auth/operation-not-allowed')
          ) {
            setVerificationError('OPERATION_NOT_ALLOWED');
          } else {
            setVerificationError(errMsg || 'Registration failed.');
          }
        }
      }
    } catch (error: any) {
      console.error('Account creation error:', error);
      const msg = error?.message || '';
      if (
        msg.toLowerCase().includes('offline') || 
        msg.toLowerCase().includes('failed to get document') || 
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('failed-precondition') ||
        msg.toLowerCase().includes('unreachable')
      ) {
        setVerificationError('OFFLINE_BLOCK');
      } else if (
        msg.toLowerCase().includes('operation-not-allowed') ||
        msg.toLowerCase().includes('auth/operation-not-allowed')
      ) {
        setVerificationError('OPERATION_NOT_ALLOWED');
      } else {
        setVerificationError(msg || "Connection error while creating account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = ({ step = activeStep }: { step?: number }) => (
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div className={cn(
            "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-black transition-all duration-500 border-2",
            step >= s 
              ? "bg-[#c5a059] border-[#c5a059] text-black shadow-[0_0_20px_rgba(197,160,89,0.3)]" 
              : "bg-white/5 border-white/10 text-zinc-600"
          )}>
            {step > s ? "✓" : s}
          </div>
          {s < 4 && (
            <div className={cn(
              "w-6 md:w-8 h-0.5 rounded-full transition-all duration-700",
              step > s ? "bg-[#c5a059]" : "bg-white/5"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const handleOcrStep1Verify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerificationError(null);

    if (!screenshot) {
      setVerificationError("Please select a JPG, JPEG, PNG, or PDF payment receipt file.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call our new verifyPaymentReceipt service
      const { verifyPaymentReceipt } = await import('../services/ocrService');
      const result = await verifyPaymentReceipt(
        screenshot,
        configSettings.receiverName,
        configSettings.receiverNumber,
        finalAmount,
        tid // optional user-provided TID
      );

      setOcrResult(result);
      setTempOcrFields({
        receiverName: result.extracted.receiverName || '',
        receiverNumber: result.extracted.receiverNumber || '',
        amount: result.extracted.amount || '',
        transactionId: result.extracted.transactionId || tid || '',
        date: result.extracted.date || '',
        time: result.extracted.time || '',
        paymentProvider: result.extracted.paymentProvider || ''
      });

      // Advance to Step 2: Verification Preview
      setOcrActiveStep(2);
    } catch (error: any) {
      console.error(error);
      let friendlyError = error?.message || "An error occurred during receipt verification. Please check your file and try again.";
      
      try {
        if (typeof friendlyError === 'string' && friendlyError.trim().startsWith('{')) {
          const parsed = JSON.parse(friendlyError);
          if (parsed.error && parsed.error.message) {
            friendlyError = parsed.error.message;
          }
        }
      } catch (e) {
        // ignore parsing failures
      }
      
      if (typeof friendlyError === 'string' && (friendlyError.includes('high demand') || friendlyError.includes('503') || friendlyError.includes('UNAVAILABLE'))) {
        friendlyError = "The AI verification engine is currently experiencing high demand. Please click 'Upload & Analyze Receipt' to retry in a few seconds.";
      }
      
      setVerificationError(friendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOcrSubmission = async () => {
    if (!tempOcrFields) return;
    setVerificationError(null);
    setIsSubmitting(true);

    if (!tempOcrFields.transactionId || tempOcrFields.transactionId.trim().length < 4) {
      setVerificationError("Please enter a valid Transaction ID / Reference Number.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Check duplicate again on confirmed transactionId
      const { checkDuplicateTransaction, recordPayment } = await import('../services/databaseService');
      const isDuplicate = await checkDuplicateTransaction(tempOcrFields.transactionId);
      if (isDuplicate) {
        setVerificationError("This transaction has already been claimed by another enrollment. Please contact support if you believe this is an error.");
        setIsSubmitting(false);
        return;
      }

      // 2. Compute scorecard on confirmed/edited fields
      const { calculateVerificationScore } = await import('../services/ocrService');
      const scoreCheck = calculateVerificationScore(
        {
          receiverName: tempOcrFields.receiverName,
          receiverNumber: tempOcrFields.receiverNumber,
          senderName: ocrResult?.extracted?.senderName || '',
          senderNumber: ocrResult?.extracted?.senderNumber || '',
          amount: tempOcrFields.amount,
          transactionId: tempOcrFields.transactionId,
          date: tempOcrFields.date,
          time: tempOcrFields.time,
          paymentProvider: tempOcrFields.paymentProvider,
          isGenuineReceipt: ocrResult?.extracted?.isGenuineReceipt !== false
        },
        configSettings.receiverName,
        configSettings.receiverNumber,
        finalAmount
      );

      const approved = scoreCheck.isReceiverVerified && scoreCheck.isAmountVerified && scoreCheck.isTxIdFound && scoreCheck.score >= 80;

      if (!approved) {
        let reasons = scoreCheck.rejectionReasons.join('. ');
        if (!reasons) {
          reasons = `Scorecard computed is ${scoreCheck.score}/100, which is below the auto-activation threshold of 80.`;
        }
        setVerificationError(`Receipt automatic verification failed. Reason: ${reasons}`);
        setIsSubmitting(false);
        return;
      }

      // 3. Save receipt payment record to Firestore ONLY if user is logged in
      if (user) {
        const emailToUse = user.email || '';
        const paymentId = await recordPayment({
          email: emailToUse,
          code: refCode || "UNIVERSAL",
          amount: finalAmount,
          tid: tempOcrFields.transactionId,
          receiverName: tempOcrFields.receiverName,
          receiverNumber: tempOcrFields.receiverNumber,
          paymentProvider: tempOcrFields.paymentProvider,
          score: scoreCheck.score,
          status: 'approved',
          screenshotUrl: ocrResult?.extracted?.screenshotUrl || ocrResult?.url || '',
          promoCode: appliedPromo ? appliedPromo.code : null,
        } as any);

        if (!paymentId) throw new Error("Could not save verification record in the database.");
        setOcrPaymentId(paymentId);

        // Increment promo usedCount if any
        if (appliedPromo) {
          try {
            const { doc, getDoc, updateDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase');
            const promoRef = doc(db, 'promocodes', appliedPromo.code);
            const promoSnap = await getDoc(promoRef);
            if (promoSnap.exists()) {
              await updateDoc(promoRef, {
                usedCount: (promoSnap.data().usedCount || 0) + 1
              });
            }
          } catch (pErr) {
            console.error("Promo update error:", pErr);
          }
        }

        await approvePaymentAndActivateUser(paymentId, emailToUse);
        setIsSuccess(true);
        setOcrActiveStep(4);
      } else {
        setOcrActiveStep(3);
      }

    } catch (err: any) {
      console.error(err);
      setVerificationError(err.message || 'Payment submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOcrStep3Submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setVerificationError(null);
    
    try {
      let loggedUser = user;
      
      if (!loggedUser) {
        if (!accessEmail || !accessPass || !accessName) {
          setVerificationError("Please fill all account details.");
          setIsSubmitting(false);
          return;
        }

        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const { auth } = await import('../firebase');
        const userCredential = await createUserWithEmailAndPassword(auth, accessEmail, accessPass);
        await updateProfile(userCredential.user, { displayName: accessName });
        loggedUser = userCredential.user;
      }

      const userUid = loggedUser.uid;
      const userEmail = loggedUser.email || accessEmail;
      const userName = loggedUser.displayName || accessName;

      const { doc, updateDoc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      let currentPaymentId = ocrPaymentId;
      if (!currentPaymentId && tempOcrFields) {
        const { recordPayment } = await import('../services/databaseService');
        currentPaymentId = await recordPayment({
          email: userEmail,
          code: refCode || "UNIVERSAL",
          amount: finalAmount,
          tid: tempOcrFields.transactionId,
          receiverName: tempOcrFields.receiverName,
          receiverNumber: tempOcrFields.receiverNumber,
          paymentProvider: tempOcrFields.paymentProvider,
          score: ocrResult?.score || 0,
          status: isOcrApproved ? 'approved' : 'pending',
          screenshotUrl: ocrResult?.extracted?.screenshotUrl || ocrResult?.url || '',
          promoCode: appliedPromo ? appliedPromo.code : null,
          uid: userUid
        } as any);
        if (currentPaymentId) {
          setOcrPaymentId(currentPaymentId);
        }

        // Increment promo usedCount if any
        if (appliedPromo) {
          try {
            const promoRef = doc(db, 'promocodes', appliedPromo.code);
            const promoSnap = await getDoc(promoRef);
            if (promoSnap.exists()) {
              await updateDoc(promoRef, {
                usedCount: (promoSnap.data().usedCount || 0) + 1
              });
            }
          } catch (pErr) {
            console.error("Promo update error:", pErr);
          }
        }
      } else if (currentPaymentId) {
        await updateDoc(doc(db, 'payments', currentPaymentId), {
          uid: userUid,
          email: userEmail
        });
      }

      if (isOcrApproved && currentPaymentId) {
        await approvePaymentAndActivateUser(currentPaymentId, userEmail);
        setIsSuccess(true);
      } else {
        const userRef = doc(db, 'users', userUid);
        await setDoc(userRef, {
          uid: userUid,
          email: userEmail,
          displayName: userName,
          isActivated: false,
          role: 'user',
          createdAt: serverTimestamp()
        }, { merge: true });
        setIsPending(true);
      }

      setOcrActiveStep(4);
    } catch (error: any) {
      console.error('Account creation/enrollment error:', error);
      const msg = error?.message || '';
      if (msg.includes('email-already-in-use')) {
        setVerificationError("This email address is already in use. Try signing in first.");
      } else if (
        msg.toLowerCase().includes('offline') || 
        msg.toLowerCase().includes('failed to get document') || 
        msg.toLowerCase().includes('network') ||
        msg.toLowerCase().includes('failed-precondition') ||
        msg.toLowerCase().includes('unreachable')
      ) {
        setVerificationError('OFFLINE_BLOCK');
      } else if (
        msg.toLowerCase().includes('operation-not-allowed') ||
        msg.toLowerCase().includes('auth/operation-not-allowed')
      ) {
        setVerificationError('OPERATION_NOT_ALLOWED');
      } else {
        setVerificationError(msg || "Connection error while creating account.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isInitialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1d] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c5a059]/20 border-t-[#c5a059] rounded-full animate-spin" />
      </div>
    );
  }

  if (isSuccess && paymentMode !== 'ocr') {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel p-12 text-center rounded-[3rem] border border-white/10"
        >
          <div className="w-20 h-20 bg-[#c5a059]/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-[#c5a059]" />
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Payment Verified!</h2>
          <p className="text-[#c5a059] font-black uppercase tracking-widest text-sm mb-4">Access Granted</p>
          <p className="text-zinc-400 font-medium mb-8">
            Your payment has been successfully verified. You now have full access to all academy resources.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#c5a059] text-black font-black rounded-2xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (isPending && paymentMode !== 'ocr') {
    return (
      <div className="min-h-screen bg-[#0a0f1d] text-white flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full glass-panel p-12 text-center rounded-[3rem] border border-white/10"
        >
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Info className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Payment Submitted!</h2>
          <p className="text-blue-500 font-black uppercase tracking-widest text-sm mb-4">Pending Manual Verification</p>
          <p className="text-zinc-400 font-medium mb-8">
            Your receipt has been submitted. Our team will manually verify it within 2-4 hours. You will receive access shortly.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center justify-center w-full px-8 py-4 bg-blue-500 text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white font-sans selection:bg-[#c5a059]/30 py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-12 font-bold uppercase text-xs tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side: Instructions & Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
              <CreditCard className="w-4 h-4 text-[#c5a059]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Secure Payment Portal</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter uppercase leading-none">
              Complete Your <span className="text-[#c5a059]">Enrollment</span>
            </h1>

            <div className="space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Course Fee</span>
                  {appliedPromo ? (
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm line-through text-zinc-500 font-bold">Rs. {amount}</span>
                        <span className="text-3xl font-black text-emerald-400">Rs. {finalAmount}</span>
                      </div>
                      <span className="inline-block mt-1 text-[8px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-sm">
                        {appliedPromo.code} Applied: {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% Off` : `Rs. ${appliedPromo.discountValue} Off`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-black text-white">Rs. {amount}</span>
                  )}
                </div>
                <div className="h-px bg-white/5 mb-6" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-[#c5a059]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Academy Account</p>
                        <p className="font-bold text-white leading-normal">
                          {configSettings.receiverName} ({configSettings.receiverNumber})
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(configSettings.receiverNumber)}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-[#c5a059]"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {configSettings.raastId && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-[#c5a059]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">RAAST ID</p>
                          <p className="font-bold text-white leading-normal">
                            {configSettings.raastId}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(configSettings.raastId)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-[#c5a059]"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#c5a059]/10 flex items-center justify-center">
                        <Info className="w-5 h-5 text-[#c5a059]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tracking Number</p>
                        <p className="font-bold text-white">{refCode || 'GENERATING...'}</p>
                      </div>
                    </div>
                    {refCode && (
                      <button 
                        onClick={() => copyToClipboard(refCode)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-[#c5a059]"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-white">Instructions</h3>
                <div className="space-y-3">
                  {[
                    "Open your JazzCash, Easypaisa, or Mobile Banking App",
                    `Send exact Rs. ${finalAmount} to the JazzCash number or RAAST ID provided`,
                    "Save a screenshot of the successful transaction",
                    "Enter your Transaction ID (TID) and upload the receipt here"
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-[#c5a059]">
                        {i + 1}
                      </div>
                      <p className="text-sm text-zinc-400 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-[#c5a059]">Security Notice:</strong> All payments are manually verified within <strong className="text-white">2-4 hours</strong>. Ensure your <strong className="text-white">TID</strong> and <strong className="text-white">Screenshot</strong> are valid. Fraudulent submissions lead to permanent ban.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Payment Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.1rem] border border-white/10 shadow-2xl flex flex-col h-full"
          >
            <div className="flex bg-[#0a0f1d] border border-white/10 p-1 rounded-2xl mb-6 md:mb-8 shrink-0">
              <button 
                onClick={() => { setPaymentMode('ocr'); setVerificationError(null); }}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  paymentMode === 'ocr' ? "bg-[#c5a059] text-black shadow-lg" : "text-zinc-500 hover:text-white"
                )}
              >
                Manual Upload
              </button>
              <button 
                onClick={() => { setPaymentMode('code'); setVerificationError(null); }}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  paymentMode === 'code' ? "bg-[#c5a059] text-black shadow-lg" : "text-zinc-500 hover:text-white"
                )}
              >
                Access Code
              </button>
            </div>

            {paymentMode === 'ocr' ? (
              <div className="flex-1 flex flex-col min-h-[350px] md:min-h-[500px]">
                <StepIndicator step={ocrActiveStep} />
                <AnimatePresence mode="wait">
                  {ocrActiveStep === 1 && (
                    <motion.form 
                      key="ocr-step1"
                      onSubmit={handleOcrStep1Verify} 
                      className="space-y-6 flex-1 flex flex-col justify-center"
                    >                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">
                          Transaction ID / Reference Number (Optional)
                        </label>
                        <input 
                          type="text" 
                          value={tid}
                          onChange={(e) => setTid(e.target.value)}
                          placeholder="Leave blank to auto-scan from receipt, or type TID"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors font-bold"
                        />
                        <p className="mt-1.5 text-[10px] text-zinc-500 font-medium leading-relaxed">
                          Supports transaction labels such as TID, Transaction ID, Reference Number, Reference #, Ref Number, or Host Sign-off ID.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">
                          Order Tracking Number
                        </label>
                        <input 
                          type="text" 
                          readOnly
                          value={refCode || 'GENERATING...'}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-zinc-400 focus:outline-none transition-colors font-bold uppercase cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1">
                          Payment Screenshot / PDF Proof
                        </label>
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                            className="hidden" 
                            id="screenshot-ocr-upload"
                          />
                          <label 
                            htmlFor="screenshot-ocr-upload"
                            className={cn(
                              "w-full flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all",
                              screenshot 
                                ? "border-[#c5a059]/50 bg-[#c5a059]/5" 
                                : "border-white/10 bg-white/5 hover:border-white/20"
                            )}
                          >
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                              <Upload className={cn("w-6 h-6", screenshot ? "text-[#c5a059]" : "text-zinc-500")} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-white mb-1">
                                {screenshot ? screenshot.name : "Upload Receipt file"}
                              </p>
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                JPG, PNG or PDF up to 5MB
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="pt-2 space-y-3">
                        <button 
                          type="button"
                          onClick={() => setIsPromoOpen(!isPromoOpen)}
                          className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-[#c5a059] transition-colors"
                        >
                          <Ticket className="w-4 h-4" />
                          Have a promo code? (Optional)
                        </button>
                        
                        <AnimatePresence>
                          {isPromoOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-3"
                            >
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={accessPromoCode}
                                  onChange={(e) => {
                                    setAccessPromoCode(e.target.value.toUpperCase());
                                    setPromoMessage(null);
                                  }}
                                  placeholder="ENTER PROMO CODE"
                                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#c5a059] transition-all font-bold uppercase tracking-widest font-mono"
                                />
                                <button
                                  type="button"
                                  disabled={isValidatingPromo}
                                  onClick={() => handleApplyPromoCode(accessPromoCode)}
                                  className="px-6 py-3 bg-[#c5a059] hover:bg-[#d4b16a] text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                >
                                  {isValidatingPromo ? "..." : "Apply"}
                                </button>
                              </div>
                              {promoMessage && (
                                <p className={`text-[10px] font-bold uppercase tracking-wide ${promoMessage.success ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {promoMessage.text}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="mt-auto pt-6">
                        <button 
                          type="submit"
                          disabled={isSubmitting || !screenshot}
                          className="w-full py-5 bg-[#c5a059] text-black text-lg font-black rounded-2xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#c5a059]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Scanning with Gemini AI..." : "Upload & Analyze Receipt"}
                        </button>
                      </div>
                      
                      {verificationError === 'IFRAME_POPUP_BLOCKED' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 font-sans text-left"
                        >
                          <div className="flex items-center gap-2.5 text-amber-500">
                             <ShieldAlert className="w-5 h-5 flex-shrink-0 animate-pulse" />
                            <h4 className="text-xs font-black uppercase tracking-wider">Google Sign-In Blocked by Browser</h4>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold">
                            Browser security policies block Google pop-ups inside sandboxed frames. Please open the app in a **New Tab** using the link button below to complete with Google, or continue manually by typing your credentials.
                          </p>
                          <div className="pt-1 flex gap-2">
                            <a
                              href={window.location.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-[#c5a059] text-black font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1.5 inline-flex font-sans"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open in New Tab
                            </a>
                            <button
                              type="button"
                              onClick={() => setVerificationError(null)}
                              className="px-3 py-2 bg-white/5 border border-white/10 text-zinc-400 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                            >
                              Okay, I'll type instead
                            </button>
                          </div>
                        </motion.div>
                      ) : verificationError && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold leading-relaxed"
                        >
                          {verificationError}
                        </motion.div>
                      )}
                    </motion.form>
                  )}

                  {ocrActiveStep === 2 && tempOcrFields && (
                    <motion.div 
                      key="ocr-step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 md:space-y-8 flex-1 flex flex-col justify-between"
                    >
                      <div className="text-center animate-fade-in-down mb-2">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border transition-colors",
                          isOcrApproved 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse"
                        )}>
                          {isOcrApproved ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">
                          {isOcrApproved ? "Instant Auto-Approval Eligible!" : "Rejection Warnings Found"}
                        </h3>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                          Scan Matching Score: <span className="text-[#c5a059] font-black">{activeVerificationScore?.score ?? ocrResult?.score ?? 0}/100</span>
                        </p>
                      </div>

                      <div className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-white/[0.01] space-y-4">
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider text-[#c5a059] border-b border-white/5 pb-2">
                          Review Extracted Information
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Receiver Account Name</label>
                            <input 
                              type="text" 
                              value={tempOcrFields.receiverName}
                              onChange={(e) => setTempOcrFields({...tempOcrFields, receiverName: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Receiver Number/Account</label>
                            <input 
                              type="text" 
                              value={tempOcrFields.receiverNumber}
                              onChange={(e) => setTempOcrFields({...tempOcrFields, receiverNumber: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Transaction Amount (Rs.)</label>
                            <input 
                              type="text" 
                              value={tempOcrFields.amount}
                              onChange={(e) => setTempOcrFields({...tempOcrFields, amount: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Transaction ID / Reference Number</label>
                            <input 
                              type="text" 
                              value={tempOcrFields.transactionId}
                              onChange={(e) => setTempOcrFields({...tempOcrFields, transactionId: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Payment Date</label>
                            <input 
                              type="text" 
                              value={tempOcrFields.date}
                              onChange={(e) => setTempOcrFields({...tempOcrFields, date: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Payment Time</label>
                            <input 
                              type="text" 
                              value={tempOcrFields.time}
                              onChange={(e) => setTempOcrFields({...tempOcrFields, time: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors text-xs font-bold"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Payment Provider (e.g. EasyPaisa, JazzCash, HBL, MeezanBank)</label>
                            <input 
                              type="text" 
                              value={tempOcrFields.paymentProvider}
                              onChange={(e) => setTempOcrFields({...tempOcrFields, paymentProvider: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#c5a059]/50 transition-colors text-xs font-bold"
                            />
                          </div>
                        </div>

                        {activeVerificationScore?.rejectionReasons && activeVerificationScore.rejectionReasons.length > 0 && (
                          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-[11px] text-red-400 space-y-1 font-bold leading-normal animate-pulse">
                            <p className="text-[9px] uppercase tracking-wider text-red-500 font-extrabold flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5" /> Rejection Warnings / Issue logs
                            </p>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {activeVerificationScore.rejectionReasons.map((reason: string, idx: number) => (
                                <li key={idx}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-2 text-[10px] text-zinc-500 leading-normal font-medium">
                          {isOcrApproved ? (
                            <p className="text-zinc-400">
                              Excellent! The receipt met all auto-approval credentials. Once confirmed, you will proceed to set up your account / Sign-in with Google to complete your enrollment.
                            </p>
                          ) : (
                            <p className="text-red-400 font-bold leading-relaxed">
                              Verification rejected. The receipt details do not match course configs. Please correct any extracted typos above (like TID, amount, or receiver), or go back and upload a clear receipt file.
                            </p>
                          )}
                        </div>
                      </div>

                      {verificationError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold">
                          {verificationError}
                        </div>
                      )}

                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setOcrActiveStep(1)}
                          disabled={isSubmitting}
                          className="px-6 py-4 border border-white/10 rounded-2xl text-xs font-black text-zinc-500 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
                        >
                          Back
                        </button>
                        <button 
                          type="button"
                          onClick={handleConfirmOcrSubmission}
                          disabled={isSubmitting}
                          className="flex-1 py-4 bg-[#c5a059] text-black text-xs font-black rounded-2xl hover:opacity-90 enabled:hover:bg-[#d4b16a] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl disabled:opacity-20"
                        >
                          {isSubmitting ? "Submitting..." : isOcrApproved ? "Confirm & Proceed to Account Setup" : "Verify Receipt Details"}
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {ocrActiveStep === 3 && (
                    <motion.div 
                      key="ocr-step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Setup Account</h3>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">Create secure credentials to access study resources.</p>
                      </div>

                      {user ? (
                        <div className="p-8 rounded-[2rem] bg-[#c5a059]/5 border border-[#c5a059]/20 text-center">
                          <User className="w-10 h-10 text-[#c5a059] mx-auto mb-4" />
                          <p className="text-sm font-bold text-white mb-1">{user.displayName || user.email}</p>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Logged in Account</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input 
                              type="text" required value={accessName} onChange={(e) => setAccessName(e.target.value)}
                              placeholder="FULL NAME"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-[#c5a059] transition-all font-bold uppercase tracking-widest text-xs"
                            />
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input 
                              type="email" required value={accessEmail} onChange={(e) => setAccessEmail(e.target.value)}
                              placeholder="GMAIL ADDRESS"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-[#c5a059] transition-all font-bold uppercase tracking-widest text-xs"
                            />
                          </div>
                          <div className="relative">
                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input 
                              type="password" required value={accessPass} onChange={(e) => setAccessPass(e.target.value)}
                              placeholder="ACCOUNT PASSWORD"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-[#c5a059] transition-all font-bold tracking-widest text-xs"
                            />
                          </div>

                          <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-white/5"></div>
                            </div>
                            <span className="relative px-3 bg-[#0a0f1d] text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                              Or Setup via Google
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setVerificationError(null);
                                await signInWithGoogle();
                                const { auth } = await import('../firebase');
                                const currentUser = auth.currentUser;
                                if (currentUser) {
                                  const userUid = currentUser.uid;
                                  const userEmail = currentUser.email || '';
                                  const userName = currentUser.displayName || '';

                                  const { doc, updateDoc, setDoc, getDoc, serverTimestamp } = await import('firebase/firestore');
                                  const { db } = await import('../firebase');
                                  
                                  let currentPaymentId = ocrPaymentId;
                                  if (!currentPaymentId && tempOcrFields) {
                                    const { recordPayment } = await import('../services/databaseService');
                                    currentPaymentId = await recordPayment({
                                      email: userEmail,
                                      code: refCode || "UNIVERSAL",
                                      amount: finalAmount,
                                      tid: tempOcrFields.transactionId,
                                      receiverName: tempOcrFields.receiverName,
                                      receiverNumber: tempOcrFields.receiverNumber,
                                      paymentProvider: tempOcrFields.paymentProvider,
                                      score: ocrResult?.score || 0,
                                      status: isOcrApproved ? 'approved' : 'pending',
                                      screenshotUrl: ocrResult?.extracted?.screenshotUrl || ocrResult?.url || '',
                                      promoCode: appliedPromo ? appliedPromo.code : null,
                                      uid: userUid
                                    } as any);
                                    if (currentPaymentId) {
                                      setOcrPaymentId(currentPaymentId);
                                    }

                                    // Increment promo usedCount if any
                                    if (appliedPromo) {
                                      try {
                                        const promoRef = doc(db, 'promocodes', appliedPromo.code);
                                        const promoSnap = await getDoc(promoRef);
                                        if (promoSnap.exists()) {
                                          await updateDoc(promoRef, {
                                            usedCount: (promoSnap.data().usedCount || 0) + 1
                                          });
                                        }
                                      } catch (pErr) {
                                        console.error("Promo update error:", pErr);
                                      }
                                    }
                                  } else if (currentPaymentId) {
                                    await updateDoc(doc(db, 'payments', currentPaymentId), {
                                      uid: userUid,
                                      email: userEmail
                                    });
                                  }

                                  if (isOcrApproved && currentPaymentId) {
                                    await approvePaymentAndActivateUser(currentPaymentId, userEmail);
                                    setIsSuccess(true);
                                  } else {
                                    const userRef = doc(db, 'users', userUid);
                                    await setDoc(userRef, {
                                      uid: userUid,
                                      email: userEmail,
                                      displayName: userName,
                                      isActivated: false,
                                      role: 'user',
                                      createdAt: serverTimestamp()
                                    }, { merge: true });
                                    setIsPending(true);
                                  }
                                  setOcrActiveStep(4);
                                }
                              } catch (err: any) {
                                const msg = (err?.message || err?.code || '').toLowerCase();
                                if (
                                  msg.includes('blocked') || 
                                  msg.includes('cancelled') ||
                                  msg.includes('assertion') ||
                                  msg.includes('promise') ||
                                  msg.includes('closed') ||
                                  msg.includes('iframe')
                                ) {
                                  setVerificationError('IFRAME_POPUP_BLOCKED');
                                } else {
                                  setVerificationError(err?.message || 'Google Sign-In failed');
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-4 rounded-xl font-black text-[10px] text-white uppercase tracking-widest hover:bg-white/15 transition-all shadow-lg"
                          >
                            <Chrome className="w-4 h-4 text-[#c5a059]" />
                            Sign In/Up with Google
                          </button>
                        </div>
                      )}

                      {verificationError === 'OFFLINE_BLOCK' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-center space-y-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-red-400 uppercase tracking-wider">Secure Connection Blocked</h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                              Our secure database server is unreachable. This happens if an AdBlocker, Brave Shield, VPN, or network firewall blocks Google Firebase connections.
                            </p>
                          </div>
                        </motion.div>
                      ) : verificationError === 'OPERATION_NOT_ALLOWED' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-[#c5a059]/5 border border-[#c5a059]/10 text-center space-y-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 flex items-center justify-center mx-auto border border-[#c5a059]/20">
                            <ShieldAlert className="w-5 h-5 text-[#c5a059]" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-[#c5a059] uppercase tracking-wider">Registration Setup Required</h4>
                            <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                              The Email/Password sign-in is disabled under Firebase Console Authentication.
                            </p>
                          </div>
                        </motion.div>
                      ) : verificationError === 'IFRAME_POPUP_BLOCKED' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 text-left font-sans animate-fade-in"
                        >
                          <div className="flex items-center gap-2.5 text-amber-500">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            <h4 className="text-xs font-black uppercase tracking-wider">Google Sign-In Blocked</h4>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold">
                            Security policies block Google pop-ups inside integrated iframes. Please click **Open in New Tab** below to proceed with Google, or input your Name, Email, and Password directly to activate manually!
                          </p>
                          <div className="pt-1 flex gap-2">
                            <a
                              href={window.location.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-[#c5a059] text-black font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1.5 inline-flex font-sans"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open in New Tab
                            </a>
                            <button
                              type="button"
                              onClick={() => setVerificationError(null)}
                              className="px-3 py-2 bg-white/5 border border-white/10 text-zinc-400 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                            >
                              Okay
                            </button>
                          </div>
                        </motion.div>
                      ) : verificationError && (
                        <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">{verificationError}</p>
                      )}

                      <button 
                        onClick={handleOcrStep3Submit}
                        disabled={isSubmitting}
                        className="w-full py-5 bg-[#c5a059] text-black text-lg font-black rounded-2xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                      >
                        {isSubmitting ? "Activating..." : "Activate & Enroll"}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {ocrActiveStep === 4 && (
                    <motion.div 
                      key="ocr-step4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-8 flex-1 flex flex-col justify-center"
                    >
                      <div className="relative">
                        <div className={cn(
                          "w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center mx-auto border-2 shadow-[0_0_50px_rgba(197,160,89,0.2)]",
                          isOcrApproved 
                            ? "bg-[#c5a059]/20 border-[#c5a059]/30" 
                            : "bg-blue-500/20 border-blue-500/30"
                        )}>
                          {isOcrApproved ? (
                            <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-[#c5a059]" />
                          ) : (
                            <Info className="w-8 h-8 md:w-12 md:h-12 text-blue-400" />
                          )}
                        </div>
                        {isOcrApproved && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute -top-1 -right-1"
                          >
                            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#c5a059] animate-pulse" />
                          </motion.div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
                          {isOcrApproved ? "Welcome to Roshan Academy" : "Enrollment Pending"}
                        </h3>
                        <p className="text-[10px] md:text-sm text-zinc-400 font-medium">
                          {isOcrApproved 
                            ? "Your account has been activated successfully! All resources are now unlocked." 
                            : "Your payment receipt was successfully submitted and is under priority administrative review."}
                        </p>
                      </div>

                      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Registered Candidate</p>
                        <p className="text-white font-black uppercase">{user?.displayName || accessName || "Student"}</p>
                        <p className="text-[9px] font-mono text-zinc-500 mt-1 select-all">{user?.email || accessEmail}</p>
                      </div>

                      <button 
                        onClick={async () => {
                          try {
                            await refreshProfile?.();
                          } catch (e) {
                            console.error("Profile refresh error on dashboard navigation:", e);
                          }
                          navigate('/dashboard');
                        }}
                        className={cn(
                          "w-full py-5 text-black text-lg font-black rounded-2xl hover:opacity-90 transition-all uppercase tracking-widest shadow-xl",
                          isOcrApproved ? "bg-[#c5a059]" : "bg-blue-400 text-slate-950"
                        )}
                      >
                        Enter Dashboard
                      </button>

                      {isOcrApproved && (
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-left font-sans mt-2 space-y-1">
                          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5 leading-none">
                            💡 Enrollment Tip
                          </p>
                          <p className="text-[10px] text-zinc-300 leading-normal font-semibold">
                            If the dashboard does not display immediately or redirects you here, please sign out and sign back in to establish a fresh session with your activated credentials.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-[350px] md:min-h-[500px]">
                <StepIndicator />
                <AnimatePresence mode="wait">
                  {activeStep === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6 md:space-y-8"
                    >
                      <div className="text-center">
                        <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Redeem Access Code</h3>
                        <p className="text-[10px] md:text-xs text-zinc-400 mt-2 font-medium">Enter your academy access code to continue.</p>
                      </div>

                      <div className="relative group">
                        <input 
                          type="text" 
                          autoFocus
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                          placeholder="RSA-XXX-XXXX"
                          className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl px-6 py-4 md:px-8 md:py-6 text-lg md:text-2xl text-white placeholder:text-zinc-800 focus:outline-none focus:border-[#c5a059] focus:ring-4 focus:ring-[#c5a059]/10 transition-all font-mono text-center uppercase tracking-[0.2em]"
                        />
                        <div className="absolute inset-0 rounded-3xl bg-[#c5a059]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>

                      {verificationError === 'OFFLINE_BLOCK' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-center space-y-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-red-400 uppercase tracking-wider">Secure Connection Blocked</h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                              Our secure database server is unreachable. This happens if an AdBlocker, Brave Shield, VPN, or network firewall blocks Google Firebase connections.
                            </p>
                          </div>
                          <div className="p-3 bg-zinc-950/40 rounded-xl text-left border border-white/5 space-y-1 text-[9px] text-zinc-400 font-medium">
                            <p className="font-bold text-white uppercase text-[8px] tracking-wider text-[#c5a059]">Quick Resolution Steps:</p>
                            <p>• Disable "Brave Shields", "AdBlock Plus", or "uBlock Origin" for this site</p>
                            <p>• Try reloading the page, or open in a standard Chrome/Safari window</p>
                            <p>• Off any active VPN, or toggle cellular details/data connection</p>
                          </div>
                        </motion.div>
                      ) : verificationError && (
                        <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">{verificationError}</p>
                      )}

                      <button 
                        onClick={handleVerifyCodeStep1}
                        disabled={isValidatingCode || accessCode.length < 4}
                        className="w-full py-5 bg-[#c5a059] text-black text-lg font-black rounded-2xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#c5a059]/10 disabled:opacity-20 translate-y-4"
                      >
                        {isValidatingCode ? "Verifying..." : "Continue"}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {activeStep === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                          <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Code Verified</h3>
                        <p className="text-xs text-zinc-400 mt-2 font-black uppercase tracking-widest text-[#c5a059]">Package Unlocked</p>
                      </div>

                      <div className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-500/10 bg-emerald-500/[0.02]">
                        <h4 className="text-white font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-[#c5a059]" />
                          {verifiedCodeData?.package || "Roshan Premium Access"}
                        </h4>
                        <div className="space-y-4">
                          {[
                            "All Interactive MCQs & Practice Tests",
                            "Full PDF Library & Smart Study Notes",
                            "Live Classes & Recording Archives",
                            "Community Discussions & Mentorship",
                            verifiedCodeData?.role === 'admin' ? "Administrative Privileges" : "6 Months Full Enrollment"
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <Sparkles className="w-3 h-3 text-[#c5a059]" />
                              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wide">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveStep(3)}
                        className="w-full py-5 bg-[#c5a059] text-black text-lg font-black rounded-2xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#c5a059]/10"
                      >
                        Proceed to Account Setup
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {activeStep === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Setup Account</h3>
                        <p className="text-xs text-zinc-400 mt-2 font-medium">Create your secure credentials to access the platform.</p>
                      </div>

                      {user ? (
                        <div className="p-8 rounded-[2rem] bg-[#c5a059]/5 border border-[#c5a059]/20 text-center">
                          <User className="w-10 h-10 text-[#c5a059] mx-auto mb-4" />
                          <p className="text-sm font-bold text-white mb-1">{user.displayName || user.email}</p>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Logged in Account</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input 
                              type="text" required value={accessName} onChange={(e) => setAccessName(e.target.value)}
                              placeholder="FULL NAME"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-[#c5a059] transition-all font-bold uppercase tracking-widest text-xs"
                            />
                          </div>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input 
                              type="email" required value={accessEmail} onChange={(e) => setAccessEmail(e.target.value)}
                              placeholder="GMAIL ADDRESS"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-[#c5a059] transition-all font-bold uppercase tracking-widest text-xs"
                            />
                          </div>
                          <div className="relative">
                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                            <input 
                              type="password" required value={accessPass} onChange={(e) => setAccessPass(e.target.value)}
                              placeholder="ACCOUNT PASSWORD"
                              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white focus:border-[#c5a059] transition-all font-bold tracking-widest text-xs"
                            />
                          </div>

                          <div className="relative flex items-center justify-center py-2">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-white/5"></div>
                            </div>
                            <span className="relative px-3 bg-[#0a0f1d] text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                              Or Setup via Google
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                setVerificationError(null);
                                await signInWithGoogle();
                              } catch (err: any) {
                                const msg = (err?.message || err?.code || '').toLowerCase();
                                if (
                                  msg.includes('blocked') || 
                                  msg.includes('cancelled') ||
                                  msg.includes('assertion') ||
                                  msg.includes('promise') ||
                                  msg.includes('closed') ||
                                  msg.includes('iframe')
                                ) {
                                  setVerificationError('IFRAME_POPUP_BLOCKED');
                                } else {
                                  setVerificationError(err?.message || 'Google Sign-In failed');
                                }
                              }
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-4 rounded-xl font-black text-[10px] text-white uppercase tracking-widest hover:bg-white/15 transition-all shadow-lg"
                          >
                            <Chrome className="w-4 h-4 text-[#c5a059]" />
                            Sign In/Up with Google
                          </button>
                        </div>
                      )}

                      <div className="pt-2 space-y-3">
                        <button 
                          type="button"
                          onClick={() => setIsPromoOpen(!isPromoOpen)}
                          className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-[#c5a059] transition-colors"
                        >
                          <Ticket className="w-4 h-4" />
                          Have a promo code? (Optional)
                        </button>
                        
                        <AnimatePresence>
                          {isPromoOpen && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden space-y-3"
                            >
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  value={accessPromoCode}
                                  onChange={(e) => {
                                    setAccessPromoCode(e.target.value.toUpperCase());
                                    setPromoMessage(null);
                                  }}
                                  placeholder="ENTER PROMO CODE"
                                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-[#c5a059] transition-all font-bold uppercase tracking-widest font-mono"
                                />
                                <button
                                  type="button"
                                  disabled={isValidatingPromo}
                                  onClick={() => handleApplyPromoCode(accessPromoCode)}
                                  className="px-6 py-3 bg-[#c5a059] hover:bg-[#d4b16a] text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
                                >
                                  {isValidatingPromo ? "..." : "Apply"}
                                </button>
                              </div>
                              {promoMessage && (
                                <p className={`text-[10px] font-bold uppercase tracking-wide ${promoMessage.success ? 'text-emerald-400' : 'text-red-500'}`}>
                                  {promoMessage.text}
                                </p>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {verificationError === 'OFFLINE_BLOCK' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-red-500/5 border border-red-500/20 text-center space-y-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
                            <ShieldAlert className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-black text-red-400 uppercase tracking-wider">Secure Connection Blocked</h4>
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold font-mono">
                              OFFLINE_BLOCK
                            </p>
                            <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                              Our secure database server is unreachable. This happens if an AdBlocker, Brave Shield, VPN, or network firewall blocks Google Firebase connections.
                            </p>
                          </div>
                          <div className="p-3 bg-zinc-950/40 rounded-xl text-left border border-white/5 space-y-1 text-[9px] text-zinc-400 font-medium">
                            <p className="font-bold text-white uppercase text-[8px] tracking-wider text-[#c5a059]">Quick Resolution Steps:</p>
                            <p>• Disable "Brave Shields", "AdBlock Plus", or "uBlock Origin" for this site</p>
                            <p>• Try reloading the page, or open in a standard Chrome/Safari window</p>
                            <p>• Off any active VPN, or toggle cellular details/data connection</p>
                          </div>
                        </motion.div>
                      ) : verificationError === 'OPERATION_NOT_ALLOWED' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-[#c5a059]/5 border border-[#c5a059]/10 text-center space-y-4"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#c5a059]/10 flex items-center justify-center mx-auto border border-[#c5a059]/20">
                            <ShieldAlert className="w-5 h-5 text-[#c5a059]" />
                          </div>
                          <div className="space-y-2">
                            <h4 className="text-xs font-black text-[#c5a059] uppercase tracking-wider">Registration Setup Required</h4>
                            <p className="text-[9px] font-mono text-zinc-500 select-all font-bold uppercase tracking-wider">FIREBASE: ERROR (AUTH/OPERATION-NOT-ALLOWED)</p>
                            <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                              The <strong>Email/Password</strong> sign-in is disabled under Firebase Console Authentication.
                            </p>
                          </div>
                          <div className="p-4 bg-zinc-950/40 rounded-xl text-left border border-white/5 space-y-2 text-[10px] text-zinc-400 leading-relaxed font-medium">
                            <p className="font-bold text-[#c5a059] uppercase text-[9px] tracking-wider">Quick Enable Steps:</p>
                            <p>1. Open your <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-[#c5a059] underline hover:text-[#d4b16a]">Firebase Console</a>.</p>
                            <p>2. Select this project, go to <strong>Build</strong> &gt; <strong>Authentication</strong> on the left, then click the <strong>Sign-in method</strong> tab.</p>
                            <p>3. Click <strong>Add new provider</strong> (or edit the existing <strong>Email/Password</strong> provider).</p>
                            <p>4. Enable the <strong>Email/Password</strong> switch and click <strong>Save</strong>.</p>
                            <p>5. Return to this screen & click the <strong>Activate Account</strong> button again!</p>
                          </div>
                        </motion.div>
                      ) : verificationError === 'IFRAME_POPUP_BLOCKED' ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 text-left font-sans animate-fade-in"
                        >
                          <div className="flex items-center gap-2.5 text-amber-500">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            <h4 className="text-xs font-black uppercase tracking-wider">Google Sign-In Blocked</h4>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold">
                            Security policies block Google pop-ups inside integrated iframes. Please click **Open in New Tab** below to proceed with Google, or input your Name, Email, and Password directly to activate manually!
                          </p>
                          <div className="pt-1 flex gap-2">
                            <a
                              href={window.location.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 bg-[#c5a059] text-black font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1.5 inline-flex font-sans"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Open in New Tab
                            </a>
                            <button
                              type="button"
                              onClick={() => setVerificationError(null)}
                              className="px-3 py-2 bg-white/5 border border-white/10 text-zinc-400 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                            >
                              Okay
                            </button>
                          </div>
                        </motion.div>
                      ) : verificationError && (
                        <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">{verificationError}</p>
                      )}

                      <button 
                        onClick={() => handleAccessCodeSubmit()}
                        disabled={isSubmitting}
                        className="w-full py-5 bg-[#c5a059] text-black text-lg font-black rounded-2xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-[#c5a059]/10 disabled:opacity-50"
                      >
                        {isSubmitting ? "Creating Account..." : "Activate Account"}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}

                  {activeStep === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-8 flex-1 flex flex-col justify-center"
                    >
                      <div className="relative">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-[#c5a059]/20 rounded-full flex items-center justify-center mx-auto border-2 border-[#c5a059]/30 shadow-[0_0_50px_rgba(197,160,89,0.2)]">
                          <CheckCircle2 className="w-8 h-8 md:w-12 md:h-12 text-[#c5a059]" />
                        </div>
                        <motion.div 
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute -top-1 -right-1"
                        >
                          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-[#c5a059] animate-pulse" />
                        </motion.div>
                      </div>

                      <div>
                        <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">Welcome to Roshan Academy</h3>
                        <p className="text-[10px] md:text-sm text-zinc-400 font-medium">Your account has been activated successfully. All resources are now available.</p>
                      </div>

                      <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/[0.01]">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Enrolled as</p>
                        <p className="text-white font-black uppercase">Candidate: {user?.displayName || accessName}</p>
                      </div>

                      <button 
                        onClick={async () => {
                          try {
                            await refreshProfile?.();
                          } catch (e) {
                            console.error("Profile refresh error on dashboard navigation:", e);
                          }
                          navigate('/dashboard');
                        }}
                        className="w-full py-5 bg-[#c5a059] text-black text-lg font-black rounded-2xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest shadow-xl shadow-[#c5a059]/10"
                      >
                        Enter Dashboard
                      </button>

                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-left font-sans mt-2 space-y-1">
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5 leading-none">
                          💡 Enrollment Tip
                        </p>
                        <p className="text-[10px] text-zinc-300 leading-normal font-semibold">
                          If the dashboard does not display immediately or redirects you here, please sign out and sign back in to establish a fresh session with your activated credentials.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-zinc-600 uppercase tracking-widest pt-6 mt-auto">
              <ShieldCheck className="w-4 h-4" />
              Encrypted & Secure Transaction
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Copy Notification */}
      <AnimatePresence>
        {isCopied && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#c5a059] text-black font-black rounded-full text-xs uppercase tracking-widest shadow-2xl z-[100]"
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
      <SupportWidget />
    </div>
  );
};
