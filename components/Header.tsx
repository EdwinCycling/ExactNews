import React from 'react';
import { Category, Language } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  onGoHome: () => void;
  selectedCategory: Category | null;
  isNewspaperView?: boolean;
  isExpertChatView?: boolean;
  isInfoView?: boolean;
  isCpoSetupView?: boolean;
  isCpoChatView?: boolean;
  language: Language;
  theme: string;
  toggleTheme: () => void;
  handleSetLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onGoHome, 
    selectedCategory, 
    isNewspaperView, 
    isExpertChatView, 
    isInfoView,
    isCpoSetupView,
    isCpoChatView, 
    language, 
    theme, 
    toggleTheme, 
    handleSetLanguage 
}) => {
  const t = {
    nl: {
      mainTitle: "Exact's Daily",
      newspaperSubtitle: "Uw gepersonaliseerde voorpagina, gegenereerd met AI.",
      categorySubtitle: (title: string) => `Uw briefing over de nieuwste ontwikkelingen in ${title.toLowerCase()}.`,
      cpoSetupSubtitle: "Stel uw AI-expert samen voor een strategiesessie.",
      cpoChatSubtitle: (title: string) => `Strategiesessie over ${title.toLowerCase()}.`
    },
    en: {
      mainTitle: "Exact's Daily",
      newspaperSubtitle: "Your personalized front page, generated with AI.",
      categorySubtitle: (title: string) => `Your briefing on the latest developments in ${title.toLowerCase()}.`,
      cpoSetupSubtitle: "Configure your AI expert for a strategy session.",
      cpoChatSubtitle: (title: string) => `Strategy session on ${title.toLowerCase()}.`
    },
    de: {
      mainTitle: "Exact's Daily",
      newspaperSubtitle: "Ihre personalisierte Titelseite, generiert mit KI.",
      categorySubtitle: (title: string) => `Ihr Briefing zu den neuesten Entwicklungen in ${title.toLowerCase()}.`,
      cpoSetupSubtitle: "Konfigurieren Sie Ihren KI-Experten für eine Strategiesitzung.",
      cpoChatSubtitle: (title: string) => `Strategiesitzung zu ${title.toLowerCase()}.`
    }
  }

  const title = t[language].mainTitle;
  
  let subtitle: string | null = null;
  if (isNewspaperView) {
    subtitle = t[language].newspaperSubtitle;
  } else if (isCpoSetupView) {
    subtitle = t[language].cpoSetupSubtitle;
  } else if (isCpoChatView && selectedCategory) {
    subtitle = t[language].cpoChatSubtitle(selectedCategory.title[language]);
  } else if (selectedCategory) {
    subtitle = t[language].categorySubtitle(selectedCategory.title[language]);
  }

  const hideSubtitle = isExpertChatView || isInfoView;

  return (
    <header className="text-center mb-8">
      <div className="flex justify-between items-center">
        <div className="text-left flex-1">
          <button onClick={onGoHome} className="text-left focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 rounded-lg">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 dark:from-teal-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
              {title}
            </h1>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher language={language} setLanguage={handleSetLanguage} />
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} language={language} />
        </div>
      </div>
       {!hideSubtitle && subtitle && (
        (isCpoSetupView || isCpoChatView) ? (
          <h2 className="mt-6 text-left text-2xl font-bold text-slate-800 dark:text-slate-200">
            {subtitle}
          </h2>
        ) : (
          <p className="mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400 text-left">
            {subtitle}
          </p>
        )
      )}
    </header>
  );
};

export default Header;