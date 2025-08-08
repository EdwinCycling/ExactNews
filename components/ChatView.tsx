import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, Category, ChatMemory } from '../types';
import { saveChatMemory, loadChatMemory, deleteChatMemory } from '../services/firebase';
import { auth } from '../services/firebase';
import Toast from './Toast';

interface ChatViewProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: Language;
  selectedCategory: Category | null;
  isExpertMode?: boolean;
  feedbacks: { [index: number]: 'up' | null };
  onSetFeedback: (messageIndex: number, feedback: 'up') => void;
  onDeleteMessage: (messageIndex: number) => void;

  showMemoryButton?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ 
  history, 
  onSendMessage, 
  isLoading, 
  language, 
  selectedCategory, 
  isExpertMode = false, 
  feedbacks, 
  onSetFeedback, 
  onDeleteMessage,

  showMemoryButton = false
}) => {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [memoryExists, setMemoryExists] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [toast, setToast] = useState<{ isVisible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    isVisible: false,
    message: '',
    type: 'info'
  });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const t = {
    nl: {
      title: selectedCategory ? `Vraag het de ${selectedCategory.title.nl} expert` : "Vraag het de Data",
      subtitle: isExpertMode ? "" : (selectedCategory ? `Stel een vraag over de bovenstaande artikelen of over ${selectedCategory.title.nl}` : 'Stel een vraag over de bovenstaande artikelen.'),
      placeholder: "Typ uw vraag...",
      send: "Verzenden",
      typing: "AI is aan het werk",
      disclaimer: "ED kan fouten maken. Controleer belangrijke informatie.",
      copy: "Kopieer tekst",
      copied: "Gekopieerd!",
      thumbUp: "Antwoord was nuttig",
      thumbDown: "Verwijder dit antwoord en de vraag",
      memory: "Geheugen",
      saveMemory: "Chat opslaan",
      loadMemory: "Chat laden",
      deleteMemory: "Opslag wissen",
      memorySaved: "Chat opgeslagen!",
      memoryLoaded: "Chat geladen!",
      memoryDeleted: "Geheugen gewist!",
      memoryError: "Fout bij geheugen operatie",
      noMemory: "Geen opgeslagen chat gevonden",
      confirmDelete: "Weet je zeker dat je het geheugen wilt wissen?",
    },
    en: {
      title: selectedCategory ? `Ask the ${selectedCategory.title.en} Expert` : "Ask the Data",
      subtitle: isExpertMode ? "" : (selectedCategory ? `Ask a question about the articles above or about ${selectedCategory.title.en}` : 'Ask a question about the articles above.'),
      placeholder: "Type your question...",
      send: "Send",
      typing: "AI is working...",
      disclaimer: "ED can make mistakes. Please check important information.",
      copy: "Copy text",
      copied: "Copied!",
      thumbUp: "Answer was helpful",
      thumbDown: "Delete this response and question",
      memory: "Memory",
      saveMemory: "Save Chat",
      loadMemory: "Load Chat",
      deleteMemory: "Clear Storage",
      memorySaved: "Chat saved!",
      memoryLoaded: "Chat loaded!",
      memoryDeleted: "Memory cleared!",
      memoryError: "Memory operation failed",
      noMemory: "No saved chat found",
      confirmDelete: "Are you sure you want to clear the memory?",
    },
    de: {
      title: selectedCategory ? `Fragen Sie den ${selectedCategory.title.de} Experten` : "Fragen Sie die Daten",
      subtitle: isExpertMode ? "" : (selectedCategory ? `Stellen Sie eine Frage zu den obigen Artikeln oder zu ${selectedCategory.title.de}` : 'Stellen Sie eine Frage zu den obigen Artikeln.'),
      placeholder: "Geben Sie Ihre Frage ein...",
      send: "Senden",
      typing: "KI arbeitet...",
      disclaimer: "ED kann Fehler machen. Bitte überprüfen Sie wichtige Informationen.",
      copy: "Text kopieren",
      copied: "Kopiert!",
      thumbUp: "Antwort war hilfreich",
      thumbDown: "Diese Antwort und Frage löschen",
      memory: "Gedächtnis",
      saveMemory: "Chat speichern",
      loadMemory: "Chat laden",
      deleteMemory: "Speicher löschen",
      memorySaved: "Chat gespeichert!",
      memoryLoaded: "Chat geladen!",
      memoryDeleted: "Gedächtnis gelöscht!",
      memoryError: "Gedächtnis-Operation fehlgeschlagen",
      noMemory: "Kein gespeicherter Chat gefunden",
      confirmDelete: "Sind Sie sicher, dass Sie das Gedächtnis löschen möchten?",
    },
  }

  // Check if memory exists on component mount and when user changes
  useEffect(() => {
    console.log('ChatView useEffect - showMemoryButton:', showMemoryButton, 'isExpertMode:', isExpertMode);
    // Always check memory exists when user is authenticated, regardless of showMemoryButton
    if (auth.currentUser) {
      checkMemoryExists();
    }
  }, [auth.currentUser?.uid]);

  // Debug useEffect to track memoryExists changes
  useEffect(() => {
    console.log('=== memoryExists State Changed ===');
    console.log('memoryExists:', memoryExists);
    console.log('auth.currentUser:', !!auth.currentUser);
    console.log('Should show load button:', auth.currentUser && memoryExists);
    console.log('=== End memoryExists State ===');
  }, [memoryExists]);

  const checkMemoryExists = async () => {
    console.log('=== Memory Check Debug ===');
    console.log('auth.currentUser:', auth.currentUser);
    console.log('auth.currentUser?.uid:', auth.currentUser?.uid);
    console.log('showMemoryButton:', showMemoryButton);
    console.log('isExpertMode:', isExpertMode);
    
    if (!auth.currentUser) {
      console.log('No authenticated user for memory check');
      setMemoryExists(false);
      return;
    }
    
    try {
      console.log('Loading memory for user:', auth.currentUser.uid);
      const memory = await loadChatMemory(auth.currentUser.uid);
      setMemoryExists(!!memory);
      console.log('Memory exists:', !!memory);
      console.log('Memory data:', memory);
      console.log('=== End Memory Check ===');
    } catch (error) {
      console.error('Error checking memory:', error);
      setMemoryExists(false);
    }
  };



  const handleSaveMemory = async () => {
    console.log('Save memory clicked - auth.currentUser:', auth.currentUser);
    console.log('Selected category:', selectedCategory);
    console.log('History length:', history.length);
    
    if (!auth.currentUser) {
      setToast({ isVisible: true, message: 'Je moet ingelogd zijn om chat geheugen op te slaan. Log eerst in via de login pagina.', type: 'error' });
      return;
    }
    
    if (!selectedCategory) {
      setToast({ isVisible: true, message: 'Geen categorie geselecteerd voor geheugen opslag', type: 'error' });
      return;
    }
    
    if (history.length === 0) {
      setToast({ isVisible: true, message: 'Geen chat geschiedenis om op te slaan', type: 'error' });
      return;
    }
    
    setMemoryLoading(true);
    try {
      // Create an extensive summary of the chat
      const userMessages = history.filter(msg => msg.role === 'user').map(msg => msg.parts[0].text);
      const aiMessages = history.filter(msg => msg.role === 'model').map(msg => msg.parts[0].text);
      
      let extensiveSummary = `Chat Summary (${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}):\n\n`;
      extensiveSummary += `Category: ${selectedCategory.title[language]}\n`;
      extensiveSummary += `Total Messages: ${history.length}\n\n`;
      
      // Add key points from the conversation
      extensiveSummary += `Key Discussion Points:\n`;
      userMessages.forEach((msg, index) => {
        if (index < 5) { // Limit to first 5 user messages for summary
          extensiveSummary += `- User: ${msg.substring(0, 100)}${msg.length > 100 ? '...' : ''}\n`;
          if (aiMessages[index]) {
            extensiveSummary += `  AI: ${aiMessages[index].substring(0, 150)}${aiMessages[index].length > 150 ? '...' : ''}\n\n`;
          }
        }
      });
      
      if (userMessages.length > 5) {
        extensiveSummary += `... and ${userMessages.length - 5} more messages\n`;
      }
      
             await saveChatMemory(
         auth.currentUser.uid,
         extensiveSummary,
         selectedCategory,
         undefined // role is optional, pass undefined explicitly
       );
      
      setMemoryExists(true);
      setToast({ isVisible: true, message: t[language].memorySaved, type: 'success' });
    } catch (error) {
      console.error('Error saving memory:', error);
      console.error('Error details:', {
        code: (error as any).code,
        message: (error as any).message,
        userId: auth.currentUser?.uid,
        category: selectedCategory?.key
      });
      
      // Give more specific error messages
      if ((error as any).code === 'permission-denied') {
        setToast({ isVisible: true, message: 'Geen toestemming om geheugen op te slaan. Controleer je Firebase regels.', type: 'error' });
      } else if ((error as any).code === 'unavailable') {
        setToast({ isVisible: true, message: 'Firebase is momenteel niet beschikbaar. Probeer het later opnieuw.', type: 'error' });
      } else {
        setToast({ isVisible: true, message: `Fout bij opslaan geheugen: ${(error as any).message || 'Onbekende fout'}`, type: 'error' });
      }
    } finally {
      setMemoryLoading(false);
    }
  };

  const handleLoadMemory = async () => {
    if (!auth.currentUser) return;
    
    setMemoryLoading(true);
    try {
      const memory = await loadChatMemory(auth.currentUser.uid);
      if (memory) {
        // Directly send the summary to AI, similar to "suggested next question"
        onSendMessage(memory.extensiveSummary);
        setToast({ isVisible: true, message: t[language].memoryLoaded, type: 'success' });
      } else {
        setToast({ isVisible: true, message: t[language].noMemory, type: 'error' });
      }
    } catch (error) {
      console.error('Error loading memory:', error);
      setToast({ isVisible: true, message: t[language].memoryError, type: 'error' });
    } finally {
      setMemoryLoading(false);
    }
  };

  const handleDeleteMemory = async () => {
    if (!auth.currentUser) return;
    
    // Show confirmation dialog
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteMemory = async () => {
    if (!auth.currentUser) return;
    
    setShowDeleteConfirmation(false);
    setMemoryLoading(true);
    try {
      await deleteChatMemory(auth.currentUser.uid);
      setMemoryExists(false);
      setToast({ isVisible: true, message: t[language].memoryDeleted, type: 'success' });
    } catch (error) {
      console.error('Error deleting memory:', error);
      setToast({ isVisible: true, message: t[language].memoryError, type: 'error' });
    } finally {
      setMemoryLoading(false);
    }
  };

  const cancelDeleteMemory = () => {
    setShowDeleteConfirmation(false);
  };

  // Autofocus the input on component mount, especially for expert chat mode.
  useEffect(() => {
    if (isExpertMode) {
      inputRef.current?.focus();
    }
  }, [isExpertMode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };
  
  const renderMessageContent = (text: string) => {
    return text.split('\n').map((line, i, arr) => {
      // Preserve empty lines which can be important for formatting
      if (line.trim() === '') {
        return <div key={i} className="h-4" />;
      }
      
      // Handle headings
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(3)}</h2>
      }
      
      // Handle bullet points
      if (line.match(/^\s*(\*|-)\s/)) {
        return <li key={i} className="ml-5 list-disc">{line.replace(/^\s*(\*|-)\s/, '')}</li>;
      }

      // Handle bold text within a paragraph
      const parts = line.split(/(\*\*.*?\*\*)/g).filter(part => part);

      return (
        <p key={i} className={i === arr.length - 1 ? '' : 'mb-2'}>
          {parts.map((part, j) =>
            part.startsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part
          )}
        </p>
      );
    });
  };

  // Debug log at render time
  console.log('=== ChatView Render Debug ===');
  console.log('memoryExists:', memoryExists);
  console.log('auth.currentUser:', !!auth.currentUser);
  console.log('Should show load button:', auth.currentUser && memoryExists);
  console.log('=== End Render Debug ===');

  return (
    <>
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isVisible: false })}
        language={language}
      />
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t[language].memory}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t[language].confirmDelete}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={cancelDeleteMemory}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={confirmDeleteMemory}
                disabled={memoryLoading}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {memoryLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Wissen...
                  </div>
                ) : (
                  'Wissen'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
      {!isExpertMode && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t[language].subtitle}</p>
        </div>
      )}
      
      {/* Memory Button for Expert Mode */}
      {isExpertMode && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-2">
               <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
               </svg>
               <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t[language].memory}</span>
               {!auth.currentUser && (
                 <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50 px-2 py-1 rounded">
                   Niet ingelogd
                 </span>
               )}
             </div>
            
                         <div className="flex items-center space-x-2">
               {/* Show save button only if user is logged in and there's chat history */}
               {auth.currentUser && history.length > 0 && (
                 <button
                   onClick={handleSaveMemory}
                   disabled={memoryLoading}
                   className="px-3 py-1.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/70 transition-colors disabled:opacity-50"
                 >
                   {memoryLoading ? (
                     <div className="flex items-center">
                       <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       {t[language].saveMemory}
                     </div>
                   ) : (
                     t[language].saveMemory
                   )}
                 </button>
               )}
               
                               {/* Show load button only if memory exists */}
                {auth.currentUser && memoryExists && (
                  <button
                    onClick={handleLoadMemory}
                    disabled={memoryLoading}
                    className="px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors disabled:opacity-50"
                  >
                    {memoryLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t[language].loadMemory}
                      </div>
                    ) : (
                      t[language].loadMemory
                    )}
                  </button>
                )}
               
                               {/* Show delete button only if memory exists and there's chat history */}
                {auth.currentUser && memoryExists && history.length > 0 && (
                  <button
                    onClick={handleDeleteMemory}
                    disabled={memoryLoading}
                    className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/70 transition-colors disabled:opacity-50"
                  >
                    {memoryLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t[language].deleteMemory}
                      </div>
                    ) : (
                      t[language].deleteMemory
                    )}
                  </button>
                )}
                

             </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {history.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isUpvoted = !isUser && feedbacks[index] === 'up';

          return (
            <div key={index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl p-4 rounded-2xl shadow-md ${isUser ? 'bg-indigo-500 text-white rounded-br-none' : `bg-slate-100 dark:bg-gray-700 text-slate-800 dark:text-slate-200 rounded-bl-none border ${isUpvoted ? 'border-green-500' : 'border-transparent'}`}`}>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-0 prose-li:my-0">
                  {renderMessageContent(msg.parts[0].text)}
                </div>
                {!isUser && (
                  <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-gray-600">
                    <button onClick={() => onSetFeedback(index, 'up')} title={t[language].thumbUp} className={`p-1 rounded-full transition-colors ${feedbacks[index] === 'up' ? 'text-green-500 bg-green-100 dark:bg-green-900/50' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333V17a1 1 0 001 1h6.758c.76 0 1.44-.33 1.942-.886l2.398-2.818a1.5 1.5 0 00.06-1.638l-1.333-2.5a1.5 1.5 0 00-1.376-.862h-4.328a1.5 1.5 0 01-1.42-1.043L8.283 4.234a1.5 1.5 0 00-2.823.633V10.333z" />
                        </svg>
                    </button>
                    <button onClick={() => onDeleteMessage(index)} title={t[language].thumbDown} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                    </button>
                    <button onClick={() => handleCopy(msg.parts[0].text, index)} title={copiedIndex === index ? t[language].copied : t[language].copy} className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors">
                      {copiedIndex === index ? 
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> :
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      }
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    handleSubmit(e);
                }
            }}
            placeholder={t[language].placeholder}
            className="w-full p-3 pr-16 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 dark:bg-gray-700 dark:text-slate-200 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            aria-label={t[language].send}
          >
            {isLoading ? 
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> :
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            }
          </button>
        </div>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2 px-2">
            {isLoading ? <span className="animate-pulse">{t[language].typing}</span> : t[language].disclaimer}
        </p>
      </form>
      </div>
    </>
  );
};