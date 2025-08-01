
import React from 'react';
import { Language } from '../types';

interface CookieConsentToastProps {
  isVisible: boolean;
  onAccept: () => void;
  language: Language;
}

const CookieConsentToast: React.FC<CookieConsentToastProps> = ({ isVisible, onAccept, language }) => {
  if (!isVisible) {
    return null;
  }

  const t = {
    nl: {
      message: "Deze site gebruikt cookies om uw voorkeuren voor thema, taal en favorieten te onthouden. We gebruiken ook cookies voor anonieme statistieken.",
      accept: "Accepteren",
    },
    en: {
      message: "This site uses cookies to remember your theme, language, and favorite preferences. We also use cookies for anonymous statistics.",
      accept: "Accept",
    }
  };

  return (
    <div 
      role="alert" 
      aria-live="assertive"
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl mb-4 p-4 rounded-lg shadow-2xl bg-slate-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 flex-grow">
          {t[language].message}
        </p>
        <button 
          onClick={onAccept}
          className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          {t[language].accept}
        </button>
      </div>
    </div>
  );
};

export default CookieConsentToast;
