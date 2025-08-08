import React, { useState } from 'react';
import { Category, RoleTemplate, Language, Department } from '../types';

interface CpoRoleSetupViewProps {
  categories: Category[];
  roles: RoleTemplate[];
  onStartChat: (category: Category, role: RoleTemplate) => void;
  onGoBack: () => void;
  language: Language;
  selectedDepartment?: Department;
}

const CpoRoleSetupView: React.FC<CpoRoleSetupViewProps> = ({ categories, roles, onStartChat, onGoBack, language, selectedDepartment }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // For departments that don't need expertise area selection, use a default category
  const skipExpertiseSelection = selectedDepartment && ['hr', 'cfo', 'jij'].includes(selectedDepartment.key);

  const getCategoryIcon = (categoryKey: string) => {
    const icons: { [key: string]: JSX.Element } = {
      ai: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
        </svg>
      ),
      hr: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      production: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      ecommerce: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
        </svg>
      ),
      construction: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
        </svg>
      ),
      projects: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
      ),
      trade: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      marketing: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l1 3m-1-3h-9.5m0 0l-1-3m9.5 3l-1-3" />
        </svg>
      ),
      finance: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.314-.488-1.314-1.314 0-.726.489-1.314 1.314-1.314.725 0 1.314.488 1.314 1.314 0 .726-.489 1.314-1.314 1.314z" />
        </svg>
      ),
      sales: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
      default: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 00 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 00 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09Z" />
        </svg>
      )
    };
    
    return icons[categoryKey] || icons.default;
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
  };
  
  const handleSelectRole = (role: RoleTemplate) => {
    if (selectedCategory || skipExpertiseSelection) {
      // For departments that skip expertise selection, use a default category
      const categoryToUse = selectedCategory || {
        key: selectedDepartment?.key || 'default',
        title: { nl: selectedDepartment?.title.nl || 'Default', en: selectedDepartment?.title.en || 'Default', de: selectedDepartment?.title.de || 'Default' },
        description: { nl: selectedDepartment?.description.nl || 'Default', en: selectedDepartment?.description.en || 'Default', de: selectedDepartment?.description.de || 'Default' },
        persona: { nl: '', en: '', de: '' }
      };
      onStartChat(categoryToUse, role);
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
        {/* Step 1: Select Category - Skip for certain departments */}
        {!skipExpertiseSelection && (
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
                  <div className="flex items-center space-x-2">
                    <span className="text-teal-600 dark:text-teal-400">
                      {getCategoryIcon(cat.key)}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{cat.title[language]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Role */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4">{t[language].step2}</h2>
          {!selectedCategory && !skipExpertiseSelection ? (
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
                    {role.text[language].replace(/{category}/g, selectedCategory?.title[language] || selectedDepartment?.title[language])}
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