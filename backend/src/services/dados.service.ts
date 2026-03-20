import { ibgeService } from './ibge.service.js';
import { dataSUSService } from './datasus.service.js';
import { snisService } from './snis.service.js';
import { transparenciaService } from './transparencia.service.js';
import type { DadosConsolidados, FonteDados } from '../types/index.js';

export class DadosService {
  async getDadosConsolidados(codIBGE: string): Promise<DadosConsolidados> {
    // First get municipality info
    const municipio = await ibgeService.getMunicipioPorCodigo(codIBGE);
    if (!municipio) {
      throw new Error(`Município com código ${codIBGE} não encontrado`);
    }

    // Fetch all data sources in parallel
    const [indicadoresResult, saudeResult, saneamentoResult, financeiroResult] =
      await Promise.allSettled([
        ibgeService.getIndicadores(codIBGE),
        dataSUSService.getEstabelecimentos(codIBGE),
        snisService.getDadosSaneamento(codIBGE, municipio.ufSigla, municipio.regiao),
        transparenciaService.getTransferencias(codIBGE),
      ]);

    const fontes: FonteDados[] = [];

    // Process IBGE indicators
    const indicadores =
      indicadoresResult.status === 'fulfilled'
        ? indicadoresResult.value
        : { populacao: null, pibPerCapita: null, idh: null, areaKm2: null, densidadeDemografica: null, anoReferencia: {} };

    fontes.push({
      nome: 'IBGE - Instituto Brasileiro de Geografia e Estatística',
      status: indicadoresResult.status === 'fulfilled' && indicadores.populacao !== null ? 'ok' : 'parcial',
      ultimaAtualizacao: indicadores.anoReferencia?.populacao || null,
      detalhes: 'Indicadores demográficos e socioeconômicos',
    });

    // Process DataSUS
    const saude =
      saudeResult.status === 'fulfilled'
        ? saudeResult.value
        : { disponivel: false, totalEstabelecimentos: 0, hospitais: 0, ubs: 0, upa: 0, clinicas: 0, outros: 0, estabelecimentos: [], motivo: 'Erro ao consultar DataSUS' };

    fontes.push({
      nome: 'DataSUS/CNES - Cadastro Nacional de Estabelecimentos de Saúde',
      status: saude.disponivel ? 'ok' : 'falha',
      ultimaAtualizacao: saude.disponivel ? new Date().toISOString().split('T')[0] : null,
      detalhes: saude.disponivel
        ? `${saude.totalEstabelecimentos} estabelecimentos encontrados`
        : saude.motivo,
    });

    // Process SNIS
    const saneamento =
      saneamentoResult.status === 'fulfilled'
        ? saneamentoResult.value
        : { disponivel: false, coberturaAgua: null, coberturaEsgoto: null, tratamentoEsgoto: null, perdaDistribuicao: null, fonte: '', motivo: 'Erro ao consultar SNIS' };

    fontes.push({
      nome: 'SNIS - Sistema Nacional de Informações sobre Saneamento',
      status: saneamento.disponivel ? 'fallback' : 'falha',
      ultimaAtualizacao: '2022',
      detalhes: saneamento.fonte || saneamento.motivo,
    });

    // Process Portal Transparência
    const financeiro =
      financeiroResult.status === 'fulfilled'
        ? financeiroResult.value
        : { disponivel: false, transferenciasRecentes: [], fontesDisponiveis: [], motivo: 'Erro ao consultar Portal da Transparência' };

    fontes.push({
      nome: 'Portal da Transparência - Transferências Federais',
      status: financeiro.disponivel ? 'ok' : 'fallback',
      ultimaAtualizacao: financeiro.disponivel ? new Date().toISOString().split('T')[0] : null,
      detalhes: financeiro.disponivel
        ? `${financeiro.transferenciasRecentes.length} transferências encontradas`
        : financeiro.motivo,
    });

    return {
      municipio,
      indicadores,
      saude,
      saneamento,
      financeiro,
      fontes,
      coletadoEm: new Date().toISOString(),
    };
  }
}

export const dadosService = new DadosService();
