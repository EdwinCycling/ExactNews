import React from 'react';
import { SortOrder, Language } from '../types';

interface SortControlsProps {
  activeSort: SortOrder;
  onSortChange: (sortOrder: Exclude<SortOrder, null>) => void;
  language: Language;
}

const SortControls: React.FC<SortControlsProps> = ({ activeSort, onSortChange, language }) => {
  
  const t = {
    nl: { sortBy: 'Sorteer op:', date: 'Datum', rating: 'Belang' },
    en: { sortBy: 'Sort by:', date: 'Date', rating: 'Importance' },
    de: { sortBy: 'Sortieren nach:', date: 'Datum', rating: 'Wichtigkeit' },
  }

  const sortOptions: { key: Exclude<SortOrder, null>; label: string }[] = [
    { key: 'date', label: t[language].date },
    { key: 'rating', label: t[language].rating },
  ];

  const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900';
  const activeClasses = 'bg-teal-500 text-white shadow-lg';
  const inactiveClasses = 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-gray-700 dark:text-slate-300 dark:hover:bg-gray-600';

  return (
    <div className="flex justify-center items-center space-x-3 my-8">
      <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t[language].sortBy}</span>
      <div className="flex space-x-2 p-1 bg-slate-100/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
        {sortOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSortChange(key)}
            className={`${baseClasses} ${activeSort === key ? activeClasses : inactiveClasses}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortControls;