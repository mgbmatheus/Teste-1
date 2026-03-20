import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/index.js';
import { cacheService } from './cache.service.js';
import type { DadosConsolidados, DiagnosticoIA, PlanoObras } from '../types/index.js';

const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

export class ClaudeService {
  async gerarDiagnostico(codIBGE: string, dados: DadosConsolidados): Promise<DiagnosticoIA> {
    const cacheKey = `diagnostico:${codIBGE}`;
    const cached = await cacheService.get<DiagnosticoIA>(cacheKey);
    if (cached) return cached;

    const prompt = this.buildDiagnosticoPrompt(dados);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta da IA não contém JSON válido');

    const diagnostico: DiagnosticoIA = {
      ...JSON.parse(jsonMatch[0]),
      geradoEm: new Date().toISOString(),
    };

    await cacheService.setHours(cacheKey, diagnostico, 'diagnostico', config.cache.diagnosticoTTLHours);
    return diagnostico;
  }

  async gerarPlano(codIBGE: string, dados: DadosConsolidados, diagnostico: DiagnosticoIA): Promise<PlanoObras> {
    const cacheKey = `plano:${codIBGE}`;
    const cached = await cacheService.get<PlanoObras>(cacheKey);
    if (cached) return cached;

    const prompt = this.buildPlanoPrompt(dados, diagnostico);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta da IA não contém JSON válido');

    const plano: PlanoObras = {
      ...JSON.parse(jsonMatch[0]),
      geradoEm: new Date().toISOString(),
    };

    await cacheService.setHours(cacheKey, plano, 'plano', config.cache.planoTTLHours);
    return plano;
  }

