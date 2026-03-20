import { cacheService } from './cache.service.js';
import { config } from '../config/index.js';
import type { DadosSaneamento } from '../types/index.js';

// SNIS doesn't have a public REST API - using regional averages as intelligent fallback
// Source: SNIS 2022 data (https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/saneamento/snis)
const MEDIAS_REGIONAIS: Record<string, { agua: number; esgoto: number; tratamento: number; perda: number }> = {
  Norte:        { agua: 57.5, esgoto: 12.3, tratamento: 21.7, perda: 55.2 },
  Nordeste:     { agua: 74.2, esgoto: 28.0, tratamento: 36.2, perda: 46.3 },
  'Centro-Oeste': { agua: 89.0, esgoto: 57.3, tratamento: 56.8, perda: 34.1 },
  Sudeste:      { agua: 91.3, esgoto: 79.2, tratamento: 55.2, perda: 37.8 },
  Sul:          { agua: 90.2, esgoto: 46.2, tratamento: 45.5, perda: 36.5 },
};

// State-level adjustments for more accuracy
const AJUSTES_UF: Record<string, Partial<{ agua: number; esgoto: number; tratamento: number }>> = {
  CE: { agua: 70.1, esgoto: 25.8, tratamento: 32.5 },
  SP: { agua: 95.8, esgoto: 90.2, tratamento: 68.3 },
  RJ: { agua: 91.5, esgoto: 68.7, tratamento: 42.1 },
  MG: { agua: 87.2, esgoto: 72.1, tratamento: 50.8 },
  BA: { agua: 79.1, esgoto: 33.5, tratamento: 45.2 },
  PE: { agua: 76.3, esgoto: 30.2, tratamento: 38.6 },
  PA: { agua: 44.3, esgoto: 7.8, tratamento: 11.5 },
  AM: { agua: 69.8, esgoto: 15.2, tratamento: 43.8 },
  RS: { agua: 87.5, esgoto: 32.3, tratamento: 28.7 },
  PR: { agua: 93.8, esgoto: 72.5, tratamento: 75.2 },
  SC: { agua: 89.5, esgoto: 33.8, tratamento: 32.5 },
  GO: { agua: 87.2, esgoto: 53.5, tratamento: 55.0 },
  MA: { agua: 59.8, esgoto: 11.5, tratamento: 15.2 },
  PI: { agua: 68.2, esgoto: 10.8, tratamento: 18.5 },
  AL: { agua: 75.5, esgoto: 25.3, tratamento: 40.2 },
};

export class SNISService {
  async getDadosSaneamento(codIBGE: string, ufSigla: string, regiao: string): Promise<DadosSaneamento> {
    const cacheKey = `snis:${codIBGE}`;
    const cached = await cacheService.get<DadosSaneamento>(cacheKey);
    if (cached) return cached;

    const ajusteUF = AJUSTES_UF[ufSigla];
    const mediaRegional = MEDIAS_REGIONAIS[regiao] || MEDIAS_REGIONAIS['Nordeste'];

    const result: DadosSaneamento = {
      disponivel: true,
      coberturaAgua: ajusteUF?.agua ?? mediaRegional.agua,
      coberturaEsgoto: ajusteUF?.esgoto ?? mediaRegional.esgoto,
      tratamentoEsgoto: ajusteUF?.tratamento ?? mediaRegional.tratamento,
      perdaDistribuicao: mediaRegional.perda,
      fonte: ajusteUF
        ? `Estimativa baseada em dados SNIS 2022 para ${ufSigla}`
        : `Estimativa baseada em média regional ${regiao} (SNIS 2022)`,
    };

    await cacheService.set(cacheKey, result, 'snis', config.apis.snis.cacheTTLDays);
    return result;
  }
}

export const snisService = new SNISService();
