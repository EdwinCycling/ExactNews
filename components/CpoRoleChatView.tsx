
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, Category, RoleTemplate, ChatSummary, ReadingLink } from '../types';
import ChatView from './ChatView';
import SummaryActionsPanel from './SummaryActionsPanel';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { generateMotivationalActionsPodcast, generateChatPodcastSummary, generateReadingTableLinks, advancedInstructions_nl, advancedInstructions_en } from '../services/geminiService';
import ReadingTableView from './ReadingTableView';

interface CpoRoleChatViewProps {
  onGoBack: () => void;
  language: Language;
  selectedCategory: Category | null;
  selectedRole: RoleTemplate | null;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  onAskSuggestedQuestion: (question: string) => void;
  isChatLoading: boolean;
  chatSummary: ChatSummary | null;
  isSummaryPanelLoading: boolean;
  roles: RoleTemplate[];
  onSwitchRole: (role: RoleTemplate) => void;
  onPrint: () => void;
  isAdvancedMode: boolean;
  onToggleAdvancedMode: () => void;
}

const CpoRoleChatView: React.FC<CpoRoleChatViewProps> = ({
  onGoBack,
  language,
  selectedCategory,
  selectedRole,
  chatHistory,
  onSendMessage,
  onAskSuggestedQuestion,
  isChatLoading,
  chatSummary,
  isSummaryPanelLoading,
  roles,
  onSwitchRole,
  onPrint,
  isAdvancedMode,
  onToggleAdvancedMode,
}) => {
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [showAdvancedInstructions, setShowAdvancedInstructions] = useState(false);

  const [nowPlaying, setNowPlaying] = useState<'summary' | 'actions' | null>(null);
  const [isSummaryPodcastLoading, setIsSummaryPodcastLoading] = useState(false);
  const [isActionsPodcastLoading, setIsActionsPodcastLoading] = useState(false);
  
  const [readingLinks, setReadingLinks] = useState<ReadingLink[]>([]);
  const [isReadingLinksLoading, setIsReadingLinksLoading] = useState(false);

  const { play, cancel } = useTextToSpeech({
      language,
      onBoundary: () => {}, // Not needed here
      onEnd: () => {
        setNowPlaying(null);
      }
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setIsRoleSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const t = {
    nl: {
      backToSetup: 'Nieuwe Sessie',
      personaTitle: 'Huidige AI Expert Rol',
      suggestedQuestionTitle: 'Voorgestelde vervolgvraag:',
      askButton: 'Voer uit',
      switchRole: 'Wijzig Rol',
      listenSummaryPodcast: 'Samenvatting podcast',
      stopSummaryPodcast: 'Stop podcast',
      listenActionsPodcast: 'De motivator coach',
      stopActionsPodcast: 'Stop Coach',
      generating: 'Genereren...',
      printReport: 'Print Rapport',
      advancedMode: 'Geavanceerde Modus',
      showInstructions: 'Toon instructies',
      hideInstructions: 'Verberg instructies',
    },
    en: {
      backToSetup: 'New Session',
      personaTitle: 'Current AI Expert Role',
      suggestedQuestionTitle: 'Suggested follow-up question:',
      askButton: 'Execute',
      switchRole: 'Switch Role',
      listenSummaryPodcast: 'Summary Podcast',
      stopSummaryPodcast: 'Stop Podcast',
      listenActionsPodcast: 'The Motivator Coach',
      stopActionsPodcast: 'Stop Coach',
      generating: 'Generating...',
      printReport: 'Print Report',
      advancedMode: 'Advanced Mode',
      showInstructions: 'Show instructions',
      hideInstructions: 'Hide instructions',
    }
  };
  
  const instructionsText = language === 'nl' ? advancedInstructions_nl : advancedInstructions_en;

  const personaText = selectedRole && selectedCategory 
    ? selectedRole.text[language].replace(/{category}/g, selectedCategory.title[language])
    : '';

  const handlePlaySummaryPodcast = async () => {
    if (!chatHistory || chatHistory.length === 0 || !selectedCategory || !selectedRole) return;
    
    setIsSummaryPodcastLoading(true);
    setNowPlaying(null);
    try {
        const podcastText = await generateChatPodcastSummary({
            history: chatHistory,
            category: selectedCategory,
            role: selectedRole,
            language: language
        });
        play([{ text: podcastText, id: 'summary' }]);
        setNowPlaying('summary');
    } catch (error) {
        console.error("Error generating summary podcast:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(message);
        setNowPlaying(null);
    } finally {
        setIsSummaryPodcastLoading(false);
    }
  };

  const handlePlayActionsPodcast = async () => {
      if (!chatSummary?.actions || chatSummary.actions.length === 0) return;
      
      setIsActionsPodcastLoading(true);
      setNowPlaying(null);
      try {
          const podcastText = await generateMotivationalActionsPodcast(chatSummary.actions, language);
          play([{ text: podcastText, id: 'actions' }]);
          setNowPlaying('actions');
      } catch (error) {
          console.error("Error generating actions podcast:", error);
          const message = error instanceof Error ? error.message : "An unknown error occurred.";
          alert(message);
          setNowPlaying(null);
      } finally {
          setIsActionsPodcastLoading(false);
      }
  };

  const handleStopPodcast = () => {
      cancel();
  };
  
  const handleGenerateReadingTable = async () => {
    if (chatHistory.length < 2 || isReadingLinksLoading) return;

    setIsReadingLinksLoading(true);
    try {
        const links = await generateReadingTableLinks(chatHistory, language);
        setReadingLinks(links);
    } catch (error) {
        console.error("Error generating reading table:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(message);
    } finally {
        setIsReadingLinksLoading(false);
    }
  };


  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <button
          onClick={onGoBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t[language].backToSetup}
        </button>
        
        {chatSummary && chatHistory.length > 1 && (
          <div className="flex flex-wrap gap-4">
              <button
                onClick={onPrint}
                disabled={nowPlaying !== null || isChatLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {t[language].printReport}
              </button>
              {/* Summary Podcast Button */}
              {nowPlaying === 'summary' ? (
                  <button
                      onClick={handleStopPodcast}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      {t[language].stopSummaryPodcast}
                  </button>
              ) : (
                  <button
                      onClick={handlePlaySummaryPodcast}
                      disabled={nowPlaying !== null || isActionsPodcastLoading || isChatLoading || isSummaryPodcastLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isSummaryPodcastLoading ? (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2-2H4a2 2 0 01-2-2v-3z" />
                          </svg>
                      )}
                      {isSummaryPodcastLoading ? t[language].generating : t[language].listenSummaryPodcast}
                  </button>
              )}

              {/* Actions Podcast Button */}
              {nowPlaying === 'actions' ? (
                  <button
                      onClick={handleStopPodcast}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      {t[language].stopActionsPodcast}
                  </button>
              ) : (
                  <button
                      onClick={handlePlayActionsPodcast}
                      disabled={nowPlaying !== null || isActionsPodcastLoading || isChatLoading || isSummaryPodcastLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isActionsPodcastLoading ? (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                          </svg>
                      )}
                      {isActionsPodcastLoading ? t[language].generating : t[language].listenActionsPodcast}
                  </button>
              )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Persona and Chat */}
        <div className="lg:w-2/3 flex flex-col gap-8">
          <div className="flex bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-l-4 border-teal-400 dark:border-teal-500 rounded-r-lg shadow-md">
            <div className="p-6 flex-grow">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-2">
                {t[language].personaTitle}
              </h2>
              <blockquote className="text-slate-600 dark:text-slate-300">
                "{personaText}"
              </blockquote>
              <div className="mt-4 pt-4 border-t border-teal-400/20 dark:border-teal-500/20">
                <div className="flex items-center justify-between">
                    <label htmlFor="advanced-mode-toggle" className="flex items-center cursor-pointer">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 mr-3">{t[language].advancedMode}</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="advanced-mode-toggle"
                                className="sr-only peer"
                                checked={isAdvancedMode}
                                onChange={onToggleAdvancedMode}
                                disabled={isChatLoading}
                            />
                            <div className="block bg-gray-300 dark:bg-gray-600 w-12 h-6 rounded-full transition-colors peer-checked:bg-teal-500"></div>
                            <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6"></div>
                        </div>
                    </label>
                    <button
                        onClick={() => setShowAdvancedInstructions(prev => !prev)}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                        {showAdvancedInstructions ? t[language].hideInstructions : t[language].showInstructions}
                    </button>
                </div>
                {showAdvancedInstructions && (
                    <div className="mt-4 p-3 bg-slate-100 dark:bg-gray-700 rounded-lg text-xs text-slate-500 dark:text-slate-400 max-h-48 overflow-y-auto">
                        <pre className="whitespace-pre-wrap font-sans">{instructionsText.replace(/{category}/g, selectedCategory?.title[language] ?? '')}</pre>
                    </div>
                )}
              </div>
            </div>
            
            {chatHistory.length > 0 && (
              <div className="relative flex-shrink-0 border-l border-teal-400/20 dark:border-teal-500/20 flex items-center justify-center" ref={switcherRef}>
                <button
                  onClick={() => setIsRoleSwitcherOpen(prev => !prev)}
                  className="p-4 h-full w-full flex flex-col items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>{t[language].switchRole}</span>
                </button>
                {isRoleSwitcherOpen && (
                  <div className="absolute z-10 right-0 bottom-full mb-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none origin-bottom-right">
                    <div className="py-1 max-h-80 overflow-y-auto">
                      {roles.filter(r => r.key !== selectedRole?.key).map(role => (
                        <button
                          key={role.key}
                          onClick={() => {
                            onSwitchRole(role);
                            setIsRoleSwitcherOpen(false);
                          }}
                          className="w-full text-left block px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="font-semibold block text-slate-800 dark:text-slate-200">{role.title[language]}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block mt-1">
                            {role.text[language].replace(/{category}/g, selectedCategory?.title[language] ?? '').split('.')[0]}.
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-grow flex flex-col">
            <ChatView 
              history={chatHistory} 
              onSendMessage={onSendMessage}
              isLoading={isChatLoading}
              language={language}
              selectedCategory={selectedCategory}
              isExpertMode={true}
            />

            {chatSummary?.suggestedQuestion && !isChatLoading && (
              <div className="mt-6 p-4 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 transition-opacity duration-300 animate-fade-in">
                  <div>
                      <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{t[language].suggestedQuestionTitle}</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-1">"{chatSummary.suggestedQuestion}"</p>
                  </div>
                  <button 
                    onClick={() => onAskSuggestedQuestion(chatSummary.suggestedQuestion)}
                    className="flex-shrink-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    disabled={isChatLoading}
                  >
                    {t[language].askButton}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 ml-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                  </button>
              </div>
            )}
            <style>{`
              @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
              }
            `}</style>
          </div>
        </div>
        
        {/* Right Column: Summary Panel & Reading Table */}
        <div className="lg:w-1/3 flex flex-col gap-8">
          <SummaryActionsPanel 
            summary={chatSummary}
            isLoading={isSummaryPanelLoading}
            language={language}
          />
          {chatHistory.length > 1 && (
             <ReadingTableView
                links={readingLinks}
                isLoading={isReadingLinksLoading}
                onGenerate={handleGenerateReadingTable}
                chatHistory={chatHistory}
                language={language}
              />
          )}
        </div>
      </div>
    </div>
  );
};

export default CpoRoleChatView;
