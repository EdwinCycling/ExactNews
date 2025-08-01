import React from 'react';
import { Category, Language } from '../types';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
  selectedCategory: Category | null;
  isNewspaperView?: boolean;
  isExpertChatView?: boolean;
  language: Language;
  theme: string;
  toggleTheme: () => void;
  toggleLanguage: () => void;
}

const Header: React.FC<HeaderProps> = ({ selectedCategory, isNewspaperView, isExpertChatView, language, theme, toggleTheme, toggleLanguage }) => {
  const t = {
    nl: {
      mainTitle: "Exact's Daily",
      newspaperTitle: "Exact's Daily",
      defaultSubtitle: "Kies een categorie om het laatste nieuws te ontdekken, maak een interactieve krant of chat met een echte expert.",
      newspaperSubtitle: "Uw gepersonaliseerde voorpagina, gegenereerd met AI, mogelijk gemaakt door E.D.",
      reviewSubtitle: "Analyse van de meest recente gebruikersreviews, mogelijk gemaakt door E.D.",
      categorySubtitle: (title: string) => `Uw dagelijkse briefing over de nieuwste ontwikkelingen in ${title.toLowerCase()}, mogelijk gemaakt door E.D.`
    },
    en: {
      mainTitle: "Exact's Daily",
      newspaperTitle: "Exact's Daily",
      defaultSubtitle: "Choose a category to discover the latest news, create an interactive newspaper, or chat with a real expert.",
      newspaperSubtitle: "Your personalized front page, generated with AI, powered by E.D.",
      reviewSubtitle: "Analysis of the most recent user reviews, powered by E.D.",
      categorySubtitle: (title: string) => `Your daily briefing on the latest developments in ${title.toLowerCase()}, powered by E.D.`
    }
  }

  const title = isNewspaperView ? t[language].newspaperTitle : selectedCategory ? selectedCategory.title[language] : t[language].mainTitle;
  
  let subtitle: string;
  if (isNewspaperView) {
    subtitle = t[language].newspaperSubtitle;
  } else if (selectedCategory) {
    if (selectedCategory.isReviewCategory) {
      subtitle = t[language].reviewSubtitle;
    } else {
      subtitle = t[language].categorySubtitle(selectedCategory.title[language]);
    }
  } else {
    subtitle = t[language].defaultSubtitle;
  }

  return (
    <header className="text-center mb-8">
      <div className="flex justify-between items-center">
        <div className="text-left flex-1">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-blue-500 to-indigo-600 dark:from-teal-300 dark:via-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <LanguageSwitcher language={language} toggleLanguage={toggleLanguage} />
          <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} language={language} />
        </div>
      </div>
      {!isExpertChatView && (
       <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 text-left">
        {subtitle}
      </p>
      )}
    </header>
  );
};

export default Header;