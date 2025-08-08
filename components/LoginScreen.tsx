import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface LoginScreenProps {
  onLogin: (code: string) => Promise<boolean>;
  language: Language;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, language }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const t = {
    nl: {
      title: "Welkom bij Exact's AI Daily",
      subtitle: "Voer de 4-cijferige toegangscode in.",
      button: "Ontgrendel",
      error: "Ongeldige code. Probeer het opnieuw.",
      unexpectedError: "Er is een onverwachte fout opgetreden. Controleer de console.",
      loading: "Controleren...",
      delete: "Wissen",
      showPassword: "Toon wachtwoord",
      hidePassword: "Verberg wachtwoord",
    },
    en: {
      title: "Welcome to Exact's AI Daily",
      subtitle: "Please enter the 4-digit access code.",
      button: "Unlock",
      error: "Invalid code. Please try again.",
      unexpectedError: "An unexpected error occurred. Check the console.",
      loading: "Checking...",
      delete: "Delete",
      showPassword: "Show password",
      hidePassword: "Hide password",
    },
    de: {
      title: "Willkommen bei Exact's AI Daily",
      subtitle: "Bitte geben Sie den 4-stelligen Zugangscode ein.",
      button: "Entsperren",
      error: "Ungültiger Code. Bitte versuchen Sie es erneut.",
      unexpectedError: "Ein unerwarteter Fehler ist aufgetreten. Überprüfen Sie die Konsole.",
      loading: "Überprüfen...",
      delete: "Löschen",
      showPassword: "Passwort anzeigen",
      hidePassword: "Passwort ausblenden",
    }
  };

  // Auto-focus on the first input field when component mounts
  useEffect(() => {
    const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  }, []);

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
              {code[i] ? (showPassword ? code[i] : '●') : ''}
            </div>
          ))}
        </div>

        {/* Password visibility toggle */}
        <div className="flex justify-center mb-4">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            {showPassword ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
                <span>{t[language].hidePassword}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>{t[language].showPassword}</span>
              </>
            )}
          </button>
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
          <div /> {/* Placeholder for alignment */}
          <button
            type="button"
            onClick={() => handleDigitClick(0)}
            disabled={isLoading}
            className="w-20 h-20 rounded-full bg-slate-100 dark:bg-gray-700/50 text-2xl font-semibold text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-gray-600 active:scale-90 disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isLoading}
            className="w-20 h-20 rounded-full bg-slate-100 dark:bg-gray-700/50 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-200 dark:hover:bg-gray-600 active:scale-90 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <title>{t[language].delete}</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 002.828 0L21 12M3 12l6.414-6.414a2 2 0 012.828 0L21 12" />
            </svg>
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || code.length !== 4}
          className="w-full py-4 text-lg font-bold text-white bg-teal-500 rounded-lg shadow-lg hover:bg-teal-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-teal-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? t[language].loading : t[language].button}
        </button>
      </form>
    </div>
  );
};

export default LoginScreen;
