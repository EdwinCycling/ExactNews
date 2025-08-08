import React, { useEffect } from "react";
import { Language } from "../types";

interface WelcomeToastProps {
  user: any;
  language: Language;
  onClose: () => void;
}

const WelcomeToast: React.FC<WelcomeToastProps> = ({ user, language, onClose }) => {
  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const translations = {
    nl: {
      welcome: "Welkom terug!",
      message: "Je bent succesvol ingelogd."
    },
    en: {
      welcome: "Welcome back!",
      message: "You have successfully logged in."
    },
    de: {
      welcome: "Willkommen zurück!",
      message: "Sie haben sich erfolgreich angemeldet."
    }
  };

  const t = translations[language];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-slate-200 dark:border-gray-700 p-6 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-400 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t.welcome}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {t.message}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              {user?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeToast;
