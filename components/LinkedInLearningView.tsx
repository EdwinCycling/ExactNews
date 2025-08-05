import React from 'react';
import { LinkedInLearningCourse, Language, ChatMessage } from '../types';

interface LinkedInLearningViewProps {
  courses: LinkedInLearningCourse[];
  isLoading: boolean;
  onGenerate: () => void;
  chatHistory: ChatMessage[];
  language: Language;
  disabled?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const LinkedInLearningView: React.FC<LinkedInLearningViewProps> = ({ courses, isLoading, onGenerate, chatHistory, language, disabled = false, isCollapsed, onToggleCollapse }) => {
  const t = {
    nl: {
      title: 'LinkedIn Learning',
      description: 'Vind professionele cursussen gerelateerd aan uw gesprek.',
      buttonText: 'Vind Cursussen',
      generating: 'Cursussen zoeken...',
      viewCourse: 'Bekijk Cursus',
      refresh: 'Verversen',
    },
    en: {
      title: 'LinkedIn Learning',
      description: 'Find professional courses related to your conversation.',
      buttonText: 'Find Courses',
      generating: 'Finding courses...',
      viewCourse: 'View Course',
      refresh: 'Refresh',
    },
    de: {
      title: 'LinkedIn Learning',
      description: 'Finden Sie professionelle Kurse zu Ihrem Gespräch.',
      buttonText: 'Kurse finden',
      generating: 'Kurse werden gesucht...',
      viewCourse: 'Kurs ansehen',
      refresh: 'Aktualisieren',
    },
  };

  const SkeletonLoader = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(2)].map((_, i) => (
            <div key={i} className="p-3 bg-slate-200/50 dark:bg-gray-700/50 rounded-lg">
                <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-full mb-1"></div>
                <div className="h-3 bg-slate-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <button onClick={onToggleCollapse} className="w-full p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-left">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.77-11.433H3.566v11.433h3.541V-4z"></path>
            </svg>
            <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
                {courses.length > 0 && !isLoading && (
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
            {courses.length === 0 && !isLoading && (
                <button
                    onClick={onGenerate}
                    disabled={chatHistory.length < 2 || isLoading || disabled}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    {isLoading ? t[language].generating : t[language].buttonText}
                </button>
            )}
            {isLoading && <SkeletonLoader />}
            {courses.length > 0 && !isLoading && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {courses.map((course, index) => (
                        <div key={index} className="p-3 rounded-lg bg-slate-100 dark:bg-gray-700/70">
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{course.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{course.description}</p>
                            <a
                                href={course.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                            >
                                {t[language].viewCourse} &rarr;
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default LinkedInLearningView;