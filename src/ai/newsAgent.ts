import { SYSTEM_PROMPTS } from './prompts';
import { NewsIntelligenceResult, WebSourceCitation } from '../types';

export class NewsAgent {
  /**
   * Run server-side News Intelligence search using Gemini + Google Search Grounding
   */
  static async executeNewsQuery(query: string, apiKey?: string): Promise<NewsIntelligenceResult> {
    const keyToUse = apiKey || process.env.GEMINI_API_KEY;
    if (!keyToUse) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
    }

    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({
      apiKey: keyToUse,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const promptText = `Find the breaking news and current status for: "${query}".
Provide recent bullet points, timestamps, key confirmed facts, and authoritative news citations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction: SYSTEM_PROMPTS.NEWS,
        tools: [{ googleSearch: {} }],
      },
    });

    const rawText = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: WebSourceCitation[] = groundingChunks
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Breaking News Outlet',
        url: chunk.web?.uri || '',
        snippet: chunk.web?.title,
      }))
      .filter((s: WebSourceCitation) => Boolean(s.url));

    if (sources.length === 0) {
      sources.push({
        title: 'Google News Breaking Index',
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        snippet: 'Real-time news sources',
      });
    }

    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const keyUpdates: string[] = [];

    for (const line of lines) {
      if (line.startsWith('-') || line.startsWith('*') || /^\d+\./.test(line)) {
        keyUpdates.push(line.replace(/^[-*\d.]+\s*/, ''));
      }
    }

    return {
      mode: 'news',
      query,
      latestInformation: rawText.slice(0, 350) + '...',
      keyUpdates: keyUpdates.length > 0 ? keyUpdates.slice(0, 5) : [rawText],
      whatWeKnow: rawText,
      sources,
      timestamp: new Date().toISOString(),
    };
  }
}
