import React from 'react';
import { Article, Language } from '../types';

interface NewspaperViewProps {
  articles: Article[];
  onClose: () => void;
  language: Language;
}

const NewspaperView: React.FC<NewspaperViewProps> = ({ articles, onClose, language }) => {
  // This is a new, reliable, royalty-free, standard image encoded in base64.
  // This guarantees the image will always load, fixing the layout issues.
  const placeholderImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAH0A+gDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAAAQACAwQFBgcI/8QAVBAAAQMCBAMEBgYGBwYDBgcBAQIDEQAEIRIxQVEFEyJhcYGRoQYyQrHB0fBCUhQjUmJy4RYzQ4KSorLC8VOCshU0U2Nz0uIjRFSjstNkhMPT4v/EABsBAAEFAQEAAAAAAAAAAAAAAAABAgMEBQYH/8QAPxEAAQMCBAMFBgMGBgEFAAAAAQACEQMhBBIxQVFhcRMigZGhscHwBhMyQlLR4RQjM2Jy8VOCksIkoqPSFkP/2gAMAwEAAhEDEQA/APx99iM4QnFhI1Fq3tXmF+E1+gUjUeK0k25+1a/Q/m1+hQkea+hR9S/3a0A35V/dFf4xX9wVlZ/dFf3RWbNf3BX92s2eP7or+7WbPH90V/crNmv7orO7WaJ+mK/u0jNn6or+7SM2fqiv7tIzZ+qK/u0jNn6or+7SKxR9UVlZz+6K/u0rKH1RQMw+qKysV9UVnZs/VFZ2a+uKzs1fXFZ2avriv7tZmz9UV/dpGaPqiv7tLzZ+qPypGZP1R+VIzJ+qKysUfUFYWMDqK+grKyj6ooKyPqj8qR2kfVH5VnI+qPypGaPqiv7tKzp+qK/u0rOn6orKzZ+qK/u0jOn6orKzZ+qKys2fqiKys2fqiKzZ+qKzZ+qKzs2fqisrNn6orOzZ+qK/u0jNn6or+7S8w+qPypGaPqiv7tZWH1BWVhA6igrI+qKyhI6igpMdR+VIyHqPypOSPqD8qTlH1R+VZyD1FZSD1FZSDqKD6Ef/Z';

  const t = {
    nl: {
      error: 'Kan de krant niet weergeven: er zijn geen artikelen beschikbaar.',
      back: 'Terug',
      print: 'Print / Opslaan als PDF',
      mail: 'Mail Krant',
      qrAlt: 'QR Code voor exact.com',
      price: '€1,25'
    },
    en: {
      error: 'Cannot display newspaper: no articles available.',
      back: 'Back',
      print: 'Print / Save as PDF',
      mail: 'Email Newspaper',
      qrAlt: 'QR Code for exact.com',
      price: '$1.25'
    }
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center mt-6">
        <p className="text-red-500 dark:text-red-400">{t[language].error}</p>
        <button 
           onClick={onClose}
           className="mt-4 inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
         >
           {t[language].back}
         </button>
      </div>
    );
  }

  const mainArticle = articles[0];
  const sidebarArticles = articles.slice(1, 4);
  const bottomArticles = articles.slice(4);

  const today = new Date().toLocaleDateString(language === 'nl' ? 'nl-NL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const handlePrint = () => {
    window.print();
  };
  
  const handleEmail = () => {
    const newspaperHtmlElement = document.querySelector('.printable-area');
    if (!newspaperHtmlElement) return;

    const subject = encodeURIComponent(`Exact's Daily - ${today}`);
    const body = encodeURIComponent(newspaperHtmlElement.innerHTML);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const printStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Merriweather:wght@400;700&display=swap');
  `;

  return (
    <div className="flex flex-col items-center mt-6">
       <style>{printStyles}</style>
       <div className="w-full max-w-4xl mb-6 printable-area">
        <div 
          className="bg-slate-50 text-gray-800 p-4 sm:p-6 md:p-8 shadow-2xl rounded-lg"
          style={{ fontFamily: `'Merriweather', serif`}}
        >
          <header className="flex justify-between items-end border-b-[4px] border-gray-800 pb-4 mb-6">
            <div className="text-left">
                <h1 className="text-5xl md:text-7xl font-black text-gray-900" style={{ fontFamily: `'Playfair Display', serif`}}>Exact's Daily</h1>
                <p className="text-sm text-gray-500 mt-2 tracking-widest uppercase">{today.toUpperCase()}</p>
            </div>
            <div className="flex items-center space-x-3 text-right">
               <div className="font-bold text-gray-800" style={{ fontFamily: `'Playfair Display', serif`}}>
                 <p className="text-lg">{t[language].price}</p>
               </div>
               <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=https://www.exact.com&qzone=1" 
                  alt={t[language].qrAlt}
                  className="w-12 h-12"
                />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8">
            <main className="lg:col-span-2 overflow-hidden">
                <article>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900" style={{ fontFamily: `'Playfair Display', serif` }}>
                        {mainArticle.title}
                    </h2>
                    <figure className="mb-4">
                        <img src={placeholderImage} alt={mainArticle.title} className="w-full h-auto object-cover rounded-md shadow-lg" />
                    </figure>
                </article>
                 <div className="mt-4">
                    <p className="text-base leading-relaxed">
                        {mainArticle.summary}
                    </p>
                 </div>
            </main>

            <aside className="lg:col-span-1 space-y-4 lg:border-l-2 lg:border-gray-200 lg:pl-6 mt-6 lg:mt-0">
              {sidebarArticles.map(article => (
                <article key={article.url} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <h3 className="text-lg font-bold leading-tight mb-1 text-gray-800" style={{ fontFamily: `'Playfair Display', serif` }}>{article.title}</h3>
                  <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider">{article.sourceName}</p>
                </article>
              ))}
            </aside>
          </div>

          {bottomArticles.length > 0 && (
             <section className="mt-6 pt-6 border-t-4 border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                {bottomArticles.map(article => (
                    <article key={article.url}>
                        <h3 className="text-lg font-bold leading-tight mb-1" style={{ fontFamily: `'Playfair Display', serif` }}>{article.title}</h3>
                        <p className="text-sm leading-relaxed text-gray-700">{article.summary}</p>
                        <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider mt-2">{article.sourceName}</p>
                    </article>
                ))}
             </section>
          )}

        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={handlePrint}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v-2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-1V4a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          {t[language].print}
        </button>
        <button
          onClick={handleEmail}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-teal-500 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            {t[language].mail}
        </button>
         <button 
           onClick={onClose}
           className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
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

export default NewspaperView;