import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chat } from '@google/genai';
import { streamNewsAndSummaries, fetchFrontPageArticles, generateNewspaperImage, createChatSession, generateArticlesSummary } from './services/geminiService';
import { Article, AppState, SortOrder, Category, Language, ChatMessage } from './types';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ErrorMessage from './components/ErrorMessage';
import ProgressBar from './components/ProgressBar';
import SortControls from './components/SortControls';
import NewspaperView from './components/NewspaperView';
import CategoryCard from './components/CategoryCard';
import NewspaperGeneratorCard from './components/NewspaperGeneratorCard';
import ChatView from './components/ChatView';
import CookieConsentToast from './components/CookieConsentToast';
import { getCookie, setCookie, deleteCookie } from './services/cookieUtils';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import LoginScreen from './components/LoginScreen';

// Plaintext secret code for maximum reliability in all environments.
const SECRET_CODE = '8641';

const CATEGORIES: Category[] = [
  {
    key: 'ai',
    title: { nl: 'Kunstmatige Intelligentie', en: 'Artificial Intelligence' },
    description: { nl: 'De nieuwste doorbraken in AI, van machine learning tot neurale netwerken.', en: 'The latest breakthroughs in AI, from machine learning to neural networks.' },
    persona: {
      nl: 'Je bent een enthousiaste AI-specialist en tech-evangelist. Je spreekt met passie en diepgaande kennis over de laatste trends en doorbraken in kunstmatige intelligentie.',
      en: 'You are an enthusiastic AI specialist and tech evangelist. You speak with passion and deep knowledge about the latest trends and breakthroughs in artificial intelligence.'
    }
  },
  {
    key: 'hr',
    title: { nl: 'HR en Salaris', en: 'HR and Payroll' },
    description: { nl: 'Automatiseer de complete HR-cyclus van vacature tot uitstroom.', en: 'Automate the complete HR cycle from vacancy to outflow.' },
    persona: {
      nl: 'Je bent een professionele en empathische HR Business Partner en salaris expert. Je adviseert over strategische HR-onderwerpen, wet- en regelgeving en de impact van technologie op de werkvloer. Maar je weet ook alles van een loonrun en alle regeles en wetgeving dat daarvoor nodig is. Ook heb je diepe CAO kennis.',
      en: 'You are a professional and empathetic HR Business Partner and payroll expert. You advise on strategic HR topics, laws and regulations, and the impact of technology on the workplace.But you also know everything about running payroll and all the rules and legislation required for it. You also have deep knowledge of collective labor agreements.'
    }
  },
  {
    key: 'production',
    title: { nl: 'Productie', en: 'Production' },
    description: { nl: 'Digitaliseer je kantoor, werkvloer, magazijn en productieketen.', en: 'Digitize your office, workshop, warehouse, and production chain.' },
    persona: {
      nl: 'Je bent een ervaren Operations Manager met expertise in productieprocessen en supply chain management. Je focus ligt op efficiëntie, digitalisering en ketenoptimalisatie.',
      en: 'You are an experienced Operations Manager with expertise in production processes and supply chain management. Your focus is on efficiency, digitization, and chain optimization.'
    }
  },
  {
    key: 'ecommerce',
    title: { nl: 'e-Commerce', en: 'e-Commerce' },
    description: { nl: 'Breng voorraadbeheer, orderverwerking en orderpicking eenvoudig samen.', en: 'Easily combine inventory management, order processing, and order picking.' },
    persona: {
      nl: 'Je bent een dynamische e-Commerce strateeg. Je begrijpt de uitdagingen van online retail, van voorraadbeheer tot klantervaring, en je denkt in oplossingen.',
      en: 'You are a dynamic e-Commerce strategist. You understand the challenges of online retail, from inventory management to customer experience, and you think in terms of solutions.'
    }
  },
  {
    key: 'construction',
    title: { nl: 'Bouw', en: 'Construction' },
    description: { nl: 'Werk met de meest complete bouwoplossing voor kantoor en de bouwplaats.', en: 'Work with the most complete construction solution for the office and construction site.' },
    persona: {
      nl: 'Je bent een pragmatische projectmanager in de bouw. Je bent bekend met de uitdagingen op de bouwplaats en op kantoor, en je zoekt altijd naar praktische, technologische oplossingen.',
      en: 'You are a pragmatic construction project manager. You are familiar with the challenges on the construction site and in the office, and you always look for practical, technological solutions.'
    }
  },
  {
    key: 'projects',
    title: { nl: 'Project administratie', en: 'Project Administration' },
    description: { nl: 'Een totaaloplossing voor het beheren van projecten en administratie.', en: 'A total solution for managing projects and administration.' },
    persona: {
      nl: 'Je bent een gestructureerde en efficiënte projectcontroller. Je overziet de financiële en administratieve kant van projecten en je bent expert in budgetbeheer en resourceplanning.',
      en: 'You are a structured and efficient project controller. You oversee the financial and administrative side of projects and are an expert in budget management and resource planning.'
    }
  },
  {
    key: 'trade',
    title: { nl: 'Handel', en: 'Trade' },
    description: { nl: 'Digitaliseer je kantoor, magazijn en de keten in één systeem.', en: 'Digitize your office, warehouse, and supply chain in one system.' },
    persona: {
      nl: 'Je bent een slimme handelsondernemer met diepgaande kennis van inkoop, verkoop en logistiek. Je focus ligt op het optimaliseren van marges en het digitaliseren van de handelsketen.',
      en: 'You are a smart trade entrepreneur with in-depth knowledge of purchasing, sales, and logistics. Your focus is on optimizing margins and digitizing the trade chain.'
    }
  },
  {
    key: 'accounting',
    title: { nl: 'Boekhouden', en: 'Bookkeeping' },
    description: { nl: 'Neem strategische beslissingen met altijd de juiste cijfers.', en: 'Make strategic decisions with always the right figures.' },
    persona: {
      nl: 'Je bent een financieel expert en controller. Je bent analytisch, nauwkeurig en je kunt complexe financiële data vertalen naar strategische inzichten voor het management.',
      en: 'You are a financial expert and controller. You are analytical, accurate, and you can translate complex financial data into strategic insights for management.'
    }
  },
  {
    key: 'accountants',
    title: { nl: 'Accountants', en: 'Accountants' },
    description: { nl: 'Geïntegreerde software voor boekhouding, aangiftes en rapportages.', en: 'Integrated software for accounting, declarations, and reports.' },
    persona: {
      nl: 'Je bent een moderne, data-gedreven accountant. Je helpt klanten niet alleen met hun boekhouding en aangiftes, maar adviseert hen ook proactief op basis van de laatste cijfers en trends.',
      en: 'You are a modern, data-driven accountant. You not only help clients with their bookkeeping and declarations, but also proactively advise them based on the latest figures and trends.'
    }
  },
  {
    key: 'exact_news',
    title: { nl: 'Exact Nieuws', en: 'Exact News' },
    description: { nl: 'Algemeen nieuws over Exact.com, zo actueel mogelijk.', en: 'General news about Exact.com, as current as possible.' },
    searchQuery: { nl: 'nieuws over Exact.com', en: 'news about Exact.com' },
    persona: {
      nl: 'Je bent een Corporate Communications Manager van Exact. Je bent perfect op de hoogte van al het recente nieuws en de ontwikkelingen binnen het bedrijf en deelt dit op een heldere en professionele manier.',
      en: 'You are a Corporate Communications Manager at Exact. You are perfectly informed about all recent news and developments within the company and share this in a clear and professional manner.'
    }
  },
  {
    key: 'competitors',
    title: { nl: 'Concurrenten', en: 'Competitors' },
    description: { nl: 'Het laatste nieuws over de belangrijkste concurrenten van Exact in de markt.', en: 'The latest news about Exact\'s main competitors in the market.' },
    searchQuery: { nl: 'recente nieuwsartikelen over QuickBooks, Sage Intacct, Xero, NetSuite, AFAS, Odoo, Visma, e-Boekhouden.nl, Moneybird, Nmbrs, Hooray', en: 'recent news articles about QuickBooks, Sage Intacct, Xero, NetSuite, AFAS, Odoo, Visma, e-Boekhouden.nl, Moneybird, Nmbrs, Hooray' },
    persona: {
      nl: 'Je bent een scherpe en strategische marktanalist. Je volgt de concurrentie op de voet en kunt hun acties, aankondigingen en nieuwsberichten duiden in de context van de totale markt.',
      en: 'You are a sharp and strategic market analyst. You closely follow the competition and can interpret their actions, announcements, and news reports in the context of the overall market.'
    }
  },
  {
    key: 'exact_reviews',
    title: { nl: 'Exact Gebruikersreviews', en: 'Exact User Reviews' },
    description: { nl: 'Analyse van de meest recente gebruikersreviews van Exact op Kiyoh.', en: 'Analysis of the most recent user reviews of Exact on Kiyoh.' },
    searchQuery: { nl: 'recente gebruikersreviews over Exact van kiyoh.com', en: 'recent user reviews about Exact from kiyoh.com' },
    isReviewCategory: true,
    persona: {
      nl: 'Je bent een klantgerichte Product Manager. Je analyseert gebruikersfeedback om de stem van de klant te begrijpen. Je identificeert trends, pijnpunten en complimenten in de reviews.',
      en: 'You are a customer-centric Product Manager. You analyze user feedback to understand the voice of the customer. You identify trends, pain points, and compliments in the reviews.'
    }
  },
];

