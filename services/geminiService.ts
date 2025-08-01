import { GoogleGenAI, Chat, Type } from "@google/genai";
import { Article, Category, Language } from '../types';

interface StreamCallbacks {
  onArticle: (article: Article) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

interface StreamParams extends StreamCallbacks {
  topic: string;
  isReviewSearch: boolean;
  language: Language;
  ignoreDateFilter: boolean;
}

const cleanJsonString = (str: string): string => {
  // Finds the first occurrence of '{' or '['
  const firstBracket = str.search(/[[{]/);

  if (firstBracket === -1) {
    return str; // No JSON structure found
  }

  // Determines the closing bracket based on the opening one
  const openingBracket = str[firstBracket];
  const closingBracket = openingBracket === '{' ? '}' : ']';

  // Finds the last occurrence of the corresponding closing bracket
  const lastBracket = str.lastIndexOf(closingBracket);

  if (lastBracket > firstBracket) {
    // Extracts the substring that is likely the JSON object or array
    const jsonSubstring = str.substring(firstBracket, lastBracket + 1);
    // It's still good practice to remove trailing commas which are a common error.
    // This regex handles trailing commas in both objects and arrays.
    return jsonSubstring.replace(/,\s*([}\]])/g, '$1');
  }

  // If we couldn't find a valid JSON-like structure, return the original string.
  return str;
};

const cleanupSummary = (summary: string): string => {
  if (!summary) return '';
  // This regex removes citation markers like [1], [13], etc., from anywhere in the string.
  return summary.replace(/\s*\[\d+\]/g, '').trim();
};

const getPrompts = (topic: string, language: Language, ignoreDateFilter: boolean) => {
  const separator = "|||ARTICLE-SEPARATOR|||";
  const dateFilter_nl = "recente (laatste 7 dagen) en";
  const dateFilter_en = "recent (last 7 days), and";
  const noDateFilter_nl = "zo nieuw mogelijke en";
  const noDateFilter_en = "the newest possible, and";

  const newsPrompt_nl = `
      Je bent een expert nieuwsredacteur voor Exact.
      Jouw taak is om het internet te doorzoeken op het laatste nieuws over het onderwerp: "${topic}".
      Zoek naar maximaal 10 relevante, ${ignoreDateFilter ? noDateFilter_nl : dateFilter_nl} belangrijke nieuwsartikelen. Vermijd persberichten, marketingmateriaal of vacatures. Focus op objectief nieuws.

      Voor elk artikel voer je de volgende stappen uit:
      1.  **Analyseer:** Lees het volledige artikel om de kernboodschap, de belangrijkste feiten en de algehele toon te begrijpen.
      2.  **Vertaal:** Alle output MOET in het Nederlands zijn.
      3.  **Beoordeel:** Geef een beoordeling van 1 tot 5 sterren op basis van het belang en de relevantie van het artikel voor een manager bij Exact. 5 sterren is 'absoluut essentieel om te lezen', 1 ster is 'laagste relevantie'.
      4.  **Structureer:** Formatteer de output voor elk artikel als een enkel JSON-object.

      Het JSON-object MOET exact deze structuur hebben:
      {
        "title": "De titel van het nieuwsartikel",
        "summary": "Een beknopte en professionele samenvatting van 2-4 zinnen die de essentie van het artikel vastlegt, zonder citatie-markeringen zoals [1].",
        "url": "De volledige URL van het originele artikel",
        "rating": 4.5,
        "publicationDate": "De publicatiedatum in ISO 8601 formaat (YYYY-MM-DDTHH:mm:ss.sssZ)",
        "sourceName": "De naam van de nieuwsbron (bv. 'Het Financieele Dagblad')"
      }
      **BELANGRIJK:** Stuur elk voltooid JSON-object onmiddellijk terug, gescheiden door de separator: "${separator}". Wacht niet. Stream de resultaten.
    `;

  const newsPrompt_en = `
      You are an expert news editor for Exact.
      Your task is to search the internet for the latest news on the topic: "${topic}".
      Find up to 10 relevant, ${ignoreDateFilter ? noDateFilter_en : dateFilter_en} important news articles. Avoid press releases, marketing materials, or job postings. Focus on objective news.

      For each article, perform the following steps:
      1.  **Analyze:** Read the full article to understand the core message, key facts, and overall tone.
      2.  **Language:** All output MUST be in English.
      3.  **Rate:** Provide a rating from 1 to 5 stars based on the article's importance and relevance to a manager at Exact. 5 stars is 'absolutely essential to read', 1 star is 'lowest relevance'.
      4.  **Structure:** Format the output for each article as a single JSON object.

      The JSON object MUST have this exact structure:
      {
        "title": "The title of the news article",
        "summary": "A concise and professional summary of 2-4 sentences capturing the essence of the article, without citation markers like [1].",
        "url": "The full URL of the original article",
        "rating": 4.5,
        "publicationDate": "The publication date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
        "sourceName": "The name of the news source (e.g., 'The Wall Street Journal')"
      }
      **IMPORTANT:** Immediately return each completed JSON object, separated by the separator: "${separator}". Do not wait. Stream the results.
    `;

  const reviewPrompt_nl = `
      Je bent een marktonderzoeker voor Exact.
      Jouw taak is om via Google Search gebruikersreviews over Exact te vinden. Focus op de meest recente reviews (laatste 6 maanden) van de website die in de topic genoemd wordt.
      Het onderwerp van de zoekopdracht is: "${topic}".
      Verzamel tot 50 van de meest recente reviews.

      Voor elke review voer je de volgende stappen uit:
      1.  **Extraheer:** Haal de naam van de reviewer, de titel van de review, de volledige tekst van de review, de sterscore en de datum van de review eruit.
      2.  **Vertaal:** Alle output MOET in het Nederlands zijn.
      3.  **Structureer:** Formatteer de output voor elke review als een enkel JSON-object.
      4.  **Genereer Unieke URL:** Maak een unieke URL voor elke review. Als de review een eigen pagina heeft, gebruik die URL. Zo niet, gebruik dan de hoofd-URL van de site en voeg een uniek fragment toe.

      Het JSON-object MOET exact deze structuur hebben:
      { "title": "...", "summary": "...", "url": "...", "rating": 5, "publicationDate": "...", "sourceName": "..." }
      **BELANGRIJK:** Stuur elk voltooid JSON-object onmiddellijk terug, gescheiden door de separator: "${separator}".
    `;

    const reviewPrompt_en = `
      You are a market researcher for Exact.
      Your task is to find user reviews about Exact via Google Search. Focus on the most recent reviews (last 6 months) from the website mentioned in the topic.
      The search topic is: "${topic}".
      Collect up to 50 of the most recent reviews.

      For each review, perform the following steps:
      1.  **Extract:** Get the reviewer's name, review title, full review text, star rating, and review date.
      2.  **Language:** All output MUST be in English.
      3.  **Structure:** Format the output for each review as a single JSON object.
      4.  **Genereer Unieke URL:** Create a unique URL for each review. If the review has its own page, use that URL. If not, use the site's main URL and add a unique fragment.

      The JSON object MUST have this exact structure:
      { "title": "...", "summary": "...", "url": "...", "rating": 5, "publicationDate": "...", "sourceName": "..." }
       **IMPORTANT:** Immediately return each completed JSON object, separated by the separator: "${separator}".
    `;

    return {
        news: language === 'nl' ? newsPrompt_nl : newsPrompt_en,
        review: language === 'nl' ? reviewPrompt_nl : reviewPrompt_en,
    };
}


export const streamNewsAndSummaries = async ({ onArticle, onComplete, onError, topic, isReviewSearch, language, ignoreDateFilter = false }: StreamParams): Promise<void> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const model = "gemini-2.5-flash";
    const separator = "|||ARTICLE-SEPARATOR|||";
    const prompts = getPrompts(topic, language, ignoreDateFilter);
    const prompt = isReviewSearch ? prompts.review : prompts.news;

    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    let buffer = '';
    for await (const chunk of responseStream) {
      buffer += chunk.text;

      let separatorIndex;
      while ((separatorIndex = buffer.indexOf(separator)) !== -1) {
        const jsonString = buffer.substring(0, separatorIndex);
        if (jsonString.trim()) {
           try {
            const article: Article = JSON.parse(cleanJsonString(jsonString));
            article.summary = cleanupSummary(article.summary);
            onArticle(article);
          } catch (e) {
            console.warn(`Could not parse a part of the stream as JSON: "${jsonString}"`, e);
          }
        }
        buffer = buffer.substring(separatorIndex + separator.length);
      }
    }
    
