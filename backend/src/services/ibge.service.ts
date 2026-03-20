import { createHttpClient } from '../utils/http.js';
import { config } from '../config/index.js';
import { cacheService } from './cache.service.js';
import type { MunicipioIBGE, MunicipioResumo, Indicadores } from '../types/index.js';

const http = createHttpClient(config.apis.ibge.baseUrl);

const UF_CODES: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53, ES: 32,
  GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15, PB: 25, PR: 41,
  PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43, RO: 11, RR: 14, SC: 42,
  SP: 35, SE: 28, TO: 17,
};

export class IBGEService {
  async buscarMunicipios(nome: string, uf?: string): Promise<MunicipioResumo[]> {
    const ufUpper = uf?.toUpperCase();
    const ufCode = ufUpper && UF_CODES[ufUpper];

    const cacheKey = `ibge:municipios:${ufUpper || 'all'}`;
    let municipios = await cacheService.get<MunicipioIBGE[]>(cacheKey);

    if (!municipios) {
      const url = ufCode
        ? `/localidades/estados/${ufCode}/municipios`
        : `/localidades/municipios`;
      const { data } = await http.get<MunicipioIBGE[]>(url);
      municipios = data;
      await cacheService.set(cacheKey, municipios, 'ibge', config.apis.ibge.cacheTTLDays);
    }

    const nomeNorm = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const filtered = municipios.filter((m) => {
      const mNorm = m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return mNorm.includes(nomeNorm);
    });

    return filtered.slice(0, 20).map((m) => this.toResumo(m));
  }

  async getMunicipioPorCodigo(codIBGE: string): Promise<MunicipioResumo | null> {
    const cacheKey = `ibge:municipio:${codIBGE}`;
    const cached = await cacheService.get<MunicipioResumo>(cacheKey);
    if (cached) return cached;

    try {
      const { data } = await http.get<MunicipioIBGE>(`/localidades/municipios/${codIBGE}`);
      const resumo = this.toResumo(data);
      await cacheService.set(cacheKey, resumo, 'ibge', config.apis.ibge.cacheTTLDays);
      return resumo;
    } catch {
      return null;
    }
  }

  async getIndicadores(codIBGE: string): Promise<Indicadores> {
    const cacheKey = `ibge:indicadores:${codIBGE}`;
    const cached = await cacheService.get<Indicadores>(cacheKey);
    if (cached) return cached;

    const indicators = config.ibgeIndicators;
    const results = await Promise.allSettled([
      this.fetchIndicador(indicators.populacao, codIBGE),
      this.fetchIndicador(indicators.pibPerCapita, codIBGE),
      this.fetchIndicador(indicators.idh, codIBGE),
      this.fetchIndicador(indicators.area, codIBGE),
    ]);

    const getValue = (r: PromiseSettledResult<{ valor: number | null; ano: string }>) =>
      r.status === 'fulfilled' ? r.value : { valor: null, ano: '' };

    const pop = getValue(results[0]);
    const pib = getValue(results[1]);
    const idh = getValue(results[2]);
    const area = getValue(results[3]);

    const indicadores: Indicadores = {
      populacao: pop.valor,
      pibPerCapita: pib.valor,
      idh: idh.valor,
      areaKm2: area.valor,
      densidadeDemografica:
        pop.valor && area.valor ? Math.round((pop.valor / area.valor) * 100) / 100 : null,
      anoReferencia: {
        populacao: pop.ano,
        pibPerCapita: pib.ano,
        idh: idh.ano,
        area: area.ano,
      },
    };

    await cacheService.set(cacheKey, indicadores, 'ibge', config.apis.ibge.cacheTTLDays);
    return indicadores;
  }

  private async fetchIndicador(
    indicadorId: number,
    codIBGE: string
  ): Promise<{ valor: number | null; ano: string }> {
    try {
      const { data } = await http.get(`/pesquisas/indicadores/${indicadorId}/resultados/${codIBGE}`);

      // IBGE API returns array format: [{ id, indicador, unidade, res: [{ localidade, res: { "2020": "val" } }] }]
      const item = Array.isArray(data) ? data[0] : data;
      const res = item?.res?.[0]?.res || {};

      // Get most recent year with valid value
      const anos = Object.keys(res).sort((a, b) => parseInt(b) - parseInt(a));
      for (const ano of anos) {
        const val = res[ano];
        if (val && val !== '-' && val !== '...' && val !== 'null') {
          return { valor: parseFloat(val.replace(',', '.')), ano };
        }
      }
      return { valor: null, ano: '' };
    } catch {
      return { valor: null, ano: '' };
    }
  }

  private toResumo(m: MunicipioIBGE): MunicipioResumo {
    return {
      codigo: String(m.id),
      nome: m.nome,
      uf: m.microrregiao?.mesorregiao?.UF?.nome || '',
      ufSigla: m.microrregiao?.mesorregiao?.UF?.sigla || '',
      microrregiao: m.microrregiao?.nome || '',
      mesorregiao: m.microrregiao?.mesorregiao?.nome || '',
      regiao: m.microrregiao?.mesorregiao?.UF?.regiao?.nome || '',
    };
  }
}

export const ibgeService = new IBGEService();
