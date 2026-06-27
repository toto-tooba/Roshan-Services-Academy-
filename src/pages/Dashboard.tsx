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
  CreditCard,
  Copy,
  Check,
  ShieldCheck,
  GraduationCap,
  Trophy,
  ArrowLeft,
  Key,
  Eye,
  Play,
  FileDown,
  Settings,
  ExternalLink,
  ChevronLeft,
  User as UserIcon,
  LogOut,
  Camera,
  AtSign,
  Info,
  Loader2,
  Hash,
  MapPin,
  MessageSquare,
  MessageCircle,
  Clock,
  BarChart3,
  Medal,
  Flag,
  Beaker,
  X,
  LayoutDashboard,
  ClipboardList,
  LineChart,
  UserCircle,
  Target,
  Users,
  Zap,
  Menu,
  Brain,
  Search,
  Newspaper,
  ShieldAlert,
  Video,
  Bell
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { DiscussionBoard } from '../components/DiscussionBoard';
import { ClassroomView } from '../components/ClassroomView';
import { ProfileSection } from '../components/ProfileSection';
import { QuizSection } from '../components/QuizSection';
import { SupportWidget } from '../components/SupportWidget';
import { AdminPanel } from '../components/AdminPanel';
import { NewsAndArticles } from '../components/NewsAndArticles';
import { LiveClassesView } from '../components/LiveClassesView';
import { DigitalLibrary } from '../components/DigitalLibrary';
import { StudentNotesTab } from '../components/StudentNotesTab';
import { StudyNotes } from './StudyNotes';
import { cn } from '../lib/utils';
import { OperationType } from '../services/databaseService';

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

import { biologyQuizzes } from '../../biology_quizzes';
import { verbalIntelligenceQuizzes } from '../../verbal_intelligence_quizzes';
import { nonVerbalIntelligenceQuizzes } from '../../non_verbal_intelligence_quizzes';
import { urduGrammarQuizzes } from '../../urdu_grammar_quizzes';
import { islamicStudiesQuizzes } from '../../islamic_studies_quizzes';
import { asfQuizzes } from '../../asf_quizzes';
import { asfScienceQuizzes } from '../../asf_science_quizzes';
import { mdcatLogicalQuizzes } from '../../mdcat_logical_quizzes';
import { generalKnowledgeQuizzes } from '../../general_knowledge_quizzes';
import { biologyClass11Quizzes } from '../../biology_class_11_quizzes';
import { physicsClass11Quizzes } from '../../physics_class_11_quizzes';
import { physicsClass9Quizzes } from '../../physics_class_9_quizzes';
import { basicMathQuizzes } from '../../basic_math_quizzes';
import { physicsClass12Quizzes } from '../../physics_class_12_quizzes';
import { physicsClass10Quizzes } from '../../physics_class_10_quizzes';
import { biologyClass9Quizzes } from '../../biology_class_9_quizzes';
import { biologyClass12Quizzes } from '../../biology_class_12_quizzes';
import { pakistanStudiesQuizzes } from '../../pakistan_studies_quizzes';
import { chemistryClass9Quizzes } from '../../chemistry_class_9_quizzes';
import { chemistryClass10Quizzes } from '../../chemistry_class_10_quizzes';
import { chemistryClass11Quizzes } from '../../chemistry_class_11_quizzes';
import { chemistryClass12Quizzes } from '../../chemistry_class_12_quizzes';
import { computerClass9Quizzes } from '../../computer_class_9_quizzes';
import { computerClass10Quizzes } from '../../computer_class_10_quizzes';
import { computerClass11Quizzes } from '../../computer_class_11_quizzes';
import { computerClass12Quizzes } from '../../computer_class_12_quizzes';
import { mathClass9Quizzes } from '../../math_class_9_quizzes';
import { mathClass10Quizzes } from '../../math_class_10_quizzes';
import { mathClass11Quizzes } from '../../math_class_11_quizzes';
import { mathClass12Quizzes } from '../../math_class_12_quizzes';
import { englishMcqsNotes } from '../../english_mcqs_notes';

import { gdPilotNotes } from '../data/gdPilotNotes';

