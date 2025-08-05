import React from 'react';
import { ReadingLink, Language, ChatMessage } from '../types';

interface ReadingTableViewProps {
  links: ReadingLink[];
  isLoading: boolean;
  onGenerate: () => void;
  chatHistory: ChatMessage[];
  language: Language;
}

const ReadingTableView: React.FC<ReadingTableViewProps> = ({ links, isLoading, onGenerate, chatHistory, language }) => {
  const t = {
    nl: {
      title: 'De Leestafel',
      description: 'Vind aanvullende artikelen en bronnen op basis van uw gesprek.',
      buttonText: 'Vind artikelen',
      generating: 'Artikelen zoeken...',
      source: 'Bron:'
    },
    en: {
      title: 'The Reading Table',
      description: 'Find supplementary articles and resources based on your conversation.',
      buttonText: 'Find Articles',
      generating: 'Finding articles...',
      source: 'Source:'
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-slate-200/50 dark:bg-gray-700/50 rounded-lg">
                <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-1/3"></div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t[language].description}</p>
            </div>
        </div>
      </div>
      <div className="p-6">
        {links.length === 0 && !isLoading && (
            <button
                onClick={onGenerate}
                disabled={chatHistory.length < 2 || isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                {isLoading ? t[language].generating : t[language].buttonText}
            </button>
        )}
        {isLoading && <SkeletonLoader />}
        {links.length > 0 && !isLoading && (
             <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {links.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg bg-slate-100 dark:bg-gray-700/70 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors group"
                    >
                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{link.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                            {t[language].source} 
                            <span className="font-medium text-slate-600 dark:text-slate-300">{getHostname(link.url)}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </p>
                    </a>
                ))}
             </div>
        )}
      </div>
    </div>
  );
};

export default ReadingTableView;
