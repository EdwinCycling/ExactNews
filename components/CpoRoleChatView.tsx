import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, Category, RoleTemplate, ChatSummary, ReadingLink, Book, TedTalkResponse, LinkedInLearningCourse } from '../types';
import { ChatView } from './ChatView';
import SummaryActionsPanel from './SummaryActionsPanel';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { generateMotivationalActionsPodcast, generateChatPodcastSummary, advancedInstructions_nl, advancedInstructions_en, advancedInstructions_de } from '../services/geminiService';
import ReadingTableView from './ReadingTableView';
import UserContextView from './UserContextView';
import BookAdviserView from './BookAdviserView';
import InfographicModal from './InfographicModal';
import TedTalksView from './TedTalksView';
import LinkedInLearningView from './LinkedInLearningView';

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
  userContext: string;
  onSetUserContext: (context: string) => void;
  feedbacks: { [index: number]: 'up' | null };
  onSetFeedback: (messageIndex: number, feedback: 'up') => void;
  onDeleteMessage: (messageIndex: number) => void;
  onGenerateInfographic: () => void;
  isInfographicLoading: boolean;
  infographicImage: string | null;
  showInfographicModal: boolean;
  onSetShowInfographicModal: (show: boolean) => void;
  infographicGenerationCount: number;
  includeInfographicInReport: boolean;
  onSetIncludeInfographicInReport: (include: boolean) => void;
  summaryPodcastCount: number;
  onIncrementSummaryPodcastCount: () => void;
  actionsPodcastCount: number;
  onIncrementActionsPodcastCount: () => void;
  onGenerateReadingTable: () => void;
  isReadingLinksLoading: boolean;
  readingLinks: ReadingLink[];
  onGenerateBooks: () => void;
  isBooksLoading: boolean;
  books: Book[];
  onGenerateTedTalks: () => void;
  isTedTalksLoading: boolean;
  tedTalks: TedTalkResponse | null;
  onGenerateLinkedInCourses: () => void;
  isLinkedInCoursesLoading: boolean;
  linkedInCourses: LinkedInLearningCourse[];
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
  userContext,
  onSetUserContext,
  feedbacks,
  onSetFeedback,
  onDeleteMessage,
  onGenerateInfographic,
  isInfographicLoading,
  infographicImage,
  showInfographicModal,
  onSetShowInfographicModal,
  infographicGenerationCount,
  summaryPodcastCount,
  onIncrementSummaryPodcastCount,
  actionsPodcastCount,
  onIncrementActionsPodcastCount,
  onGenerateReadingTable,
  isReadingLinksLoading,
  readingLinks,
  onGenerateBooks,
  isBooksLoading,
  books,
  onGenerateTedTalks,
  isTedTalksLoading,
  tedTalks,
  onGenerateLinkedInCourses,
  isLinkedInCoursesLoading,
  linkedInCourses,
}) => {
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);
  const [showAdvancedInstructions, setShowAdvancedInstructions] = useState(false);

  const [nowPlaying, setNowPlaying] = useState<'summary' | 'actions' | null>(null);
  const [isSummaryPodcastLoading, setIsSummaryPodcastLoading] = useState(false);
  const [isActionsPodcastLoading, setIsActionsPodcastLoading] = useState(false);
  
  const [collapsedPanels, setCollapsedPanels] = useState({
    summary: false,
    notes: true,
    books: true,
    ted: true,
    linkedin: true,
    reading: true,
  });

  const handleToggleCollapse = (panel: keyof typeof collapsedPanels) => {
    setCollapsedPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

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
      createInfographic: 'Maak Infographic',
      regenerateInfographic: 'Hergenereer Infographic',
      infographicLimitReached: 'Limiet bereikt',
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
      createInfographic: 'Create Infographic',
      regenerateInfographic: 'Regenerate Infographic',
      infographicLimitReached: 'Limit Reached',
    },
    de: {
      backToSetup: 'Neue Sitzung',
      personaTitle: 'Aktuelle KI-Expertenrolle',
      suggestedQuestionTitle: 'Vorgeschlagene Folgefrage:',
      askButton: 'Ausführen',
      switchRole: 'Rolle wechseln',
      listenSummaryPodcast: 'Zusammenfassungs-Podcast',
      stopSummaryPodcast: 'Podcast stoppen',
      listenActionsPodcast: 'Der Motivationscoach',
      stopActionsPodcast: 'Coach stoppen',
      generating: 'Wird generiert...',
      printReport: 'Bericht drucken',
      advancedMode: 'Erweiterter Modus',
      showInstructions: 'Anweisungen anzeigen',
      hideInstructions: 'Anweisungen ausblenden',
      createInfographic: 'Infografik erstellen',
      regenerateInfographic: 'Infografik neu erstellen',
      infographicLimitReached: 'Limit erreicht',
    },
  };
  
  const instructionsMap = { nl: advancedInstructions_nl, en: advancedInstructions_en, de: advancedInstructions_de };
  const instructionsText = instructionsMap[language];

  const personaText = selectedRole && selectedCategory 
    ? selectedRole.text[language].replace(/{category}/g, selectedCategory.title[language])
    : '';

  const handlePlaySummaryPodcast = async () => {
    if (!chatHistory || chatHistory.length === 0 || !selectedCategory || !selectedRole || summaryPodcastCount >= 2) return;
    
    setIsSummaryPodcastLoading(true);
    setNowPlaying(null);
    try {
        onIncrementSummaryPodcastCount();
        const podcastText = await generateChatPodcastSummary({
            history: chatHistory,
            category: selectedCategory,
            role: selectedRole,
            language: language,
            userContext: userContext
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
      if (!chatSummary?.actions || chatSummary.actions.length === 0 || actionsPodcastCount >= 2) return;
      
      setIsActionsPodcastLoading(true);
      setNowPlaying(null);
      try {
          onIncrementActionsPodcastCount();
          const podcastText = await generateMotivationalActionsPodcast(chatSummary.actions, language, userContext);
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
  
  const anyInteractionLoading = isChatLoading || isInfographicLoading || isReadingLinksLoading || isBooksLoading || isTedTalksLoading || isLinkedInCoursesLoading;

  return (
    <div>
       {showInfographicModal && (
        <InfographicModal
          imageUrl={infographicImage}
          isLoading={isInfographicLoading}
          onClose={() => onSetShowInfographicModal(false)}
          language={language}
        />
      )}
      <div className="mb-8 flex flex-wrap justify-between items-center gap-4">
        <button
          onClick={onGoBack}
          disabled={anyInteractionLoading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t[language].backToSetup}
        </button>
        
        {chatSummary && chatHistory.length > 1 && (
          <div className="flex flex-wrap gap-4">
               {/* Infographic Button */}
              <button
                onClick={onGenerateInfographic}
                disabled={nowPlaying !== null || anyInteractionLoading || infographicGenerationCount >= 2}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-pink-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isInfographicLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                  ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125-1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                     </svg>
                  )}
                  {isInfographicLoading 
                      ? t[language].generating 
                      : (infographicGenerationCount > 0 ? t[language].regenerateInfographic : t[language].createInfographic)
                  }
                  {` (${infographicGenerationCount}/2)`}
              </button>
              <button
                onClick={onPrint}
                disabled={nowPlaying !== null || anyInteractionLoading}
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
                      disabled={nowPlaying !== null || anyInteractionLoading || isSummaryPodcastLoading || summaryPodcastCount >= 2}
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
                      {isSummaryPodcastLoading ? t[language].generating : `${t[language].listenSummaryPodcast} (${summaryPodcastCount}/2)`}
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
                      disabled={nowPlaying !== null || anyInteractionLoading || isActionsPodcastLoading || actionsPodcastCount >= 2}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isActionsPodcastLoading ? (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                      )}
                      {isActionsPodcastLoading ? t[language].generating : `${t[language].listenActionsPodcast} (${actionsPodcastCount}/2)`}
                  </button>
              )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chat Panel */}
        <div className="lg:col-span-2">
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl mb-4">
              <div className="flex justify-between items-start">
                  <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].personaTitle}: {selectedRole?.title[language]}</h3>
                      <blockquote className="mt-1 text-sm text-slate-600 dark:text-slate-400 italic">"{personaText}"</blockquote>
                  </div>
                  <div className="relative" ref={switcherRef}>
                    <button
                        onClick={() => setIsRoleSwitcherOpen(prev => !prev)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 rounded-md hover:bg-slate-300 dark:hover:bg-gray-600 transition-colors"
                    >
                        {t[language].switchRole}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                    </button>
                    {isRoleSwitcherOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-10">
                        {roles.map(role => (
                            <button
                            key={role.key}
                            disabled={role.key === selectedRole?.key}
                            onClick={() => { onSwitchRole(role); setIsRoleSwitcherOpen(false); }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:bg-slate-100/80 dark:disabled:bg-gray-700/80"
                            >
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{role.title[language]}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{role.text[language].substring(0, 50)}...</p>
                            </button>
                        ))}
                        </div>
                    )}
                  </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600 flex justify-between items-center">
                <div className="flex items-center">
                    <label htmlFor="advanced-mode-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input type="checkbox" id="advanced-mode-toggle" className="sr-only" checked={isAdvancedMode} onChange={onToggleAdvancedMode} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${isAdvancedMode ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-600'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAdvancedMode ? 'translate-x-full' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t[language].advancedMode}
                    </div>
                    </label>
                </div>
                 {isAdvancedMode && (
                  <button onClick={() => setShowAdvancedInstructions(!showAdvancedInstructions)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    {showAdvancedInstructions ? t[language].hideInstructions : t[language].showInstructions}
                  </button>
                )}
              </div>
              {isAdvancedMode && showAdvancedInstructions && (
                  <div className="mt-3 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-md text-xs text-red-800 dark:text-red-200 whitespace-pre-wrap font-mono">
                      {instructionsText.replace('{category}', selectedCategory?.title[language] ?? '')}
                  </div>
              )}
            </div>
            
            <ChatView
              history={chatHistory}
              onSendMessage={onSendMessage}
              isLoading={isChatLoading}
              language={language}
              selectedCategory={selectedCategory}
              isExpertMode={true}
              feedbacks={feedbacks}
              onSetFeedback={onSetFeedback}
              onDeleteMessage={onDeleteMessage}
            />
        </div>

        {/* Side Panels */}
        <div className="lg:col-span-1 space-y-4">
            <SummaryActionsPanel
              summary={chatSummary}
              isLoading={isSummaryPanelLoading}
              language={language}
              isCollapsed={collapsedPanels.summary}
              onToggleCollapse={() => handleToggleCollapse('summary')}
            />
             {chatSummary?.suggestedQuestion && !isChatLoading && (
                <div className="p-4 bg-amber-100/60 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">{t[language].suggestedQuestionTitle}</p>
                    <p className="text-sm italic text-amber-700 dark:text-amber-300 mb-3">"{chatSummary.suggestedQuestion}"</p>
                    <button
                    onClick={() => onAskSuggestedQuestion(chatSummary.suggestedQuestion)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-md hover:bg-amber-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                    {t[language].askButton}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
                    </button>
                </div>
            )}
            
            <UserContextView
                userContext={userContext}
                onSetUserContext={onSetUserContext}
                language={language}
                isCollapsed={collapsedPanels.notes}
                onToggleCollapse={() => handleToggleCollapse('notes')}
            />

            <BookAdviserView
                books={books}
                isLoading={isBooksLoading}
                onGenerate={onGenerateBooks}
                chatHistory={chatHistory}
                language={language}
                userContext={userContext}
                disabled={anyInteractionLoading}
                isCollapsed={collapsedPanels.books}
                onToggleCollapse={() => handleToggleCollapse('books')}
            />

            <TedTalksView
                talksResponse={tedTalks}
                isLoading={isTedTalksLoading}
                onGenerate={onGenerateTedTalks}
                chatHistory={chatHistory}
                language={language}
                disabled={anyInteractionLoading}
                isCollapsed={collapsedPanels.ted}
                onToggleCollapse={() => handleToggleCollapse('ted')}
            />

            <LinkedInLearningView
                courses={linkedInCourses}
                isLoading={isLinkedInCoursesLoading}
                onGenerate={onGenerateLinkedInCourses}
                chatHistory={chatHistory}
                language={language}
                disabled={anyInteractionLoading}
                isCollapsed={collapsedPanels.linkedin}
                onToggleCollapse={() => handleToggleCollapse('linkedin')}
            />
            
            <ReadingTableView
                links={readingLinks}
                isLoading={isReadingLinksLoading}
                onGenerate={onGenerateReadingTable}
                chatHistory={chatHistory}
                language={language}
                userContext={userContext}
                disabled={anyInteractionLoading}
                isCollapsed={collapsedPanels.reading}
                onToggleCollapse={() => handleToggleCollapse('reading')}
            />

        </div>
      </div>
    </div>
  );
};
export default CpoRoleChatView;