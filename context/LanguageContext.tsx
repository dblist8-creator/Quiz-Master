import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supportedLanguages } from '../locales.ts';
import { logger } from '../services/loggingService.ts';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

const LANGUAGE_KEY = 'quizMasterLanguage';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    try {
      const savedLang = localStorage.getItem(LANGUAGE_KEY);
      if (savedLang && supportedLanguages.some(l => l.code === savedLang)) {
        return savedLang;
      }
    } catch (e) { console.error("Could not read language from local storage", e); }

    const browserLang = navigator.language.split('-')[0];
    const isSupported = supportedLanguages.some(lang => lang.code === browserLang);
    return isSupported ? browserLang : 'en';
  });
  
  const [messages, setMessages] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Always load English as the base for fallback
        const enResponse = await fetch('./locales/en.json');
        const enMessages = await enResponse.json();

        if (language === 'en') {
          setMessages(enMessages);
          return;
        }

        // Try to load the selected language and merge it over English
        const langResponse = await fetch(`./locales/${language}.json`);
        if (langResponse.ok) {
          const langMessages = await langResponse.json();
          setMessages({ ...enMessages, ...langMessages });
        } else {
          // If the language file doesn't exist, just use English
          if (langResponse.status === 404) {
              logger.warn(`Translation file for '${language}' not found (404). Falling back to English.`);
          } else {
              logger.warn(`Failed to load translation file for '${language}' (status: ${langResponse.status}). Falling back to English.`);
          }
          setMessages(enMessages);
        }
      } catch (error) {
        logger.error('Network error loading translation files, falling back to English.', error);
        // Attempt to load English one last time in case of a network error on the language file
        try {
            const enResponse = await fetch('./locales/en.json');
            setMessages(await enResponse.json());
        } catch (e) {
            logger.error('Failed to load even the fallback English translations.', e);
        }
      }
    };

    loadTranslations();
  }, [language]);

  const setLanguage = (langCode: string) => {
    try {
      localStorage.setItem(LANGUAGE_KEY, langCode);
    } catch (e) { console.error("Could not save language to local storage", e); }
    setLanguageState(langCode);
  };

  const t = useCallback((key: string): string => {
    return messages[key] || key;
  }, [messages]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};