import React from 'react';
import { Language } from '../types';

interface InfoViewProps {
  onGoBack: () => void;
  language: Language;
}

interface Feature {
  icon: JSX.Element;
  title: { [key in Language]: string };
  description: { [key in Language]: string };
}

const features: Feature[] = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
    title: { nl: "AI Nieuws Analyse", en: "AI News Analysis" },
    description: { nl: "Krijg het laatste nieuws over een onderwerp, samengevat en beoordeeld door AI. Stel vervolgens verdiepende vragen over de gevonden artikelen in de geïntegreerde chat.", en: "Get the latest news on any topic, summarized and rated by AI. You can then ask in-depth questions about the found articles in the integrated chat." }
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.455.09-.934.09-1.425v-2.134c0-2.616.21-5.135 1.693-7.182a10.745 10.745 0 0 1 1.644-2.059c.754-1.168 2.16-1.884 3.86-1.884 3.313 0 6 2.687 6 6Z" /></svg>,
    title: { nl: "Vraag de Expert", en: "Ask the Expert" },
    description: { nl: "Stel directe vragen aan een AI-expert met een specifieke persona, getraind om u diepgaande antwoorden te geven binnen een vakgebied.", en: "Ask direct questions to an AI expert with a specific persona, trained to give you in-depth answers within a professional domain." }
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
    title: { nl: "Interactieve Krant", en: "Interactive Newspaper" },
    description: { nl: "Genereer een unieke voorpagina, 'Exact's Daily', met het belangrijkste nieuws uit uw favoriete categorieën.", en: "Generate a unique front page, 'Exact's Daily', featuring the top news from your favorite categories." }
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 0 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg>,
    title: { nl: "Podcast Functie", en: "Podcast Feature" },
    description: { nl: "Luister naar de volledige nieuwsartikelen of een door AI gegenereerde samenvatting van al het nieuws.", en: "Listen to the full news articles or an AI-generated summary of all the news." }
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.321l5.522.802a.563.563 0 0 1 .314.968l-4.001 3.882a.563.563 0 0 0-.162.531l.946 5.397a.563.563 0 0 1-.815.592l-4.924-2.582a.562.562 0 0 0-.517 0l-4.924 2.582a.563.563 0 0 1-.815-.592l.946-5.397a.563.563 0 0 0-.162.531l-4.001-3.882a.563.563 0 0 1 .314-.968l5.522-.802a.563.563 0 0 0 .475-.321L11.48 3.5Z" /></svg>,
    title: { nl: "Personalisatie", en: "Personalization" },
    description: { nl: "Stel favoriete categorieën in, wissel tussen donkere/lichte modus en kies uw taal. Uw voorkeuren worden onthouden.", en: "Set favorite categories, switch between dark/light mode, and choose your language. Your preferences are saved." }
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0-4-4m4 4-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    title: { nl: "Dynamische Rolwissel", en: "Dynamic Role Switching" },
    description: { nl: "Wissel tijdens een CPO-strategiesessie naadloos van AI-expert. Krijg verschillende perspectieven op uw vraagstuk zonder de context van het gesprek te verliezen.", en: "Seamlessly switch AI experts during a CPO strategy session. Get different perspectives on your issue without losing the context of the conversation." }
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>,
    title: { nl: "Beveiligde Toegang", en: "Secure Access" },
    description: { nl: "Toegang tot de applicatie is beveiligd met een pincode om ongewenst gebruik te voorkomen.", en: "Access to the application is protected by a PIN code to prevent unauthorized usage." }
  }
];

const InfoView: React.FC<InfoViewProps> = ({ onGoBack, language }) => {
  const t = {
    nl: { title: "Wat kan deze app?", back: "Terug naar overzicht" },
    en: { title: "What can this app do?", back: "Back to overview" }
  };
  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-200 mb-10">{t[language].title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg text-center">
            <div className="flex justify-center items-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 text-white">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{feature.title[language]}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description[language]}</p>
          </div>
        ))}
      </div>

       <div className="mt-12 text-center">
         <button 
           onClick={onGoBack}
           className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
         >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
           </svg>
           {t[language].back}
         </button>
      </div>
    </div>
  );
};

export default InfoView;