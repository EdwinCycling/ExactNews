import React from 'react';
import { Language } from '../types';

interface ThemeSwitcherProps {
  theme: string;
  toggleTheme: () => void;
  language: Language;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, toggleTheme, language }) => {
  const t = {
    nl: { label: theme === 'dark' ? 'Activeer lichte modus' : 'Activeer donkere modus', sun: 'Zon icoon', moon: 'Maan icoon' },
    en: { label: theme === 'dark' ? 'Activate light mode' : 'Activate dark mode', sun: 'Sun icon', moon: 'Moon icon' }
  }
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      aria-label={t[language].label}
    >
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <title>{t[language].sun}</title>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <title>{t[language].moon}</title>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default ThemeSwitcher;