


export type RiskProfile = 'Conservador' | 'Moderado' | 'Arrojado';

export type VolatilityAcceptance = 'BAIXA' | 'MEDIA' | 'ALTA';



export type LLMProvider = 

  | 'Google AI Studio (Gemini)' 

  | 'OpenAI (ChatGPT)' 

  | 'Anthropic (Claude)' 

  | 'Groq (Ultra Fast)' 

  | 'DeepSeek (Open Model)'

  | 'XAI (GROK)';



export interface AIConfig {



  provider: LLMProvider;



  apiKey?: string;



  model: string;



  temperature: number;



}



export interface WizardData {

  value: number;

  currency: string;

  country: string;

  investmentObjectives: string[];

  otherObjectiveDetail?: string; 

  horizon: string;

  liquidityDaily: boolean;

  riskProfile: RiskProfile;

  volatilityAcceptance: VolatilityAcceptance;

  prefProtection: boolean;

  prefOscillation: boolean;

  viewMode: 'Simples' | 'Detalhado';

  aiConfig?: AIConfig;

}



export interface Recommendation {

  title: string;

  why: string;

  pros: string[];

  cons: string[];

  liquidity: string;

  risk: string;

  term: string;

  taxation: string;

  protection: string;

  how_to: string;

  attention_points: string[];

  allocationPercent: number;

}



export interface AdvancedLLMOutput {

  mode: "ANALISE_AVANCADA";

  market_context: {

    summary: string;

    asOf: string | null;

    data_quality: "ALTA" | "MEDIA" | "BAIXA";

    notes: string | null;

  };

  risk_budget: {

    totalAmount: number;

    maxRiskExposure: number;

    maxRiskAmount: number;

    recommendedRiskAmount: number;

    reasoning: string;

  };

  examples_analyzed: Array<{

    symbol: string;

    name: string;

    category: "ACAO" | "ETF" | "CRIPTO";

    price: number | null;

    volatility: "BAIXA" | "MEDIA" | "ALTA";

    trend: "ALTA" | "LATERAL" | "BAIXA";

    liquidity: "ALTA" | "MEDIA" | "BAIXA";

    why_in_scope: string;

    key_risks: string[];

  }>;

  allocation_examples: {

    risk_amount_used: number;

    positions: Array<{

      symbol: string;

      estimated_unit_price: number | null;

      estimated_units: number | null;

      estimated_cost: number | null;

      notes: string;

    }>;

    important_note: string;

  };

  price_zones: Array<{

    symbol: string;

    zone_type: "FAIXA_HISTORICA";

    range: string | null;

    explanation: string | null;

    dataConfidence: "ALTA" | "MEDIA" | "BAIXA";

  }>;

  what_to_watch: string[];

  risks: string[];

  assumptions: string[];

  disclaimer: string;

}



export interface MarketPanoramaOutput {

  dashboardType: "PANORAMA_MERCADO";

  market_overview: {

    summary: string;

    interestRate: number | null;

    inflation: number | null;

    volatility: "BAIXA" | "MEDIA" | "ALTA" | null;

    notes: string | null;

  };

  sections: {

    acoes_em_acompanhamento: Array<{

      symbol: string;

      name: string;

      price: number | null;

      variation: number | null;

      volatility: "BAIXA" | "MEDIA" | "ALTA";

      liquidity: "ALTA" | "MEDIA" | "BAIXA";

      why_in_dashboard: string;

      risk_note: string;

    }>;

    renda_fixa_em_destaque: Array<{

      type: "LCI" | "LCA" | "CDB" | "TESOURO" | "OUTRO";

      indexer: "CDI" | "IPCA" | "PREFIXADO" | "OUTRO";

      liquidity: "DIARIA" | "NO_VENCIMENTO" | "OUTRA";

      tax_benefit: "ISENTO_IR" | "TRIBUTADO" | "DEPENDE";

      why_in_dashboard: string;

      risk_note: string;

    }>;

    cripto_em_acompanhamento: Array<{

      symbol: string;

      name: string;

      price: number | null;

      volatility: "ALTA";

      marketRelevance: string;

      risk_note: string;

    }>;

    outros_temas: Array<{

      theme: string;

      description: string;

      risk_note: string;

    }>;

  };

  general_warnings: string[];

  disclaimer: string;

}



export interface LLMOutput {

  summary: string;

  recommendations: Recommendation[];

  alternatives: Recommendation[];

  assumptions: string[];

  disclaimer: string;

  advancedAnalysis?: AdvancedLLMOutput;

}



export interface Simulation extends WizardData {

  id: string;

  createdAt: string;

  results: LLMOutput;

  isRealTime: boolean;

  hasAdvancedOptIn?: boolean;

}



export interface MarketData {

  country: string;

  inflation: number;

  baseRate: number;

  currencyName: string;

  isRealTime: boolean;

  interestRate?: number;

  asOf?: string;

  volatility?: "BAIXA" | "MEDIA" | "ALTA";

  notes?: string;

}
