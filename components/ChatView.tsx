import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Language, Category } from '../types';

interface ChatViewProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  language: Language;
  selectedCategory: Category | null;
}

const ChatView: React.FC<ChatViewProps> = ({ history, onSendMessage, isLoading, language, selectedCategory }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = {
    nl: {
      title: selectedCategory ? `Vraag het de ${selectedCategory.title.nl} expert` : "Vraag het de Data",
      subtitle: selectedCategory ? `Stel een vraag over de bovenstaande artikelen of over ${selectedCategory.title.nl}` : "Stel een vraag over de bovenstaande artikelen.",
      placeholder: "Typ uw vraag...",
      send: "Verzenden",
      typing: "AI typt...",
    },
    en: {
      title: selectedCategory ? `Ask the ${selectedCategory.title.en} Expert` : "Ask the Data",
      subtitle: selectedCategory ? `Ask a question about the articles above or about ${selectedCategory.title.en}` : "Ask a question about the articles above.",
      placeholder: "Type your question...",
      send: "Send",
      typing: "AI is typing...",
    }
  }

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

  return (
    <div className="w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{t[language].subtitle}</p>
      </div>
      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {history.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && (
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-400 dark:bg-teal-500 flex items-center justify-center text-white font-bold text-sm">AI</span>
            )}
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-slate-200'}`}>
              <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.parts[0].text}</p>
            </div>
             {msg.role === 'user' && (
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">U</span>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-400 dark:bg-teal-500 flex items-center justify-center text-white font-bold text-sm">AI</span>
            <div className="max-w-md p-3 rounded-lg bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-slate-200">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '200ms'}}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{animationDelay: '400ms'}}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-slate-100/50 dark:bg-gray-900/20 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={t[language].placeholder}
            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-slate-200 resize-none"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t[language].send}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;