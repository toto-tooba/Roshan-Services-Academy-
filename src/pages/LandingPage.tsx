import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Target, 
  Trophy, 
  BookOpen, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Star,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Flag,
  Medal,
  Clock,
  FileText,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { SupportWidget } from '../components/SupportWidget';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../services/databaseService';

const REVIEWS = [
  {
    name: "Ahmed Murad",
    role: "Navy Cadet",
    text: "The intelligence test preparation here is unmatched. I cleared my initial tests with ease thanks to the simulation environment.",
    image: "https://i.postimg.cc/dV5RfSGJ/4a009630-e20b-4577-8a36-7190d638559a.jpg"
  },
  {
    name: "Sana Malik",
    role: "MDCAT Aspirant",
    text: "The biology and chemistry notes are so well-structured. It's the best community for MDCAT preparation in Pakistan.",
    image: "https://picsum.photos/seed/student2/100/100"
  },
  {
    name: "Zubair Khan",
    role: "PAF GD Pilot Candidate",
    text: "Expert guidance from retired officers helped me understand the psychological evaluation process perfectly.",
    image: "https://picsum.photos/seed/student3/100/100"
  },
  {
    name: "Ayesha Tariq",
    role: "AFNS Aspirant",
    text: "The past papers and MCQs bank was exactly what I needed. Helped me identify my weak points quickly.",
    image: "https://picsum.photos/seed/student4/100/100"
  },
  {
    name: "Usman Raza",
    role: "Navy Cadet",
    text: "I was struggling with non-verbal intelligence, but their structured online test sessions improved my speed dramatically.",
    image: "https://picsum.photos/seed/student5/100/100"
  }
];

