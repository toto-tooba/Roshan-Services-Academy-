import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User as UserIcon, 
  AtSign, 
  Hash, 
  GraduationCap, 
  MapPin, 
  Loader2 
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName: string;
  photoURL: string;
  bio: string;
  age: number;
  class: string;
  city: string;
  isAdmin: boolean;
}

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({ userId, isOpen, onClose }) => {
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId || !isOpen) return;
      setLoading(true);
      setProfile(null);
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative glass-panel w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col max-h-[90vh]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-neon-blue to-purple-500" />
            
            <div className="p-4 md:p-8 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                  <UserIcon className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white leading-none mb-1">Cadet Profile</h2>
                  <p className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Public Data Module v1.0</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 md:p-3 hover:bg-white/10 rounded-2xl transition-colors text-zinc-500 hover:text-white">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 p-6 md:p-10">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                </div>
              ) : profile ? (
                <div className="space-y-6 md:space-y-10">
                  <div className="flex flex-col items-center">
                    <div className="relative group mb-4 md:mb-6">
                      <div className="w-24 h-24 md:w-40 md:h-40 rounded-full border-4 border-white/5 overflow-hidden bg-white/5 flex items-center justify-center relative shadow-2xl">
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-12 h-12 md:w-20 md:h-20 text-zinc-600" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-black text-white text-center tracking-tight mb-2 uppercase">
                      {profile.displayName || 'Unknown Officer'}
                    </h3>
                    {profile.isAdmin && (
                      <div className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
                        Admin Officer
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="glass-panel border border-white/5 p-4 md:p-6 rounded-[2rem] bg-white/5 space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                          <AtSign className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Username</label>
                          <div className="text-sm md:text-base text-white font-medium">{profile.username || 'Not set'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
                          <Hash className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Age</label>
                          <div className="text-sm md:text-base text-white font-medium">{profile.age || 'Not set'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel border border-white/5 p-4 md:p-6 rounded-[2rem] bg-white/5 space-y-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                          <GraduationCap className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Class / Qualification</label>
                          <div className="text-sm md:text-base text-white font-medium">{profile.class || 'Not set'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 shrink-0">
                          <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                          <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 block">City</label>
                          <div className="text-sm md:text-base text-white font-medium">{profile.city || 'Not set'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-panel border border-white/5 p-6 md:p-8 rounded-[2rem] bg-white/5">
                    <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-3">Bio / Mission Statement</label>
                    <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-medium">
                      {profile.bio || 'No mission statement provided.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-500 text-sm">
                  Profile not found or access denied.
                </div>
              )}
            </div>
            
            <div className="p-6 md:p-8 border-t border-white/10 bg-black/40 flex justify-end shrink-0">
              <button 
                onClick={onClose}
                className="px-6 md:px-8 py-3 md:py-4 bg-white/10 hover:bg-white/20 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all"
              >
                Close Profile
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
