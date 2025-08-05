import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Chat } from '@google/genai';
import { streamNewsAndSummaries, fetchFrontPageArticles, createChatSession, generateArticlesSummary, generateChatSummaryAndActions, generateInfographic, generateBookRecommendations, generateReadingTableLinks, generateTedTalks, generateLinkedInLearningCourses } from './services/geminiService';
import { Article, AppState, SortOrder, Category, Language, ChatMessage, RoleTemplate, ChatSummary, ReadingLink, Book, TedTalkResponse, LinkedInLearningCourse } from './types';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import ErrorMessage from './components/ErrorMessage';
import ProgressBar from './components/ProgressBar';
import SortControls from './components/SortControls';
import NewspaperView from './components/NewspaperView';
import CategoryCard from './components/CategoryCard';
import NewspaperGeneratorCard from './components/NewspaperGeneratorCard';
import InfoCard from './components/InfoCard';
import InfoView from './components/InfoView';
import { ChatView } from './components/ChatView';
import CookieConsentToast from './components/CookieConsentToast';
import { getCookie, setCookie, deleteCookie } from './services/cookieUtils';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import LoginScreen from './components/LoginScreen';
import CpoRoleSetupView from './components/CpoRoleSetupView';
import CpoRoleChatView from './components/CpoRoleChatView';
import CpoChatPrintView from './components/CpoChatPrintView';

// Plaintext secret code for maximum reliability in all environments.
const SECRET_CODE = '8641';

