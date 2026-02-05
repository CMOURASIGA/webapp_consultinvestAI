import { AIService } from './aiService';
import { geminiService } from './geminiService';
import { openAIService } from './openAIService';

export function getAIService(provider: string): AIService {
  if (provider === 'OpenAI (ChatGPT)') {
    return openAIService;
  }
  if (provider === 'Anthropic (Claude)') {
    throw new Error('Anthropic not yet implemented');
  }
  if (provider === 'Groq (Ultra Fast)') {
    throw new Error('Groq not yet implemented');
  }
  if (provider === 'DeepSeek (Open Model)') {
    throw new Error('DeepSeek not yet implemented');
  }
  if (provider === 'XAI (GROK)') {
    throw new Error('XAI not yet implemented');
  }
  // Default to Gemini
  return geminiService;
}