  private buildDiagnosticoPrompt(dados: DadosConsolidados): string {
    return `Você é um analista sênior de planejamento urbano e gestão municipal brasileira.

Analise os dados reais do município abaixo e gere um diagnóstico completo de vulnerabilidades.

## DADOS DO MUNICÍPIO: ${dados.municipio.nome} - ${dados.municipio.ufSigla}

### Localização
- Microrregião: ${dados.municipio.microrregiao}
- Mesorregião: ${dados.municipio.mesorregiao}
- Região: ${dados.municipio.regiao}

### Indicadores Socioeconômicos (IBGE)
- População: ${dados.indicadores.populacao?.toLocaleString('pt-BR') ?? 'Não disponível'}
- PIB per capita: ${dados.indicadores.pibPerCapita ? `R$ ${dados.indicadores.pibPerCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não disponível'}
- IDH: ${dados.indicadores.idh ?? 'Não disponível'}
- Área: ${dados.indicadores.areaKm2 ? `${dados.indicadores.areaKm2.toLocaleString('pt-BR')} km²` : 'Não disponível'}
- Densidade demográfica: ${dados.indicadores.densidadeDemografica ? `${dados.indicadores.densidadeDemografica} hab/km²` : 'Não disponível'}

### Saúde (DataSUS/CNES)
- Dados disponíveis: ${dados.saude.disponivel ? 'Sim' : 'Não'}
- Total de estabelecimentos: ${dados.saude.totalEstabelecimentos}
- Hospitais: ${dados.saude.hospitais}
- UBS (Unidades Básicas de Saúde): ${dados.saude.ubs}
- UPA: ${dados.saude.upa}
- Clínicas: ${dados.saude.clinicas}

### Saneamento (SNIS)
- Cobertura de água: ${dados.saneamento.coberturaAgua ? `${dados.saneamento.coberturaAgua}%` : 'Não disponível'}
- Cobertura de esgoto: ${dados.saneamento.coberturaEsgoto ? `${dados.saneamento.coberturaEsgoto}%` : 'Não disponível'}
- Tratamento de esgoto: ${dados.saneamento.tratamentoEsgoto ? `${dados.saneamento.tratamentoEsgoto}%` : 'Não disponível'}
- Perda na distribuição: ${dados.saneamento.perdaDistribuicao ? `${dados.saneamento.perdaDistribuicao}%` : 'Não disponível'}
- Fonte: ${dados.saneamento.fonte}

### Fontes de Financiamento
${dados.financeiro.fontesDisponiveis.map(f => `- ${f}`).join('\n')}

## INSTRUÇÕES

Retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto antes ou depois) com esta estrutura:

{
  "resumo": "Texto descritivo de 3-5 parágrafos sobre a situação geral do município, seus desafios e potencialidades",
  "perfilMunicipio": "Classificação do município (pequeno porte, médio porte, etc.) com contexto regional",
  "vulnerabilidades": [
    {
      "titulo": "Nome da vulnerabilidade",
      "descricao": "Descrição detalhada baseada nos dados",
      "severidade": "critico|alto|medio|baixo",
      "area": "saude|saneamento|educacao|infraestrutura|economia|habitacao|mobilidade",
      "indicadorRelacionado": "Qual indicador evidencia essa vulnerabilidade",
      "recomendacao": "Ação recomendada para mitigar"
    }
  ],
  "rankingPrioridades": ["Lista ordenada das 5 principais prioridades para o município"],
  "pontosFortesIdentificados": ["Aspectos positivos identificados nos dados"]
}

Gere entre 6 e 12 vulnerabilidades, distribuídas entre as severidades. Baseie-se EXCLUSIVAMENTE nos dados fornecidos.`;
  }

  private buildPlanoPrompt(dados: DadosConsolidados, diagnostico: DiagnosticoIA): string {
    return `Você é um engenheiro de planejamento urbano e especialista em obras públicas municipais brasileiras.

Com base no diagnóstico de vulnerabilidades do município ${dados.municipio.nome} - ${dados.municipio.ufSigla}, elabore um plano de obras prioritárias.

## PERFIL DO MUNICÍPIO
- População: ${dados.indicadores.populacao?.toLocaleString('pt-BR') ?? 'N/D'}
- PIB per capita: ${dados.indicadores.pibPerCapita ? `R$ ${dados.indicadores.pibPerCapita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/D'}
- IDH: ${dados.indicadores.idh ?? 'N/D'}
- Região: ${dados.municipio.regiao}

## DIAGNÓSTICO DE VULNERABILIDADES
${diagnostico.vulnerabilidades.map(v => `- [${v.severidade.toUpperCase()}] ${v.titulo}: ${v.descricao}`).join('\n')}

## RANKING DE PRIORIDADES
${diagnostico.rankingPrioridades.map((p, i) => `${i + 1}. ${p}`).join('\n')}

## FONTES DE FINANCIAMENTO DISPONÍVEIS
${dados.financeiro.fontesDisponiveis.map(f => `- ${f}`).join('\n')}

## INSTRUÇÕES

Retorne EXCLUSIVAMENTE um JSON válido (sem markdown, sem texto antes ou depois) com esta estrutura:

{
  "obras": [
    {
      "id": 1,
      "titulo": "Nome da obra",
      "categoria": "Saneamento|Saúde|Educação|Infraestrutura|Habitação|Mobilidade|Meio Ambiente",
      "descricao": "Descrição detalhada da obra proposta",
      "custoEstimado": 1500000,
      "custoFormatado": "R$ 1.500.000,00",
      "prazo": "curto|medio|longo",
      "duracaoMeses": 18,
      "fonteFinanciamento": ["PAC", "FUNASA"],
      "justificativa": "Por que esta obra é necessária, baseada no diagnóstico",
      "impactoEsperado": "Resultado esperado para a população",
      "prioridade": 1
    }
  ],
  "cronograma": {
    "curtoPrazo": [],
    "medioPrazo": [],
    "longoPrazo": []
  },
  "investimentoTotal": 25000000,
  "investimentoTotalFormatado": "R$ 25.000.000,00",
  "fontesRecomendadas": [
    {
      "nome": "Nome do programa",
      "descricao": "Como acessar este financiamento",
      "tipo": "Federal|Estadual|Crédito|Emenda"
    }
  ],
  "resumoExecutivo": "Texto de 2-3 parágrafos resumindo o plano completo"
}

Gere entre 8 e 15 obras. Custos devem ser realistas para municípios brasileiros.
- Curto prazo: 0-12 meses (obras emergenciais e de baixo custo)
- Médio prazo: 1-3 anos (obras estruturantes)
- Longo prazo: 3-10 anos (grandes investimentos)

O campo "cronograma" deve conter as mesmas obras do campo "obras", agrupadas por prazo.
Custos devem considerar o porte do município e valores praticados no mercado brasileiro.`;
  }
}

export const claudeService = new ClaudeService();
