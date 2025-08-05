

import React from 'react';
import { Language } from '../types';

interface InfographicModalProps {
  imageUrl: string | null;
  isLoading: boolean;
  onClose: () => void;
  language: Language;
}

const InfographicModal: React.FC<InfographicModalProps> = ({ imageUrl, isLoading, onClose, language }) => {
  const t = {
    nl: {
      title: 'Infographic van de Sessie',
      reportNote: 'Deze afbeelding wordt ook toegevoegd aan het printbare rapport.',
      loading: 'Infographic wordt gegenereerd...',
      close: 'Sluiten',
      download: 'Download Afbeelding',
      altText: 'Infographic van de strategiesessie',
    },
    en: {
      title: 'Session Infographic',
      reportNote: 'This image will also be added to the printable report.',
      loading: 'Generating infographic...',
      close: 'Close',
      download: 'Download Image',
      altText: 'Strategy session infographic',
    },
    de: {
      title: 'Sitzungs-Infografik',
      reportNote: 'Dieses Bild wird auch dem druckbaren Bericht hinzugefügt.',
      loading: 'Infografik wird generiert...',
      close: 'Schließen',
      download: 'Bild herunterladen',
      altText: 'Infografik der Strategiesitzung',
    },
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageUrl}`;
    link.download = 'strategy-session-infographic.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      aria-labelledby="infographic-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 id="infographic-title" className="text-xl font-bold text-slate-800 dark:text-slate-200">{t[language].title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t[language].reportNote}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
            aria-label={t[language].close}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto flex items-center justify-center p-4">
          {isLoading && (
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-pink-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-slate-600 dark:text-slate-400">{t[language].loading}</p>
            </div>
          )}
          {!isLoading && imageUrl && (
            <img
              src={`data:image/png;base64,${imageUrl}`}
              alt={t[language].altText}
              className="max-w-full max-h-full h-auto object-contain rounded-md"
            />
          )}
        </div>
        
        {!isLoading && imageUrl && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {t[language].download}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default InfographicModal;