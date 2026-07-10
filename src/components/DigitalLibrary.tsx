import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FileText, ExternalLink, BookOpen, X, Layers, ArrowLeft } from 'lucide-react';
import { LIBRARY_DATA, STATIC_PDF_NOTES } from '../data/libraryData';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface LibraryItem {
  title: string;
  url: string;
  division: 'Related Books & Notes' | 'PDF Notes' | 'Student Notes';
}

export const DigitalLibrary: React.FC = () => {
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [viewerMode, setViewerMode] = useState<'google' | 'native'>('google');

  useEffect(() => {
    if (selectedPdfUrl) {
      const lowerUrl = selectedPdfUrl.toLowerCase();
      if (
        lowerUrl.includes('supabase.co') || 
        lowerUrl.includes('drive.google.com') ||
        lowerUrl.includes('book') || 
        lowerUrl.includes('guide') || 
        lowerUrl.includes('preparation') ||
        lowerUrl.includes('paper')
      ) {
        setViewerMode('native');
      } else {
        setViewerMode('google');
      }
    }
  }, [selectedPdfUrl]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('All');
  const [studentNotes, setStudentNotes] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for student contributed notes
  useEffect(() => {
    const q = collection(db, 'student_notes');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          title: data.title || 'Untitled Notes',
          url: data.pdfUrl || '',
          division: 'Student Notes' as const
        };
      }).filter(item => !!item.url);
      setStudentNotes(docs);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching student notes in library:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const combinedLibrary = useMemo(() => {
    // 1. Static Related Books & Notes
    const books = LIBRARY_DATA.map(item => ({
      title: item.title,
      url: item.url,
      division: 'Related Books & Notes' as const
    }));

    // 2. Static PDF Notes
    const pdfNotes = STATIC_PDF_NOTES.map(item => ({
      title: item.title,
      url: item.url,
      division: 'PDF Notes' as const
    }));

    const allItems = [...pdfNotes, ...books, ...studentNotes];

    // Deduplicate by normalized URL to keep the repository pristinely neat
    const seenUrls = new Set<string>();
    const uniqueItems: LibraryItem[] = [];

    for (const item of allItems) {
      const normalizedUrl = item.url.trim().toLowerCase();
      if (!normalizedUrl) continue;
      if (!seenUrls.has(normalizedUrl)) {
        seenUrls.add(normalizedUrl);
        uniqueItems.push(item);
      }
    }

    // Sort alphabetically by title
    return uniqueItems.sort((a, b) => a.title.localeCompare(b.title));
  }, [studentNotes]);

  const divisions = ['All', 'PDF Notes', 'Related Books & Notes', 'Student Notes'];

  const filteredItems = useMemo(() => {
    return combinedLibrary.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.division.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDivision = selectedDivision === 'All' || item.division === selectedDivision;
      return matchesSearch && matchesDivision;
    });
  }, [combinedLibrary, searchQuery, selectedDivision]);

  if (selectedPdfUrl) {
    const fileName = (() => {
      try {
        const decoded = decodeURIComponent(selectedPdfUrl);
        const parts = decoded.split('/');
        const lastPart = parts[parts.length - 1];
        const cleanName = lastPart.split('?')[0];
        if (cleanName && cleanName.toLowerCase().endsWith('.pdf')) {
          return cleanName;
        }
      } catch (e) {
        // Fallback
      }
      return "Official Academy Study Material";
    })();

    return (
      <div className="flex flex-col h-[calc(100vh-80px)] -mx-4 -mb-12 md:-mx-10 overflow-hidden bg-[#0a0f1d] absolute inset-0 z-50">
        {/* Header bar */}
        <div className="h-20 bg-[#0a0f1d] border-b border-white/5 px-4 md:px-8 flex items-center justify-between shrink-0 gap-3 top-0 sticky z-50">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              onClick={() => setSelectedPdfUrl(null)}
              className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all group shrink-0"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs md:text-sm font-black text-[#c5a059] uppercase tracking-wider truncate">Roshan Services Academy</h2>
              <p className="text-xs text-white/50 font-mono truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-xl" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>

          {/* Compact / Responsive segmented control for viewer type selection */}
          <div className="flex items-center gap-1 bg-white/5 p-0.5 md:p-1 rounded-xl border border-white/10 text-[9px] md:text-[10px] uppercase font-black tracking-wider shrink-0">
            <button
              onClick={() => setViewerMode('google')}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all duration-200 ${
                viewerMode === 'google'
                  ? 'bg-[#c5a059] text-[#0a0f1d]'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Best for quick rendering on all devices"
            >
              <span className="hidden sm:inline">🌐 Google Reader</span>
              <span className="inline sm:hidden">🌐 Google</span>
            </button>
            <button
              onClick={() => setViewerMode('native')}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg transition-all duration-200 ${
                viewerMode === 'native'
                  ? 'bg-[#c5a059] text-[#0a0f1d]'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Best for large books and syllabus PDFs (>25MB)"
            >
              <span className="hidden sm:inline">⚡ Native Viewer (Large Files)</span>
              <span className="inline sm:hidden">⚡ Native</span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a 
              href={selectedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[#c5a059] hover:bg-[#b5914f] text-[#0a0f1d] rounded-xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#c5a059]/10"
            >
              <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Open PDF in New Tab</span><span className="inline sm:hidden">Open</span>
            </a>
            
            <button 
              onClick={() => setSelectedPdfUrl(null)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white text-zinc-400 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <X className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* PDF Document Container */}
        <div className="flex-1 w-full bg-zinc-950 overflow-hidden relative min-h-[500px]">
          {viewerMode === 'google' ? (
            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedPdfUrl)}&embedded=true`}
              className="w-full h-full border-none absolute inset-0 bg-zinc-950"
              title="Google Preview PDF Viewer"
            />
          ) : (
            <iframe 
              src={`${selectedPdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full border-none absolute inset-0 text-white bg-zinc-950"
              title="Native PDF Viewer"
            />
          )}

          {/* Quick Floating Action for extra convenience */}
          <div className="absolute bottom-6 right-6 z-10 hidden sm:block">
            <a
              href={selectedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 bg-[#0a0f1d] border border-white/15 hover:border-[#c5a059]/50 rounded-xl text-zinc-300 hover:text-white transition-all text-xs font-medium shadow-2xl backdrop-blur-md animate-bounce"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Having issues? Switch to ⚡ Native above or open directly
              <ExternalLink className="w-4 h-4 text-[#c5a059]" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="relative overflow-hidden p-8 lg:p-12 rounded-[3rem] bg-gradient-to-br from-[#1a2540] to-[#0a0f1d] border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <BookOpen className="w-64 h-64 text-[#c5a059]" />
        </div>
        
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
              Digital <span className="text-[#c5a059]">Library</span>
            </h1>
            <p className="text-zinc-400 text-lg font-medium leading-relaxed">
              Access Pakistan's most comprehensive repository of military and specialized service exam resources. 
              Search through hundreds of verified books, core PDF notes, and student contributions.
            </p>
          </motion.div>

          <div className="mt-10 relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500 group-focus-within:text-[#c5a059] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search books, notes, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#c5a059]/50 focus:border-[#c5a059] transition-all text-lg font-medium shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-5 flex items-center text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Section - Filter by Division, not test tag */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-1">
          {divisions.map((divName) => (
            <button
              key={divName}
              onClick={() => setSelectedDivision(divName)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                selectedDivision === divName 
                  ? 'bg-[#c5a059] text-black shadow-lg shadow-[#c5a059]/10' 
                  : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-white border border-white/5'
              }`}
            >
              {divName}
            </button>
          ))}
        </div>
        
        <div className="self-start sm:self-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-[#0c1224] border border-white/5 px-4 py-2.5 rounded-xl">
          <Layers className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>{filteredItems.length} Files</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => (
            <motion.div
              layout
              key={item.url + idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              className="group p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#c5a059]/30 hover:bg-white/10 transition-all shadow-xl"
            >
              <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-xl bg-[#c5a059]/10 text-[#c5a059]">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#c5a059] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPdfUrl(item.url)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#c5a059] text-black font-black text-xs rounded-xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest shadow-lg shadow-[#c5a059]/5 cursor-pointer focus:outline-none"
                  >
                    View PDF <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="py-20 text-center glass-panel rounded-[3rem] border border-white/10">
          <Search className="w-16 h-16 text-zinc-700 mx-auto mb-6 opacity-50" />
          <h3 className="text-2xl font-black text-white uppercase mb-2">No matches found</h3>
          <p className="text-zinc-500 font-medium">Try broadening your search or choosing a different category.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedDivision('All'); }}
            className="mt-8 px-8 py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {loading && (
        <div className="py-20 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#c5a059] border-white/10 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Synchronizing library resources...</p>
        </div>
      )}
    </div>
  );
};
