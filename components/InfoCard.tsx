

import React from 'react';
import { Language } from '../types';

interface InfoCardProps {
  onShowInfo: () => void;
  language: Language;
}

const InfoCard: React.FC<InfoCardProps> = ({ onShowInfo, language }) => {
  const t = {
    nl: { title: "Info", tooltip: "Bekijk de functies van deze app" },
    en: { title: "Info", tooltip: "View the features of this app" },
    de: { title: "Info", tooltip: "Funktionen dieser App anzeigen" },
  };

  return (
    <div title={t[language].tooltip}>
      <button
        onClick={onShowInfo}
        className="flex flex-col text-left justify-center items-center bg-gradient-to-br from-indigo-500/40 to-purple-500/40 backdrop-blur-sm border-2 border-indigo-400/80 rounded-xl shadow-2xl transition-all duration-300 ease-in-out hover:border-indigo-300 hover:shadow-indigo-400/20 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-400 w-full p-6 h-full"
        aria-label={t[language].tooltip}
      >
        <div className="flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600 dark:text-indigo-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
            </svg>
            <h3 className="font-extrabold text-2xl text-slate-800 dark:text-white">
                {t[language].title}
            </h3>
        </div>
      </button>
    </div>
  );
};

export default InfoCard;