import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Key, 
  AlertCircle, 
  Loader2, 
  Lock, 
  Chrome, 
  Hash, 
  GraduationCap, 
  MapPin, 
  ArrowLeft, 
  Mail, 
  User, 
  Eye, 
  EyeOff,
  ChevronRight,
  ArrowRight,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export const LoginPage: React.FC<{ isSignUp?: boolean }> = ({ isSignUp: initialIsSignUp = false }) => {
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, profile, isAuthorized, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } = useAuth();
  
  const [showActivationNotice, setShowActivationNotice] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const redirectPath = queryParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (user && !authLoading && !isAuthorized) {
      setShowActivationNotice(true);
    } else if (user && isAuthorized && !authLoading) {
      navigate(redirectPath);
    }
  }, [user, isAuthorized, authLoading, navigate, redirectPath]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate(redirectPath);
    } catch (err: any) {
      const msg = (err?.message || err?.code || '').toLowerCase();
      if (
        msg.includes('blocked') || 
        msg.includes('cancelled') ||
        msg.includes('assertion') ||
        msg.includes('promise') ||
        msg.includes('closed') ||
        msg.includes('iframe')
      ) {
        setError('IFRAME_POPUP_BLOCKED');
      } else {
        setError(err?.message || 'Google Sign-In failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          throw new Error('Please fill in all fields');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        await signUpWithEmail(email, password, name);
      } else {
        if (!email || !password) {
          throw new Error('Please fill in all fields');
        }
        await signInWithEmail(email, password);
      }
      navigate(redirectPath);
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err.message || '';
      if (msg.includes('operation-not-allowed') || msg.includes('auth/operation-not-allowed')) {
        setError('Email/Password sign-in/up is disabled. Please click "Continue with Google" above to access your account instantly!');
      } else {
        setError(msg || 'Authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0f1d] flex items-center justify-center p-4 py-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c5a059]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full relative z-10"
      >
        <AnimatePresence>
          {showActivationNotice && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute inset-0 z-[100] bg-[#0a0f1d] p-8 flex flex-col items-center justify-center text-center rounded-[2rem] border border-[#c5a059]/20 shadow-2xl"
            >
              <div className="w-20 h-20 bg-[#c5a059]/10 rounded-full flex items-center justify-center mb-8">
                <ShieldCheck className="w-10 h-10 text-[#c5a059]" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Activation Required</h2>
              <p className="text-zinc-400 text-sm font-medium mb-8">
                Your account is registered but not yet activated. Please complete the enrollment process to access premium features.
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Link
                  to="/payment"
                  className="w-full py-4 bg-[#c5a059] text-black font-black rounded-xl hover:bg-[#d4b16a] transition-all uppercase tracking-widest text-xs"
                >
                  Go to Payment Portal
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setShowActivationNotice(false);
                  }}
                  className="w-full py-4 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass-panel rounded-[2rem] shadow-2xl border border-white/10 overflow-hidden">
          <div className="bg-gradient-to-br from-[#0a0f1d] to-[#1a2540] p-6 lg:p-8 text-center border-b border-white/5 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent" />
            
            <Link to="/" className="inline-block mb-4 group">
              <div className="flex flex-col items-center gap-3">
                <div className="h-16 lg:h-20 min-w-[64px] flex items-center group-hover:scale-105 transition-transform duration-500">
                  <img 
                    src="https://i.postimg.cc/8z3yqYyF/Gemini-Generated-Image-5ikwfq5ikwfq5ikw-removebg-preview(3).png" 
                    alt="Roshan Services Academy" 
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-black text-white text-xl leading-none tracking-tighter">ROSHAN</span>
                  <span className="text-[8px] font-black text-[#c5a059] tracking-[0.5em] uppercase mt-1.5">Services Academy</span>
                </div>
              </div>
            </Link>
            
            <h1 className="text-2xl font-black tracking-tighter uppercase text-white leading-none">
              {isSignUp ? 'Recruit Enrollment' : 'Officer Login'}
            </h1>
            <p className="text-[#c5a059] text-[9px] font-black uppercase tracking-[0.4em] mt-2">
              Roshan Academy Command Center
            </p>
          </div>

          <div className="p-6 lg:p-8 space-y-6">
            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-3 rounded-xl font-black text-[9px] text-white uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Chrome className="w-4 h-4 text-[#c5a059]" />
                    Continue with Google
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative px-3 bg-[#0a0f1d] text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                  Or Secure Protocol
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="FULL NAME"
                      className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-zinc-700"
                      disabled={isLoading}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-zinc-700"
                  disabled={isLoading}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-zinc-500" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SECURE PASSWORD"
                  className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#c5a059] transition-all placeholder:text-zinc-700"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error === 'IFRAME_POPUP_BLOCKED' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 text-left font-sans"
                >
                  <div className="flex items-center gap-2.5 text-amber-500">
                    <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider text-left">Google Login Blocked</h4>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-semibold">
                    Browser security policies block Google pop-ups inside sandboxed frames. Please open the app in a **New Tab** using the link button below to log in, or input your Email and Password directly.
                  </p>
                  <div className="pt-1 flex gap-2">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[#c5a059] text-black font-black text-[9px] uppercase tracking-widest rounded-lg hover:bg-amber-600 transition-all flex items-center gap-1.5 inline-flex"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open in New Tab
                    </a>
                    <button
                      type="button"
                      onClick={() => setError('')}
                      className="px-3 py-2 bg-white/5 border border-white/10 text-zinc-400 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all"
                    >
                      Okay
                    </button>
                  </div>
                </motion.div>
              ) : error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[9px] font-black uppercase tracking-widest"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#c5a059] text-black py-3 rounded-xl font-black text-sm lg:text-base hover:bg-[#d4b16a] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest shadow-2xl shadow-[#c5a059]/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {isSignUp ? 'Enroll Now' : 'Authorize Login'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-5 border-t border-white/5 text-center space-y-4">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                {isSignUp ? 'Already an officer?' : 'New recruit?'}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="ml-1 text-[#c5a059] hover:underline"
                >
                  {isSignUp ? 'Sign In Here' : 'Enroll Today'}
                </button>
              </p>
              
              <Link to="/" className="inline-flex items-center gap-1.5 text-[9px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Base
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

