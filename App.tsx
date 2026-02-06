import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  History, 
  PlusCircle, 
  ChevronRight, 
  ChevronLeft,
  AlertCircle,
  TrendingUp,
  Clock,
  Info,
  Cpu,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Shield,
  Search,
  Activity,
  Globe,
  MessageSquare,
  Send,
  User,
  Bot,
  RefreshCcw,
  LayoutDashboard,
  CheckCircle2,
  Radar,
  Newspaper,
  Zap,
  BarChart3,
  Wallet,
  Scale,
  X,
  ArrowRight,
  Target,
  FileText,
  DollarSign,
  Umbrella,
  Briefcase,
  Home,
  Plane,
  Coins,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Lightbulb,
  Layers,
  BarChart,
  Lock,
  PieChart,
  HelpCircle,
  Settings2,
  Key,
  Edit3,
  LockKeyhole,
  BarChart2,
  Bell
} from 'lucide-react';
import {
  WizardData,
  Simulation,
  AIConfig,
  MarketPanoramaOutput,
  RiskProfile,
  VolatilityAcceptance,
  LLMProvider
} from './types';
import { localStorageRepository } from './lib/localStorageRepository';
import { getMarketData } from './lib/marketDataProvider';
import { runEngine } from './lib/recommendationEngine';
import { getAIService } from './services/aiServiceProvider';

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'Google AI Studio (Gemini)',
  model: 'gemini-2.5-flash',
  temperature: 0.7,
  apiKey: ''
};

type UserLevel = 'iniciante' | 'intermediario' | 'avancado';
const USER_LEVEL_KEY = 'reserveAdvisor:userLevel';
const loadUserLevel = (): UserLevel => {
  const stored = localStorage.getItem(USER_LEVEL_KEY) as UserLevel | null;
  if (stored === 'iniciante' || stored === 'intermediario' || stored === 'avancado') return stored;
  return 'intermediario';
};
const saveUserLevel = (level: UserLevel) => localStorage.setItem(USER_LEVEL_KEY, level);

const ENGINE_VERSION = {
  label: 'Modelo de Analise',
  version: 'v1.0',
  updatedAt: '05/02/2026'
};

const OBJECTIVES = [
  { id: 'RESERVA_EMERGENCIA', label: 'Emergência', icon: <Umbrella size={24}/> },
  { id: 'APOSENTADORIA', label: 'Aposentadoria', icon: <Briefcase size={24}/> },
  { id: 'COMPRA_BENS', label: 'Comprar Bem', icon: <Home size={24}/> },
  { id: 'VIAGEM', label: 'Viagem', icon: <Plane size={24}/> },
  { id: 'CRESCIMENTO_PATRIMONIO', label: 'Crescer Capital', icon: <TrendingUp size={24}/> }
];

const HORIZONS = [
  { id: 'CURTO_PRAZO', label: 'Até 1 Ano', sub: 'Curto Prazo' },
  { id: 'MEDIO_PRAZO', label: '1 a 5 Anos', sub: 'Médio Prazo' },
  { id: 'MAIS_5_ANOS', label: '5+ Anos', sub: 'Longo Prazo' }
];

const AVAILABLE_PROVIDERS: LLMProvider[] = [
  'Google AI Studio (Gemini)',
  'OpenAI (ChatGPT)',
  'Anthropic (Claude)',
  'Groq (Ultra Fast)',
  'DeepSeek (Open Model)',
  'XAI (GROK)'
];

const AVAILABLE_MODELS: {[key in LLMProvider]: {id: string, name: string, desc: string}[]} = {
  'Google AI Studio (Gemini)': [
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', desc: 'O modelo mais capaz para tarefas complexas.' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Rápido e versátil para diversas aplicAções.' },
  ],
  'OpenAI (ChatGPT)': [
    { id: 'gpt-4o', name: 'GPT-4o', desc: 'Modelo completo com suporte a JSON estruturado.' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', desc: 'versão mais leve e econômica com JSON nativo.' },
    { id: 'gpt-4.1', name: 'GPT-4.1', desc: 'Modelo avançado; requer acesso habilitado na conta.' },
  ],
  'Anthropic (Claude)': [
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', desc: 'Máximo desempenho e inteligência.' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', desc: 'Balanço ideal entre performance e custo.' },
  ],
  'Groq (Ultra Fast)': [
    { id: 'llama3-8b-8192', name: 'LLaMA3 8b', desc: 'Resposta em tempo real, ultra Rápido.' },
  ],
  'DeepSeek (Open Model)': [
    { id: 'deepseek-coder', name: 'DeepSeek Coder', desc: 'Especializado em código.' },
  ],
  'XAI (GROK)': [
    { id: 'grok-1', name: 'Grok-1', desc: 'Modelo da XAI com personalidade.' },
  ]
};

const GLOSSARY_TERMS = [
  { id: 'mentoria-ai', title: 'Mentoria Educacional', category: 'Sistema', whatIs: 'IA para explicar o "porquê" de cada alocação, transformando números em conhecimento prático e estratégico.', useFor: 'Entender a lógica do plano sugerido.', impact: 'Você sabe o motivo de cada classe na carteira.', caution: 'Não substitui aconselhamento certificado.', icon: <Lightbulb className="text-amber-500" /> },
  { id: 'panorama-realtime', title: 'Panorama em Tempo Real', category: 'Sistema', whatIs: 'Monitoramento via provedores para juros, Inflação e ativos.', useFor: 'Acompanhar o cenário antes de simular.', impact: 'Ajuste o plano conforme o contexto atual.', caution: 'Dados podem variar; sempre cheque a fonte.', icon: <Radar className="text-emerald-500" /> },
  { id: 'simulacao-dinamica', title: 'Simulação Dinâmica', category: 'Sistema', whatIs: 'Analisa perfil, objetivos e mercado para gerar um plano único.', useFor: 'Testar combinações de perfil, prazo e liquidez.', impact: 'Mostra alocação alinhada ao seu risco.', caution: 'Não é recomendação formal.', icon: <Sparkles className="text-indigo-500" /> },
  { id: 'renda-fixa', title: 'Renda Fixa (CDB/LCI/LCA)', category: 'Produto', whatIs: 'Títulos bancários ou de empresas com rendimento previsível.', useFor: 'Reserva, liquidez e estabilidade.', impact: 'Protege capital e suaviza oscilações.', caution: 'Cheque FGC e prazo de resgate.', icon: <Shield className="text-emerald-500" /> },
  { id: 'tesouro', title: 'Tesouro Selic e Tesouro IPCA+', category: 'Produto', whatIs: 'Títulos públicos para liquidez (Selic) ou proteção contra Inflação (IPCA+).', useFor: 'Reserva (Selic) e proteção real (IPCA+).', impact: 'Equilibra liquidez e preservação do poder de compra.', caution: 'IPCA+ oscila mais no curto prazo.', icon: <Umbrella className="text-sky-500" /> },
  { id: 'etfs', title: 'ETFs Diversificados', category: 'Produto', whatIs: 'Fundos de índice em bolsa (Ibovespa, S&P 500, Nasdaq).', useFor: 'Diversificar rápido com baixo custo.', impact: 'Exposição ampla com uma única posição.', caution: 'Segue o índice; volatilidade acompanha o mercado.', icon: <BarChart3 className="text-blue-500" /> },
  { id: 'acoes', title: 'Ações/FIIs', category: 'Produto', whatIs: 'Participação em empresas ou fundos imobiliários.', useFor: 'Crescimento no longo prazo e renda (FIIs).', impact: 'Potencial de retorno maior, com mais oscilação.', caution: 'Adequar ao perfil e horizonte longo.', icon: <Activity className="text-rose-500" /> },
  { id: 'cripto', title: 'Criptoativos', category: 'Produto', whatIs: 'Ativos digitais como BTC/ETH com alta volatilidade.', useFor: 'Parcela pequena e consciente de risco.', impact: 'Pode diversificar correlação, mas oscila muito.', caution: 'Use apenas se aceitar risco elevado.', icon: <Coins className="text-purple-500" /> },
  { id: 'Liquidez', title: 'Liquidez Diária', category: 'Conceito', whatIs: 'Resgatar rápido sem perdas relevantes.', useFor: 'Reserva de emergência e objetivos de curto prazo.', impact: 'Diminui a chance de vender ativos voláteis em queda.', caution: 'Liquidez maior costuma ter retorno menor.', icon: <RefreshCcw className="text-teal-500" /> },
  { id: 'diversificacao', title: 'Diversificação', category: 'Conceito', whatIs: 'Distribuir capital entre classes de ativos.', useFor: 'Reduzir risco específico e suavizar a jornada.', impact: 'Portfólio mais resiliente a choques.', caution: 'Diversificar não elimina risco de mercado.', icon: <Layers className="text-amber-600" /> },
  { id: 'volatilidade', title: 'Risco x Volatilidade', category: 'Conceito', whatIs: 'Oscilação de preço vs. chance de perda permanente.', useFor: 'Entender quanto balanço a carteira pode ter.', impact: 'Ajuda a definir horizonte e liquidez necessários.', caution: 'Oscilar não é igual a perder para sempre.', icon: <AlertTriangle className="text-red-500" /> }
];

