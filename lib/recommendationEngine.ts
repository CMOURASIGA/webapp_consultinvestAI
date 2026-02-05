
import { WizardData, MarketData } from '../types';

export interface EngineResult {
  assetClasses: string[];
  maxRiskExposure: number;
  maxRiskAmount: number;
  analysisAssets: any[];
  layerStructure: {
    immediate: string[];
    stability: string[];
    growth: string[];
  };
}

export function runEngine(data: WizardData, market: MarketData): EngineResult {
  const { investmentObjectives, horizon, riskProfile, value } = data;
  
  const result: EngineResult = {
    assetClasses: [],
    maxRiskExposure: 0,
    maxRiskAmount: 0,
    analysisAssets: [],
    layerStructure: {
      immediate: [],
      stability: [],
      growth: []
    }
  };

  // Cálculo de Risco
  const riskMap: Record<string, number> = {
    'Conservador': 0.05,
    'Moderado': 0.20,
    'Arrojado': 0.50
  };
  result.maxRiskExposure = riskMap[riskProfile] || 0.05;
  result.maxRiskAmount = value * result.maxRiskExposure;

  // Ativos Candidatos para Análise (Exemplos Educacionais)
  if (data.country === 'Brasil') {
    result.analysisAssets = [
      { symbol: 'IVVB11', name: 'iShares S&P 500 Fundo de Indice', category: 'ETF', price: 310.50, priceCurrency: 'BRL', volatility: 'ALTA', trend: 'ALTA', liquidity: 'ALTA', dataConfidence: 'ALTA' },
      { symbol: 'BOVA11', name: 'iShares Ibovespa Fundo de Indice', category: 'ETF', price: 125.20, priceCurrency: 'BRL', volatility: 'ALTA', trend: 'LATERAL', liquidity: 'ALTA', dataConfidence: 'ALTA' },
      { symbol: 'HGLG11', name: 'CGHG Logística FII', category: 'ETF', price: 165.00, priceCurrency: 'BRL', volatility: 'MEDIA', trend: 'ALTA', liquidity: 'ALTA', dataConfidence: 'ALTA' }
    ];
  } else {
    result.analysisAssets = [
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', category: 'ETF', price: 480.00, priceCurrency: 'USD', volatility: 'ALTA', trend: 'ALTA', liquidity: 'ALTA', dataConfidence: 'ALTA' },
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'ETF', price: 420.00, priceCurrency: 'USD', volatility: 'ALTA', trend: 'ALTA', liquidity: 'ALTA', dataConfidence: 'ALTA' }
    ];
  }

  const hasEmergencia = investmentObjectives.includes('RESERVA_EMERGENCIA');
  const hasAposentadoria = investmentObjectives.includes('APOSENTADORIA');
  const hasCrescimento = investmentObjectives.includes('CRESCIMENTO_PATRIMONIO');
  const isLongoPrazo = horizon === 'MAIS_5_ANOS';

  if (hasEmergencia || horizon === 'LIQUIDEZ_DIARIA') {
    result.layerStructure.immediate.push('Conta Remunerada (100% CDI)', 'Tesouro Selic (Líquidez Diária)');
  } else {
    result.layerStructure.immediate.push('Tesouro Selic');
  }

  if (riskProfile === 'Conservador') {
    result.layerStructure.stability.push('CDBs de Grandes Bancos', 'LCI/LCA (Isentos de IR)');
  } else {
    result.layerStructure.stability.push('CDBs de Médio Porte (Rating A)', 'Fundos de Renda Fixa Ativa');
  }

  if (hasAposentadoria || hasCrescimento || isLongoPrazo || riskProfile === 'Arrojado') {
    result.layerStructure.growth.push('Tesouro IPCA+ (Longo Prazo)');
    if (riskProfile !== 'Conservador') {
      result.layerStructure.growth.push('ETFs Diversificados', 'Fundos de Ações/FIIs');
    }
  }

  result.assetClasses = Array.from(new Set([
    ...result.layerStructure.immediate,
    ...result.layerStructure.stability,
    ...result.layerStructure.growth
  ]));

  return result;
}
