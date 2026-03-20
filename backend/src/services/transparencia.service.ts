import { createHttpClient } from '../utils/http.js';
import { config } from '../config/index.js';
import { cacheService } from './cache.service.js';
import type { DadosFinanceiro } from '../types/index.js';

const FONTES_FINANCIAMENTO_PADRAO = [
  'PAC - Programa de Aceleração do Crescimento',
  'FGTS - Financiamento de Saneamento e Infraestrutura',
  'BNDES - Banco Nacional de Desenvolvimento',
  'FUNASA - Fundação Nacional de Saúde',
  'FPM - Fundo de Participação dos Municípios',
  'FUNDEB - Fundo de Educação Básica',
  'SUS - Transferências do Sistema Único de Saúde',
  'Emendas Parlamentares',
  'CIDE - Contribuição sobre Combustíveis',
  'Operações de Crédito com Garantia da União',
];

export class TransparenciaService {
  async getTransferencias(codIBGE: string): Promise<DadosFinanceiro> {
    const cacheKey = `transparencia:${codIBGE}`;
    const cached = await cacheService.get<DadosFinanceiro>(cacheKey);
    if (cached) return cached;

    // If API key is configured, try real API
    if (config.transparenciaApiKey) {
      try {
        const http = createHttpClient(config.apis.transparencia.baseUrl, 20000);
        const anoAtual = new Date().getFullYear();
        const { data } = await http.get('/transferencias/por-municipio', {
          params: {
            codigoIbge: codIBGE,
            mesAno: `${anoAtual}01`,
            pagina: 1,
          },
          headers: {
            'chave-api-dados': config.transparenciaApiKey,
          },
        });

        const transferencias = Array.isArray(data) ? data : data?.transferencias || [];

        const result: DadosFinanceiro = {
          disponivel: true,
          transferenciasRecentes: transferencias.slice(0, 10).map((t: Record<string, unknown>) => ({
            programa: String(t.programa || t.acao || 'Não especificado'),
            valor: Number(t.valor || 0),
            ano: anoAtual,
          })),
          fontesDisponiveis: FONTES_FINANCIAMENTO_PADRAO,
        };

        await cacheService.set(cacheKey, result, 'transparencia', config.apis.transparencia.cacheTTLDays);
        return result;
      } catch (err) {
        console.warn('[Transparência] API falhou, usando fallback:', (err as Error).message);
      }
    }

    // Fallback: provide standard financing sources info
    const result: DadosFinanceiro = {
      disponivel: false,
      transferenciasRecentes: [],
      fontesDisponiveis: FONTES_FINANCIAMENTO_PADRAO,
      motivo: config.transparenciaApiKey
        ? 'API do Portal da Transparência indisponível'
        : 'Chave de API do Portal da Transparência não configurada',
    };

    await cacheService.set(cacheKey, result, 'transparencia', config.apis.transparencia.cacheTTLDays);
    return result;
  }
}

export const transparenciaService = new TransparenciaService();
