import React from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { translations } from '../data/translations';
import type { Language } from '../data/translations';

interface LanguageSelectorProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  setLanguage,
  darkMode,
  setDarkMode,
}) => {
  const t = translations[language];

  return (
    <div className="flex items-center space-x-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all duration-300">
      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
        className="flex items-center space-x-1.5 text-sm font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors py-1 px-2.5 rounded-full hover:bg-sky-50 dark:hover:bg-sky-950/40"
        aria-label="Toggle Language"
      >
        <Globe size={16} className="animate-spin-slow" />
        <span>{t.languageLabel}</span>
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />

      {/* Theme Toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-300"
        title={darkMode ? t.themeLight : t.themeDark}
        aria-label="Toggle Theme"
      >
        {darkMode ? (
          <Sun size={18} className="text-amber-500 hover:rotate-45 transition-transform" />
        ) : (
          <Moon size={18} className="text-slate-600 hover:-rotate-12 transition-transform" />
        )}
      </button>
    </div>
  );
};
