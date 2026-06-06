import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  Clock, 
  Target, 
  ChevronRight, 
  Loader2, 
  X,
  ClipboardList,
  LineChart,
  Medal,
  Flag,
  Beaker,
  Search
} from 'lucide-react';
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

interface Question {
  q: string;
  options: string[];
  correct: number;
}

interface Quiz {
  id?: string;
  subject?: string;
  exercise?: string;
  topic?: string;
  questions?: Question[];
}

export const QuizSection = ({ quizzes, onBack }: { quizzes: Quiz[], onBack: () => void }) => {
  const { user } = useAuth();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizzes;
    return quizzes.filter(quiz => {
      const title = (quiz.subject || quiz.exercise || quiz.topic || '').toLowerCase();
      return title.includes(searchQuery.toLowerCase());
    });
  }, [quizzes, searchQuery]);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === selectedQuiz?.questions?.[currentQuestion].correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 < (selectedQuiz?.questions?.length || 0)) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      saveResult();
    }
  };

  const saveResult = async () => {
    setIsSaving(true);
    if (user && selectedQuiz) {
      try {
        await addDoc(collection(db, 'quiz_results'), {
          userId: user.uid,
          subject: selectedQuiz.subject || selectedQuiz.exercise || selectedQuiz.topic || 'Unknown',
          score: Math.round((score / (selectedQuiz.questions?.length || 1)) * 100),
          totalQuestions: selectedQuiz.questions?.length,
          correctAnswers: score,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error('Error saving result:', err);
      }
    }
    setShowResult(true);
    setIsSaving(false);
  };

  if (selectedQuiz) {
    if (showResult) {
      const percentage = Math.round((score / (selectedQuiz.questions?.length || 1)) * 100);
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto glass-panel p-12 rounded-[3rem] border border-white/10 shadow-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#c5a059] via-blue-500 to-[#c5a059]" />
          
          <div className="w-24 h-24 bg-[#c5a059]/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-[#c5a059]/20 shadow-2xl shadow-[#c5a059]/20">
            <Trophy className="w-12 h-12 text-[#c5a059]" />
          </div>
          
          <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-white">Mission Complete</h2>
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-10">Neural Evaluation Finalized</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="text-3xl font-black text-white mb-1">{percentage}%</div>
              <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Accuracy Rating</div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
              <div className="text-3xl font-black text-white mb-1">{score} / {selectedQuiz.questions?.length}</div>
              <div className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Correct Protocols</div>
            </div>
          </div>

          <button 
            onClick={() => {
              setSelectedQuiz(null);
              setShowResult(false);
              setScore(0);
              setCurrentQuestion(0);
              setIsAnswered(false);
              setSelectedOption(null);
            }}
            className="w-full bg-[#c5a059] text-black py-5 rounded-2xl font-black text-lg hover:bg-[#d4b16a] hover:scale-[1.02] transition-all uppercase tracking-widest shadow-2xl shadow-[#c5a059]/20"
          >
            Return to Base
          </button>
        </motion.div>
      );
    }

    const question = selectedQuiz.questions?.[currentQuestion];
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedQuiz(null)}
            className="flex items-center gap-3 text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Abort Mission
          </button>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              Protocol {currentQuestion + 1} of {selectedQuiz.questions?.length}
            </div>
            <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / (selectedQuiz.questions?.length || 1)) * 100}%` }}
                className="h-full bg-[#c5a059]"
              />
            </div>
          </div>
        </div>

        <motion.div 
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-12 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-[#c5a059]" />
          <h3 className="text-2xl font-black text-white leading-tight mb-12 tracking-tight">{question?.q}</h3>
          
          <div className="space-y-4">
            {question?.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleOptionSelect(i)}
                disabled={isAnswered}
                className={cn(
                  "w-full p-6 rounded-2xl text-left font-bold transition-all border flex items-center justify-between group",
                  isAnswered 
                    ? i === question.correct 
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                      : i === selectedOption 
                        ? "bg-red-500/10 border-red-500/50 text-red-400" 
                        : "bg-white/5 border-white/5 text-zinc-600"
                    : "bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:border-white/20 hover:text-white"
                )}
              >
                <span className="flex items-center gap-4">
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border transition-colors",
                    isAnswered 
                      ? i === question.correct 
                        ? "bg-emerald-500/20 border-emerald-500/50" 
                        : i === selectedOption 
                          ? "bg-red-500/20 border-red-500/50" 
                          : "bg-white/5 border-white/10"
                      : "bg-white/5 border-white/10 group-hover:border-[#c5a059]/50 group-hover:text-[#c5a059]"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </span>
                {isAnswered && i === question.correct && <CheckCircle2 className="w-5 h-5" />}
                {isAnswered && i === selectedOption && i !== question.correct && <AlertCircle className="w-5 h-5" />}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={nextQuestion}
                disabled={isSaving}
                className="w-full mt-10 bg-white text-black py-5 rounded-2xl font-black text-lg hover:bg-[#c5a059] hover:scale-[1.02] transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-white/10"
              >
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    {currentQuestion + 1 === selectedQuiz.questions?.length ? 'Finalize Mission' : 'Next Protocol'}
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#c5a059]/10 rounded-2xl flex items-center justify-center border border-[#c5a059]/20 shadow-2xl shadow-[#c5a059]/20">
            <ClipboardList className="w-8 h-8 text-[#c5a059]" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Practice Tests</h1>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] mt-1">Neural Simulation v4.0</p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search protocols..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-[#c5a059]/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full py-20 text-center text-zinc-500">
            No active protocols matching your parameters.
          </div>
        ) : (
          filteredQuizzes.map((quiz, i) => (
            <button
              key={i}
              onClick={() => setSelectedQuiz(quiz)}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/10 text-left hover:border-[#c5a059]/50 transition-all group relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-[radial-gradient(circle_at_top_right,rgba(197,160,89,0.15),transparent_70%)] rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Beaker className="w-6 h-6 text-[#c5a059]" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-[#c5a059] transition-colors">
              {quiz.subject || quiz.exercise || quiz.topic}
            </h3>
            <div className="flex items-center gap-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Target className="w-3 h-3" /> {quiz.questions?.length} Questions</span>
              <span className="w-1 h-1 bg-zinc-800 rounded-full" />
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> 15 Mins</span>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-white transition-colors">Begin Protocol</span>
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-[#c5a059] group-hover:text-black transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        )))}
      </div>
    </div>
  );
};
