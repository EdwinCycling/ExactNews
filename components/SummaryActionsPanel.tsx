import React, { useState } from 'react';
import { ChatSummary, Language } from '../types';

interface SummaryActionsPanelProps {
  summary: ChatSummary | null;
  isLoading: boolean;
  language: Language;
}

const SummaryActionsPanel: React.FC<SummaryActionsPanelProps> = ({ summary, isLoading, language }) => {
  const [isCopied, setIsCopied] = useState(false);

  const t = {
    nl: {
      title: 'Samenvatting & Acties',
      summaryTitle: 'Gesprekssamenvatting',
      actionsTitle: 'Actie / Aandachtspunten',
      waiting: 'Wachten op het eerste gesprek om een samenvatting te genereren...',
      updating: 'Samenvatting bijwerken...',
      copyAll: 'Kopieer alles',
      copied: 'Gekopieerd!',
    },
    en: {
      title: 'Summary & Actions',
      summaryTitle: 'Conversation Summary',
      actionsTitle: 'Action / Attention Points',
      waiting: 'Waiting for the first conversation to generate a summary...',
      updating: 'Updating summary...',
      copyAll: 'Copy all',
      copied: 'Copied!',
    }
  };
  
  const handleCopy = () => {
    if (!summary || isCopied) return;

    const textToCopy = `
${t[language].summaryTitle.toUpperCase()}
--------------------
${summary.summary}

${t[language].actionsTitle.toUpperCase()}
--------------------
${summary.actions.map(action => `- ${action}`).join('\n')}
    `.trim();
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-full"></div>
        <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-1/2"></div>
      </div>
      <div className="space-y-3">
        <div className="flex items-start gap-2">
            <div className="h-4 w-4 mt-1 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-full"></div>
        </div>
        <div className="flex items-start gap-2">
            <div className="h-4 w-4 mt-1 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-5/6"></div>
        </div>
        <div className="flex items-start gap-2">
            <div className="h-4 w-4 mt-1 bg-slate-300 dark:bg-gray-600 rounded-full"></div>
            <div className="h-4 bg-slate-300 dark:bg-gray-600 rounded w-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sticky top-12 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
       <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
            </svg>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
        </div>
        {summary && (
            <button
                onClick={handleCopy}
                disabled={isCopied}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:cursor-default"
                title={isCopied ? t[language].copied : t[language].copyAll}
            >
                {isCopied ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-green-600 dark:text-green-400">{t[language].copied}</span>
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400">{t[language].copyAll}</span>
                    </>
                )}
            </button>
        )}
      </div>
      
      <div className="p-6 overflow-y-auto max-h-[calc(45vh)]">
        {isLoading && <LoadingSkeleton />}
        
        {!isLoading && !summary && (
            <div className="text-center text-slate-500 dark:text-slate-400 h-full flex items-center justify-center py-10">
                <p>{t[language].waiting}</p>
            </div>
        )}

        {!isLoading && summary && (
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">{t[language].summaryTitle}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{summary.summary}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">{t[language].actionsTitle}</h3>
                    <ul className="space-y-2">
                        {summary.actions.map((action, index) => (
                           <li key={index} className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-teal-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm text-slate-600 dark:text-slate-400">{action}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SummaryActionsPanel;