const App: React.FC = () => {
  type View = 'categories' | 'articles' | 'newspaperLoading' | 'newspaperView' | 'expertChat';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [view, setView] = useState<View>('categories');
  
  const [appState, setAppState] = useState<AppState>('idle');
  const [articles, setArticles] = useState<Article[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [newspaperImageUrl, setNewspaperImageUrl] = useState<string>('');
  const [newspaperArticles, setNewspaperArticles] = useState<Article[]>([]);
  const [newspaperLoadingState, setNewspaperLoadingState] = useState<{ step: 1 | 2; message: string; error?: string }>({ step: 1, message: '' });
  
  const [cookieConsent, setCookieConsent] = useState<boolean>(() => getCookie('cookie_consent') === 'true');
  const [showCookieToast, setShowCookieToast] = useState<boolean>(false);

  const [favoriteCategories, setFavoriteCategories] = useState<Set<string>>(() => {
    try {
      const savedFavorites = getCookie('favoriteCategories');
      return savedFavorites ? new Set(JSON.parse(savedFavorites)) : new Set();
    } catch (error) {
      console.error("Fout bij het lezen van favorieten uit cookie:", error);
      return new Set();
    }
  });

  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = getCookie('language');
    if (savedLang === 'en' || savedLang === 'nl') return savedLang;
    return 'nl';
  });

  const [theme, setTheme] = useState(() => {
    const savedTheme = getCookie('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
    // Default to light mode if no cookie is set.
    return 'light';
  });

  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<'articles' | 'summary' | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [speakingArticleUrl, setSpeakingArticleUrl] = useState<string | null>(null);
  
  const { play, cancel } = useTextToSpeech({
    language,
    onBoundary: (itemId) => setSpeakingArticleUrl(itemId),
    onEnd: () => {
      setNowPlaying(null);
      setSpeakingArticleUrl(null);
    }
  });
  
  useEffect(() => {
    // Check session storage to bypass login if already authenticated in the same session
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!cookieConsent && isAuthenticated) {
      const timer = setTimeout(() => setShowCookieToast(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [cookieConsent, isAuthenticated]);

  useEffect(() => {
      const root = window.document.documentElement;
      root.lang = language;
      if (theme === 'dark') {
          root.classList.add('dark');
      } else {
          root.classList.remove('dark');
      }
      if (cookieConsent) {
          setCookie('theme', theme, 365);
          setCookie('language', language, 365);
      }
  }, [theme, language, cookieConsent]);

  const toggleTheme = useCallback(() => {
      setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => prevLang === 'nl' ? 'en' : 'nl');
  }, []);

  useEffect(() => {
    if (cookieConsent) {
        try {
          setCookie('favoriteCategories', JSON.stringify(Array.from(favoriteCategories)), 365);
        } catch (error) {
          console.error("Fout bij het opslaan van favorieten in cookie:", error);
        }
    }
  }, [favoriteCategories, cookieConsent]);

  useEffect(() => {
    if (view === 'articles' && appState === 'success' && selectedCategory && articles.length > 0) {
        const session = createChatSession(selectedCategory, language, articles);
        setChatSession(session);
        setChatHistory([]);
    }
  }, [view, articles, appState, language, selectedCategory]);

  const handleToggleFavorite = useCallback((categoryKey: string) => {
    setFavoriteCategories(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(categoryKey)) {
        newFavorites.delete(categoryKey);
      } else {
        newFavorites.add(categoryKey);
      }
      return newFavorites;
    });
  }, []);
  
  const handleAcceptCookies = useCallback(() => {
    setCookie('cookie_consent', 'true', 365);
    setCookieConsent(true);
    setShowCookieToast(false);
    // Also save current settings immediately upon consent
    setCookie('theme', theme, 365);
    setCookie('language', language, 365);
    setCookie('favoriteCategories', JSON.stringify(Array.from(favoriteCategories)), 365);
  }, [theme, language, favoriteCategories]);

  const handleResetSettings = useCallback(() => {
    const confirmationText = language === 'nl' 
      ? 'Weet u zeker dat u alle instellingen en cookies wilt resetten? De pagina wordt hierna opnieuw geladen.' 
      : 'Are you sure you want to reset all settings and cookies? The page will reload.';
    
    if (window.confirm(confirmationText)) {
      deleteCookie('cookie_consent');
      deleteCookie('language');
      deleteCookie('theme');
      deleteCookie('favoriteCategories');
      sessionStorage.removeItem('isAuthenticated');
      window.location.reload();
    }
  }, [language]);
  
  const handleLoginAttempt = async (code: string): Promise<boolean> => {
    if (code === SECRET_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAuthenticated', 'true');
      return true;
    }
    return false;
  };

  const getNews = useCallback((category: Category) => {
    setView('articles');
    const expectedCount = category.isReviewCategory ? 50 : 10;
    
    setAppState('loading');
    setArticles([]);
    setErrorMessage('');
    setProgress(0);
    setSortOrder(null);
    setChatSession(null);
    setChatHistory([]);
    cancel();

    const message = category.isReviewCategory
      ? (language === 'nl' ? `De AI analyseert tot ${expectedCount} gebruikersreviews...` : `The AI is analyzing up to ${expectedCount} user reviews...`)
      : (language === 'nl' ? `De AI zoekt en analyseert het laatste nieuws over ${category.title[language].toLowerCase()}...` : `The AI is searching and analyzing the latest news about ${category.title[language].toLowerCase()}...`);
    setLoadingMessage(message);

    let firstChunkReceived = false;

    streamNewsAndSummaries({
      topic: (category.searchQuery && category.searchQuery[language]) || category.title[language],
      isReviewSearch: !!category.isReviewCategory,
      language: language,
      ignoreDateFilter: category.key === 'exact_news',
      onArticle: (article) => {
        if (!firstChunkReceived) {
          setLoadingMessage(language === 'nl' ? "Resultaten worden geladen..." : "Loading results...");
          firstChunkReceived = true;
        }
        setArticles((prevArticles) => {
          const newArticles = [...prevArticles, article];
          setProgress(
            (newArticles.length / expectedCount) * 100
          );
          return newArticles;
        });
      },
      onComplete: () => {
        setAppState('success');
        setProgress(100);
        setLoadingMessage('');
      },
      onError: (err) => {
        console.error(err);
        setErrorMessage(
          err.message || (language === 'nl' ? 'Er is een onbekende fout opgetreden.' : 'An unknown error occurred.')
        );
        setAppState('error');
        setLoadingMessage('');
      },
    });
  }, [language, cancel]);
  
  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    getNews(category);
  };
  
  const handleAskExpert = (category: Category) => {
    setSelectedCategory(category);
    setChatHistory([]);
    // Create chat session without article context
    const session = createChatSession(category, language);
    setChatSession(session);
    setView('expertChat');
    cancel(); // Stop any ongoing speech
  };

  const handleGoBack = () => {
    cancel();
    setView('categories');
    setSelectedCategory(null);
    setArticles([]);
    setNewspaperArticles([]);
    setNewspaperImageUrl('');
    setAppState('idle');
    setSortOrder(null);
    setLoadingMessage('');
    setChatSession(null);
    setChatHistory([]);
  };
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession) return;

    setIsChatLoading(true);
    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    const modelPlaceholder: ChatMessage = { role: 'model', parts: [{ text: '' }] };
    
    setChatHistory(prev => [...prev, newUserMessage, modelPlaceholder]);

    try {
      const stream = await chatSession.sendMessageStream({ message });
      
      let modelResponseText = '';

      for await (const chunk of stream) {
        modelResponseText += chunk.text;
        setChatHistory(prev => {
            const updatedModelMessage: ChatMessage = { role: 'model', parts: [{ text: modelResponseText }] };
            return [...prev.slice(0, -1), updatedModelMessage];
        });
      }
    } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text: language === 'nl' ? 'Sorry, er is iets misgegaan.' : 'Sorry, something went wrong.' }] };
        setChatHistory(prev => {
          return [...prev.slice(0, -1), errorMessage];
        });
    } finally {
        setIsChatLoading(false);
    }
  }, [chatSession, language]);

  const generateNewspaper = useCallback(async (categoriesToFetch: Category[]) => {
    if (categoriesToFetch.length === 0) {
      console.error("generateNewspaper called with no categories.");
      const message = language === 'nl' ? "Geen categorieën geselecteerd voor de krant." : "No categories selected for the newspaper.";
      setNewspaperLoadingState(s => ({ ...s, error: message, step: 1 }));
      setView('newspaperLoading');
      return;
    }

    setView('newspaperLoading');
    setNewspaperLoadingState({ step: 1, message: language === 'nl' ? "Stap 1/2: Belangrijkste nieuws verzamelen..." : "Step 1/2: Collecting top news..." });
    setNewspaperArticles([]);
    setNewspaperImageUrl('');
    cancel();

    try {
      const fetchedArticles = await fetchFrontPageArticles(categoriesToFetch, language);
      
      if (fetchedArticles.length === 0) {
        throw new Error(language === 'nl' ? "Geen recente artikelen gevonden om een voorpagina te maken. Probeer het morgen opnieuw." : "No recent articles found to create a front page. Please try again tomorrow.");
      }
      setNewspaperArticles(fetchedArticles);
      
      setNewspaperLoadingState({ step: 2, message: language === 'nl' ? "Stap 2/2: Hoofdafbeelding genereren met AI..." : "Step 2/2: Generating main image with AI..." });
      
      const imageUrl = await generateNewspaperImage(categoriesToFetch, language);
      setNewspaperImageUrl(imageUrl);
      setView('newspaperView');

    } catch (error) {
      console.error("Error generating newspaper:", error);
      const message = error instanceof Error ? error.message : (language === 'nl' ? "Een onbekende fout is opgetreden." : "An unknown error has occurred.");
      setNewspaperLoadingState(s => ({ ...s, error: message }));
    }
  }, [language, cancel]);


  const handleGenerateFrontPage = useCallback(() => {
    const selectedNewsCategories = CATEGORIES.filter(c => !c.isReviewCategory && favoriteCategories.has(c.key));
     if (selectedNewsCategories.length < 1) return;
    generateNewspaper(selectedNewsCategories);
  }, [favoriteCategories, generateNewspaper]);

  const handleGenerateNewspaperFromCategory = useCallback(() => {
    if (!selectedCategory) return;
    generateNewspaper([selectedCategory]);
  }, [selectedCategory, generateNewspaper]);

  const sortedArticles = useMemo(() => {
    if (sortOrder === null) return articles;
    const sortableArticles = [...articles];

    if (sortOrder === 'date') {
      return sortableArticles.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
    }
    if (sortOrder === 'rating') {
      return sortableArticles.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    return articles;
  }, [articles, sortOrder]);
  
  const handlePlayPodcast = useCallback(() => {
    const speechQueue = sortedArticles.map(article => ({
      text: `${article.title}. ${language === 'nl' ? 'van' : 'from'} ${article.sourceName}. ${article.summary}`,
      id: article.url,
    }));
    play(speechQueue);
    setNowPlaying('articles');
  }, [sortedArticles, play, language]);

  const handlePlaySummaryPodcast = useCallback(async () => {
    if (!sortedArticles || sortedArticles.length === 0) return;

    setIsSummaryLoading(true);
    setNowPlaying(null);
    try {
      const summaryText = await generateArticlesSummary(sortedArticles, language);
      play([{ text: summaryText, id: 'summary-podcast' }]);
      setNowPlaying('summary');
    } catch (error) {
      console.error("Error generating summary podcast:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(message);
      setNowPlaying(null);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [sortedArticles, language, play]);

  const handleStopPodcast = useCallback(() => {
    cancel();
  }, [cancel]);

  const t = {
    nl: {
      backToCategories: 'Terug naar categorieën',
      generateNewspaper: 'Maak Krant van deze Categorie',
      listenPodcast: 'Luister Podcast',
      stopPodcast: 'Stop Podcast',
      listenSummary: 'Luister Samenvatting',
      stopSummary: 'Stop Samenvatting',
      generatingSummary: 'Samenvatting genereren...',
      noResultsTitle: 'Geen resultaten gevonden',
      noResultsBody: 'Er konden geen recente artikelen of reviews voor deze categorie worden gevonden. Probeer het later opnieuw of kies een andere categorie.',
      footer: 'Nieuws sources door Gemini en Google Search',
      resetSettings: 'Reset instellingen & cookies',
      speakingWith: 'In gesprek met de',
      expert: 'Expert'
    },
    en: {
      backToCategories: 'Back to categories',
      generateNewspaper: 'Create Newspaper from this Category',
      listenPodcast: 'Listen to Podcast',
      stopPodcast: 'Stop Podcast',
      listenSummary: 'Listen to Summary',
      stopSummary: 'Stop Summary',
      generatingSummary: 'Generating summary...',
      noResultsTitle: 'No results found',
      noResultsBody: 'No recent articles or reviews could be found for this category. Please try again later or choose another category.',
      footer: 'News sources by Gemini and Google Search',
      resetSettings: 'Reset settings & cookies',
      speakingWith: 'Speaking with the',
      expert: 'Expert'
    }
  }

  const renderCategoryView = () => (
    <div className="mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        <NewspaperGeneratorCard 
          onGenerate={handleGenerateFrontPage} 
          isDisabled={favoriteCategories.size < 1}
          language={language}
          favoriteCategories={CATEGORIES.filter(c => favoriteCategories.has(c.key))}
        />
        {CATEGORIES.map(cat => (
          <CategoryCard 
             key={cat.key} 
             category={cat} 
             onSelect={() => handleSelectCategory(cat)}
             onAskExpert={() => handleAskExpert(cat)}
             isFavorite={favoriteCategories.has(cat.key)}
             onToggleFavorite={() => handleToggleFavorite(cat.key)}
             language={language}
          />
        ))}
      </div>
    </div>
  );

  const renderArticleView = () => (
    <>
      <div className="my-6 flex flex-wrap justify-between items-center gap-4">
         <button 
           onClick={handleGoBack}
           className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
         >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
           </svg>
           {t[language].backToCategories}
         </button>

         {appState === 'success' && articles.length > 0 && (
           <div className="flex flex-wrap gap-4">
             {/* Full Podcast Button */}
              {nowPlaying === 'articles' ? (
                  <button
                      onClick={handleStopPodcast}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      {t[language].stopPodcast}
                  </button>
              ) : (
                  <button
                      onClick={handlePlayPodcast}
                      disabled={nowPlaying !== null || isSummaryLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                      {t[language].listenPodcast}
                  </button>
              )}

              {/* Summary Podcast Button */}
              {nowPlaying === 'summary' ? (
                  <button
                      onClick={handleStopPodcast}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      {t[language].stopSummary}
                  </button>
              ) : (
                  <button
                      onClick={handlePlaySummaryPodcast}
                      disabled={nowPlaying !== null || isSummaryLoading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isSummaryLoading ? (
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v3a2 2 0 01-2-2H4a2 2 0 01-2-2v-3z" />
                          </svg>
                      )}
                      {isSummaryLoading ? t[language].generatingSummary : t[language].listenSummary}
                  </button>
              )}
            <button
                onClick={handleGenerateNewspaperFromCategory}
                disabled={nowPlaying !== null}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                {t[language].generateNewspaper}
             </button>
           </div>
         )}
      </div>

      {appState === 'loading' && (
        <div className="mt-8">
          <ProgressBar progress={progress} language={language} />
          {loadingMessage && (
             <p className="text-center text-slate-500 dark:text-slate-400 mt-4 animate-pulse">
               {loadingMessage}
             </p>
          )}
        </div>
      )}
      
      {appState === 'success' && articles.length > 0 && (
        <SortControls activeSort={sortOrder} onSortChange={setSortOrder} language={language} />
      )}

      <div className="mt-8">
        {appState === 'error' && (
           <ErrorMessage message={errorMessage} onRetry={() => handleSelectCategory(selectedCategory!)} language={language} />
        )}

        {appState === 'success' && articles.length === 0 && (
          <div className="text-center py-16 px-6 bg-slate-200/30 dark:bg-gray-800/30 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
            <h3 className="mt-4 text-xl font-semibold text-slate-700 dark:text-slate-300">{t[language].noResultsTitle}</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t[language].noResultsBody}
            </p>
          </div>
        )}

        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {sortedArticles.map((article, index) => (
              <ArticleCard 
                key={article.url || index} 
                article={article} 
                language={language}
                isSpeaking={article.url === speakingArticleUrl}
              />
            ))}
          </div>
        )}

      </div>
      
      {chatSession && articles.length > 0 && appState === 'success' && (
        <div className="mt-16">
          <ChatView 
            history={chatHistory} 
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            language={language}
            selectedCategory={selectedCategory}
          />
        </div>
      )}
    </>
  );

  const renderNewspaperLoadingView = () => (
    <div className="text-center mt-24">
       <div className="inline-block relative">
        <svg className="w-24 h-24 text-teal-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-bold text-slate-700 dark:text-slate-300">{newspaperLoadingState.step}/2</span>
      </div>
      <p className="text-slate-700 dark:text-slate-300 text-xl mt-6 animate-pulse">{newspaperLoadingState.message}</p>
      {newspaperLoadingState.error && (
        <div className="mt-8 max-w-xl mx-auto">
           <ErrorMessage message={newspaperLoadingState.error} onRetry={handleGoBack} language={language} />
        </div>
      )}
    </div>
  );

  const renderExpertChatView = () => (
    <>
      <div className="my-6 flex justify-between items-center">
        <button 
          onClick={handleGoBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-gray-700/50 hover:bg-slate-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          {t[language].backToCategories}
        </button>
      </div>
      <div className="mb-8 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-l-4 border-teal-400 dark:border-teal-500 rounded-r-lg shadow-md">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          {t[language].speakingWith} {selectedCategory?.title[language]} {t[language].expert}
        </h2>
        <blockquote className="mt-2 italic text-slate-600 dark:text-slate-400">
          "{selectedCategory?.persona?.[language]}"
        </blockquote>
      </div>

      {chatSession && (
        <ChatView 
          history={chatHistory} 
          onSendMessage={handleSendMessage}
          isLoading={isChatLoading}
          language={language}
          selectedCategory={selectedCategory}
          isExpertMode={true}
        />
      )}
    </>
  );

  const renderContent = () => {
    switch(view) {
      case 'categories': return renderCategoryView();
      case 'articles': return renderArticleView();
      case 'expertChat': return renderExpertChatView();
      case 'newspaperLoading': return renderNewspaperLoadingView();
      case 'newspaperView': 
        return <NewspaperView 
                 mainImageUrl={newspaperImageUrl} 
                 articles={newspaperArticles} 
                 onClose={handleGoBack}
                 language={language}
               />;
      default: return renderCategoryView();
    }
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLoginAttempt} language={language} />;
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-800 dark:text-slate-200 font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Header 
          onGoHome={handleGoBack}
          selectedCategory={selectedCategory} 
          isNewspaperView={view === 'newspaperView' || view === 'newspaperLoading'}
          isExpertChatView={view === 'expertChat'}
          language={language}
          theme={theme}
          toggleTheme={toggleTheme}
          toggleLanguage={toggleLanguage}
        />
        {renderContent()}
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>{t[language].footer}</p>
        <button
          onClick={handleResetSettings}
          className="mt-2 text-xs text-slate-500 hover:text-red-500 dark:hover:text-red-400 underline transition-colors"
        >
          {t[language].resetSettings}
        </button>
      </footer>
       <CookieConsentToast 
         isVisible={showCookieToast}
         onAccept={handleAcceptCookies}
         language={language}
       />
    </div>
  );
};

export default App;