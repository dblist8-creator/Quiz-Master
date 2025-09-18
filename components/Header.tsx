import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useLanguage } from '../context/LanguageContext.tsx';
import { supportedLanguages } from '../locales.ts';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onBack?: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  onNavigateToLanguageSelect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, onBack, soundEnabled, toggleSound, onNavigateToLanguageSelect }) => {
  const { language, t } = useLanguage();
  
  const currentLang = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  const SoundOnIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );

  const SoundOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l-4-4m0 4l4-4" />
    </svg>
  );

  return (
    <header className="bg-[#F5F5F5] dark:bg-[#1E1E1E] shadow-md p-4 flex justify-between items-center transition-colors duration-300">
      <div className="flex items-center gap-2 sm:gap-4">
        {onBack && (
          <button 
            onClick={onBack} 
            className="text-black dark:text-white p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 active:scale-90"
            aria-label={t('header.back')}
          >
            <BackIcon />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white whitespace-nowrap">{t('app.title')}</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button
          onClick={onNavigateToLanguageSelect}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95"
        >
          <span className="text-xl" aria-hidden="true">{currentLang.flag}</span>
          <span className="hidden sm:inline font-medium">{currentLang.name}</span>
        </button>
        <button
          onClick={toggleSound}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 active:scale-90"
          aria-label={soundEnabled ? t('header.toggleSound.on') : t('header.toggleSound.off')}
        >
          {soundEnabled ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </header>
  );
};