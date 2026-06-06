import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  CornerDownRight, 
  User as UserIcon,
  Loader2,
  Trash2
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';
import { PublicProfileModal } from './PublicProfileModal';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text?: string;
  imageUrl?: string;
  replyTo?: string;
  createdAt: any;
}

interface DiscussionBoardProps {
  collectionPath: string;
  title: string;
  header?: React.ReactNode;
}

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ collectionPath, title, header }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error in DiscussionBoard:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [collectionPath]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionPath, id));
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert("Image is too large. Please select an image smaller than 500KB.");
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      setIsUploadingImage(false);
      setShowImageInput(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || (!inputText.trim() && !imageUrl) || isSending) return;

    setIsSending(true);
    try {
      const payloadSize = (inputText.length + (imageUrl?.length || 0));
      if (payloadSize > 950000) {
        alert("Message is too large to send. Try a smaller image or shorter text.");
        setIsSending(false);
        return;
      }

      const messageData: any = {
        senderId: user.uid,
        senderName: profile?.displayName || user.displayName || 'Anonymous',
        senderPhoto: profile?.photoURL || user.photoURL || '',
        createdAt: serverTimestamp(),
      };

      if (inputText.trim()) messageData.text = inputText.trim();
      if (imageUrl) messageData.imageUrl = imageUrl;
      if (replyingTo) messageData.replyTo = replyingTo.id;

      await addDoc(collection(db, collectionPath), messageData);
      
      setInputText('');
      setImageUrl('');
      setShowImageInput(false);
      setReplyingTo(null);
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. The image might be too large for the database.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 glass-panel lg:rounded-[3rem] rounded-xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue to-neon-purple z-10" />
      
      {header || (
        <div className="p-6 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neon-blue/10 rounded-xl flex items-center justify-center border border-neon-blue/20">
              <UserIcon className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-black text-xs uppercase tracking-[0.3em] text-white leading-none mb-1">{title}</h3>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{messages.length} Neural Packets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
            <span className="text-[10px] font-black text-neon-blue uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2.5 custom-scrollbar bg-black/20">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-10 h-10 animate-spin text-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.3)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-700 space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10">
              <Send className="w-10 h-10 opacity-20" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">No neural data detected. Initiate transmission.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-1.5 sm:gap-2 ${msg.senderId === user?.uid ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {msg.senderId !== user?.uid && (
                <div 
                  onClick={() => setSelectedProfileId(msg.senderId)}
                  className="w-6 h-6 sm:w-7 sm:h-7 mt-3.5 rounded-full bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:border-neon-blue/50 transition-all cursor-pointer"
                >
                  {msg.senderPhoto ? (
                    <img src={msg.senderPhoto} alt={msg.senderName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-zinc-400">
                      {msg.senderName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              )}

              <div className={`max-w-[80%] sm:max-w-[75%] group relative flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                {msg.senderId !== user?.uid && (
                  <div className="flex items-center mb-0.5 px-1.5 cursor-pointer hover:underline decoration-white/30" onClick={() => setSelectedProfileId(msg.senderId)}>
                    <span className="text-[10px] font-medium text-zinc-400">
                      {msg.senderName}
                    </span>
                  </div>
                )}

                <div className={`
                  px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl shadow-sm relative border transition-all duration-300
                  ${msg.senderId === user?.uid 
                    ? 'bg-[#005c4b] text-[#e9edef] border-transparent rounded-tr-sm shadow-black/10' 
                    : 'bg-[#202c33] text-[#e9edef] border-transparent rounded-tl-sm shadow-black/10'}
                `}>
                  {msg.replyTo && (
                    <div className={`
                      mb-1 p-1 px-2 rounded-md text-[10px] font-medium border-l-4 flex items-center gap-1.5
                      ${msg.senderId === user?.uid ? 'bg-black/10 border-[#47c7a3]' : 'bg-black/20 border-[#f2a240]'}
                    `}>
                      <span className="truncate opacity-80 text-[#e9edef]">
                        {messages.find(m => m.id === msg.replyTo)?.text || 'Image'}
                      </span>
                    </div>
                  )}

                  {msg.imageUrl && (
                    <div className="rounded-lg overflow-hidden mb-1 shadow-sm max-w-[200px] sm:max-w-[250px]">
                      <img 
                        src={msg.imageUrl} 
                        alt="Shared Data" 
                        className="max-w-full h-auto" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  {msg.text && <p className="text-[13px] sm:text-[14px] leading-snug font-normal whitespace-pre-wrap break-words">{msg.text}</p>}

                  <div className={`
                    absolute top-0 ${msg.senderId === user?.uid ? '-left-12' : '-right-12'} 
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                  `}>
                    {(msg.senderId === user?.uid || profile?.isAdmin) && (
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="w-8 h-8 flex items-center justify-center bg-neon-pink/10 text-neon-pink rounded-lg border border-neon-pink/20 hover:bg-neon-pink hover:text-black transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setReplyingTo(msg)}
                    className={`
                      absolute bottom-0 ${msg.senderId === user?.uid ? '-left-12' : '-right-12'} 
                      opacity-0 group-hover:opacity-100 transition-all duration-300
                      w-8 h-8 flex items-center justify-center bg-white/5 text-zinc-500 rounded-lg border border-white/10 hover:bg-neon-blue hover:text-black hover:border-neon-blue
                    `}
                  >
                    <CornerDownRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 sm:p-4 bg-white/5 backdrop-blur-3xl border-t border-white/10 space-y-3">
        <AnimatePresence>
          {replyingTo && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-between p-3 bg-white/10 border border-white/20 rounded-xl text-xs font-medium text-white"
            >
              <div className="flex items-center gap-3 truncate">
                <CornerDownRight className="w-4 h-4 opacity-50" />
                <span className="truncate">Replying to <b className="text-white">{replyingTo.senderName}</b>: <span className="opacity-70">{replyingTo.text || 'Image'}</span></span>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </motion.div>
          )}
          {showImageInput && imageUrl && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group inline-block"
            >
              <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/20 shadow-md">
                <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <button 
                onClick={() => {
                  setImageUrl('');
                  setShowImageInput(false);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex items-end gap-1.5 sm:gap-2 text-sm">
          <input 
            type="file"
            ref={imageInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <button 
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className={cn(
              "w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full transition-all flex items-center justify-center border",
              imageUrl 
                ? 'bg-[#c5a059] text-black border-[#c5a059]' 
                : 'bg-transparent text-zinc-400 border-transparent hover:bg-white/5 hover:text-white'
            )}
          >
            {isUploadingImage ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full px-4 sm:px-4 py-2 sm:py-2 h-9 sm:h-10 bg-[#2a3942] border border-transparent rounded-full focus:outline-none focus:bg-[#202c33] transition-all text-[14px] text-white placeholder:text-zinc-400"
            />
          </div>

          <button 
            type="submit"
            disabled={(!inputText.trim() && !imageUrl) || isSending}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shadow-sm relative group"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      </div>
      <PublicProfileModal 
        userId={selectedProfileId}
        isOpen={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
      />
    </div>
  );
};
