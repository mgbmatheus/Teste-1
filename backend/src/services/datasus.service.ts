import { createHttpClient } from '../utils/http.js';
import { config } from '../config/index.js';
import { cacheService } from './cache.service.js';
import type { DadosSaude } from '../types/index.js';

const http = createHttpClient(config.apis.datasus.baseUrl, 20000);

export class DataSUSService {
  async getEstabelecimentos(codIBGE: string): Promise<DadosSaude> {
    const cacheKey = `datasus:cnes:${codIBGE}`;
    const cached = await cacheService.get<DadosSaude>(cacheKey);
    if (cached) return cached;

    try {
      // CNES API uses 6-digit code (without check digit)
      const codMunicipio = codIBGE.substring(0, 6);
      const { data } = await http.get(`/cnes/estabelecimentos`, {
        params: { codigo_municipio: codMunicipio, limit: 200 },
      });

      const estabelecimentos = Array.isArray(data) ? data : data?.estabelecimentos || [];

      let hospitais = 0, ubs = 0, upa = 0, clinicas = 0, outros = 0;

      for (const est of estabelecimentos) {
        const tipo = (est.tipo_unidade || est.descricao_tipo_unidade || '').toLowerCase();
        const cod = String(est.codigo_tipo_unidade || est.tp_unid || '');

        if (tipo.includes('hospital') || ['1', '2', '4'].includes(cod)) {
          hospitais++;
        } else if (tipo.includes('básica') || tipo.includes('saude da familia') || cod === '2') {
          ubs++;
        } else if (tipo.includes('pronto') || tipo.includes('upa') || cod === '73') {
          upa++;
        } else if (tipo.includes('clínica') || tipo.includes('consultório')) {
          clinicas++;
        } else {
          outros++;
        }
      }

      const result: DadosSaude = {
        disponivel: true,
        totalEstabelecimentos: estabelecimentos.length,
        hospitais,
        ubs,
        upa,
        clinicas,
        outros,
        estabelecimentos: estabelecimentos.slice(0, 50).map((e: Record<string, string>) => ({
          codigo_cnes: e.codigo_cnes || e.co_cnes || '',
          nome_fantasia: e.nome_fantasia || e.no_fantasia || '',
          tipo_unidade: e.tipo_unidade || e.descricao_tipo_unidade || '',
          codigo_tipo_unidade: e.codigo_tipo_unidade || e.tp_unid || '',
        })),
      };

      await cacheService.set(cacheKey, result, 'datasus', config.apis.datasus.cacheTTLDays);
      return result;
    } catch (err) {
      console.warn('[DataSUS] API indisponível:', (err as Error).message);
      return {
        disponivel: false,
        totalEstabelecimentos: 0,
        hospitais: 0,
        ubs: 0,
        upa: 0,
        clinicas: 0,
        outros: 0,
        estabelecimentos: [],
        motivo: 'API DataSUS/CNES indisponível no momento',
      };
    }
  }
}

export const dataSUSService = new DataSUSService();
