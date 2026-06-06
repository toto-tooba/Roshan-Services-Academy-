import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  ShieldCheck, 
  Clock, 
  CheckCheck,
  AlertCircle
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mark all admin replies as read when chat is open and active
  useEffect(() => {
    if (!user || !isOpen) return;

    // Reset user count to 0 since user is looking at messages
    const chatRef = doc(db, 'support_chats', user.uid);
    updateDoc(chatRef, {
      unreadByUserCount: 0
    }).catch((err) => {
      // Chat might not exist yet; safe to ignore
    });
  }, [user, isOpen, messages]);

  // Subscribe to metadata (to track unreadByUserCount)
  useEffect(() => {
    if (!user) return;

    const chatRef = doc(db, 'support_chats', user.uid);
    const unsubMeta = onSnapshot(chatRef, (snap) => {
      if (snap.exists()) {
        setChatMeta(snap.data());
      } else {
        setChatMeta(null);
      }
    });

    return () => unsubMeta();
  }, [user]);

  // Subscribe to real-time chat messages
  useEffect(() => {
    if (!user) return;

    const messagesQuery = query(
      collection(db, `support_chats/${user.uid}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubMessages = onSnapshot(messagesQuery, (snap) => {
      const msgs = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        time: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date()
      }));
      setMessages(msgs);
    });

    return () => unsubMessages();
  }, [user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const messagesCol = collection(db, `support_chats/${user.uid}/messages`);
      const supportChatRef = doc(db, 'support_chats', user.uid);

      // Add message
      await addDoc(messagesCol, {
        text,
        senderId: user.uid,
        senderName: user.displayName || 'Student',
        senderRole: 'user',
        createdAt: serverTimestamp()
      });

      // Update support_chats doc
      // Simple increment logic that is safe is to check if chat exists or fetch existing, but setDoc with merge is fast
      const currentUnread = (chatMeta?.unreadByAdminCount || 0) + 1;

      await setDoc(supportChatRef, {
        uid: user.uid,
        userName: user.displayName || 'Student',
        userEmail: user.email || 'student@example.com',
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        unreadByAdminCount: currentUnread,
        updatedAt: serverTimestamp(),
        isResolved: false
      }, { merge: true });

    } catch (err) {
      console.error('Failed to send support message:', err);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  const unreadCount = chatMeta?.unreadByUserCount || 0;

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
            className="fixed bottom-24 right-5 left-5 sm:left-auto sm:w-96 h-[480px] bg-[#0c1328]/95 backdrop-blur-2xl border-2 border-white/10 rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden z-40 font-sans text-white border-[#c5a059]/20"
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
                    Welcome to Command Support! 🫡 Please describe what you need assistance with, and our supervisor will reply right here.
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
                      {isAdmin ? 'HQ' : (user.displayName?.[0] || 'S').toUpperCase()}
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
