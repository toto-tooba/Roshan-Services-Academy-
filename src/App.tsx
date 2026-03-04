import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Unlock, 
  Upload, 
  FileText, 
  Plus, 
  ChevronRight, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check,
  ShieldCheck,
  GraduationCap,
  ArrowLeft,
  Key,
  Eye,
  FileDown,
  Settings,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Import styles for react-pdf
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Note {
  id: string;
  title: string;
  created_at: string;
  available_codes: number;
  used_codes: number;
}

interface AccessCode {
  code: string;
  is_used: number;
  used_at: string | null;
}

interface Quiz {
  id: string;
  subject: string;
  questions?: Question[];
}

interface Question {
  q: string;
  options: string[];
  correct: number;
}

// --- Components ---

const Navbar = ({ view, setView }: { view: string, setView: (v: string) => void }) => (
  <nav className="border-b border-emerald-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
    <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => setView('home')}
      >
        <div className="w-10 h-10 bg-emerald-800 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-emerald-900 leading-none tracking-tight">ROSHAN</span>
          <span className="text-[10px] font-bold text-emerald-600 tracking-[0.2em] uppercase">Services Academy</span>
        </div>
      </div>
      <div className="flex gap-6">
        <button 
          onClick={() => setView('viewer')}
          className={cn(
            "text-sm font-bold transition-colors uppercase tracking-wider",
            view === 'viewer' ? "text-emerald-800" : "text-zinc-500 hover:text-emerald-700"
          )}
        >
          Unlock Notes
        </button>
        <button 
          onClick={() => setView('quizzes')}
          className={cn(
            "text-sm font-bold transition-colors uppercase tracking-wider",
            view === 'quizzes' ? "text-emerald-800" : "text-zinc-500 hover:text-emerald-700"
          )}
        >
          Practice Tests
        </button>
        <button 
          onClick={() => setView('owner')}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 text-zinc-400 hover:bg-emerald-800 hover:text-white transition-all",
            view === 'owner' && "bg-emerald-800 text-white"
          )}
          title="Admin Panel"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  </nav>
);

