import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, Calendar, Clock, Image as ImageIcon, Video, Search, ChevronRight, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const parseDate = (val: any): Date => {
  if (!val) return new Date();
  if (val instanceof Date) return val;
  if (typeof val?.toDate === 'function') return val.toDate();
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d;
  if (typeof val === 'string') {
    try {
      const dReplace = new Date(val.replace(' ', 'T'));
      if (!isNaN(dReplace.getTime())) return dReplace;
    } catch (e) {
      // ignore
    }
  }
  return new Date();
};

export const NewsAndArticles: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedArticles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: parseDate(doc.data().createdAt)
      }));
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => 
    !searchQuery || 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shrink-0 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
            <Newspaper className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">News and Articles</h1>
          </div>
        </div>

        <div className="relative w-full md:w-72 shrink-0 z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search Intelligence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-600 block shadow-xl"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Decrypting Feed...</p>
            </div>
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center glass-panel border border-dashed border-white/10 rounded-[3rem]">
            <Newspaper className="w-16 h-16 text-zinc-700 mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">No Comm Logs Found</h3>
            <p className="text-zinc-500 max-w-sm">There are no operational updates or news articles matching your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-max pb-12">
            {filteredArticles.map(article => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedArticle(article)}
                className="glass-panel border-2 border-white/5 rounded-[1.5rem] overflow-hidden flex flex-col cursor-pointer group hover:border-white/20 transition-all shadow-2xl bg-white/[0.02]"
              >
                {article.media_url && !imageErrors[article.id] ? (
                  <div className="relative w-full aspect-video overflow-hidden bg-black object-cover border-b border-white/10 shrink-0">
                    {article.media_type?.startsWith('video/') ? (
                      <video src={article.media_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity transform group-hover:scale-105 duration-700" muted loop playsInline />
                    ) : (
                      <img 
                        src={article.media_url} 
                        alt={article.title} 
                        onError={() => setImageErrors(prev => ({ ...prev, [article.id]: true }))}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                        referrerPolicy="no-referrer" 
                      />
                    )}
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80">
                       {article.media_type?.startsWith('video/') ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" /> }
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full aspect-video bg-gradient-to-br from-[#1b2640] via-[#0f172a] to-[#0a0f1d] border-b border-white/10 flex flex-col items-center justify-center shrink-0">
                    <Newspaper className="w-10 h-10 text-[#c5a059]/40 mb-2 group-hover:scale-110 group-hover:text-[#c5a059]/60 transition-all duration-300" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#c5a059]/40">Official Feed</span>
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/60">
                      <Newspaper className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-[9px] uppercase font-black tracking-widest text-zinc-500 mb-3">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(article.created_at, 'MMM dd, yyyy')}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDistanceToNow(article.created_at)} ago</span>
                  </div>
                  
                  <h3 className="text-lg font-black text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed font-medium mb-6">
                    {article.content}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Access Intel</span>
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl max-h-[90vh] glass-panel border border-white/10 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden bg-[#060a14]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-neon-blue to-purple-500 z-20" />
              
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 shrink-0 bg-white/[0.02]">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500">
                     <Newspaper className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.3em] mb-1">Decrypted Transmission</p>
                     <p className="text-sm font-bold text-white uppercase tracking-tight line-clamp-1">{selectedArticle.title}</p>
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="w-12 h-12 rounded-xl hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
                <div className="max-w-3xl mx-auto space-y-10">
                  {selectedArticle.media_url && !imageErrors[selectedArticle.id] ? (
                    <div className="w-full rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                      {selectedArticle.media_type?.startsWith('video/') ? (
                        <video src={selectedArticle.media_url} controls className="w-full" />
                      ) : (
                        <img 
                          src={selectedArticle.media_url} 
                          alt={selectedArticle.title} 
                          onError={() => setImageErrors(prev => ({ ...prev, [selectedArticle.id]: true }))}
                          className="w-full h-auto" 
                          referrerPolicy="no-referrer" 
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-video rounded-[2rem] bg-gradient-to-br from-[#1b2640] via-[#0f172a] to-[#0a0f1d] border border-white/10 shadow-2xl flex flex-col items-center justify-center">
                      <Newspaper className="w-16 h-16 text-[#c5a059]/40 mb-3" />
                      <span className="text-xs font-black uppercase tracking-widest text-[#c5a059]/50">Official Intelligence Briefing</span>
                    </div>
                  )}
                  
                  <div>
                    <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-widest text-blue-400 mb-6 bg-blue-500/10 inline-flex px-3 py-1.5 rounded-lg border border-blue-500/20">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {format(selectedArticle.created_at, 'MMMM dd, yyyy')}</span>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-10">
                      {selectedArticle.title}
                    </h2>
                    
                    <div className="prose prose-invert prose-lg max-w-none prose-p:text-zinc-300 prose-p:font-medium prose-p:leading-relaxed">
                      {selectedArticle.content.split('\n').map((paragraph: string, idx: number) => (
                        <p key={idx} className="mb-6">{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
