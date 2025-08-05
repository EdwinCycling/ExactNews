import React from 'react';
import { ChatMessage, Language, Category, RoleTemplate, ChatSummary } from '../types';

interface CpoChatPrintViewProps {
  onClose: () => void;
  language: Language;
  selectedCategory: Category | null;
  selectedRole: RoleTemplate | null;
  chatHistory: ChatMessage[];
  chatSummary: ChatSummary | null;
}

const CpoChatPrintView: React.FC<CpoChatPrintViewProps> = ({
  onClose,
  language,
  selectedCategory,
  selectedRole,
  chatHistory,
  chatSummary,
}) => {
  const t = {
    nl: {
      title: 'Rapport Strategiesessie',
      printReport: 'Print Rapport',
      backToChat: 'Terug naar Chat',
      sessionDetails: 'Sessie Details',
      expertise: 'Expertisegebied',
      expertRole: 'Rol van AI Expert',
      conversationTranscript: 'Gesprekstranscript',
      sessionSummary: 'Samenvatting',
      actionPoints: 'Actiepunten',
      user: 'Gebruiker',
      expert: 'Expert',
    },
    en: {
      title: 'Strategy Session Report',
      printReport: 'Print Report',
      backToChat: 'Back to Chat',
      sessionDetails: 'Session Details',
      expertise: 'Area of Expertise',
      expertRole: 'AI Expert Role',
      conversationTranscript: 'Conversation Transcript',
      sessionSummary: 'Summary',
      actionPoints: 'Action Points',
      user: 'User',
      expert: 'Expert',
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.match(/^\s*(\*|-)\s/)) { // Simple list detection
        return <li key={i} className="ml-5 list-disc">{line.replace(/^\s*(\*|-)\s/, '')}</li>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>
      }
      return (
        <p key={i} className="mb-2">
          {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
            part.startsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 font-sans">
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h1>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t[language].backToChat}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            {t[language].printReport}
          </button>
        </div>
      </div>

      <div className="printable-area bg-white text-slate-900 p-8 sm:p-12 shadow-lg rounded-lg border border-gray-200">
        {/* Header Section */}
        <header className="border-b-2 border-slate-300 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-slate-800">{t[language].title}</h1>
          <p className="text-sm text-slate-500 mt-1">{new Date().toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { dateStyle: 'full' })}</p>
        </header>

        {/* Session Details */}
        <section className="mb-10 p-6 bg-slate-50 rounded-lg border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-700 border-b border-slate-200 pb-2 mb-4">{t[language].sessionDetails}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold text-slate-600 uppercase tracking-wider">{t[language].expertise}</p>
              <p className="text-slate-800 text-base">{selectedCategory?.title[language]}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600 uppercase tracking-wider">{t[language].expertRole}</p>
              <p className="text-slate-800 text-base">{selectedRole?.title[language]}</p>
            </div>
          </div>
        </section>

        {/* Transcript */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-700 border-b border-slate-200 pb-2 mb-6">{t[language].conversationTranscript}</h2>
          <div className="space-y-6">
            {chatHistory.filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]')).map((msg, index) => (
              <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'model' && (
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">ED</span>
                )}
                <div className={`max-w-lg rounded-lg p-4 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                  <p className="font-bold text-sm mb-2">{msg.role === 'user' ? t[language].user : t[language].expert}</p>
                  <div className="text-slate-800 prose prose-sm max-w-none">{renderMessageContent(msg.parts[0].text)}</div>
                </div>
                 {msg.role === 'user' && (
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">U</span>
                )}
              </div>
            ))}
          </div>
        </section>
        
        {/* Summary and Actions */}
        {chatSummary && (
            <section className="mt-12 pt-8 border-t-2 border-slate-300">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">{t[language].sessionSummary}</h2>
                        <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">{chatSummary.summary}</p>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-700 mb-4">{t[language].actionPoints}</h2>
                        <ul className="space-y-3">
                            {chatSummary.actions.map((action, index) => (
                               <li key={index} className="flex items-start gap-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-teal-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-slate-700">{action}</span>
                               </li>
                            ))}
                        </ul>
                    </div>
                 </div>
            </section>
        )}
      </div>
      <style>{`
        @media print {
          body {
            background-color: #fff;
          }
          .printable-area {
            box-shadow: none;
            border: none;
            padding: 0;
            color: #000;
          }
        }
      `}</style>
    </div>
  );
};

export default CpoChatPrintView;
