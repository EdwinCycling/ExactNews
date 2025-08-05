

import React, { useState } from 'react';
import { Language } from '../types';

interface LoginScreenProps {
  onLogin: (code: string) => Promise<boolean>;
  language: Language;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = {
    nl: {
      title: "Welkom bij Exact's AI Daily",
      subtitle: "Voer de 4-cijferige toegangscode in.",
      button: "Ontgrendel",
      error: "Ongeldige code. Probeer het opnieuw.",
      unexpectedError: "Er is een onverwachte fout opgetreden. Controleer de console.",
      loading: "Controleren...",
      delete: "Wissen",
    },
    en: {
      title: "Welcome to Exact's AI Daily",
      subtitle: "Please enter the 4-digit access code.",
      button: "Unlock",
      error: "Invalid code. Please try again.",
      unexpectedError: "An unexpected error occurred. Check the console.",
      loading: "Checking...",
      delete: "Delete",
    }
  };

  const handleDigitClick = (digit: number) => {
    if (isLoading || code.length >= 4) return;
    setCode(prevCode => prevCode + digit);
    setError('');
  };

  const handleDeleteClick = () => {
    if (isLoading) return;
    setCode(prevCode => prevCode.slice(0, -1));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 4 || isLoading) return;

    setIsLoading(true);
    setError('');

    try {
      const success = await onLogin(code);
      if (!success) {
        setError(t[language].error);
        setCode('');
      }
    } catch (e) {
      console.error("Login failed:", e);
      setError(t[language].unexpectedError);
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const keypadButtons = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">{t[language].subtitle}</p>
        
        <div className={`flex justify-center items-center space-x-4 mb-4 ${error ? 'animate-shake' : ''}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold border-2 transition-all duration-200
                ${code[i] ? 'bg-teal-400/20 border-teal-500 text-teal-500' : 'bg-slate-100 dark:bg-gray-700 border-slate-300 dark:border-gray-600'}
              `}
            >
              {code[i] ? '●' : ''}
            </div>
          ))}
        </div>

        {error ? <p className="text-red-500 text-sm mb-4">{error}</p> : <div className="h-6 mb-4"></div> /* Placeholder */}
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          {keypadButtons.map(digit => (
            <button
              type="button"
              key={digit}
              onClick={() => handleDigitClick(digit)}
              disabled={isLoading}
              className="w-20 h-20 rounded-full bg-slate-100 dark:bg-gray-700/50 text-2xl font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-gray-600 active:scale-90 disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <div/>
          <button
              type="button"
              key={0}
              onClick={() => handleDigitClick(0)}
              disabled={isLoading}
              className="w-20 h-20 rounded-full bg-slate-100 dark:bg-gray-700/50 text-2xl font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-gray-600 active:scale-90 disabled:opacity-50"
            >
              0
            </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isLoading || code.length === 0}
            aria-label={t[language].delete}
            className="w-20 h-20 rounded-full bg-slate-100 dark:bg-gray-700/50 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-gray-600 active:scale-90 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75 14.25 12m0 0 2.25 2.25M14.25 12l2.25-2.25M14.25 12 12 14.25m-2.58 4.92-6.374-6.375a1.125 1.125 0 0 1 0-1.59L9.42 4.83c.21-.21.47-.322.75-.322h9c.622 0 1.125.503 1.125 1.125v9a1.125 1.125 0 0 1-1.125 1.125h-9c-.28 0-.54-.112-.75-.322Z" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || code.length !== 4}
          className="w-full py-4 text-lg font-bold text-white bg-teal-500 rounded-lg transition-all duration-200 hover:bg-teal-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? t[language].loading : t[language].button}
        </button>

      </form>
       <style>{`
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          transform: translate3d(0, 0, 0);
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;