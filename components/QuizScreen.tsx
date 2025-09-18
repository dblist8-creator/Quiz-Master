import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Question, QuizSetupOptions } from '../types.ts';
import { useTimer } from '../hooks/useTimer.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { playCorrect, playIncorrect } from '../services/soundService';
import { generateQuizQuestions } from '../services/geminiService';

interface QuizScreenProps {
  questions: Question[];
  onQuizFinish: (score: number, userAnswers: (string | null)[]) => void;
  timed: boolean;
  timerDuration: number;
  quizSetupOptions: QuizSetupOptions | null;
  onQuizUpdate: (newQuestions: Question[]) => void;
}

const AnswerFeedbackIcon: React.FC<{ isCorrect: boolean }> = ({ isCorrect }) => {
    if (isCorrect) {
        return (
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </div>
        );
    }
    return (
        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
    );
};

const MAX_SKIPS = 3;

export const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onQuizFinish, timed, timerDuration, quizSetupOptions, onQuizUpdate }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { t } = useLanguage();
  const [updateTriggered, setUpdateTriggered] = useState(false);
  const [animationClass, setAnimationClass] = useState('animate-slideInRight');
  const [scoreAnimation, setScoreAnimation] = useState('');
  const prevScoreRef = useRef(0);
  const [skipsLeft, setSkipsLeft] = useState(MAX_SKIPS);

  const currentQuestion = questions[currentQuestionIndex];
  
  useEffect(() => {
    if (score > prevScoreRef.current) {
      setScoreAnimation('animate-tada');
      const timer = setTimeout(() => setScoreAnimation(''), 800);
      return () => clearTimeout(timer);
    }
    prevScoreRef.current = score;
  }, [score]);


  const advanceQuiz = useCallback((answer: string | null) => {
    const isCorrect = answer?.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }
    
    const newScore = isCorrect ? score + 1 : score;
    const newAnswers = [...userAnswers, answer];

    setAnimationClass('animate-slideOutLeft');

    setTimeout(() => {
        if (currentQuestionIndex + 1 >= questions.length) {
            onQuizFinish(newScore, newAnswers);
        } else {
            setScore(newScore);
            setUserAnswers(newAnswers);
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setAnimationClass('animate-slideInRight');
        }
    }, 400); // Match animation duration
  }, [currentQuestion, currentQuestionIndex, questions.length, onQuizFinish, score, userAnswers]);


  const handleTimeUp = useCallback(() => {
    setIsAnswered(true);
    setSelectedAnswer(null);
    playIncorrect();
    setTimeout(() => advanceQuiz(null), 1000);
  }, [advanceQuiz]);

  const { timeLeft, start, stop, reset } = useTimer(timerDuration, handleTimeUp);

  useEffect(() => {
    if (timed) {
      reset();
      start();
    }
    return () => { if (timed) stop(); };
  }, [currentQuestionIndex, timed, reset, start, stop]);

  useEffect(() => {
    const isMidway = currentQuestionIndex > 0 && currentQuestionIndex === Math.floor(questions.length / 2);

    if (!isMidway || !quizSetupOptions || updateTriggered || timed) return;

    const fetchBonusQuestions = async () => {
      setUpdateTriggered(true);
      try {
        const bonusOptions = { ...quizSetupOptions, numQuestions: 5 };
        const newQuestions = await generateQuizQuestions(bonusOptions);
        onQuizUpdate(newQuestions);
      } catch (error) {
        console.error("Failed to fetch bonus questions:", error);
      }
    };

    fetchBonusQuestions();
  }, [currentQuestionIndex, questions.length, quizSetupOptions, updateTriggered, onQuizUpdate, timed]);

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    if (timed) stop();
    
    setIsAnswered(true);
    setSelectedAnswer(option);

    setTimeout(() => advanceQuiz(option), 2000);
  };

  const handleSkipQuestion = () => {
    if (isAnswered || skipsLeft <= 0) return;
    
    if (timed) stop();
    
    // Lock UI immediately
    setIsAnswered(true);
    setSkipsLeft(prev => prev - 1);
    
    // A skipped question is treated as an incorrect/unanswered one.
    // Use a short delay before advancing to make the UI feel responsive.
    setTimeout(() => advanceQuiz(null), 200); 
  };


  const getButtonClass = (option: string) => {
    const baseClasses = 'w-full p-4 rounded-lg font-medium transition-all duration-300 shadow-sm flex items-center justify-between text-left';
    
    if (isAnswered) {
      const isCorrect = option.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
      const isSelected = option.toLowerCase() === selectedAnswer?.toLowerCase();

      if (isCorrect) {
        return `${baseClasses} bg-green-500 text-white border-transparent ring-2 ring-green-300 animate-pulse-success`;
      }
      if (isSelected && !isCorrect) {
        return `${baseClasses} bg-red-500 text-white border-transparent ring-2 ring-red-300 animate-shake-error`;
      }
      return `${baseClasses} bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-transparent scale-95 opacity-70`;
    }

    return `${baseClasses} bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-primary/10 dark:hover:bg-primary/20 hover:ring-2 hover:ring-primary active:scale-95`;
  };

  const progressPercentage = (currentQuestionIndex / questions.length) * 100;
  const timerPercentage = (timeLeft / timerDuration) * 100;
  const timerColorClass = timeLeft <= 5 ? 'bg-red-500' : (timeLeft <= 10 ? 'bg-yellow-500' : 'bg-primary');
  
  return (
    <div className={`bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto border border-slate-200 dark:border-slate-700 ${animationClass}`}>
      {/* Header Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 font-semibold text-sm">
          <span className="text-slate-600 dark:text-slate-300">{t('quiz.question')} {currentQuestionIndex + 1} / {questions.length}</span>
          <span className={`inline-block text-slate-600 dark:text-slate-300 ${scoreAnimation}`}>{t('quiz.score')}: <span className="font-bold text-primary">{score}</span></span>
        </div>
        {/* Progress Bar Container */}
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 relative overflow-hidden">
          <div className="bg-primary/30 h-full rounded-full" style={{ width: `100%` }}>
             <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
           {/* Timer bar on top */}
          {timed && (
              <div className={`absolute top-0 left-0 h-full rounded-full ${timerColorClass}`} style={{ width: `${timerPercentage}%`, transition: 'width 1s linear, background-color 0.5s' }}></div>
          )}
        </div>
      </div>
      
      <h3 className="text-xl md:text-2xl font-bold text-center mb-8 text-slate-800 dark:text-white" dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />

      {/* Options */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {currentQuestion.options?.map((option, index) => {
          const isCorrect = option === currentQuestion.correctAnswer;
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              disabled={isAnswered}
              className={`${getButtonClass(option)} ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: option }} />
              {isAnswered && (isCorrect || selectedAnswer === option) && <AnswerFeedbackIcon isCorrect={isCorrect} />}
            </button>
          )
        })}
      </div>

       {/* Footer Actions */}
      <div className="mt-8 flex justify-end items-center">
        <button
            id="skip-button"
            onClick={handleSkipQuestion}
            disabled={isAnswered || skipsLeft <= 0}
            className="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-full shadow-md hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:scale-100 disabled:cursor-not-allowed"
        >
            {t('quiz.skip')} ({skipsLeft} {t('quiz.skipsLeft')})
        </button>
      </div>
    </div>
  );
};