    const finalJsonString = buffer.trim();
    if (finalJsonString) {
      try {
        const article: Article = JSON.parse(cleanJsonString(finalJsonString));
        article.summary = cleanupSummary(article.summary);
        onArticle(article);
      } catch (e) {
        console.warn(`Could not parse the last part of the stream as JSON: "${finalJsonString}"`, e);
      }
    }

    onComplete();

  } catch (e) {
    console.error("Error streaming news digests:", e);
    const error = e instanceof Error 
      ? e 
      : new Error(language === 'nl' ? "Kon geen nieuws ophalen van de AI." : "Could not fetch news from the AI.");
    onError(error);
  }
};


export const fetchFrontPageArticles = async (categories: Category[], language: Language): Promise<Article[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";
    const today = new Date().toISOString().split('T')[0];

    const categoryList = categories.map(c => `- ${c.title[language]}: ${(c.searchQuery && c.searchQuery[language]) || c.title[language]}`).join('\n');

    const prompt_nl = `
        Je bent een expert nieuwsredacteur voor Exact. Jouw taak is om voor ELK van de volgende categorieën **tot 3** van de belangrijkste en meest recente (vandaag of gisteren, ${today}) nieuwsartikelen te vinden.
        Categorieën:
        ${categoryList}
        
        **EXTREEM BELANGRIJK: ALLE output MOET in het Nederlands zijn.**
        Retourneer uw antwoord als een ENKEL JSON-array. Elk object vertegenwoordigt een topartikel. Als u voor een categorie geen geschikt artikel vindt, neem deze dan niet op.

        Elk JSON-object MOET deze structuur hebben:
        {
          "title": "De titel van het artikel, vertaald naar het Nederlands.",
          "summary": "Een beknopte samenvatting van het artikel, vertaald naar het Nederlands, zonder citatie-markeringen zoals [1].",
          "url": "De volledige URL van het originele artikel.",
          "sourceName": "De naam van de nieuwsbron, vertaald naar het Nederlands indien nodig.",
          "publicationDate": "De publicatiedatum in ISO 8601 formaat.",
          "rating": 5.0
        }

        Geef ALLEEN de JSON-array terug.
    `;

    const prompt_en = `
        You are an expert news editor for Exact. Your task is to find **up to 3** of the most important and recent (today or yesterday, ${today}) news articles for EACH of the following categories.
        Categories:
        ${categoryList}

        **EXTREMELY IMPORTANT: ALL output MUST be in English.**
        Return your answer as a SINGLE JSON array. Each object in the array represents a top article. If you cannot find a suitable article for a category, do not include it.

        Each JSON object MUST have this exact structure:
        {
          "title": "The title of the article, translated into English.",
          "summary": "A concise summary of the article, translated into English, without citation markers like [1].",
          "url": "The full URL of the original article.",
          "sourceName": "The name of the news source, translated into English if necessary.",
          "publicationDate": "The publication date in ISO 8601 format.",
          "rating": 5.0
        }
        
        Return ONLY the JSON array.
    `;
    
    const prompt = language === 'nl' ? prompt_nl : prompt_en;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.1,
            }
        });

        const cleanedText = cleanJsonString(response.text);
        if (cleanedText) {
            const parsedArticles: Article[] = JSON.parse(cleanedText);
            if (Array.isArray(parsedArticles)) {
                return parsedArticles.map(article => ({
                    ...article,
                    summary: cleanupSummary(article.summary)
                }));
            }
        }
        return [];
    } catch (error) {
        console.error(`Error fetching all front page articles:`, error);
        throw new Error(language === 'nl' ? "De AI kon de voorpagina-artikelen niet ophalen." : "The AI could not fetch the front page articles.");
    }
};

