import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.tsx';
import { supportedLanguages } from '../locales.ts';

interface LanguageScreenProps {
  onSelect: (langCode: string) => void;
  currentLanguage: string;
}

export const LanguageScreen: React.FC<LanguageScreenProps> = ({ onSelect, currentLanguage }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = supportedLanguages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeInUp w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-primary mb-8">{t('language.title')}</h2>
      
      <div className="mb-6 sticky top-4 z-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('language.search')}
          className="w-full p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-black dark:text-white"
          aria-label={t('language.search')}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
        {filteredLanguages.map(lang => {
          const isSelected = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={`group flex items-center justify-start text-left p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md transition-all duration-300 border active:scale-95 ${
                isSelected 
                  ? 'border-transparent ring-2 ring-primary shadow-lg' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg dark:hover:shadow-primary/20 hover:-translate-y-1'
              }`}
              aria-pressed={isSelected}
            >
              <span className="text-3xl mr-3" aria-hidden="true">{lang.flag}</span>
              <span className="font-semibold text-black dark:text-gray-200">{lang.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};