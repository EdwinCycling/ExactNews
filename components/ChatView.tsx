import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, Category } from '../types';

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
}

export const ChatView: React.FC<ChatViewProps> = ({ history, onSendMessage, isLoading, language, selectedCategory, isExpertMode = false, feedbacks, onSetFeedback, onDeleteMessage }) => {
  const [input, setInput] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const t = {
    nl: {
      title: selectedCategory ? `Vraag het de ${selectedCategory.title.nl} expert` : "Vraag het de Data",
      subtitle: isExpertMode ? "" : (selectedCategory ? `Stel een vraag over de bovenstaande artikelen of over ${selectedCategory.title.nl}` : 'Stel een vraag over de bovenstaande artikelen.'),
      placeholder: "Typ uw vraag...",
      send: "Verzenden",
      typing: "AI typt...",
      disclaimer: "ED kan fouten maken. Controleer belangrijke informatie.",
      copy: "Kopieer tekst",
      copied: "Gekopieerd!",
      thumbUp: "Antwoord was nuttig",
      thumbDown: "Verwijder dit antwoord en de vraag",
    },
    en: {
      title: selectedCategory ? `Ask the ${selectedCategory.title.en} Expert` : "Ask the Data",
      subtitle: isExpertMode ? "" : (selectedCategory ? `Ask a question about the articles above or about ${selectedCategory.title.en}` : 'Ask a question about the articles above.'),
      placeholder: "Type your question...",
      send: "Send",
      typing: "AI is typing...",
      disclaimer: "ED can make mistakes. Please check important information.",
      copy: "Copy text",
      copied: "Copied!",
      thumbUp: "Answer was helpful",
      thumbDown: "Delete this response and question",
    },
    de: {
      title: selectedCategory ? `Fragen Sie den ${selectedCategory.title.de} Experten` : "Fragen Sie die Daten",
      subtitle: isExpertMode ? "" : (selectedCategory ? `Stellen Sie eine Frage zu den obigen Artikeln oder zu ${selectedCategory.title.de}` : 'Stellen Sie eine Frage zu den obigen Artikeln.'),
      placeholder: "Geben Sie Ihre Frage ein...",
      send: "Senden",
      typing: "KI tippt...",
      disclaimer: "ED kann Fehler machen. Bitte überprüfen Sie wichtige Informationen.",
      copy: "Text kopieren",
      copied: "Kopiert!",
      thumbUp: "Antwort war hilfreich",
      thumbDown: "Diese Antwort und Frage löschen",
    },
  }
  
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

  return (
    <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
      {!isExpertMode && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{t[language].subtitle}</p>
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
  );
};