import React, { useState } from 'react';
import { ChatSummary, Language, ActionItem } from '../types';

interface SummaryActionsPanelProps {
  summary: ChatSummary | null;
  isLoading: boolean;
  language: Language;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const PriorityBadge: React.FC<{ priority: ActionItem['priority']; language: Language }> = ({ priority, language }) => {
    const priorityStyles = {
        High: {
            nl: 'Hoog',
            en: 'High',
            de: 'Hoch',
            classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        },
        Medium: {
            nl: 'Gemiddeld',
            en: 'Medium',
            de: 'Mittel',
            classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        },
        Low: {
            nl: 'Laag',
            en: 'Low',
            de: 'Niedrig',
            classes: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        },
    };

    const style = priorityStyles[priority] || priorityStyles.Medium;

    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${style.classes}`}>
            {style[language]}
        </span>
    );
};

const SummaryActionsPanel: React.FC<SummaryActionsPanelProps> = ({ summary, isLoading, language, isCollapsed, onToggleCollapse }) => {
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
    },
    de: {
      title: 'Zusammenfassung & Aktionen',
      summaryTitle: 'Gesprächszusammenfassung',
      actionsTitle: 'Aktions- / Aufmerksamkeitspunkte',
      waiting: 'Warten auf das erste Gespräch, um eine Zusammenfassung zu erstellen...',
      updating: 'Zusammenfassung wird aktualisiert...',
      copyAll: 'Alles kopieren',
      copied: 'Kopiert!',
    },
  };
  
  const handleCopy = () => {
    if (!summary || isCopied) return;

    const textToCopy = `
${t[language].summaryTitle.toUpperCase()}
--------------------
${summary.summary}

${t[language].actionsTitle.toUpperCase()}
--------------------
${summary.actions.map(action => `- [${action.priority}] ${action.text}`).join('\n')}
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <button onClick={onToggleCollapse} className="w-full p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-left">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" />
            </svg>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {!isCollapsed && (
        <div className="p-6 overflow-y-auto max-h-[calc(40vh)]">
            {summary && (
                <button
                    onClick={handleCopy}
                    disabled={isCopied}
                    className="absolute top-4 right-12 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:cursor-default"
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
                        </>
                    )}
                </button>
            )}

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
                        <ul className="space-y-3">
                            {summary.actions.map((action, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-24 flex justify-end">
                                    <PriorityBadge priority={action.priority} language={language} />
                                </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{action.text}</span>
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SummaryActionsPanel;