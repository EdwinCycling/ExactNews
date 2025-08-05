import React from 'react';
import { Article, Language } from '../types';
import StarRating from './StarRating';

interface ArticleCardProps {
  article: Article;
  language: Language;
  isSpeaking?: boolean;
}

const formatDate = (isoDate: string, lang: Language): { formattedDate: string; daysAgo: string } => {
  const localeMap: { [key in Language]: string } = {
    en: 'en-US',
    nl: 'nl-NL',
    de: 'de-DE',
  };
  const locale = localeMap[lang] || 'en-US';
  
  const t = {
    nl: { unknownDate: 'Onbekende datum', today: 'Vandaag' },
    en: { unknownDate: 'Unknown date', today: 'Today' },
    de: { unknownDate: 'Unbekanntes Datum', today: 'Heute' },
  }
  
  if (!isoDate || isNaN(new Date(isoDate).getTime())) {
    return { formattedDate: t[lang].unknownDate, daysAgo: '' };
  }
  
  const date = new Date(isoDate);
  const formattedDate = date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  let daysAgo = '';
  if (diffDays === 0) {
    daysAgo = t[lang].today;
  } else {
    daysAgo = rtf.format(-diffDays, 'day');
  }

  return { formattedDate, daysAgo };
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article, language, isSpeaking = false }) => {
  const { formattedDate, daysAgo } = formatDate(article.publicationDate, language);
  
  const t_read = {
      nl: 'Lees volledig artikel',
      en: 'Read full article',
      de: 'Ganzen Artikel lesen',
  }

  const ArrowUpRightIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
    </svg>
  );

  const baseClasses = 'flex flex-col bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-all duration-300 ease-in-out';
  const speakingClasses = 'ring-4 ring-teal-400 dark:ring-teal-500 ring-offset-4 ring-offset-gray-100 dark:ring-offset-gray-900 animate-pulse';
  const interactiveClasses = 'hover:border-teal-500/70 dark:hover:border-teal-400/70 hover:shadow-2xl hover:-translate-y-1';

  return (
    <div className={`${baseClasses} ${isSpeaking ? speakingClasses : interactiveClasses}`}>
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/50 px-2 py-1 rounded">
            {article.sourceName}
          </span>
          <StarRating rating={article.rating} language={language} />
        </div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-3">
          {article.title}
        </h3>
        <div className="text-xs text-slate-500 mb-3">
            <span>{formattedDate}</span>
            <span className="mx-1.5">&bull;</span>
            <span>{daysAgo}</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-6">
          {article.summary}
        </p>
      </div>
      <div className="px-6 py-4 bg-slate-100/60 dark:bg-gray-800/60 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300 transition-colors duration-200"
        >
          {t_read[language]}
          {ArrowUpRightIcon}
        </a>
      </div>
    </div>
  );
};

export default ArticleCard;