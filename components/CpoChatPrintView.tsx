import React from 'react';
import { ChatMessage, Language, Category, RoleTemplate, ChatSummary, ActionItem, ReadingLink, Book, TedTalkResponse, LinkedInLearningCourse } from '../types';

interface CpoChatPrintViewProps {
  onClose: () => void;
  language: Language;
  selectedCategory: Category | null;
  selectedRole: RoleTemplate | null;
  chatHistory: ChatMessage[];
  chatSummary: ChatSummary | null;
  userContext: string;
  infographicImage: string | null;
  includeInfographicInReport: boolean;
  books: Book[];
  readingLinks: ReadingLink[];
  tedTalks: TedTalkResponse | null;
  linkedInCourses: LinkedInLearningCourse[];
  feedbacks: { [index: number]: 'up' | null };
}

const PriorityBadge: React.FC<{ priority: ActionItem['priority']; language: Language }> = ({ priority, language }) => {
    const priorityStyles = {
        High: { nl: 'Hoog', en: 'High', de: 'Hoch', classes: 'border-red-500 text-red-700 bg-red-100 dark:border-red-400 dark:text-red-300 dark:bg-red-900/50' },
        Medium: { nl: 'Gemiddeld', en: 'Medium', de: 'Mittel', classes: 'border-amber-500 text-amber-700 bg-amber-100 dark:border-amber-400 dark:text-amber-300 dark:bg-amber-900/50' },
        Low: { nl: 'Laag', en: 'Low', de: 'Niedrig', classes: 'border-green-500 text-green-700 bg-green-100 dark:border-green-400 dark:text-green-300 dark:bg-green-900/50' },
    };
    const style = priorityStyles[priority] || priorityStyles.Medium;
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${style.classes}`}>
            {style[language]}
        </span>
    );
};

const CpoChatPrintView: React.FC<CpoChatPrintViewProps> = ({
  onClose,
  language,
  selectedCategory,
  selectedRole,
  chatHistory,
  chatSummary,
  userContext,
  infographicImage,
  includeInfographicInReport,
  books,
  readingLinks,
  tedTalks,
  linkedInCourses,
  feedbacks,
}) => {
  const t = {
    nl: {
      title: 'Rapport Strategiesessie',
      printReport: 'Print Rapport',
      backToChat: 'Terug naar Chat',
      sessionDetails: 'Sessie Details',
      expertise: 'Expertisegebied',
      expertRole: 'Rol van AI Expert',
      userNotes: 'Notities van de Gebruiker',
      conversationTranscript: 'Gesprekstranscript',
      sessionSummary: 'Samenvatting',
      actionPoints: 'Actiepunten',
      user: 'Gebruiker',
      expert: 'Expert',
      infographic: 'Infographic Samenvatting',
      recommendedBooks: 'Aanbevolen Boeken',
      readingTable: 'Aanbevolen Artikelen',
      recommendedTedTalks: 'Aanbevolen TED Talks',
      recommendedLinkedIn: 'Aanbevolen LinkedIn Learning Cursussen',
      watchTalk: 'Bekijk Talk',
      altInfographic: 'Infographic van de strategiesessie',
      by: 'door',
    },
    en: {
      title: 'Strategy Session Report',
      printReport: 'Print Report',
      backToChat: 'Back to Chat',
      sessionDetails: 'Session Details',
      expertise: 'Area of Expertise',
      expertRole: 'AI Expert Role',
      userNotes: 'User-Provided Notes',
      conversationTranscript: 'Conversation Transcript',
      sessionSummary: 'Summary',
      actionPoints: 'Action Points',
      user: 'User',
      expert: 'Expert',
      infographic: 'Infographic Summary',
      recommendedBooks: 'Recommended Books',
      readingTable: 'Recommended Articles',
      recommendedTedTalks: 'Recommended TED Talks',
      recommendedLinkedIn: 'Recommended LinkedIn Learning Courses',
      watchTalk: 'Watch Talk',
      altInfographic: 'Strategy session infographic',
      by: 'by',
    },
    de: {
      title: 'Bericht zur Strategiesitzung',
      printReport: 'Bericht drucken',
      backToChat: 'Zurück zum Chat',
      sessionDetails: 'Sitzungsdetails',
      expertise: 'Fachgebiet',
      expertRole: 'KI-Expertenrolle',
      userNotes: 'Vom Benutzer bereitgestellte Notizen',
      conversationTranscript: 'Gesprächsprotokoll',
      sessionSummary: 'Zusammenfassung',
      actionPoints: 'Aktionspunkte',
      user: 'Benutzer',
      expert: 'Experte',
      infographic: 'Infografik-Zusammenfassung',
      recommendedBooks: 'Empfohlene Bücher',
      readingTable: 'Empfohlene Artikel',
      recommendedTedTalks: 'Empfohlene TED-Vorträge',
      recommendedLinkedIn: 'Empfohlene LinkedIn Learning-Kurse',
      watchTalk: 'Vortrag ansehen',
      altInfographic: 'Infografik der Strategiesitzung',
      by: 'von',
    },
  };

  const handlePrint = () => {
    window.print();
  };

  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Handle lists
      if (line.match(/^\s*(\*|-)\s/)) {
        return <li key={i} className="ml-5 list-disc">{line.replace(/^\s*(\*|-)\s/, '')}</li>;
      }
      // Handle headings
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200">{line.substring(3)}</h2>
      }
      // Handle bold text
      return (
        <p key={i} className="mb-2 last:mb-0">
          {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
            part.startsWith('**') ? <strong key={j} className="font-bold text-slate-900 dark:text-slate-100">{part.slice(2, -2)}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-100 dark:bg-gray-900">
        <div className="w-full py-8 font-sans px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-wrap justify-between items-center gap-4 no-print">
                <div className="flex gap-4">
                <button
                    onClick={onClose}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
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
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {t[language].printReport}
                </button>
                </div>
            </div>

            <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg printable-area text-slate-700 dark:text-slate-300">
                <section className="mb-8 p-6 border rounded-lg bg-slate-50 dark:bg-gray-700/50">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].sessionDetails}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">{t[language].expertise}:</p>
                            <p className="text-slate-800 dark:text-slate-200">{selectedCategory?.title[language]}</p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-600 dark:text-slate-400">{t[language].expertRole}:</p>
                            <p className="text-slate-800 dark:text-slate-200">{selectedRole?.title[language]}</p>
                        </div>
                        {userContext && (
                            <div className="col-span-1 md:col-span-2">
                                <p className="font-semibold text-slate-600 dark:text-slate-400">{t[language].userNotes}:</p>
                                <blockquote className="border-l-4 border-slate-300 dark:border-gray-500 pl-4 italic text-slate-800 dark:text-slate-200">{userContext}</blockquote>
                            </div>
                        )}
                    </div>
                </section>

                {chatSummary && (
                    <section className="mb-8 break-inside-avoid">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].sessionSummary}</h2>
                        <p className="text-base mb-4 leading-relaxed">{chatSummary.summary}</p>

                        <h3 className="text-lg font-bold mb-3 text-slate-800 dark:text-slate-200">{t[language].actionPoints}</h3>
                        <ul className="space-y-3">
                            {chatSummary.actions.map((action, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-24 flex justify-start">
                                    <PriorityBadge priority={action.priority} language={language} />
                                </div>
                                <span className="text-sm flex-1">{action.text}</span>
                            </li>
                            ))}
                        </ul>
                    </section>
                )}

                {infographicImage && includeInfographicInReport && (
                    <section className="mb-8 break-after-page">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].infographic}</h2>
                        <img src={`data:image/png;base64,${infographicImage}`} alt={t[language].altInfographic} className="w-full h-auto rounded-md shadow-md border dark:border-gray-700" />
                    </section>
                )}

                {books.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].recommendedBooks}</h2>
                        <ul className="space-y-3">
                            {books.map((book, index) => (
                                <li key={index} className="p-3 border rounded-lg bg-slate-50 dark:bg-gray-700/50">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{book.title}</p>
                                    <p className="text-sm italic">{t[language].by} {book.author}</p>
                                    <a href={book.amazonSearchUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{book.amazonSearchUrl}</a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {linkedInCourses.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].recommendedLinkedIn}</h2>
                        <ul className="space-y-3">
                            {linkedInCourses.map((course, index) => (
                                <li key={index} className="p-3 border rounded-lg bg-slate-50 dark:bg-gray-700/50">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{course.title}</p>
                                    <p className="text-sm mt-1">{course.description}</p>
                                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{course.url}</a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {tedTalks && tedTalks.talks.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].recommendedTedTalks}</h2>
                        <div className="space-y-4">
                        {tedTalks.talks.map((talk, index) => (
                            <div key={index} className="p-3 border rounded-lg bg-slate-50 dark:bg-gray-700/50">
                                <p className="font-bold text-slate-800 dark:text-slate-200">{talk.title} - <span className="font-normal italic">{talk.speaker}</span></p>
                                <p className="text-sm mt-1">{talk.summary}</p>
                                <a href={talk.youtubeSearchUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{talk.youtubeSearchUrl}</a>
                            </div>
                        ))}
                        </div>
                    </section>
                )}

                 {readingLinks.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].readingTable}</h2>
                        <ul className="space-y-3">
                            {readingLinks.map((link, index) => (
                                <li key={index} className="p-3 border rounded-lg bg-slate-50 dark:bg-gray-700/50">
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{link.title}</p>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{link.url}</a>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                <section className="break-before-page">
                    <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-200">{t[language].conversationTranscript}</h2>
                    <div className="space-y-4 text-sm">
                        {chatHistory.map((msg, index) => {
                            if (msg.parts[0].text.startsWith('[SYSTEM]')) return null;

                            const isUpvoted = msg.role === 'model' && feedbacks[index] === 'up';

                            const baseClasses = 'p-4 rounded-lg border';
                            const userClasses = 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50 ml-8';
                            const modelClasses = 'bg-slate-50 dark:bg-gray-700/50 border-slate-200 dark:border-gray-700 mr-8';
                            const upvotedClasses = 'border-green-500 border-2 bg-green-50 dark:bg-green-900/20';
                            
                            const finalClasses = `${baseClasses} ${msg.role === 'user' ? userClasses : modelClasses} ${isUpvoted ? upvotedClasses : ''}`;

                            return (
                                <div key={index} className={finalClasses}>
                                    <p className="font-bold mb-2 text-slate-800 dark:text-slate-200">{msg.role === 'user' ? t[language].user : t[language].expert}:</p>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">{renderMessageContent(msg.parts[0].text)}</div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none; }
                    .printable-area { box-shadow: none; border: none; }
                    .break-before-page { page-break-before: always; }
                    .break-inside-avoid { page-break-inside: avoid; }
                    .break-after-page { page-break-after: always; }
                    a { color: #000 !important; text-decoration: none !important; }
                    a[href]:after { content: " (" attr(href) ")"; font-size: 0.8em; }
                    .bg-slate-50 { background-color: #f8fafc !important; }
                    .bg-white { background-color: #ffffff !important; }
                    .dark\:bg-gray-800 { background-color: #1f2937 !important; }
                    .dark\:bg-gray-700\/50 { background-color: rgba(55, 65, 81, 0.5) !important; }
                    .dark\:bg-green-900\/20 { background-color: rgba(16, 76, 44, 0.2) !important; }
                    .dark\:text-slate-200 { color: #e2e8f0 !important; }
                    .dark\:text-slate-300 { color: #cbd5e1 !important; }
                    .dark\:border-gray-700 { border-color: #374151 !important; }
                    .border-green-500 { border-color: #22c55e !important; }
                }
            `}</style>
        </div>
    </div>
  );
};

export default CpoChatPrintView;