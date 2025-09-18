import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';

interface SaveScoreScreenProps {
  score: number;
  totalQuestions: number;
  onSave: (name: string) => void;
  currentUsername: string;
}

export const SaveScoreScreen: React.FC<SaveScoreScreenProps> = ({ score, totalQuestions, onSave, currentUsername }) => {
  const [name, setName] = useState('');
  const { t } = useLanguage();
  
  useEffect(() => {
    if (currentUsername) {
      setName(currentUsername);
    }
  }, [currentUsername]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg w-full max-w-md mx-auto animate-fadeInUp transition-colors duration-300 border border-slate-200 dark:border-slate-700">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-2">{t('saveScore.title')}</h2>
      <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-6">
        {t('saveScore.yourScore')}: <span className="font-bold text-2xl text-primary">{score} / {totalQuestions}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="playerName" className="block text-sm font-medium text-slate-600 dark:text-slate-200">
            {t('saveScore.enterName')}
          </label>
          <input
            type="text"
            id="playerName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary text-slate-800 dark:text-white"
            placeholder={t('saveScore.enterName')}
            maxLength={20}
            required
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="w-full bg-primary hover:brightness-110 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-lg disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:scale-100 disabled:cursor-not-allowed active:scale-95 duration-200"
          disabled={!name.trim()}
        >
          {t('saveScore.save')}
        </button>
      </form>
    </div>
  );
};
