import React from 'react';
import type { QuizResult, UserProfile } from '../types.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface HistoryScreenProps {
  history: QuizResult[];
  onClear: () => void;
  onBack: () => void;
  currentUserProfile: UserProfile;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onClear, onBack }) => {
  const { t } = useLanguage();

  const Avatar: React.FC<{ avatar: string }> = ({ avatar }) => (
    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600 flex-shrink-0">
        {avatar.startsWith('data:image/') ? (
            <img src={avatar} alt={t('profile.avatar')} className="w-full h-full object-cover" />
        ) : (
            <span className="text-3xl">{avatar}</span>
        )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-lg w-full max-w-3xl mx-auto transition-colors duration-300 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-6">{t('history.title')}</h2>
      
      {history.length === 0 ? (
        <div className="text-center text-slate-500 dark:text-slate-400 py-10">
          <p className="text-lg">{t('history.noResults')}</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {history.map((result) => (
            <div key={result.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-md flex items-center gap-4">
              <Avatar avatar={result.avatar} />
              <div className="flex-grow">
                <p className="font-semibold text-primary">{t(`category.${result.categoryKey}`)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{result.date}</p>
              </div>
              <p className="text-xl font-bold text-slate-800 dark:text-slate-200">
                {result.score} <span className="text-base font-normal text-slate-500">/ {result.totalQuestions}</span>
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-red-500 hover:underline font-semibold transition-all duration-200 hover:scale-105 active:scale-100"
          >
            {t('history.clear')}
          </button>
        )}
      </div>
    </div>
  );
};