import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Play, 
  Eye, 
  Trophy,
  XCircle,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { biologyClass9Quizzes } from '../../biology_class_9_quizzes';
import { biologyClass10Quizzes } from '../../biology_class_10_quizzes';
import { biologyClass11Quizzes } from '../../biology_class_11_quizzes';
import { biologyClass12Quizzes } from '../../biology_class_12_quizzes';
import { physicsClass9Quizzes } from '../../physics_class_9_quizzes';
import { physicsClass10Quizzes } from '../../physics_class_10_quizzes';
import { physicsClass11Quizzes } from '../../physics_class_11_quizzes';
import { physicsClass12Quizzes } from '../../physics_class_12_quizzes';
import { computerClass9Quizzes } from '../../computer_class_9_quizzes';
import { computerClass10Quizzes } from '../../computer_class_10_quizzes';
import { computerClass11Quizzes } from '../../computer_class_11_quizzes';
import { computerClass12Quizzes } from '../../computer_class_12_quizzes';
import { mathClass9Quizzes } from '../../math_class_9_quizzes';
import { mathClass10Quizzes } from '../../math_class_10_quizzes';
import { mathClass11Quizzes } from '../../math_class_11_quizzes';
import { mathClass12Quizzes } from '../../math_class_12_quizzes';
import { chemistryClass9Quizzes } from '../../chemistry_class_9_quizzes';
import { chemistryClass10Quizzes } from '../../chemistry_class_10_quizzes';
import { chemistryClass11Quizzes } from '../../chemistry_class_11_quizzes';
import { chemistryClass12Quizzes } from '../../chemistry_class_12_quizzes';
import { englishMcqsNotes } from '../../english_mcqs_notes';
import { basicMathQuizzes } from '../../basic_math_quizzes';
import { pakistanStudiesQuizzes } from '../../pakistan_studies_quizzes';
import { verbalIntelligenceQuizzes } from '../../verbal_intelligence_quizzes';
import { nonVerbalIntelligenceQuizzes } from '../../non_verbal_intelligence_quizzes';
import { urduGrammarQuizzes } from '../../urdu_grammar_quizzes';
import { islamicStudiesQuizzes } from '../../islamic_studies_quizzes';
import { generalKnowledgeQuizzes } from '../../general_knowledge_quizzes';
import { asfQuizzes } from '../../asf_quizzes';
import { asfScienceQuizzes } from '../../asf_science_quizzes';
import { mdcatLogicalQuizzes } from '../../mdcat_logical_quizzes';

type QuizMode = 'STUDY' | 'EXAM';

interface Question {
  q: string;
  options: string[];
  correct: number;
  image?: string;
}

