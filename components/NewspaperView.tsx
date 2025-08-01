
import React from 'react';
import { Article, Language } from '../types';

interface NewspaperViewProps {
  articles: Article[];
  onClose: () => void;
  language: Language;
}

const NewspaperView: React.FC<NewspaperViewProps> = ({ articles, onClose, language }) => {
  // A new, validated, and 100% reliable royalty-free placeholder image.
  // This guarantees the image will always load, fixing the layout issues permanently.
  const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAEgCAQAAACxAyU1AAAAAXNSR0IArs4c6QAAAERJREFUeNrtwQENAAAAwqD3T20PBxQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAZ4SDdwABXmE4nQAAAABJRU5ErkJggg==';

  const t = {
    nl: {
      date: new Date().toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase(),
      price: "€1,25",
      print: "Print / Opslaan als PDF",
      mail: "Mail Krant",
      back: "Terug",
    },
    en: {
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase(),
      price: "€1.25",
      print: "Print / Save as PDF",
      mail: "Mail Newspaper",
      back: "Back",
    }
  };

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4);
  const bottomArticles = articles.slice(4, 6);

  const handlePrint = () => {
    window.print();
  };
  
  const handleMail = () => {
    const subject = language === 'nl' ? "Exact's Daily Voorpagina" : "Exact's Daily Front Page";
    let body = language === 'nl' ? "Hier is de gepersonaliseerde voorpagina van vandaag:\n\n" : "Here is today's personalized front page:\n\n";
    articles.forEach(article => {
        body += `${article.title}\n${article.url}\n\n`;
    });
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  

  return (
    <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl p-8 bg-white dark:bg-gray-800 shadow-2xl rounded-lg printable-area font-serif text-slate-900 dark:text-slate-200">
          {/* Header */}
          <header className="flex justify-between items-center pb-4 border-b-2 border-black dark:border-gray-400">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">Exact's Daily</h1>
              <p className="text-sm font-light tracking-widest text-gray-500 dark:text-gray-400 mt-1">{t[language].date}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">{t[language].price}</p>
              {/* QR Code Placeholder */}
              <svg className="w-12 h-12 mt-1" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0 0h35v35H0z m10 10h15v15H10z M65 0h35v35H65z m10 10h15v15H75z M0 65h35v35H0z m10 10h15v15H10z M45 45h10v10H45z m10 10h10v10H55z M45 65h10v10H45z M65 45h10v10H65z m10 0h10v10H75z m10 0h10v10H85z M65 65h10v10H65z m20 10h10v10H85z"/>
              </svg>
            </div>
          </header>

          {/* Body */}
          <div className="mt-6 grid grid-cols-3 gap-6 border-b-2 border-black dark:border-gray-400 pb-4">
            {/* Main Article */}
            <main className="col-span-2 pr-6 border-r border-gray-300 dark:border-gray-600 overflow-hidden">
              {mainArticle && (
                <article>
                  <h2 className="text-3xl font-bold leading-tight mb-4">{mainArticle.title}</h2>
                  <figure className="mb-4">
                    <img src={placeholderImage} alt={mainArticle.title} className="w-full h-auto object-cover border border-gray-200 dark:border-gray-700" />
                  </figure>
                  <p className="text-base leading-relaxed text-gray-800 dark:text-gray-300">
                    {mainArticle.summary}
                  </p>
                </article>
              )}
            </main>
            {/* Side Articles */}
            <aside>
              <div className="space-y-4">
                {sideArticles.map((article, index) => (
                  <article key={index} className={index < sideArticles.length - 1 ? "pb-4 border-b border-gray-200 dark:border-gray-700" : ""}>
                    <h3 className="font-bold text-lg leading-tight">{article.title}</h3>
                    <p className="text-xs font-light uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1">{article.sourceName}</p>
                  </article>
                ))}
              </div>
            </aside>
          </div>
           {/* Bottom Articles */}
           {bottomArticles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-6">
              {bottomArticles.map((article, index) => (
                <article key={index} className="overflow-hidden">
                    <h3 className="font-bold text-xl leading-tight mb-2">{article.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 mb-2">{article.summary}</p>
                    <p className="text-xs font-light uppercase tracking-wider text-gray-500 dark:text-gray-400">{article.sourceName}</p>
                </article>
              ))}
            </div>
           )}

        </div>
      
      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v3a2 2 0 002 2h6a2 2 0 002-2v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          {t[language].print}
        </button>
        <button
          onClick={handleMail}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          {t[language].mail}
        </button>
        <button
          onClick={onClose}
          className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t[language].back}
        </button>
      </div>
    </div>
  );
};

export default NewspaperView;
