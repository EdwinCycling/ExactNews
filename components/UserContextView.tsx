import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface UserContextViewProps {
  userContext: string;
  onSetUserContext: (context: string) => void;
  language: Language;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const UserContextView: React.FC<UserContextViewProps> = ({ userContext, onSetUserContext, language, isCollapsed, onToggleCollapse }) => {
  const [text, setText] = useState(userContext);
  const [isSaved, setIsSaved] = useState(false);
  
  const t = {
    nl: {
      title: 'Jouw Notities',
      description: 'Voeg hier uw eigen notities of context toe. Deze worden meegenomen in de samenvatting, podcast en rapportage.',
      placeholder: 'Typ hier uw notities...',
      saveButton: 'Opslaan',
      savedButton: 'Opgeslagen!',
    },
    en: {
      title: 'Your Notes',
      description: 'Add your own notes or context here. This will be included in the summary, podcast, and report.',
      placeholder: 'Type your notes here...',
      saveButton: 'Save',
      savedButton: 'Saved!',
    },
    de: {
      title: 'Ihre Notizen',
      description: 'Fügen Sie hier Ihre eigenen Notizen oder Ihren Kontext hinzu. Dies wird in die Zusammenfassung, den Podcast und den Bericht aufgenommen.',
      placeholder: 'Geben Sie hier Ihre Notizen ein...',
      saveButton: 'Speichern',
      savedButton: 'Gespeichert!',
    },
  };

  const handleSave = () => {
    onSetUserContext(text);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };
  
  useEffect(() => {
    setText(userContext);
  }, [userContext]);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
      <button onClick={onToggleCollapse} className="w-full p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-left">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586Z" />
          </svg>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-transform ${!isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {!isCollapsed && (
        <div className="p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{t[language].description}</p>
            <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t[language].placeholder}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 dark:bg-gray-700 dark:text-slate-200 resize-y"
            rows={4}
            />
            <button
            onClick={handleSave}
            disabled={isSaved}
            className={`mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors
                ${isSaved 
                ? 'bg-green-600' 
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
            >
            {isSaved ? (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t[language].savedButton}
                </>
            ) : (
                t[language].saveButton
            )}
            </button>
        </div>
      )}
    </div>
  );
};

export default UserContextView;