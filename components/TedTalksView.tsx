import React from 'react';
import { TedTalkResponse, Language, ChatMessage } from '../types';

interface TedTalksViewProps {
  talksResponse: TedTalkResponse | null;
  isLoading: boolean;
  onGenerate: () => void;
  chatHistory: ChatMessage[];
  language: Language;
  disabled?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const TedTalksView: React.FC<TedTalksViewProps> = ({ talksResponse, isLoading, onGenerate, chatHistory, language, disabled = false, isCollapsed, onToggleCollapse }) => {
  const t = {
    nl: {
      title: 'TED Talks',
      description: 'Vind inspirerende TED Talks gerelateerd aan uw gesprek.',
      buttonText: 'Vind TED Talks',
      generating: 'Talks zoeken...',
      noTalksFound: 'Geen directe TED Talks gevonden over dit specifieke onderwerp.',
      suggestions: 'Misschien vindt u talks over deze gerelateerde onderwerpen interessant:',
      watchOnYouTube: 'Kijk op YouTube',
      refresh: 'Verversen',
    },
    en: {
      title: 'TED Talks',
      description: 'Find inspiring TED Talks related to your conversation.',
      buttonText: 'Find TED Talks',
      generating: 'Finding talks...',
      noTalksFound: 'No direct TED Talks found on this specific topic.',
      suggestions: 'You might be interested in talks on these related topics:',
      watchOnYouTube: 'Watch on YouTube',
      refresh: 'Refresh',
    },
    de: {
      title: 'TED Talks',
      description: 'Finden Sie inspirierende TED Talks zu Ihrem Gespräch.',
      buttonText: 'TED Talks finden',
      generating: 'Suche nach Vorträgen...',
      noTalksFound: 'Keine direkten TED Talks zu diesem speziellen Thema gefunden.',
      suggestions: 'Vielleicht interessieren Sie sich für Vorträge zu diesen verwandten Themen:',
      watchOnYouTube: 'Auf YouTube ansehen',
      refresh: 'Aktualisieren',
    },
  };

  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="p-3 bg-slate-200/50 dark:bg-gray-700/50 rounded-lg">
                <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-full mb-2.5"></div>
                <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
        ))}
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return <SkeletonLoader />;
    }

    if (!talksResponse) {
      return (
        <button
          onClick={onGenerate}
          disabled={chatHistory.length < 2 || isLoading || disabled}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
          </svg>
          {t[language].buttonText}
        </button>
      );
    }

    if (talksResponse.talks.length > 0) {
      return (
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {talksResponse.talks.map((talk, index) => (
            <div key={index} className="p-3 rounded-lg bg-slate-100 dark:bg-gray-700/70">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{talk.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{talk.speaker} &bull; {talk.publicationDate}</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{talk.summary}</p>
              <div className="flex items-center gap-4 mt-3">
                 <a href={talk.youtubeSearchUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline" aria-label={`${t[language].watchOnYouTube}: ${talk.title}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.89 3.43 .466 7.62.466 12s.423 8.57 3.919 8.816c3.6.245 11.626.246 15.23 0C23.11 20.57 23.534 16.38 23.534 12s-.423-8.57-3.919-8.816zM9.709 15.807V8.193l6.543 3.807-6.543 3.807z"></path></svg>
                    {t[language].watchOnYouTube}
                </a>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (talksResponse.relatedSuggestions && talksResponse.relatedSuggestions.length > 0) {
      return (
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{t[language].noTalksFound}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{t[language].suggestions}</p>
          <ul className="list-disc list-inside space-y-1">
            {talksResponse.relatedSuggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-slate-700 dark:text-slate-300">{suggestion}</li>
            ))}
          </ul>
        </div>
      );
    }

    return <p>{t[language].noTalksFound}</p>;
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <button onClick={onToggleCollapse} className="w-full p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-left">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9A2.25 2.25 0 0 0 13.5 5.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z" />
          </svg>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
            {talksResponse && !isLoading && (
              <button
                  onClick={(e) => { e.stopPropagation(); onGenerate(); }}
                  disabled={disabled || isLoading}
                  title={t[language].refresh}
                  className="p-1 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
                  <span className="sr-only">{t[language].refresh}</span>
              </button>
            )}
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {!isCollapsed && (
        <div className="p-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 -mt-2">{t[language].description}</p>
            {renderContent()}
        </div>
      )}
    </div>
  );
};

export default TedTalksView;