export const LandingPage: React.FC = () => {
  const { user, isAuthorized, loading } = useAuth();
  const navigate = useNavigate();

  const featuresScrollRef = useRef<HTMLDivElement>(null);
  const isHoveringFeatures = useRef(false);
  const reviewsScrollRef = useRef<HTMLDivElement>(null);
  const isHoveringReviews = useRef(false);

  const [reviewsList, setReviewsList] = useState<any[]>(REVIEWS);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('sequence', 'asc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReviewsList(fetched);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'testimonials');
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const handleAutoScroll = (ref: React.RefObject<HTMLDivElement>, isHovering: React.MutableRefObject<boolean>) => {
      if (ref.current && !isHovering.current) {
        const container = ref.current;
        const scrollLeft = container.scrollLeft;
        const scrollWidth = container.scrollWidth;
        const clientWidth = container.clientWidth;
        
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: clientWidth, behavior: 'smooth' });
        }
      }
    };

    const featureInterval = setInterval(() => handleAutoScroll(featuresScrollRef, isHoveringFeatures), 5000);
    const reviewInterval = setInterval(() => handleAutoScroll(reviewsScrollRef, isHoveringReviews), 6000);

    return () => {
      clearInterval(featureInterval);
      clearInterval(reviewInterval);
    };
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const container = ref.current;
      const clientWidth = container.clientWidth;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white font-sans selection:bg-gold-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-16 min-w-[56px] sm:min-w-[64px] flex items-center">
              <img 
                src="https://i.postimg.cc/8z3yqYyF/Gemini-Generated-Image-5ikwfq5ikwfq5ikw-removebg-preview(3).png" 
                alt="Roshan Services Academy" 
                className="h-full w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-base sm:text-lg leading-none tracking-tighter">ROSHAN</span>
              <span className="text-[7px] sm:text-[8px] font-black text-[#c5a059] tracking-[0.4em] uppercase mt-1">Services Academy</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#exam-prep" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Exam Prep</a>
            <a href="#success-stories" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Success Stories</a>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Link to="/login" className="text-xs sm:text-sm font-bold text-zinc-400 hover:text-white transition-colors whitespace-nowrap">Sign In</Link>
            <Link 
              to="/payment" 
              className="px-4 py-2 sm:px-6 sm:py-2.5 bg-[#c5a059] text-black text-xs sm:text-sm font-black rounded-xl hover:bg-[#d4b16a] transition-all uppercase tracking-wider shadow-lg shadow-[#c5a059]/20 whitespace-nowrap"
            >
              Join Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-24 overflow-hidden perspective-[2000px]">
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] md:w-[1000px] h-[600px] bg-[#c5a059]/10 blur-[120px] rounded-full" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 right-0 w-[400px] md:w-[600px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                {/* Mobile graphic accents removed */}

                <div className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full bg-white/5 border border-white/10 mb-4 lg:mb-8 mt-4 md:mt-0 backdrop-blur-sm relative z-10">
                  <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4 text-[#c5a059]" />
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Official Academy Portal</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.5rem] font-black leading-[1.05] tracking-tighter mb-6 lg:mb-8 relative z-10 block">
                  <span className="block mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Prepare Smarter</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c5a059] to-[#d4b16a] inline-block mb-1">
                    for Armed Forces
                  </span>
                  <br className="hidden md:block" />
                  <span className="text-white relative inline-block mt-1 md:mt-0">
                    <span className="text-zinc-500 mr-2 md:mr-3">&</span>Academic Entry Tests
                  </span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-zinc-400 font-medium mb-8 lg:mb-10 leading-relaxed max-w-2xl relative z-10 mt-4 md:mt-0">
                  Get complete preparation with expert-guided notes, structured study material, and a supportive student community. From GD (Pilot) and PMA Long Course to MDCAT, ECAT, and LAT — we help you succeed with clarity, strategy, and confidence.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 relative z-10">
                  <Link 
                    to="/payment" 
                    className="group px-6 sm:px-8 lg:px-10 py-3.5 sm:py-4 lg:py-5 bg-[#c5a059] text-black text-sm sm:text-base lg:text-lg font-black rounded-2xl hover:bg-[#d4b16a] hover:scale-[1.02] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-[#c5a059]/20"
                  >
                    Enroll Now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-6 sm:px-8 lg:px-10 py-3.5 sm:py-4 lg:py-5 bg-white/5 border border-white/10 text-white text-sm sm:text-base lg:text-lg font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                  >
                    View Courses
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
              className="relative mt-8 md:mt-0 group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-[#060a14]/80 via-transparent to-transparent z-10 rounded-[2.5rem] pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
              <div className="absolute inset-0 bg-[#c5a059]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 rounded-[2.5rem] pointer-events-none mix-blend-overlay" />
              
              <div className="overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl relative">
                <motion.img 
                  src="https://i.postimg.cc/k4BfXyMc/449eab82-4e1e-4d8e-9ed1-573485aa499e.jpg" 
                  alt="Academy preparation" 
                  className="w-full h-[400px] md:h-[600px] object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Floating element 1 */}
              <motion.div 
                animate={{ y: [0, -15, 0], opacity: [0.9, 1, 0.9] }}
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
                className="absolute top-10 sm:top-10 -left-8 sm:-left-10 bg-[#0a0f1d]/80 backdrop-blur-xl p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-20 cursor-default"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Success Rate</p>
                    <p className="text-sm sm:text-2xl font-black text-white">94%</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating element 2 */}
              <motion.div 
                animate={{ y: [0, 15, 0], opacity: [0.9, 1, 0.9] }}
                whileHover={{ scale: 1.05 }}
                transition={{ 
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
                  opacity: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 },
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
                className="absolute bottom-12 sm:bottom-20 -right-8 sm:-right-10 bg-[#0a0f1d]/80 backdrop-blur-xl p-3 sm:p-6 rounded-2xl sm:rounded-3xl border border-[#c5a059]/40 shadow-[0_8px_32px_rgba(197,160,89,0.15)] z-20 cursor-default"
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[#c5a059]/20 flex items-center justify-center">
                    <Medal className="w-4 h-4 sm:w-6 sm:h-6 text-[#c5a059]" />
                  </div>
                  <div>
                    <p className="text-[7px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Expertise</p>
                    <p className="text-sm sm:text-2xl font-black text-white">20+ Years</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Years Experience", value: "20+", icon: Medal },
              { label: "Success Rate", value: "94%", icon: Trophy },
              { label: "Practice Tests", value: "50+", icon: Target },
              { label: "MCQs Available", value: "10k+", icon: FileText },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-5 h-5 text-[#c5a059]" />
                </div>
                <div className="text-2xl font-black mb-1">{stat.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black mb-6 tracking-tight uppercase">Elite Training Features</h2>
            <p className="text-zinc-400 font-medium">Precision-engineered tools to ensure your success in the most competitive selection processes.</p>
          </div>

          <div className="relative px-4 md:px-12">
            {/* Navigation Buttons for Desktop */}
            <div className="hidden md:block">
              <button 
                onClick={() => scroll(featuresScrollRef, 'left')}
                className="absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 p-3 lg:p-4 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all z-30 backdrop-blur-md shadow-2xl"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <button 
                onClick={() => scroll(featuresScrollRef, 'right')}
                className="absolute -right-4 lg:-right-8 top-1/2 -translate-y-1/2 p-3 lg:p-4 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all z-30 backdrop-blur-md shadow-2xl"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>

            <div 
              ref={featuresScrollRef}
              onMouseEnter={() => { isHoveringFeatures.current = true; }}
              onMouseLeave={() => { isHoveringFeatures.current = false; }}
              onTouchStart={() => { isHoveringFeatures.current = true; }}
              onTouchEnd={() => { isHoveringFeatures.current = false; }}
              className="flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-8 md:py-8 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch"
            >
            {[
              {
                title: "Intelligence Mastery",
                desc: "Verbal and non-verbal intelligence tests designed to sharpen your cognitive speed and accuracy.",
                icon: Target,
                color: "blue"
              },
              {
                title: "Academic Excellence",
                desc: "Comprehensive study materials for Physics, Biology, Chemistry, and Mathematics tailored to exam patterns.",
                icon: BookOpen,
                color: "gold"
              },
              {
                title: "Real-time Simulation",
                desc: "Experience the actual exam environment with timed practice tests and instant performance feedback.",
                icon: Clock,
                color: "purple"
              },
              {
                title: "Progress Tracking",
                desc: "Detailed analytics of your performance across different subjects to identify and strengthen weak areas.",
                icon: Medal,
                color: "pink"
              },
              {
                title: "Community Support",
                desc: "Interactive discussion boards to connect with fellow aspirants and share preparation strategies.",
                icon: Users,
                color: "green"
              },
              {
                title: "Expert Guidance",
                desc: "Curated notes and tips from retired officers and subject matter experts in military selection.",
                icon: ShieldCheck,
                color: "emerald"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group flex-shrink-0 w-[85vw] md:w-[320px] lg:w-[380px] snap-center flex flex-col p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-[#c5a059] hover:bg-[#c5a059]/[0.02] hover:shadow-[0_8px_32px_rgba(197,160,89,0.1)] transition-all duration-300 backdrop-blur-sm"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#c5a059]/10 group-hover:border-[#c5a059]/30 transition-all duration-500">
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-[#c5a059]" />
                </div>
                <h3 className="text-lg md:text-2xl font-black mb-3 uppercase tracking-tight leading-tight">{feature.title}</h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium mt-auto">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
          </div>
        </div>
      </section>

      {/* Exam Prep Section */}
      <section id="exam-prep" className="py-32 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative order-first md:order-none group"
            >
              <div className="overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl relative">
                <motion.img 
                  src="https://i.postimg.cc/dV5RfSGJ/4a009630-e20b-4577-8a36-7190d638559a.jpg" 
                  alt="University students walking" 
                  className="w-full h-[300px] md:h-[500px] object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent opacity-80 pointer-events-none"></div>
              </div>
            </motion.div>

            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight uppercase">Specialized Preparation for Every Branch</h2>
              <p className="text-zinc-400 font-medium mb-12 text-lg">We provide highly targeted and regularly updated curriculum to ensure you are battle-ready for the actual exam.</p>
              
              <div className="grid sm:grid-cols-1 gap-4 text-left">
                {[
                  "PMA Long Course & Technical Cadet Scheme",
                  "PAF GD Pilot, Engineering & Air Defense",
                  "Pakistan Navy Cadet & Short Service Commission",
                  "AFNS (Armed Forces Nursing Service)",
                  "ASF, Rangers & Police Recruitment Tests",
                  "MDCAT, LAT and E-CAT Tests Preparation"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#c5a059]/30 hover:bg-white/10 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-[#c5a059]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#c5a059]" />
                    </div>
                    <span className="font-bold text-sm text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-3 mt-12 text-[#c5a059] font-black uppercase tracking-widest hover:gap-5 transition-all bg-white/5 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10"
              >
                Explore All Courses <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="success-stories" className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black mb-6 tracking-tight uppercase">Student Success Stories</h2>
            <p className="text-zinc-400 font-medium">Hear from the thousands of students who have forged their future with Roshan Services Academy.</p>
          </div>

          <div className="relative px-4 md:px-12">
            {/* Navigation Buttons for Desktop */}
            <div className="hidden md:block">
              <button 
                onClick={() => scroll(reviewsScrollRef, 'left')}
                className="absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 p-3 lg:p-4 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all z-30 backdrop-blur-md shadow-2xl"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <button 
                onClick={() => scroll(reviewsScrollRef, 'right')}
                className="absolute -right-4 lg:-right-8 top-1/2 -translate-y-1/2 p-3 lg:p-4 rounded-full bg-zinc-900/80 border border-white/20 text-white hover:bg-[#c5a059] hover:text-black hover:border-[#c5a059] transition-all z-30 backdrop-blur-md shadow-2xl"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
            </div>

            <div 
              ref={reviewsScrollRef}
              onMouseEnter={() => { isHoveringReviews.current = true; }}
              onMouseLeave={() => { isHoveringReviews.current = false; }}
              onTouchStart={() => { isHoveringReviews.current = true; }}
              onTouchEnd={() => { isHoveringReviews.current = false; }}
              className="flex gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-8 md:py-8 -mx-6 px-6 md:mx-0 md:px-0 scroll-smooth items-stretch"
            >
              {/* Ensure we have a repeat of items for visual horizontal wrap around scroll */}
              {(reviewsList.length < 3 ? [...reviewsList, ...reviewsList, ...reviewsList] : [...reviewsList, ...reviewsList]).map((review, i) => (
                <div key={i} className="group flex-shrink-0 w-[85vw] md:w-[400px] aspect-square snap-center flex flex-col p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-[#c5a059] hover:bg-[#c5a059]/[0.02] hover:shadow-[0_8px_32px_rgba(197,160,89,0.1)] transition-all duration-300 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col h-full"
                  >
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-[#c5a059]/20 flex shrink-0">
                        <img 
                          src={review.image || `https://picsum.photos/seed/${encodeURIComponent(review.name || 'avatar')}/100/100`} 
                          alt={review.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h4 className="font-black text-white text-sm md:text-base uppercase tracking-tight truncate">{review.name}</h4>
                        <p className="text-[#c5a059] text-[10px] md:text-xs font-black uppercase tracking-widest truncate">{review.role}</p>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-medium italic text-center md:text-left mt-auto">"{review.text}"</p>
                    <div className="mt-6 flex gap-1 justify-center md:justify-start">
                      {[...Array(typeof review.stars === 'number' ? review.stars : 5)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 md:w-4 md:h-4 fill-[#c5a059] text-[#c5a059]" />
                      ))}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#c5a059] to-[#d4b16a] p-8 md:p-12 text-center overflow-hidden shadow-2xl shadow-[#c5a059]/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-3xl rounded-full -ml-32 -mb-32" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-black mb-4 tracking-tighter uppercase">Ready to Serve?</h2>
              <p className="text-black/70 text-base md:text-lg font-bold mb-8 max-w-2xl mx-auto">
                Join thousands of successful candidates who started their journey with Roshan Academy. 
                Your commission starts here.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4">
                <Link 
                  to="/payment" 
                  className="w-full sm:w-auto px-8 py-4 bg-black text-white text-base md:text-lg font-black rounded-xl hover:bg-zinc-900 hover:scale-105 transition-all uppercase tracking-widest shadow-2xl"
                >
                  Enroll Now
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto px-8 py-4 bg-white/20 backdrop-blur-md text-black text-base md:text-lg font-black rounded-xl hover:bg-white/30 transition-all uppercase tracking-widest border border-white/20"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-20">
            <div className="col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-12 min-w-[48px] flex items-center">
                  <img 
                    src="https://i.postimg.cc/8z3yqYyF/Gemini-Generated-Image-5ikwfq5ikwfq5ikw-removebg-preview(3).png" 
                    alt="Roshan Services Academy" 
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-white text-base leading-none tracking-tighter">ROSHAN</span>
                  <span className="text-[7px] font-black text-[#c5a059] tracking-[0.4em] uppercase mt-1">Services Academy</span>
                </div>
              </div>
              
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">About Us</h4>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed mb-6">
                We have been working for 20+ years helping hundreds of students to ace their exams. Our teaching methodology is recognized as the best, providing precision-guided preparation for future leaders.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">Courses</h4>
              <ul className="space-y-2 text-xs font-bold text-zinc-500 mb-8">
                <li>GDP & AFNS</li>
                <li>PMA Long Course</li>
                <li>PN Cadet & Sailor</li>
                <li>ASF & Rangers</li>
                <li>Punjab Police</li>
                <li>MDCAT, LAT & E-CAT</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8">Privacy Policy</h4>
              <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                All content on this website is protected by copyright. Piracy or unauthorized distribution of study materials is strictly prohibited and protected by law.
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              © 2026 Roshan Services Academy. All Rights Reserved.
            </p>
            <div className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <ShieldCheck className="w-4 h-4" /> Secure Platform
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <Flag className="w-4 h-4" /> Made in Pakistan
              </span>
            </div>
          </div>
        </div>
      </footer>
      <SupportWidget />
    </div>
  );
};
