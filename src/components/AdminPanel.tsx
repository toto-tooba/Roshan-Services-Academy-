import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Key, Plus, FileText, Upload, Image as ImageIcon, Video, Loader2, CheckCircle2, Copy, BarChart3, Trash2, Headphones, MessageSquare, Send, Search, Ticket, AlertTriangle, Sparkles, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';

import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/databaseService';

const AHMED_MURAD_IMAGE = "https://i.postimg.cc/fy3d9H1C/684981309-18587690563010875-6233797090791793515-n.jpg";

export const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'codes' | 'promocodes' | 'articles' | 'live-classes' | 'payments' | 'support' | 'testimonials'>('codes');
  
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  
  // Testimonials State
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(false);
  const [testmName, setTestmName] = useState('');
  const [testmRole, setTestmRole] = useState('');
  const [testmText, setTestmText] = useState('');
  const [testmImage, setTestmImage] = useState('');
  const [testmStars, setTestmStars] = useState<number>(5);
  const [testmSequence, setTestmSequence] = useState<number>(0);
  const [submittingTestm, setSubmittingTestm] = useState(false);
  const [seedingPresets, setSeedingPresets] = useState(false);
  const [editingTestmId, setEditingTestmId] = useState<string | null>(null);
  const [testmSuccess, setTestmSuccess] = useState(false);
  const [testmError, setTestmError] = useState<string | null>(null);

  // Promo codes State
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [promoLoading, setPromoLoading] = useState(true);
  const [promoSpelling, setPromoSpelling] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [promoDiscountValue, setPromoDiscountValue] = useState<number>(10);
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState(false);

  // Support Desk State
  const [supportChats, setSupportChats] = useState<any[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [activeChatMessages, setActiveChatMessages] = useState<any[]>([]);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [supportSearch, setSupportSearch] = useState('');
  
  // Payments State
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState<'pending' | 'approved' | 'all'>('pending');
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

  // Access Codes State
  const [accessCodes, setAccessCodes] = useState<any[]>([]);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codesLoading, setCodesLoading] = useState(true);

  // Articles State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<File | null>(null);
  const [uploadingArticle, setUploadingArticle] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Live Classes State
  const [liveTopic, setLiveTopic] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [zoomLink, setZoomLink] = useState('');
  const [liveDescription, setLiveDescription] = useState('');
  const [submittingClass, setSubmittingClass] = useState(false);
  const [classSuccess, setClassSuccess] = useState(false);

  const [classRequests, setClassRequests] = useState<any[]>([]);
  const [scheduledClasses, setScheduledClasses] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    if (activeTab === 'codes') {
      fetchCodes();
    } else if (activeTab === 'promocodes') {
      fetchPromoCodes();
    } else if (activeTab === 'live-classes') {
      fetchLiveClassesAndRequests();
    } else if (activeTab === 'payments') {
      fetchPayments();
    } else if (activeTab === 'articles') {
      fetchArticles();
    } else if (activeTab === 'testimonials') {
      fetchAdminTestimonials();
    }
  }, [activeTab]);

  const fetchAdminTestimonials = async () => {
    setTestimonialsLoading(true);
    setTestmError(null);
    try {
      const q = query(collection(db, 'testimonials'), orderBy('sequence', 'asc'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        if (data.name === "Ahmed Murad") {
          return { id: doc.id, ...data, image: AHMED_MURAD_IMAGE };
        }
        return { id: doc.id, ...data };
      });
      setTestimonials(fetched);
    } catch (error: any) {
      handleFirestoreError(error, OperationType.GET, 'testimonials');
      setTestmError('Failed to load testimonials from Firestore.');
    } finally {
      setTestimonialsLoading(false);
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testmName.trim() || !testmRole.trim() || !testmText.trim()) {
      setTestmError('Name, Role, and Comment/Review text are required.');
      return;
    }
    setSubmittingTestm(true);
    setTestmError(null);
    setTestmSuccess(false);

    try {
      const payload = {
        name: testmName.trim(),
        role: testmRole.trim(),
        text: testmText.trim(),
        image: testmImage.trim(),
        stars: Number(testmStars) || 5,
        sequence: Number(testmSequence) || 0,
        createdAt: serverTimestamp()
      };

      if (editingTestmId) {
        await updateDoc(doc(db, 'testimonials', editingTestmId), payload);
      } else {
        await addDoc(collection(db, 'testimonials'), payload);
      }

      setTestmSuccess(true);
      // Reset form
      setTestmName('');
      setTestmRole('');
      setTestmText('');
      setTestmImage('');
      setTestmStars(5);
      setTestmSequence(0);
      setEditingTestmId(null);
      fetchAdminTestimonials();
    } catch (error: any) {
      handleFirestoreError(error, editingTestmId ? OperationType.UPDATE : OperationType.CREATE, `testimonials/${editingTestmId || ''}`);
      setTestmError('Failed to save testimonial. Please check your credentials.');
    } finally {
      setSubmittingTestm(false);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this success story/comment?')) return;
    setTestmError(null);
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      fetchAdminTestimonials();
    } catch (error: any) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      setTestmError('Failed to delete testimonial.');
    }
  };

  const handleEditTestimonial = (testm: any) => {
    setEditingTestmId(testm.id);
    setTestmName(testm.name || '');
    setTestmRole(testm.role || '');
    setTestmText(testm.text || '');
    setTestmImage(testm.image || '');
    setTestmStars(testm.stars || 5);
    setTestmSequence(testm.sequence || 0);
  };

  const handleSeedPresets = async () => {
    if (testimonials.length > 0) {
      if (!window.confirm('You already have testimonials in your database. Importing the preset stories will append them to the existing list. Do you want to continue?')) {
        return;
      }
    }
    setSeedingPresets(true);
    setTestmError(null);
    setTestmSuccess(false);

    try {
      const presets = [
        {
          name: "Ahmed Murad",
          role: "Navy Cadet",
          text: "The intelligence test preparation here is unmatched. I cleared my initial tests with ease thanks to the simulation environment.",
          image: AHMED_MURAD_IMAGE,
          stars: 5,
          sequence: 10
        },
        {
          name: "Sana Malik",
          role: "MDCAT Aspirant",
          text: "The biology and chemistry notes are so well-structured. It's the best community for MDCAT preparation in Pakistan.",
          image: "https://picsum.photos/seed/student2/100/100",
          stars: 5,
          sequence: 20
        },
        {
          name: "Zubair Khan",
          role: "PAF GD Pilot Candidate",
          text: "Expert guidance from retired officers helped me understand the psychological evaluation process perfectly.",
          image: "https://picsum.photos/seed/student3/100/100",
          stars: 5,
          sequence: 30
        },
        {
          name: "Ayesha Tariq",
          role: "AFNS Aspirant",
          text: "The past papers and MCQs bank was exactly what I needed. Helped me identify my weak points quickly.",
          image: "https://picsum.photos/seed/student4/100/100",
          stars: 5,
          sequence: 40
        },
        {
          name: "Usman Raza",
          role: "Navy Cadet",
          text: "I was struggling with non-verbal intelligence, but their structured online test sessions improved my speed dramatically.",
          image: "https://picsum.photos/seed/student5/100/100",
          stars: 5,
          sequence: 50
        }
      ];

      // Insert all
      for (const item of presets) {
        await addDoc(collection(db, 'testimonials'), {
          ...item,
          createdAt: serverTimestamp()
        });
      }

      setTestmSuccess(true);
      fetchAdminTestimonials();
    } catch (error: any) {
      handleFirestoreError(error, OperationType.CREATE, 'testimonials/seed');
      setTestmError('Failed to import preset success stories.');
    } finally {
      setSeedingPresets(false);
    }
  };

  const fetchArticles = async () => {
    setArticlesLoading(true);
    try {
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Failed to fetch articles in admin panel:', error);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleConfirmDelete = async (articleId: string) => {
    setDeleteError(null);
    try {
      await deleteDoc(doc(db, 'articles', articleId));
      setDeleteConfirmId(null);
      fetchArticles();
    } catch (error: any) {
      console.error('Failed to delete article:', error);
      setDeleteError('Failed to delete the article. Please check your permissions.');
    }
  };

  const fetchPromoCodes = async () => {
    setPromoLoading(true);
    setPromoError(null);
    try {
      const q = query(collection(db, 'promocodes'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setPromoCodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Failed to fetch promo codes:', error);
      setPromoError('Failed to fetch promo codes from server.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSpelling = promoSpelling.trim().toUpperCase();
    if (!cleanSpelling) {
      setPromoError('Please enter a valid code spelling.');
      return;
    }
    if (cleanSpelling.length < 3) {
      setPromoError('Promo code must be at least 3 characters long.');
      return;
    }
    if (promoDiscountValue <= 0) {
      setPromoError('Discount value must be greater than 0.');
      return;
    }
    if (promoDiscountType === 'percentage' && promoDiscountValue > 100) {
      setPromoError('Percentage discount cannot exceed 100%.');
      return;
    }

    setCreatingPromo(true);
    setPromoError(null);
    setPromoSuccess(false);

    try {
      const { doc: fDoc, getDoc: fGetDoc, setDoc: fSetDoc } = await import('firebase/firestore');
      const docRef = fDoc(db, 'promocodes', cleanSpelling);
      const docSnap = await fGetDoc(docRef);

      if (docSnap.exists()) {
        setPromoError('A promo code with this spelling already exists.');
        setCreatingPromo(false);
        return;
      }

      await fSetDoc(docRef, {
        code: cleanSpelling,
        discountType: promoDiscountType,
        discountValue: Number(promoDiscountValue),
        usedCount: 0,
        createdAt: serverTimestamp()
      });

      setPromoSpelling('');
      setPromoDiscountValue(10);
      setPromoSuccess(true);
      fetchPromoCodes();
      setTimeout(() => setPromoSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to create promo code:', error);
      setPromoError('Failed to create promo code. Please check your connection.');
    } finally {
      setCreatingPromo(false);
    }
  };

  const handleDeletePromoCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;
    try {
      const { doc: fDoc, deleteDoc: fDeleteDoc } = await import('firebase/firestore');
      await fDeleteDoc(fDoc(db, 'promocodes', id));
      fetchPromoCodes();
    } catch (error) {
      console.error('Failed to delete promo code:', error);
    }
  };

  // Listen to all support chats in Support Desk
  useEffect(() => {
    if (activeTab !== 'support') return;

    const chatsQuery = query(
      collection(db, 'support_chats'),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubChats = onSnapshot(chatsQuery, (snap) => {
      const chatsList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastMessageTime: doc.data().lastMessageAt?.toDate ? doc.data().lastMessageAt.toDate() : new Date()
      }));
      setSupportChats(chatsList);
    });

    return () => unsubChats();
  }, [activeTab]);

  // Listen to active chat messages
  useEffect(() => {
    if (activeTab !== 'support' || !selectedChatId) {
      setActiveChatMessages([]);
      return;
    }

    // Reset unreadByAdminCount automatically when active
    const chatRef = doc(db, 'support_chats', selectedChatId);
    updateDoc(chatRef, {
      unreadByAdminCount: 0
    }).catch(err => {
      // Safe placeholder
    });

    const msgQuery = query(
      collection(db, `support_chats/${selectedChatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubMsgs = onSnapshot(msgQuery, (snap) => {
      const msgs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        time: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      }));
      setActiveChatMessages(msgs);
    });

    return () => unsubMsgs();
  }, [activeTab, selectedChatId]);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatId || !adminReplyText.trim()) return;

    const text = adminReplyText.trim();
    setAdminReplyText('');
    setSendingReply(true);

    try {
      const messageCol = collection(db, `support_chats/${selectedChatId}/messages`);
      const chatDocRef = doc(db, 'support_chats', selectedChatId);

      await addDoc(messageCol, {
        text,
        senderId: profile?.uid || 'admin',
        senderName: 'Command HQ',
        senderRole: 'admin',
        createdAt: serverTimestamp()
      });

      // Fetch or derive target chat unread check
      const matched = supportChats.find(c => c.id === selectedChatId);
      const prevUnreadByUser = matched?.unreadByUserCount || 0;

      await setDoc(chatDocRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        unreadByUserCount: prevUnreadByUser + 1,
        unreadByAdminCount: 0,
        updatedAt: serverTimestamp()
      }, { merge: true });

    } catch (err) {
      console.error('Failed to send admin reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleToggleChatResolved = async (chatId: string, currentResolved: boolean) => {
    try {
      const chatRef = doc(db, 'support_chats', chatId);
      await updateDoc(chatRef, {
        isResolved: !currentResolved
      });
    } catch (err) {
      console.error('Failed to toggle resolvation status:', err);
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    try {
      const q = query(collection(db, 'payments'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Load payment configurations
      const { getPaymentSettings } = await import('../services/databaseService');
      const settings = await getPaymentSettings();
      if (settings) {
        setConfigSettings(settings);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleUpdateConfigSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { updatePaymentSettings } = await import('../services/databaseService');
      await updatePaymentSettings(configSettings);
      alert("Verification configurations saved successfully!");
      fetchPayments();
    } catch (err: any) {
      console.error('Failed to update credentials:', err);
      alert("Error updating payment configurations: " + err.message);
    }
  };

  const handleApprovePayment = async (paymentId: string, email: string) => {
    try {
      const { approvePaymentAndActivateUser } = await import('../services/databaseService');
      await approvePaymentAndActivateUser(paymentId, email);
      fetchPayments();
    } catch (error) {
      console.error('Failed to approve payment:', error);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await deleteDoc(doc(db, 'payments', paymentId));
      fetchPayments();
    } catch (error) {
      console.error('Failed to delete payment:', error);
    }
  };

  const fetchLiveClassesAndRequests = async () => {
    setLoadingRequests(true);
    try {
      const liveClassesSnapshot = await getDocs(query(collection(db, 'live_classes'), orderBy('start_time', 'asc')));
      const requestsSnapshot = await getDocs(query(collection(db, 'class_requests'), orderBy('created_at', 'desc')));
      
      const clsData = liveClassesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const reqData = requestsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setScheduledClasses(clsData);
      setClassRequests(reqData);
    } catch (error) {
      console.error('Failed to fetch class info:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCreateLiveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTopic || !teacherName || !startTime || !endTime || !zoomLink) return;
    
    setSubmittingClass(true);
    try {
      await addDoc(collection(db, 'live_classes'), {
        topic: liveTopic,
        teacher_name: teacherName,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        zoom_link: zoomLink,
        description: liveDescription,
        created_at: serverTimestamp()
      });
      
      setClassSuccess(true);
      setLiveTopic('');
      setTeacherName('');
      setStartTime('');
      setEndTime('');
      setZoomLink('');
      setLiveDescription('');
      fetchLiveClassesAndRequests();
      setTimeout(() => setClassSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to create live class:', error);
    } finally {
      setSubmittingClass(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scheduled class?')) return;
    try {
      await deleteDoc(doc(db, 'live_classes', id));
      fetchLiveClassesAndRequests();
    } catch (error) {
      console.error('Failed to delete live class:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string, topic: string) => {
    try {
      const reqRef = doc(db, 'class_requests', requestId);
      await updateDoc(reqRef, {
        status: 'accepted',
        accepted_at: serverTimestamp()
      });
      
      // Auto-populate the scheduled class topic
      setLiveTopic(topic);
      
      // Update local state temporarily
      setClassRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'accepted' } : r));
      
      // Fetch fresh data
      await fetchLiveClassesAndRequests();
    } catch (error) {
      console.error('Failed to accept class request:', error);
    }
  };

  const fetchCodes = async () => {
    setCodesLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'global_access_codes'), orderBy('created_at', 'desc')));
      setAccessCodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Failed to fetch codes:', error);
    } finally {
      setCodesLoading(false);
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = async (role: 'student' | 'admin') => {
    setGeneratingCode(true);
    try {
      const newCode = generateRandomCode();
      await setDoc(doc(db, 'global_access_codes', newCode), {
         code: newCode,
         created_at: serverTimestamp(),
         used_at: null,
         role: role
      });
      fetchCodes();
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleUploadArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    setUploadingArticle(true);
    setUploadSuccess(false);
    setUploadError(null);
    
    try {
      let media_url = null;
      let media_type = null;

      if (media) {
        const formData = new FormData();
        formData.append('file', media);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || 'Failed to upload attachment to server.');
        }
        
        const uploadData = await uploadRes.json();
        media_url = uploadData.url;
        media_type = uploadData.type;
      }

      await addDoc(collection(db, 'articles'), {
        title,
        content,
        media_url,
        media_type,
        createdAt: serverTimestamp(),
      });
      
      setUploadSuccess(true);
      setTitle('');
      setContent('');
      setMedia(null);
      fetchArticles(); // Refresh the list of articles
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error('Failed to upload article:', error);
      setUploadError(error?.message || 'Failed to publish the article. Please check your network connection.');
    } finally {
      setUploadingArticle(false);
    }
  };

  if (!profile?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 glass-panel border border-red-500/20 rounded-3xl">
          <Key className="w-12 h-12 text-red-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-black text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400">You do not have administrative privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2 uppercase">Command Center</h1>
          <p className="text-zinc-400 text-sm md:text-base">Manage global access codes and publish news articles.</p>
        </div>
        
        <div className="relative flex items-center w-full xl:max-w-xl 2xl:max-w-2xl bg-[#0a0f1d] border border-white/10 p-1.5 rounded-2xl min-w-0 self-start max-w-full overflow-hidden">
          <button 
            type="button"
            onClick={() => scrollTabs('left')}
            className="shrink-0 p-2 bg-[#121829]/90 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-red-500/20 active:scale-95 transition-all shadow-md mr-1.5"
            title="Scroll Left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div 
            ref={tabsContainerRef}
            className="flex overflow-x-auto hide-scrollbar scroll-smooth flex-nowrap flex-1 gap-1 py-0.5 min-w-0"
          >
            <button 
              type="button"
              onClick={() => setActiveTab('codes')}
              className={`whitespace-nowrap shrink-0 px-4 lg:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center ${
                activeTab === 'codes' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Access Codes
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('promocodes')}
              className={`whitespace-nowrap shrink-0 px-4 lg:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center ${
                activeTab === 'promocodes' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Promo Codes
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('articles')}
              className={`whitespace-nowrap shrink-0 px-4 lg:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center ${
                activeTab === 'articles' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Publish Article
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('live-classes')}
              className={`whitespace-nowrap shrink-0 px-4 lg:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center ${
                activeTab === 'live-classes' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Live Classes
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`whitespace-nowrap shrink-0 px-4 lg:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center ${
                activeTab === 'payments' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Payments
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('support')}
              className={`whitespace-nowrap shrink-0 px-4 lg:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'support' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Support Desk
              {supportChats.some(c => (c.unreadByAdminCount || 0) > 0) && (
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shrink-0" />
              )}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('testimonials')}
              className={`whitespace-nowrap shrink-0 px-4 lg:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'testimonials' 
                  ? 'bg-red-500 text-white shadow-lg' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Success Stories
            </button>
          </div>

          <button 
            type="button"
            onClick={() => scrollTabs('right')}
            className="shrink-0 p-2 bg-[#121829]/90 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-red-500/20 active:scale-95 transition-all shadow-md ml-1.5"
            title="Scroll Right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeTab === 'payments' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Payment Account Configuration Panel */}
          <form onSubmit={handleUpdateConfigSettings} className="glass-panel border border-white/5 bg-white/[0.01] p-6 rounded-[2rem] space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#c5a059] flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#c5a059]" /> Configure Universal Academy Account Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Receiver Account Name</label>
                <input 
                  type="text" 
                  required
                  value={configSettings.receiverName}
                  onChange={(e) => setConfigSettings({...configSettings, receiverName: e.target.value})}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Receiver Mobile / Account Number</label>
                <input 
                  type="text" 
                  required
                  value={configSettings.receiverNumber}
                  onChange={(e) => setConfigSettings({...configSettings, receiverNumber: e.target.value})}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">RAAST ID</label>
                <input 
                  type="text" 
                  required
                  value={configSettings.raastId}
                  onChange={(e) => setConfigSettings({...configSettings, raastId: e.target.value})}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-[#c5a059] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Academic Enrollment Fee (Rs.)</label>
                <input 
                  type="number" 
                  required
                  value={configSettings.courseFee}
                  onChange={(e) => setConfigSettings({...configSettings, courseFee: parseInt(e.target.value) || 0})}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs font-bold focus:border-[#c5a059] focus:outline-none font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button 
                type="submit"
                className="px-6 py-2.5 bg-[#c5a059]/10 border border-[#c5a059]/20 hover:bg-[#c5a059] hover:text-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
              >
                Save configurations
              </button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-red-400" /> Payment verifications
            </h2>
            <div className="flex bg-[#0a0f1d] border border-white/10 p-1 rounded-xl shrink-0 self-start sm:self-auto">
              <button 
                onClick={() => setPaymentFilter('pending')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentFilter === 'pending' ? 'bg-red-500 text-white' : 'text-zinc-500'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setPaymentFilter('approved')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentFilter === 'approved' ? 'bg-red-500 text-white' : 'text-zinc-500'}`}
              >
                Approved
              </button>
              <button 
                onClick={() => setPaymentFilter('all')}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${paymentFilter === 'all' ? 'bg-red-500 text-white' : 'text-zinc-500'}`}
              >
                All
              </button>
            </div>
          </div>

          <div className="glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden bg-white/[0.02]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500">
                    <th className="px-8 py-4 font-black">Student Info</th>
                    <th className="px-8 py-4 font-black">Ref Code</th>
                    <th className="px-8 py-4 font-black">TID / Amount</th>
                    <th className="px-8 py-4 font-black">Status</th>
                    <th className="px-8 py-4 font-black">Receipt</th>
                    <th className="px-8 py-4 font-black text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {paymentsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-red-500" />
                      </td>
                    </tr>
                  ) : payments.filter(p => paymentFilter === 'all' ? true : p.status === paymentFilter).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-zinc-500">
                        No {paymentFilter} payments found.
                      </td>
                    </tr>
                  ) : (
                    payments.filter(p => paymentFilter === 'all' ? true : p.status === paymentFilter).map(payment => (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4">
                          <div className="text-white font-bold">{payment.email}</div>
                          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">UID: {payment.uid?.slice(0, 8)}...</div>
                        </td>
                        <td className="px-8 py-4 font-mono text-zinc-400">{payment.code}</td>
                        <td className="px-8 py-4">
                          <div className="text-white font-black">Rs. {payment.amount}</div>
                          <div className="text-[10px] text-[#c5a059] font-black uppercase tracking-[0.2em] mt-1">
                            {payment.paymentProvider || "SCAN"} TID: {payment.tid}
                          </div>
                          {payment.score !== undefined && (
                            <div className="text-[9px] mt-1 text-zinc-400">
                              Matching confidence: <span className="text-[#c5a059] font-extrabold">{payment.score}/100</span>
                            </div>
                          )}
                          {payment.receiverName && (
                            <div className="text-[8px] text-zinc-500 uppercase tracking-widest mt-0.5">
                              to: {payment.receiverName} ({payment.receiverNumber})
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            payment.status === 'approved' 
                              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-8 py-4">
                          {payment.screenshotUrl ? (
                            <a 
                              href={payment.screenshotUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#c5a059] hover:underline flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
                            >
                              <ImageIcon className="w-4 h-4" /> View Proof
                            </a>
                          ) : (
                            <span className="text-zinc-600 text-[10px] uppercase font-black">No Image</span>
                          )}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {payment.status !== 'approved' && (
                              <button 
                                onClick={() => handleApprovePayment(payment.id, payment.email)}
                                className="p-2 bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                title="Approve & Activate"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeletePayment(payment.id)}
                              className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'promocodes' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-panel border border-white/10 rounded-[2rem] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden bg-white/[0.02]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-500" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-tight flex items-center gap-2">
                <Ticket className="text-red-500 w-5 h-5 animate-pulse" />
                Create New Promo Code
              </h2>
              <p className="text-sm text-zinc-400 max-w-lg">
                Generate custom discount promo codes with customizable spellings that students can use to reduce enrollment fees.
              </p>
            </div>
          </div>

          <div className="glass-panel border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl bg-white/[0.02]">
            {promoSuccess && (
              <div id="promo-success-msg" className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 text-green-400 font-bold">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                Promo code has been successfully created!
              </div>
            )}

            {promoError && (
              <div id="promo-error-msg" className="mb-8 p-4 bg-red-505/10 border border-red-550/30 rounded-2xl flex items-center gap-3 text-red-500 font-bold">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                {promoError}
              </div>
            )}

            <form onSubmit={handleCreatePromoCode} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Promo Code Spelling</label>
                  <input 
                    type="text" 
                    value={promoSpelling}
                    onChange={e => setPromoSpelling(e.target.value.toUpperCase())}
                    required
                    maxLength={20}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors uppercase tracking-widest font-mono font-bold"
                    placeholder="e.g. SAVE50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Discount Type</label>
                  <select 
                    value={promoDiscountType}
                    onChange={e => setPromoDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 font-bold">Discount Value</label>
                  <input 
                    type="number" 
                    value={promoDiscountValue}
                    onChange={e => setPromoDiscountValue(Math.max(1, parseInt(e.target.value) || 0))}
                    required
                    min={1}
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors font-bold"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <button 
                  type="submit"
                  disabled={creatingPromo}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {creatingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Promo Code"}
                </button>
              </div>
            </form>
          </div>

          <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-red-500" /> Active Promo Codes
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 bg-white/[0.02]">
                    <th className="px-8 py-4 font-black">Spelling / Code</th>
                    <th className="px-8 py-4 font-black">Discount Advantage</th>
                    <th className="px-8 py-4 font-black">Students Used</th>
                    <th className="px-8 py-4 font-black">Date Created</th>
                    <th className="px-8 py-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {promoLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
                        Loading promo codes...
                      </td>
                    </tr>
                  ) : promoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">
                        No active promo codes found. Create one above!
                      </td>
                    </tr>
                  ) : (
                    promoCodes.map(code => (
                      <tr key={code.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4 font-mono font-bold text-white text-lg tracking-wider">
                          <span className="bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-lg">
                            {code.code}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-xs font-bold uppercase tracking-widest">
                          {code.discountType === 'percentage' ? (
                            <span className="text-emerald-400">{code.discountValue}% Off</span>
                          ) : (
                            <span className="text-amber-400 font-mono text-zinc-200">Rs. {code.discountValue} Off</span>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-black border border-red-500/20">
                            {code.usedCount || 0} Students Used
                          </span>
                        </td>
                        <td className="px-8 py-4 text-zinc-400 text-xs">
                          {code.createdAt?.toDate ? code.createdAt.toDate().toLocaleString() : 'Just Now'}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button 
                            onClick={() => handleDeletePromoCode(code.id)}
                            className="p-2 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Delete Code"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'codes' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="glass-panel border-2 border-red-500/20 rounded-[2rem] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-2xl relative overflow-hidden bg-white/[0.02]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-purple-500" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Generate OCR-Bypass Code</h2>
              <p className="text-sm text-zinc-400 max-w-lg">Create a one-time use code that allows a student to bypass the OCR payment system and instantly access the platform.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 w-full lg:w-auto shrink-0">
              <button 
                onClick={() => handleGenerateCode('student')}
                disabled={generatingCode}
                className="w-full sm:w-auto sm:min-w-[160px] px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {generatingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Student Code</>}
              </button>
              <button 
                onClick={() => handleGenerateCode('admin')}
                disabled={generatingCode}
                className="w-full sm:w-auto sm:min-w-[160px] px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {generatingCode ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Key className="w-5 h-5" /> Admin Code</>}
              </button>
            </div>
          </div>

          <div className="glass-panel border border-white/10 rounded-[2.5rem] overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/20">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-red-400" /> Issued Codes Tracker
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-zinc-500 bg-white/[0.02]">
                    <th className="px-8 py-4 font-black">Access Code</th>
                    <th className="px-8 py-4 font-black">Role</th>
                    <th className="px-8 py-4 font-black">Status</th>
                    <th className="px-8 py-4 font-black">Date Generated</th>
                    <th className="px-8 py-4 font-black">Used By</th>
                    <th className="px-8 py-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {codesLoading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-zinc-500">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-red-500" />
                        Loading records...
                      </td>
                    </tr>
                  ) : accessCodes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-12 text-center text-zinc-500">
                        No codes generated yet.
                      </td>
                    </tr>
                  ) : (
                    accessCodes.map(code => (
                      <tr key={code.code} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-8 py-4 font-mono font-bold text-white text-lg tracking-widest">{code.code}</td>
                        <td className="px-8 py-4 text-xs font-bold uppercase tracking-widest">
                          {code.role === 'admin' ? (
                            <span className="text-purple-400">Admin</span>
                          ) : (
                            <span className="text-red-400">Student</span>
                          )}
                        </td>
                        <td className="px-8 py-4">
                          {code.used_at ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Used
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-bold border border-yellow-500/20">
                              Ready
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-4 text-zinc-400 text-xs">
                          {new Date(code.created_at).toLocaleString()}
                        </td>
                        <td className="px-8 py-4">
                          {code.used_at ? (
                            <div>
                              <div className="text-white font-medium">{code.name || 'Unknown'}</div>
                              <div className="text-xs text-zinc-500">{code.email}</div>
                              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mt-1">
                                {code.age}yrs • {code.class} • {code.city}
                              </div>
                              <div className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">
                                Inst: {code.institution || 'N/A'}
                              </div>
                              {code.promoCode && (
                                <div className="text-[8px] text-[#c5a059] font-black uppercase tracking-widest mt-1 px-1.5 py-0.5 bg-[#c5a059]/10 rounded-md border border-[#c5a059]/20 inline-block">
                                  Promo: {code.promoCode}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-zinc-600">-</span>
                          )}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button 
                            onClick={() => handleCopyCode(code.code)}
                            className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                            title="Copy Code"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'articles' && (
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border-2 border-red-500/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl bg-white/[0.02]"
          >
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 text-xl font-black shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Compose New Article</h2>
                <p className="text-sm text-zinc-400 mt-1">Share news, updates, or educational content with all cadets.</p>
              </div>
            </div>

            {uploadSuccess && (
              <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 text-green-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                Article published successfully to the global feed!
              </div>
            )}

            {uploadError && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 font-bold">
                <AlertTriangle className="w-5 h-5" />
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadArticle} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Article Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  placeholder="Enter an engaging title..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Content Body</label>
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  required
                  rows={8}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors custom-scrollbar resize-y"
                  placeholder="Write the full article content here..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Attach Media (Image / Video)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*,video/*"
                    onChange={e => setMedia(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-[#0a0f1d] border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center group-hover:border-red-500/30 transition-colors group-hover:bg-white/5 space-y-3">
                     {media ? (
                       <>
                         <CheckCircle2 className="w-8 h-8 text-green-500" />
                         <div>
                           <p className="text-white font-bold">{media.name}</p>
                           <p className="text-xs text-zinc-500 mt-1">{(media.size / 1024 / 1024).toFixed(2)} MB</p>
                         </div>
                       </>
                     ) : (
                       <>
                         <Upload className="w-8 h-8 text-zinc-600 group-hover:text-red-400 transition-colors" />
                         <div>
                           <p className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">Click to Browse or Drag & Drop</p>
                           <p className="text-xs text-zinc-600 mt-1">Supports PNG, JPG, WEBP, MP4</p>
                         </div>
                       </>
                     )}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <button 
                  type="submit"
                  disabled={uploadingArticle || !title || !content}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {uploadingArticle ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Global Article"}
                </button>
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border-2 border-zinc-700/30 rounded-[2.5rem] p-8 md:p-12 shadow-2xl bg-white/[0.02]"
          >
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
              <div className="w-14 h-14 bg-zinc-500/10 rounded-2xl flex items-center justify-center border border-zinc-700/30 text-zinc-400 text-xl font-black shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Published Articles</h2>
                <p className="text-sm text-zinc-400 mt-1">View, track, or delete active articles on the global newsfeed.</p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 font-bold">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="text-xs">{deleteError}</span>
              </div>
            )}

            {articlesLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                <p className="text-xs font-black uppercase tracking-widest">Retrieving articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <p className="text-base font-bold">No articles published yet.</p>
                <p className="text-xs mt-1">Compose and publish an article above to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <div 
                    key={article.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-[#0a0f1d] border border-white/10 rounded-2xl hover:border-zinc-700/50 transition-all-custom"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-white uppercase tracking-tight line-clamp-1">{article.title}</h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2 md:line-clamp-1 font-sans pr-4">{article.content}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[9px] uppercase font-black tracking-widest text-zinc-500 font-sans">
                        <span>
                          {article.createdAt?.toDate 
                            ? format(article.createdAt.toDate(), 'MMM dd, yyyy') 
                            : (article.createdAt ? format(new Date(article.createdAt), 'MMM dd, yyyy') : 'Recently Published')}
                        </span>
                        {article.media_url && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-blue-400 font-sans font-black">Has Attachment</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center font-sans">
                      {article.media_url && (
                        <a 
                          href={article.media_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          View Media
                        </a>
                      )}
                      
                      {deleteConfirmId === article.id ? (
                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/25 p-1 rounded-lg">
                          <span className="text-[9px] text-red-400 font-black uppercase tracking-wider px-1">Sure?</span>
                          <button
                            onClick={() => handleConfirmDelete(article.id)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase tracking-widest rounded transition-all"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-[9px] font-black uppercase tracking-widest rounded transition-all"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setDeleteConfirmId(article.id);
                            setDeleteError(null);
                          }}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                          title="Delete Article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}

      {activeTab === 'live-classes' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Create Live Class Form */}
          <div className="glass-panel border-2 border-red-500/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl bg-white/[0.02]">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 text-red-500 text-xl font-black shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Schedule Live Class</h2>
                <p className="text-sm text-zinc-400 mt-1">Host interactive sessions over Zoom.</p>
              </div>
            </div>

            {classSuccess && (
              <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-3 text-green-400 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                Live class scheduled successfully!
              </div>
            )}

            <form onSubmit={handleCreateLiveClass} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Topic</label>
                  <input 
                    type="text" 
                    value={liveTopic}
                    onChange={e => setLiveTopic(e.target.value)}
                    required
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Teacher Name</label>
                  <input 
                    type="text" 
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    required
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Start Time</label>
                  <input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    required
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">End Time</label>
                  <input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    required
                    className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Zoom Link</label>
                <input 
                  type="url" 
                  value={zoomLink}
                  onChange={e => setZoomLink(e.target.value)}
                  required
                  placeholder="https://zoom.us/j/..."
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                <textarea 
                  value={liveDescription}
                  onChange={e => setLiveDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 transition-colors custom-scrollbar resize-y"
                />
              </div>

              <div className="pt-6 border-t border-white/10">
                <button 
                  type="submit"
                  disabled={submittingClass}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {submittingClass ? <Loader2 className="w-5 h-5 animate-spin" /> : "Schedule Class"}
                </button>
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Requests Chart */}
            <div className="glass-panel border-2 border-white/10 rounded-[2.5rem] p-8 bg-white/[0.02]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-400" /> Class Demand
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={
                    Object.entries(
                      classRequests.reduce((acc: any, req: any) => {
                        acc[req.topic] = (acc[req.topic] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([name, Demand]) => ({ name, Demand }))
                  }>
                    <XAxis dataKey="name" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0a0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff'}} />
                    <Bar dataKey="Demand" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scheduled Classes */}
            <div className="glass-panel border-2 border-white/10 rounded-[2.5rem] p-8 bg-white/[0.02]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-red-400" /> Scheduled Sessions
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {scheduledClasses.length === 0 ? (
                  <p className="text-zinc-500 text-center py-4">No scheduled classes</p>
                ) : (
                  scheduledClasses.map(cls => (
                    <div key={cls.id} className="p-4 bg-white/5 border border-white/10 rounded-xl relative group">
                      <div className="pr-10">
                        <h4 className="font-bold text-white text-sm truncate">{cls.topic}</h4>
                        <p className="text-xs text-zinc-400 mt-1">{cls.teacher_name} • {format(new Date(cls.start_time), 'MMM dd, hh:mm a')}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteClass(cls.id)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-red-500/20 text-zinc-500 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Student Requests Feed */}
          <div className="glass-panel border-2 border-white/10 rounded-[2.5rem] p-8 bg-white/[0.02]">
            <h3 className="text-xl font-bold text-white mb-6">Student Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classRequests.reduce((acc: any, req: any) => {
                if (!acc[req.topic]) acc[req.topic] = [];
                acc[req.topic].push(req);
                return acc;
              }, {}).length === 0 ? (
                <p className="text-zinc-500 col-span-3">No student requests yet.</p>
              ) : (
                Object.entries(
                  classRequests.reduce((acc: any, req: any) => {
                    if (!acc[req.topic]) acc[req.topic] = [];
                    acc[req.topic].push(req);
                    return acc;
                  }, {})
                ).map(([topic, requests]: [string, any]) => (
                  <div key={topic} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex flex-col h-full">
                    <h4 className="font-bold text-white mb-4 border-b border-white/10 pb-2">{topic} <span className="text-xs text-red-500 ml-2">{requests.length} Requests</span></h4>
                    <div className="space-y-3 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {requests.map((req: any) => (
                        <div key={req.id} className="text-xs text-zinc-300 bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col gap-2">
                          <div>"{req.description}"</div>
                          {req.uid ? (
                            <div className="flex items-center justify-between mt-1 text-[10px] text-zinc-500 border-t border-white/5 pt-1">
                              <span className="truncate max-w-[120px]" title={req.email}>By: {req.email?.split('@')[0] || req.uid.substring(0, 6)}</span>
                              {req.status === 'accepted' ? (
                                <span className="text-green-400 font-bold bg-green-400/10 px-1.5 py-0.5 rounded text-[9px]">Accepted</span>
                              ) : (
                                <button
                                  onClick={() => handleAcceptRequest(req.id, req.topic)}
                                  className="text-[#c5a059] hover:text-[#e4be78] font-bold text-[9px] uppercase tracking-wider"
                                >
                                  Accept &amp; Notify
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="text-[10px] text-zinc-500 italic border-t border-white/5 pt-1">Guest user</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'support' && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Headphones className="w-5 h-5 text-[#c5a059]" /> Support center desk
              </h2>
              <p className="text-zinc-400 text-xs mt-1">Provide real-time help to students and resolve their queries live.</p>
            </div>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-12 gap-6 h-auto md:h-[600px]">
            {/* Sidebar List (Threads) */}
            <div className="md:col-span-4 bg-[#0a0f1d] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-[250px] md:h-full">
              {/* Search Bar */}
              <div className="p-3 border-b border-white/10 bg-black/40">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059]/60 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none placeholder-zinc-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Thread list */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5 bg-[#060a14]/20">
                {supportChats.filter(chat => {
                  const term = supportSearch.toLowerCase();
                  const name = (chat.userName || '').toLowerCase();
                  const email = (chat.userEmail || '').toLowerCase();
                  return name.includes(term) || email.includes(term);
                }).length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 text-xs font-semibold">
                    No active support threads.
                  </div>
                ) : (
                  supportChats.filter(chat => {
                    const term = supportSearch.toLowerCase();
                    const name = (chat.userName || '').toLowerCase();
                    const email = (chat.userEmail || '').toLowerCase();
                    return name.includes(term) || email.includes(term);
                  }).map((chat) => {
                    const isSelected = selectedChatId === chat.id;
                    const unreadAdminCount = chat.unreadByAdminCount || 0;
                    const isResolved = !!chat.isResolved;

                    return (
                      <button
                        key={chat.id}
                        onClick={() => setSelectedChatId(chat.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                          isSelected 
                            ? 'bg-[#c5a059]/10 border-[#c5a059]/30' 
                            : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 w-full">
                          <div className="truncate pr-1">
                            <span className="font-bold text-xs text-white block truncate">{chat.userName || 'Student'}</span>
                            <span className="text-[10px] text-zinc-500 block truncate">{chat.userEmail || 'No email'}</span>
                          </div>
                          
                          <div className="flex flex-col items-end shrink-0 gap-1">
                            {unreadAdminCount > 0 && (
                              <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full inline-block animate-pulse">
                                {unreadAdminCount} new
                              </span>
                            )}
                            {isResolved ? (
                              <span className="text-[8px] font-black uppercase text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">Resolved</span>
                            ) : (
                              <span className="text-[8px] font-black uppercase text-[#c5a059] bg-[#c5a059]/10 px-1.5 py-0.5 rounded">Open</span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-zinc-400 truncate w-full italic">
                          {chat.lastMessage || 'No message contents yet'}
                        </div>

                        <div className="text-[9px] font-mono text-zinc-500 flex items-center justify-between w-full border-t border-white/5 pt-1 mt-0.5">
                          <span>Updated</span>
                          <span>
                            {chat.lastMessageTime ? format(chat.lastMessageTime, 'MMM d, h:mm a') : 'Just now'}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Box Panel */}
            <div className="md:col-span-8 bg-[#0a0f1d] border border-white/10 rounded-2xl flex flex-col overflow-hidden h-[450px] md:h-full">
              {selectedChatId ? (
                (() => {
                  const activeChat = supportChats.find(c => c.id === selectedChatId);
                  return (
                    <div className="flex flex-col h-full">
                      {/* Active Chat Header */}
                      <div className="p-4 bg-black/40 border-b border-white/10 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-white">{activeChat?.userName || 'Student User'}</h3>
                          <p className="text-[10px] text-zinc-400 font-medium">{activeChat?.userEmail || 'No email attached'}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleChatResolved(selectedChatId, !!activeChat?.isResolved)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                              activeChat?.isResolved 
                                ? 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20' 
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20'
                            }`}
                          >
                            {activeChat?.isResolved ? '✓ Resolved (Re-open)' : 'Mark Resolved'}
                          </button>
                        </div>
                      </div>

                      {/* Messages loop */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#060a14]/30 custom-scrollbar">
                        {activeChatMessages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                            No messages in this chat yet.
                          </div>
                        ) : (
                          activeChatMessages.map((msg, idx) => {
                            const isAdmin = msg.senderRole === 'admin';
                            return (
                              <div
                                key={msg.id || idx}
                                className={`flex gap-3 max-w-[80%] ${isAdmin ? 'ml-auto flex-row-reverse text-right' : 'mr-auto'}`}
                              >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold border mt-0.5 ${
                                  isAdmin 
                                    ? 'bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20' 
                                    : 'bg-white/5 text-zinc-400 border-white/10'
                                }`}>
                                  {isAdmin ? 'AD' : (msg.senderName?.[0] || 'S').toUpperCase()}
                                </div>

                                <div className="space-y-1">
                                  <div className={`p-3 rounded-2xl text-xs leading-relaxed text-left ${
                                    isAdmin 
                                      ? 'bg-white/5 text-zinc-200 border border-white/10 rounded-tr-none' 
                                      : 'bg-[#c5a059] text-black font-semibold rounded-tl-none shadow-sm'
                                  }`}>
                                    {msg.text}
                                  </div>
                                  <div className={`text-[9px] font-mono text-zinc-500 block ${isAdmin ? 'text-right' : 'text-left'}`}>
                                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer Message box */}
                      <form
                        onSubmit={handleSendAdminReply}
                        className="p-3 bg-black/40 border-t border-white/10 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder={`Transmit response to ${activeChat?.userName || 'Student'}...`}
                          className="flex-1 bg-white/5 border border-white/10 focus:border-[#c5a059]/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-medium transition-all"
                          disabled={sendingReply}
                        />
                        <button
                          type="submit"
                          disabled={sendingReply || !adminReplyText.trim()}
                          className="px-4 py-2.5 bg-[#c5a059] hover:bg-[#b08c47] disabled:opacity-40 disabled:hover:bg-[#c5a059] text-black rounded-xl transition-all font-bold text-xs shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-[#c5a059]/5"
                        >
                          <Send className="w-3.5 h-3.5" /> Send
                        </button>
                      </form>
                    </div>
                  );
                })()
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
                    <Headphones className="w-8 h-8 text-zinc-600" />
                  </div>
                  <h4 className="font-bold text-sm text-zinc-400 uppercase tracking-widest text-[#c5a059]">duty dispatch station</h4>
                  <p className="text-zinc-500 text-xs mt-1.5 max-w-sm">Select an active transmission channel from the left terminal to begin support briefing or review conversation histories.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'testimonials' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="glass-panel border border-white/5 p-6 rounded-3xl relative overflow-hidden bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 blur-[50px] rounded-full pointer-events-none" />
            <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Sparkles className="w-5 h-5 text-[#c5a059]" />
              Success Stories & Testimonials Manager
            </h3>
            <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
              Create, update, delete, and sequence student feedback or comments displayed in the landing page review carousel.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Input Form (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass-panel border border-white/5 p-6 rounded-3xl bg-black/40 space-y-4">
                <h4 className="text-sm font-black text-[#c5a059] uppercase tracking-wider">
                  {editingTestmId ? 'Customize / Edit Testimonial' : 'Upload Success Story'}
                </h4>

                <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                  {testmSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Saved successfully!
                    </div>
                  )}

                  {testmError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {testmError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Student Name *</label>
                    <input
                      type="text"
                      required
                      value={testmName}
                      onChange={(e) => setTestmName(e.target.value)}
                      placeholder="e.g. Ahmed Murad"
                      className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059]/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Role / Cadet Status *</label>
                    <input
                      type="text"
                      required
                      value={testmRole}
                      onChange={(e) => setTestmRole(e.target.value)}
                      placeholder="e.g. Navy Cadet, PAF Pilot"
                      className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059]/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Comment / Review Text *</label>
                    <textarea
                      required
                      rows={4}
                      value={testmText}
                      onChange={(e) => setTestmText(e.target.value)}
                      placeholder="The intelligence test preparation here is unmatched..."
                      className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059]/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all font-medium min-h-[100px] resize-y"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Student Avatar Image URL (Optional)</label>
                    <input
                      type="url"
                      value={testmImage}
                      onChange={(e) => setTestmImage(e.target.value)}
                      placeholder="Leave blank for automatic placeholder avatar"
                      className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059]/60 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Rating (Stars)</label>
                      <select
                        value={testmStars}
                        onChange={(e) => setTestmStars(Number(e.target.value))}
                        className="w-full bg-[#0a0f1d] border border-white/10 focus:border-[#c5a059]/60 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none transition-all font-medium"
                      >
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Sequence Number (Order)</label>
                      <input
                        type="number"
                        min={0}
                        value={testmSequence}
                        onChange={(e) => setTestmSequence(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059]/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all font-medium font-mono"
                      />
                      <p className="text-[9px] text-zinc-500 font-mono">Ascending order sequence</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={submittingTestm}
                      className="flex-1 px-4 py-2.5 bg-[#c5a059] hover:bg-[#b08c47] disabled:bg-zinc-700 text-black rounded-xl transition-all font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#c5a059]/5"
                    >
                      {submittingTestm ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> {editingTestmId ? 'Apply Changes' : 'Publish Success Story'}
                        </>
                      )}
                    </button>

                    {editingTestmId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestmId(null);
                          setTestmName('');
                          setTestmRole('');
                          setTestmText('');
                          setTestmImage('');
                          setTestmStars(5);
                          setTestmSequence(0);
                        }}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl transition-all font-bold text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Display Panel / List & Ordering (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel border border-white/5 p-6 rounded-3xl bg-black/40 space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-between">
                  <span>Current Landing Page Comments & Testimonials</span>
                  <div className="flex items-center gap-2">
                    {testimonials.length > 0 && (
                      <button
                        type="button"
                        disabled={seedingPresets}
                        onClick={handleSeedPresets}
                        className="text-[10px] text-[#c5a059] hover:text-[#b08c47] font-bold border border-[#c5a059]/20 px-2 py-1 rounded-lg hover:bg-[#c5a059]/5 flex items-center gap-1 transition-all cursor-pointer"
                      >
                        {seedingPresets ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />}
                        Load Presets
                      </button>
                    )}
                    <span className="text-[10px] text-[#c5a059] bg-[#c5a059]/10 px-2.5 py-1 rounded-full border border-[#c5a059]/20 font-mono">
                      {testimonials.length} ITEMS
                    </span>
                  </div>
                </h4>

                {testimonialsLoading ? (
                  <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin text-[#c5a059] mb-2" />
                    <span className="text-xs">Fetching active testimonials...</span>
                  </div>
                ) : testimonials.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/5 rounded-2xl space-y-4">
                    <div className="flex flex-col items-center">
                      <FileText className="w-8 h-8 text-zinc-600 mb-2" />
                      <p className="text-xs text-zinc-500">No custom testimonials found in database.</p>
                      <p className="text-[10px] text-zinc-650 mt-1 max-w-md">
                        The landing page currently uses the 5 original hardcoded success stories. Load them into the database to edit or delete them!
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={seedingPresets}
                      onClick={handleSeedPresets}
                      className="px-4 py-2 bg-[#c5a059]/10 hover:bg-[#c5a059]/20 border border-[#c5a059]/20 hover:border-[#c5a059]/40 text-[#c5a059] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {seedingPresets ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Importing Presets...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                          Load 5 Original Stories to Database
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {testimonials.map((testm) => (
                      <div
                        key={testm.id}
                        className="p-4 bg-[#0a0f1d]/60 hover:bg-[#0a0f1d] border border-white/5 rounded-2xl flex md:items-start gap-4 transition-all relative group"
                      >
                        {/* Sequence Badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span className="text-[9px] font-mono font-black text-[#c5a059] bg-[#c5a059]/10 border border-[#c5a059]/20 px-2 py-0.5 rounded-md">
                            SEQ: {testm.sequence || 0}
                          </span>
                        </div>

                        {/* Student Image */}
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                          <img
                            src={testm.image || `https://picsum.photos/seed/${encodeURIComponent(testm.name || 'avatar')}/100/100`}
                            alt={testm.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-1.5 min-w-0 pr-16">
                          <div>
                            <h5 className="font-bold text-xs text-white truncate leading-none mb-1 text-left">{testm.name}</h5>
                            <span className="text-[10px] font-medium text-zinc-500 truncate block uppercase tracking-wide leading-none text-left">
                              {testm.role}
                            </span>
                          </div>

                          <p className="text-zinc-400 text-xs italic leading-relaxed text-left line-clamp-3">
                            "{testm.text}"
                          </p>

                          <div className="flex items-center gap-3">
                            {/* Stars rating */}
                            <div className="flex gap-0.5">
                              {[...Array(testm.stars || 5)].map((_, i) => (
                                <Star key={i} className="w-2.5 h-2.5 fill-[#c5a059] text-[#c5a059]" />
                              ))}
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 font-black">
                              <button
                                type="button"
                                onClick={() => handleEditTestimonial(testm)}
                                className="text-[10px] text-teal-400 hover:text-teal-300 uppercase tracking-wider cursor-pointer transition-colors"
                              >
                                Customize
                              </button>
                              <span className="text-zinc-700 font-mono text-[10px]">•</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTestimonial(testm.id)}
                                className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-0.5"
                              >
                                <Trash2 className="w-2.5 h-2.5" /> Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
