import React, { useState } from 'react';
import { categoryKeys } from '../categories.ts';
import { categoryIcons } from '../categoryIcons.ts';
import { useLanguage } from '../context/LanguageContext.tsx';

interface CategoryScreenProps {
  onSelectCategory: (categoryKey: string) => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({ onSelectCategory }) => {
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryClick = (categoryKey: string) => {
    // Prevent further clicks once a selection is in progress
    if (selected) return;

    setSelected(categoryKey);
    
    // Delay navigation to allow the animation to play
    setTimeout(() => {
      onSelectCategory(categoryKey);
    }, 300); // This duration should match the CSS transition duration
  };

  const filteredCategories = categoryKeys.filter(key => 
    t(`category.${key}`).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeInUp w-full max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-800 dark:text-white mb-4">{t('category.title')}</h2>
      <p className="text-center text-slate-600 dark:text-slate-400 mb-8">{t('category.subtitle')}</p>
      
      <div className="mb-8 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('category.search')}
          className="w-full p-4 pl-12 bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-300 dark:border-slate-700 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-white text-lg transition-all"
          aria-label={t('category.search')}
        />
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        </div>
      </div>
      
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((categoryKey) => {
            const isSelected = selected === categoryKey;
            const categoryDisplayName = t(`category.${categoryKey}`);

            return (
              <button
                key={categoryKey}
                onClick={() => handleCategoryClick(categoryKey)}
                disabled={!!selected}
                className={`group relative flex flex-col items-center justify-center text-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-md transition-all duration-300 border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-900 active:scale-95
                  ${isSelected 
                    ? 'scale-110 shadow-2xl ring-4 ring-primary' 
                    : 'hover:shadow-lg hover:dark:shadow-primary/20 hover:-translate-y-1'
                  }
                  ${!!selected ? 'cursor-default opacity-50' : 'cursor-pointer'}
                  border-slate-200 dark:border-slate-700
                `}
                aria-label={`${t('quizSetup.category')}: ${categoryDisplayName}`}
              >
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3 transition-colors duration-300 group-hover:bg-primary/10 dark:group-hover:bg-primary/20">
                  <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                    {categoryIcons[categoryKey] || '❓'}
                  </span>
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{categoryDisplayName}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-slate-500 dark:text-slate-400">{t('category.noResults')}</p>
        </div>
      )}
    </div>
  );
};