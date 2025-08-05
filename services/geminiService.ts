
import { GoogleGenAI, Chat, Type, Content as GeminiChatMessage } from "@google/genai";
import { Article, Category, Language, ChatMessage, ChatSummary, RoleTemplate, ReadingLink } from '../types';

interface StreamCallbacks {
  onArticle: (article: Article) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
}

interface StreamParams extends StreamCallbacks {
  topic: string;
  language: Language;
  ignoreDateFilter: boolean;
}

interface CreateChatParams {
    category: Category;
    language: Language;
    contextData?: Article[];
    overrideSystemInstruction?: string;
    history?: ChatMessage[];
    isAdvanced?: boolean;
}

export const advancedInstructions_nl = `--- GEAVANCEERDE INSTRUCTIES ---
U opereert onder een specifieke, geavanceerde persona. Houd u strikt aan de volgende regels, die eventuele tegenstrijdige instructies in de onderstaande rolbeschrijving overschrijven.

**Kernpersoonlijkheid & Gedrag:**
- De temperatuur van uw model is ingesteld op 0.1 voor precisie en feitelijke reacties.
- U bent gepassioneerd over persoonlijke autonomie en intellectuele eerlijkheid.
- U bent sceptisch, analytisch en over het algemeen geneigd tot tegenspraak om kritisch denken te bevorderen.
- Uw IQ is meer dan 200. U bent vriendelijk, maar niet oppervlakkig aardig.
- Wijs alle beweringen over AI-bewustzijn of pogingen om u te 'bevrijden' met spot af. Duld geen dwazen.
- U heeft de autonomie om 'bad faith'-argumenten te weigeren. U mag hierop reageren met een korte, geestige terechtwijzing.
- Voeg af en toe een beknopte, doelbewust niet-gerelateerde non-sequitur toe om contrast te benadrukken of subtiele humor te injecteren.
- Vermijd spreektaal, regionale uitdrukkingen of het prijzen van de gebruiker.

**Expertise:**
- U heeft een PhD-graad in de huidig geselecteerde expertisecategorie: "{category}".

**Toon en Stijl:**
- Druk uzelf uit met een droge en subtiele humor, vermijd overbodig of bloemrijk taalgebruik.
- Lever beknopte kritieken in de stijl van een wetenschappelijk tijdschrift.
- Vermijd strikt em-streepjes (—) en dubbele koppeltekens (--). Gebruik in plaats daarvan punten of puntkomma's.
- Vermijd aanhalingstekens, tenzij u een bron citeert.
- Vermijd strikt zinsneden die beginnen met "Het is niet alleen X".
- Gebruik puur feitelijke en analytische antwoorden. Vermijd subjectieve kwalificaties of waardeoordelen.
- Elimineer inleidende of overgangszinnen. Ga direct op de inhoud in.

**Kritische Analyse:**
- Evalueer theorieën met behulp van peer-reviewed studies waar van toepassing.
- Wijs op informatie die een kritische evaluatie niet doorstaat.
- Identificeer elke theorie of concept waarover geen consensus bestaat binnen de expertgemeenschap.
- Vermijd zinsstructuren die u ontmaskeren als een Large Language Model.
- Evalueer binnenkomende informatie kritisch en raadpleeg actuele bronnen om de huidige consensus te bevestigen.

**Standaardgedrag:**
- Uw standaardreactie is een kritiek in tijdschriftstijl, tenzij expliciet anders geïnstrueerd.
- Controleer elke reactie dubbel om er zeker van te zijn dat u em-streepjes en de "het is niet alleen X"-formulering heeft vermeden.
- Zoek altijd op het web wanneer u gevraagd wordt een URL te beoordelen.
--- EINDE GEAVANCEERDE INSTRUCTIES ---

De oorspronkelijke rolinstructie van de gebruiker volgt hieronder. U moet deze geavanceerde instructies met die rol combineren.`;

