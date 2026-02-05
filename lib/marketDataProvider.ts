
import { MarketData } from '../types';

const MARKET_DB: Record<string, MarketData> = {
  'Brasil': {
    country: 'Brasil',
    inflation: 4.5,
    baseRate: 11.25,
    interestRate: 11.25,
    currencyName: 'Real (BRL)',
    isRealTime: true,
    asOf: new Date().toISOString(),
    volatility: 'MEDIA',
    notes: 'Cenário de juros elevados para controle inflacionário.'
  },
  'EUA': {
    country: 'EUA',
    inflation: 3.2,
    baseRate: 5.5,
    interestRate: 5.5,
    currencyName: 'Dólar (USD)',
    isRealTime: true,
    asOf: new Date().toISOString(),
    volatility: 'BAIXA',
    notes: 'Expectativa de manutenção de taxas pelo FED.'
  }
};

export function getMarketData(country: string): MarketData {
  return MARKET_DB[country] || {
    country,
    inflation: 0,
    baseRate: 0,
    currencyName: 'Moeda Local',
    isRealTime: false
  };
}

export function getDashboardAssets(country: string) {
  if (country === 'Brasil') {
    return [
      { symbol: 'PETR4', name: 'Petrobras PN', category: 'ACAO', price: 38.50, variation: 1.2, volatility: 'MEDIA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' },
      { symbol: 'VALE3', name: 'Vale ON', category: 'ACAO', price: 68.20, variation: -0.5, volatility: 'MEDIA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' },
      { symbol: 'ITUB4', name: 'Itaú Unibanco PN', category: 'ACAO', price: 34.10, variation: 0.8, volatility: 'BAIXA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' },
      { symbol: 'Tesouro Selic 2029', name: 'Tesouro Selic', category: 'RENDA_FIXA', price: 14500.00, variation: 0.01, volatility: 'BAIXA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' },
      { symbol: 'CDB Banco X', name: 'CDB Pos-fixado', category: 'RENDA_FIXA', price: 1000.00, variation: 0, volatility: 'BAIXA', liquidity: 'MEDIA', marketRelevance: 'Media', dataConfidence: 'ALTA' },
      { symbol: 'BTC', name: 'Bitcoin', category: 'CRIPTO', price: 340000.00, variation: 2.5, volatility: 'ALTA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' },
      { symbol: 'ETH', name: 'Ethereum', category: 'CRIPTO', price: 18000.00, variation: 1.8, volatility: 'ALTA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' }
    ];
  }
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', category: 'ACAO', price: 190.50, variation: 0.5, volatility: 'MEDIA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', category: 'ACAO', price: 410.20, variation: 1.2, volatility: 'BAIXA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' },
    { symbol: 'BTC', name: 'Bitcoin', category: 'CRIPTO', price: 67000.00, variation: 2.5, volatility: 'ALTA', liquidity: 'ALTA', marketRelevance: 'Alta', dataConfidence: 'ALTA' }
  ];
}