const OwnerDashboard = () => {
  const [password, setPassword] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [codeCount, setCodeCount] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthed) fetchNotes();
  }, [isAuthed]);

  const fetchNotes = async () => {
    const res = await fetch('/api/admin/notes', {
      headers: { 'Authorization': password }
    });
    if (res.ok) {
      const data = await res.json();
      setNotes(data);
    } else {
      setIsAuthed(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) setIsAuthed(true);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('pdf', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': password },
        body: formData,
      });
      if (res.ok) {
        setTitle('');
        setFile(null);
        fetchNotes();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const generateCodes = async (noteId: string) => {
    const res = await fetch('/api/admin/generate-codes', {
      method: 'POST',
      headers: { 
        'Authorization': password,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ noteId, count: codeCount }),
    });
    if (res.ok) {
      fetchCodes(noteId);
      fetchNotes();
    }
  };

  const fetchCodes = async (noteId: string) => {
    const res = await fetch(`/api/admin/codes/${noteId}`, {
      headers: { 'Authorization': password }
    });
    const data = await res.json();
    setCodes(data);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Owner Access</h2>
          <p className="text-zinc-500 mb-6">Enter your admin password to manage notes.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
            />
            <button type="submit" className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Owner Dashboard</h1>
        <button onClick={() => setIsAuthed(false)} className="text-sm text-zinc-500 hover:text-zinc-900">Logout</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" /> Upload PDF Note
            </h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Note Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Biology Final Exam Prep"
                  className="w-full px-4 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">PDF File</label>
                <div className="relative border-2 border-dashed border-zinc-200 rounded-xl p-4 text-center hover:border-zinc-400 transition-colors cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="text-sm text-zinc-500">{file ? file.name : 'Click to select PDF'}</p>
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isUploading || !file || !title}
                className="w-full bg-zinc-900 text-white py-3 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? 'Uploading...' : <><Plus className="w-4 h-4" /> Add Note</>}
              </button>
            </form>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-4">Your Notes Library</h2>
            <div className="grid gap-4">
              {notes.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 text-zinc-500">
                  No notes uploaded yet.
                </div>
              ) : (
                notes.map((note) => (
                  <div 
                    key={note.id} 
                    className={cn(
                      "bg-white border rounded-2xl p-5 flex items-center justify-between group transition-all cursor-pointer",
                      selectedNote?.id === note.id ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
                    )}
                    onClick={() => {
                      setSelectedNote(note);
                      fetchCodes(note.id);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900">{note.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                          <span>{new Date(note.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> {note.available_codes} available
                          </span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Eye className="w-3 h-3" /> {note.used_codes} used
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300" />
                  </div>
                ))
              )}
            </div>
          </section>

          <AnimatePresence>
            {selectedNote && (
              <motion.section 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Manage Codes: {selectedNote.title}</h2>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={codeCount}
                      onChange={(e) => setCodeCount(parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border border-zinc-200 rounded-lg text-sm"
                    />
                    <button 
                      onClick={() => generateCodes(selectedNote.id)}
                      className="bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-zinc-800"
                    >
                      Generate One-Time Codes
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2">
                  {codes.map((c) => (
                    <div 
                      key={c.code} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-xl border text-sm",
                        c.is_used ? "bg-zinc-50 border-zinc-100 text-zinc-400" : "bg-white border-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{c.code}</span>
                        {c.is_used && <span className="text-[10px] uppercase font-bold text-zinc-400">Used</span>}
                      </div>
                      {!c.is_used && (
                        <button 
                          onClick={() => copyCode(c.code)}
                          className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
                        >
                          {copiedCode === c.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const getUserId = () => {
  let id = localStorage.getItem('roshan_user_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('roshan_user_id', id);
  }
  return id;
};

const NoteViewer = () => {
  const [accessCode, setAccessCode] = useState('');
  const [noteData, setNoteData] = useState<{ title: string, viewToken: string, noteId: string } | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [unlockedNotes, setUnlockedNotes] = useState<any[]>([]);
  const [availableNotes, setAvailableNotes] = useState<any[]>([]);
  const [view, setView] = useState<'unlock' | 'list' | 'library'>('library');
  const userId = getUserId();

  const fetchUnlockedNotes = async () => {
    try {
      const res = await fetch(`/api/notes/unlocked?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUnlockedNotes(data);
      }
    } catch (err) {
      console.error('Error fetching unlocked notes:', err);
    }
  };

  const fetchAvailableNotes = async () => {
    try {
      const res = await fetch('/api/notes/public');
      if (res.ok) {
        const data = await res.json();
        setAvailableNotes(data);
      }
    } catch (err) {
      console.error('Error fetching available notes:', err);
    }
  };

  useEffect(() => {
    fetchUnlockedNotes();
    fetchAvailableNotes();
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const openNote = async (note: any) => {
    setIsLoading(true);
    setError('');
    try {
      setNoteData(note);
      const pdfRes = await fetch(`/api/notes/view/${note.viewToken}?userId=${userId}`);
      if (pdfRes.ok) {
        const blob = await pdfRes.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } else {
        setError('Failed to load PDF content');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = accessCode.trim().toUpperCase();
    if (!trimmedCode) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/notes/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: trimmedCode, userId }),
      });
      const data = await res.json();
      if (res.ok) {
        await openNote(data);
        fetchUnlockedNotes();
      } else {
        setError(data.error || 'Invalid or used code');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  if (noteData && pdfUrl) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="bg-zinc-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <FileDown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{noteData.title}</h1>
              <p className="text-zinc-400 text-xs flex items-center gap-1">
                <Unlock className="w-3 h-3" /> Device-locked access granted
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              setNoteData(null);
              setPdfUrl(null);
              setNumPages(null);
              setPageNumber(1);
              fetchUnlockedNotes();
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
        
        <div className="bg-zinc-100 min-h-[500px] flex flex-col items-center p-4 overflow-auto max-h-[70vh]">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-zinc-500 font-bold animate-pulse">Rendering PDF...</p>
              </div>
            }
            error={
              <div className="p-10 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 font-bold">Failed to render PDF.</p>
                <button onClick={() => window.open(pdfUrl, '_blank')} className="mt-4 text-zinc-900 underline">
                  Try opening in new tab
                </button>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              width={Math.min(window.innerWidth - 80, 600)}
              renderAnnotationLayer={false}
              renderTextLayer={false}
              className="shadow-xl rounded-lg overflow-hidden"
            />
          </Document>
          
          {numPages && (
            <div className="mt-6 flex items-center gap-6 bg-white px-6 py-3 rounded-2xl shadow-lg border border-zinc-200">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber(prev => prev - 1)}
                className="p-2 hover:bg-zinc-100 rounded-full disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <p className="font-bold text-zinc-900">
                Page {pageNumber} <span className="text-zinc-400 mx-1">/</span> {numPages}
              </p>
              <button
                disabled={pageNumber >= numPages}
                onClick={() => setPageNumber(prev => prev + 1)}
                className="p-2 hover:bg-zinc-100 rounded-full disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-center space-y-2">
          <p className="text-xs text-zinc-500 font-medium">
            This note is now locked to this browser. You can revisit it using the same code on this device.
          </p>
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-emerald-600 text-xs font-bold hover:underline"
          >
            <ExternalLink className="w-3 h-3" /> Open in New Tab (if not loading)
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <div className="flex justify-center mb-8">
        <div className="bg-zinc-100 p-1 rounded-xl flex gap-1">
          <button 
            onClick={() => setView('library')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-sm transition-all",
              view === 'library' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Library ({availableNotes.length})
          </button>
          <button 
            onClick={() => setView('list')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-sm transition-all",
              view === 'list' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            My Notes ({unlockedNotes.length})
          </button>
          <button 
            onClick={() => setView('unlock')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-sm transition-all",
              view === 'unlock' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            Unlock New
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'library' ? (
          <motion.div
            key="library"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {availableNotes.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                <BookOpen className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">No notes available in the library yet.</p>
              </div>
            ) : (
              availableNotes.map((note) => {
                const isUnlocked = unlockedNotes.some(un => un.id === note.id);
                return (
                  <div
                    key={note.id}
                    className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col group"
                  >
                    <div className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <FileText className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-2 line-clamp-2">{note.title}</h3>
                    <div className="mt-auto pt-6 flex items-center justify-between">
                      {isUnlocked ? (
                        <button
                          onClick={() => openNote(unlockedNotes.find(un => un.id === note.id))}
                          className="flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline"
                        >
                          <Eye className="w-4 h-4" /> View Now
                        </button>
                      ) : (
                        <button
                          onClick={() => setView('unlock')}
                          className="flex items-center gap-2 text-zinc-900 font-bold text-sm hover:underline"
                        >
                          <Lock className="w-4 h-4" /> Unlock
                        </button>
                      )}
                      <span className="text-[10px] text-zinc-400 font-mono uppercase">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        ) : view === 'unlock' ? (
          <motion.div
            key="unlock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Unlock PDF Note</h2>
              <p className="text-zinc-500 mt-2">Enter your unique security code. Once used, it will be locked to this device.</p>
            </div>

            <form onSubmit={handleAccess} className="space-y-4">
              <input 
                type="text" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                className="w-full px-6 py-4 rounded-2xl border-2 border-zinc-200 text-center text-2xl font-mono font-bold tracking-widest focus:outline-none focus:border-zinc-900 transition-all uppercase"
                maxLength={10}
              />
              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <button 
                type="submit"
                disabled={isLoading || accessCode.length < 4}
                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all shadow-lg hover:shadow-zinc-900/20 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Unlock & View PDF'}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {unlockedNotes.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200">
                <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">You haven't unlocked any notes yet.</p>
                <button 
                  onClick={() => setView('unlock')}
                  className="mt-4 text-emerald-600 font-bold hover:underline"
                >
                  Unlock your first note
                </button>
              </div>
            ) : (
              unlockedNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => openNote(note)}
                  className="flex items-center gap-4 p-5 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-900 hover:shadow-md transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 truncate">{note.title}</h3>
                    <p className="text-zinc-500 text-xs mt-1 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Unlocked & Secured
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-zinc-900 transition-colors" />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuizSection = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(setQuizzes);
  }, []);

  const startQuiz = async (id: string) => {
    const res = await fetch(`/api/quizzes/${id}`);
    const data = await res.json();
    setActiveQuiz(data);
    setCurrentQuestion(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
  };

  const handleAnswer = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    if (index === activeQuiz?.questions![currentQuestion].correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < activeQuiz!.questions!.length) {
        setCurrentQuestion(c => c + 1);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (showResult) {
    return (
      <div className="max-w-md mx-auto text-center py-12 bg-white border border-zinc-200 rounded-3xl shadow-xl">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
        <p className="text-zinc-500 mb-8">You scored {score} out of {activeQuiz?.questions?.length}</p>
        <button 
          onClick={() => setActiveQuiz(null)}
          className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-all"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  if (activeQuiz) {
    const q = activeQuiz.questions![currentQuestion];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setActiveQuiz(null)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900">
            <ArrowLeft className="w-4 h-4" /> Quit
          </button>
          <div className="px-4 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-500">
            QUESTION {currentQuestion + 1} OF {activeQuiz.questions?.length}
          </div>
        </div>
        
        <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-8">{q.q}</h2>
          <div className="grid gap-4">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={cn(
                  "w-full p-5 text-left rounded-2xl border-2 transition-all font-medium flex items-center justify-between group",
                  selectedOption === null ? "border-zinc-100 hover:border-zinc-900 hover:bg-zinc-50" :
                  i === q.correct ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                  selectedOption === i ? "border-red-500 bg-red-50 text-red-700" : "border-zinc-100 opacity-50"
                )}
              >
                {opt}
                {selectedOption !== null && i === q.correct && <CheckCircle2 className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subject Quizzes</h2>
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <GraduationCap className="w-4 h-4" /> Test your knowledge
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <button
            key={quiz.id}
            onClick={() => startQuiz(quiz.id)}
            className="bg-white border border-zinc-200 p-6 rounded-2xl text-left hover:border-zinc-900 hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-bold text-zinc-900">{quiz.subject}</h3>
              <p className="text-sm text-zinc-500 mt-1">Multiple choice questions</p>
            </div>
            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const Home = ({ setView }: { setView: (v: string) => void }) => (
  <div className="space-y-20">
    <section className="relative py-20 overflow-hidden rounded-[2.5rem] bg-emerald-900 text-white">
      <div className="absolute inset-0 opacity-20">
        <img 
          src="https://picsum.photos/seed/academy/1920/1080?blur=2" 
          alt="" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-emerald-100 text-sm font-bold border border-white/10"
        >
          <GraduationCap className="w-4 h-4" /> JOIN THE FORCES OF PAKISTAN
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]"
        >
          YOUR JOURNEY TO <br />
          <span className="text-emerald-400">OFFICER RANK</span> STARTS HERE.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-emerald-100/80 font-medium max-w-xl mx-auto"
        >
          Roshan Services Academy provides elite preparation for ISSB, Initial Tests, and Academic exams for Army, Navy, Air Force, and Police.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <button 
            onClick={() => setView('viewer')}
            className="px-8 py-4 bg-emerald-400 text-emerald-950 rounded-2xl font-black text-lg hover:bg-emerald-300 transition-all shadow-xl shadow-emerald-400/20 flex items-center gap-2 uppercase tracking-tight"
          >
            <Unlock className="w-5 h-5" /> Unlock Premium Notes
          </button>
          <button 
            onClick={() => setView('quizzes')}
            className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-black text-lg hover:bg-white/20 transition-all flex items-center gap-2 uppercase tracking-tight"
          >
            <BookOpen className="w-5 h-5" /> Free Practice Tests
          </button>
        </motion.div>
      </div>
    </section>

    <section className="grid md:grid-cols-3 gap-8">
      {[
        { 
          icon: ShieldCheck, 
          title: "ISSB Preparation", 
          desc: "Comprehensive notes for Psychology, GTO, and Interview stages of ISSB selection.",
          img: "https://picsum.photos/seed/military/800/600"
        },
        { 
          icon: Key, 
          title: "Initial Intelligence", 
          desc: "Master Verbal and Non-Verbal intelligence tests with our specialized practice materials.",
          img: "https://picsum.photos/seed/test/800/600"
        },
        { 
          icon: GraduationCap, 
          title: "Academic Excellence", 
          desc: "Targeted preparation for Physics, Maths, and English academic tests for all forces.",
          img: "https://picsum.photos/seed/study/800/600"
        }
      ].map((feature, i) => (
        <div key={i} className="group bg-white border border-zinc-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/5 transition-all">
          <div className="h-48 overflow-hidden relative">
            <img 
              src={feature.img} 
              alt={feature.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <feature.icon className="w-5 h-5" />
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-black text-xl mb-2 text-zinc-900 uppercase tracking-tight">{feature.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
          </div>
        </div>
      ))}
    </section>

    <section className="bg-zinc-900 rounded-[2.5rem] p-12 text-white flex flex-col md:flex-row items-center gap-12">
      <div className="flex-1 space-y-6">
        <h2 className="text-4xl font-black tracking-tight uppercase leading-none">
          SECURE ONE-TIME <br />
          <span className="text-emerald-400">PREMIUM ACCESS</span>
        </h2>
        <p className="text-zinc-400 text-lg font-medium">
          Our premium notes are protected by one-time security codes. This ensures that only serious candidates get access to our exclusive research-based preparation material.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <img 
                key={i}
                src={`https://i.pravatar.cc/100?img=${i+10}`} 
                className="w-10 h-10 rounded-full border-2 border-zinc-900"
                alt="User"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
          <p className="text-sm font-bold text-zinc-300">500+ Candidates Prepared This Year</p>
        </div>
      </div>
      <div className="flex-shrink-0 w-full md:w-80 bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Success Rate</span>
            <span className="text-emerald-400 font-bold">85%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[85%]" />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Notes Delivered</span>
            <span className="text-emerald-400 font-bold">1.2k+</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[92%]" />
          </div>
          <button 
            onClick={() => setView('viewer')}
            className="w-full mt-4 bg-emerald-500 text-emerald-950 py-3 rounded-xl font-black uppercase tracking-tight hover:bg-emerald-400 transition-colors"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  </div>
);

export default function App() {
  const [view, setView] = useState('home');

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      <Navbar view={view} setView={setView} />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'home' && <Home setView={setView} />}
            {view === 'owner' && <OwnerDashboard />}
            {view === 'viewer' && <NoteViewer />}
            {view === 'quizzes' && <QuizSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-200 py-12 mt-20">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-bold tracking-tight uppercase">Roshan Academy</span>
          </div>
          <p className="text-zinc-400 text-sm">© 2026 Roshan Services Academy. Empowering the Youth of Pakistan.</p>
          <div className="flex gap-6 text-zinc-400 text-sm">
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
