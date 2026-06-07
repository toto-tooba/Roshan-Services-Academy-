import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  ShieldCheck, 
  Clock, 
  CheckCheck,
  AlertCircle,
  User,
  Mail,
  MessageCircle
} from 'lucide-react';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

export const SupportWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [chatMeta, setChatMeta] = useState<any>(null);
  const [sending, setSending] = useState(false);
  
  // Guest States
  const [guestId, setGuestId] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('guest_support_id') : null;
  });
  const [guestName, setGuestName] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('guest_support_name') || '' : '';
  });
  const [guestEmail, setGuestEmail] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('guest_support_email') || '' : '';
  });

  // Guest Registration Form inside Widget
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formInquiry, setFormInquiry] = useState('');
  const [formError, setFormError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Derive the active Chat Identifier, Name, and Email
  const effectiveUid = user?.uid || guestId;
  const effectiveName = user ? (user.displayName || 'PMA Student') : guestName;
  const effectiveEmail = user ? (user.email || 'student@example.com') : guestEmail;

  // Mark all admin replies as read when chat is open and active
  useEffect(() => {
    if (!effectiveUid || !isOpen) return;

    // Reset user count to 0 since user/guest is looking at messages
    const chatRef = doc(db, 'support_chats', effectiveUid);
    updateDoc(chatRef, {
      unreadByUserCount: 0
    }).catch((err) => {
      // Chat might not exist yet; safe to ignore
    });
  }, [effectiveUid, isOpen, messages.length]);

  // Subscribe to metadata (to track unreadByUserCount & unreadByAdminCount)
  useEffect(() => {
    if (!effectiveUid) return;

    const chatRef = doc(db, 'support_chats', effectiveUid);
    const unsubMeta = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        setChatMeta(snap.data());
      } else {
        setChatMeta(null);
      }
    });

    return () => unsubMeta();
  }, [effectiveUid]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!effectiveUid) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(
      collection(db, `support_chats/${effectiveUid}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubMessages = onSnapshot(messagesQuery, (snap) => {
      const msgs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        time: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
      }));
      setMessages(msgs);
    }, (err) => {
      console.warn("Support messages query error/unauthenticated:", err);
    });

    return () => unsubMessages();
  }, [effectiveUid]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  // Handle standard messages after chat is initiated
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveUid || !messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const messagesCol = collection(db, `support_chats/${effectiveUid}/messages`);
      const supportChatRef = doc(db, 'support_chats', effectiveUid);

      // Add message
      await addDoc(messagesCol, {
        text,
        senderId: effectiveUid,
        senderName: effectiveName,
        senderRole: 'user',
        createdAt: serverTimestamp()
      });

      const currentUnread = (chatMeta?.unreadByAdminCount || 0) + 1;

      await setDoc(supportChatRef, {
        uid: effectiveUid,
        userName: effectiveName,
        userEmail: effectiveEmail,
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        unreadByAdminCount: currentUnread,
        updatedAt: serverTimestamp(),
        isResolved: false,
        isGuest: !user
      }, { merge: true });

    } catch (err) {
      console.error('Failed to send support message:', err);
    } finally {
      setSending(false);
    }
  };

  // Handle guest account initialization and first inquiry message submission
  const handleInitiateGuestChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formEmail.trim() || !formInquiry.trim()) {
      setFormError('All authentication coordinates are required.');
      return;
    }

    setSending(true);

    try {
      // Create a secure custom guest ID
      const rand = Math.random().toString(36).substring(2, 11);
      const newGuestId = `guest_${rand}_${Date.now()}`;

      // Save coordinates to local storage
      localStorage.setItem('guest_support_id', newGuestId);
      localStorage.setItem('guest_support_name', formName.trim());
      localStorage.setItem('guest_support_email', formEmail.trim());

      // Set state to trigger subscription immediately
      setGuestId(newGuestId);
      setGuestName(formName.trim());
      setGuestEmail(formEmail.trim());

      // Store in firestore collection
      const messagesCol = collection(db, `support_chats/${newGuestId}/messages`);
      const supportChatRef = doc(db, 'support_chats', newGuestId);

      // Add initial inquiry message
      await addDoc(messagesCol, {
        text: formInquiry.trim(),
        senderId: newGuestId,
        senderName: formName.trim(),
        senderRole: 'user',
        createdAt: serverTimestamp()
      });

      // Set chat document
      await setDoc(supportChatRef, {
        uid: newGuestId,
        userName: formName.trim(),
        userEmail: formEmail.trim(),
        lastMessage: formInquiry.trim(),
        lastMessageAt: serverTimestamp(),
        unreadByAdminCount: 1,
        unreadByUserCount: 0,
        updatedAt: serverTimestamp(),
        isResolved: false,
        isGuest: true
      });

      // Clear form states
      setFormInquiry('');

    } catch (err) {
      console.error('Failed to initiate guest support chat:', err);
      setFormError('Initialization failed. Please verify network connection.');
    } finally {
      setSending(false);
    }
  };

  const unreadCount = chatMeta?.unreadByUserCount || 0;
  const isSetupRequired = !user && !guestId;

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative group p-4 bg-[#c5a059] hover:bg-[#b08c47] text-black rounded-full shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] transition-all cursor-pointer flex items-center justify-center border border-[#d6b36a]/40"
          id="support-chat-trigger"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <MessageSquare className="w-6 h-6 animate-pulse" />
          )}

          {/* Unread Counter Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#060a14] shadow-lg animate-bounce px-1">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Floating Chat Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-5 left-5 sm:left-auto sm:w-96 h-[500px] bg-[#0c1328]/95 backdrop-blur-2xl border-2 border-white/10 rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden z-40 font-sans text-white border-[#c5a059]/20"
            id="support-chat-window"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0c1328] to-[#121c37] p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/35 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Support desk</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[9px] font-black font-mono text-zinc-400 uppercase tracking-widest">duty officer online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Switcher */}
            {isSetupRequired ? (
              /* Pre-Chat Guest Registration Form */
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-[#060a14]/80 flex flex-col justify-center">
                <div className="text-center mb-2">
                  <div className="inline-flex p-3 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/20 text-[#c5a059] mb-3">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">Public Support Channels</h4>
                  <p className="text-[10px] text-zinc-400 mt-1 max-w-xs mx-auto">
                    Experiencing signup, activation, or payment issues? Let us know and we'll fix it immediately.
                  </p>
                </div>

                <form onSubmit={handleInitiateGuestChat} className="space-y-3.5">
                  {formError && (
                    <div className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold">{formError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider mb-1">Your Full Name</label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-0 transition-colors"
                      />
                      <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider mb-1">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059] rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:ring-0 transition-colors"
                      />
                      <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase text-zinc-400 tracking-wider mb-1">What can we help you with?</label>
                    <textarea 
                      required
                      value={formInquiry}
                      onChange={(e) => setFormInquiry(e.target.value)}
                      placeholder="e.g. My login is stuck, or I sent payment but didn't get access..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-0 resize-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 bg-[#c5a059] hover:bg-[#b08c47] disabled:opacity-50 text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-[#c5a059]/10 mt-1"
                  >
                    {sending ? 'Initiating Broadcast...' : 'Start support briefing'}
                  </button>
                </form>
              </div>
            ) : (
              /* Inside Active Support Chat Module */
              <>
                {/* Message Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#060a14]/60">
                  
                  {/* Bot Welcome / Alert (Static helper) */}
                  <div className="bg-[#c5a059]/5 border border-[#c5a059]/15 p-3 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                    <div className="text-[10px] text-zinc-300 leading-relaxed font-semibold">
                      Officer response can take 5-10 minutes. Drop your message below; we receive live alerts on our admin console immediately.
                    </div>
                  </div>

                  {/* Bot Hello Message in loop if no messages yet */}
                  {messages.length === 0 && (
                    <div className="flex gap-2.5 max-w-[85%]">
                      <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0 font-mono text-[9px] font-bold text-[#c5a059]">
                        HQ
                      </div>
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-200 leading-relaxed rounded-tl-none">
                        Welcome back to Command Support, {effectiveName}! 🫡 How may we help you?
                      </div>
                    </div>
                  )}

                  {/* Loop Messages */}
                  {messages.map((msg, idx) => {
                    const isAdmin = msg.senderRole === 'admin';
                    return (
                      <div 
                        key={msg.id || idx}
                        className={`flex gap-2.5 max-w-[85%] ${isAdmin ? 'self-start mr-auto' : 'ml-auto flex-row-reverse text-right'}`}
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black border ${
                          isAdmin 
                            ? 'bg-[#c5a059]/15 text-[#c5a059] border-[#c5a059]/30' 
                            : 'bg-white/5 text-zinc-400 border-white/10'
                        }`}>
                          {isAdmin ? 'HQ' : (effectiveName?.[0] || 'S').toUpperCase()}
                        </div>

                        {/* Bubble */}
                        <div className="space-y-1">
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed text-left ${
                            isAdmin 
                              ? 'bg-white/5 border border-white/5 text-zinc-200 rounded-tl-none' 
                              : 'bg-[#c5a059] text-black font-semibold rounded-tr-none shadow-lg shadow-[#c5a059]/5'
                          }`}>
                            {msg.text}
                          </div>
                          
                          <div className={`flex items-center gap-1 text-[8px] text-zinc-500 font-mono ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!isAdmin && (
                              <CheckCheck className={`w-2.5 h-2.5 ml-0.5 ${chatMeta?.unreadByAdminCount === 0 ? 'text-green-400' : 'text-zinc-600'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Form */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-3 bg-[#0a0f1d] border-t border-white/10 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Ask helper or duty officer..."
                    className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-[#c5a059]/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder-zinc-500 font-medium transition-all"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="p-2.5 bg-[#c5a059] hover:bg-[#b08c47] disabled:opacity-40 disabled:hover:bg-[#c5a059] text-black rounded-xl transition-all font-bold shrink-0 cursor-pointer flex items-center justify-center shadow-md shadow-[#c5a059]/5"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
