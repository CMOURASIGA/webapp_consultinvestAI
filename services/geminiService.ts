import { GoogleGenAI } from "@google/genai";
import { WizardData, AIConfig, MarketPanoramaOutput } from '../types';
import { EngineResult } from '../lib/recommendationEngine';
import { AIService } from "./aiService";

/**
 * Implements exponential backoff for API calls to handle rate limits and transient errors.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      lastError = e;
      const errorMsg = e.message || "";
      if (errorMsg.includes('429') || errorMsg.includes('500') || errorMsg.toLowerCase().includes('resource_exhausted')) {
        const delay = Math.pow(i + 1, 2) * 3000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

function parseJsonSafe(text: string): any {
  const cleaned = text.trim()
    .replace(/^```json/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // Tenta extrair apenas o trecho entre chaves caso haja prefixos/sufixos
    const first = cleaned.indexOf('{');
    const last = cleaned.lastIndexOf('}');
    if (first >= 0 && last > first) {
      const slice = cleaned.slice(first, last + 1);
      return JSON.parse(slice);
    }
    throw err;
  }
}

export const geminiService: AIService = {
  async getEducationalChatResponse(history: {role: string, parts: string}[], config: AIConfig) {
    const apiKey = (config.apiKey || '').trim();
    if (!apiKey) throw new Error('API Key não encontrada para o provedor selecionado.');
    const ai = new GoogleGenAI({ apiKey });
    const contents = history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.parts }]
    }));

    const result = await ai.models.generateContent({
      model: config.model,
      contents,
      config: {
        temperature: config.temperature || 0.7,
      },
      systemInstruction: "Você é o Mentor Reserve Advisor. Educacional e técnico.",
    });

    return result.text || "";
  },

  async getMarketPanorama(marketData: any, config: AIConfig): Promise<{ data: MarketPanoramaOutput, sources: any[] }> {
    const apiKey = (config.apiKey || '').trim();
    if (!apiKey) throw new Error('API Key não encontrada para o provedor selecionado.');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `GERE UM JSON DE PANORAMA DE MERCADO para ${marketData.country} HOJE (${new Date().toLocaleDateString('pt-BR')}).
    Use a ferramenta de busca para encontrar dados REAIS e ATUAIS.
    
    O JSON deve seguir estritamente o esquema fornecido e incluir:
    1. Resumo macroeconômico atual.
    2. Taxa de juros (Selic para BR, Fed Funds para EUA).
    3. Inflação anualizada (IPCA para BR, CPI para EUA).
    4. 3 Ações com Ticker, Nome, Preço aproximado e variação do dia.
    5. 2 Opções de Renda Fixa atrativas no cenário atual.
    6. 2 Criptoativos relevantes (BTC e outro).
    
    RESPOSTA APENAS EM JSON VÁLIDO.`;

    try {
      return await withRetry(async () => {
        const result = await ai.models.generateContent({
          model: config.model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
          tools: [{ googleSearch: {} }]
        });
        
        const text = result.text;
        if (!text) throw new Error("A IA retornou uma resposta vazia.");
        
        return {
          data: parseJsonSafe(text),
          sources: result.candidates?.[0]?.groundingMetadata?.retrievalQueries || []
        };
      });
    } catch (e: any) {
      console.error("Erro no Panorama (Busca):", e);
      return await withRetry(async () => {
        const result = await ai.models.generateContent({
          model: config.model,
          contents: [{ role: 'user', parts: [{ text: prompt + " (Nota: Ignore a ferramenta de busca e use seu conhecimento interno mais recente)" }]}],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });
        const text = result.text || "{}";
        return {
          data: parseJsonSafe(text),
          sources: []
        };
      });
    }
  },

  async getLLMExplanation(userData: WizardData, engineResult: EngineResult, config: AIConfig): Promise<any> {
    const apiKey = (config.apiKey || '').trim();
    if (!apiKey) throw new Error('API Key não encontrada para o provedor selecionado.');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Aja como um Consultor de Investimentos Sênior. 
    CONTEXTO DO USUÁRIO:
    - Valor: ${userData.value} ${userData.currency}
    - Perfil: ${userData.riskProfile}
    - Objetivos: ${userData.investmentObjectives.join(', ')}
    - Horizonte: ${userData.horizon}
    - País: ${userData.country}
    - Liquidez Necessária: ${userData.liquidityDaily ? 'Sim' : 'Não'}

    TAREFA:
    Gere uma alocação educacional realística. Divida o valor de ${userData.value} entre diferentes classes de ativos.
    Para cada classe, forneça detalhes profundos (pros, cons, liquidez, risco).
    Não use templates. Seja específico para o montante de ${userData.value}.`;

    const result = await ai.models.generateContent({
      model: config.model,
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    
    const text = result.text || "{}";
    return parseJsonSafe(text);
  }
};