// --- Constants ---
const CATEGORIES = [
  { name: "GD (Pilot)", image: "https://i.postimg.cc/nhMMR8w9/Screenshot-2026-03-09-9-06-40-PM.png" },
  { name: "PMA long course", image: "https://i.postimg.cc/BQJcY63X/Screenshot-2026-03-09-8-10-50-PM.png" },
  { name: "PN CADET", image: "https://i.postimg.cc/4x6GJBMc/Screenshot-2026-03-09-8-14-49-PM.png" },
  { name: "AFNS", image: "https://i.postimg.cc/Bvw4ytk7/Screenshot-2026-03-09-8-16-57-PM.png" },
  { name: "ASF", image: "https://i.postimg.cc/3NfX0XcG/Screenshot-2026-03-09-8-20-28-PM.png" },
  { name: "Airmen", image: "https://i.postimg.cc/dQhmgXkf/Screenshot-2026-03-09-8-23-34-PM.png" },
  { name: "Sailor", image: "https://i.postimg.cc/Y0CVwxFs/Screenshot-2026-03-09-8-30-19-PM.png" },
  { name: "Pak Army Soldier", image: "https://i.postimg.cc/4xQSnM10/Screenshot-2026-03-09-8-34-40-PM.png" },
  { name: "Punjab Police", image: "https://i.postimg.cc/m2NwS9F4/Screenshot-2026-03-09-8-36-39-PM.png" },
  { name: "Rangers", image: "https://i.postimg.cc/NF2nMjNM/Screenshot-2026-03-09-8-46-17-PM.png" },
  { name: "LAT", image: "https://i.postimg.cc/SQVL2404/Screenshot-2026-03-09-8-53-48-PM.png" },
  { name: "MDCAT", image: "https://i.postimg.cc/vB0zswbW/Screenshot-2026-03-09-9-00-43-PM.png" },
  { name: "E-CAT", image: "https://i.postimg.cc/T2mV0bWr/Screenshot-2026-03-09-9-04-06-PM.png" }
];

// --- Types ---
interface Note {
  id: string;
  title: string;
  category?: string;
  sub_category?: string;
  created_at: string;
}

interface Quiz {
  id?: string;
  subject?: string;
  exercise?: string;
  topic?: string;
  questions?: any[];
}

