import React from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import type { QuizResult } from '../types.ts';

interface HomeScreenProps {
  onStart: () => void;
  onViewHistory: () => void;
  onViewLeaderboard: () => void;
  highScores: QuizResult[];
  onViewAnalytics: () => void;
}

const TrophyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.25 2.25a.75.75 0 00-1.5 0v1.135A4.06 4.06 0 006.135 7.5H5.25a.75.75 0 000 1.5h.885A4.06 4.06 0 0010 12.865V15.5a.75.75 0 001.5 0v-2.635a4.06 4.06 0 003.615-4.115h.885a.75.75 0 000-1.5h-.885a4.06 4.06 0 00-3.615-4.115V2.25zM7.5 9a2.25 2.25 0 104.5 0 2.25 2.25 0 00-4.5 0z" clipRule="evenodd" />
        <path d="M2.25 13.5a.75.75 0 000 1.5h15a.75.75 0 000-1.5H2.25z" />
    </svg>
);


export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onViewHistory, onViewLeaderboard, highScores, onViewAnalytics }) => {
    const { t } = useLanguage();
    return (
        <div className="text-center w-full max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrapold text-slate-800 dark:text-white mb-4">{t('home.welcome')}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">{t('home.description')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Action Card */}
                <div className="md:col-span-2">
                     <button
                        onClick={onStart}
                        className="w-full text-left p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/40"
                    >
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t('home.start')}</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">{t('home.start.desc')}</p>
                        <span className="inline-flex items-center font-semibold text-primary group-hover:underline">
                            {t('home.start.cta')}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </button>
                </div>
                
                {/* Secondary Action Cards */}
                <button
                    onClick={onViewHistory}
                    className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/40"
                >
                     <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('home.history')}</h3>
                </button>
                 <button
                    onClick={onViewLeaderboard}
                    className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-center border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/40"
                >
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{t('home.leaderboard')}</h3>
                </button>
            </div>
             <div className="mt-6 text-center">
                <button onClick={onViewAnalytics} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:underline transition-colors duration-200">
                    {t('home.viewAnalytics')}
                </button>
            </div>

            {highScores.length > 0 && (
                <div className="mt-12 w-full">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 flex items-center justify-center gap-2">
                        <TrophyIcon /> {t('home.highScores')}
                    </h2>
                    <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl shadow-lg space-y-3 max-h-72 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700">
                        {highScores.map((score, index) => (
                             <div key={score.id} className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-md flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-slate-500 dark:text-slate-400 w-8 text-center">{index + 1}</span>
                                    <div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-200 truncate" title={score.name}>{score.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate" title={t(`category.${score.categoryKey}`)}>{t(`category.${score.categoryKey}`)}</p>
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-slate-800 dark:text-primary">
                                    {score.score}
                                    <span className="text-sm text-slate-500 dark:text-slate-400"> / {score.totalQuestions}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};