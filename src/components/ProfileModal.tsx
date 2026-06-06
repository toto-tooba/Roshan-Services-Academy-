import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User as UserIcon, 
  Camera, 
  AtSign, 
  Hash, 
  GraduationCap, 
  MapPin, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

export const ProfileModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const { profile, updateUserProfile, logout } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [userClass, setUserClass] = useState(profile?.class || '');
  const [city, setCity] = useState(profile?.city || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '');
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
      setPhotoURL(profile.photoURL || '');
      setAge(profile.age?.toString() || '');
      setUserClass(profile.class || '');
      setCity(profile.city || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await updateUserProfile({
        username,
        displayName,
        bio,
        photoURL,
        age: parseInt(age),
        class: userClass,
        city
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="relative glass-panel w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a059] via-blue-500 to-[#c5a059]" />
            
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center border border-[#c5a059]/20">
                  <UserIcon className="w-6 h-6 text-[#c5a059]" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white leading-none mb-1">Officer Profile</h2>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Command Matrix v4.0</p>
                </div>
              </div>
              <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors text-zinc-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-black/20">
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] border-2 border-white/10 overflow-hidden bg-white/5 shadow-2xl shadow-[#c5a059]/10 group-hover:border-[#c5a059] transition-all duration-500">
                    {photoURL ? (
                      <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-700">
                        <UserIcon className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="w-full space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Avatar Protocol (URL)</label>
                  <input 
                    type="text"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://neural-link.io/avatar.png"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-800"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <AtSign className="w-3 h-3 text-[#c5a059]" /> Officer ID
                  </label>
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="unique_id"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <UserIcon className="w-3 h-3 text-[#c5a059]" /> Full Designation
                  </label>
                  <input 
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Hash className="w-3 h-3 text-[#c5a059]" /> Age
                  </label>
                  <input 
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Age"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <GraduationCap className="w-3 h-3 text-[#c5a059]" /> Class
                  </label>
                  <input 
                    type="text"
                    value={userClass}
                    onChange={(e) => setUserClass(e.target.value)}
                    placeholder="Class"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-800"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#c5a059]" /> Sector / City
                  </label>
                  <input 
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-800"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Info className="w-3 h-3 text-[#c5a059]" /> Bio
                  </label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your mission..."
                    rows={3}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-800 resize-none"
                  />
                </div>
              </div>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border",
                    message.type === 'success' ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {message.text}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={async () => {
                    await logout();
                    window.location.href = '/';
                  }}
                  className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] text-zinc-500 hover:text-red-400 hover:border-red-500/50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" /> Terminate Session
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[2] px-8 py-5 bg-[#c5a059] text-black rounded-2xl font-black text-lg hover:bg-[#d4b16a] hover:scale-[1.02] transition-all disabled:opacity-20 flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-[#c5a059]/20"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Identity'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