const Header = () => {
  const [showConfig, setShowConfig] = useState(false);
  const [userLevel, setUserLevel] = useState<UserLevel>(() => {
    try { return loadUserLevel(); } catch { return 'intermediario'; }
  });
  const normalizeModel = (provider: LLMProvider, model: string) => {
    if (provider === 'Google AI Studio (Gemini)') {
      if (model === 'gemini-2.5-flash-latest') return 'gemini-2.5-flash';
      if (model === 'gemini-2.5-pro-latest') return 'gemini-2.5-pro';
    }
    return model;
  };

  const [config, setConfig] = useState<AIConfig>(() => {
    const saved = localStorage.getItem('reserveAdvisor:aiConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...parsed, model: normalizeModel(parsed.provider, parsed.model) };
    }
    return DEFAULT_AI_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('reserveAdvisor:aiConfig', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    try { saveUserLevel(userLevel); } catch {}
  }, [userLevel]);

  const handleProviderChange = (provider: LLMProvider) => {
    const defaultConfig = AVAILABLE_MODELS[provider][0];
    setConfig({ ...config, provider, model: normalizeModel(provider, defaultConfig.id) });
  };

  return (
    <header className="bg-[#020a0d] text-white border-b border-[#0d1a1f] sticky top-0 z-50 h-20 flex items-center shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tighter group">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 group-hover:bg-emerald-500/30 transition-all">
            <ShieldCheck className="text-emerald-400 w-6 h-6" />
          </div>
          <span className="text-emerald-50 font-black tracking-widest text-lg uppercase">RESERVE ADVISOR</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-500 h-8 items-center border-r border-gray-800 pr-8">
            <Link to="/chat" className="hover:text-emerald-400 transition-colors">Conversar</Link>
            <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">Panorama</Link>
            <Link to="/wizard" className="hover:text-emerald-400 transition-colors">Simular</Link>
            <Link to="/history" className="hover:text-emerald-400 transition-colors">Histórico</Link>
            <Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">Como Funciona</Link>
            <Link to="/glossary" className="hover:text-emerald-400 transition-colors">Glossário</Link>
          </nav>
          <div className="relative">
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 px-4 border rounded-xl transition-all group flex items-center gap-3 ${showConfig ? 'bg-emerald-500/20 border-emerald-500' : 'bg-[#05141a] border-[#0d1a1f] hover:border-emerald-500/50'} focus:outline-none focus:ring-2 focus:ring-emerald-500/60`}
            >
              <div className="flex flex-col items-end">
                <span className="text-[8px] font-black uppercase text-gray-500 tracking-tighter">Configuração</span>
                <span className="text-[10px] font-black uppercase text-emerald-100">AI System</span>
              </div>
              <div className="p-1.5 bg-emerald-500/20 rounded-lg">
                <Settings2 size={14} className="text-emerald-400" />
              </div>
              <ChevronDown size={12} className={`transition-transform text-emerald-400/50 ${showConfig ? 'rotate-180' : ''}`} />
            </button>
            {showConfig && (
              <div className="absolute top-full right-0 mt-4 w-full max-w-[420px] bg-[#0c1418] backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl p-8 z-[100] animate-in fade-in slide-in-from-top-6 duration-300 max-h-[88vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/40 scrollbar-track-white/5">
                <div className="space-y-10">
                   <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3 text-emerald-400">
                        <Settings2 size={20}/>
                        <h4 className="text-xs font-black uppercase tracking-[0.3em]">Gestão de Acesso & IA</h4>
                      </div>
                      <button onClick={() => setShowConfig(false)} className="text-gray-500 hover:text-white transition-colors p-2 bg-white/5 rounded-full"><X size={16}/></button>
                   </div>
                   <div className="space-y-6">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                           <LockKeyhole size={12}/> Autenticação (API Key)
                        </label>
                        <span className={`text-[9px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest ${config.apiKey ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'}`}>
                          {config.apiKey ? 'ATIVO' : 'REQUERIDO'}
                        </span>
                      </div>
                      <div className="bg-white/5 border border-white/5 p-8 rounded-3xl space-y-6">
                        <p className="text-[11px] text-gray-400 leading-relaxed font-medium">Insira sua chave de API para o provedor selecionado:</p>
                        <input type="password" value={config.apiKey} onChange={e => setConfig({...config, apiKey: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white text-xs" placeholder="Cole sua API Key aqui" />
                      </div>
                   </div>

                  <div className="space-y-6 pt-4 border-t border-white/5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Provedor de IA</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AVAILABLE_PROVIDERS.map(p => (
                          <button key={p} onClick={() => handleProviderChange(p)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${config.provider === p ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}>
                            <div className="text-[10px] font-black uppercase">{p}</div>
                          </button>
                        ))}
                      </div>
                   </div>

                  <div className="space-y-6 pt-4 border-t border-white/5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Engine de inteligência</label>
                      <div className="grid grid-cols-1 gap-3">
                        {AVAILABLE_MODELS[config.provider].map(m => (
                          <button key={m.id} onClick={() => setConfig({ ...config, model: m.id })} className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex justify-between items-center ${config.model === m.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}>
                            <div className="flex items-center gap-4">
                               <div className={`w-3 h-3 rounded-full ${config.model === m.id ? 'bg-emerald-500' : 'bg-gray-700'}`} />
                               <div>
                                  <div className={`text-[11px] font-black uppercase ${config.model === m.id ? 'text-white' : ''}`}>{m.name}</div>
                                  <div className="text-[9px] mt-1 opacity-60 font-bold">{m.desc}</div>
                               </div>
                            </div>
                            {config.model === m.id && <Sparkles size={16} />}
                          </button>
                        ))}
                      </div>
                   </div>

                  <div className="space-y-6 pt-4 border-t border-white/5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nível do usuário</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'iniciante', label: 'Iniciante' },
                          { id: 'intermediario', label: 'Intermediário' },
                          { id: 'avancado', label: 'Avançado' },
                        ].map(level => (
                          <button
                            key={level.id}
                            onClick={() => setUserLevel(level.id as UserLevel)}
                            className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${userLevel === level.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}
                          >
                            {level.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Mais explicação para iniciantes, mais dados para avançados. Mesmo cuidado legal.</p>
                   </div>
                   <div className="pt-4 border-t border-white/5">
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-400 font-bold flex items-center gap-2 hover:underline">
                        <Info size={12}/> Documentação de Faturamento e Cotas
                      </a>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const HomePage = () => (
  <div className="min-h-[85vh] flex flex-col items-center justify-center text-center px-4 space-y-12 py-12">
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.3em] uppercase mb-4">Market Intelligence Engine</div>
      <h1 className="text-6xl md:text-9xl font-black text-[#0d3b4c] leading-[0.85] tracking-tighter uppercase">Clareza para sua <span className="text-emerald-600">Reserva</span>.</h1>
      <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">A inteligência que você precisa para alocar com segurança e estratégia em tempo real.</p>
    </div>
    <div className="flex flex-wrap justify-center gap-6">
      <Link to="/dashboard" className="bg-[#0d3b4c] text-white px-12 py-8 rounded-[40px] text-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-4">VER PANORAMA <TrendingUp /></Link>
      <Link to="/wizard" className="bg-white border-2 border-[#0d3b4c] text-[#0d3b4c] px-12 py-8 rounded-[40px] text-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-4">SIMULAR AGORA <Sparkles className="text-emerald-500" /></Link>
    </div>
  </div>
);

const WizardPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<WizardData>({
    value: 10000, currency: 'BRL', country: 'Brasil', investmentObjectives: [], horizon: 'CURTO_PRAZO', liquidityDaily: true, riskProfile: 'Moderado', volatilityAcceptance: 'MEDIA', prefProtection: true, prefOscillation: false, viewMode: 'Simples'
  });

  const normalizeModel = (provider: LLMProvider, model: string) => {
    if (provider === 'Google AI Studio (Gemini)') {
      if (model === 'gemini-2.5-flash-latest') return 'gemini-2.5-flash';
      if (model === 'gemini-2.5-pro-latest') return 'gemini-2.5-pro';
    }
    return model;
  };

  const prettifyAIError = (err: any, provider?: string) => {
    const providerLabel = provider || 'IA';
    const raw = err?.message || err?.toString?.() || 'Erro desconhecido ao processar Simulação.';
    const tryJson = (text: string) => {
      try { return JSON.parse(text); } catch { return null; }
    };
    const parsed = typeof raw === 'string'
      ? (raw.trim().startsWith('{')
        ? tryJson(raw)
        : (() => {
            const idx = raw.indexOf('{');
            return idx >= 0 ? tryJson(raw.slice(idx)) : null;
          })())
      : null;
    const errObj = err?.error || parsed?.error || parsed;
    const code = errObj?.code || errObj?.status || err?.status;
    const msg = errObj?.message || raw;

    if (code === 429 || code === 'RESOURCE_EXHAUSTED' || /quota/i.test(msg)) {
      return `Limite de uso da API atingido. Verifique cotas/billing do provedor (${providerLabel}) ou aguarde e tente novamente.`;
    }
    if (code === 404 || /not found/i.test(msg)) {
      return 'Modelo Não encontrado no provedor. Confirme o modelo selecionado (ex.: gemini-2.5-flash) e se ele está habilitado para sua chave.';
    }
    return msg;
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    let currentAIConfig: AIConfig | null = null;
    try {
      const savedConfig = localStorage.getItem('reserveAdvisor:aiConfig');
      const parsed = savedConfig ? JSON.parse(savedConfig) : DEFAULT_AI_CONFIG;
      const aiConfig = { ...parsed, model: normalizeModel(parsed.provider, parsed.model) };
      currentAIConfig = aiConfig;

      if (!aiConfig.apiKey || !aiConfig.apiKey.trim()) {
        throw new Error('Informe uma chave de API válida antes de gerar o Diagnóstico.');
      }

      let aiService;
      try {
        aiService = getAIService(aiConfig.provider);
      } catch (provErr: any) {
        throw new Error(provErr?.message || 'Provedor de IA ainda Não implementado. Utilize "Google AI Studio (Gemini)" por enquanto.');
      }

      const marketData = getMarketData(formData.country);
      const engineResult = runEngine(formData, marketData);
      const llmResult = await aiService.getLLMExplanation(formData, engineResult, aiConfig);
      const sim: Simulation = { ...formData, id: Math.random().toString(36).substring(7), createdAt: new Date().toISOString(), results: llmResult, isRealTime: true };
      await localStorageRepository.saveSimulation(sim);
      navigate(`/results/${sim.id}`);
    } catch (e: any) {
      setError(prettifyAIError(e, currentAIConfig?.provider));
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in">
       <div className="relative">
          <div className="w-24 h-24 border-8 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <Target className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
       </div>
       <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-[#0d3b4c] uppercase tracking-tighter">Processando Diagnóstico</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Consultando Engine de alocação Dinâmica...</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 bg-white p-8 rounded-[32px] border border-gray-50 shadow-sm">
         <div className="space-y-1">
            <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Simulador Inteligente</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Etapa {step} de 4</div>
         </div>
         <div className="flex gap-3">
            {[1,2,3,4].map(s => (
              <div key={s} className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= s ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-gray-100'}`} />
            ))}
         </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-[28px] p-6 flex gap-3 items-start shadow-sm">
          <AlertTriangle size={24} className="mt-0.5 text-red-500" />
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.25em]">Não foi possível gerar o Diagnóstico</div>
            <div className="text-sm font-semibold leading-relaxed">{error}</div>
          </div>
        </div>
      )}

      <div className="bg-white p-12 md:p-20 rounded-[64px] shadow-2xl border border-gray-100 min-h-[600px] flex flex-col relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="space-y-4">
                <h2 className="text-6xl font-black text-[#0d3b4c] uppercase tracking-tighter leading-none">Quanto vamos alocar?</h2>
                <p className="text-xl text-gray-400 font-medium">Defina o montante e os objetivos primordiais da reserva.</p>
             </div>
             <div className="space-y-10">
                <div className="relative group border-b-4 border-gray-100 focus-within:border-emerald-500 transition-all pb-4">
                   <span className="absolute left-0 bottom-6 text-4xl font-black text-[#0d3b4c] uppercase pointer-events-none">R$</span>
                   <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full text-7xl font-black text-[#0d3b4c] bg-transparent outline-none pl-20" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {OBJECTIVES.map(obj => (
                     <button key={obj.id} onClick={() => {
                         const current = formData.investmentObjectives;
                         setFormData({...formData, investmentObjectives: current.includes(obj.id) ? current.filter(x => x !== obj.id) : [...current, obj.id]});
                       }} className={`flex flex-col items-center gap-4 p-6 rounded-[32px] border-2 transition-all ${formData.investmentObjectives.includes(obj.id) ? 'bg-[#0d3b4c] text-white border-[#0d3b4c] scale-105 shadow-xl' : 'bg-gray-50 text-gray-400 border-gray-50 hover:border-emerald-200'}`}>
                        <div className={formData.investmentObjectives.includes(obj.id) ? 'text-emerald-400' : 'text-gray-300'}>{obj.icon}</div>
                        <span className="text-[10px] font-black uppercase text-center leading-tight">{obj.label}</span>
                     </button>
                   ))}
                </div>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="space-y-4">
                <h2 className="text-6xl font-black text-[#0d3b4c] uppercase tracking-tighter leading-none">Qual o Prazo?</h2>
                <p className="text-xl text-gray-400 font-medium">Por quanto tempo planeja manter esse capital investido?</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {HORIZONS.map(h => (
                  <button key={h.id} onClick={() => setFormData({...formData, horizon: h.id})} className={`p-10 rounded-[40px] border-2 text-left transition-all ${formData.horizon === h.id ? 'bg-[#0d3b4c] border-[#0d3b4c] text-white shadow-2xl' : 'bg-gray-50 border-gray-50 text-gray-400 hover:border-emerald-100'}`}>
                    <div className={`text-[10px] font-black uppercase mb-2 ${formData.horizon === h.id ? 'text-emerald-400' : 'text-gray-500'}`}>{h.sub}</div>
                    <div className="text-3xl font-black uppercase tracking-tighter">{h.label}</div>
                  </button>
                ))}
             </div>
             <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                <div>
                   <h4 className="text-lg font-black text-[#0d3b4c] uppercase">Liquidez Diária</h4>
                   <p className="text-sm text-gray-400 font-medium">Precisa do dinheiro disponível em 24h?</p>
                </div>
                <button onClick={() => setFormData({...formData, liquidityDaily: !formData.liquidityDaily})} className={`w-20 h-10 rounded-full relative transition-all ${formData.liquidityDaily ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                   <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all shadow-md ${formData.liquidityDaily ? 'left-11' : 'left-1'}`} />
                </button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="space-y-4">
                <h2 className="text-6xl font-black text-[#0d3b4c] uppercase tracking-tighter leading-none">Perfil de Risco</h2>
                <p className="text-xl text-gray-400 font-medium">Como você lida com as oscilAções naturais do mercado?</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['Conservador', 'Moderado', 'Arrojado'] as RiskProfile[]).map(profile => (
                  <button key={profile} onClick={() => setFormData({...formData, riskProfile: profile})} className={`p-10 rounded-[40px] border-2 text-left transition-all ${formData.riskProfile === profile ? 'bg-[#0d3b4c] border-[#0d3b4c] text-white shadow-2xl scale-105' : 'bg-gray-50 border-gray-50 text-gray-400 hover:border-emerald-100'}`}>
                    <Activity className={`mb-4 ${formData.riskProfile === profile ? 'text-emerald-400' : 'text-gray-300'}`} size={32} />
                    <div className="text-3xl font-black uppercase tracking-tighter">{profile}</div>
                  </button>
                ))}
             </div>
             <div className="space-y-6 pt-8 border-t border-gray-50">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aceitação de Volatilidade</h4>
                   <span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase">{formData.volatilityAcceptance}</span>
                </div>
                <div className="flex gap-4">
                   {(['BAIXA', 'MEDIA', 'ALTA'] as VolatilityAcceptance[]).map(v => (
                     <button key={v} onClick={() => setFormData({...formData, volatilityAcceptance: v})} className={`flex-1 py-4 rounded-2xl font-black text-[10px] transition-all border-2 ${formData.volatilityAcceptance === v ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-50 border-gray-50 text-gray-400 hover:border-emerald-200'}`}>{v}</button>
                   ))}
                </div>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="space-y-4">
                <h2 className="text-6xl font-black text-[#0d3b4c] uppercase tracking-tighter leading-none">Preferências Finais</h2>
                <p className="text-xl text-gray-400 font-medium">Deseja ativar camadas extras de segurança ou análise detalhada?</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => setFormData({...formData, prefProtection: !formData.prefProtection})} className={`p-8 rounded-[32px] border-2 flex items-center gap-6 transition-all ${formData.prefProtection ? 'bg-emerald-50 border-emerald-500 text-[#0d3b4c]' : 'bg-gray-50 border-gray-50 text-gray-400'}`}>
                   <ShieldCheck className={formData.prefProtection ? 'text-emerald-500' : 'text-gray-300'} size={40} />
                   <div className="text-left">
                      <div className="text-lg font-black uppercase">Focar em Proteção (FGC)</div>
                      <div className="text-[10px] font-bold opacity-60 uppercase">Priorizar ativos com garantia oficial</div>
                   </div>
                </button>
                <button onClick={() => setFormData({...formData, viewMode: formData.viewMode === 'Simples' ? 'Detalhado' : 'Simples'})} className={`p-8 rounded-[32px] border-2 flex items-center gap-6 transition-all ${formData.viewMode === 'Detalhado' ? 'bg-indigo-50 border-indigo-500 text-[#0d3b4c]' : 'bg-gray-50 border-gray-50 text-gray-400'}`}>
                   <LayoutDashboard className={formData.viewMode === 'Detalhado' ? 'text-indigo-500' : 'text-gray-300'} size={40} />
                   <div className="text-left">
                      <div className="text-lg font-black uppercase">Modo Analítico</div>
                      <div className="text-[10px] font-bold opacity-60 uppercase">Exibir métricas técnicas e dados de mercado</div>
                   </div>
                </button>
             </div>
             <div className="bg-amber-50 border border-amber-100 p-8 rounded-[32px] flex gap-6 items-start">
                <AlertCircle className="text-amber-500 flex-shrink-0" size={24} />
                <p className="text-xs text-amber-900/60 font-medium leading-relaxed">
                   **Aviso Importante:** Esta Simulação tem fins didáticos e educacionais. As recomendações são baseadas em algoritmos de IA e dados de mercado atuais, mas Não constituem recomendação formal de compra/venda de ativos.
                </p>
             </div>
          </div>
        )}

        <div className="mt-auto pt-16 flex justify-between">
           {step > 1 && (
             <button onClick={() => setStep(step - 1)} className="flex items-center gap-3 text-gray-400 font-black uppercase text-xs hover:text-[#0d3b4c] transition-colors">
                <ChevronLeft size={20}/> Voltar
             </button>
           )}
           {step < 4 ? (
             <button onClick={() => setStep(step + 1)} className="ml-auto flex items-center gap-4 bg-[#0d3b4c] text-white px-12 py-6 rounded-[32px] font-black uppercase text-xs shadow-xl hover:bg-[#0f4d63] transition-all active:scale-95">
                Próximo Passo <ChevronRight size={20}/>
             </button>
           ) : (
             <button onClick={handleFinish} className="ml-auto flex items-center gap-4 bg-emerald-500 text-white px-12 py-6 rounded-[32px] font-black uppercase text-xs shadow-xl hover:bg-emerald-400 transition-all active:scale-95">
                Gerar Diagnóstico <Sparkles size={20}/>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MarketPanoramaOutput | null>(null);
  const [country, setCountry] = useState('Brasil');
  const [error, setError] = useState<string | null>(null);
  const [cachedNotice, setCachedNotice] = useState<string | null>(null);
  const [previousSnapshot, setPreviousSnapshot] = useState<MarketPanoramaOutput | null>(null);
  const [alertFrequency, setAlertFrequency] = useState<string>(() => {
    return localStorage.getItem('reserveAdvisor:alertFrequency') || 'mensal';
  });
  const userLevel = (() => { try { return loadUserLevel(); } catch { return 'intermediario'; } })();

  const CACHE_KEY = (c: string) => `reserveAdvisor:panorama:${c}`;

  const saveCache = (c: string, payload: MarketPanoramaOutput) => {
    try {
      localStorage.setItem(CACHE_KEY(c), JSON.stringify({ asOf: Date.now(), payload }));
    } catch {}
  };

  const loadCache = (c: string): MarketPanoramaOutput | null => {
    try {
      const raw = localStorage.getItem(CACHE_KEY(c));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.payload as MarketPanoramaOutput;
    } catch {
      return null;
    }
  };

  const fetchData = async (targetCountry: string) => {
    setLoading(true);
    setError(null);
    setCachedNotice(null);
    const previous = loadCache(targetCountry);
    setPreviousSnapshot(previous);
    let aiConfig: AIConfig | null = null;
    try {
      const savedConfig = localStorage.getItem('reserveAdvisor:aiConfig');
      aiConfig = savedConfig ? JSON.parse(savedConfig) : DEFAULT_AI_CONFIG;
      const aiService = getAIService(aiConfig.provider);
      const res = await aiService.getMarketPanorama({ country: targetCountry }, aiConfig);
      if (!res || !res.data) throw new Error('Panorama vazio retornado pela IA.');
      console.log('[Panorama][IA][Raw]', res.data);
      setData(res.data);
      saveCache(targetCountry, res.data);
    } catch (e: any) {
      console.error(e);
      const prov = aiConfig?.provider || 'IA';
      const msg = e?.message || 'Erro ao buscar panorama.';
      const cached = loadCache(targetCountry);
      if (cached) {
        setCachedNotice(`Mostrando dados em cache (último sucesso). Erro atual com ${prov}: ${msg}`);
        setData(cached);
      } else {
        setError(`Não foi possível obter dados em tempo real com ${prov}. Detalhe: ${msg}`);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(country);
  }, [country]);

  useEffect(() => {
    localStorage.setItem('reserveAdvisor:alertFrequency', alertFrequency);
  }, [alertFrequency]);

  const buildAlerts = (current: MarketPanoramaOutput | null, previous: MarketPanoramaOutput | null) => {
    const alerts: { title: string; detail: string; tone: 'warn' | 'info' }[] = [];
    const currOverview = current?.market_overview || {};
    const prevOverview = previous?.market_overview || {};

    if (current?.general_warnings && current.general_warnings.length > 0) {
      current.general_warnings.forEach((w) => alerts.push({ title: 'Alerta de cenário', detail: w, tone: 'warn' }));
    }

    if (prevOverview && currOverview) {
      const rateDiff = typeof currOverview.interestRate === 'number' && typeof prevOverview.interestRate === 'number'
        ? currOverview.interestRate - prevOverview.interestRate
        : null;
      if (rateDiff !== null && Math.abs(rateDiff) >= 0.25) {
        alerts.push({
          title: 'Alteração de juros',
          detail: `Taxa mudou ${rateDiff > 0 ? 'para cima' : 'para baixo'}: ${prevOverview.interestRate}% → ${currOverview.interestRate}%.`,
          tone: 'warn'
        });
      }

      const inflDiff = typeof currOverview.inflation === 'number' && typeof prevOverview.inflation === 'number'
        ? currOverview.inflation - prevOverview.inflation
        : null;
      if (inflDiff !== null && Math.abs(inflDiff) >= 0.2) {
        alerts.push({
          title: 'Alteração de inflação',
          detail: `Inflação variou ${inflDiff > 0 ? 'para cima' : 'para baixo'}: ${prevOverview.inflation}% → ${currOverview.inflation}%.`,
          tone: 'warn'
        });
      }

      if (currOverview.volatility && prevOverview.volatility && currOverview.volatility !== prevOverview.volatility) {
        alerts.push({
          title: 'Mudança de volatilidade',
          detail: `Volatilidade agora ${currOverview.volatility} (antes ${prevOverview.volatility}).`,
          tone: 'info'
        });
      }
    }

    const highVol = (currOverview.volatility || '').toLowerCase().includes('alta');
    if (highVol) {
      alerts.push({
        title: 'Revisar estratégia',
        detail: 'Volatilidade elevada. Considere revisar a estratégia no próximo ciclo — sem urgência.',
        tone: 'info'
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        title: 'Monitoramento ativo',
        detail: `Nenhum alerta crítico. Seguimos acompanhando com frequência ${alertFrequency}.`,
        tone: 'info'
      });
    }

    return alerts;
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in">
       <div className="relative">
          <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
          <Radar className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={32} />
       </div>
       <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-[#0d3b4c] uppercase tracking-tighter">Sincronizando Mercado Real...</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Consultando Redes e Indicadores...</p>
       </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in">
      {error && (
        <div className="bg-red-50 text-red-800 border border-red-200 p-4 rounded-2xl text-sm font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchData(country)} className="px-4 py-2 text-xs font-black rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">Tentar novamente</button>
        </div>
      )}
      {cachedNotice && !error && (
        <div className="bg-amber-50 text-amber-900 border border-amber-200 p-4 rounded-2xl text-sm font-semibold flex items-center justify-between">
          <span>{cachedNotice}</span>
          <button onClick={() => fetchData(country)} className="px-4 py-2 text-xs font-black rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors">Atualizar agora</button>
        </div>
      )}
      {/* Top Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
           <h1 className="text-5xl font-black text-[#0d3b4c] tracking-tighter uppercase leading-none">PANORAMA DE MERCADO</h1>
           <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
             <Globe size={14}/> {country.toUpperCase()} • ATUALIZADO RECENTEMENTE
           </div>
           <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
             <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">{ENGINE_VERSION.label}</span>
             <span className="px-3 py-1 rounded-xl bg-gray-50 border border-gray-100 text-gray-600">{ENGINE_VERSION.version}</span>
             <span className="px-3 py-1 rounded-xl bg-white border border-gray-100 text-gray-500">Atualizado em {ENGINE_VERSION.updatedAt}</span>
           </div>
           <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
             <span className="text-gray-400">Glossário contextual:</span>
             <Link to="/glossary" className="px-3 py-1 rounded-full bg-white border border-gray-100 text-[#0d3b4c] hover:border-emerald-200 transition">Reserva</Link>
             <Link to="/glossary" className="px-3 py-1 rounded-full bg-white border border-gray-100 text-[#0d3b4c] hover:border-emerald-200 transition">Risco</Link>
             <Link to="/glossary" className="px-3 py-1 rounded-full bg-white border border-gray-100 text-[#0d3b4c] hover:border-emerald-200 transition">Diversificação</Link>
             <Link to="/glossary" className="px-3 py-1 rounded-full bg-white border border-gray-100 text-[#0d3b4c] hover:border-emerald-200 transition">Volatilidade</Link>
              <span className="text-gray-400">Linguagem: {userLevel === 'iniciante' ? 'Explicativa' : userLevel === 'avancado' ? 'Dados rápidos' : 'Balanceada'}</span>
           </div>
        </div>
        <div className="bg-white border border-gray-100 p-1 rounded-2xl flex gap-1 shadow-sm">
           <button 
             onClick={() => setCountry('Brasil')}
             className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${country === 'Brasil' ? 'bg-[#0d3b4c] text-white' : 'text-gray-400 hover:text-gray-600'}`}
           >Brasil</button>
           <button 
             onClick={() => setCountry('EUA')}
             className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${country === 'EUA' ? 'bg-[#0d3b4c] text-white' : 'text-gray-400 hover:text-gray-600'}`}
           >EUA</button>
        </div>
      </div>

      {!data && !loading && (
        <div className="bg-red-50 text-red-800 border border-red-200 p-6 rounded-2xl text-sm font-semibold flex items-center justify-between">
          <span>{error || 'Panorama não carregado. Tente novamente.'}</span>
          <button onClick={() => fetchData(country)} className="px-4 py-2 text-xs font-black rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors">Tentar novamente</button>
        </div>
      )}

      {data && (
        <div className="space-y-16">
          {(() => {
            const overview = data.market_overview || { summary: '', interestRate: null, inflation: null, volatility: '', notes: '' };
            const sections = data.sections || { acoes_em_acompanhamento: [], renda_fixa_em_destaque: [], cripto_em_acompanhamento: [], outros_temas: [] };
            const acoes = sections.acoes_em_acompanhamento || [];
            const rendaFixa = sections.renda_fixa_em_destaque || [];
            const crip = sections.cripto_em_acompanhamento || [];
            const outros = sections.outros_temas || [];
            const contextualAlerts = buildAlerts(data, previousSnapshot);
            return (
              <>
          {/* Hero Section Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Strategy Card */}
            <div className="lg:col-span-2 bg-white p-12 rounded-[48px] border border-gray-50 shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5">
                  <BarChart2 size={120} />
               </div>
               <div className="space-y-8 relative">
                  <div className="flex items-center gap-3 text-emerald-500">
                    <Zap size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Visão Geral Estratégica</span>
                  </div>
                  <blockquote className="text-3xl font-black text-[#0d3b4c] leading-[1.2] tracking-tight">
                    "{overview.summary}"
                  </blockquote>
                  <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-50">
                    <div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Taxa de Juros</div>
                      <div className="text-2xl font-black text-[#0d3b4c]">{overview.interestRate ?? '—'}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Inflação (Ano)</div>
                      <div className="text-2xl font-black text-[#0d3b4c]">{overview.inflation ?? '—'}%</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volatilidade</div>
                      <div className="text-2xl font-black text-emerald-500 uppercase">{overview.volatility || 'N/A'}</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Sidebar Destaque */}
            <div className="bg-[#0d3b4c] p-10 rounded-[48px] text-white shadow-2xl flex flex-col justify-between group">
               <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Destaque Macro</h3>
                  <p className="text-sm font-medium leading-relaxed opacity-80">
                    {overview.notes || "Otimização de alocação recomendada para preservação de capital e captura de prêmios de risco em taxas nominais."}
                  </p>
               </div>
               <Link to="/wizard" className="mt-8 bg-emerald-500 text-white p-6 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-between hover:bg-emerald-400 transition-all shadow-lg group-hover:scale-105">
                  <span>Simular Minha Reserva</span>
                  <Sparkles size={16} />
               </Link>
            </div>
          </div>

          {/* Insights Rápidos */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Radar size={18} className="text-emerald-500" />
                <h3 className="text-sm font-black text-[#0d3b4c] uppercase tracking-widest">Alertas de Mercado</h3>
              </div>
              {data.general_warnings && data.general_warnings.length > 0 ? (
                <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-600 list-disc list-inside">
                  {data.general_warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Sem alertas críticos no momento.</p>
              )}
            </div>
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Info size={18} className="text-emerald-500" />
                <h3 className="text-sm font-black text-[#0d3b4c] uppercase tracking-widest">Indicadores</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] font-black uppercase text-emerald-600">Juros</div>
                  <div className="text-xl font-black text-[#0d3b4c]">{overview.interestRate ?? '—'}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                  <div className="text-[10px] font-black uppercase text-amber-600">Inflação</div>
                  <div className="text-xl font-black text-[#0d3b4c]">{overview.inflation ?? '—'}%</div>
                </div>
                <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <div className="text-[10px] font-black uppercase text-indigo-600">Volatilidade</div>
                  <div className="text-xl font-black text-[#0d3b4c] uppercase">{overview.volatility || 'N/A'}</div>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="text-[10px] font-black uppercase text-gray-500">País</div>
                  <div className="text-xl font-black text-[#0d3b4c]">{country}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Monitoramento e Alertas */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 text-emerald-500">
                  <Bell size={18} />
                  <h3 className="text-sm font-black text-[#0d3b4c] uppercase tracking-widest">Monitoramento e alertas inteligentes</h3>
                </div>
                <p className="text-sm text-gray-500 mt-1">Acompanhamos cenário macro e risco sem pressionar decisões. Usar para revisar, não para agir agora.</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="text-gray-500">Frequência:</span>
                {['mensal', 'trimestral'].map(freq => (
                  <button
                    key={freq}
                    onClick={() => setAlertFrequency(freq)}
                    className={`px-4 py-2 rounded-xl border text-xs font-black uppercase transition-all ${alertFrequency === freq ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-200'}`}
                  >
                    {freq === 'mensal' ? 'Mensal' : 'Trimestral'}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {contextualAlerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${alert.tone === 'warn' ? 'border-amber-200 bg-amber-50' : 'border-emerald-100 bg-emerald-50/60'} flex gap-3`}>
                  <div className={`p-2 rounded-xl ${alert.tone === 'warn' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {alert.tone === 'warn' ? <AlertTriangle size={16} /> : <Info size={16} />}
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-black uppercase tracking-widest text-[#0d3b4c]">{alert.title}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{alert.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações em Acompanhamento */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <Activity className="text-[#0d3b4c]" size={20} />
               <h2 className="text-xl font-black text-[#0d3b4c] uppercase tracking-tighter">Ações em Acompanhamento</h2>
            </div>
             {acoes.length === 0 ? (
               <div className="text-sm text-gray-500">Sem Ações retornadas pelo provedor.</div>
             ) : (
               <div className="grid md:grid-cols-3 gap-8">
                  {acoes.map((acao, i) => (
                    <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-lg space-y-5 hover:-translate-y-2 transition-all">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className="text-2xl font-black text-[#0d3b4c] leading-none">{acao.symbol}</h4>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{acao.name}</span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-3 py-1 rounded-full text-[9px] font-black ${acao?.variation !== undefined && acao.variation >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {acao?.variation !== undefined ? `${acao.variation >= 0 ? '+' : ''}${acao.variation}%` : '—'}
                          </div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                            <BarChart className="w-3 h-3" /> {acao.marketRelevance || 'Relevância não informada'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Por que aqui?</div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed min-h-[48px]">
                          {acao.why_in_dashboard || 'Selecionado por volume, volatilidade e menções recentes.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-emerald-500" /> Volatilidade: <span className="text-[#0d3b4c]">{acao.volatility || 'Média'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={12} className="text-amber-500" /> Risco: <span className="text-[#0d3b4c] truncate">{acao.risk_note || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={12} className="text-sky-500" /> Variação: <span className="text-[#0d3b4c]">{acao?.variation !== undefined ? `${acao.variation}%` : '—'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PieChart size={12} className="text-indigo-500" /> Critério: <span className="text-[#0d3b4c]">Volume & relevância</span>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>

          {/* Renda Fixa & Cripto Row */}
          <div className="grid lg:grid-cols-2 gap-12">
             {/* Renda Fixa */}
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <ShieldCheck className="text-[#0d3b4c]" size={20} />
                  <h2 className="text-xl font-black text-[#0d3b4c] uppercase tracking-tighter">Renda Fixa em Destaque</h2>
               </div>
                <div className="space-y-4">
                   {rendaFixa.map((rf, i) => (
                     <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm flex flex-col gap-4 group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="bg-gray-50 px-4 py-2 rounded-xl text-[9px] font-black text-emerald-500 uppercase tracking-tight">
                              {rf.type}
                           </div>
                           <div>
                              <div className="text-sm font-black text-[#0d3b4c] uppercase">{rf.indexer}</div>
                              <div className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Taxa Referencial</div>
                           </div>
                        </div>
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Por que aqui?</div>
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                           {rf.why_in_dashboard || 'Selecionado por estabilidade, Liquidez e cobertura do FGC quando aplicável.'}
                        </p>
                        <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                          <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">Liquidez: {rf.liquidity || '—'}</span>
                          <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">Benefício fiscal: {rf.tax_benefit || '—'}</span>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Cripto */}
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <Coins className="text-[#0d3b4c]" size={20} />
                  <h2 className="text-xl font-black text-[#0d3b4c] uppercase tracking-tighter">Cripto em Acompanhamento</h2>
               </div>
                <div className="grid grid-cols-2 gap-4">
                   {crip.map((cripto, i) => (
                     <div key={i} className="bg-[#050b0d] p-8 rounded-[40px] text-white shadow-xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-4 right-4 text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{cripto.volatility || 'Alta'}</div>
                        <div>
                           <div className="text-emerald-400 font-black text-sm uppercase">{cripto.symbol}</div>
                           <div className="text-3xl font-black mt-1">${cripto.price?.toLocaleString()}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-[9px] font-black text-emerald-300 uppercase tracking-widest">Por que aqui?</div>
                          <p className="text-[11px] text-gray-300 font-medium leading-tight min-h-[44px]">
                            {cripto.risk_note || 'Ativo incluído pela relevância recente e perfil de risco.'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest">
                          <span className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">Relevância <span className="text-emerald-300">{cripto.marketRelevance || '—'}</span></span>
                          <span className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">Volatilidade <span className="text-emerald-300">{cripto.volatility || 'Alta'}</span></span>
                          <span className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">Variação <span className="text-emerald-300">{cripto?.variation !== undefined ? `${cripto.variation}%` : '—'}</span></span>
                          <span className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">Preço spot <span className="text-emerald-300">${cripto.price?.toLocaleString() || '—'}</span></span>
                        </div>
                     </div>
                  ))}
               </div>
             </div>
         </div>

          {/* Temas Relevantes */}
          {outros && outros.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="text-[#0d3b4c]" size={20} />
                <h2 className="text-xl font-black text-[#0d3b4c] uppercase tracking-tighter">Temas Relevantes</h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Critérios: volume • volatilidade • contexto macro</span>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {outros.map((tema: any, idx: number) => {
                  const title = typeof tema === 'string' ? tema : (tema?.title || tema?.topic || 'Tema em destaque');
                  const reason = typeof tema === 'string' ? 'Sinal recorrente observado pelo modelo.' : (tema?.reason || tema?.why || 'Sinal recorrente observado pelo modelo.');
                  return (
                    <div key={idx} className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Por que aqui?</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Macro + Relevância</span>
                      </div>
                      <p className="text-sm font-black text-[#0d3b4c] leading-snug">{title}</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          </>
        );
      })()}
        </div>
      )}

      {/* Footer Disclaimer */}
      <footer className="pt-24 pb-8 border-t border-gray-100 flex flex-col items-center gap-6 opacity-40">
        <div className="flex items-center gap-3 font-bold">
           <ShieldCheck size={20} className="text-[#0d3b4c]" />
           <span className="text-sm font-black text-[#0d3b4c] uppercase tracking-widest">RESERVE ADVISOR</span>
        </div>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
           <Link to="/chat">Conversar</Link>
           <Link to="/dashboard">Panorama</Link>
           <Link to="/how-it-works">Como Funciona</Link>
           <Link to="/glossary">Glossário</Link>
        </div>
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 text-center max-w-xl">
           Dados educacionais. Não constitui recomendação formal de investimento. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
};

const ChatPage = () => {
  const [messages, setMessages] = useState<{role: string, parts: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', parts: input };
    const history = [...messages, userMsg];
    setMessages(history); setInput(''); setLoading(true);
    try {
      const savedConfig = localStorage.getItem('reserveAdvisor:aiConfig');
      const aiConfig = savedConfig ? JSON.parse(savedConfig) : DEFAULT_AI_CONFIG;
      const aiService = getAIService(aiConfig.provider);
      const response = await aiService.getEducationalChatResponse(history, aiConfig);
      setMessages([...history, { role: 'model', parts: response }]);
    } catch (e: any) {
      console.error(e);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 h-[80vh] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-8 rounded-[40px] shadow-2xl ${m.role === 'user' ? 'bg-[#0d3b4c] text-white rounded-tr-none' : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'}`}>
              <p className="text-sm font-medium leading-relaxed">{m.parts}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-emerald-500 animate-pulse font-black uppercase text-[10px]">Analisando...</div>}
      </div>
      <div className="relative mt-8">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Dúvidas sobre sua reserva?" className="w-full bg-white border border-gray-100 rounded-[32px] px-10 py-8 outline-none shadow-2xl text-sm font-bold" />
        <button onClick={handleSend} className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-5 rounded-full shadow-xl"><Send size={24} /></button>
      </div>
    </div>
  );
};

const ResultsPage = () => {
  const { simulationId } = useParams<{ simulationId: string }>();
  const [sim, setSim] = useState<Simulation | null>(null);
  const [advancedEnabled, setAdvancedEnabled] = useState(false);
  useEffect(() => { if (simulationId) localStorageRepository.getSimulationById(simulationId).then(setSim); }, [simulationId]);
  useEffect(() => {
    if (sim?.hasAdvancedOptIn) setAdvancedEnabled(true);
  }, [sim]);
  if (!sim) return <div className="p-20 text-center uppercase font-black text-gray-400 animate-pulse">Carregando...</div>;

  const recommendations = sim.results?.recommendations || [];
  const alternatives = sim.results?.alternatives || [];
  const hasSummary = !!sim.results?.summary;
  const adv = sim.results?.advancedAnalysis;

  const investmentValue = sim.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const scenarioCards = [
    {
      id: 'base',
      title: 'Cenário Base',
      tone: 'info',
      bullets: [
        `Mantém rota atual com ${sim.riskProfile.toLowerCase()} de risco e volatilidade ${sim.volatilityAcceptance.toLowerCase()}.`,
        'Juros estáveis; inflação controlada no horizonte definido.',
        'Aportes recorrentes seguem o plano sem ajustes emergenciais.',
      ],
    },
    {
      id: 'adverso',
      title: 'Cenário Adverso',
      tone: 'warn',
      bullets: [
        'Choque de juros/inflação; ativos de risco sofrem mais (quedas temporárias).',
        'Liquidez diária e proteção (FGC/Tesouro) amortecem parte da queda.',
        'Revisar estratégia no próximo ciclo, sem executar venda forçada.',
      ],
    },
    {
      id: 'otimista',
      title: 'Cenário Otimista',
      tone: 'info',
      bullets: [
        'Queda gradual de juros; melhora de crédito e bolsa.',
        'Rebalancear mantendo diversificação para não concentrar riscos.',
        'Aproveitar prêmio de risco sem ultrapassar limite da carteira.',
      ],
    },
  ];

  const stressNotes = [
    'Volatilidade: simula choques de curto prazo; reserve liquidez para 3-6 meses.',
    'Juros: subida inesperada reduz renda variável, melhora carrego de renda fixa indexada.',
    'Eventos externos: política/fiscal/commodities podem alterar correlação; diversifique classes.',
  ];

  return (
    <div className="max-w-5xl mx-auto py-20 px-6 space-y-12 animate-in fade-in">
      <div className="bg-white p-16 rounded-[64px] shadow-2xl border border-gray-50">
        <h1 className="text-5xl font-black text-[#0d3b4c] uppercase tracking-tighter mb-8">Diagnóstico de Reserva</h1>
        <p className="text-sm text-gray-500 font-medium mb-4">Linguagem adaptada: {(() => { const lvl = (() => { try { return loadUserLevel(); } catch { return 'intermediario'; } })(); return lvl === 'iniciante' ? 'mais explicações' : lvl === 'avancado' ? 'mais dados, menos texto' : 'balanceado'; })()}</p>
        {hasSummary && (
          <div className="bg-emerald-50 p-8 rounded-[32px] mb-12 border border-emerald-100">
            <p className="text-gray-600 font-medium italic leading-relaxed">{sim.results.summary}</p>
          </div>
        )}

        {/* Cenários e Stress Test */}
        <div className="space-y-8 mb-12">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-black text-[#0d3b4c] uppercase tracking-tight">Cenários & Stress Test</h2>
              <p className="text-sm text-gray-500 font-medium mt-1">Visão consultiva para {investmentValue} {sim.currency} — foco em risco antes do retorno.</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">Não é call de trade</span>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {scenarioCards.map(card => (
              <div key={card.id} className={`p-6 rounded-[28px] border ${card.tone === 'warn' ? 'border-amber-200 bg-amber-50' : 'border-emerald-100 bg-emerald-50/70'} space-y-3`}>
                <div className="flex items-center gap-2 text-[#0d3b4c]">
                  {card.tone === 'warn' ? <AlertTriangle size={16} className="text-amber-600" /> : <Shield size={16} className="text-emerald-600" />}
                  <div className="text-sm font-black uppercase tracking-widest">{card.title}</div>
                </div>
                <ul className="space-y-2 text-sm text-gray-700 leading-relaxed list-disc list-inside">
                  {card.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#0d3b4c] mb-2">
              <Target size={16} className="text-emerald-600" />
              <div className="text-sm font-black uppercase tracking-widest">Stress test conceitual</div>
            </div>
            <ul className="grid md:grid-cols-3 gap-3 text-sm text-gray-700 leading-relaxed list-disc list-inside">
              {stressNotes.map((n, idx) => <li key={idx}>{n}</li>)}
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-[28px] p-6">
            <div className="flex items-center gap-2 text-[#0d3b4c] mb-2">
              <Layers size={16} className="text-emerald-600" />
              <div className="text-sm font-black uppercase tracking-widest">Por que cada classe está na alocação</div>
            </div>
            {recommendations.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-white border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-black text-[#0d3b4c] uppercase">{rec.title}</h4>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{rec.allocationPercent ? `${rec.allocationPercent}%` : ''}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{rec.why || 'Mantém equilíbrio de liquidez, estabilidade e crescimento.'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Aguardando justificativas do modelo.</p>
            )}
          </div>
        </div>

        {/* Análise Avançada (Opt-in) */}
        {adv && (
          <div className="space-y-6 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#0d3b4c] uppercase tracking-tight">Análise Avançada (Opt-in)</h2>
                <p className="text-sm text-gray-500 font-medium">Recursos consultivos adicionais; use com cautela e sem timing de mercado.</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" /> Aviso explícito
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#0d3b4c]">
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" checked={advancedEnabled} onChange={e => setAdvancedEnabled(e.target.checked)} />
                  Ativar Modo Avançado
                </label>
              </div>
            </div>
            {!advancedEnabled ? (
              <div className="p-6 rounded-[24px] border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
                Ative o modo avançado para ver exemplos de ativos, quantidades estimadas e faixas históricas. Não é recomendação nem convite a operar agora.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Ativos exemplificativos */}
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={16} className="text-emerald-600" />
                    <div className="text-sm font-black uppercase tracking-widest text-[#0d3b4c]">Ativos exemplificativos</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ações • ETFs • Cripto</span>
                  </div>
                  {adv.examples_analyzed && adv.examples_analyzed.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {adv.examples_analyzed.map((ex, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-sm font-black text-[#0d3b4c] uppercase">{ex.symbol} • {ex.name}</div>
                              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{ex.category}</div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{ex.volatility} VOL</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-2">Preço aprox.: {ex.price ? `$${ex.price}` : '—'} • Liquidez {ex.liquidity} • Tendência {ex.trend}</div>
                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">Por que aqui: {ex.why_in_scope}</p>
                          {ex.key_risks && ex.key_risks.length > 0 && (
                            <ul className="mt-2 text-xs text-amber-700 space-y-1 list-disc list-inside">
                              {ex.key_risks.map((r, i2) => <li key={i2}>{r}</li>)}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Modelo não enviou exemplos de ativos.</p>
                  )}
                </div>

                {/* Conversão em valores */}
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Target size={16} className="text-emerald-600" />
                    <div className="text-sm font-black uppercase tracking-widest text-[#0d3b4c]">Conversão em valores (dentro do risco)</div>
                  </div>
                  {adv.allocation_examples?.positions && adv.allocation_examples.positions.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">Risco usado: {adv.allocation_examples.risk_amount_used?.toLocaleString() || '—'} • Nota: {adv.allocation_examples.important_note}</div>
                      <div className="grid md:grid-cols-2 gap-3">
                        {adv.allocation_examples.positions.map((pos, idx) => (
                          <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-black text-[#0d3b4c] uppercase">{pos.symbol}</span>
                              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Estimado</span>
                            </div>
                            <div className="text-sm text-gray-700">Preço: {pos.estimated_unit_price ?? '—'} • Qtd: {pos.estimated_units ?? '—'} • Custo: {pos.estimated_cost ?? '—'}</div>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{pos.notes}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Sem exemplos de conversão em valores.</p>
                  )}
                </div>

                {/* Zonas de preço */}
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <PieChart size={16} className="text-emerald-600" />
                    <div className="text-sm font-black uppercase tracking-widest text-[#0d3b4c]">Zonas de preço (faixas históricas)</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nunca timing exato</span>
                  </div>
                  {adv.price_zones && adv.price_zones.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {adv.price_zones.map((pz, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-[#0d3b4c] uppercase">{pz.symbol}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{pz.dataConfidence}</span>
                          </div>
                          <div className="text-sm text-gray-700 mt-1">Faixa: {pz.range || '—'}</div>
                          <p className="text-sm text-gray-600 leading-relaxed mt-1">{pz.explanation || 'Faixa histórica fornecida pelo modelo (sem indicação de ponto de entrada).'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Modelo não trouxe faixas históricas.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {recommendations.length > 0 ? (
          <div className="grid gap-6">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-10 bg-gray-50 rounded-[40px] border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-black text-[#0d3b4c] uppercase">{rec.title}</h3>
                  {'allocationPercent' in rec && rec.allocationPercent !== undefined ? (
                    <span className="bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black">{rec.allocationPercent}%</span>
                  ) : null}
                </div>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{rec.why || 'Sem descrição fornecida.'}</p>
                {rec.pros && rec.pros.length > 0 && (
                  <ul className="mt-4 text-xs text-gray-600 space-y-1 list-disc list-inside">
                    {rec.pros.map((p: string, idx: number) => <li key={idx}>{p}</li>)}
                  </ul>
                )}
                {rec.cons && rec.cons.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-500 space-y-1 list-disc list-inside">
                    {rec.cons.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 bg-amber-50 border border-amber-200 rounded-[40px] text-amber-900 font-semibold">
            O modelo Não retornou recomendAções em formato esperado. Tente gerar novamente ou usar outro modelo.
          </div>
        )}

        {alternatives.length > 0 && (
          <div className="mt-12 space-y-4">
            <h2 className="text-xl font-black text-[#0d3b4c] uppercase tracking-tight">Alternativas</h2>
            <div className="grid gap-4">
              {alternatives.map((alt, i) => (
                <div key={i} className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-black text-[#0d3b4c] uppercase">{alt.title}</h3>
                    {'allocationPercent' in alt && alt.allocationPercent !== undefined ? (
                      <span className="bg-gray-800 text-white px-4 py-1 rounded-full text-[10px] font-black">{alt.allocationPercent}%</span>
                    ) : null}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{alt.why || 'Sem descrição fornecida.'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const [list, setList] = useState<Simulation[]>([]);
  useEffect(() => { localStorageRepository.listSimulations().then(setList); }, []);
  return (
    <div className="max-w-5xl mx-auto py-20 px-6 space-y-12">
      <h1 className="text-5xl font-black text-[#0d3b4c] uppercase tracking-tighter">Histórico</h1>
      <div className="grid gap-4">
        {list.map(s => (
          <Link key={s.id} to={`/results/${s.id}`} className="p-10 bg-white rounded-[40px] border border-gray-100 hover:border-emerald-500 transition-all shadow-sm flex justify-between items-center group">
              <div>
                <div className="text-xl font-black text-[#0d3b4c] uppercase">{new Date(s.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{s.value} {s.currency} â€¢ {s.riskProfile}</div>
              </div>
              <ChevronRight className="text-emerald-500 group-hover:translate-x-2 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
};

const HowItWorksPage = () => (
  <div className="max-w-6xl mx-auto py-20 px-6 space-y-12">
      <div className="space-y-3 text-center">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Governança e Transparência</div>
        <h1 className="text-5xl font-black text-[#0d3b4c] uppercase tracking-tighter">Como o Reserve Advisor funciona</h1>
        <div className="text-sm text-gray-500 font-semibold uppercase tracking-[0.2em]">Modelo de Análise v1.0 — Atualizado em 05/02/2026</div>
      </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-3 text-emerald-500 font-black uppercase text-[11px] tracking-[0.3em]">
          <Radar size={16} /> Origem dos Dados
        </div>
        <p className="text-sm text-gray-600">Mercado em tempo real via provedores de IA configurados (ex.: OpenAI/Gemini) com prompts estruturados para analise de investimento. Nenhuma decisão é tomada sem a resposta do provedor.</p>
      </div>
      <div className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-3 text-indigo-500 font-black uppercase text-[11px] tracking-[0.3em]">
          <Cpu size={16} /> Regra de Negócio vs IA
        </div>
        <p className="text-sm text-gray-600">Regras de negócio definem o cálculo de perfil, camadas de Liquidez/estabilidade/crescimento e limites de risco. A IA é usada para explicar e detalhar as alocações em linguagem natural.</p>
      </div>
      <div className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-3 text-rose-500 font-black uppercase text-[11px] tracking-[0.3em]">
          <AlertTriangle size={16} /> O que o sistema NÃO faz
        </div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Não executa ordens ou recomenda compra/venda.</li>
          <li>Não garante retorno financeiro.</li>
          <li>Não substitui aconselhamento profissional certificado.</li>
        </ul>
      </div>
      <div className="bg-white p-8 rounded-[28px] border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-3 text-amber-500 font-black uppercase text-[11px] tracking-[0.3em]">
          <Info size={16} /> Avisos Padronizados
        </div>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>Conteúdo educacional.</li>
          <li>Não constitui recomendação formal.</li>
          <li>Decisão final sempre do usuário.</li>
        </ul>
      </div>
    </div>
  </div>
);

const GlossaryPage = () => (
  <div className="max-w-7xl mx-auto py-20 px-6 space-y-16">
    <h1 className="text-6xl font-black text-[#0d3b4c] uppercase tracking-tighter text-center">GLOSSÁRIO</h1>
    <p className="text-center text-gray-500 font-medium">Aprenda enquanto usa: o que é, para que serve, impacto prático e atenções.</p>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {GLOSSARY_TERMS.map(term => (
        <div key={term.id} className="p-10 bg-white rounded-[48px] border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">{term.icon}</div>
            <div>
              <h3 className="font-black text-[#0d3b4c] uppercase">{term.title}</h3>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">{term.category}</div>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
            <div><span className="font-bold text-[#0d3b4c]">O que é:</span> {term.whatIs}</div>
            <div><span className="font-bold text-[#0d3b4c]">Para que serve:</span> {term.useFor}</div>
            <div><span className="font-bold text-[#0d3b4c]">Impacto prático:</span> {term.impact}</div>
            <div><span className="font-bold text-[#0d3b4c]">Atenções:</span> {term.caution}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#fcfdfe]">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="/results/:simulationId" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/glossary" element={<GlossaryPage />} />
          </Routes>
        </main>
        <Link to="/chat" className="fixed bottom-10 right-10 w-24 h-24 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[100] border-8 border-white group">
           <MessageSquare size={36} className="group-hover:rotate-12 transition-transform" />
        </Link>
      </div>
    </Router>
  );
}