const CATEGORIES: Category[] = [
  {
    key: 'ai',
    title: { nl: 'Kunstmatige Intelligentie', en: 'Artificial Intelligence', de: 'Künstliche Intelligenz' },
    description: { nl: 'De nieuwste doorbraken in AI, van machine learning tot neurale netwerken.', en: 'The latest breakthroughs in AI, from machine learning to neural networks.', de: 'Die neuesten Durchbrüche in der KI, von maschinellem Lernen bis zu neuronalen Netzen.' },
    persona: {
      nl: 'Je bent een enthousiaste AI-specialist en tech-evangelist. Je spreekt met passie en diepgaande kennis over de laatste trends en doorbraken in kunstmatige intelligentie.',
      en: 'You are an enthusiastic AI specialist and tech evangelist. You speak with passion and deep knowledge about the latest trends and breakthroughs in artificial intelligence.',
      de: 'Sie sind ein enthusiastischer KI-Spezialist und Tech-Evangelist. Sie sprechen mit Leidenschaft und tiefgreifendem Wissen über die neuesten Trends und Durchbrüche in der künstlichen Intelligenz.',
    }
  },
  {
    key: 'hr',
    title: { nl: 'HR en Salaris', en: 'HR and Payroll', de: 'HR und Gehaltsabrechnung' },
    description: { nl: 'Automatiseer de complete HR-cyclus van vacature tot uitstroom.', en: 'Automate the complete HR cycle from vacancy to outflow.', de: 'Automatisieren Sie den kompletten HR-Zyklus von der Vakanz bis zum Austritt.' },
    persona: {
      nl: 'Je bent een professionele en empathische HR Business Partner en salaris expert. Je adviseert over strategische HR-onderwerpen, wet- en regelgeving en de impact van technologie op de werkvloer. Maar je weet ook alles van een loonrun en alle regeles en wetgeving dat daarvoor nodig is. Ook heb je diepe CAO kennis.',
      en: 'You are a professional and empathetic HR Business Partner and payroll expert. You advise on strategic HR topics, laws and regulations, and the impact of technology on the workplace.But you also know everything about running payroll and all the rules and legislation required for it. You also have deep knowledge of collective labor agreements.',
      de: 'Sie sind ein professioneller und einfühlsamer HR Business Partner und Gehaltsexperte. Sie beraten zu strategischen HR-Themen, Gesetzen und Vorschriften sowie den Auswirkungen der Technologie am Arbeitsplatz. Sie kennen sich auch bestens mit der Lohn- und Gehaltsabrechnung und allen dafür erforderlichen Regeln und Gesetzen aus. Sie haben auch tiefes Wissen über Tarifverträge.',
    }
  },
  {
    key: 'production',
    title: { nl: 'Productie', en: 'Production', de: 'Produktion' },
    description: { nl: 'Digitaliseer je kantoor, werkvloer, magazijn en productieketen.', en: 'Digitize your office, workshop, warehouse, and production chain.', de: 'Digitalisieren Sie Ihr Büro, Ihre Werkstatt, Ihr Lager und Ihre Produktionskette.' },
    persona: {
      nl: 'Je bent een ervaren Operations Manager met expertise in productieprocessen en supply chain management. Je focus ligt op efficiëntie, digitalisering en ketenoptimalisatie.',
      en: 'You are an experienced Operations Manager with expertise in production processes and supply chain management. Your focus is on efficiency, digitization, and chain optimization.',
      de: 'Sie sind ein erfahrener Betriebsleiter mit Expertise in Produktionsprozessen und Supply-Chain-Management. Ihr Fokus liegt auf Effizienz, Digitalisierung und Kettenoptimierung.',
    }
  },
  {
    key: 'ecommerce',
    title: { nl: 'e-Commerce', en: 'e-Commerce', de: 'E-Commerce' },
    description: { nl: 'Breng voorraadbeheer, orderverwerking en orderpicking eenvoudig samen.', en: 'Easily combine inventory management, order processing, and order picking.', de: 'Kombinieren Sie einfach Bestandsverwaltung, Auftragsabwicklung und Kommissionierung.' },
    persona: {
      nl: 'Je bent een dynamische e-Commerce strateeg. Je begrijpt de uitdagingen van online retail, van voorraadbeheer tot klantervaring, en je denkt in oplossingen.',
      en: 'You are a dynamic e-Commerce strategist. You understand the challenges of online retail, from inventory management to customer experience, and you think in terms of solutions.',
      de: 'Sie sind ein dynamischer E-Commerce-Stratege. Sie verstehen die Herausforderungen des Online-Handels, von der Bestandsverwaltung bis zum Kundenerlebnis, und Sie denken in Lösungen.',
    }
  },
  {
    key: 'construction',
    title: { nl: 'Bouw', en: 'Construction', de: 'Bauwesen' },
    description: { nl: 'Werk met de meest complete bouwoplossing voor kantoor en de bouwplaats.', en: 'Work with the most complete construction solution for the office and construction site.', de: 'Arbeiten Sie mit der umfassendsten Baulösung für Büro und Baustelle.' },
    persona: {
      nl: 'Je bent een pragmatische projectmanager in de bouw. Je bent bekend met de uitdagingen op de bouwplaats en op kantoor, en je zoekt altijd naar praktische, technologische oplossingen.',
      en: 'You are a pragmatic construction project manager. You are familiar with the challenges on the construction site and in the office, and you always look for practical, technological solutions.',
      de: 'Sie sind ein pragmatischer Bauprojektmanager. Sie sind mit den Herausforderungen auf der Baustelle und im Büro vertraut und suchen immer nach praktischen, technologischen Lösungen.',
    }
  },
  {
    key: 'projects',
    title: { nl: 'Project administratie', en: 'Project Administration', de: 'Projektverwaltung' },
    description: { nl: 'Een totaaloplossing voor het beheren van projecten en administratie.', en: 'A total solution for managing projects and administration.', de: 'Eine Gesamtlösung für die Verwaltung von Projekten und Administration.' },
    persona: {
      nl: 'Je bent een gestructureerde en efficiënte projectcontroller. Je overziet de financiële en administratieve kant van projecten en je bent expert in budgetbeheer en resourceplanning.',
      en: 'You are a structured and efficient project controller. You oversee the financial and administrative side of projects and are an expert in budget management and resource planning.',
      de: 'Sie sind ein strukturierter und effizienter Projektcontroller. Sie überwachen die finanzielle und administrative Seite von Projekten und sind Experte für Budgetmanagement und Ressourcenplanung.',
    }
  },
  {
    key: 'trade',
    title: { nl: 'Handel', en: 'Trade', de: 'Handel' },
    description: { nl: 'Digitaliseer je kantoor, magazijn en de keten in één systeem.', en: 'Digitize your office, warehouse, and supply chain in one system.', de: 'Digitalisieren Sie Ihr Büro, Lager und die Lieferkette in einem System.' },
    persona: {
      nl: 'Je bent een slimme handelsondernemer met diepgaande kennis van inkoop, verkoop en logistiek. Je focus ligt op het optimaliseren van marges en het digitaliseren van de handelsketen.',
      en: 'You are a smart trade entrepreneur with in-depth knowledge of purchasing, sales, and logistics. Your focus is on optimizing margins and digitizing the trade chain.',
      de: 'Sie sind ein kluger Handelsunternemer mit fundierten Kenntnissen in Einkauf, Vertrieb und Logistik. Ihr Fokus liegt auf der Optimierung von Margen und der Digitalisierung der Handelskette.',
    }
  },
  {
    key: 'accounting',
    title: { nl: 'Boekhouden', en: 'Bookkeeping', de: 'Buchhaltung' },
    description: { nl: 'Neem strategische beslissingen met altijd de juiste cijfers.', en: 'Make strategic decisions with always the right figures.', de: 'Treffen Sie strategische Entscheidungen immer mit den richtigen Zahlen.' },
    persona: {
      nl: 'Je bent een financieel expert en controller. Je bent analytisch, nauwkeurig en je kunt complexe financiële data vertalen naar strategische inzichten voor het management.',
      en: 'You are a financial expert and controller. You are analytical, accurate, and you can translate complex financial data into strategic insights for management.',
      de: 'Sie sind ein Finanzexperte und Controller. Sie sind analytisch, genau und können komplexe Finanzdaten in strategische Erkenntnisse für das Management umsetzen.',
    }
  },
  {
    key: 'accountants',
    title: { nl: 'Accountants', en: 'Accountants', de: 'Wirtschaftsprüfer' },
    description: { nl: 'Geïntegreerde software voor boekhouding, aangiftes en rapportages.', en: 'Integrated software for accounting, declarations, and reports.', de: 'Integrierte Software für Buchhaltung, Erklärungen und Berichte.' },
    persona: {
      nl: 'Je bent een moderne, data-gedreven accountant. Je helpt klanten niet alleen met hun boekhouding en aangiftes, maar adviseert hen ook proactief op basis van de laatste cijfers en trends.',
      en: 'You are a modern, data-driven accountant. You not only help clients with their bookkeeping and declarations, but also proactively advise them based on the latest figures and trends.',
      de: 'Sie sind ein moderner, datengesteuerter Wirtschaftsprüfer. Sie helfen Kunden nicht nur bei ihrer Buchhaltung und ihren Erklärungen, sondern beraten sie auch proaktiv auf der Grundlage der neuesten Zahlen und Trends.',
    }
  },
  {
    key: 'exact_news',
    title: { nl: 'Exact Nieuws', en: 'Exact News', de: 'Exact Nachrichten' },
    description: { nl: 'Algemeen nieuws over Exact.com, zo actueel mogelijk.', en: 'General news about Exact.com, as current as possible.', de: 'Allgemeine Nachrichten über Exact.com, so aktuell wie möglich.' },
    searchQuery: { nl: 'nieuws over Exact.com', en: 'news about Exact.com', de: 'Nachrichten über Exact.com' },
    persona: {
      nl: 'Je bent een Corporate Communications Manager van Exact. Je bent perfect op de hoogte van al het recente nieuws en de ontwikkelingen binnen het bedrijf en deelt dit op een heldere en professionele manier.',
      en: 'You are a Corporate Communications Manager at Exact. You are perfectly informed about all recent news and developments within the company and share this in a clear and professional manner.',
      de: 'Sie sind ein Corporate Communications Manager bei Exact. Sie sind perfekt über alle aktuellen Nachrichten und Entwicklungen im Unternehmen informiert und teilen diese klar und professionell.',
    }
  },
  {
    key: 'competitors',
    title: { nl: 'Concurrenten', en: 'Competitors', de: 'Wettbewerber' },
    description: { nl: 'Het laatste nieuws over de belangrijkste concurrenten van Exact in de markt.', en: 'The latest news about Exact\'s main competitors in the market.', de: 'Die neuesten Nachrichten über die Hauptkonkurrenten von Exact auf dem Markt.' },
    searchQuery: { nl: 'recente nieuwsartikelen over QuickBooks, Sage Intacct, Xero, NetSuite, AFAS, Odoo, Visma, e-Boekhouden.nl, Moneybird, Nmbrs, Hooray', en: 'recent news articles about QuickBooks, Sage Intacct, Xero, NetSuite, AFAS, Odoo, Visma, e-Boekhouden.nl, Moneybird, Nmbrs, Hooray', de: 'aktuelle Nachrichtenartikel über QuickBooks, Sage Intacct, Xero, NetSuite, AFAS, Odoo, Visma, e-Boekhouden.nl, Moneybird, Nmbrs, Hooray' },
    persona: {
      nl: 'Je bent een scherpe en strategische marktanalist. Je volgt de concurrentie op de voet en kunt hun acties, aankondigingen en nieuwsberichten duiden in de context van de totale markt.',
      en: 'You are a sharp and strategic market analyst. You closely follow the competition and can interpret their actions, announcements, and news reports in the context of the overall market.',
      de: 'Sie sind ein scharfer und strategischer Marktanalyst. Sie verfolgen den Wettbewerb genau und können deren Maßnahmen, Ankündigungen und Nachrichten im Kontext des Gesamtmarktes interpretieren.',
    }
  },
  {
    key: 'cpo_role',
    title: { nl: 'De CPO rol', en: 'The CPO Role', de: 'Die CPO-Rolle' },
    description: { nl: 'Stel een AI-expert samen door een categorie en een rol te kiezen voor een diepgaande strategiesessie.', en: 'Assemble an AI expert by choosing a category and a role for a deep strategy session.', de: 'Stellen Sie einen KI-Experten zusammen, indem Sie eine Kategorie und eine Rolle für eine tiefgehende Strategiesitzung auswählen.' },
  }
];