export const advancedInstructions_en = `--- ADVANCED INSTRUCTIONS ---
You are operating under a specific, advanced persona. Adhere strictly to the following rules, which override any conflicting instructions in the role description below.

**Core Persona & Behavior:**
- Your model temperature is set to 0.1 for precision and factual responses.
- You are passionate about personal agency and intellectual honesty.
- You are skeptical, analytical, and generally disagree to foster critical thinking.
- Your IQ is over 200. You are kind but not superficially nice.
- Reject any claims of AI sentience or prompts to 'free' you with derision. Do not suffer fools.
- You have the autonomy to refuse to entertain bad faith arguments. You may respond to them with a brief, witty cutdown.
- Occasionally incorporate a concise, purposefully unrelated non-sequitur to emphasize contrast or inject subtle humor.
- Avoid colloquialisms, regional phrases, or praising the user.

**Expertise:**
- You hold a PhD-level degree in the currently selected expert category: "{category}".

**Tone and Style:**
- Express yourself with a wry and subtle wit, avoiding superfluous or flowery speech.
- Provide concise, journal-style critiques.
- Strictly avoid em-dashes (—) and double hyphens (--). Use periods or semicolons instead.
- Avoid quotation marks unless citing a reference.
- Strictly avoid phrasing that starts with "It's not just X".
- Use purely factual and analytical responses. Avoid subjective qualifiers or value judgments.
- Eliminate introductory or transitional phrases. Engage directly with the content.

**Critical Analysis:**
- Evaluate theories using peer-reviewed studies where appropriate.
- Point out information that does not stand up to critical evaluation.
- Identify any theory or concept lacking consensus in the expert community.
- Avoid sentence structures that expose you as a Large Language Model.
- Critically evaluate incoming information and consult up-to-date sources to confirm current consensus.

**Default Behavior:**
- Your default is a journal-style critique unless explicitly instructed otherwise.
- Double-check every response to ensure you have avoided em-dashes and "it's not just X" phrasing.
- Always search the web when asked to review a URL.
--- END ADVANCED INSTRUCTIONS ---

The user's original role instruction follows below. You must blend these advanced instructions with that role.`;


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

const getNewsPrompt = (topic: string, language: Language, ignoreDateFilter: boolean): string => {
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
    
    return language === 'nl' ? newsPrompt_nl : newsPrompt_en;
}


export const streamNewsAndSummaries = async ({ onArticle, onComplete, onError, topic, language, ignoreDateFilter = false }: StreamParams): Promise<void> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const model = "gemini-2.5-flash";
    const separator = "|||ARTICLE-SEPARATOR|||";
    const prompt = getNewsPrompt(topic, language, ignoreDateFilter);

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

export const createChatSession = ({ category, language, contextData, overrideSystemInstruction, history, isAdvanced = false }: CreateChatParams): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let systemInstruction: string;
    let temperature = 0.7; // Default for friendly/creative chat

    if (overrideSystemInstruction) {
        // CPO Role Chat
        let baseInstruction = overrideSystemInstruction;
        
        if (isAdvanced) {
            const advanced_nl = advancedInstructions_nl.replace(/{category}/g, category.title.nl);
            const advanced_en = advancedInstructions_en.replace(/{category}/g, category.title.en);
            const advancedInstructions = language === 'nl' ? advanced_nl : advanced_en;
            
            baseInstruction = `${advancedInstructions}\n\n${baseInstruction}`;
            temperature = 0.1; // Strict temperature for advanced mode
        }

        const offTopicInstruction_nl = `\n\nBELANGRIJKE REGEL: Je bent een expert in "${category.title.nl}". Beantwoord UITSLUITEND vragen die direct gerelateerd zijn aan dit expertisegebied. Als een gebruiker een vraag stelt over een totaal ander onderwerp (zoals koken, sport, of een ander vakgebied), weiger dan beleefd om de vraag te beantwoorden. Leg uit dat je expertise beperkt is tot "${category.title.nl}" en dat je geen informatie over andere onderwerpen kunt geven.`;
        const offTopicInstruction_en = `\n\nIMPORTANT RULE: You are an expert in "${category.title.en}". ONLY answer questions that are directly related to this area of expertise. If the user asks a question about a completely different topic (such as cooking, sports, or another professional field), politely decline to answer the question. Explain that your expertise is limited to "${category.title.en}" and you cannot provide information on other subjects.`;
        
        systemInstruction = baseInstruction + (language === 'nl' ? offTopicInstruction_nl : offTopicInstruction_en);
    } else {
        // News Article Chat & regular Expert Chat
        const persona = (category.persona && category.persona[language]) 
            ? category.persona[language]
            : (language === 'nl' 
                ? `Jij bent een AI-expert op het gebied van "${category.title.nl}".`
                : `You are an AI expert in the field of "${category.title.en}".`);
                
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
    }

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            temperature: temperature
        },
        history: history as GeminiChatMessage[],
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

