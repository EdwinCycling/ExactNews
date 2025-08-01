import React from 'react';
import { Language } from '../types';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
  language: Language;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, language }) => {
  const ExclamationIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
  
  return (
    <div className="flex flex-col items-center justify-center text-center bg-red-100/50 dark:bg-red-900/20 border border-red-300/50 dark:border-red-500/50 rounded-lg p-8 max-w-md mx-auto">
      {ExclamationIcon}
      <h3 className="mt-4 text-xl font-semibold text-red-800 dark:text-red-300">{language === 'nl' ? 'Er is een fout opgetreden' : 'An error occurred'}</h3>
      <p className="mt-2 text-red-600 dark:text-red-400">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="mt-6 px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-100 dark:focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
      >
        {language === 'nl' ? 'Probeer opnieuw' : 'Try again'}
      </button>
    </div>
  );
};

export default ErrorMessage;