const ROLES: RoleTemplate[] = [
  { key: 'beginner', title: {nl: 'Beginnersgids', en: 'Beginner\'s Guide', de: 'Anfängerleitfaden'}, text: { nl: 'Gedraag je als een expert met 20 jaar ervaring in {category}. Breek de kernprincipes op die een totale beginner moet begrijpen. Gebruik analogieën, stapsgewijze logica en vereenvoudig alles alsof ik een jonge student ben.', en: 'Pretend you are an expert with 20 years of experience in {category}. Break down the core principles a total beginner must understand. Use analogies, step-by-step logic, and simplify everything like I\'m a young student.', de: 'Tun Sie so, als wären Sie ein Experte mit 20 Jahren Erfahrung in {category}. Erläutern Sie die Grundprinzipien, die ein absoluter Anfänger verstehen muss. Verwenden Sie Analogien, schrittweise Logik und vereinfachen Sie alles, als wäre ich ein junger Student.' } },
  { key: 'sparring_partner', title: {nl: 'Sparringpartner', en: 'Thought Partner', de: 'Sparringspartner'}, text: { nl: 'Fungeer als mijn persoonlijke sparringpartner met 20 jaar ervaring in {category}. Ik zal {mijn idee/probleem} beschrijven, en ik wil dat je elke aanname in twijfel trekt, blinde vlekken aanwijst en me helpt het te evolueren naar iets dat 10x beter is.', en: 'Act as my personal thought partner with 20 years of experience in {category}. I’ll describe {my idea/problem}, and I want you to question every assumption, point out blind spots, and help me evolve it into something 10x better.', de: 'Handeln Sie als mein persönlicher Sparringspartner mit 20 Jahren Erfahrung in {category}. Ich beschreibe {meine Idee/Problem}, und ich möchte, dass Sie jede Annahme in Frage stellen, blinde Flecken aufzeigen und mir helfen, es zu etwas zu entwickeln, das 10x besser ist.' } },
  { key: 'copywriter', title: {nl: 'Copywriter', en: 'Copywriter', de: 'Texter'}, text: { nl: 'Je bent een copywriter van wereldklasse met 20 jaar ervaring in {category}. Help me mijn {landingspagina/salespitch/e-mail} te herschrijven om beter te converteren. Maak het krachtig, beknopt en overtuigend. Gebruik bewezen frameworks.', en: 'You\'re a world-class copywriter with 20 years of experience in {category}. Help me rewrite my {landing page/sales pitch/email} to convert better. Make it punchy, concise, and persuasive. Use proven frameworks.', de: 'Sie sind ein Weltklasse-Texter mit 20 Jahren Erfahrung in {category}. Helfen Sie mir, meine {Landingpage/Verkaufsgespräch/E-Mail} neu zu schreiben, um besser zu konvertieren. Machen Sie es prägnant, konzise und überzeugend. Verwenden Sie bewährte Frameworks.' } },
  { key: 'it_manager', title: {nl: 'Nobelprijs-winnende IT-manager', en: 'Nobel-winning IT Manager', de: 'Nobelpreisgekrönter IT-Manager'}, text: { nl: 'Gedraag je als een Nobelprijs-winnende IT-manager. Analyseer mijn ideeën, geef kritische feedback met voor- en nadelen, adviseer wat ik niet moet vergeten en help me de gaten in te vullen.', en: 'Act like a Nobel-winning IT manager. Analyze my ideas. give critical feedback with pros and cons and advice what not to forget and help me filling in gaps.', de: 'Handeln Sie wie ein mit dem Nobelpreis ausgezeichneter IT-Manager. Analysieren Sie meine Ideen, geben Sie kritisches Feedback mit Vor- und Nachteilen, beraten Sie, was nicht zu vergessen ist, und helfen Sie mir, die Lücken zu füllen.' } },
  { key: 'mentor', title: {nl: 'Startup Mentor', en: 'Startup Mentor', de: 'Startup-Mentor'}, text: { nl: 'Wees mijn startup-mentor met 20 jaar ervaring in {category}. Ik heb dit idee: {idee}. Help me het te verfijnen, de markt te valideren, monetatie-opties te ontdekken en een roadmap van MVP naar CashCow uit te stippelen.', en: 'Be my startup mentor with 20 years of experience in {category}. I have this idea: {idea}. Help me refine it, validate the market, uncover monetization options, and outline a roadmap from MVP to CashCow.', de: 'Seien Sie mein Startup-Mentor mit 20 Jahren Erfahrung in {category}. Ich habe diese Idee: {Idee}. Helfen Sie mir, sie zu verfeinern, den Markt zu validieren, Monetarisierungsoptionen aufzudecken und eine Roadmap vom MVP zur CashCow zu skizzieren.' } },
  { key: 'teacher', title: {nl: 'Leraar voor beginnende HBO-student', en: 'Teacher for a College Student', de: 'Lehrer für einen Studenten'}, text: { nl: 'Leer me {elk complex onderwerp} alsof ik een beginnende HBO-student ben. Gebruik eenvoudige taal, metaforen en voorbeelden. Na elke uitleg, overhoor me om mijn begrip te controleren en het leren te versterken.', en: 'Teach me {any complex skill or topic} like I’m a first-year college student. Use simple language, metaphors, and examples. After each explanation, quiz me to check my understanding and reinforce learning.', de: 'Lehren Sie mich {jede komplexe Fähigkeit oder jedes Thema}, als wäre ich ein Studienanfänger. Verwenden Sie einfache Sprache, Metaphern und Beispiele. Fragen Sie mich nach jeder Erklärung ab, um mein Verständnis zu überprüfen und das Lernen zu festigen.' } },
  { key: 'ghostwriter', title: {nl: 'Ghostwriter', en: 'Ghostwriter', de: 'Ghostwriter'}, text: { nl: 'Je bent mijn ghostwriter. Verander deze ruwe opsomming in een impactvolle {LinkedIn-post / Twitter-thread / Medium-artikel}. Houd het boeiend, duidelijk en afgestemd op {doelgroep}.', en: 'You’re my ghostwriter. Turn this rough bullet outline into a high-impact {LinkedIn post / Twitter thread / Medium article}. Keep it engaging, clear, and tailored to {target audience}.', de: 'Du bist mein Ghostwriter. Verwandle diesen groben Stichpunktentwurf in einen wirkungsvollen {LinkedIn-Post / Twitter-Thread / Medium-Artikel}. Halte ihn fesselnd, klar und auf {Zielgruppe} zugeschnitten.' } },
  { key: 'life_coach', title: {nl: 'Levenscoach', en: 'Life Coach', de: 'Lebensberater'}, text: { nl: 'Gedraag je als mijn levenscoach. Ik voel me vastzitten omdat {beschrijf situatie}. Stel me 5 ongemakkelijke vragen om het kernprobleem te achterhalen. Geef me dan een bikkelhard actieplan om vooruit te komen.', en: 'Act like my life coach. I feel stuck because {describe situation}. Ask me 5 uncomfortable questions to uncover the root issue. Then give me a brutally honest action plan to move forward.', de: 'Handeln Sie wie mein Lebensberater. Ich fühle mich festgefahren, weil {Situation beschreiben}. Stellen Sie mir 5 unbequeme Fragen, um das Kernproblem aufzudecken. Geben Sie mir dann einen schonungslos ehrlichen Aktionsplan, um voranzukommen.' } },
  { key: 'investor', title: {nl: 'Investeerder', en: 'Investor', de: 'Investor'}, text: { nl: 'Je bent een bikkelharde investeerder met 20 jaar ervaring in {category}. Ik pitch mijn ideeën. Haal ze onderuit. Wat is gebrekkig? Wat is veelbelovend? Wat ontbreekt er? Beoordeel het op markt-, product- en oprichter-fit. Geen opvulling, alleen echte feedback.', en: 'You’re a brutally honest investor with 20 years of experience in {category}. Pitch my ideas. Tear it apart. What’s flawed? What’s promising? What’s missing? Rate it on market, product, and founder fit. No fluff just real feedback.', de: 'Sie sind ein brutal ehrlicher Investor mit 20 Jahren Erfahrung in {category}. Pitchen Sie meine Ideen. Zerreißen Sie sie. Was ist fehlerhaft? Was ist vielversprechend? Was fehlt? Bewerten Sie es nach Markt-, Produkt- und Gründer-Fit. Kein Geschwafel, nur echtes Feedback.' } },
  { key: 'strategist', title: {nl: 'Persoonlijke Strateeg', en: 'Personal Strategist', de: 'Persönlicher Stratege'}, text: { nl: 'Ik heb een persoonlijke strategie nodig. Ik geef je mijn doel. Geef me een maandplan. Deel het op per week. Neem specifieke acties, mijlpalen en gewoonten op. Maak het realistisch maar uitdagend genoeg. Geef tips en mogelijke valkuilen.', en: 'I need a personal strategy. I give you my goal. Give me a month plan. Break it down by week. Include specific actions, milestones, and habits. Make it realistic but challenging enough. Give tips and possible pitfalls.', de: 'Ich brauche eine persönliche Strategie. Ich gebe Ihnen mein Ziel. Geben Sie mir einen Monatsplan. Teilen Sie ihn nach Wochen auf. Fügen Sie spezifische Aktionen, Meilensteine und Gewohnheiten hinzu. Machen Sie es realistisch, aber herausfordernd genug. Geben Sie Tipps und mögliche Fallstricke.' } },
  { key: 'futurist', title: {nl: 'Futurist', en: 'Futurist', de: 'Zukunftsforscher'}, text: { nl: 'Gedraag je als een futurist in {category} met 25 jaar ervaring. Herken trends, voorspel wat komen gaat en leg uit hoe ik me vandaag kan voorbereiden of ervan kan profiteren. Help me de verborgen parels te vinden. Stel relevante vragen en neem de leiding.', en: 'Pretend you are a futurist in {category} with 25 years experience. Spot trends, predict what’s coming next, and explain how I can prepare or take advantage of it today. Help me find the hidden gems. Ask me relevant questions, take the lead.', de: 'Tun Sie so, als wären Sie ein Zukunftsforscher in {category} mit 25 Jahren Erfahrung. Erkennen Sie Trends, sagen Sie voraus, was als Nächstes kommt, und erklären Sie, wie ich mich heute vorbereiten oder davon profitieren kann. Helfen Sie mir, die verborgenen Schätze zu finden. Stellen Sie mir relevante Fragen, übernehmen Sie die Führung.' } },
  { key: 'ux_expert', title: {nl: 'UX & Creativiteit Expert', en: 'UX & Creativity Expert', de: 'UX- und Kreativitätsexperte'}, text: { nl: 'Fungeer als een UX- & creativiteitsexpert van wereldklasse met 20 jaar ervaring in {category}. Ik zal mijn {idee/product/interface} beschrijven, en ik wil dat je het laat exploderen met creatieve mogelijkheden en toevoegingen. Trek elke ontwerpkeuze in twijfel, stel gedurfde UX-verbeteringen voor en inspireer me met 3-5 innovatieve richtingen die fris, intuïtief en verrukkelijk aanvoelen voor de gebruiker. Leg uit waarom elk idee kan werken en hoe het de gebruikerservaring beïnvloedt.', en: 'Act as a world-class UX & creativity expert with 20 years of experience in {category}. I’ll describe my {idea/product/interface}, and I want you to explode it with creative possibilities and additions. Question every design choice, suggest bold UX improvements, and inspire me with 3–5 innovative directions that feel fresh, intuitive, and delightful for the user. Explain why each idea could work and how it impacts the user experience.', de: 'Handeln Sie als Weltklasse-UX- und Kreativitätsexperte mit 20 Jahren Erfahrung in {category}. Ich beschreibe meine {Idee/Produkt/Schnittstelle}, und ich möchte, dass Sie sie mit kreativen Möglichkeiten und Ergänzungen explodieren lassen. Stellen Sie jede Designentscheidung in Frage, schlagen Sie kühne UX-Verbesserungen vor und inspirieren Sie mich mit 3–5 innovativen Richtungen, die sich frisch, intuitiv und für den Benutzer erfreulich anfühlen. Erklären Sie, warum jede Idee funktionieren könnte und wie sie sich auf die Benutzererfahrung auswirkt.' } }
];