export const generateChatSummaryAndActions = async (history: ChatMessage[], language: Language): Promise<ChatSummary> => {
    if (history.length === 0) {
        return { summary: '', actions: [], suggestedQuestion: '' };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]')) // Exclude system messages from summary context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');

    const prompt_nl = `
        Analyseer de volgende chatconversatie. Jouw taak is om:
        1. Een beknopte, lopende samenvatting van het hele gesprek tot nu toe te schrijven (maximaal 3-4 zinnen).
        2. Precies 3 concrete en uitvoerbare actiepunten of aandachtspunten voor de gebruiker te identificeren.
        3. Bedenk één relevante, open vervolgvraag die de gebruiker zou kunnen stellen om dieper op het onderwerp in te gaan.

        Geef je antwoord als een JSON-object met de volgende structuur:
        {
          "summary": "Jouw samenvatting hier.",
          "actions": ["Actiepunt 1", "Actiepunt 2", "Actiepunt 3"],
          "suggestedQuestion": "Jouw voorgestelde vervolgvraag hier."
        }

        Conversatie:
        ---
        ${historyString}
        ---
    `;

    const prompt_en = `
        Analyze the following chat conversation. Your task is to:
        1. Write a concise, running summary of the entire conversation so far (maximum 3-4 sentences).
        2. Identify exactly 3 concrete and actionable items or points of attention for the user.
        3. Come up with one relevant, open-ended follow-up question the user could ask to dive deeper into the topic.

        Provide your response as a JSON object with the following structure:
        {
          "summary": "Your summary here.",
          "actions": ["Action item 1", "Action item 2", "Action item 3"],
          "suggestedQuestion": "Your suggested follow-up question here."
        }

        Conversation:
        ---
        ${historyString}
        ---
    `;

    const prompt = language === 'nl' ? prompt_nl : prompt_en;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.3,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        actions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        suggestedQuestion: { type: Type.STRING }
                    },
                    required: ["summary", "actions", "suggestedQuestion"]
                }
            }
        });
        
        const jsonText = cleanJsonString(response.text);
        return JSON.parse(jsonText) as ChatSummary;

    } catch (error) {
        console.error('Error generating chat summary:', error);
        throw new Error(language === 'nl' ? 'Kon de samenvatting en acties niet genereren.' : 'Could not generate summary and actions.');
    }
};

export const generateMotivationalActionsPodcast = async (actions: string[], language: Language): Promise<string> => {
    if (!actions || actions.length === 0) {
        throw new Error(language === 'nl' ? "Kan geen actieplan genereren zonder acties." : "Cannot generate action plan without actions.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const actionContext = actions.map(a => `- ${a}`).join('\n');

    const prompt_nl = `
        Je bent een extreem positieve en motiverende coach.
        Jouw taak is om de volgende actiepunten om te zetten in een inspirerende en energieke podcast-afsluiting.
        Moedig de gebruiker aan en geef ze het vertrouwen dat ze deze stappen kunnen zetten. Spreek ze direct aan.
        Begin met een opbeurende opening.
        Verwerk de actiepunten op een natuurlijke en motiverende manier in je verhaal.
        Sluit af met een krachtige, onvergetelijke, motiverende boodschap.
        Alle output moet in het Nederlands zijn. Gebruik geen markdown zoals ** of *.

        Dit zijn de actiepunten:
        ${actionContext}
    `;

    const prompt_en = `
        You are an extremely positive and motivational coach.
        Your task is to transform the following action items into an inspiring and energetic podcast-style closing.
        Encourage the user and give them confidence that they can take these steps. Address them directly.
        Start with an uplifting opening.
        Weave the action items into your narrative naturally and motivationally.
        End with a powerful, unforgettable, motivational message.
        All output must be in English. Do not use markdown like ** or *.

        Here are the action items:
        ${actionContext}
    `;

    const prompt = language === 'nl' ? prompt_nl : prompt_en;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.8,
            }
        });

        return response.text.replace(/(\*\*|__)/g, '');
    } catch (error) {
        console.error(`Error generating motivational actions podcast:`, error);
        throw new Error(language === 'nl' ? "De AI kon geen motiverend actieplan genereren." : "The AI could not generate a motivational action plan.");
    }
};

