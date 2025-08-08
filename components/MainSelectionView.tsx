import React from 'react';
import { Language } from '../types';

interface MainSelectionViewProps {
  language: Language;
  onSelectNews: () => void;
  onSelectAIBuddy: () => void;
}

const MainSelectionView: React.FC<MainSelectionViewProps> = ({ 
  language, 
  onSelectNews, 
  onSelectAIBuddy 
}) => {
  const t = {
    nl: {
      title: 'Exact\'s Daily',
      subtitle: 'Kies uw ervaring',
      news: 'Nieuws',
      newsDescription: 'Blijf op de hoogte van het laatste nieuws over Exact, concurrenten en technologie',
      aiBuddy: 'AI Buddy',
      aiBuddyDescription: 'Stel uw AI-expert samen voor strategische sessies en advies'
    },
    en: {
      title: 'Exact\'s Daily',
      subtitle: 'Choose your experience',
      news: 'News',
      newsDescription: 'Stay updated with the latest news about Exact, competitors and technology',
      aiBuddy: 'AI Buddy',
      aiBuddyDescription: 'Assemble your AI expert for strategic sessions and advice'
    },
    de: {
      title: 'Exact\'s Daily',
      subtitle: 'Wählen Sie Ihre Erfahrung',
      news: 'Nachrichten',
      newsDescription: 'Bleiben Sie auf dem Laufenden mit den neuesten Nachrichten über Exact, Wettbewerber und Technologie',
      aiBuddy: 'AI Buddy',
      aiBuddyDescription: 'Stellen Sie Ihren KI-Experten für strategische Sitzungen und Beratung zusammen'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 dark:from-teal-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent mb-4">
            {t[language].title}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            {t[language].subtitle}
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl mx-auto">
          {/* News Card */}
          <div 
            onClick={onSelectNews}
            className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                {t[language].news}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t[language].newsDescription}
              </p>
            </div>
          </div>

          {/* AI Buddy Card */}
          <div 
            onClick={onSelectAIBuddy}
            className="group cursor-pointer bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-600"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
                {t[language].aiBuddy}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t[language].aiBuddyDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainSelectionView;
