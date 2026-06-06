import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Calendar, Clock, User, Link as LinkIcon, Send, Loader2, CheckCircle2, X, ChevronDown, Search } from 'lucide-react';
import { format, isAfter } from 'date-fns';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

const TEST_CATEGORIES = [
  "PMA Long Course",
  "GD(Pilot)",
  "AFNS",
  "ASF",
  "MDCAT",
  "ECAT",
  "General Knowledge",
  "Intelligence (Verbal)",
  "Intelligence (Non-Verbal)",
  "Physics",
  "Chemistry",
  "Biology",
  "Maths",
  "Computer",
  "English",
  "Urdu Grammar",
  "Islamic Studies",
  "Pakistan Studies",
  "Physics Class 9",
  "Physics Class 10",
  "Physics Class 11",
  "Physics Class 12",
  "Chemistry Class 9",
  "Chemistry Class 10",
  "Chemistry Class 11",
  "Chemistry Class 12",
  "Biology Class 9",
  "Biology Class 10",
  "Biology Class 11",
  "Biology Class 12",
  "Maths Class 9",
  "Maths Class 10",
  "Maths Class 11",
  "Maths Class 12",
  "Computer Class 9",
  "Computer Class 10",
  "Computer Class 11",
  "Computer Class 12"
];

export const LiveClassesView: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Voting State
  const [selectedTopic, setSelectedTopic] = useState(TEST_CATEGORIES[0]);
  const [requestDescription, setRequestDescription] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [classesSearchQuery, setClassesSearchQuery] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const liveClassesSnapshot = await getDocs(query(collection(db, 'live_classes'), orderBy('start_time', 'asc')));
      const clsData = liveClassesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setClasses(clsData);
    } catch (error) {
      console.error('Failed to fetch live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDescription) return;

    setSubmittingRequest(true);
    try {
      await addDoc(collection(db, 'class_requests'), {
        topic: selectedTopic,
        description: requestDescription,
        uid: user?.uid || 'guest',
        email: user?.email || 'guest@example.com',
        username: user?.displayName || 'Guest Student',
        status: 'pending',
        created_at: serverTimestamp()
      });
      setRequestSuccess(true);
      setRequestDescription('');
      setTimeout(() => setRequestSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to submit class request:', error);
    } finally {
      setSubmittingRequest(false);
    }
  };

  const filteredClasses = classes.filter(c => {
    const topicMatches = c.topic?.toLowerCase().includes(classesSearchQuery.toLowerCase());
    const teacherMatches = c.teacher_name?.toLowerCase().includes(classesSearchQuery.toLowerCase());
    const descMatches = c.description?.toLowerCase().includes(classesSearchQuery.toLowerCase());
    return topicMatches || teacherMatches || descMatches;
  });

  const upcomingClasses = filteredClasses.filter(c => isAfter(new Date(c.end_time), new Date()));
  const pastClasses = filteredClasses.filter(c => !isAfter(new Date(c.end_time), new Date()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
         <div className="flex items-center gap-4 relative z-10">
           <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
             <Video className="w-8 h-8 text-green-500" />
           </div>
           <div>
             <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">Live Classes</h1>
           </div>
         </div>
         <button 
           onClick={() => setShowRequestModal(true)}
           className="px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 transition-all shadow-lg relative z-10"
         >
           <Send className="w-4 h-4" /> Request a Class
         </button>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-green-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search scheduled classes by category or teacher..."
          value={classesSearchQuery}
          onChange={(e) => setClassesSearchQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all text-sm font-medium shadow-inner"
        />
        {classesSearchQuery && (
          <button 
            onClick={() => setClassesSearchQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-8">
        <div className="space-y-8">
          <div className="space-y-4">
             <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               Upcoming Sessions
             </h2>
             {loading ? (
               <div className="flex items-center justify-center h-32">
                 <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
               </div>
             ) : upcomingClasses.length === 0 ? (
               <div className="glass-panel py-6 px-4 text-center rounded-[1.5rem] border border-white/5 border-dashed">
                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{classesSearchQuery ? "No matching classes found" : "No upcoming classes scheduled"}</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {upcomingClasses.map(cls => (
                   <div key={cls.id} className="glass-panel p-6 border-2 border-green-500/20 rounded-[2rem] bg-gradient-to-br from-green-500/5 to-transparent relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                       <div>
                         <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-green-400 transition-colors">{cls.topic}</h3>
                         <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-zinc-500" /> {cls.teacher_name}</span>
                           <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-zinc-500" /> {format(new Date(cls.start_time), 'MMM dd, yyyy')}</span>
                           <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-zinc-500" /> {format(new Date(cls.start_time), 'hh:mm a')} - {format(new Date(cls.end_time), 'hh:mm a')}</span>
                         </div>
                         {cls.description && <p className="text-sm text-zinc-400 mt-4 leading-relaxed font-medium">{cls.description}</p>}
                       </div>
                       <a 
                         href={cls.zoom_link} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="px-6 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 shrink-0"
                       >
                         <LinkIcon className="w-4 h-4" /> Join Class
                       </a>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>

          {pastClasses.length > 0 && (
            <div className="space-y-4 pt-8 border-t border-white/10">
               <h2 className="text-xl font-bold text-white uppercase tracking-tight opacity-50">Past Sessions</h2>
               <div className="space-y-4 opacity-75">
                 {pastClasses.map(cls => (
                   <div key={cls.id} className="glass-panel p-6 border-l-2 border-white/10 rounded-2xl bg-white/5">
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                       <div>
                         <h3 className="text-sm font-bold text-white uppercase mb-1">{cls.topic}</h3>
                         <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                           <span className="flex items-center gap-1"><User className="w-3 h-3" /> {cls.teacher_name}</span>
                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(cls.start_time), 'MMM dd, yyyy')}</span>
                         </div>
                       </div>
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-3 py-1 bg-white/5 rounded-lg border border-white/5">Ended</span>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg glass-panel border border-white/10 rounded-[2rem] p-6 lg:p-8 bg-[#0a0f1d]/90 shadow-2xl"
            >
              <button 
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400 mb-6">
                 <Send className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6">Request a Class</h3>
              
              {requestSuccess ? (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  Request submitted successfully!
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-5">
                  <div className="relative z-20">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Select Category</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors text-sm font-bold flex items-center justify-between"
                      >
                        {selectedTopic}
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      </button>
                      
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#0a0f1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col"
                          >
                            <div className="p-3 border-b border-white/10 sticky top-0 bg-[#0a0f1d] z-10 flex items-center gap-2 text-zinc-400">
                              <Search className="w-4 h-4 shrink-0" />
                              <input 
                                type="text"
                                placeholder="Search subject or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-zinc-600"
                                autoFocus
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                              {TEST_CATEGORIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <div className="p-4 text-center text-xs text-zinc-500">No categories found</div>
                              ) : (
                                TEST_CATEGORIES.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase())).map(cat => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setSelectedTopic(cat);
                                      setIsDropdownOpen(false);
                                      setSearchQuery('');
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedTopic === cat ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-300 hover:bg-white/5 hover:text-white'}`}
                                  >
                                    {cat}
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Specific Requirements</label>
                    <textarea 
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      required
                      rows={4}
                      placeholder="E.g., I need help understanding non-verbal series questions..."
                      className="w-full bg-[#0a0f1d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors text-sm custom-scrollbar resize-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={submittingRequest || !requestDescription}
                    className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20 text-xs mt-2"
                  >
                    {submittingRequest ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Vote"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
