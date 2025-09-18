import React, { useState, useEffect } from 'react';
import type { QuizSetupOptions } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';
import { categoryIcons } from '../categoryIcons.ts';

interface QuizSetupProps {
  onStartQuiz: (options: QuizSetupOptions) => void;
  selectedCategoryKey: string;
  error: string | null;
  clearError: () => void;
}

const TIMER_SETTINGS_KEY = 'quizTimerSettings';

export const QuizSetup: React.FC<QuizSetupProps> = ({ onStartQuiz, selectedCategoryKey, error, clearError }) => {
  const { t, language } = useLanguage();
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  
  // Load saved settings or use defaults
  const [timed, setTimed] = useState(() => {
    try {
      const saved = localStorage.getItem(TIMER_SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved).timed;
      }
    } catch (e) { console.error(e); }
    return true; // Default: Timed quiz is on
  });

  const [timerDuration, setTimerDuration] = useState(() => {
    try {
      const saved = localStorage.getItem(TIMER_SETTINGS_KEY);
      if (saved) {
        return JSON.parse(saved).timerDuration;
      }
    } catch (e) { console.error(e); }
    return 30; // Default: 30 seconds
  });
  
  // Save settings when they change
  useEffect(() => {
    try {
      const settings = JSON.stringify({ timed, timerDuration });
      localStorage.setItem(TIMER_SETTINGS_KEY, settings);
    } catch (error) {
      console.error("Failed to save timer settings", error);
    }
  }, [timed, timerDuration]);


  const categoryDisplayName = t(`category.${selectedCategoryKey}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartQuiz({
      numQuestions,
      category: categoryDisplayName,
      categoryKey: selectedCategoryKey,
      difficulty,
      language,
      timed,
      timerDuration,
      numOptions: 4, // Hardcoded to 4 options
    });
  };
  
  const formatDuration = (seconds: number) => {
    if (seconds >= 120) return '2min';
    if (seconds >= 60) {
      const remainingSeconds = seconds % 60;
      return `1m${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
    }
    return `${seconds}s`;
  };
  
  const difficultyOptions = [
    {
      level: 'Easy',
      icon: '🌱',
      descKey: 'quizSetup.difficulty.easy.desc',
      selectedClasses: 'border-green-500 bg-green-50 dark:bg-green-900/50',
      unselectedClasses: 'hover:border-green-400'
    },
    {
      level: 'Medium',
      icon: '🧠',
      descKey: 'quizSetup.difficulty.medium.desc',
      selectedClasses: 'border-primary bg-primary/10 dark:bg-primary/20',
      unselectedClasses: 'hover:border-primary'
    },
    {
      level: 'Hard',
      icon: '🔥',
      descKey: 'quizSetup.difficulty.hard.desc',
      selectedClasses: 'border-red-500 bg-red-50 dark:bg-red-900/50',
      unselectedClasses: 'hover:border-red-400'
    }
  ];

  const ErrorMessage = () => (
    <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md mb-6 flex justify-between items-center animate-shake-error" role="alert">
        <div>
            <p className="font-bold">{t('quizSetup.error.title')}</p>
            <p>{error}</p>
        </div>
        <button onClick={clearError} className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors" aria-label={t('quizSetup.error.dismiss')}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
  );


  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto transition-colors duration-300 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-6">{t('quizSetup.title')}</h2>
      {error && <ErrorMessage />}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('quizSetup.category')}
          </label>
          <div className="mt-1 flex items-center w-full bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-3 px-4">
            <span className="text-2xl mr-3">{categoryIcons[selectedCategoryKey] || ''}</span>
            <span className="text-slate-800 dark:text-white font-semibold text-lg">{categoryDisplayName}</span>
          </div>
        </div>
        
        {/* Number of Questions */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            {t('quizSetup.numQuestions')}
          </label>
          <div className="mt-2 flex rounded-md shadow-sm">
              {[5, 10, 15, 20].map((num, index, arr) => {
                  const isSelected = numQuestions === num;
                  let roundedClass = '';
                  if (index === 0) roundedClass = 'rounded-l-md';
                  else if (index === arr.length - 1) roundedClass = 'rounded-r-md';

                  return (
                      <button
                          key={num}
                          type="button"
                          onClick={() => setNumQuestions(num)}
                          className={`relative ${index > 0 ? '-ml-px' : ''} inline-flex items-center justify-center flex-1 py-1.5 border text-sm font-medium transition-colors ${roundedClass} ${
                              isSelected
                                  ? 'bg-primary text-white border-primary z-10'
                                  : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                          }`}
                      >
                          {num}
                      </button>
                  )
              })}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{t('quizSetup.difficulty')}</label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.level}
                type="button"
                onClick={() => setDifficulty(opt.level as 'Easy' | 'Medium' | 'Hard')}
                className={`p-4 rounded-lg border-2 text-center transition-all duration-200 cursor-pointer transform ${
                  difficulty === opt.level
                    ? `scale-105 shadow-lg ${opt.selectedClasses}`
                    : `border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 hover:shadow-md ${opt.unselectedClasses}`
                }`}
                aria-pressed={difficulty === opt.level}
              >
                <div className="text-3xl mb-1">{opt.icon}</div>
                <div className="font-bold text-lg text-slate-800 dark:text-white">{t(`quizSetup.difficulty.${opt.level.toLowerCase()}`)}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-8">{t(opt.descKey)}</p>
              </button>
            ))}
          </div>
        </div>
        
        {/* Timer Setup */}
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">{t('quizSetup.timePerQuestion')}</label>
          <div className="mt-2 space-y-4">
            {/* Toggle between timed and no limit */}
            <div className="flex rounded-md shadow-sm w-full">
              <button
                type="button"
                onClick={() => setTimed(false)}
                className={`w-1/2 relative inline-flex items-center justify-center px-4 py-2 rounded-l-md border text-sm font-medium transition-colors ${
                  !timed
                    ? 'bg-primary text-white border-primary z-10'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                }`}
              >
                {t('quizSetup.noTimeLimit')}
              </button>
              <button
                type="button"
                onClick={() => { if (!timed) { setTimed(true); setTimerDuration(30); } }}
                className={`w-1/2 relative -ml-px inline-flex items-center justify-center px-4 py-2 rounded-r-md border text-sm font-medium transition-colors ${
                  timed
                    ? 'bg-primary text-white border-primary z-10'
                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-800 dark:text-white'
                }`}
              >
                {t('quizSetup.timed')}
              </button>
            </div>

            {/* Slider and value display - only shown if timed is true */}
            {timed && (
              <div className="animate-fadeIn p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="timerDuration" className="text-sm font-medium text-slate-600 dark:text-slate-200">
                    {t('quizSetup.duration')}
                  </label>
                  <span className="text-lg font-bold text-primary tabular-nums">{formatDuration(timerDuration)}</span>
                </div>
                <input
                  id="timerDuration"
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* Start Button */}
        <button
          type="submit"
          className="w-full bg-primary hover:brightness-110 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:scale-100 disabled:cursor-not-allowed active:scale-95 duration-200 focus:outline-none focus:ring-4 focus:ring-primary/40"
        >
          {t('quizSetup.start')}
        </button>
      </form>
    </div>
  );
};