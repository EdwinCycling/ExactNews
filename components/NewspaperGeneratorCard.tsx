
import React from 'react';
import { Language } from '../types';

interface NewspaperGeneratorCardProps {
  onGenerate: () => void;
  isDisabled: boolean;
  language: Language;
}

const NewspaperGeneratorCard: React.FC<NewspaperGeneratorCardProps> = ({ onGenerate, isDisabled, language }) => {
  const t = {
    nl: {
      tooltipDisabled: "Selecteer minimaal 1 favoriete categorie om een krant te genereren.",
      tooltipEnabled: "Genereer de voorpagina van Exact's Daily",
      title: "Genereer Exact's Daily",
      descDisabled: "Selecteer 1 of meer favoriete categorieën.",
      descEnabled: "Creëer een unieke krantenvoorpagina op basis van uw favorieten.",
      iconTitle: "Kranten icoon",
    },
    en: {
      tooltipDisabled: "Select at least 1 favorite category to generate a newspaper.",
      tooltipEnabled: "Generate the front page of Exact's Daily",
      title: "Generate Exact's Daily",
      descDisabled: "Select 1 or more favorite categories.",
      descEnabled: "Create a unique newspaper front page based on your favorites.",
      iconTitle: "Newspaper icon",
    }
  }

  const tooltipText = isDisabled ? t[language].tooltipDisabled : t[language].tooltipEnabled;
  
  return (
     <div className="md:col-span-2 lg:col-span-3" title={tooltipText}>
        <button
          onClick={onGenerate}
          disabled={isDisabled}
          className="flex flex-col text-left bg-gradient-to-br from-teal-500/40 to-indigo-500/40 backdrop-blur-sm border-2 border-teal-400/80 rounded-xl shadow-2xl transition-all duration-300 ease-in-out hover:border-teal-300 hover:shadow-teal-400/20 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-400 w-full p-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-600 disabled:hover:border-gray-600 disabled:shadow-none disabled:hover:-translate-y-0"
          aria-label={tooltipText}
          aria-disabled={isDisabled}
        >
          <div className="flex-grow flex items-center">
            <div className="mr-6">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${isDisabled ? 'text-gray-500' : 'text-teal-300'} transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <title>{t[language].iconTitle}</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-extrabold text-2xl ${isDisabled ? 'text-slate-500' : 'text-white'} mb-2 transition-colors`}>
                {t[language].title}
              </h3>
              <p className={`text-md leading-relaxed ${isDisabled ? 'text-slate-600' : 'text-slate-200'} transition-colors`}>
                {isDisabled
                  ? t[language].descDisabled
                  : t[language].descEnabled
                }
              </p>
            </div>
          </div>
        </button>
      </div>
  );
};

export default NewspaperGeneratorCard;
