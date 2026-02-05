import OpenAI from "openai";
import { WizardData, AIConfig, MarketPanoramaOutput } from "../types";
import { EngineResult } from "../lib/recommendationEngine";
import { getDashboardAssets, getMarketData } from "../lib/marketDataProvider";
import { AIService } from "./aiService";

const parseJsonSafe = (text: string): any => {
  const cleaned = text.trim()
    .replace(/^```json/i, '')
    .replace(/```$/, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first >= 0 && last > first) {
      return JSON.parse(cleaned.slice(first, last + 1));
    }
    throw new Error("A resposta do modelo não retornou um JSON válido.");
  }
};

const extractText = (content: any): string => {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => c?.text || c?.content || "").join("");
  }
  return String(content);
};

const getClient = (config: AIConfig) => {
  const apiKey = (config.apiKey || "").trim();
  if (!apiKey) throw new Error("API Key não encontrada para o provedor selecionado.");
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

const ensurePanoramaShape = (country: string, parsed: any): MarketPanoramaOutput => {
  const market = getMarketData(country);
  const assets = getDashboardAssets(country);
  const stockFallback = assets.filter(a => a.category === "ACAO").slice(0, 3).map(a => ({
    symbol: a.symbol,
    name: a.name,
    price: a.price,
    variation: a.variation,
    volatility: a.volatility || "MEDIA",
    liquidity: a.liquidity || "ALTA",
    why_in_dashboard: a.why_in_dashboard || "Ativo monitorado (estimado).",
    risk_note: a.risk_note || "Confirme dados recentes antes de decidir."
  }));
  const fixedFallback = assets.filter(a => a.category === "RENDA_FIXA").slice(0, 2).map(a => ({
    type: "CDB",
    indexer: "CDI",
    liquidity: "DIARIA",
    tax_benefit: "TRIBUTADO",
    why_in_dashboard: a.name || "Renda fixa estimada.",
    risk_note: "Verifique emissor e condições atuais."
  }));
  const criptoFallback = assets.filter(a => a.category === "CRIPTO").slice(0, 2).map(a => ({
    symbol: a.symbol,
    name: a.name,
    price: a.price,
    volatility: "ALTA",
    marketRelevance: "Alta",
    risk_note: "Ativo volátil (estimado)."
  }));

  const safe = parsed || {};
  const overview = safe.market_overview || {};
  const sections = safe.sections || {};

  return {
    dashboardType: safe.dashboardType || "PANORAMA_MERCADO",
    market_overview: {
      summary: overview.summary || `Cenário estimado para ${country}: juros ${market.baseRate}%, inflação ${market.inflation}%.`,
      interestRate: overview.interestRate ?? market.baseRate ?? null,
      inflation: overview.inflation ?? market.inflation ?? null,
      volatility: overview.volatility || market.volatility || "MEDIA",
      notes: overview.notes || market.notes || null
    },
    sections: {
      acoes_em_acompanhamento: sections.acoes_em_acompanhamento && sections.acoes_em_acompanhamento.length ? sections.acoes_em_acompanhamento : stockFallback,
      renda_fixa_em_destaque: sections.renda_fixa_em_destaque && sections.renda_fixa_em_destaque.length ? sections.renda_fixa_em_destaque : fixedFallback,
      cripto_em_acompanhamento: sections.cripto_em_acompanhamento && sections.cripto_em_acompanhamento.length ? sections.cripto_em_acompanhamento : criptoFallback,
      outros_temas: sections.outros_temas || []
    },
    general_warnings: safe.general_warnings || ["Dados estimados. Consulte fontes atualizadas."],
    disclaimer: safe.disclaimer || "Conteúdo educacional; não constitui recomendação."
  };
};

// Fallback quando o modelo não retorna o esquema esperado
const buildFallbackOutput = (userData: WizardData, engineResult: EngineResult) => {
  const riskSplit = {
    Conservador: { immediate: 50, stability: 35, growth: 15 },
    Moderado: { immediate: 30, stability: 40, growth: 30 },
    Arrojado: { immediate: 15, stability: 35, growth: 50 },
  }[userData.riskProfile] || { immediate: 30, stability: 40, growth: 30 };

  const assets = getDashboardAssets(userData.country);
  const etfs = assets.filter(a => a.category === 'ETF');
  const stocks = assets.filter(a => a.category === 'ACAO');
  const fiis = assets.filter(a => a.category === 'RENDA_FIXA');
  const cryptos = assets.filter(a => a.category === 'CRIPTO');

  const makeRecs = (items: string[], bucketPct: number, label: string) => {
    if (!items.length || bucketPct <= 0) return [];
    const perItem = Math.round((bucketPct / items.length) * 100) / 100;
    return items.map(name => ({
      title: name,
      why: `${label}: alinhado ao perfil ${userData.riskProfile} e horizonte ${userData.horizon}.`,
      pros: [
        label === "Liquidez" ? "Acesso rápido ao capital" : "Potencial de retorno ajustado ao risco",
        "Diversificação da carteira"
      ],
      cons: [
        label === "Crescimento" ? "Maior volatilidade de curto prazo" : "Retorno limitado vs. renda variável"
      ],
      liquidity: label === "Liquidez" ? "Alta" : "Variável",
      risk: userData.riskProfile,
      term: userData.horizon,
      allocationPercent: perItem
    }));
  };

  const pick = <T,>(list: T[], qty: number) => list.slice(0, qty);

  const detailedGrowth: string[] = [];
  pick(etfs, 2).forEach(etf => detailedGrowth.push(`${etf.symbol} (${etf.name})`));
  pick(stocks, 2).forEach(stk => detailedGrowth.push(`${stk.symbol} (${stk.name})`));
  pick(cryptos, 1).forEach(c => detailedGrowth.push(`${c.symbol} (${c.name})`));

  const recs = [
    ...makeRecs(engineResult.layerStructure.immediate, riskSplit.immediate, "Liquidez"),
    ...makeRecs(engineResult.layerStructure.stability, riskSplit.stability, "Estabilidade"),
    ...makeRecs(engineResult.layerStructure.growth, riskSplit.growth * 0.4, "Crescimento"),
    ...makeRecs(detailedGrowth, riskSplit.growth * 0.6, "Crescimento (Escolhas)")
  ];

  return {
    summary: `Plano educativo gerado automaticamente para ${userData.value} ${userData.currency} com perfil ${userData.riskProfile}.`,
    recommendations: recs,
    alternatives: [],
    assumptions: [],
    disclaimer: "Diagnóstico educacional. Não constitui recomendação de investimento."
  };
};

export const openAIService: AIService = {
  async getEducationalChatResponse(history, config) {
    const client = getClient(config);
    const messages = history.map(h => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.parts
    }));

    const result = await client.chat.completions.create({
      model: config.model,
      messages,
      temperature: config.temperature ?? 0.7
    });

    const content = result.choices?.[0]?.message?.content;
    return extractText(content);
  },

  async getMarketPanorama(marketData: any, config: AIConfig): Promise<{ data: MarketPanoramaOutput, sources: any[] }> {
    const client = getClient(config);
    const today = new Date().toLocaleDateString("pt-BR");

    const prompt = `Gere um JSON de PANORAMA DE MERCADO para ${marketData.country} hoje (${today}).
Use o esquema exato:
{
  "dashboardType": "PANORAMA_MERCADO",
  "market_overview": {
    "summary": "texto",
    "interestRate": number,
    "inflation": number,
    "volatility": "BAIXA" | "MEDIA" | "ALTA",
    "notes": "texto"
  },
  "sections": {
    "acoes_em_acompanhamento": [
      { "symbol": "VALE3", "name": "Vale", "price": 68.2, "variation": -0.5, "volatility": "MEDIA", "liquidity": "ALTA", "why_in_dashboard": "texto", "risk_note": "texto" }
    ],
    "renda_fixa_em_destaque": [
      { "type": "CDB", "indexer": "CDI", "liquidity": "DIARIA", "tax_benefit": "TRIBUTADO", "why_in_dashboard": "texto", "risk_note": "texto" }
    ],
    "cripto_em_acompanhamento": [
      { "symbol": "BTC", "name": "Bitcoin", "price": 340000, "volatility": "ALTA", "marketRelevance": "Alta", "risk_note": "texto" }
    ],
    "outros_temas": []
  },
  "general_warnings": ["texto"],
  "disclaimer": "texto"
}
Responda apenas com JSON válido seguindo esse esquema. Se algum dado real não estiver disponível, preencha com estimativa coerente.`;

    const result = await client.chat.completions.create({
      model: config.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Você é um analista de mercado que responde somente em JSON válido." },
        { role: "user", content: prompt }
      ]
    });

    const content = result.choices?.[0]?.message?.content || "{}";
    const parsed = parseJsonSafe(extractText(content));
    const ensured = ensurePanoramaShape(marketData.country, parsed);
    return { data: ensured, sources: [] };
  },

  async getLLMExplanation(userData: WizardData, engineResult: EngineResult, config: AIConfig): Promise<any> {
    const client = getClient(config);

    const prompt = `Aja como um Consultor de Investimentos Sênior.
Contexto:
- Valor: ${userData.value} ${userData.currency}
- Perfil: ${userData.riskProfile}
- Objetivos: ${userData.investmentObjectives.join(", ")}
- Horizonte: ${userData.horizon}
- País: ${userData.country}
- Liquidez diária necessária: ${userData.liquidityDaily ? "Sim" : "Não"}

Tarefa:
Gere uma alocação educacional detalhada em JSON, seguindo o esquema LLMOutput.
Seja específico para o montante de ${userData.value}.`;

    const result = await client.chat.completions.create({
      model: config.model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Você responde apenas com JSON válido conforme o esquema LLMOutput." },
        { role: "user", content: prompt }
      ]
    });

    const content = result.choices?.[0]?.message?.content || "{}";
    const parsed = parseJsonSafe(extractText(content));
    if (parsed && parsed.recommendations && parsed.recommendations.length) {
      return parsed;
    }
    return buildFallbackOutput(userData, engineResult);
  }
};