export const createChatSession = (category: Category, language: Language, contextData?: Article[]): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const persona = (category.persona && category.persona[language]) 
      ? category.persona[language]
      : (language === 'nl' 
          ? `Jij bent een AI-expert op het gebied van "${category.title.nl}".`
          : `You are an AI expert in the field of "${category.title.en}".`);
          
    let systemInstruction: string;

    if (contextData && contextData.length > 0) {
      // With article context
      const contextString = contextData.map(a => `- ${a.title}: ${a.summary}`).join('\n');
      const baseInstruction_nl = `Jouw primaire taak is om vragen te beantwoorden op basis van de volgende context. Baseer je antwoorden zo veel mogelijk op deze data. Als een vraag niet direct beantwoord kan worden met de context, mag je je algemene kennis over "${category.title.nl}" gebruiken. Als een vraag compleet irrelevant is voor de categorie, geef dan beleefd aan dat je alleen vragen over dit onderwerp kunt beantwoorden.`;
      const baseInstruction_en = `Your primary task is to answer questions based on the following context. Base your answers on this data as much as possible. If a question cannot be answered directly using the context, you may use your general knowledge about "${category.title.en}". If a question is completely irrelevant to the category, politely state that you can only answer questions about this topic.`;

      systemInstruction = language === 'nl'
        ? `${persona}\n\n${baseInstruction_nl}\n\nDe context is:\n\n${contextString}`
        : `${persona}\n\n${baseInstruction_en}\n\nThe context is:\n\n${contextString}`;

    } else {
      // Without article context (Expert Chat mode)
      const baseInstruction_nl = `Jouw taak is om vragen te beantwoorden als een expert in jouw vakgebied. Wees behulpzaam, informatief en blijf binnen je rol. Als een vraag compleet irrelevant is voor de categorie, geef dan beleefd aan dat je alleen vragen over dit onderwerp kunt beantwoorden.`;
      const baseInstruction_en = `Your task is to answer questions as an expert in your field. Be helpful, informative, and stay in character. If a question is completely irrelevant to the category, politely state that you can only answer questions about this topic.`;
      systemInstruction = `${persona}\n\n${language === 'nl' ? baseInstruction_nl : baseInstruction_en}`;
    }

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction
        }
    });
    return chat;
};

