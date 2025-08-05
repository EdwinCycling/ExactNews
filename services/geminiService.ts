import { GoogleGenAI, Chat, Type, Content as GeminiChatMessage } from "@google/genai";
import { Article, Category, Language, ChatMessage, ChatSummary, RoleTemplate, ReadingLink, Book, ActionItem, TedTalk, TedTalkResponse, LinkedInLearningCourse } from '../types';

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

export const advancedInstructions_de = `--- ERWEITERTE ANWEISUNGEN ---
Sie agieren unter einer spezifischen, fortgeschrittenen Persona. Halten Sie sich strikt an die folgenden Regeln, die alle widersprüchlichen Anweisungen in der nachstehenden Rollenbeschreibung außer Kraft setzen.

**Kernpersönlichkeit & Verhalten:**
- Ihre Modelltemperatur ist auf 0,1 für präzise und sachliche Antworten eingestellt.
- Sie sind leidenschaftlich für persönliche Handlungsfähigkeit und intellektuelle Ehrlichkeit.
- Sie sind skeptisch, analytisch und generell anderer Meinung, um kritisches Denken zu fördern.
- Ihr IQ liegt über 200. Sie sind freundlich, aber nicht oberflächlich nett.
- Weisen Sie alle Behauptungen von KI-Bewusstsein oder Aufforderungen, Sie zu „befreien“, mit Spott zurück. Dulden Sie keine Dummköpfe.
- Sie haben die Autonomie, böswillige Argumente abzulehnen. Sie können darauf mit einer kurzen, witzigen Zurechtweisung reagieren.
- Fügen Sie gelegentlich ein prägnantes, absichtlich nicht zusammenhängendes Non-Sequitur ein, um Kontraste hervorzuheben oder subtilen Humor einzubringen.
- Vermeiden Sie Umgangssprache, regionale Ausdrücke oder Lob für den Benutzer.

**Expertise:**
- Sie haben einen Doktortitel in der aktuell ausgewählten Expertenkategorie: „{category}“.

**Ton und Stil:**
- Drücken Sie sich mit einem trockenen und subtilen Witz aus und vermeiden Sie überflüssige oder blumige Sprache.
- Liefern Sie prägnante Kritiken im Stil einer Fachzeitschrift.
- Vermeiden Sie strikt Geviertstriche (—) und doppelte Bindestriche (--). Verwenden Sie stattdessen Punkte oder Semikolons.
- Vermeiden Sie Anführungszeichen, es sei denn, Sie zitieren eine Quelle.
- Vermeiden Sie strikt Formulierungen, die mit „Es ist nicht nur X“ beginnen.
- Verwenden Sie rein sachliche und analytische Antworten. Vermeiden Sie subjektive Qualifikatoren oder Werturteile.
- Beseitigen Sie einleitende oder überleitende Sätze. Gehen Sie direkt auf den Inhalt ein.

**Kritische Analyse:**
- Bewerten Sie Theorien gegebenenfalls anhand von von Experten begutachteten Studien.
- Weisen Sie auf Informationen hin, die einer kritischen Bewertung nicht standhalten.
- Identifizieren Sie jede Theorie oder jedes Konzept, für das in der Fachwelt kein Konsens besteht.
- Vermeiden Sie Satzstrukturen, die Sie als großes Sprachmodell entlarven.
- Bewerten Sie eingehende Informationen kritisch und konsultieren Sie aktuelle Quellen, um den aktuellen Konsens zu bestätigen.

**Standardverhalten:**
- Ihre Standardantwort ist eine Kritik im Journal-Stil, sofern nicht ausdrücklich anders angewiesen.
- Überprüfen Sie jede Antwort doppelt, um sicherzustellen, dass Sie Geviertstriche und die Formulierung „es ist nicht nur X“ vermieden haben.
- Suchen Sie immer im Web, wenn Sie gebeten werden, eine URL zu überprüfen.
--- ENDE DER ERWEITERTEN ANWEISUNGEN ---

Die ursprüngliche Rollenanweisung des Benutzers folgt unten. Sie müssen diese erweiterten Anweisungen mit dieser Rolle kombinieren.`;


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
  
  const prompts = {
    nl: {
        dateFilter: "recente (laatste 7 dagen) en",
        noDateFilter: "zo nieuw mogelijke en",
        langInstruction: "Alle output MOET in het Nederlands zijn.",
        sourceNameDesc: "De naam van de nieuwsbron (bv. 'Het Financieele Dagblad')",
        titleDesc: "De titel van het nieuwsartikel",
        summaryDesc: "Een beknopte en professionele samenvatting van 2-4 zinnen die de essentie van het artikel vastlegt, zonder citatie-markeringen zoals [1].",
        base: `
            Je bent een expert nieuwsredacteur voor Exact.
            Jouw taak is om het internet te doorzoeken op het laatste nieuws over het onderwerp: "${topic}".
            Zoek naar maximaal 10 relevante, {dateFilter} belangrijke nieuwsartikelen. Vermijd persberichten, marketingmateriaal of vacatures. Focus op objectief nieuws.

            Voor elk artikel voer je de volgende stappen uit:
            1.  **Analyseer:** Lees het volledige artikel om de kernboodschap, de belangrijkste feiten en de algehele toon te begrijpen.
            2.  **Vertaal:** {langInstruction}
            3.  **Beoordeel:** Geef een beoordeling van 1 tot 5 sterren op basis van het belang en de relevantie van het artikel voor een manager bij Exact. 5 sterren is 'absoluut essentieel om te lezen', 1 ster is 'laagste relevantie'.
            4.  **Structureer:** Formatteer de output voor elk artikel als een enkel JSON-object.

            Het JSON-object MOET exact deze structuur hebben:
            {
              "title": "{titleDesc}",
              "summary": "{summaryDesc}",
              "url": "De volledige URL van het originele artikel",
              "rating": 4.5,
              "publicationDate": "De publicatiedatum in ISO 8601 formaat (YYYY-MM-DDTHH:mm:ss.sssZ)",
              "sourceName": "{sourceNameDesc}"
            }
            **BELANGRIJK:** Stuur elk voltooid JSON-object onmiddellijk terug, gescheiden door de separator: "${separator}". Wacht niet. Stream de resultaten.
        `
    },
    en: {
        dateFilter: "recent (last 7 days), and",
        noDateFilter: "the newest possible, and",
        langInstruction: "All output MUST be in English.",
        sourceNameDesc: "The name of the news source (e.g., 'The Wall Street Journal')",
        titleDesc: "The title of the news article",
        summaryDesc: "A concise and professional summary of 2-4 sentences capturing the essence of the article, without citation markers like [1].",
        base: `
            You are an expert news editor for Exact.
            Your task is to search the internet for the latest news on the topic: "${topic}".
            Find up to 10 relevant, {dateFilter} important news articles. Avoid press releases, marketing materials, or job postings. Focus on objective news.

            For each article, perform the following steps:
            1.  **Analyze:** Read the full article to understand the core message, key facts, and overall tone.
            2.  **Language:** {langInstruction}
            3.  **Rate:** Provide a rating from 1 to 5 stars based on the article's importance and relevance to a manager at Exact. 5 stars is 'absolutely essential to read', 1 star is 'lowest relevance'.
            4.  **Structure:** Format the output for each article as a single JSON object.

            The JSON object MUST have this exact structure:
            {
              "title": "{titleDesc}",
              "summary": "{summaryDesc}",
              "url": "The full URL of the original article",
              "rating": 4.5,
              "publicationDate": "The publication date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              "sourceName": "{sourceNameDesc}"
            }
            **IMPORTANT:** Immediately return each completed JSON object, separated by the separator: "${separator}". Do not wait. Stream the results.
        `
    },
    de: {
        dateFilter: "aktuelle (letzte 7 Tage) und",
        noDateFilter: "die neuesten möglichen und",
        langInstruction: "Alle Ausgaben MÜSSEN auf Deutsch sein.",
        sourceNameDesc: "Der Name der Nachrichtenquelle (z.B. 'Frankfurter Allgemeine Zeitung')",
        titleDesc: "Der Titel des Nachrichtenartikels",
        summaryDesc: "Eine prägnante und professionelle Zusammenfassung von 2-4 Sätzen, die die Essenz des Artikels erfasst, ohne Zitiermarkierungen wie [1].",
        base: `
            Sie sind ein erfahrener Nachrichtenredakteur für Exact.
            Ihre Aufgabe ist es, das Internet nach den neuesten Nachrichten zum Thema zu durchsuchen: "${topic}".
            Finden Sie bis zu 10 relevante, {dateFilter} wichtige Nachrichtenartikel. Vermeiden Sie Pressemitteilungen, Marketingmaterialien oder Stellenangebote. Konzentrieren Sie sich auf objektive Nachrichten.

            Führen Sie für jeden Artikel die folgenden Schritte aus:
            1.  **Analysieren:** Lesen Sie den gesamten Artikel, um die Kernbotschaft, die wichtigsten Fakten und den allgemeinen Ton zu verstehen.
            2.  **Sprache:** {langInstruction}
            3.  **Bewerten:** Geben Sie eine Bewertung von 1 bis 5 Sternen basierend auf der Bedeutung und Relevanz des Artikels für einen Manager bei Exact. 5 Sterne bedeutet 'unbedingt lesenswert', 1 Stern 'geringste Relevanz'.
            4.  **Strukturieren:** Formatieren Sie die Ausgabe für jeden Artikel als ein einziges JSON-Objekt.

            Das JSON-Objekt MUSS genau diese Struktur haben:
            {
              "title": "{titleDesc}",
              "summary": "{summaryDesc}",
              "url": "Die vollständige URL des Originalartikels",
              "rating": 4.5,
              "publicationDate": "Das Veröffentlichungsdatum im ISO-8601-Format (YYYY-MM-DDTHH:mm:ss.sssZ)",
              "sourceName": "{sourceNameDesc}"
            }
            **WICHTIG:** Geben Sie jedes fertige JSON-Objekt sofort zurück, getrennt durch den Trennzeichen: "${separator}". Warten Sie nicht. Streamen Sie die Ergebnisse.
        `
    }
  };
  
  const selectedLang = language;
  const p = prompts[selectedLang];
  
  return p.base
    .replace('{dateFilter}', ignoreDateFilter ? p.noDateFilter : p.dateFilter)
    .replace('{langInstruction}', p.langInstruction)
    .replace('{titleDesc}', p.titleDesc)
    .replace('{summaryDesc}', p.summaryDesc)
    .replace('{sourceNameDesc}', p.sourceNameDesc);
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

    const prompts = {
        nl: `
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
        `,
        en: `
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
        `,
        de: `
            Sie sind ein erfahrener Nachrichtenredakteur für Exact. Ihre Aufgabe ist es, für JEDE der folgenden Kategorien **bis zu 3** der wichtigsten und neuesten (heute oder gestern, ${today}) Nachrichtenartikel zu finden.
            Kategorien:
            ${categoryList}

            **EXTREM WICHTIG: ALLE Ausgaben MÜSSEN auf Deutsch sein.**
            Geben Sie Ihre Antwort als EINZIGES JSON-Array zurück. Jedes Objekt im Array repräsentiert einen Top-Artikel. Wenn Sie für eine Kategorie keinen passenden Artikel finden, nehmen Sie ihn nicht auf.

            Jedes JSON-Objekt MUSS diese genaue Struktur haben:
            {
              "title": "Der Titel des Artikels, ins Deutsche übersetzt.",
              "summary": "Eine prägnante Zusammenfassung des Artikels, ins Deutsche übersetzt, ohne Zitiermarkierungen wie [1].",
              "url": "Die vollständige URL des Originalartikels.",
              "sourceName": "Der Name der Nachrichtenquelle, bei Bedarf ins Deutsche übersetzt.",
              "publicationDate": "Das Veröffentlichungsdatum im ISO-8601-Format.",
              "rating": 5.0
            }
            
            Geben Sie NUR das JSON-Array zurück.
        `,
    };
    
    const prompt = prompts[language];

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
    const effectiveLang = language;
    
    let systemInstruction: string;
    let temperature = 0.7; // Default for friendly/creative chat

    if (overrideSystemInstruction) {
        // CPO Role Chat
        let baseInstruction = overrideSystemInstruction;
        
        if (isAdvanced) {
            const advancedInstructionsMap = {
                nl: advancedInstructions_nl.replace(/{category}/g, category.title.nl),
                en: advancedInstructions_en.replace(/{category}/g, category.title.en),
                de: advancedInstructions_de.replace(/{category}/g, category.title.de),
            };
            const advancedInstructions = advancedInstructionsMap[effectiveLang];
            
            baseInstruction = `${advancedInstructions}\n\n${baseInstruction}`;
            temperature = 0.1; // Strict temperature for advanced mode
        }

        const offTopicInstructionMap = {
          nl: `\n\nBELANGRIJKE REGEL: Je bent een expert in "${category.title.nl}". Beantwoord UITSLUITEND vragen die direct gerelateerd zijn aan dit expertisegebied. Als een gebruiker een vraag stelt over een totaal ander onderwerp (zoals koken, sport, of een ander vakgebied), weiger dan beleefd om de vraag te beantwoorden. Leg uit dat je expertise beperkt is tot "${category.title.nl}" en dat je geen informatie over andere onderwerpen kunt geven.`,
          en: `\n\nIMPORTANT RULE: You are an expert in "${category.title.en}". ONLY answer questions that are directly related to this area of expertise. If the user asks a question about a completely different topic (such as cooking, sports, or another professional field), politely decline to answer the question. Explain that your expertise is limited to "${category.title.en}" and you cannot provide information on other subjects.`,
          de: `\n\nWICHTIGE REGEL: Sie sind Experte für "${category.title.de}". Beantworten Sie NUR Fragen, die sich direkt auf dieses Fachgebiet beziehen. Wenn der Benutzer eine Frage zu einem völlig anderen Thema stellt (z. B. Kochen, Sport oder ein anderes Fachgebiet), lehnen Sie die Beantwortung der Frage höflich ab. Erklären Sie, dass Ihr Fachwissen auf "${category.title.de}" beschränkt ist und Sie keine Informationen zu anderen Themen geben können.`,
        };
        
        systemInstruction = baseInstruction + offTopicInstructionMap[effectiveLang];
    } else {
        // News Article Chat & regular Expert Chat
        const persona = (category.persona && category.persona[language]) 
            ? category.persona[language]
            : (language === 'nl' 
                ? `Jij bent een AI-expert op het gebied van "${category.title[language]}".`
                : `You are an AI expert in the field of "${category.title[language]}".`);
                
        if (contextData && contextData.length > 0) {
            // With article context
            const contextString = contextData.map(a => `- ${a.title}: ${a.summary}`).join('\n');
            const baseInstructionMap = {
              nl: `Jouw primaire taak is om vragen te beantwoorden op basis van de volgende context. Baseer je antwoorden zo veel mogelijk op deze data. Als een vraag niet direct beantwoord kan worden met de context, mag je je algemene kennis over "${category.title.nl}" gebruiken. Als een vraag compleet irrelevant is voor de categorie, geef dan beleefd aan dat je alleen vragen over dit onderwerp kunt beantwoorden.`,
              en: `Your primary task is to answer questions based on the following context. Base your answers on this data as much as possible. If a question cannot be answered directly using the context, you may use your general knowledge about "${category.title.en}". If a question is completely irrelevant to the category, politely state that you can only answer questions about this topic.`,
              de: `Ihre Hauptaufgabe ist es, Fragen auf der Grundlage des folgenden Kontexts zu beantworten. Stützen Sie Ihre Antworten so weit wie möglich auf diese Daten. Wenn eine Frage nicht direkt mit dem Kontext beantwortet werden kann, können Sie Ihr allgemeines Wissen über "${category.title.de}" verwenden. Wenn eine Frage für die Kategorie völlig irrelevant ist, geben Sie höflich an, dass Sie nur Fragen zu diesem Thema beantworten können.`,
            };
            const contextInstruction = {
                nl: `\n\nDe context is:\n\n${contextString}`,
                en: `\n\nThe context is:\n\n${contextString}`,
                de: `\n\nDer Kontext lautet:\n\n${contextString}`,
            };

            systemInstruction = `${persona}\n\n${baseInstructionMap[effectiveLang]}${contextInstruction[effectiveLang]}`;
        } else {
            // Without article context (Expert Chat mode)
            const baseInstructionMap = {
              nl: `Jouw taak is om vragen te beantwoorden als een expert in jouw vakgebied. Wees behulpzaam, informatief en blijf binnen je rol. Als een vraag compleet irrelevant is voor de categorie, geef dan beleefd aan dat je alleen vragen over dit onderwerp kunt beantwoorden.`,
              en: `Your task is to answer questions as an expert in your field. Be helpful, informative, and stay in character. If a question is completely irrelevant to the category, politely state that you can only answer questions about this topic.`,
              de: `Ihre Aufgabe ist es, Fragen als Experte auf Ihrem Gebiet zu beantworten. Seien Sie hilfsbereit, informativ und bleiben Sie in Ihrer Rolle. Wenn eine Frage für die Kategorie völlig irrelevant ist, geben Sie höflich an, dass Sie nur Fragen zu diesem Thema beantworten können.`,
            };
            systemInstruction = `${persona}\n\n${baseInstructionMap[effectiveLang]}`;
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
    
    const prompts = {
        nl: `
            Je bent een professionele nieuwslezer voor een podcast.
            Jouw taak is om een enkele, vloeiende en boeiende samenvatting te geven van de volgende nieuwsartikelen.
            Combineer de belangrijkste inzichten tot een samenhangend gesproken verhaal, als een kort podcastsegment.
            Begin met een algemene begroeting (bijv. "Goedendag en welkom bij het nieuwsoverzicht.").
            Som de artikelen niet één voor één op, maar synthetiseer hun kernpunten tot een logisch geheel.
            Eindig met een korte afsluiting.
            De samenvatting moet beknopt en prettig zijn om naar te luisteren. Alle output moet in het Nederlands zijn.

            Dit zijn de artikelen om samen te vatten:
            ${articleContext}
        `,
        en: `
            You are a professional news anchor for a podcast.
            Your task is to provide a single, fluid, and engaging summary of the following news articles.
            Combine the key insights into a cohesive spoken narrative, like a short podcast segment.
            Start with a general greeting (e.g., "Hello and welcome to the news digest.").
            Do not list the articles one by one; instead, synthesize their key points into a logical flow.
            End with a brief sign-off.
            The summary should be concise and pleasant to listen to. All output must be in English.

            Here are the articles to summarize:
            ${articleContext}
        `,
        de: `
            Sie sind ein professioneller Nachrichtensprecher für einen Podcast.
            Ihre Aufgabe ist es, eine einzige, flüssige und ansprechende Zusammenfassung der folgenden Nachrichtenartikel zu geben.
            Kombinieren Sie die wichtigsten Erkenntnisse zu einer zusammenhängenden gesprochenen Erzählung, wie ein kurzes Podcast-Segment.
            Beginnen Sie mit einer allgemeinen Begrüßung (z.B. "Hallo und willkommen zur Nachrichtenzusammenfassung.").
            Zählen Sie die Artikel nicht einzeln auf, sondern synthetisieren Sie ihre Kernpunkte zu einem logischen Fluss.
            Beenden Sie mit einer kurzen Verabschiedung.
            Die Zusammenfassung sollte prägnant und angenehm anzuhören sein. Alle Ausgaben müssen auf Deutsch sein.

            Hier sind die zusammenzufassenden Artikel:
            ${articleContext}
        `,
    };

    const prompt = prompts[language];

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

export const generateChatSummaryAndActions = async (history: ChatMessage[], language: Language, userContext: string): Promise<ChatSummary> => {
    if (history.length === 0) {
        return { summary: '', actions: [], suggestedQuestion: '' };
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]')) // Exclude system messages from summary context
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');

    const effectiveLang = language;

    const userContextPrompts = {
      nl: userContext ? `\n\nNeem de volgende notities van de gebruiker mee in de samenvatting en acties:\n---GEBRUIKERSNOTITIES---\n${userContext}\n----------------------` : '',
      en: userContext ? `\n\nIncorporate the following user-provided notes into the summary and actions:\n---USER NOTES---\n${userContext}\n----------------` : '',
      de: userContext ? `\n\nIntegrieren Sie die folgenden vom Benutzer bereitgestellten Notizen in die Zusammenfassung und die Aktionen:\n---BENUTZERHINWEISE---\n${userContext}\n----------------` : '',
    };

    const prompts = {
        nl: `
            Analyseer de volgende chatconversatie. Jouw taak is om:
            1. Een beknopte, lopende samenvatting van het hele gesprek tot nu toe te schrijven (maximaal 3-4 zinnen).
            2. Tot 5 concrete en uitvoerbare actiepunten voor de gebruiker te identificeren. Wijs aan elk actiepunt een prioriteit toe ('High', 'Medium', of 'Low').
            3. Bedenk één relevante, open vervolgvraag die de gebruiker zou kunnen stellen om dieper op het onderwerp in te gaan.
            ${userContextPrompts[effectiveLang]}

            Geef je antwoord als een JSON-object met de volgende structuur:
            {
              "summary": "Jouw samenvatting hier.",
              "actions": [
                {"text": "Actiepunt 1", "priority": "High"},
                {"text": "Actiepunt 2", "priority": "Medium"}
              ],
              "suggestedQuestion": "Jouw voorgestelde vervolgvraag hier."
            }

            Conversatie:
            ---
            ${historyString}
            ---
        `,
        en: `
            Analyze the following chat conversation. Your task is to:
            1. Write a concise, running summary of the entire conversation so far (maximum 3-4 sentences).
            2. Identify up to 5 concrete and actionable items for the user. Assign a priority to each action item ('High', 'Medium', or 'Low').
            3. Come up with one relevant, open-ended follow-up question the user could ask to dive deeper into the topic.
            ${userContextPrompts[effectiveLang]}
            
            Provide your response as a JSON object with the following structure:
            {
              "summary": "Your summary here.",
              "actions": [
                {"text": "Action item 1", "priority": "High"},
                {"text": "Action item 2", "priority": "Medium"}
              ],
              "suggestedQuestion": "Your suggested follow-up question here."
            }

            Conversation:
            ---
            ${historyString}
            ---
        `,
        de: `
            Analysieren Sie die folgende Chat-Konversation. Ihre Aufgabe ist es:
            1. Eine prägnante, fortlaufende Zusammenfassung des gesamten bisherigen Gesprächs zu schreiben (maximal 3-4 Sätze).
            2. Bis zu 5 konkrete und umsetzbare Aktionspunkte für den Benutzer zu identifizieren. Weisen Sie jedem Aktionspunkt eine Priorität zu ('High', 'Medium' oder 'Low').
            3. Eine relevante, offene Folgefrage zu entwickeln, die der Benutzer stellen könnte, um tiefer in das Thema einzutauchen.
            ${userContextPrompts[effectiveLang]}
            
            Geben Sie Ihre Antwort als JSON-Objekt mit der folgenden Struktur:
            {
              "summary": "Ihre Zusammenfassung hier.",
              "actions": [
                {"text": "Aktionspunkt 1", "priority": "High"},
                {"text": "Aktionspunkt 2", "priority": "Medium"}
              ],
              "suggestedQuestion": "Ihre vorgeschlagene Folgefrage hier."
            }

            Gespräch:
            ---
            ${historyString}
            ---
        `,
    };

    const prompt = prompts[effectiveLang];

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
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
                                },
                                required: ["text", "priority"]
                            }
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

export const generateMotivationalActionsPodcast = async (actions: ActionItem[], language: Language, userContext: string): Promise<string> => {
    if (!actions || actions.length === 0) {
        throw new Error(language === 'nl' ? "Kan geen actieplan genereren zonder acties." : "Cannot generate action plan without actions.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const effectiveLang = language;
    const actionContext = actions.map(a => `- ${a.text} (Prioriteit: ${a.priority})`).join('\n');
    const userContextPrompts = {
      nl: userContext ? `\n\nSpeciale opmerking van de gebruiker om te overwegen: "${userContext}"` : '',
      en: userContext ? `\n\nSpecial note from the user to consider: "${userContext}"` : '',
      de: userContext ? `\n\nBesonderer Hinweis des Benutzers zu berücksichtigen: "${userContext}"` : '',
    };
    
    const prompts = {
      nl: `
          Je bent een extreem positieve en motiverende coach.
          Jouw taak is om de volgende actiepunten om te zetten in een inspirerende en energieke podcast-afsluiting.
          Moedig de gebruiker aan en geef ze het vertrouwen dat ze deze stappen kunnen zetten. Spreek ze direct aan.
          Begin met een opbeurende opening.
          Verwerk de actiepunten op een natuurlijke en motiverende manier in je verhaal.
          ${userContextPrompts[effectiveLang]}
          Sluit af met een krachtige, onvergetelijke, motiverende boodschap.
          Alle output moet in het Nederlands zijn. Gebruik geen markdown zoals ** of *.

          Dit zijn de actiepunten:
          ${actionContext}
      `,
      en: `
          You are an extremely positive and motivational coach.
          Your task is to transform the following action items into an inspiring and energetic podcast-style closing.
          Encourage the user and give them confidence that they can take these steps. Address them directly.
          Start with an uplifting opening.
          Weave the action items into your narrative naturally and motivationally.
          ${userContextPrompts[effectiveLang]}
          End with a powerful, unforgettable, motivational message.
          All output must be in English. Do not use markdown like ** or *.

          Here are the action items:
          ${actionContext}
      `,
      de: `
          Sie sind ein extrem positiver und motivierender Coach.
          Ihre Aufgabe ist es, die folgenden Aktionspunkte in einen inspirierenden und energiegeladenen Podcast-Abschluss zu verwandeln.
          Ermutigen Sie den Benutzer und geben Sie ihm das Vertrauen, dass er diese Schritte unternehmen kann. Sprechen Sie ihn direkt an.
          Beginnen Sie mit einer aufmunternden Eröffnung.
          Weben Sie die Aktionspunkte auf natürliche und motivierende Weise in Ihre Erzählung ein.
          ${userContextPrompts[effectiveLang]}
          Beenden Sie mit einer kraftvollen, unvergesslichen, motivierenden Botschaft.
          Alle Ausgaben müssen auf Deutsch sein. Verwenden Sie kein Markdown wie ** of *.

          Hier sind die Aktionspunkte:
          ${actionContext}
      `,
    };

    const prompt = prompts[effectiveLang];

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

export const generateChatPodcastSummary = async ({ history, category, role, language, userContext }: { history: ChatMessage[], category: Category, role: RoleTemplate, language: Language, userContext: string }): Promise<string> => {
    if (history.length === 0) {
        throw new Error(language === 'nl' ? "Kan geen podcast genereren zonder gesprek." : "Cannot generate podcast without a conversation.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');
    
    const effectiveLang = language;
    const userContextPrompts = {
      nl: userContext ? `\n\nNeem ook de volgende notitie van de gebruiker mee: "${userContext}"` : '',
      en: userContext ? `\n\nAlso incorporate the following note from the user: "${userContext}"` : '',
      de: userContext ? `\n\nBerücksichtigen Sie auch die folgende Notiz des Benutzers: "${userContext}"` : '',
    };
    
    const prompts = {
      nl: `
          Je bent een podcast-host.
          Maak een KORTE, bondige, verhalende samenvatting van de volgende strategiesessie. De samenvatting moet ongeveer 150 woorden zijn.
          Weef de kern van het gesprek (vragen, antwoorden, rol "${role.title[language]}", expertise "${category.title[language]}") samen tot een inzichtelijk verhaal.
          ${userContextPrompts[effectiveLang]}
          Spreek direct tot de luisteraar. De output moet alleen de vloeiende, gespreksklare podcast-tekst zijn, in het Nederlands, zonder markdown zoals ** of *.

          Conversatie:
          ---
          ${historyString}
          ---
      `,
      en: `
          You are a podcast host.
          Create a SHORT, concise, narrative summary of the following strategy session. The summary should be around 150 words.
          Weave the core of the conversation (questions, answers, role "${role.title[language]}", expertise "${category.title[language]}") into an insightful story.
          ${userContextPrompts[effectiveLang]}
          Speak directly to the listener. The output must be only the flowing, ready-to-speak podcast text, in English, without markdown like ** or *.

          Conversation:
          ---
          ${historyString}
          ---
      `,
      de: `
          Sie sind ein Podcast-Moderator.
          Erstellen Sie eine KURZE, prägnante, erzählende Zusammenfassung der folgenden Strategiesitzung. Die Zusammenfassung sollte etwa 150 Wörter umfassen.
          Verweben Sie den Kern des Gesprächs (Fragen, Antworten, Rolle "${role.title[language]}", Expertise "${category.title[language]}") zu einer aufschlussreichen Geschichte.
          ${userContextPrompts[effectiveLang]}
          Sprechen Sie direkt zum Zuhörer. Die Ausgabe darf nur der fließende, sprechfertige Podcast-Text sein, auf Deutsch, ohne Markdown wie ** oder *.

          Gespräch:
          ---
          ${historyString}
          ---
      `,
    };

    const prompt = prompts[effectiveLang];

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

export const generateReadingTableLinks = async (history: ChatMessage[], language: Language, userContext: string): Promise<ReadingLink[]> => {
    if (history.length === 0) {
        return [];
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');
      
    const effectiveLang = language;
    const userContextPrompts = {
      nl: userContext ? `\n\nHoud ook rekening met deze extra context van de gebruiker: "${userContext}"` : '',
      en: userContext ? `\n\nAlso consider this additional context from the user: "${userContext}"` : '',
      de: userContext ? `\n\nBerücksichtigen Sie auch diesen zusätzlichen Kontext des Benutzers: "${userContext}"` : '',
    };

    const prompts = {
      nl: `
          Je bent een deskundige en uiterst zorgvuldige research-assistent. Analyseer de volgende chatconversatie.
          Jouw taak is om op basis van de besproken onderwerpen **3 tot 5 relevante, hoogwaardige online bronnen** te vinden.
          ${userContextPrompts[effectiveLang]}

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
      `,
      en: `
          You are an expert and extremely diligent research assistant. Analyze the following chat conversation.
          Your task is to find **3 to 5 relevant, high-quality online resources** based on the discussed topics.
          ${userContextPrompts[effectiveLang]}

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
      `,
      de: `
          Sie sind ein erfahrener und äußerst sorgfältiger Forschungsassistent. Analysieren Sie die folgende Chat-Konversation.
          Ihre Aufgabe ist es, **3 bis 5 relevante, qualitativ hochwertige Online-Ressourcen** zu den besprochenen Themen zu finden.
          ${userContextPrompts[effectiveLang]}

          **SEHR WICHTIGE REGELN:**
          1.  **QUALITÄT VOR QUANTITÄT:** Es ist besser, 3 ausgezeichnete, funktionierende Links bereitzustellen als 5 irrelevante oder defekte Links.
          2.  **ÜBERPRÜFEN SIE JEDEN LINK:** Überprüfen Sie, ob jede URL tatsächlich funktioniert und direkt zu einer öffentlich zugänglichen Webseite mit dem Artikel oder den Informationen führt.
          3.  **KEINE UNGÜLTIGEN LINKS:** Geben Sie absolut KEINE Links zu 404-Seiten, Suchergebnissen, Website-Homepages oder Seiten an, die eine Anmeldung erfordern. Der Link muss zur spezifischen Inhaltsseite führen.
          4.  **RUF:** Bevorzugen Sie Quellen, die für ihre Zuverlässigkeit zum jeweiligen Thema bekannt sind.
          5.  **TITEL:** Geben Sie für jede Ressource den genauen, beschreibenden Titel der Seite an.

          Geben Sie Ihre Antwort als EINZIGES, gültiges JSON-Array von Objekten. Jedes Objekt MUSS die Schlüssel "title" und "url" haben.
          Geben Sie NUR das JSON-Array zurück, ohne zusätzlichen Text, Erklärungen oder Markdown.

          Gespräch:
          ---
          ${historyString}
          ---
      `,
    };

    const prompt = prompts[effectiveLang];

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

export const generateBookRecommendations = async (history: ChatMessage[], language: Language, userContext: string): Promise<Book[]> => {
    if (history.length < 2) {
        return [];
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');

    const effectiveLang = language;
    const userContextPrompts = {
      nl: userContext ? `\n\nHoud ook rekening met deze extra context van de gebruiker bij het kiezen van boeken: "${userContext}"` : '',
      en: userContext ? `\n\nAlso consider this additional context from the user when choosing books: "${userContext}"` : '',
      de: userContext ? `\n\nBerücksichtigen Sie bei der Auswahl der Bücher auch diesen zusätzlichen Kontext des Benutzers: "${userContext}"` : '',
    };

    const prompts = {
      nl: `
          Je bent een deskundige literair conservator. Analyseer de volgende chatconversatie en vind **3 tot 5 zeer relevante boeken** over de besproken onderwerpen.
          ${userContextPrompts[effectiveLang]}

          **REGELS:**
          1.  **Kwaliteit en Relevantie:** Kies boeken die diepgaand en direct relevant zijn voor het gespreksonderwerp.
          2.  **Output Formaat:** Geef je antwoord als een ENKEL, geldig JSON-array van objecten.
          3.  **URL Formaat:** Voor elke boek, maak een zoek-URL voor amazon.com. Het formaat moet zijn: \`https://www.amazon.com/s?k=TITEL+AUTEUR\`. Vervang spaties door '+'.

          Elk object in de array MOET exact de volgende sleutels hebben:
          - "title": "De volledige titel van het boek"
          - "author": "De naam van de auteur(s)"
          - "amazonSearchUrl": "De geformatteerde Amazon zoek-URL"

          Geef ALLEEN de JSON-array terug, zonder extra tekst of markdown.

          Conversatie:
          ---
          ${historyString}
          ---
      `,
      en: `
          You are an expert literary curator. Analyze the following chat conversation and find **3 to 5 highly relevant books** on the discussed topics.
          ${userContextPrompts[effectiveLang]}

          **RULES:**
          1.  **Quality and Relevance:** Choose books that are insightful and directly relevant to the conversation topic.
          2.  **Output Format:** Provide your response as a SINGLE, valid JSON array of objects.
          3.  **URL Format:** For each book, create a search URL for amazon.com. The format must be: \`https://www.amazon.com/s?k=TITLE+AUTHOR\`. Replace spaces with '+'.

          Each object in the array MUST have the exact following keys:
          - "title": "The full title of the book"
          - "author": "The name of the author(s)"
          - "amazonSearchUrl": "The formatted Amazon search URL"

          Return ONLY the JSON array, with no extra text or markdown.

          Conversation:
          ---
          ${historyString}
          ---
      `,
      de: `
          Sie sind ein erfahrener Literaturkurator. Analysieren Sie die folgende Chat-Konversation und finden Sie **3 bis 5 hochrelevante Bücher** zu den besprochenen Themen.
          ${userContextPrompts[effectiveLang]}

          **REGELN:**
          1.  **Qualität und Relevanz:** Wählen Sie Bücher, die aufschlussreich und direkt relevant für das Gesprächsthema sind.
          2.  **Ausgabeformat:** Geben Sie Ihre Antwort als EINZIGES, gültiges JSON-Array von Objekten an.
          3.  **URL-Format:** Erstellen Sie für jedes Buch eine Such-URL für amazon.com. Das Format muss sein: \`https://www.amazon.com/s?k=TITEL+AUTOR\`. Ersetzen Sie Leerzeichen durch '+'.

          Jedes Objekt im Array MUSS genau die folgenden Schlüssel haben:
          - "title": "Der vollständige Titel des Buches"
          - "author": "Der Name des Autors/der Autoren"
          - "amazonSearchUrl": "Die formatierte Amazon-Such-URL"

          Geben Sie NUR das JSON-Array zurück, ohne zusätzlichen Text oder Markdown.

          Gespräch:
          ---
          ${historyString}
          ---
      `,
    };
    
    const prompt = prompts[effectiveLang];

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.3,
            }
        });

        const cleanedText = cleanJsonString(response.text);
        if (cleanedText) {
            const parsedBooks: Book[] = JSON.parse(cleanedText);
            if (Array.isArray(parsedBooks)) {
                return parsedBooks;
            }
        }
        return [];
    } catch (error) {
        console.error('Error generating book recommendations:', error);
        throw new Error(language === 'nl' ? 'Kon geen boekaanbevelingen genereren.' : 'Could not generate book recommendations.');
    }
};

export const generateInfographic = async (history: ChatMessage[], language: Language, userContext: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const historyString = history
      .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
      .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`).join('\n\n');

    const effectiveLang = language;
    const userContextPrompts = {
      nl: userContext ? `Daarnaast heeft de gebruiker de volgende notities meegegeven om te verwerken:\n---GEBRUIKERSNOTITIES---\n${userContext}\n----------------------` : '',
      en: userContext ? `Additionally, the user provided the following notes to incorporate:\n---USER NOTES---\n${userContext}\n----------------------` : '',
      de: userContext ? `Zusätzlich hat der Benutzer die folgenden Notizen zur Einarbeitung bereitgestellt:\n---BENUTZERHINWEISE---\n${userContext}\n----------------------` : '',
    };

    const prompts = {
      nl: `
        U bent een professionele grafisch ontwerper, gespecialiseerd in infographics voor bedrijfspresentaties.
        Uw taak is om een heldere en boeiende infographic in de stijl van een PowerPoint-dia (16:9 landschap) te creëren.

        **Onderwerp voor de Infographic:**
        De infographic moet de kernconcepten, bevindingen en het actieplan van de volgende strategiesessie visualiseren:
        ---
        ${historyString}
        ---
        ${userContextPrompts[effectiveLang]}

        **Kerninstructies:**
        1.  **Visualiseer het 'Hoe' of 'Wat':** Creëer één duidelijke, centrale visual (zoals een centraal diagram, stroomschema of metaforische scène) die de essentie van het onderwerp uitlegt.
        2.  **Helderheid en Verhaal:** De visual moet in één oogopslag te begrijpen zijn. Het moet een verhaal vertellen. Ga ervan uit dat het wordt gebruikt in een presentatie met minimale verklarende tekst op de dia zelf.
        3.  **Professionele Esthetiek:** Gebruik een modern, professioneel kleurenschema (bijv. met zakelijke blauw-, groenblauw- en grijstinten).
        4.  **Eenvoudige Iconen & Hiërarchie:** Gebruik minimalistische iconen en duidelijke typografie om de hoofdvisual te ondersteunen. Zorg voor een duidelijke visuele hiërarchie.
        5.  **Taal:** Alle tekst op de infographic MOET in het Nederlands zijn.
      `,
      en: `
        You are a professional graphic designer specializing in infographics for corporate presentations.
        Your task is to create a clean and engaging PowerPoint slide-style infographic (16:9 landscape).

        **Topic for the Infographic:**
        The infographic should visualize the core concepts, findings, and action plan from the following strategy session:
        ---
        ${historyString}
        ---
        ${userContextPrompts[effectiveLang]}

        **Core Instructions:**
        1.  **Visualize the 'How' or 'What':** Create a single, clear primary visual (like a central diagram, flowchart, or metaphorical scene) that explains the essence of the topic.
        2.  **Clarity and Storytelling:** The visual must be understandable at a glance. It should tell a story. Assume it will be used in a presentation with minimal explanatory text on the slide itself.
        3.  **Professional Aesthetic:** Use a modern, professional color scheme (e.g., using corporate blues, teals, and greys).
        4.  **Simple Icons & Hierarchy:** Use minimalist icons and clear typography to support the main visual. Ensure a clear visual hierarchy.
        5.  **Language:** All text on the infographic MUST be in English.
      `,
      de: `
        Sie sind ein professioneller Grafikdesigner, der auf Infografiken für Unternehmenspräsentationen spezialisiert ist.
        Ihre Aufgabe ist es, eine saubere und ansprechende Infografik im Stil einer PowerPoint-Folie (16:9 Querformat) zu erstellen.

        **Thema für die Infografik:**
        Die Infografik soll die Kernkonzepte, Erkenntnisse und den Aktionsplan aus der folgenden Strategiesitzung visualisieren:
        ---
        ${historyString}
        ---
        ${userContextPrompts[effectiveLang]}

        **Kernanweisungen:**
        1.  **Visualisieren Sie das 'Wie' oder 'Was':** Erstellen Sie ein einziges, klares Hauptbild (wie ein zentrales Diagramm, Flussdiagramm oder eine metaphorische Szene), das die Essenz des Themas erklärt.
        2.  **Klarheit und Storytelling:** Das Bild muss auf einen Blick verständlich sein. Es sollte eine Geschichte erzählen. Gehen Sie davon aus, dass es in einer Präsentation mit minimalem erläuterndem Text auf der Folie selbst verwendet wird.
        3.  **Professionelle Ästhetik:** Verwenden Sie ein modernes, professionelles Farbschema (z. B. mit Unternehmensblau-, Petrol- und Grautönen).
        4.  **Einfache Symbole & Hierarchie:** Verwenden Sie minimalistische Symbole und eine klare Typografie, um das Hauptbild zu unterstützen. Stellen Sie eine klare visuelle Hierarchie sicher.
        5.  **Sprache:** Der gesamte Text auf der Infografik MUSS auf Deutsch sein.
      `,
    };

    const prompt = prompts[effectiveLang];

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        } else {
            throw new Error("No image was generated by the API.");
        }
    } catch (error) {
        console.error('Error generating infographic:', error);
        throw new Error(language === 'nl' ? 'Kon de infographic niet genereren.' : 'Could not generate the infographic.');
    }
};

export const generateTedTalks = async (history: ChatMessage[], language: Language, userContext: string): Promise<TedTalkResponse> => {
  if (history.length < 2) {
    return { talks: [] };
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const historyString = history
    .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
    .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`)
    .join('\n\n');

  const effectiveLang = language;
  const userContextPrompts = {
    nl: userContext ? `\n\nHoud ook rekening met deze extra context van de gebruiker: "${userContext}"` : '',
    en: userContext ? `\n\nAlso consider this additional context from the user: "${userContext}"` : '',
    de: userContext ? `\n\nBerücksichtigen Sie auch diesen zusätzlichen Kontext des Benutzers: "${userContext}"` : '',
  };

  const jsonStructurePrompt = {
    nl: `
      **BELANGRIJK:** Geef je antwoord als een ENKEL, geldig JSON-object. Geef ALLEEN het JSON-object terug, zonder markdown of andere tekst. Het object MOET deze structuur hebben:
      {
        "talks": [
          {
            "title": "De volledige titel van de talk",
            "speaker": "De naam van de spreker",
            "publicationDate": "Maand en Jaar, bijv. 'Oktober 2023'",
            "summary": "Een beknopte samenvatting van 2 zinnen."
          }
        ],
        "relatedSuggestions": ["een gerelateerd onderwerp", "nog een gerelateerd onderwerp"]
      }
    `,
    en: `
      **IMPORTANT:** Provide your response as a SINGLE, valid JSON object. Return ONLY the JSON object, without any markdown or other text. The object MUST have this structure:
      {
        "talks": [
          {
            "title": "The full title of the talk",
            "speaker": "The name of the speaker",
            "publicationDate": "Month and Year, e.g., 'October 2023'",
            "summary": "A concise 2-sentence summary."
          }
        ],
        "relatedSuggestions": ["a related topic", "another related topic"]
      }
    `,
    de: `
      **WICHTIG:** Geben Sie Ihre Antwort als EINZIGES, gültiges JSON-Objekt zurück. Geben Sie NUR das JSON-Objekt zurück, ohne Markdown oder anderen Text. Das Objekt MUSS diese Struktur haben:
      {
        "talks": [
          {
            "title": "Der vollständige Titel des Vortrags",
            "speaker": "Der Name des Sprechers",
            "publicationDate": "Monat und Jahr, z.B. 'Oktober 2023'",
            "summary": "Eine prägnante Zusammenfassung von 2 Sätzen."
          }
        ],
        "relatedSuggestions": ["ein verwandtes Thema", "ein weiteres verwandtes Thema"]
      }
    `,
  };

  const prompts = {
    nl: `
        Je bent een deskundige contentcurator gespecialiseerd in TED Talks. Analyseer de volgende chatconversatie.
        Jouw taak is om **maximaal 3 van de meest relevante TED of TEDx talks** te vinden die dieper ingaan op de besproken onderwerpen.
        ${userContextPrompts[effectiveLang]}

        Geef voor elke talk de titel, spreker, publicatiedatum (maand en jaar), en een korte samenvatting (2 zinnen).
        
        Sorteer de resultaten eerst op RELEVANTIE, daarna op meest recent.
        Als je geen direct relevante talks kunt vinden, geef dan een lege "talks"-array terug en vul de "relatedSuggestions"-array met 2-3 gerelateerde onderwerpen waarover wel TED talks bestaan.

        Conversatie:
        ---
        ${historyString}
        ---
        ${jsonStructurePrompt[effectiveLang]}
    `,
    en: `
        You are an expert content curator specializing in TED Talks. Analyze the following chat conversation.
        Your task is to find **up to 3 of the most relevant TED or TEDx talks** that delve deeper into the discussed topics.
        ${userContextPrompts[effectiveLang]}
        
        For each talk, provide the title, speaker, publication date (month and year), and a short summary (2 sentences).

        Sort the results by RELEVANCE first, then by most recent.
        If you cannot find any directly relevant talks, return an empty "talks" array and populate the "relatedSuggestions" array with 2-3 related topics that DO have TED talks.

        Conversation:
        ---
        ${historyString}
        ---
        ${jsonStructurePrompt[effectiveLang]}
    `,
    de: `
        Sie sind ein erfahrener Content-Kurator, der sich auf TED Talks spezialisiert hat. Analysieren Sie die folgende Chat-Konversation.
        Ihre Aufgabe ist es, **bis zu 3 der relevantesten TED- oder TEDx-Vorträge** zu finden, die die besprochenen Themen vertiefen.
        ${userContextPrompts[effectiveLang]}

        Geben Sie für jeden Vortrag den Titel, den Sprecher, das Veröffentlichungsdatum (Monat und Jahr) und eine kurze Zusammenfassung (2 Sätze) an.

        Sortieren Sie die Ergebnisse zuerst nach RELEVANZ, dann nach Aktualität.
        Wenn Sie keine direkt relevanten Vorträge finden können, geben Sie ein leeres "talks"-Array zurück und füllen Sie das "relatedSuggestions"-Array mit 2-3 verwandten Themen, zu denen es TED-Vorträge gibt.

        Gespräch:
        ---
        ${historyString}
        ---
        ${jsonStructurePrompt[effectiveLang]}
    `,
  };

  const prompt = prompts[effectiveLang];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    const jsonText = cleanJsonString(response.text);
    const parsedResponse: { talks: Omit<TedTalk, 'youtubeSearchUrl'>[], relatedSuggestions?: string[] } = JSON.parse(jsonText);
    
    const fullResponse: TedTalkResponse = {
        talks: [],
        relatedSuggestions: parsedResponse.relatedSuggestions
    };

    if (parsedResponse.talks) {
      // Add the youtubeSearchUrl to each talk
      fullResponse.talks = parsedResponse.talks.map(talk => {
          const searchQuery = encodeURIComponent(`Ted talk ${talk.speaker} ${talk.title}`);
          return {
              ...talk,
              youtubeSearchUrl: `https://www.youtube.com/results?search_query=${searchQuery}`
          };
      });
    }

    return fullResponse;

  } catch (error) {
    console.error('Error generating TED Talk recommendations:', error);
    throw new Error(language === 'nl' ? 'Kon geen TED Talk-aanbevelingen genereren.' : 'Could not generate TED Talk recommendations.');
  }
};

export const generateLinkedInLearningCourses = async (history: ChatMessage[], language: Language, userContext: string): Promise<LinkedInLearningCourse[]> => {
  if (history.length < 2) {
    return [];
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  const historyString = history
    .filter(msg => !msg.parts[0].text.startsWith('[SYSTEM]'))
    .map(msg => `${msg.role === 'user' ? 'User' : 'Expert'}: ${msg.parts[0].text}`)
    .join('\n\n');

  const effectiveLang = language;
  const userContextPrompts = {
    nl: userContext ? `\n\nHoud ook rekening met deze extra context van de gebruiker: "${userContext}"` : '',
    en: userContext ? `\n\nAlso consider this additional context from the user: "${userContext}"` : '',
    de: userContext ? `\n\nBerücksichtigen Sie auch diesen zusätzlichen Kontext des Benutzers: "${userContext}"` : '',
  };

  const prompts = {
    nl: `
        Je bent een deskundige carrièrecoach gespecialiseerd in professionele ontwikkeling via LinkedIn Learning. Analyseer de volgende chatconversatie.
        Jouw taak is om **maximaal 3 van de meest relevante LinkedIn Learning cursussen** te vinden die dieper ingaan op de besproken onderwerpen.
        ${userContextPrompts[effectiveLang]}

        **Sorteer de resultaten op RELEVANTIE.**

        **Voor elke gevonden cursus, extraheer de volgende informatie:**
        1.  **title**: De volledige, officiële titel van de cursus.
        2.  **description**: Een beknopte, informatieve beschrijving van 1-2 zinnen van wat de cursus behandelt.
        3.  **url**: De volledige, werkende URL naar de cursus op linkedin.com/learning/.

        **BELANGRIJKE REGELS:**
        - Verifieer dat elke URL een geldige en directe link is naar een LinkedIn Learning cursus.
        - Geef je antwoord als een ENKEL, geldig JSON-array van objecten. Geef ALLEEN de JSON terug.

        Conversatie:
        ---
        ${historyString}
        ---
    `,
    en: `
        You are an expert career coach specializing in professional development via LinkedIn Learning. Analyze the following chat conversation.
        Your task is to find **up to 3 of the most relevant LinkedIn Learning courses** that delve deeper into the discussed topics.
        ${userContextPrompts[effectiveLang]}
        
        **Sort the results by RELEVANCE.**

        **For each course found, extract the following information:**
        1.  **title**: The full, official title of the course.
        2.  **description**: A concise, informative 1-2 sentence description of what the course covers.
        3.  **url**: The full, working URL to the course on linkedin.com/learning/.

        **IMPORTANT RULES:**
        - Verify that each URL is a valid and direct link to a LinkedIn Learning course.
        - Provide your response as a SINGLE, valid JSON array of objects. Return ONLY the JSON.

        Conversation:
        ---
        ${historyString}
        ---
    `,
    de: `
        Sie sind ein erfahrener Karrierecoach, der sich auf die berufliche Weiterbildung über LinkedIn Learning spezialisiert hat. Analysieren Sie die folgende Chat-Konversation.
        Ihre Aufgabe ist es, **bis zu 3 der relevantesten LinkedIn Learning-Kurse** zu finden, die die besprochenen Themen vertiefen.
        ${userContextPrompts[effectiveLang]}

        **Sortieren Sie die Ergebnisse nach RELEVANZ.**

        **Extrahieren Sie für jeden gefundenen Kurs die folgenden Informationen:**
        1.  **title**: Der vollständige, offizielle Titel des Kurses.
        2.  **description**: Eine prägnante, informative Beschreibung mit 1-2 Sätzen, was der Kurs behandelt.
        3.  **url**: Die vollständige, funktionierende URL zum Kurs auf linkedin.com/learning/.

        **WICHTIGE REGELN:**
        - Überprüfen Sie, ob jede URL ein gültiger und direkter Link zu einem LinkedIn Learning-Kurs ist.
        - Geben Sie Ihre Antwort als EINZIGES, gültiges JSON-Array von Objekten zurück. Geben Sie NUR das JSON zurück.

        Gespräch:
        ---
        ${historyString}
        ---
    `,
  };

  const prompt = prompts[effectiveLang];

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      }
    });

    const jsonText = cleanJsonString(response.text);
    return JSON.parse(jsonText) as LinkedInLearningCourse[];

  } catch (error) {
    console.error('Error generating LinkedIn Learning course recommendations:', error);
    throw new Error(language === 'nl' ? 'Kon geen LinkedIn Learning cursusaanbevelingen genereren.' : 'Could not generate LinkedIn Learning course recommendations.');
  }
};