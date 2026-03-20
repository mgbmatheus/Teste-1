import axios from 'axios';
import type { MunicipioResumo, DadosConsolidados, DiagnosticoIA, PlanoObras } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000, // Claude calls can take time
});

export async function buscarMunicipios(nome: string, uf?: string): Promise<MunicipioResumo[]> {
  const params: Record<string, string> = { nome };
  if (uf) params.uf = uf;
  const { data } = await api.get('/municipios/buscar', { params });
  return data;
}

export async function getDados(codIBGE: string): Promise<DadosConsolidados> {
  const { data } = await api.get(`/municipio/${codIBGE}/dados`);
  return data;
}

export async function getDiagnostico(codIBGE: string): Promise<{ dados: DadosConsolidados; diagnostico: DiagnosticoIA }> {
  const { data } = await api.post(`/municipio/${codIBGE}/diagnostico`);
  return data;
}

export async function getPlano(codIBGE: string): Promise<{ dados: DadosConsolidados; diagnostico: DiagnosticoIA; plano: PlanoObras }> {
  const { data } = await api.post(`/municipio/${codIBGE}/plano`);
  return data;
}