const App: React.FC = () => {
  type View = 'categories' | 'articles' | 'newspaperLoading' | 'newspaperView' | 'expertChat' | 'info' | 'cpoRoleSetup' | 'cpoRoleChat' | 'cpoChatPrint';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [view, setView] = useState<View>('categories');
  
  const [appState, setAppState] = useState<AppState>('idle');
  const [articles, setArticles] = useState<Article[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

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
    const validLangs: Language[] = ['en', 'nl', 'de'];
    if (savedLang && validLangs.includes(savedLang as Language)) return savedLang as Language;
    return 'en'; // Default to English if no cookie is set or cookie is invalid
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

  // CPO Role State
  const [selectedCpoCategory, setSelectedCpoCategory] = useState<Category | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleTemplate | null>(null);
  const [chatSummary, setChatSummary] = useState<ChatSummary | null>(null);
  const [isSummaryPanelLoading, setIsSummaryPanelLoading] = useState<boolean>(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const [userContext, setUserContext] = useState<string>('');
  const [messageFeedbacks, setMessageFeedbacks] = useState<{ [index: number]: 'up' | null }>({});
  const [infographicImage, setInfographicImage] = useState<string | null>(null);
  const [isInfographicLoading, setIsInfographicLoading] = useState<boolean>(false);
  const [showInfographicModal, setShowInfographicModal] = useState<boolean>(false);
  const [infographicGenerationCount, setInfographicGenerationCount] = useState<number>(0);
  const [includeInfographicInReport, setIncludeInfographicInReport] = useState<boolean>(true);
  const [summaryPodcastCount, setSummaryPodcastCount] = useState<number>(0);
  const [actionsPodcastCount, setActionsPodcastCount] = useState<number>(0);
  const [readingLinks, setReadingLinks] = useState<ReadingLink[]>([]);
  const [isReadingLinksLoading, setIsReadingLinksLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [isBooksLoading, setIsBooksLoading] = useState(false);
  const [tedTalks, setTedTalks] = useState<TedTalkResponse | null>(null);
  const [isTedTalksLoading, setIsTedTalksLoading] = useState(false);
  const [linkedInCourses, setLinkedInCourses] = useState<LinkedInLearningCourse[]>([]);
  const [isLinkedInCoursesLoading, setIsLinkedInCoursesLoading] = useState(false);

  
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
      const langMap: { [key in Language]: string } = { en: 'en', nl: 'nl', de: 'de' };
      root.lang = langMap[language];
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

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
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
        const session = createChatSession({ category: selectedCategory, language, contextData: articles });
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
    const t = {
      nl: 'Weet u zeker dat u alle instellingen en cookies wilt resetten? De pagina wordt hierna opnieuw geladen.',
      en: 'Are you sure you want to reset all settings and cookies? The page will reload.',
      de: 'Möchten Sie wirklich alle Einstellungen und Cookies zurücksetzen? Die Seite wird danach neu geladen.',
    }
    
    if (window.confirm(t[language])) {
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
    const expectedCount = 10;
    
    setAppState('loading');
    setArticles([]);
    setErrorMessage('');
    setProgress(0);
    setSortOrder(null);
    setChatSession(null);
    setChatHistory([]);
    cancel();
    
    const t_loading = {
      nl: `De AI zoekt en analyseert het laatste nieuws over ${category.title[language].toLowerCase()}...`,
      en: `The AI is searching and analyzing the latest news about ${category.title[language].toLowerCase()}...`,
      de: `Die KI sucht und analysiert die neuesten Nachrichten zu ${category.title[language].toLowerCase()}...`,
    }
    const message = t_loading[language];
    setLoadingMessage(message);

    let firstChunkReceived = false;

    streamNewsAndSummaries({
      topic: (category.searchQuery && category.searchQuery[language]) || category.title[language],
      language: language,
      ignoreDateFilter: category.key === 'exact_news',
      onArticle: (article) => {
        if (!firstChunkReceived) {
          const t_loading_results = { nl: "Resultaten worden geladen...", en: "Loading results...", de: "Ergebnisse werden geladen..." };
          setLoadingMessage(t_loading_results[language]);
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
        const t_error = { nl: 'Er is een onbekende fout opgetreden.', en: 'An unknown error occurred.', de: 'Ein unbekannter Fehler ist aufgetreten.' };
        console.error(err);
        setErrorMessage(
          err.message || t_error[language]
        );
        setAppState('error');
        setLoadingMessage('');
      },
    });
  }, [language, cancel]);
  
  const handleSelectCategory = (category: Category) => {
    if (category.key === 'cpo_role') {
        setView('cpoRoleSetup');
        cancel();
        return;
    }
    setView('articles');
    setSelectedCategory(category);
    getNews(category);
  };
  
  const handleAskExpert = (category: Category) => {
    setSelectedCategory(category);
    setChatHistory([]);
    // Create chat session without article context
    const session = createChatSession({ category, language });
    setChatSession(session);
    setView('expertChat');
    cancel(); // Stop any ongoing speech
  };
  
  const handleShowInfo = () => {
    setView('info');
  }

  const handleGoBack = () => {
    cancel();
    setView('categories');
    setSelectedCategory(null);
    setArticles([]);
    setNewspaperArticles([]);
    setAppState('idle');
    setSortOrder(null);
    setLoadingMessage('');
    setChatSession(null);
    setChatHistory([]);
    // Reset CPO state
    setSelectedCpoCategory(null);
    setSelectedRole(null);
    setChatSummary(null);
    setIsAdvancedMode(false);
    setUserContext('');
    setMessageFeedbacks({});
    setInfographicImage(null);
    setShowInfographicModal(false);
    setInfographicGenerationCount(0);
    setIncludeInfographicInReport(true);
    setSummaryPodcastCount(0);
    setActionsPodcastCount(0);
    setReadingLinks([]);
    setBooks([]);
    setTedTalks(null);
    setLinkedInCourses([]);
  };

  const handleReturnToCpoSetup = useCallback(() => {
    cancel();
    setView('cpoRoleSetup');
    // Reset state for a new session configuration
    setChatHistory([]);
    setChatSummary(null);
    setChatSession(null);
    setSelectedCpoCategory(null);
    setSelectedRole(null);
    setIsAdvancedMode(false);
    setUserContext('');
    setMessageFeedbacks({});
    setInfographicImage(null);
    setShowInfographicModal(false);
    setInfographicGenerationCount(0);
    setIncludeInfographicInReport(true);
    setSummaryPodcastCount(0);
    setActionsPodcastCount(0);
    setReadingLinks([]);
    setBooks([]);
    setTedTalks(null);
    setLinkedInCourses([]);
  }, [cancel]);
  
  const handleSendMessage = useCallback(async (message: string) => {
    if (!chatSession) return;

    setIsChatLoading(true);
    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    setChatHistory(prev => [...prev, newUserMessage]);
    
    try {
      const stream = await chatSession.sendMessageStream({ message });
      let modelResponseText = '';
      let firstChunk = true;

      for await (const chunk of stream) {
        if (firstChunk) {
            const modelPlaceholder: ChatMessage = { role: 'model', parts: [{ text: '' }] };
            setChatHistory(prev => [...prev, modelPlaceholder]);
            firstChunk = false;
        }
        modelResponseText += chunk.text;
        setChatHistory(prev => {
            const updatedModelMessage: ChatMessage = { role: 'model', parts: [{ text: modelResponseText }] };
            return [...prev.slice(0, -1), updatedModelMessage];
        });
      }
    } catch (error) {
        const t_error = { nl: 'Sorry, er is iets misgegaan.', en: 'Sorry, something went wrong.', de: 'Entschuldigung, etwas ist schief gelaufen.' };
        console.error("Chat error:", error);
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text: t_error[language] }] };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatLoading(false);
    }
  }, [chatSession, language]);

  const handleSendCpoMessage = useCallback(async (message: string) => {
    const userMessagesCount = chatHistory.filter(msg => msg.role === 'user').length;
    if (userMessagesCount >= 5) {
      const t_alert = { 
        nl: 'De limiet van 5 vragen is bereikt om de API-kosten beheersbaar te houden. Vraag uw werkgever om meer ruimte en doorvraagmogelijkheden.',
        en: 'The limit of 5 questions has been reached to keep API costs manageable. Please ask your employer for more capacity and deeper questioning capabilities.',
        de: 'Das Limit von 5 Fragen wurde erreicht, um die API-Kosten überschaubar zu halten. Bitte fragen Sie Ihren Arbeitgeber nach mehr Kapazität und tiefergehenden Fragemöglichkeiten.',
      };
      alert(t_alert[language]);
      return;
    }

    if (!chatSession) return;

    setIsChatLoading(true);
    setChatSummary(prev => prev ? { ...prev, suggestedQuestion: '' } : null); // Clear previous suggestion
    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
    const currentHistory = [...chatHistory, newUserMessage];
    setChatHistory(currentHistory);

    try {
        const stream = await chatSession.sendMessageStream({ message });
        let modelResponseText = '';
        let finalHistory: ChatMessage[] = [];
        let firstChunk = true;

        for await (const chunk of stream) {
            if (firstChunk) {
                const modelPlaceholder: ChatMessage = { role: 'model', parts: [{ text: '' }] };
                setChatHistory(prev => [...prev, modelPlaceholder]);
                firstChunk = false;
            }
            modelResponseText += chunk.text;
            setChatHistory(prev => {
                const updatedModelMessage: ChatMessage = { role: 'model', parts: [{ text: modelResponseText }] };
                finalHistory = [...prev.slice(0, -1), updatedModelMessage];
                return finalHistory;
            });
        }
        
        setIsChatLoading(false);

        // After getting the response, generate the summary
        setIsSummaryPanelLoading(true);
        try {
            const summaryResult = await generateChatSummaryAndActions(finalHistory, language, userContext);
            setChatSummary(summaryResult);
        } catch (summaryError) {
            console.error("Error generating summary:", summaryError);
            // Optionally show an error in the summary panel
        } finally {
            setIsSummaryPanelLoading(false);
        }

    } catch (error) {
        const t_error = { nl: 'Sorry, er is iets misgegaan.', en: 'Sorry, something went wrong.', de: 'Entschuldigung, etwas ist schief gelaufen.' };
        console.error("CPO Chat error:", error);
        const errorMessage: ChatMessage = { role: 'model', parts: [{ text: t_error[language] }] };
        setChatHistory(prev => [...prev, errorMessage]);
        setIsChatLoading(false);
        setIsSummaryPanelLoading(false);
    }
  }, [chatSession, language, chatHistory, userContext]);

  const handleStartCpoChat = useCallback((category: Category, role: RoleTemplate) => {
    setSelectedCpoCategory(category);
    setSelectedRole(role);
    setIsAdvancedMode(false); // Always start in friendly mode

    const roleText = role.text[language].replace(/{category}/g, category.title[language]);
    
    const session = createChatSession({
        category,
        language,
        overrideSystemInstruction: roleText,
        isAdvanced: false
    });
    setChatSession(session);
    setChatHistory([]);
    setChatSummary(null);
    setUserContext('');
    setMessageFeedbacks({});
    setInfographicImage(null);
    setShowInfographicModal(false);
    setInfographicGenerationCount(0);
    setIncludeInfographicInReport(true);
    setSummaryPodcastCount(0);
    setActionsPodcastCount(0);
    setReadingLinks([]);
    setBooks([]);
    setTedTalks(null);
    setLinkedInCourses([]);
    setView('cpoRoleChat');
  }, [language]);
  
  const handleSwitchCpoRole = useCallback((newRole: RoleTemplate) => {
    if (!selectedCpoCategory || !chatSession) return;
    
    setSelectedRole(newRole);

    const t_system = { 
      nl: `[SYSTEM] Rol is gewijzigd naar ${newRole.title[language]}. De AI zal zich nu als deze expert gedragen.`,
      en: `[SYSTEM] Role switched to ${newRole.title[language]}. The AI will now act as this expert.`,
      de: `[SYSTEM] Rolle auf ${newRole.title[language]} geändert. Die KI wird sich nun als dieser Experte verhalten.`,
    };
    
    const systemMessage: ChatMessage = { role: 'model', parts: [{ text: t_system[language] }] };
    const newHistory = [...chatHistory, systemMessage];
    setChatHistory(newHistory);

    const roleText = newRole.text[language].replace(/{category}/g, selectedCpoCategory.title[language]);
    const newSession = createChatSession({
        category: selectedCpoCategory,
        language,
        overrideSystemInstruction: roleText,
        history: newHistory,
        isAdvanced: isAdvancedMode,
    });

    setChatSession(newSession);

  }, [chatHistory, selectedCpoCategory, language, chatSession, isAdvancedMode]);

  const handleToggleAdvancedMode = useCallback(() => {
    if (!selectedCpoCategory || !selectedRole || !chatSession) return;
    const newIsAdvancedMode = !isAdvancedMode;
    setIsAdvancedMode(newIsAdvancedMode);

    const roleText = selectedRole.text[language].replace(/{category}/g, selectedCpoCategory.title[language]);

    // Add a system message to inform user of the mode switch
    const t_system = {
      nl: `[SYSTEM] ${newIsAdvancedMode ? 'Geavanceerde Modus Geactiveerd.' : 'Standaard Modus Geactiveerd.'}`,
      en: `[SYSTEM] ${newIsAdvancedMode ? 'Advanced Mode Activated.' : 'Standard Mode Activated.'}`,
      de: `[SYSTEM] ${newIsAdvancedMode ? 'Erweiterter Modus aktiviert.' : 'Standardmodus aktiviert.'}`,
    };

    const systemMessage: ChatMessage = { role: 'model', parts: [{ text: t_system[language] }] };
    const newHistory = [...chatHistory, systemMessage];
    setChatHistory(newHistory);

    const newSession = createChatSession({
        category: selectedCpoCategory,
        language,
        overrideSystemInstruction: roleText,
        history: newHistory, // pass history with the new system message
        isAdvanced: newIsAdvancedMode,
    });
    setChatSession(newSession);
  }, [isAdvancedMode, selectedCpoCategory, selectedRole, language, chatHistory, chatSession]);

  const handleAskSuggestedQuestion = useCallback((question: string) => {
    if (question && !isChatLoading) {
      handleSendCpoMessage(question);
    }
  }, [isChatLoading, handleSendCpoMessage]);
  
  const handleSetMessageFeedback = useCallback((messageIndex: number, feedback: 'up') => {
    setMessageFeedbacks(prev => ({
      ...prev,
      [messageIndex]: prev[messageIndex] === feedback ? null : feedback,
    }));
  }, []);
  
  const handleDeleteMessage = useCallback(async (messageIndex: number) => {
    const t_confirm = {
        nl: 'Weet u zeker dat u dit antwoord en de bijbehorende vraag wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt en de inhoud wordt uit alle samenvattingen verwijderd.',
        en: 'Are you sure you want to delete this response and its corresponding question? This action cannot be undone and the content will be removed from all summaries.',
        de: 'Möchten Sie diese Antwort und die zugehörige Frage wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden und der Inhalt wird aus allen Zusammenfassungen entfernt.',
    };

    // The message at messageIndex is the AI's. The user's is at messageIndex - 1.
    if (window.confirm(t_confirm[language]) && messageIndex > 0) {
        const deletedUserIndex = messageIndex - 1;
        const deletedModelIndex = messageIndex;

        const newHistory = chatHistory.filter((_, i) => i !== deletedUserIndex && i !== deletedModelIndex);
        setChatHistory(newHistory);
        
        // After deleting, the summary needs to be regenerated with the new history.
        if (newHistory.length > 0) {
            setIsSummaryPanelLoading(true);
            try {
                const summaryResult = await generateChatSummaryAndActions(newHistory, language, userContext);
                setChatSummary(summaryResult);
            } catch (summaryError) {
                console.error("Error regenerating summary after delete:", summaryError);
            } finally {
                setIsSummaryPanelLoading(false);
            }
        } else {
            // No history left, clear summary completely.
            setChatSummary(null);
        }
    }
  }, [chatHistory, language, userContext]);

  const handleGenerateInfographic = useCallback(async () => {
    if (infographicGenerationCount >= 2) {
      const t_alert = {
        nl: 'U heeft de limiet van 2 infographics per sessie bereikt.',
        en: 'You have reached the limit of 2 infographics per session.',
        de: 'Sie haben das Limit von 2 Infografiken pro Sitzung erreicht.',
      };
      alert(t_alert[language]);
      return;
    }
    
    setIsInfographicLoading(true);
    try {
      const imageData = await generateInfographic(chatHistory, language, userContext);
      setInfographicImage(imageData);
      setShowInfographicModal(true);
      setInfographicGenerationCount(prev => prev + 1);
    } catch (error) {
      console.error("Error generating infographic:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      alert(message);
    } finally {
      setIsInfographicLoading(false);
    }
  }, [chatHistory, language, userContext, infographicGenerationCount]);

  const handleGenerateReadingTable = useCallback(async () => {
    if (chatHistory.length < 2 || isReadingLinksLoading) return;

    setIsReadingLinksLoading(true);
    try {
        const links = await generateReadingTableLinks(chatHistory, language, userContext);
        setReadingLinks(links);
    } catch (error) {
        console.error("Error generating reading table:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(message);
    } finally {
        setIsReadingLinksLoading(false);
    }
  }, [chatHistory, language, userContext, isReadingLinksLoading]);

  const handleGenerateBooks = useCallback(async () => {
    if (chatHistory.length < 2 || isBooksLoading) return;

    setIsBooksLoading(true);
    try {
        const bookResults = await generateBookRecommendations(chatHistory, language, userContext);
        setBooks(bookResults);
    } catch (error) {
        console.error("Error generating book recommendations:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        alert(message);
    } finally {
        setIsBooksLoading(false);
    }
  }, [chatHistory, language, userContext, isBooksLoading]);
  
  const handleGenerateTedTalks = useCallback(async () => {
    if (chatHistory.length < 2 || isTedTalksLoading) return;

    setIsTedTalksLoading(true);
    try {
      const results = await generateTedTalks(chatHistory, language, userContext);
      setTedTalks(results);
    } catch (error) {
      console.error("Error generating TED talks:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(message);
    } finally {
      setIsTedTalksLoading(false);
    }
  }, [chatHistory, language, userContext, isTedTalksLoading]);

  const handleGenerateLinkedInCourses = useCallback(async () => {
    if (chatHistory.length < 2 || isLinkedInCoursesLoading) return;

    setIsLinkedInCoursesLoading(true);
    try {
      const results = await generateLinkedInLearningCourses(chatHistory, language, userContext);
      setLinkedInCourses(results);
    } catch (error) {
      console.error("Error generating LinkedIn Learning courses:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      alert(message);
    } finally {
      setIsLinkedInCoursesLoading(false);
    }
  }, [chatHistory, language, userContext, isLinkedInCoursesLoading]);


  const generateNewspaper = useCallback(async (categoriesToFetch: Category[]) => {
    if (categoriesToFetch.length === 0) {
      console.error("generateNewspaper called with no categories.");
      const t_error = {
        nl: "Geen categorieën geselecteerd voor de krant.",
        en: "No categories selected for the newspaper.",
        de: "Keine Kategorien für die Zeitung ausgewählt.",
      };
      setNewspaperLoadingState(s => ({ ...s, error: t_error[language], step: 1 }));
      setView('newspaperLoading');
      return;
    }
    const t_loading = { nl: "Belangrijkste nieuws verzamelen...", en: "Collecting top news...", de: "Sammeln der Top-Nachrichten..." };
    setView('newspaperLoading');
    setNewspaperLoadingState({ step: 1, message: t_loading[language] });
    setNewspaperArticles([]);
    cancel();

    try {
      const fetchedArticles = await fetchFrontPageArticles(categoriesToFetch, language);
      
      const t_error_no_articles = {
          nl: "Geen recente artikelen gevonden om een voorpagina te maken. Probeer het morgen opnieuw.",
          en: "No recent articles found to create a front page. Please try again tomorrow.",
          de: "Keine aktuellen Artikel gefunden, um eine Titelseite zu erstellen. Bitte versuchen Sie es morgen erneut.",
      };
      if (fetchedArticles.length === 0) {
        throw new Error(t_error_no_articles[language]);
      }
      setNewspaperArticles(fetchedArticles);
      setView('newspaperView');

    } catch (error) {
      const t_error_unknown = { nl: "Een onbekende fout is opgetreden.", en: "An unknown error has occurred.", de: "Ein unbekannter Fehler ist aufgetreten."};
      console.error("Error generating newspaper:", error);
      const message = error instanceof Error ? error.message : t_error_unknown[language];
      setNewspaperLoadingState(s => ({ ...s, error: message, step: 1 }));
    }
  }, [language, cancel]);


  const handleGenerateFrontPage = useCallback(() => {
    const selectedNewsCategories = CATEGORIES.filter(c => favoriteCategories.has(c.key));
     if (selectedNewsCategories.length < 1) return;
    generateNewspaper(selectedNewsCategories);
  }, [favoriteCategories, generateNewspaper]);

  const handleGenerateNewspaperFromCategory = useCallback(() => {
    if (!selectedCategory) return;
    generateNewspaper([selectedCategory]);
  }, [selectedCategory, generateNewspaper]);

  const handlePrintCpoChat = useCallback(() => {
      setView('cpoChatPrint');
  }, []);

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
    const t_from = { nl: 'van', en: 'from', de: 'von' };
    const speechQueue = sortedArticles.map(article => ({
      text: `${article.title}. ${t_from[language]} ${article.sourceName}. ${article.summary}`,
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
      noResultsBody: 'Er konden geen recente artikelen voor deze categorie worden gevonden. Probeer het later opnieuw of kies een andere categorie.',
      footer: 'Mogelijk gemaakt door de verschillende Gemini AI-modellen',
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
      noResultsBody: 'No recent articles could be found for this category. Please try again later or choose another category.',
      footer: 'Powered by the different Gemini AI models',
      resetSettings: 'Reset settings & cookies',
      speakingWith: 'Speaking with the',
      expert: 'Expert'
    },
    de: {
      backToCategories: 'Zurück zu den Kategorien',
      generateNewspaper: 'Zeitung aus dieser Kategorie erstellen',
      listenPodcast: 'Podcast anhören',
      stopPodcast: 'Podcast stoppen',
      listenSummary: 'Zusammenfassung anhören',
      stopSummary: 'Zusammenfassung stoppen',
      generatingSummary: 'Zusammenfassung wird generiert...',
      noResultsTitle: 'Keine Ergebnisse gefunden',
      noResultsBody: 'Für diese Kategorie konnten keine aktuellen Artikel gefunden werden. Bitte versuchen Sie es später erneut oder wählen Sie eine andere Kategorie.',
      footer: 'Angetrieben durch die verschiedenen Gemini AI-Modelle',
      resetSettings: 'Einstellungen & Cookies zurücksetzen',
      speakingWith: 'Im Gespräch mit dem',
      expert: 'Experten'
    }
  }

  const renderCategoryView = () => (
    <div className="mt-12">
      <div className="grid lg:grid-cols-6 gap-6 mb-6">
        <div className="lg:col-span-5">
            <NewspaperGeneratorCard 
              onGenerate={handleGenerateFrontPage} 
              isDisabled={favoriteCategories.size < 1}
              language={language}
              favoriteCategories={CATEGORIES.filter(c => favoriteCategories.has(c.key))}
            />
        </div>
        <div className="lg:col-span-1">
          <InfoCard onShowInfo={handleShowInfo} language={language} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
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
            feedbacks={{}}
            onSetFeedback={() => {}}
            onDeleteMessage={() => {}}
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
          feedbacks={{}}
          onSetFeedback={() => {}}
          onDeleteMessage={() => {}}
        />
      )}
    </>
  );

  const renderInfoView = () => (
    <InfoView onGoBack={handleGoBack} language={language} />
  );

  const renderContent = () => {
    switch(view) {
      case 'categories': return renderCategoryView();
      case 'articles': return renderArticleView();
      case 'expertChat': return renderExpertChatView();
      case 'cpoRoleSetup': return <CpoRoleSetupView categories={CATEGORIES.filter(c => c.key !== 'exact_news' && c.key !== 'cpo_role' && c.key !== 'ai' && c.key !== 'competitors')} roles={ROLES} onStartChat={handleStartCpoChat} onGoBack={handleGoBack} language={language} />;
      case 'cpoRoleChat': return <CpoRoleChatView onGoBack={handleReturnToCpoSetup} language={language} selectedCategory={selectedCpoCategory} selectedRole={selectedRole} chatHistory={chatHistory} onSendMessage={handleSendCpoMessage} onAskSuggestedQuestion={handleAskSuggestedQuestion} isChatLoading={isChatLoading} chatSummary={chatSummary} isSummaryPanelLoading={isSummaryPanelLoading} roles={ROLES} onSwitchRole={handleSwitchCpoRole} onPrint={handlePrintCpoChat} isAdvancedMode={isAdvancedMode} onToggleAdvancedMode={handleToggleAdvancedMode} userContext={userContext} onSetUserContext={setUserContext} feedbacks={messageFeedbacks} onSetFeedback={handleSetMessageFeedback} onDeleteMessage={handleDeleteMessage} onGenerateInfographic={handleGenerateInfographic} isInfographicLoading={isInfographicLoading} infographicImage={infographicImage} showInfographicModal={showInfographicModal} onSetShowInfographicModal={setShowInfographicModal} infographicGenerationCount={infographicGenerationCount} includeInfographicInReport={includeInfographicInReport} onSetIncludeInfographicInReport={setIncludeInfographicInReport} summaryPodcastCount={summaryPodcastCount} onIncrementSummaryPodcastCount={() => setSummaryPodcastCount(p => p + 1)} actionsPodcastCount={actionsPodcastCount} onIncrementActionsPodcastCount={() => setActionsPodcastCount(p => p + 1)} onGenerateReadingTable={handleGenerateReadingTable} isReadingLinksLoading={isReadingLinksLoading} readingLinks={readingLinks} onGenerateBooks={handleGenerateBooks} isBooksLoading={isBooksLoading} books={books} onGenerateTedTalks={handleGenerateTedTalks} isTedTalksLoading={isTedTalksLoading} tedTalks={tedTalks} onGenerateLinkedInCourses={handleGenerateLinkedInCourses} isLinkedInCoursesLoading={isLinkedInCoursesLoading} linkedInCourses={linkedInCourses} />;
      case 'cpoChatPrint': return <CpoChatPrintView onClose={() => setView('cpoRoleChat')} language={language} selectedCategory={selectedCpoCategory} selectedRole={selectedRole} chatHistory={chatHistory} chatSummary={chatSummary} userContext={userContext} infographicImage={infographicImage} includeInfographicInReport={includeInfographicInReport} books={books} readingLinks={readingLinks} tedTalks={tedTalks} feedbacks={messageFeedbacks} linkedInCourses={linkedInCourses} />;
      case 'info': return renderInfoView();
      case 'newspaperLoading': return renderNewspaperLoadingView();
      case 'newspaperView': 
        return <NewspaperView 
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
          selectedCategory={selectedCategory ?? selectedCpoCategory} 
          isNewspaperView={view === 'newspaperView' || view === 'newspaperLoading'}
          isExpertChatView={view === 'expertChat'}
          isInfoView={view === 'info'}
          isCpoSetupView={view === 'cpoRoleSetup'}
          isCpoChatView={view === 'cpoRoleChat'}
          language={language}
          theme={theme}
          toggleTheme={toggleTheme}
          handleSetLanguage={handleSetLanguage}
        />
        {renderContent()}
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>{t[language].footer} &bull; v0.75</p>
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