export const PracticeTest: React.FC = () => {
  const navigate = useNavigate();
  const { subject, classId } = useParams<{ subject: string; classId: string }>();
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [hasSavedResult, setHasSavedResult] = useState(false);
  const [reviewedIndices, setReviewedIndices] = useState<number[]>([]);
  const { user } = useAuth();

  const toggleReview = (index: number) => {
    setReviewedIndices(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const startQuiz = useCallback((selectedMode: QuizMode) => {
    // Determine which quiz set to use
    let quizSet = biologyClass9Quizzes;
    const storageKey = `seen_questions_${subject}_${classId || 'test'}`;
    const seenIds = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (subject === 'biology') {
      if (classId === '10') quizSet = biologyClass10Quizzes;
      else if (classId === '11') quizSet = biologyClass11Quizzes;
      else if (classId === '12') quizSet = biologyClass12Quizzes;
      else quizSet = biologyClass9Quizzes;
    } else if (subject === 'physics') {
      if (classId === '9') quizSet = physicsClass9Quizzes;
      else if (classId === '10') quizSet = physicsClass10Quizzes;
      else if (classId === '11') quizSet = physicsClass11Quizzes;
      else if (classId === '12') quizSet = physicsClass12Quizzes;
      else quizSet = physicsClass9Quizzes;
    } else if (subject === 'mathematics' || subject === 'math') {
      if (classId === '10') quizSet = mathClass10Quizzes;
      else if (classId === '11') quizSet = mathClass11Quizzes;
      else if (classId === '12') quizSet = mathClass12Quizzes;
      else quizSet = mathClass9Quizzes;
    } else if (subject === 'computer') {
      if (classId === '10') quizSet = computerClass10Quizzes;
      else if (classId === '11') quizSet = computerClass11Quizzes;
      else if (classId === '12') quizSet = computerClass12Quizzes;
      else quizSet = computerClass9Quizzes;
    } else if (subject === 'chemistry') {
      if (classId === '10') quizSet = chemistryClass10Quizzes;
      else if (classId === '11') quizSet = chemistryClass11Quizzes;
      else if (classId === '12') quizSet = chemistryClass12Quizzes;
      else quizSet = chemistryClass9Quizzes;
    } else if (subject === 'english') {
      quizSet = englishMcqsNotes;
    } else if (subject === 'verbal') {
      quizSet = verbalIntelligenceQuizzes;
    } else if (subject === 'non-verbal') {
      quizSet = nonVerbalIntelligenceQuizzes;
    } else if (subject === 'urdu') {
      quizSet = urduGrammarQuizzes;
    } else if (subject === 'islamic') {
      quizSet = islamicStudiesQuizzes;
    } else if (subject === 'gk') {
      quizSet = generalKnowledgeQuizzes;
    } else if (subject === 'asf') {
      quizSet = asfQuizzes;
    } else if (subject === 'asf-science') {
      quizSet = asfScienceQuizzes;
    } else if (subject === 'mdcat-logical') {
      quizSet = mdcatLogicalQuizzes;
    } else if (subject === 'basic-math') {
      quizSet = basicMathQuizzes;
    } else if (subject === 'pak-studies') {
      quizSet = pakistanStudiesQuizzes;
    }
    
    // Advanced selection logic: 
    // 1. Ensure at least one question from each category/chapter
    // 2. Prioritize questions the user hasn't seen recently
    
    let selectedQuestions: Question[] = [];
    
    // First pass: Take one from every exercise to ensure coverage
    quizSet.forEach(exercise => {
      // Find questions in this exercise. Try to pick one not seen recently.
      const unseenInExercise = exercise.questions.filter(q => !seenIds.includes(q.q));
      const pool = unseenInExercise.length > 0 ? unseenInExercise : exercise.questions;
      const randomQ = pool[Math.floor(Math.random() * pool.length)];
      if (randomQ) selectedQuestions.push(randomQ);
    });
    
    // Flatten all questions for the remaining slots
    const allQuestionsFlat = quizSet.flatMap(chapter => chapter.questions);
    
    // Remaining slots to reach 25
    let remainingSlots = Math.max(0, 25 - selectedQuestions.length);
    
    if (remainingSlots > 0) {
      // Filter out those already picked in first pass
      const pickedTexts = selectedQuestions.map(q => q.q);
      const otherQuestionsPool = allQuestionsFlat.filter(q => !pickedTexts.includes(q.q));
      
      // Of the remaining pool, prioritize those not seen recently
      const unseenPool = otherQuestionsPool.filter(q => !seenIds.includes(q.q));
      
      // Sort pool: unseen first, then seen
      const sortedPool = [...unseenPool.sort(() => Math.random() - 0.5), ...otherQuestionsPool.filter(q => seenIds.includes(q.q)).sort(() => Math.random() - 0.5)];
      
      selectedQuestions = [...selectedQuestions, ...sortedPool.slice(0, remainingSlots)];
    }
    
    // Final shuffle so the "one from each chapter" ones aren't always at the start
    const finalShuffled = [...selectedQuestions];
    for (let i = finalShuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalShuffled[i], finalShuffled[j]] = [finalShuffled[j], finalShuffled[i]];
    }
    
    // Update seen questions in storage
    const newSeenIds = [...new Set([...seenIds, ...finalShuffled.map(q => q.q)])].slice(-100); // Keep last 100
    localStorage.setItem(storageKey, JSON.stringify(newSeenIds));
    
    setQuestions(finalShuffled);
    setMode(selectedMode);
    setCurrentIndex(0);
    setUserAnswers(new Array(finalShuffled.length).fill(null));
    setReviewedIndices([]);
    setTimeLeft(300);
    setIsFinished(false);
    setShowReview(false);
    setHasSavedResult(false);
  }, [subject, classId]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, isFinished, timeLeft]);

  const handleAnswer = (optionIndex: number) => {
    if (isFinished) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateScore = () => {
    return userAnswers.reduce((score, answer, index) => {
      return answer === questions[index].correct ? score + 1 : score;
    }, 0);
  };

  useEffect(() => {
    if (isFinished && !hasSavedResult && user) {
      setHasSavedResult(true);
      const score = calculateScore();
      const percentage = Math.round((score / questions.length) * 100);
      
      addDoc(collection(db, 'quiz_results'), {
        userId: user.uid,
        subject: subject,
        classId: classId || '',
        score: percentage,
        correctAnswers: score,
        totalQuestions: questions.length,
        timestamp: serverTimestamp(),
      }).catch(err => console.error("Could not save score:", err));
    }
  }, [isFinished, hasSavedResult, user, userAnswers, questions, subject, classId]);

  if (!mode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {subject?.toUpperCase()} Practice Test
            </h1>
            <p className="text-slate-500">25 MCQs • 5 Minutes • Class {classId}th</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => startQuiz('STUDY')}
              className="w-full group relative overflow-hidden rounded-2xl p-4 border-2 border-blue-100 hover:border-blue-500 transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Study Mode</h3>
                  <p className="text-sm text-slate-500">Correct answers highlighted immediately</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => startQuiz('EXAM')}
              className="w-full group relative overflow-hidden rounded-2xl p-4 border-2 border-slate-100 hover:border-slate-900 transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                  <Clock className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Exam Mode</h3>
                  <p className="text-sm text-slate-500">No highlights. See results at the end.</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 text-slate-500 font-semibold hover:text-slate-900 transition-colors text-sm"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isFinished && !showReview) {
    const score = calculateScore();
    const percentage = (score / questions.length) * 100;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100 text-center"
        >
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Test Completed!</h2>
          <p className="text-slate-500 mb-8">Great effort! Here's how you performed:</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-sm text-slate-500 mb-1">Score</p>
              <p className="text-2xl font-bold text-slate-900">{score}/{questions.length}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-sm text-slate-500 mb-1">Percentage</p>
              <p className="text-2xl font-bold text-slate-900">{percentage.toFixed(0)}%</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowReview(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Review Answers
            </button>
            <button
              onClick={() => setMode(null)}
              className="w-full bg-white text-slate-900 border-2 border-slate-100 py-4 rounded-2xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Test
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = userAnswers[currentIndex];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'} flex items-center gap-2`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm font-medium text-slate-500">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
          <button
            onClick={() => setIsFinished(true)}
            className="px-6 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold hover:bg-red-100 transition-all cursor-pointer"
          >
            Finish Test
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Question Column */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full mb-8 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                className="h-full bg-blue-600"
              />
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-10"
              >
                <div className="flex items-center justify-between gap-4 mb-6">
                  <span className="text-xs uppercase tracking-widest font-black text-slate-400">
                    Question {currentIndex + 1}
                  </span>
                  
                  <button
                    onClick={() => toggleReview(currentIndex)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                      reviewedIndices.includes(currentIndex)
                        ? 'bg-yellow-500 border-yellow-500 text-white shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${reviewedIndices.includes(currentIndex) ? 'fill-white' : ''}`} />
                    <span>{reviewedIndices.includes(currentIndex) ? 'Marked for Review' : 'Mark for Review'}</span>
                  </button>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-8 leading-tight">
                  {currentQuestion.q}
                </h2>

                {currentQuestion.image && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center p-4">
                    <img 
                      src={currentQuestion.image} 
                      alt="Question illustration" 
                      className="max-h-[300px] w-auto object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = currentQuestion.correct === idx;
                    const showResult = (mode === 'STUDY' && selectedAnswer !== null) || showReview;

                    let buttonClass = "w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group cursor-pointer ";
                    
                    if (showResult) {
                      if (isCorrect) {
                        buttonClass += "border-green-500 bg-green-50 text-green-900";
                      } else if (isSelected) {
                        buttonClass += "border-red-500 bg-red-50 text-red-900";
                      } else {
                        buttonClass += "border-slate-100 text-slate-400";
                      }
                    } else {
                      if (isSelected) {
                        buttonClass += "border-blue-600 bg-blue-50 text-blue-900";
                      } else {
                        buttonClass += "border-slate-100 hover:border-blue-200 hover:bg-slate-50 text-slate-700";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={showResult && !showReview}
                        className={buttonClass}
                      >
                        <span className="font-medium">{option}</span>
                        {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-600 animate-bounce" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600 animate-shake" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {showReview && (
                <button
                  onClick={() => setMode(null)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                >
                  Back to Menu
                </button>
              )}

              <button
                onClick={() => {
                  if (currentIndex === questions.length - 1) {
                    setIsFinished(true);
                  } else {
                    setCurrentIndex(prev => prev + 1);
                  }
                }}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all cursor-pointer"
              >
                {currentIndex === questions.length - 1 ? 'Finish' : 'Forward'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 lg:sticky lg:top-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 text-base md:text-lg flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Questions Navigator
              </h3>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 mb-5 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-black text-yellow-600 bg-yellow-50 rounded-md border border-yellow-200">#</span>
                  <span>Review</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 flex items-center justify-center text-xs font-black text-red-650 bg-red-50 rounded-md border border-red-200">*</span>
                  <span>Unsolved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 flex items-center justify-center text-[10px] font-black text-emerald-600 bg-emerald-50 rounded-md border border-emerald-200">✓</span>
                  <span>Solved</span>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-5 gap-2 max-h-[350px] overflow-y-auto pr-1">
                {questions.map((_, idx) => {
                  const isSelected = currentIndex === idx;
                  const isSolved = userAnswers[idx] !== null;
                  const isMarked = reviewedIndices.includes(idx);
                  
                  let label = `${idx + 1}`;
                  if (isMarked) {
                    label += ' #';
                  } else if (!isSolved) {
                    label += ' *';
                  }

                  let btnClass = "py-3 rounded-2xl text-xs font-bold transition-all border text-center flex items-center justify-center cursor-pointer ";
                  if (isSelected) {
                    btnClass += "bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-100";
                  } else if (isMarked) {
                    btnClass += "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100";
                  } else if (!isSolved) {
                    btnClass += "bg-red-50 border-red-150 text-red-700 hover:bg-red-100";
                  } else {
                    btnClass += "bg-emerald-50 border-emerald-150 text-emerald-700 hover:bg-emerald-100";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={btnClass}
                      title={`Question ${idx + 1}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
