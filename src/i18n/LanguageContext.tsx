import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Language, TranslationDictionary } from './types';
import { ko } from './translations/ko';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { de } from './translations/de';

const STORAGE_KEY = 'seowonfc_lang';

const translations: Record<Language, TranslationDictionary> = {
  ko,
  en,
  fr,
  de,
};

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  languages: LanguageOption[];
  formatDate: (dateStr?: string | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && (saved === 'ko' || saved === 'en' || saved === 'fr' || saved === 'de')) {
        return saved;
      }
      const browserLang = navigator.language?.slice(0, 2);
      if (browserLang === 'en' || browserLang === 'fr' || browserLang === 'de') {
        return browserLang;
      }
    } catch {
      // localStorage 불가 환경 대응
    }
    return 'ko';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      const localeMap: Record<Language, string> = {
        ko: 'ko-KR',
        en: 'en-US',
        fr: 'fr-FR',
        de: 'de-DE',
      };
      return new Intl.DateTimeFormat(localeMap[language], {
        dateStyle: 'medium',
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const t = translations[language] || translations.ko;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: SUPPORTED_LANGUAGES, formatDate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
