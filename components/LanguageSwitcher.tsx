import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const FlagNL = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className="w-6 h-auto rounded-sm"><title>Nederlands</title><rect width="3" height="2" fill="#21468B"/><rect width="3" height="1" fill="#fff"/><rect width="3" height="0.66" fill="#AE1C28"/></svg> );
const FlagUK = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className="w-6 h-auto rounded-sm"><title>English</title><clipPath id="s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#s)"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#s)"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/></svg> );
const FlagDE = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-6 h-auto rounded-sm"><title>Deutsch</title><rect width="5" height="3" fill="#000000"/><rect width="5" height="2" y="1" fill="#FF0000"/><rect width="5" height="1" y="2" fill="#FFCC00"/></svg> );

const flags: { [key in Language]: { component: React.FC; label: string } } = {
  nl: { component: FlagNL, label: "Schakel over naar Nederlands" },
  en: { component: FlagUK, label: "Switch to English" },
  de: { component: FlagDE, label: "Auf Deutsch umschalten" },
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ language, setLanguage }) => {

  const order: Language[] = ['nl', 'en', 'de'];

  return (
    <div className="flex items-center space-x-2 p-1 rounded-full bg-slate-200 dark:bg-gray-700 shadow-md">
      {order.map((langKey) => {
        const FlagComponent = flags[langKey].component;
        return (
          <button 
            key={langKey}
            onClick={() => setLanguage(langKey)}
            className={`p-1 rounded-full transition-opacity ${language === langKey ? 'opacity-100 ring-2 ring-indigo-500' : 'opacity-50 hover:opacity-100'}`}
            aria-label={flags[langKey].label}
            disabled={language === langKey}
          >
            <FlagComponent />
          </button>
        )
      })}
    </div>
  );
};

export default LanguageSwitcher;