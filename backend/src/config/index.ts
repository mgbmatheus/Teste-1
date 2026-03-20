import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://ipax:ipax_dev_2024@localhost:5432/ipax_cache',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  transparenciaApiKey: process.env.TRANSPARENCIA_API_KEY || '',

  apis: {
    ibge: {
      baseUrl: 'https://servicodados.ibge.gov.br/api/v1',
      cacheTTLDays: 30,
    },
    datasus: {
      baseUrl: 'https://apidadosabertos.saude.gov.br',
      cacheTTLDays: 7,
    },
    snis: {
      cacheTTLDays: 7,
    },
    transparencia: {
      baseUrl: 'https://api.portaldatransparencia.gov.br/api-de-dados',
      cacheTTLDays: 7,
    },
  },

  cache: {
    diagnosticoTTLHours: 24,
    planoTTLHours: 24,
  },

  ibgeIndicators: {
    populacao: 29749,
    pibPerCapita: 29171,
    idh: 30255,
    area: 29168,
  },
} as const;