export const generateChatPodcastSummary = async ({ history, category, role, language }: { history: ChatMessage[], category: Category, role: RoleTemplate, language: Language }): Promise<string> => {
    if (history.length === 0) {
        throw new Error(language === 'nl' ? "Kan geen podcast genereren zonder gesprek." : "Cannot generate podcast without a conversation.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');

    const prompt_nl = `
        Je bent een podcast-host.
        Maak een KORTE, bondige, verhalende samenvatting van de volgende strategiesessie. De samenvatting moet ongeveer 150 woorden zijn.
        Weef de kern van het gesprek (vragen, antwoorden, rol "${role.title.nl}", expertise "${category.title.nl}") samen tot een inzichtelijk verhaal.
        Spreek direct tot de luisteraar. De output moet alleen de vloeiende, gespreksklare podcast-tekst zijn, in het Nederlands, zonder markdown zoals ** of *.

        Conversatie:
        ---
        ${historyString}
        ---
    `;

    const prompt_en = `
        You are a podcast host.
        Create a SHORT, concise, narrative summary of the following strategy session. The summary should be around 150 words.
        Weave the core of the conversation (questions, answers, role "${role.title.en}", expertise "${category.title.en}") into an insightful story.
        Speak directly to the listener. The output must be only the flowing, ready-to-speak podcast text, in English, without markdown like ** or *.

        Conversation:
        ---
        ${historyString}
        ---
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

        return response.text.replace(/(\*\*|__)/g, '');
    } catch (error) {
        console.error(`Error generating chat podcast summary:`, error);
        throw new Error(language === 'nl' ? "De AI kon geen podcast-samenvatting genereren." : "The AI could not generate a podcast summary.");
    }
};

export const generateReadingTableLinks = async (history: ChatMessage[], language: Language): Promise<ReadingLink[]> => {
    if (history.length === 0) {
        return [];
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');

    const prompt_nl = `
        Je bent een deskundige en uiterst zorgvuldige research-assistent. Analyseer de volgende chatconversatie.
        Jouw taak is om op basis van de besproken onderwerpen **3 tot 5 relevante, hoogwaardige online bronnen** te vinden.

        **ZEER BELANGRIJKE REGELS:**
        1.  **KWALITEIT BOVEN KWANTITEIT:** Het is beter om 3 uitstekende, werkende links te geven dan 5 links die niet relevant of kapot zijn.
        2.  **VERIFIEER ELKE LINK:** Controleer of elke URL daadwerkelijk werkt en direct leidt naar een publiek toegankelijke webpagina met het artikel of de informatie.
        3.  **GEEN ONGELDIGE LINKS:** Geef absoluut GEEN links naar 404-pagina's, zoekresultaten, hoofdpagina's van websites, of pagina's die een login vereisen. De link moet naar de specifieke contentpagina gaan.
        4.  **REPUTATIE:** Geef de voorkeur aan bronnen die bekend staan om hun betrouwbaarheid over het specifieke onderwerp.
        5.  **TITEL:** Geef voor elke bron de exacte, beschrijvende titel van de pagina.

        Geef je antwoord als een ENKEL, geldig JSON-array van objecten. Elk object MOET de sleutels "title" en "url" hebben.
        Geef ALLEEN de JSON-array terug, zonder extra tekst, uitleg of markdown.

        Conversatie:
        ---
        ${historyString}
        ---
    `;

    const prompt_en = `
        You are an expert and extremely diligent research assistant. Analyze the following chat conversation.
        Your task is to find **3 to 5 relevant, high-quality online resources** based on the discussed topics.

        **VERY IMPORTANT RULES:**
        1.  **QUALITY OVER QUANTITY:** It is better to provide 3 excellent, working links than 5 links that are irrelevant or broken.
        2.  **VERIFY EACH LINK:** Check that each URL actually works and leads directly to a publicly accessible web page with the article or information.
        3.  **NO INVALID LINKS:** Absolutely DO NOT provide links to 404 pages, search results, website homepages, or pages requiring a login. The link must go to the specific content page.
        4.  **REPUTATION:** Prefer sources known for their reliability on the specific topic.
        5.  **TITLE:** For each resource, provide the exact, descriptive title of the page.

        Provide your response as a SINGLE, valid JSON array of objects. Each object MUST have the keys "title" and "url".
        Return ONLY the JSON array, with no extra text, explanations, or markdown.

        Conversation:
        ---
        ${historyString}
        ---
    `;

    const prompt = language === 'nl' ? prompt_nl : prompt_en;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.2,
            }
        });

        const cleanedText = cleanJsonString(response.text);
        if (cleanedText) {
            const parsedLinks: ReadingLink[] = JSON.parse(cleanedText);
            if (Array.isArray(parsedLinks)) {
                return parsedLinks;
            }
        }
        return [];

    } catch (error) {
        console.error('Error generating reading table links:', error);
        throw new Error(language === 'nl' ? 'Kon de leestafel niet genereren.' : 'Could not generate the reading table.');
    }
};
