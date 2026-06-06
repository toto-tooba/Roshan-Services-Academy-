import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
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
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

export const ProfileSection: React.FC = () => {
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
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a059] via-blue-500 to-[#c5a059]" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-2 border-white/10 overflow-hidden bg-white/5 shadow-2xl shadow-[#c5a059]/10 group-hover:border-[#c5a059] transition-all duration-500">
              {photoURL ? (
                <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <UserIcon className="w-16 h-16" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-2 leading-none">Identity Management</h2>
              <p className="text-zinc-400 font-medium text-sm">Update your officer profile and security credentials.</p>
            </div>
            
            <div className="space-y-2 max-w-md w-full mx-auto md:mx-0">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center justify-center md:justify-start gap-2">
                <Camera className="w-3 h-3 text-[#c5a059]" /> Avatar Protocol (URL)
              </label>
              <input 
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                placeholder="https://neural-link.io/avatar.png"
                className="w-full px-6 py-3 md:py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-sm md:text-base text-white font-medium placeholder:text-zinc-700"
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-[#c5a059]" /> Full Designation
            </label>
            <input 
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
              <AtSign className="w-4 h-4 text-[#c5a059]" /> Officer ID
            </label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="unique_id"
              className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
              <Hash className="w-4 h-4 text-[#c5a059]" /> Age
            </label>
            <input 
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#c5a059]" /> Class / Rank
            </label>
            <input 
              type="text"
              value={userClass}
              onChange={(e) => setUserClass(e.target.value)}
              placeholder="Class"
              className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-700"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#c5a059]" /> Sector / City
            </label>
            <input 
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-700"
            />
          </div>

          <div className="sm:col-span-2 space-y-2">
            <label className="text-[10px] md:text-xs font-black text-zinc-600 uppercase tracking-widest px-1 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#c5a059]" /> Bio / Mission Details
            </label>
            <textarea 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-6 py-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[#c5a059] transition-all text-white font-medium placeholder:text-zinc-700 resize-none"
            />
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-5 mt-8 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border",
              message.type === 'success' ? "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20" : "bg-red-500/10 text-red-500 border-red-500/20"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-white/10">
          <button 
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            className="flex-shrink-0 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl font-black text-xs md:text-sm text-zinc-400 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
          >
            <LogOut className="w-5 h-5" /> Terminate Session
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-8 py-5 bg-[#c5a059] text-black rounded-2xl font-black text-sm md:text-base hover:bg-[#d4b16a] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-[#c5a059]/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Saving identity...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" /> Update Identity Matrix
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
