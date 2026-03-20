// IBGE Municipality
export interface MunicipioIBGE {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        nome: string;
        sigla: string;
        regiao: {
          id: number;
          nome: string;
          sigla: string;
        };
      };
    };
  };
}

export interface MunicipioResumo {
  codigo: string;
  nome: string;
  uf: string;
  ufSigla: string;
  microrregiao: string;
  mesorregiao: string;
  regiao: string;
}

// IBGE Indicators
export interface IBGEIndicadorResultado {
  id: number;
  indicador: string;
  unidade: string;
  res: Array<{
    localidade: {
      id: string;
      nome: string;
      nivel: { id: string; nome: string };
    };
    res: Record<string, string>;
  }>;
}

export interface Indicadores {
  populacao: number | null;
  pibPerCapita: number | null;
  idh: number | null;
  areaKm2: number | null;
  densidadeDemografica: number | null;
  anoReferencia: Record<string, string>;
}

// DataSUS / CNES
export interface EstabelecimentoSaude {
  codigo_cnes: string;
  nome_fantasia: string;
  tipo_unidade: string;
  codigo_tipo_unidade: string;
}

export interface DadosSaude {
  disponivel: boolean;
  totalEstabelecimentos: number;
  hospitais: number;
  ubs: number;
  upa: number;
  clinicas: number;
  outros: number;
  estabelecimentos: EstabelecimentoSaude[];
  motivo?: string;
}

// SNIS Saneamento
export interface DadosSaneamento {
  disponivel: boolean;
  coberturaAgua: number | null;
  coberturaEsgoto: number | null;
  tratamentoEsgoto: number | null;
  perdaDistribuicao: number | null;
  fonte: string;
  motivo?: string;
}

// Portal Transparência
export interface DadosFinanceiro {
  disponivel: boolean;
  transferenciasRecentes: Array<{
    programa: string;
    valor: number;
    ano: number;
  }>;
  fontesDisponiveis: string[];
  motivo?: string;
}

// Consolidated Data
export interface FonteDados {
  nome: string;
  status: 'ok' | 'parcial' | 'falha' | 'fallback';
  ultimaAtualizacao: string | null;
  detalhes?: string;
}

export interface DadosConsolidados {
  municipio: MunicipioResumo;
  indicadores: Indicadores;
  saude: DadosSaude;
  saneamento: DadosSaneamento;
  financeiro: DadosFinanceiro;
  fontes: FonteDados[];
  coletadoEm: string;
}

// Claude AI Responses
export interface Vulnerabilidade {
  titulo: string;
  descricao: string;
  severidade: 'critico' | 'alto' | 'medio' | 'baixo';
  area: string;
  indicadorRelacionado: string;
  recomendacao: string;
}

export interface DiagnosticoIA {
  resumo: string;
  perfilMunicipio: string;
  vulnerabilidades: Vulnerabilidade[];
  rankingPrioridades: string[];
  pontosFortesIdentificados: string[];
  geradoEm: string;
}

export interface ObraPlanejada {
  id: number;
  titulo: string;
  categoria: string;
  descricao: string;
  custoEstimado: number;
  custoFormatado: string;
  prazo: 'curto' | 'medio' | 'longo';
  duracaoMeses: number;
  fonteFinanciamento: string[];
  justificativa: string;
  impactoEsperado: string;
  prioridade: number;
}

export interface PlanoObras {
  obras: ObraPlanejada[];
  cronograma: {
    curtoPrazo: ObraPlanejada[];
    medioPrazo: ObraPlanejada[];
    longoPrazo: ObraPlanejada[];
  };
  investimentoTotal: number;
  investimentoTotalFormatado: string;
  fontesRecomendadas: Array<{
    nome: string;
    descricao: string;
    tipo: string;
  }>;
  resumoExecutivo: string;
  geradoEm: string;
}
