import React from 'react';
import { Category, Language } from '../types';
import StarIcon from './StarIcon';

interface CategoryCardProps {
  category: Category;
  onSelect: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  language: Language;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect, isFavorite, onToggleFavorite, language }) => {
  const title = category.title[language];
  const description = category.description[language];
  
  const t = {
    nl: { select: `Selecteer categorie: ${title}`, choose: 'Kies categorie', analyze: 'Analyseer data', addFavorite: 'Voeg toe aan favorieten', removeFavorite: 'Verwijder uit favorieten' },
    en: { select: `Select category: ${title}`, choose: 'Choose category', analyze: 'Analyze data', addFavorite: 'Add to favorites', removeFavorite: 'Remove from favorites' }
  }

  const buttonText = category.isDataCategory ? t[language].analyze : t[language].choose;

  return (
    <div className="relative w-full h-full">
      <button
        onClick={onSelect}
        className="flex flex-col text-left bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:border-indigo-500/70 dark:hover:border-indigo-400/70 hover:shadow-2xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 w-full h-full p-6"
        aria-label={t[language].select}
      >
        <div className="flex-grow">
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 pr-8">
            {title}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
        <div className="mt-4 text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center">
          {buttonText}
          {category.isDataCategory ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3M3.75 3H18M3.75 3v-1.5A2.25 2.25 0 0 1 6 0h12A2.25 2.25 0 0 1 20.25 1.5v1.5m-16.5 0h16.5" />
             </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          )}
        </div>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute top-3 right-3 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200/80 dark:bg-gray-900/20 dark:hover:bg-gray-700/50 transition-colors"
        aria-label={isFavorite ? t[language].removeFavorite : t[language].addFavorite}
      >
        <StarIcon filled={isFavorite} language={language} />
      </button>
    </div>
  );
};

export default CategoryCard;