import { WizardData, AIConfig, MarketPanoramaOutput } from '../types';
import { EngineResult } from '../lib/recommendationEngine';

export interface AIService {
  getEducationalChatResponse(history: {role: string, parts: string}[], config: AIConfig): Promise<string>;
  getMarketPanorama(marketData: any, config: AIConfig): Promise<{ data: MarketPanoramaOutput, sources: any[] }>;
  getLLMExplanation(userData: WizardData, engineResult: EngineResult, config: AIConfig): Promise<any>;
}