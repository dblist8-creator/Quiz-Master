import React from 'react';
import type { Question } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface ResultScreenProps {
  score: number;
  questions: Question[];
  userAnswers: (string | null)[];
  onRestart: () => void;
  onRetryLastIncorrect: () => void;
  onSaveScore: () => void;
  onGoHome: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, questions, userAnswers, onRestart, onRetryLastIncorrect, onSaveScore, onGoHome }) => {
  const { t } = useLanguage();
  const scorePercentage = Math.round((score / questions.length) * 100);

  const getScoreColor = () => {
    if (scorePercentage >= 75) return 'text-green-500';
    if (scorePercentage >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFeedbackMessage = () => {
    if (scorePercentage >= 75) return t('results.feedback.great');
    if (scorePercentage >= 40) return t('results.feedback.good');
    return t('results.feedback.practice');
  };
  
  const hasIncorrectAnswers = userAnswers.some((answer, index) => {
    const question = questions[index];
    return answer !== question.correctAnswer;
  });


  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - scorePercentage / 100);
  const scoreColorClass = getScoreColor();


  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto transition-colors duration-300 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">{t('results.title')}</h2>
      
      <div className="my-6 flex flex-col items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle
              className="text-slate-200 dark:text-slate-700"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
            <circle
              className={scoreColorClass}
              strokeWidth="10"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 1s ease-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${scoreColorClass}`}>{scorePercentage}%</span>
            <span className="text-sm text-slate-600 dark:text-slate-300">{score} / {questions.length}</span>
          </div>
        </div>
        <p className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-200">{getFeedbackMessage()}</p>
      </div>

      <div className="text-center mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={onRestart}
          className="w-full bg-primary hover:brightness-110 text-white font-bold py-3 px-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg active:scale-95 duration-200"
        >
          {t('results.playAgain')}
        </button>
        <button
            onClick={onSaveScore}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg active:scale-95 duration-200"
          >
            {t('results.saveScore')}
        </button>
        {hasIncorrectAnswers && (
          <button
            onClick={onRetryLastIncorrect}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg active:scale-95 duration-200"
          >
            {t('results.retryLast')}
          </button>
        )}
      </div>

      <h3 className="text-xl font-semibold mb-4 text-center">{t('results.review')}</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {questions.map((question, index) => {
          const userAnswer = userAnswers[index];
          const isCorrect = userAnswer === question.correctAnswer;
          return (
            <div key={index} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 dark:bg-green-500/20' : 'bg-red-50 dark:bg-red-500/20'} border ${isCorrect ? 'border-green-200 dark:border-green-700' : 'border-red-200 dark:border-red-700'}`}>
              <p className="font-semibold mb-2 text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: `${index + 1}. ${question.question}` }}></p>
              <p className={`text-sm flex items-center gap-2 ${isCorrect ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                <span className="font-bold">{t('results.yourAnswer')}:</span>
                <span dangerouslySetInnerHTML={{ __html: userAnswer ?? t('results.notAnswered') }} />
              </p>
              {!isCorrect && (
                <p className="text-sm flex items-center gap-2 text-slate-700 dark:text-slate-300 mt-1">
                  <span className="font-bold">{t('results.correctAnswer')}:</span>
                  <span dangerouslySetInnerHTML={{ __html: question.correctAnswer }} />
                </p>
              )}
            </div>
          );
        })}
      </div>
       <div className="mt-8 flex justify-center">
            <button
                onClick={onGoHome}
                className="text-primary hover:underline font-semibold transition-colors duration-200"
            >
                {t('results.goHome')}
            </button>
        </div>
    </div>
  );
};