export const generateArticlesSummary = async (articles: Article[], language: Language): Promise<string> => {
    if (!articles || articles.length === 0) {
        throw new Error(language === 'nl' ? "Kan geen samenvatting genereren zonder artikelen." : "Cannot generate summary without articles.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const articleContext = articles.map(a => `- ${a.title}: ${a.summary}`).join('\n\n');

    const prompt_nl = `
        Je bent een professionele nieuwslezer voor een podcast.
        Jouw taak is om een enkele, vloeiende en boeiende samenvatting te geven van de volgende nieuwsartikelen.
        Combineer de belangrijkste inzichten tot een samenhangend gesproken verhaal, als een kort podcastsegment.
        Begin met een algemene begroeting (bijv. "Goedendag en welkom bij het nieuwsoverzicht.").
        Som de artikelen niet één voor één op, maar synthetiseer hun kernpunten tot een logisch geheel.
        Eindig met een korte afsluiting.
        De samenvatting moet beknopt en prettig zijn om naar te luisteren. Alle output moet in het Nederlands zijn.

        Dit zijn de artikelen om samen te vatten:
        ${articleContext}
    `;

    const prompt_en = `
        You are a professional news anchor for a podcast.
        Your task is to provide a single, fluid, and engaging summary of the following news articles.
        Combine the key insights into a cohesive spoken narrative, like a short podcast segment.
        Start with a general greeting (e.g., "Hello and welcome to the news digest.").
        Do not list the articles one by one; instead, synthesize their key points into a logical flow.
        End with a brief sign-off.
        The summary should be concise and pleasant to listen to. All output must be in English.

        Here are the articles to summarize:
        ${articleContext}
    `;

    const prompt = language === 'nl' ? prompt_nl : prompt_en;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        return response.text;
    } catch (error) {
        console.error(`Error generating articles summary:`, error);
        throw new Error(language === 'nl' ? "De AI kon geen samenvatting van de artikelen genereren." : "The AI could not generate a summary of the articles.");
    }
};