// --- Sidebar Component ---
const Sidebar = ({ activeView, setView, isOpen, onClose }: { activeView: string, setView: (v: string) => void, isOpen: boolean, onClose: () => void }) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Digital Library', icon: BookOpen },
    { id: 'news', label: 'News & Articles', icon: Newspaper },
    { id: 'live-classes', label: 'Live Classes', icon: Video },
    { id: 'study-notes', label: 'Study Notes', icon: BookOpen },
    { id: 'student-notes', label: 'Student Notes', icon: FileText },
    { id: 'quizzes', label: 'Practice Tests', icon: ClipboardList },
    { id: 'classrooms', label: 'Classrooms', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  if (profile?.isAdmin) {
    menuItems.push({ id: 'admin', label: 'Admin Panel', icon: ShieldAlert });
  }

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity md:hidden",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        )}
        onClick={onClose}
      />
      <div className={cn(
        "w-72 bg-[#0a0f1d] border-r border-white/5 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-16 min-w-[64px] flex items-center">
              <img 
                src="https://i.postimg.cc/8z3yqYyF/Gemini-Generated-Image-5ikwfq5ikwfq5ikw-removebg-preview(3).png" 
                alt="Roshan Services Academy" 
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-lg leading-none tracking-tighter">ROSHAN</span>
              <span className="text-[8px] font-black text-[#c5a059] tracking-[0.4em] uppercase mt-1">Services Academy</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'study-notes') {
                if (location.pathname !== '/study-notes') {
                  navigate('/study-notes');
                } else {
                  setView('study-notes');
                }
                onClose();
              } else {
                if (location.pathname !== '/dashboard') {
                  navigate('/dashboard', { state: { view: item.id } });
                } else {
                  setView(item.id);
                }
                onClose();
              }
            }}
            className={cn(
              "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group relative overflow-hidden",
              activeView === item.id 
                ? "bg-[#c5a059]/10 text-[#c5a059] border border-[#c5a059]/20" 
                : "text-zinc-500 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-transform group-hover:scale-110",
              activeView === item.id ? "text-[#c5a059]" : "text-zinc-600 group-hover:text-white"
            )} />
            <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
            {activeView === item.id && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute left-0 w-1 h-8 bg-[#c5a059] rounded-r-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="p-6 border-t border-white/5">
        <button 
          onClick={async () => {
            await logout();
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </div>
    </>
  );
};

// --- TopBar Component ---
const TopBar = ({ 
  title, 
  onOpenProfile, 
  onOpenSidebar,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  onNavigateToView
}: { 
  title: string, 
  onOpenProfile: () => void, 
  onOpenSidebar: () => void,
  notifications: any[],
  unreadCount: number,
  markAsRead: (id: string) => void,
  markAllAsRead: () => void,
  onNavigateToView: (view: string) => void
}) => {
  const { profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'class_accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'class_uploaded':
        return <Video className="w-4 h-4 text-purple-400" />;
      case 'article_uploaded':
        return <Newspaper className="w-4 h-4 text-[#c5a059]" />;
      case 'app_update':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Bell className="w-4 h-4 text-zinc-400" />;
    }
  };

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setShowNotifications(false);
    onNavigateToView(notif.link);
  };

  return (
    <div className="h-20 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 min-w-0">
        <button onClick={onOpenSidebar} className="md:hidden text-zinc-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 shrink-0">
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter hidden md:block truncate">{title}</h2>
        <h2 className="text-lg font-black text-white uppercase tracking-tighter md:hidden truncate">{title}</h2>
      </div>
      
      <div className="flex items-center gap-4 lg:gap-6 shrink-0 relative">
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
          <ShieldCheck className="w-4 h-4 text-[#c5a059]" />
          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Premium Status</span>
        </div>

        {/* --- Bell Notification Icon & Dropdown --- */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-white/5 border border-white/10 hover:border-[#c5a059]/50 rounded-xl text-zinc-400 hover:text-white transition-all cursor-pointer relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full border border-[#060a14] shadow-lg flex items-center justify-center text-[9px] font-black text-white px-1">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="fixed left-4 right-4 top-[76px] sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-3 sm:w-96 bg-[#0c1328]/95 backdrop-blur-2xl border-2 border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden z-50 text-white flex flex-col"
                >
                  <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between gap-4">
                    <h3 className="font-black text-xs uppercase tracking-wider text-white">Notifications</h3>
                    {unreadCount > 0 ? (
                      <button 
                        onClick={() => { markAllAsRead(); setShowNotifications(false); }}
                        className="text-[9px] font-bold text-[#c5a059] hover:underline uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    ) : (
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest font-mono">Synced</span>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-white/5 custom-scrollbar min-h-0">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center flex flex-col items-center justify-center">
                        <Check className="w-8 h-8 text-green-500 mb-3 bg-green-500/10 p-1.5 rounded-full" />
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No updates received</p>
                        <p className="text-[10px] text-zinc-600 mt-1">You are fully synchronized with command headquarters.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-4 flex gap-3 cursor-pointer hover:bg-white/5 transition-colors relative text-left select-none ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                        >
                          {!notif.read && (
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                          )}
                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0 select-none">
                            {getNotificationIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-white line-clamp-1 leading-none mb-1">{notif.title}</span>
                              <span className="text-[8px] font-medium text-zinc-500 shrink-0 leading-none">
                                {(() => {
                                  try {
                                    return formatDistanceToNow(new Date(notif.time), { addSuffix: true }).replace('about ', '');
                                  } catch {
                                    return 'just now';
                                  }
                                })()}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{notif.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={onOpenProfile}
          className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white/5 border border-white/10 rounded-2xl hover:border-[#c5a059] transition-all group"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[#c5a059]">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
              {profile?.displayName?.split(' ')[0] || 'User'}
            </span>
            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">
              {profile?.isAdmin ? 'Admin' : 'Student'}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

// --- Main Dashboard Component ---
export const Dashboard: React.FC<{ defaultView?: string }> = ({ defaultView = 'dashboard' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, updateUserProfile, isAuthorized } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, setActiveClassroomChatId } = useNotifications();
  const [view, setView] = useState(defaultView);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeQuizCategory, setActiveQuizCategory] = useState('All');
  const [activeSubCategory, setActiveSubCategory] = useState('PDF Notes');

  useEffect(() => {
    if (location.state) {
      if (location.state.view) setView(location.state.view);
      if (location.state.category) setActiveQuizCategory(location.state.category);
      if (location.state.subCategory) setActiveSubCategory(location.state.subCategory);
    }
  }, [location.state]);

  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [quizSearchQuery, setQuizSearchQuery] = useState('');
  const [showNonVerbalSoon, setShowNonVerbalSoon] = useState(false);
  
  const targetExamsList = [
    'PMA Long Course',
    'GDP (General Duty Pilot)',
    'AFNS (Armed Forces Nursing Service)',
    'CAE (College of Aeronautical Engineering)',
    'ASF (Airports Security Force)',
    'LCC (Lady Cadet Course)',
    'Navy SSC',
    'PN Cadet'
  ];

  useEffect(() => {
    if (view !== 'quizzes') return;
    
    const timeout = setTimeout(() => {
      const container = document.getElementById('quizzes-scroll-container');
      if (!container) return;
      const cards = container.querySelectorAll('button.glass-panel');
      cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent?.toLowerCase() || '';
        const desc = card.querySelector('p')?.textContent?.toLowerCase() || '';
        if (!quizSearchQuery || title.includes(quizSearchQuery.toLowerCase()) || desc.includes(quizSearchQuery.toLowerCase())) {
          (card as HTMLElement).style.display = '';
        } else {
          (card as HTMLElement).style.display = 'none';
        }
      });
    }, 50);

    return () => clearTimeout(timeout);
  }, [view, quizSearchQuery]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'quiz_results'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentResults(results);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'quiz_results');
    });

    return () => unsubscribe();
  }, [user]);

  const DashboardOverview = () => {
    let daysLeftValue = "Set Date";
    if (profile?.examDate) {
      const diffTime = new Date(profile.examDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysLeftValue = diffDays > 0 ? diffDays.toString() : diffDays === 0 ? "Today" : "Passed";
    }

    const stats = [
      { id: 'tests', label: 'Tests Taken', value: recentResults.length.toString(), icon: ClipboardList },
      { id: 'score', label: 'Avg Score', value: recentResults.length > 0 ? `${Math.round(recentResults.reduce((acc, curr) => acc + curr.score, 0) / recentResults.length)}%` : '0%', icon: Trophy },
      { id: 'days_left', label: 'Days Left', value: daysLeftValue, icon: BookOpen },
      { id: 'rank', label: 'Rank', value: '#12', icon: Medal },
    ];

    return (
      <div className="space-y-6 w-full overflow-hidden">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className={cn(
                "glass-panel p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-white/10 shadow-xl relative overflow-hidden group",
                stat.id === 'days_left' && "cursor-pointer hover:border-white/20"
              )}
              onClick={() => {
                if (stat.id === 'days_left') {
                  setIsEditingSchedule(true);
                  setTimeout(() => {
                    document.getElementById('study-plan-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              <div className="absolute top-0 right-0 w-16 h-16 lg:w-24 lg:h-24 bg-white/5 blur-2xl rounded-full -mr-8 -mt-8 lg:-mr-12 lg:-mt-12 group-hover:bg-white/10 transition-all" />
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 lg:mb-4 relative z-10">
                <stat.icon className="w-4 h-4 lg:w-5 lg:h-5 text-[#c5a059]" />
              </div>
              <div className="min-h-[28px] lg:min-h-[40px] flex items-center mb-1 relative z-10">
                <div className={cn("font-black text-white", stat.id === 'days_left' && daysLeftValue === 'Set Date' ? "text-base lg:text-lg text-zinc-400" : "text-xl lg:text-3xl")}>{stat.value}</div>
              </div>
              <div className="text-[8px] lg:text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-tight relative z-10">
                {stat.label} {stat.id === 'days_left' && <span className="text-zinc-600 lowercase ml-1">(click to set)</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl border border-white/10 p-6 md:p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Recent Performance</h3>
              </div>
              <div className="space-y-4">
              {recentResults.length === 0 ? (
                <div className="text-center py-12 text-zinc-700">
                  <LineChart className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No test data detected</p>
                </div>
              ) : (
                recentResults.map((test, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                        <ClipboardList className="w-5 h-5 text-zinc-500" />
                      </div>
                      <div>
                        <div className="font-black text-white uppercase tracking-tight text-sm">{test.subject}</div>
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">
                          {test.timestamp?.toDate?.()?.toLocaleDateString() || 'Just now'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-[#c5a059]">{test.score}%</div>
                      <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-0.5">Score</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div id="study-plan-section" className="glass-panel rounded-3xl border border-white/10 p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Study Plan</h3>
              {profile?.targetExam && !isEditingSchedule && (
                <button 
                  onClick={() => setIsEditingSchedule(true)}
                  className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
            {(!profile?.targetExam || !profile?.examDate || isEditingSchedule) ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const targetExam = formData.get('targetExam') as string;
                const examDate = formData.get('examDate') as string;
                if (targetExam && examDate) {
                  await updateUserProfile({ targetExam, examDate });
                  setIsEditingSchedule(false);
                }
              }} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Exam (e.g., PMA Long Course, GDP)</label>
                  <input 
                    required 
                    name="targetExam" 
                    type="text" 
                    list="examSuggestions"
                    defaultValue={profile?.targetExam || ''}
                    placeholder="e.g. PMA Long Course" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059]" 
                  />
                  <datalist id="examSuggestions">
                    {targetExamsList.map(exam => (
                      <option key={exam} value={exam} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Exam Date</label>
                  <input 
                    required 
                    name="examDate" 
                    type="date" 
                    defaultValue={profile?.examDate || ''}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c5a059] block dark:[color-scheme:dark]" 
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 mt-2 py-3 bg-[#c5a059] text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#d6af68] transition-all">
                    {profile?.targetExam ? 'Update Schedule' : 'Generate Schedule'}
                  </button>
                  {isEditingSchedule && (
                    <button 
                      type="button" 
                      onClick={() => setIsEditingSchedule(false)}
                      className="mt-2 py-3 bg-white/5 text-white border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all px-4"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (() => {
               const diffTime = new Date(profile.examDate).getTime() - new Date().getTime();
               const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
               
               const hoursPerDay = daysLeft < 14 ? 6 : (daysLeft < 30 ? 4 : 3);
               const practiceHours = Math.round(hoursPerDay * 0.5 * 10) / 10;
               const conceptHours = Math.round(hoursPerDay * 0.3 * 10) / 10;
               const pastPaperHours = Math.round(hoursPerDay * 0.2 * 10) / 10;

               return (
                 <div className="space-y-6">
                   <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                     <div className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest mb-1">{profile.targetExam}</div>
                     <div className="text-2xl font-black text-white">{daysLeft} Days Left</div>
                     <div className="text-xs font-medium text-zinc-400 mt-2 leading-relaxed">
                       Dedicate <strong className="text-white">{hoursPerDay} hours daily</strong> to your test preparation. Here is your optimal split:
                     </div>
                   </div>

                   <div className="space-y-3">
                     <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                       <div className="text-[10px] font-black text-white uppercase tracking-widest">Subject Timeline</div>
                       <div className="text-xs text-zinc-400">
                         Divide your remaining {daysLeft} days into {Math.max(1, Math.floor(daysLeft / 3))} day blocks per core subject:
                         <ul className="list-disc pl-4 mt-1 space-y-0.5 text-white">
                           <li>Intelligence (Verbal/Non-Verbal)</li>
                           <li>Subject Specific (Academics)</li>
                           <li>General Knowledge & Current Affairs</li>
                         </ul>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                       <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                         <Target className="w-5 h-5 text-blue-400" />
                       </div>
                       <div>
                         <div className="text-sm font-bold text-white leading-tight">Practice Tests & Quizzes</div>
                         <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{practiceHours} hrs / day</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                       <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                         <BookOpen className="w-5 h-5 text-emerald-400" />
                       </div>
                       <div>
                         <div className="text-sm font-bold text-white leading-tight">Concept Reading (PDFs & Books)</div>
                         <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{conceptHours} hrs / day</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                       <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                         <Brain className="w-5 h-5 text-purple-400" />
                       </div>
                       <div>
                         <div className="text-sm font-bold text-white leading-tight">Past Papers & Deep Review</div>
                         <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{pastPaperHours} hrs / day</div>
                       </div>
                     </div>
                   </div>
                   
                   <button onClick={() => setView('quizzes')} className="w-full mt-2 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#c5a059] transition-all">
                     Start Practice Session
                   </button>
                 </div>
               );
            })()}
          </div>
        </div>
      </div>
    );
  };

  const NotesSection = () => {
    const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
    const [viewerMode, setViewerMode] = useState<'google' | 'native'>('google');

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
      <div className="flex flex-col h-[calc(100vh-80px)] -mx-8 -mb-12 overflow-hidden bg-[#0a0f1d] absolute inset-0 z-50">
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
      <div className="space-y-12 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center border border-[#c5a059]/20 shadow-2xl shadow-[#c5a059]/20">
              <BookOpen className="w-8 h-8 text-[#c5a059]" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white">GD (Pilot) Notes</h1>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1">Direct PDF Access v4.0</p>
            </div>
          </div>
          <button 
            onClick={() => setView('dashboard')}
            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Command
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {gdPilotNotes.length === 0 ? (
            <div className="col-span-full text-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 text-zinc-700">
              <FileText className="w-16 h-16 mx-auto mb-6 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em]">No data packets detected.</p>
            </div>
          ) : (
            gdPilotNotes.map((note, i) => (
              <div 
                key={i} 
                className="glass-panel border border-white/10 rounded-[2rem] p-8 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-2xl text-left"
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-2xl mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-black text-white tracking-tight text-xl mb-6 uppercase">{note.title}</h3>
                
                <div className="mt-auto w-full pt-6 border-t border-white/5 flex gap-3">
                  <button 
                    onClick={() => setSelectedPdfUrl(note.url)}
                    className="flex-1 py-3 bg-[#c5a059]/10 text-[#c5a059] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#c5a059] hover:text-black transition-all border border-[#c5a059]/20 flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" /> View Inline
                  </button>
                  <a 
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Open in new tab"
                    className="w-12 shrink-0 py-3 bg-white/5 text-white rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const allQuizzes = [
    ...biologyQuizzes,
    ...verbalIntelligenceQuizzes,
    ...biologyClass11Quizzes,
    ...physicsClass11Quizzes,
    ...physicsClass9Quizzes,
    ...basicMathQuizzes,
    ...physicsClass12Quizzes,
    ...physicsClass10Quizzes,
    ...biologyClass9Quizzes,
    ...biologyClass12Quizzes,
    ...urduGrammarQuizzes,
    ...generalKnowledgeQuizzes,
    ...islamicStudiesQuizzes,
    ...pakistanStudiesQuizzes,
    ...mathClass9Quizzes,
    ...mathClass10Quizzes,
    ...mathClass11Quizzes,
    ...mathClass12Quizzes,
    ...chemistryClass9Quizzes,
    ...chemistryClass10Quizzes,
    ...chemistryClass11Quizzes,
    ...chemistryClass12Quizzes,
    ...computerClass9Quizzes,
    ...computerClass10Quizzes,
    ...computerClass11Quizzes,
    ...computerClass12Quizzes,
    ...englishMcqsNotes,
    ...verbalIntelligenceQuizzes,
    ...nonVerbalIntelligenceQuizzes,
    ...urduGrammarQuizzes,
    ...islamicStudiesQuizzes,
    ...asfQuizzes,
    ...asfScienceQuizzes,
    ...mdcatLogicalQuizzes
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-white font-sans">
      <Sidebar activeView={view} setView={(v) => { setView(v); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="md:pl-72 min-h-screen flex flex-col">
        <TopBar 
          title={
            view === 'dashboard' ? 'Command Dashboard' : 
            view === 'live-classes' ? 'Live Lectures' : 
            view === 'student-notes' ? 'Student Contributed Notes' : 
            view === 'study-notes' ? 'Study Notes' : 
            view === 'library' ? 'Digital Library' : 
            view === 'news' ? 'News & Articles' : 
            view === 'classrooms' ? 'Academy Classrooms' : 
            view === 'admin' ? 'Admin Control Center' : 
            view.toUpperCase()
          } 
          onOpenProfile={() => setView('profile')} 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          notifications={notifications}
          unreadCount={unreadCount}
          markAsRead={markAsRead}
          markAllAsRead={markAllAsRead}
          onNavigateToView={(viewRoute) => setView(viewRoute)}
        />
        
        <div className="flex-1 p-4 md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && <DashboardOverview />}
              {view === 'library' && <DigitalLibrary />}
              {view === 'admin' && <AdminPanel />}
              {view === 'news' && <NewsAndArticles />}
              {view === 'live-classes' && <LiveClassesView />}
              {view === 'student-notes' && <StudentNotesTab />}
              {view === 'study-notes' && <StudyNotes />}
              {view === 'viewer' && <NotesSection />}
              {view === 'quizzes' &&
                <div id="quizzes-scroll-container" className="space-y-12 animate-in fade-in duration-500">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between flex-wrap gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center border border-[#c5a059]/20 shadow-xl shadow-[#c5a059]/20">
                        <ClipboardList className="w-6 h-6 text-[#c5a059]" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Practice Tests</h1>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1">Assessment Modules v4.0</p>
                      </div>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search tests..."
                        value={quizSearchQuery}
                        onChange={(e) => setQuizSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-[#c5a059]/50 transition-colors placeholder:text-zinc-500"
                      />
                    </div>
                  </div>

                  {activeQuizCategory === 'GD (Pilot)' && (
                    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent" />
                        <h2 className="text-sm font-black text-[#c5a059] uppercase tracking-[0.3em] flex items-center gap-2">
                           <Zap className="w-4 h-4 animate-pulse" /> GD (Pilot) Live Quiz Section
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent" />
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {/* English Card */}
                        <button 
                          onClick={() => navigate('/practice-test/english/notes')}
                          className="glass-panel border-2 border-[#c5a059]/30 rounded-[2.5rem] p-8 flex flex-col items-start group hover:border-[#c5a059] transition-all shadow-2xl text-left relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                          <div className="w-10 h-10 bg-[#c5a059]/10 rounded-xl flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                            <Zap className="w-4 h-4" />
                          </div>
                          <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">English Practice</h3>
                          <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Grammar Module</p>
                          <div className="flex flex-wrap gap-2 mb-10">
                            {[ '25 MCQs', 'Live Sync', 'PDF Based' ].map(tag => (
                              <div key={tag} className="px-3 py-1.5 rounded-lg bg-[#c5a059]/10 border border-[#c5a059]/20 text-[8px] font-black uppercase tracking-widest text-[#c5a059]">{tag}</div>
                            ))}
                          </div>
                          <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[10px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start Examination</span>
                            <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                              <Play className="w-4 h-4" />
                            </div>
                          </div>
                        </button>

                        {/* Physics 9-12 */}
                        {[9, 10, 11, 12].map(num => (
                          <button 
                            key={`phy-${num}`}
                            onClick={() => navigate(`/practice-test/physics/${num}`)}
                            className="glass-panel border-2 border-blue-500/30 rounded-[2.5rem] p-8 flex flex-col items-start group hover:border-blue-500 transition-all shadow-2xl text-left relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all mb-8">
                              <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="font-black text-white tracking-tight text-2xl group-hover:text-blue-400 transition-colors mb-2 uppercase">Physics {num}th</h3>
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">GD Pilot Practice Note</p>
                            <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest group-hover:text-white transition-colors">Start Examination</span>
                              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                <Play className="w-4 h-4" />
                              </div>
                            </div>
                          </button>
                        ))}

                        {/* Maths 9-12 */}
                        {[9, 10, 11, 12].map(num => (
                          <button 
                            key={`math-${num}`}
                            onClick={() => navigate(`/practice-test/mathematics/${num}`)}
                            className="glass-panel border-2 border-purple-500/30 rounded-[2.5rem] p-8 flex flex-col items-start group hover:border-purple-500 transition-all shadow-2xl text-left relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all mb-8">
                              <Target className="w-4 h-4" />
                            </div>
                            <h3 className="font-black text-white tracking-tight text-2xl group-hover:text-purple-400 transition-colors mb-2 uppercase">Mathematics {num}th</h3>
                            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">GD Pilot PDF Module</p>
                            <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                              <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest group-hover:text-white transition-colors">Start Examination</span>
                              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                <Play className="w-4 h-4" />
                              </div>
                            </div>
                          </button>
                        ))}

                        {/* Intelligence Hub */}
                        <button 
                          onClick={() => navigate('/practice-test/verbal/test')}
                          className="glass-panel border-2 border-red-500/30 rounded-[2.5rem] p-8 flex flex-col items-start group hover:border-red-500 transition-all shadow-2xl text-left relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all shadow-2xl mb-8">
                            <Brain className="w-4 h-4" />
                          </div>
                          <h3 className="font-black text-white tracking-tight text-2xl group-hover:text-red-400 transition-colors mb-2 uppercase">Intelligence Hub</h3>
                          <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Psychometric Assessments</p>
                          <div className="flex flex-wrap gap-2 mb-10">
                            {[ 'Verbal', 'Non-Verbal', 'Mental Math' ].map(tag => (
                              <div key={tag} className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[8px] font-black uppercase tracking-widest text-red-400">{tag}</div>
                            ))}
                          </div>
                          <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest group-hover:text-white transition-colors">Start Examination</span>
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500 group-hover:text-white transition-all">
                              <Play className="w-4 h-4" />
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeQuizCategory === 'All' &&
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Biology Section */}
                    <button 
                      onClick={() => navigate('/practice-test/biology/9')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Biology Class 9th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                     <button 
                      onClick={() => navigate('/practice-test/biology/10')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Biology Class 10th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                     <button 
                      onClick={() => navigate('/practice-test/biology/11')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Biology Class 11th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/biology/12')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Biology Class 12th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Physics Section */}
                    <button 
                      onClick={() => navigate('/practice-test/physics/9')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Physics Class 9th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/physics/10')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Physics Class 10th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/physics/11')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Physics Class 11th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/physics/12')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Physics Class 12th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Computer Science Section */}
                    <button 
                      onClick={() => navigate('/practice-test/computer/9')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Computer Class 9th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/computer/10')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Computer Class 10th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/computer/12')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Computer Class 12th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Mathematics Section */}
                    <button 
                      onClick={() => navigate('/practice-test/mathematics/9')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Mathematics Class 9th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/mathematics/10')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Mathematics Class 10th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/mathematics/11')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Mathematics Class 11th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/mathematics/12')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Mathematics Class 12th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* English Section */}
                    <button 
                      onClick={() => navigate('/practice-test/english/notes')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">English Mcqs Notes</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Grammar Practice</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Verbal Intelligence Section */}
                    <button 
                      onClick={() => navigate('/practice-test/verbal/test')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Verbal Intelligence test</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Logical Reasoning & Series</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Non-Verbal Intelligence Section */}
                    <button 
                      onClick={() => setShowNonVerbalSoon(true)}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-yellow-500/40 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(234,179,8,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-[7px] font-black uppercase tracking-widest text-[#c5a059]">Soon</div>
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Non-verbal intelligence test</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Pattern Recognition & Logic</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Uploading Soon</span>
                        <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Clock className="w-4 h-4 animate-pulse" />
                        </div>
                      </div>
                    </button>

                    {/* Urdu Grammar Section */}
                    <button 
                      onClick={() => navigate('/practice-test/urdu/test')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Urdu Grammar test</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Urdu Rules</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* Islamic Studies Section */}
                    <button 
                      onClick={() => navigate('/practice-test/islamic/test')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Islamic Studies test</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Faith, History & Practices</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* ASF Section */}
                    <button 
                      onClick={() => navigate('/practice-test/asf/test')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">ASF Related test</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Airport Security Force Prep</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* ASF Everyday Science Section */}
                    <button 
                      onClick={() => navigate('/practice-test/asf-science/test')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">ASF Everyday Science</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Everyday Science MCQs</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs (Live)</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    {/* MDCAT Logical Reasoning Section */}
                    <button 
                      onClick={() => navigate('/practice-test/mdcat-logical/test')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">MDCAT Logical Reasoning</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Logical Reasoning MCQs</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs (Live)</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">10 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => navigate('/practice-test/chemistry/9')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Chemistry Class 9th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/chemistry/10')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center border border-teal-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Chemistry Class 10th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/chemistry/11')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(132,204,22,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-lime-500/10 rounded-xl flex items-center justify-center border border-lime-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Chemistry Class 11th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>

                    <button 
                      onClick={() => navigate('/practice-test/chemistry/12')}
                      className="glass-panel border border-white/10 rounded-2xl lg:rounded-3xl p-4 lg:p-5 flex flex-col items-start group hover:border-[#c5a059]/50 transition-all shadow-xl text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
                      <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all shadow-xl mb-4">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h3 className="font-black text-white tracking-tight text-sm lg:text-base group-hover:text-[#c5a059] transition-colors mb-2 uppercase">Chemistry Class 12th</h3>
                      <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-4 line-clamp-1">Comprehensive Practice Test</p>
                      <div className="flex flex-wrap gap-2 mb-5">
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">25 MCQs</div>
                        <div className="px-1 md:px-2 py-1 rounded-md text-center bg-white/5 border border-white/10 text-[7px] md:text-[8px] font-black uppercase tracking-widest text-zinc-400 truncate">5 Minutes</div>
                      </div>
                      <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-white/5">
                        <span className="text-[9px] font-black text-[#c5a059] uppercase tracking-widest group-hover:text-white transition-colors">Start</span>
                        <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center border border-[#c5a059]/20 group-hover:bg-[#c5a059] group-hover:text-black transition-all hidden sm:flex">
                          <Play className="w-4 h-4" />
                        </div>
                      </div>
                    </button>
                  </div>
                }
              </div>
            }
          {view === 'classrooms' && (
            <ClassroomView onActiveChatChange={setActiveClassroomChatId} />
          )}
              {view === 'profile' && <ProfileSection />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {view !== 'classrooms' && <SupportWidget />}

      {/* Non-Verbal Soon Modal Overlay */}
      <AnimatePresence>
        {showNonVerbalSoon && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a0f1d]/85 backdrop-blur-md"
              onClick={() => setShowNonVerbalSoon(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative bg-[#0d1527] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-center z-10"
            >
              <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center border border-yellow-500/20 shadow-xl mx-auto mb-6">
                <Clock className="w-8 h-8 text-[#c5a059] animate-pulse" />
              </div>
              
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-4">
                Coming Soon
              </h3>
              
              <p className="text-xs text-zinc-400 mb-8 font-medium leading-relaxed">
                The Non-Verbal Intelligence Test is currently in working and will be uploaded soon. Thank you for your patience!
              </p>

              <button
                type="button"
                onClick={() => setShowNonVerbalSoon(false)}
                className="w-full py-4 bg-gradient-to-r from-[#c5a059] to-[#dfba73] hover:from-[#d1ab64] hover:to-[#e8c67e] text-black font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-[#c5a059]/10 active:scale-[0.98] transition-all cursor-pointer"
              >
                Understand
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

