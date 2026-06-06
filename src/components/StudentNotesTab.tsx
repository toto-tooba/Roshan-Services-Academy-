import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  BookOpen, 
  ExternalLink, 
  Trash2, 
  X, 
  Users, 
  ChevronRight, 
  ChevronDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Award,
  BookMarked
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { PublicProfileModal } from './PublicProfileModal';
import { formatDistanceToNow } from 'date-fns';

interface StudentNote {
  id: string;
  title: string;
  pdfUrl: string;
  category: string;
  uploadedBy: string;
  uploaderName: string;
  uploaderPhoto?: string;
  uploaderRole?: string;
  createdAt: any;
  createdAtDate: Date;
}

const CATEGORIES = [
  "GD (Pilot)",
  "PMA long course",
  "PN CADET",
  "AFNS",
  "ASF",
  "Airmen",
  "Sailor",
  "Pak Army Soldier",
  "Punjab Police",
  "Rangers",
  "LAT",
  "MDCAT",
  "E-CAT"
];

export const StudentNotesTab: React.FC = () => {
  const { user, profile } = useAuth();
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isContributorDropdownOpen, setIsContributorDropdownOpen] = useState(false);
  const [contributorSearchQuery, setContributorSearchQuery] = useState('');
  const [uploaderFilter, setUploaderFilter] = useState<string | null>(null);
  
  // Upload modal & form states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadPdfUrl, setUploadPdfUrl] = useState('');
  const [uploadCategory, setUploadCategory] = useState(CATEGORIES[0]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingState, setUploadingState] = useState(false);

  // Profile modal state
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all student notes
    const q = query(collection(db, 'student_notes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          title: data.title || '',
          pdfUrl: data.pdfUrl || '',
          category: data.category || '',
          uploadedBy: data.uploadedBy || '',
          uploaderName: data.uploaderName || 'Anonymous',
          uploaderPhoto: data.uploaderPhoto || '',
          uploaderRole: data.uploaderRole || 'student',
          createdAt: data.createdAt,
          createdAtDate: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt ? new Date(data.createdAt) : new Date(0))
        } as StudentNote;
      });
      
      // Sort newest first
      notesList.sort((a, b) => b.createdAtDate.getTime() - a.createdAtDate.getTime());
      setNotes(notesList);
      setLoading(false);
    }, (error) => {
      console.error('Error loading student notes:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!uploadTitle.trim() || !uploadPdfUrl.trim()) {
      setUploadError('Please fill in all fields.');
      return;
    }

    // Basic URL validation
    let formattedUrl = uploadPdfUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setUploadError('Please provide a valid URL for the file/pdf (e.g. drive.google.com/file/... or dropbox.com/...)');
      return;
    }

    setUploadingState(true);
    setUploadError(null);

    try {
      await addDoc(collection(db, 'student_notes'), {
        title: uploadTitle.trim(),
        pdfUrl: formattedUrl,
        category: uploadCategory,
        uploadedBy: user.uid,
        uploaderName: profile?.displayName || user.displayName || 'Anonymous',
        uploaderPhoto: profile?.photoURL || user.photoURL || '',
        uploaderRole: profile?.isAdmin ? 'admin' : 'student',
        createdAt: serverTimestamp()
      });

      setUploadTitle('');
      setUploadPdfUrl('');
      setIsUploading(false);
    } catch (err: any) {
      console.error('Error uploading note:', err);
      setUploadError(err.message || 'Failed to upload note.');
    } finally {
      setUploadingState(false);
    }
  };

  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDeleteNote = async () => {
    if (!noteToDeleteId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteDoc(doc(db, 'student_notes', noteToDeleteId));
      setNoteToDeleteId(null);
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setDeleteError(err.message || 'Failed to delete note. You might not have permission.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Extract unique contributors for user filter
  const uploaders = useMemo(() => {
    const list = new Map<string, { uid: string; name: string; photo: string }>();
    notes.forEach(n => {
      if (!list.has(n.uploadedBy)) {
        list.set(n.uploadedBy, { uid: n.uploadedBy, name: n.uploaderName, photo: n.uploaderPhoto || '' });
      }
    });
    return Array.from(list.values());
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.uploaderName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'All' || note.category === selectedCategory;
      const matchUploader = uploaderFilter === null || note.uploadedBy === uploaderFilter;
      return matchSearch && matchCategory && matchUploader;
    });
  }, [notes, searchQuery, selectedCategory, uploaderFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner & Greeting */}
      <div className="relative overflow-hidden p-8 lg:p-12 rounded-[3rem] bg-gradient-to-br from-[#121932] to-[#040814] border border-white/10 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-12 opacity-15">
          <Users className="w-56 h-56 text-[#c5a059] animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-3xl text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#c5a059]/10 rounded-full border border-[#c5a059]/20 text-xs font-black text-[#c5a059] uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> Academy Contributed Repository
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Student <span className="text-[#c5a059]">Notes</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
              Explore and share notes contributed by fellow cadets and administrators.
            </p>
          </motion.div>

          {/* Search bar & Action Button */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-[#c5a059] transition-colors" />
              <input
                type="text"
                placeholder="Search notes by title or uploader name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50 focus:border-[#c5a059] transition-all text-sm font-medium shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsUploading(!isUploading)}
              className="px-6 py-4 bg-[#c5a059] hover:bg-[#d4b16a] text-black font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-[#c5a059]/20 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" /> Contribute Study Material
            </button>
          </div>
        </div>
      </div>

      {/* Upload Form Box */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="p-6 md:p-8 glass-panel border border-[#c5a059]/30 rounded-[2.5rem] bg-[#c5a059]/5 overflow-hidden text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#c5a059]/10 rounded-xl flex items-center justify-center border border-[#c5a059]/20">
                  <Upload className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight text-lg">Contribute Notes Link</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Provide a PDF, Drive, or Dropbox URL</p>
                </div>
              </div>
              <button 
                onClick={() => setIsUploading(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadNote} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Category Channel</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059] transition-colors appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Document Title</label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. PMA English MCQs & Grammar Notes"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059] transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">PDF Link or File URL</label>
                  <input
                    type="text"
                    value={uploadPdfUrl}
                    onChange={(e) => setUploadPdfUrl(e.target.value)}
                    placeholder="e.g. google.drive.com/file/... or dropbox.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#c5a059] transition-colors"
                    required
                  />
                </div>
              </div>

              {uploadError && (
                <p className="text-red-400 text-xs font-semibold">{uploadError}</p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 text-zinc-300 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingState}
                  className="px-6 py-2.5 bg-[#c5a059] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-50"
                >
                  {uploadingState ? 'Uploading...' : 'Submit Material'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Section (Categories & Contributors Side-by-Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left mb-8">
          
          {/* Category Filter panel */}
          <div className="p-6 glass-panel border border-white/10 rounded-[2rem] bg-white/[0.01]">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#c5a059]" /> Filter Category
            </h3>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all select-none cursor-pointer"
              >
                <span className="truncate">
                  {selectedCategory === 'All' 
                    ? `ALL CATEGORIES (${notes.length})` 
                    : `${selectedCategory.toUpperCase()} (${notes.filter(n => n.category === selectedCategory).length})`}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#c5a059] transition-transform duration-200 shrink-0 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoryDropdownOpen && (
                  <>
                    {/* Click outside backdrop */}
                    <div 
                      className="fixed inset-0 z-30 pointer-events-auto"
                      onClick={() => setIsCategoryDropdownOpen(false)}
                    />
                    
                    {/* Dropdown Options */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-2 p-2 bg-[#0d1527] border border-white/10 rounded-2xl shadow-2xl z-40 max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-1 text-left"
                    >
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          selectedCategory === 'All' 
                            ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/10' 
                            : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        All Categories ({notes.length})
                      </button>
                      
                      {CATEGORIES.map(cat => {
                        const count = notes.filter(n => n.category === cat).length;
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              setSelectedCategory(cat);
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer ${
                              selectedCategory === cat 
                                ? 'bg-[#c5a059] text-black' 
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <span className="truncate mr-2">{cat}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === cat ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-500'}`}>{count}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Contributors list panel */}
          <div className="p-6 glass-panel border border-white/10 rounded-[2rem] bg-white/[0.01]">
            <h3 className="text-xs font-black text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#c5a059]" /> Filter Contributor
            </h3>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsContributorDropdownOpen(!isContributorDropdownOpen);
                  setContributorSearchQuery('');
                }}
                className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black text-white uppercase tracking-wider transition-all select-none cursor-pointer"
              >
                <span className="truncate">
                  {uploaderFilter === null 
                    ? 'ALL CONTRIBUTORS' 
                    : (uploaders.find(up => up.uid === uploaderFilter)?.name.toUpperCase() || 'ALL CONTRIBUTORS')}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#c5a059] transition-transform duration-200 shrink-0 ${isContributorDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isContributorDropdownOpen && (
                  <>
                    {/* Click outside backdrop */}
                    <div 
                      className="fixed inset-0 z-30 pointer-events-auto"
                      onClick={() => {
                        setIsContributorDropdownOpen(false);
                        setContributorSearchQuery('');
                      }}
                    />
                    
                    {/* Dropdown Options */}
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 right-0 mt-2 p-2 bg-[#0d1527] border border-white/10 rounded-2xl shadow-2xl z-40 flex flex-col gap-1 text-left"
                    >
                      {/* Search Bar inside Dropdown */}
                      <div className="relative p-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                        <input
                          type="text"
                          value={contributorSearchQuery}
                          onChange={(e) => setContributorSearchQuery(e.target.value)}
                          placeholder="Search contributor..."
                          onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
                          className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]/50 transition-all font-bold"
                        />
                      </div>

                      <div className="max-h-[200px] overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-1 mt-1">
                        {/* Option: All Contributors */}
                        {('all contributors'.includes(contributorSearchQuery.toLowerCase())) && (
                          <button
                            onClick={() => {
                              setUploaderFilter(null);
                              setIsContributorDropdownOpen(false);
                              setContributorSearchQuery('');
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              uploaderFilter === null 
                                ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/10' 
                                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            All Contributors ({notes.length})
                          </button>
                        )}

                        {/* Filtered contributor list */}
                        {uploaders
                          .filter(up => up.name.toLowerCase().includes(contributorSearchQuery.toLowerCase()))
                          .map(up => {
                            const count = notes.filter(n => n.uploadedBy === up.uid).length;
                            return (
                              <button
                                key={up.uid}
                                onClick={() => {
                                  setUploaderFilter(up.uid);
                                  setIsContributorDropdownOpen(false);
                                  setContributorSearchQuery('');
                                }}
                                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer ${
                                  uploaderFilter === up.uid 
                                    ? 'bg-[#c5a059] text-black font-black' 
                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                }`}
                              >
                                {up.photo ? (
                                  <img src={up.photo} alt={up.name} className="w-5 h-5 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                                ) : (
                                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${uploaderFilter === up.uid ? 'bg-black/20 text-black' : 'bg-zinc-800 text-[#c5a059]'}`}>
                                    {up.name.charAt(0)}
                                  </div>
                                )}
                                <span className="truncate flex-1 font-bold">{up.name}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${uploaderFilter === up.uid ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-500'}`}>{count}</span>
                              </button>
                            );
                          })}

                        {uploaders.filter(up => up.name.toLowerCase().includes(contributorSearchQuery.toLowerCase())).length === 0 && 
                         !('all contributors'.includes(contributorSearchQuery.toLowerCase())) && (
                          <p className="text-zinc-650 text-[10px] p-4 text-center">No contributors found</p>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

      </div>

      {/* Grid of Notes */}
      <div className="space-y-6">
          
          {/* Active filter statuses */}
          {(selectedCategory !== 'All' || uploaderFilter !== null) && (
            <div className="flex flex-wrap items-center gap-2 bg-white/5 border border-white/10 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mr-2">Active filters:</span>
              
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All')} className="text-zinc-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {uploaderFilter !== null && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold">
                  Contributor: {uploaders.find(u => u.uid === uploaderFilter)?.name || 'User'}
                  <button onClick={() => setUploaderFilter(null)} className="text-zinc-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button 
                onClick={() => { setSelectedCategory('All'); setUploaderFilter(null); }}
                className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest hover:underline ml-auto"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Results Info Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel border border-white/10 rounded-[2rem] p-6 lg:p-8 flex flex-col items-start shadow-xl text-left hover:border-[#c5a059]/40 transition-all group bg-white/5 relative"
              >
                {/* Ribbon Tag of the Category */}
                <div className="py-1 px-3 bg-white/5 border border-white/10 text-[8px] font-black text-zinc-400 rounded-lg uppercase tracking-widest mb-4">
                  {note.category}
                </div>

                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-2xl mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-black text-white tracking-tight text-lg mb-4 uppercase line-clamp-2 w-full">
                  {note.title}
                </h3>

                {/* Contributor badge row */}
                <div 
                  onClick={() => setViewingProfileId(note.uploadedBy)}
                  className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl border border-white/5 cursor-pointer hover:border-[#c5a059]/30 transition-all w-full mb-6"
                  title="Click to view Cadet Profile"
                >
                  {note.uploaderPhoto ? (
                    <img src={note.uploaderPhoto} alt={note.uploaderName} className="w-8 h-8 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-[#c5a059] border border-white/5 shrink-0">
                      {note.uploaderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate hover:underline">{note.uploaderName}</p>
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      {note.uploaderRole || 'Student'} • {note.createdAt ? formatDistanceToNow(note.createdAtDate, { addSuffix: true }).replace('about ', '') : 'Just now'}
                    </p>
                  </div>
                  
                  {(user?.uid === note.uploadedBy || profile?.isAdmin) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDeleteId(note.id);
                        setDeleteError(null);
                      }}
                      className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-all shrink-0"
                      title="Delete Study Material"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                
                <div className="mt-auto w-full pt-4 border-t border-white/5 flex gap-2">
                  <a 
                    href={note.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#c5a059] text-black font-black text-[10px] uppercase tracking-widest hover:bg-[#d4b16a] transition-all flex items-center justify-center gap-1.5 shadow-lg hover:shadow-[#c5a059]/20 rounded-xl"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Open File/PDF <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </motion.div>
            ))}

            {filteredNotes.length === 0 && !loading && (
              <div className="col-span-full text-center py-20 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-700 w-full">
                <BookMarked className="w-16 h-16 mx-auto mb-4 opacity-10 text-zinc-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                  No contributed notes found matching these filters.
                </p>
              </div>
            )}

            {loading && (
              <div className="col-span-full text-center py-20 text-zinc-500">
                <p className="animate-pulse text-xs font-black uppercase tracking-widest">Loading cadet notes library...</p>
              </div>
            )}
          </div>
        </div>

      {/* Profile Detail Popover */}
      <PublicProfileModal 
        userId={viewingProfileId}
        isOpen={viewingProfileId !== null}
        onClose={() => setViewingProfileId(null)}
      />

      {/* Custom Confirmation Modal for Safe Deletion in Iframes */}
      {noteToDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#0a0f1d]/80 backdrop-blur-md"
            onClick={() => {
              if (!isDeleting) {
                setNoteToDeleteId(null);
                setDeleteError(null);
              }
            }}
          />
          <div className="relative bg-[#0d1527] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">
              Delete Study Material?
            </h3>
            <p className="text-xs text-zinc-400 mb-6 font-medium leading-relaxed">
              Are you sure you want to delete this study note? This will permanently remove the record from public library.
            </p>

            {deleteError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-sans">
                {deleteError}
              </div>
            )}

            <div className="flex gap-4">
              <button
                disabled={isDeleting}
                onClick={() => {
                  setNoteToDeleteId(null);
                  setDeleteError(null);
                }}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDeleteNote}
                className="flex-1 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
