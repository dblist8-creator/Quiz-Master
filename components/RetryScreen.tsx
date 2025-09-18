import React, { useState } from 'react';
import type { Question } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface RetryScreenProps {
  question: Question;
  onFinish: (selectedAnswer: string) => void;
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

export const RetryScreen: React.FC<RetryScreenProps> = ({ question, onFinish }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { t } = useLanguage();

  const finishRetry = (answer: string) => {
    setTimeout(() => {
      onFinish(answer);
    }, 2000); // 2-second delay to show feedback
  };

  const handleAnswerSelect = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(option);
    finishRetry(option);
  };

  const getButtonClass = (option: string) => {
    const baseClasses = 'w-full p-4 rounded-lg font-medium transition-all duration-300 shadow-sm flex items-center justify-between text-left';
    
    if (isAnswered) {
      const isCorrect = option.toLowerCase() === question.correctAnswer.toLowerCase();
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

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-2xl mx-auto animate-fadeInUp border border-slate-200 dark:border-slate-700">
      <h2 className="text-2xl font-bold text-center text-primary mb-6">{t('retry.title')}</h2>

      <h3 className="text-xl md:text-2xl font-semibold text-center mb-8 text-slate-800 dark:text-white" dangerouslySetInnerHTML={{ __html: question.question }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options?.map((option, index) => {
          const isCorrect = option === question.correctAnswer;
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
          );
        })}
      </div>
    </div>
  );
};