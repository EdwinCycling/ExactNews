import React from 'react';
import { Category, Language } from '../types';
import StarIcon from './StarIcon';

interface CategoryCardProps {
  category: Category;
  onSelect: () => void;
  onAskExpert: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  language: Language;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onSelect, onAskExpert, isFavorite, onToggleFavorite, language }) => {
  const title = category.title[language];
  const description = category.description[language];
  
  const t = {
    nl: { 
      select: `Selecteer categorie: ${title}`, 
      readNews: 'Lees Nieuws',
      askExpert: 'Vraag de Expert',
      startSession: 'Start Sessie',
      addFavorite: 'Voeg toe aan favorieten', 
      removeFavorite: 'Verwijder uit favorieten' 
    },
    en: { 
      select: `Select category: ${title}`, 
      readNews: 'Read News',
      askExpert: 'Ask Expert',
      startSession: 'Start Session',
      addFavorite: 'Add to favorites', 
      removeFavorite: 'Remove from favorites' 
    },
    de: {
      select: `Kategorie auswählen: ${title}`,
      readNews: 'Nachrichten lesen',
      askExpert: 'Experten fragen',
      startSession: 'Sitzung starten',
      addFavorite: 'Zu Favoriten hinzufügen',
      removeFavorite: 'Aus Favoriten entfernen'
    }
  }

  const isCpoRoleCard = category.key === 'cpo_role';

  return (
    <div className="relative flex flex-col text-left bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 w-full h-full">
      {!isCpoRoleCard && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200/80 dark:bg-gray-900/20 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-amber-500"
          aria-label={isFavorite ? t[language].removeFavorite : t[language].addFavorite}
        >
          <StarIcon filled={isFavorite} language={language} />
        </button>
      )}

      <div className="p-6 flex-grow">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 pr-8">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-auto px-6 py-3 bg-slate-100/60 dark:bg-gray-800/60 rounded-b-xl border-t border-gray-200 dark:border-gray-700 flex justify-center items-center gap-3">
        {isCpoRoleCard ? (
            <button 
                onClick={onSelect}
                className="w-full flex items-center justify-center px-3 py-2 text-sm font-semibold text-white bg-gradient-to-r from-teal-500 to-indigo-600 rounded-md hover:from-teal-600 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 shadow-md"
            >
                {t[language].startSession}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
            </button>
        ) : (
            <>
                <button 
                onClick={onSelect}
                className="w-full sm:w-auto flex items-center justify-center px-3 py-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
                >
                {t[language].readNews}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                </button>
                <button 
                onClick={onAskExpert}
                className="w-full sm:w-auto flex items-center justify-center px-3 py-2 text-sm font-semibold text-teal-600 dark:text-teal-400 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-gray-800 focus:ring-teal-500"
                >
                {t[language].askExpert}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.455.09-.934.09-1.425v-2.134c0-2.616.21-5.135 1.693-7.182a10.745 10.745 0 0 1 1.644-2.059c.754-1.168 2.16-1.884 3.86-1.884 3.313 0 6 2.687 6 6Z" />
                </svg>
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;