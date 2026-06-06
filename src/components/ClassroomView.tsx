import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowRight, 
  UserPlus, 
  Hash, 
  MessageSquare, 
  Settings,
  X,
  Copy,
  Check,
  Loader2,
  Trash2,
  Info,
  AlertTriangle,
  Check as CheckIcon
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { DiscussionBoard } from './DiscussionBoard';
import { cn } from '../lib/utils';
import { PublicProfileModal } from './PublicProfileModal';

interface Classroom {
  id: string;
  name: string;
  bio?: string;
  iconUrl?: string;
  isPublic: boolean;
  ownerId: string;
  memberIds: string[];
  inviteCode?: string;
  createdAt: any;
}

interface JoinRequest {
  id: string;
  classroomId: string;
  classroomName: string;
  requesterId: string;
  requesterName: string;
  requesterUsername: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
}

export const ClassroomView: React.FC<{ onActiveChatChange?: (classroomId: string | null) => void }> = ({ onActiveChatChange }) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'discover' | 'requests'>('my');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [publicClassrooms, setPublicClassrooms] = useState<Classroom[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [userProfiles, setUserProfiles] = useState<Record<string, { photoURL?: string; displayName?: string; username?: string }>>({});

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      const profiles: Record<string, any> = {};
      snapshot.docs.forEach(docSnap => {
        profiles[docSnap.id] = docSnap.data();
      });
      setUserProfiles(profiles);
    });
    return () => unsub();
  }, []);

  const selectedClassroomId = selectedClassroom ? selectedClassroom.id : null;
  useEffect(() => {
    if (onActiveChatChange) {
      onActiveChatChange(selectedClassroomId);
    }
  }, [selectedClassroomId]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Modal State
  const [newClassName, setNewClassName] = useState('');
  const [newClassBio, setNewClassBio] = useState('');
  const [newClassIcon, setNewClassIcon] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);

  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (!selectedClassroom) return;
    const count = Math.max(1, Math.floor(Math.random() * selectedClassroom.memberIds.length) + 1);
    setOnlineCount(count);
  }, [selectedClassroom]);

  useEffect(() => {
    if (!user) return;

    const qMy = query(
      collection(db, 'classrooms'), 
      where('memberIds', 'array-contains', user.uid)
    );
    const unsubMy = onSnapshot(qMy, (snapshot) => {
      setClassrooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Classroom)));
      setLoading(false);
    });

    const qPublic = query(
      collection(db, 'classrooms'),
      where('isPublic', '==', true)
    );
    const unsubPublic = onSnapshot(qPublic, (snapshot) => {
      setPublicClassrooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Classroom)));
    });

    const qReq = query(
      collection(db, 'join_requests'),
      where('status', '==', 'pending')
    );
    const unsubReq = onSnapshot(qReq, (snapshot) => {
      setJoinRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JoinRequest)));
    });

    return () => {
      unsubMy();
      unsubPublic();
      unsubReq();
    };
  }, [user]);

  const handleCreateClassroom = async () => {
    if (!user || !newClassName.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await addDoc(collection(db, 'classrooms'), {
        name: newClassName.trim(),
        bio: newClassBio.trim(),
        iconUrl: newClassIcon.trim() || `https://picsum.photos/seed/${newClassName}/200`,
        isPublic,
        ownerId: user.uid,
        memberIds: [user.uid],
        inviteCode,
        createdAt: serverTimestamp()
      });
      setNewClassName('');
      setNewClassBio('');
      setNewClassIcon('');
      setIsPublic(false);
      setShowCreateModal(false);
    } catch (err) {
      console.error("Error creating classroom:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setNewClassIcon(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleJoinByCode = async () => {
    if (!user || !inviteCodeInput.trim()) return;
    try {
      const q = query(collection(db, 'classrooms'), where('inviteCode', '==', inviteCodeInput.trim().toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showToast("Invalid invite code", 'error');
        return;
      }

      const classDoc = querySnapshot.docs[0];
      const classData = classDoc.data() as Classroom;
      
      if (classData.memberIds.includes(user.uid)) {
        showToast("You are already a member of this group", 'info');
        return;
      }

      await updateDoc(doc(db, 'classrooms', classDoc.id), {
        memberIds: arrayUnion(user.uid)
      });
      setInviteCodeInput('');
      showToast("Successfully joined the group!", 'success');
    } catch (err) {
      console.error("Error joining classroom:", err);
      showToast("Failed to join group. Try again.", 'error');
    }
  };

  const handleSendJoinRequest = async (cls: Classroom) => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'join_requests'), 
        where('classroomId', '==', cls.id),
        where('requesterId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        showToast("Access request is already pending owner approval", 'info');
        return;
      }

      await addDoc(collection(db, 'join_requests'), {
        classroomId: cls.id,
        classroomName: cls.name,
        requesterId: user.uid,
        requesterName: profile?.displayName || user.displayName || 'Anonymous',
        requesterUsername: profile?.username || 'user',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      showToast("Join request sent to group owner! You will be added once approved.", 'success');
    } catch (err) {
      console.error("Error sending join request:", err);
      showToast("Could not send access request. Try again.", 'error');
    }
  };

  const handleAcceptRequest = async (req: JoinRequest) => {
    try {
      await updateDoc(doc(db, 'classrooms', req.classroomId), {
        memberIds: arrayUnion(req.requesterId)
      });
      await updateDoc(doc(db, 'join_requests', req.id), {
        status: 'accepted'
      });
      showToast(`Approved request from @${req.requesterUsername}!`, 'success');
    } catch (err) {
      console.error("Error accepting request:", err);
      showToast("Failed to accept request.", 'error');
    }
  };

  const handleAddFriendByUsername = async () => {
    if (!selectedClassroom || !friendUsernameInput.trim()) return;
    try {
      const q = query(collection(db, 'users'), where('username', '==', friendUsernameInput.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        showToast("User not found under that ID", 'error');
        return;
      }
      const friendId = snap.docs[0].id;
      await updateDoc(doc(db, 'classrooms', selectedClassroom.id), {
        memberIds: arrayUnion(friendId)
      });
      setFriendUsernameInput('');
      showToast("User successfully added to group!", 'success');
    } catch (err) {
      console.error("Error adding friend:", err);
      showToast("Could not add user to group.", 'error');
    }
  };

  const handleDeleteClassroom = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'classrooms', id));
      if (selectedClassroom?.id === id) setSelectedClassroom(null);
      setShowDeleteModal(null);
    } catch (err) {
      console.error("Error deleting classroom:", err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedClassroom) return;
    if (memberId === selectedClassroom.ownerId) {
      showToast("Cannot remove the classroom owner/creator", "error");
      return;
    }
    
    if (!window.confirm("Are you sure you want to remove this member from the classroom?")) {
      return;
    }

    try {
      await updateDoc(doc(db, 'classrooms', selectedClassroom.id), {
        memberIds: arrayRemove(memberId)
      });
      setSelectedClassroom(prev => {
        if (!prev) return null;
        return {
          ...prev,
          memberIds: prev.memberIds.filter(id => id !== memberId)
        };
      });
      showToast("Member successfully removed from the group!", "success");
    } catch (err) {
      console.error("Error removing member:", err);
      showToast("Could not remove member from the group.", "error");
    }
  };

  const copyInviteCode = () => {
    if (!selectedClassroom?.inviteCode) return;
    navigator.clipboard.writeText(selectedClassroom.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderModals = () => (
    <AnimatePresence>
      {showGroupDetails && selectedClassroom && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGroupDetails(false)}
            className="absolute inset-0 bg-[#0a0f1d]/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-sm h-full bg-[#0a0f1d] border-l border-white/10 shadow-2xl overflow-y-auto"
          >
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Group Details</h2>
                <button onClick={() => setShowGroupDetails(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Invite Code */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider font-bold text-zinc-500">Invite Code</p>
                <button 
                  onClick={copyInviteCode}
                  title="Copy Invite Code"
                  className="flex items-center justify-between w-full px-4 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all group"
                >
                  <span className="text-white font-mono tracking-widest">{selectedClassroom.inviteCode}</span>
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />}
                </button>
              </div>

              {/* Add User */}
              {selectedClassroom.ownerId === user?.uid && (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wider font-bold text-zinc-500">Add User</p>
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl focus-within:border-[#c5a059]/50 transition-all">
                    <input 
                      type="text"
                      placeholder="Username ID..."
                      value={friendUsernameInput}
                      onChange={(e) => setFriendUsernameInput(e.target.value)}
                      className="bg-transparent border-none text-sm px-3 py-2 w-full focus:outline-none text-white placeholder:text-zinc-500"
                    />
                    <button 
                      onClick={handleAddFriendByUsername}
                      className="w-10 h-10 bg-[#c5a059] text-black rounded-lg hover:bg-[#d4b16a] transition-all flex items-center justify-center shrink-0"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Members Panel */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white border-b border-white/10 pb-4">
                  <Users className="w-5 h-5 text-[#c5a059]" />
                  <h3 className="font-bold">Members ({selectedClassroom.memberIds.length})</h3>
                </div>
                <div className="space-y-4 pt-2">
                   {selectedClassroom.memberIds.map(id => {
                     const mProfile = userProfiles[id];
                     const displayName = id === user?.uid ? 'You' : (mProfile?.displayName || `User ${id.substring(0, 5)}`);
                     return (
                      <div 
                        key={id} 
                        onClick={() => setSelectedProfileId(id)}
                        className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {mProfile?.photoURL ? (
                            <img src={mProfile.photoURL} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-xs font-bold text-zinc-400">
                              {displayName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate group-hover:text-[#c5a059] transition-colors">
                            {displayName}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {id === selectedClassroom.ownerId ? 'Admin' : 'Member'}
                            {mProfile?.username && id !== user?.uid && <span className="text-zinc-550 font-normal"> • @{mProfile.username}</span>}
                          </p>
                        </div>
                        {((selectedClassroom.ownerId === user?.uid) || profile?.isAdmin) && id !== selectedClassroom.ownerId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveMember(id);
                            }}
                            className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all"
                            title="Remove Member"
                          >
                            <X className="w-4 h-5 animate-pulse" />
                          </button>
                        )}
                      </div>
                     );
                   })}
                </div>
              </div>

              {/* Delete Admin Action */}
              {selectedClassroom.ownerId === user?.uid && (
                <div className="pt-8 border-t border-white/10">
                  <button 
                    onClick={() => {
                      setShowGroupDetails(false);
                      setShowDeleteModal(selectedClassroom.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-4 text-red-400 bg-red-400/10 border border-red-400/20 hover:bg-red-400/20 rounded-xl text-sm font-bold transition-all"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Group
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(null)}
            className="absolute inset-0 bg-[#0a0f1d]/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative glass-panel w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 border border-red-500/30 bg-[#0a0f1d]"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-xl shadow-red-500/10">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete Group</h2>
              <p className="text-sm text-zinc-400">Are you sure you want to delete this group? This action cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteClassroom(showDeleteModal)}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateModal(false)}
            className="absolute inset-0 bg-[#0a0f1d]/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10 border border-white/10 bg-[#0a0f1d]"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Create Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative group w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-white/20 bg-white/5 hover:border-[#c5a059]/50 transition-all flex items-center justify-center">
                  {newClassIcon ? (
                    <img src={newClassIcon} alt="Group Icon" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-zinc-500 text-xs font-bold text-center px-2">Upload<br/>Icon</div>
                  )}
                  <label className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                    <span className="text-white text-xs font-bold">Change</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} disabled={isCreating} />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Group Name</label>
                <input 
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g., ISSB Prep 2026"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#c5a059] transition-all text-white placeholder:text-zinc-600 disabled:opacity-50"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Description</label>
                <textarea 
                  value={newClassBio}
                  onChange={(e) => setNewClassBio(e.target.value)}
                  placeholder="What is this group about?"
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[#c5a059] transition-all h-28 resize-none text-white placeholder:text-zinc-600"
                  disabled={isCreating}
                />
              </div>
              <div className="flex items-center justify-between p-4 sm:p-5 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="text-sm font-bold text-white mb-1">Public Group</p>
                  <p className="text-xs text-zinc-400">Anyone can find and request to join</p>
                </div>
                <button 
                  onClick={() => !isCreating && setIsPublic(!isPublic)}
                  disabled={isCreating}
                  className={cn(
                    "w-12 h-7 rounded-full transition-all relative p-1 shrink-0",
                    isPublic ? 'bg-[#c5a059]' : 'bg-zinc-700',
                    isCreating ? 'opacity-50 cursor-not-allowed' : ''
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 bg-white rounded-full transition-all shadow-md",
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  )} />
                </button>
              </div>
              <button 
                onClick={handleCreateClassroom}
                disabled={isCreating}
                className="w-full py-4 mt-4 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {isCreating ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (selectedClassroom) {
    return (
      <div className="fixed inset-0 top-20 md:left-72 z-20 bg-[#060a14] flex flex-col animate-in slide-in-from-bottom-5 duration-300">
        <div className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 min-h-0 h-full overflow-hidden">
          <div className="flex-1 min-h-0 relative">
            <DiscussionBoard 
              collectionPath={`classrooms/${selectedClassroom.id}/messages`} 
              title={`${selectedClassroom.name} Chat`}
              header={
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white/5 backdrop-blur-xl border-b border-white/10 p-4 md:p-6 shrink-0 relative z-10">
                  <div className="flex items-center gap-4 min-w-0">
                    <button 
                      onClick={() => setSelectedClassroom(null)}
                      className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group shrink-0"
                    >
                      <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden border border-white/10 shadow-lg shrink-0 bg-white/5 hidden sm:block">
                        <img src={selectedClassroom.iconUrl} alt={selectedClassroom.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h2 className="text-base md:text-xl font-bold tracking-tight text-white mb-1 line-clamp-1 leading-none">{selectedClassroom.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9px] md:text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 leading-none">
                            {selectedClassroom.memberIds.length} Members
                          </span>
                          <span className="text-[9px] md:text-[10px] uppercase font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20 leading-none flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_currentColor]" />
                            {onlineCount} Online
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button 
                      onClick={() => setShowGroupDetails(true)}
                      title="Group Settings"
                      className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all group shrink-0"
                    >
                      <Settings className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                      <span className="text-white hidden sm:block">Settings</span>
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        </div>
        {renderModals()}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">Study Groups</h1>
          <p className="text-zinc-400 text-xs md:text-sm">Collaborate and prepare together with fellow students.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
          <div className="flex items-center gap-2 bg-[#0a0f1d] border border-white/10 p-1 rounded-xl focus-within:border-[#c5a059]/50 transition-all flex-1 sm:flex-initial shadow-inner">
            <input 
              type="text"
              placeholder="Enter Code..."
              value={inviteCodeInput}
              onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
              className="bg-transparent border-none text-xs md:text-sm px-2 py-1.5 w-full sm:w-32 focus:outline-none text-white placeholder:text-zinc-500 font-mono uppercase tracking-widest"
            />
            <button 
              onClick={handleJoinByCode}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs md:text-sm font-bold transition-all shrink-0"
            >
              Join
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#c5a059] text-black rounded-xl text-xs md:text-sm font-bold hover:bg-[#d4b16a] transition-all shadow-lg justify-center shrink-0"
          >
            <Plus className="w-4 h-4" /> Create Group
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 border-b border-white/10 pb-px overflow-x-auto hide-scrollbar">
        {[
          { id: 'my', label: 'My Groups', icon: Users },
          { id: 'discover', label: 'Discover', icon: Search },
          { id: 'requests', label: 'Requests', icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-2 py-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? 'border-[#c5a059] text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? 'text-[#c5a059]' : 'text-zinc-500')} />
            {tab.label}
            {tab.id === 'requests' && joinRequests.filter(r => classrooms.some(c => c.id === r.classroomId && c.ownerId === user?.uid)).length > 0 && (
              <span className="bg-[#c5a059] text-black text-[10px] px-2 py-0.5 rounded-full font-black ml-1">
                {joinRequests.filter(r => classrooms.some(c => c.id === r.classroomId && c.ownerId === user?.uid)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="w-full">
        <div className="w-full">
          {activeTab === 'my' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-[#c5a059]" />
                </div>
              ) : classrooms.length === 0 ? (
                <div className="col-span-full glass-panel border border-dashed border-white/10 rounded-2xl py-16 text-center space-y-3">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto border border-white/10">
                    <Users className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">No Active Groups</h3>
                    <p className="text-xs text-zinc-400">Create a new group or join one using a code</p>
                  </div>
                </div>
              ) : (
                classrooms.map(cls => (
                  <motion.button
                    key={cls.id}
                    whileHover={{ y: -2 }}
                    onClick={() => setSelectedClassroom(cls)}
                    className="glass-panel border border-white/10 p-4 lg:p-5 flex flex-col rounded-2xl lg:rounded-3xl text-left hover:border-[#c5a059]/50 transition-all group overflow-hidden bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-[#c5a059]/30 transition-all shrink-0">
                        <img src={cls.iconUrl} alt={cls.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex -space-x-2">
                        {cls.memberIds.slice(0, 3).map(id => {
                          const mProfile = userProfiles[id];
                          return mProfile?.photoURL ? (
                            <img 
                              key={id} 
                              src={mProfile.photoURL} 
                              alt={mProfile.displayName || 'Member'} 
                              className="w-6 h-6 rounded-full border-2 border-[#0a0f1d] object-cover shadow-md shrink-0" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div 
                              key={id} 
                              className="w-6 h-6 rounded-full border-2 border-[#0a0f1d] bg-zinc-800 shadow-md flex items-center justify-center text-[8px] font-black text-zinc-400 shadow-md uppercase shrink-0"
                            >
                              {(mProfile?.displayName || 'U').substring(0, 1)}
                            </div>
                          );
                        })}
                        {cls.memberIds.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-[#0a0f1d] bg-white/10 flex items-center justify-center text-[8px] font-bold text-zinc-300 shrink-0">
                            +{cls.memberIds.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#c5a059] transition-colors line-clamp-1 mb-1">{cls.name}</h3>
                    <p className="text-xs text-zinc-400 mt-auto">
                       {cls.memberIds.length} Members • {cls.ownerId === user?.uid ? 'Admin' : 'Member'}
                    </p>
                  </motion.button>
                ))
              )}
            </div>
          )}

          {activeTab === 'discover' && (
            <div className="space-y-4 lg:space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-zinc-500" />
                </div>
                <input 
                  type="text"
                  placeholder="Search groups by name or description..."
                  value={classSearchQuery}
                  onChange={(e) => setClassSearchQuery(e.target.value)}
                  className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-xs md:text-sm focus:outline-none focus:border-[#c5a059] transition-all text-white placeholder:text-zinc-600 shadow-lg"
                />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicClassrooms
                  .filter(c => !c.memberIds.includes(user?.uid || ''))
                  .filter(c => !classSearchQuery || c.name.toLowerCase().includes(classSearchQuery.toLowerCase()) || c.bio?.toLowerCase().includes(classSearchQuery.toLowerCase()))
                  .length === 0 ? (
                  <div className="col-span-full glass-panel border border-dashed border-white/10 rounded-2xl py-16 text-center space-y-3">
                    <Search className="w-8 h-8 md:w-12 md:h-12 text-zinc-500 mx-auto" />
                    <p className="text-xs md:text-sm text-zinc-400">
                      {classSearchQuery ? "No groups match your search." : "No public groups found to join."}
                    </p>
                  </div>
                ) : (
                  publicClassrooms
                    .filter(c => !c.memberIds.includes(user?.uid || ''))
                    .filter(c => !classSearchQuery || c.name.toLowerCase().includes(classSearchQuery.toLowerCase()) || c.bio?.toLowerCase().includes(classSearchQuery.toLowerCase()))
                    .map(cls => (
                    <div key={cls.id} className="glass-panel border border-white/10 p-4 rounded-2xl space-y-4 shadow-xl hover:border-[#c5a059]/30 transition-all group bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shrink-0">
                          <img src={cls.iconUrl} alt={cls.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate mb-1">{cls.name}</h3>
                          <p className="text-xs text-blue-400 font-medium">{cls.memberIds.length} Members</p>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2">{cls.bio || 'No description available.'}</p>
                      <button 
                        onClick={() => handleSendJoinRequest(cls)}
                        className="w-full py-3 bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20 rounded-xl text-sm font-bold hover:bg-[#c5a059]/20 transition-all flex items-center justify-center gap-2"
                      >
                        Request Access <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-4">
              {joinRequests.filter(r => classrooms.some(c => c.id === r.classroomId && c.ownerId === user?.uid)).length === 0 ? (
                <div className="glass-panel border border-dashed border-white/10 rounded-2xl py-16 text-center">
                  <p className="text-xs md:text-sm text-zinc-400">No pending requests</p>
                </div>
              ) : (
                joinRequests.filter(r => classrooms.some(c => c.id === r.classroomId && c.ownerId === user?.uid)).map(req => {
                  const reqProfile = userProfiles[req.requesterId];
                  return (
                    <div key={req.id} className="glass-panel border border-white/10 p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl bg-white/[0.02]">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
                          {reqProfile?.photoURL ? (
                            <img src={reqProfile.photoURL} alt={req.requesterName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-white font-bold text-base md:text-lg">
                              {req.requesterName.substring(0, 1)}
                            </span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm md:text-base mb-0.5">{req.requesterName} <span className="text-zinc-500 font-normal text-xs md:text-sm block sm:inline">(@{req.requesterUsername})</span></h4>
                          <p className="text-xs text-zinc-400">Wants to join <b className="text-[#c5a059]">{req.classroomName}</b></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 md:gap-3">
                        <button 
                          onClick={() => handleAcceptRequest(req)}
                          className="flex-1 sm:flex-none px-4 md:px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs md:text-sm font-bold transition-all"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={async () => await deleteDoc(doc(db, 'join_requests', req.id))}
                          className="flex-1 sm:flex-none px-6 py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-zinc-400 border border-white/10 rounded-xl text-sm font-bold transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
      {renderModals()}
      <PublicProfileModal 
        userId={selectedProfileId}
        isOpen={!!selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
      />

      {/* Dynamic Toast System */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[999] max-w-sm w-full bg-[#0d1527]/95 border border-white/10 rounded-2xl shadow-2xl p-4 flex items-start gap-3 backdrop-blur-md"
          >
            <div className={cn(
              "p-2 rounded-xl shrink-0 border",
              notification.type === 'success' && "bg-green-500/10 text-green-400 border-green-500/20",
              notification.type === 'error' && "bg-red-500/10 text-red-400 border-red-500/20",
              notification.type === 'info' && "bg-[#c5a059]/10 text-[#c5a059] border-[#c5a059]/20"
            )}>
              {notification.type === 'success' && <CheckIcon className="w-5 h-5" />}
              {notification.type === 'error' && <AlertTriangle className="w-5 h-5" />}
              {notification.type === 'info' && <Info className="w-5 h-5" />}
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                {notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Notification' : 'Information'}
              </h4>
              <p className="text-xs text-zinc-200 mt-1 font-semibold leading-relaxed">
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => setNotification(null)}
              className="p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Key = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.4Z"/><path d="m15.5 7.5-3 3"/><path d="m13.5 15 2.5 2.5"/><path d="m9.5 11-4.5 4.5v2.5h2.5l4.5-4.5"/><path d="m11.5 13 2.5 2.5"/>
  </svg>
);
