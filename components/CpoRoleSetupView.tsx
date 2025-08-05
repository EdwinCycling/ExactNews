import React, { useState } from 'react';
import { Category, RoleTemplate, Language } from '../types';

interface CpoRoleSetupViewProps {
  categories: Category[];
  roles: RoleTemplate[];
  onStartChat: (category: Category, role: RoleTemplate) => void;
  onGoBack: () => void;
  language: Language;
}

const CpoRoleSetupView: React.FC<CpoRoleSetupViewProps> = ({ categories, roles, onStartChat, onGoBack, language }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };
  
  const handleSelectRole = (role: RoleTemplate) => {
    if (selectedCategory) {
      onStartChat(selectedCategory, role);
    }
  };

  const t = {
    nl: {
      back: 'Terug naar overzicht',
      step1: 'Stap 1: Kies een expertisegebied',
      step2: 'Stap 2: Kies een rol voor de AI-expert',
      step2Placeholder: 'Kies eerst een expertisegebied',
      startChat: 'Start Strategiesessie',
      selected: 'Geselecteerd',
    },
    en: {
      back: 'Back to overview',
      step1: 'Step 1: Choose an area of expertise',
      step2: 'Step 2: Choose a role for the AI expert',
      step2Placeholder: 'First, choose an area of expertise',
      startChat: 'Start Strategy Session',
      selected: 'Selected',
    },
    de: {
      back: "Zurück zur Übersicht",
      step1: "Schritt 1: Wählen Sie ein Fachgebiet",
      step2: "Schritt 2: Wählen Sie eine Rolle für den KI-Experten",
      step2Placeholder: "Wählen Sie zuerst ein Fachgebiet",
      startChat: "Strategiesitzung starten",
      selected: "Ausgewählt",
    },
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          onClick={onGoBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t[language].back}
        </button>
      </div>

      <div className="space-y-12">
        {/* Step 1: Select Category */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t[language].step1}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => handleSelectCategory(cat)}
                className={`p-4 text-left rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                  ${selectedCategory?.key === cat.key
                    ? 'bg-teal-500/20 border-teal-500 text-teal-800 dark:text-teal-200 shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-teal-500/10'
                  }`}
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100">{cat.title[language]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Role */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t[language].step2}</h2>
          {!selectedCategory ? (
            <div className="text-center py-12 px-6 bg-slate-200/30 dark:bg-gray-800/30 rounded-lg text-slate-500 dark:text-slate-400">
              {t[language].step2Placeholder}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
              {roles.map(role => (
                <button
                  key={role.key}
                  onClick={() => handleSelectRole(role)}
                  className={`p-4 text-left rounded-lg border-2 flex flex-col transition-all duration-200 h-full focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                    bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:border-indigo-400 hover:bg-indigo-500/10
                  `}
                >
                  <p className="font-semibold text-lg text-slate-900 dark:text-slate-100">{role.title[language]}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex-grow">
                    {role.text[language].replace(/{category}/g, selectedCategory.title[language])}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CpoRoleSetupView;