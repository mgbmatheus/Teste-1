import { Router } from 'express';
import type { Request, Response } from 'express';
import { ibgeService } from '../services/ibge.service.js';
import { dadosService } from '../services/dados.service.js';
import { claudeService } from '../services/claude.service.js';

const router = Router();

function getParam(params: Record<string, unknown>, key: string): string {
  const val = params[key];
  return typeof val === 'string' ? val : '';
}

// GET /api/municipios/buscar?nome=&uf=
router.get('/municipios/buscar', async (req: Request, res: Response) => {
  try {
    const nome = typeof req.query.nome === 'string' ? req.query.nome : '';
    const uf = typeof req.query.uf === 'string' ? req.query.uf : '';
    if (!nome) {
      res.status(400).json({ error: 'Parâmetro "nome" é obrigatório' });
      return;
    }
    const municipios = await ibgeService.buscarMunicipios(nome, uf || undefined);
    res.json(municipios);
  } catch (err) {
    console.error('[Buscar]', err);
    res.status(500).json({ error: 'Erro ao buscar municípios' });
  }
});

// GET /api/municipio/:codIBGE/dados
router.get('/municipio/:codIBGE/dados', async (req: Request, res: Response) => {
  try {
    const codIBGE = getParam(req.params, 'codIBGE');
    if (!/^\d{7}$/.test(codIBGE)) {
      res.status(400).json({ error: 'Código IBGE deve ter 7 dígitos' });
      return;
    }
    const dados = await dadosService.getDadosConsolidados(codIBGE);
    res.json(dados);
  } catch (err) {
    console.error('[Dados]', err);
    const message = err instanceof Error ? err.message : 'Erro ao buscar dados';
    res.status(500).json({ error: message });
  }
});

// POST /api/municipio/:codIBGE/diagnostico
router.post('/municipio/:codIBGE/diagnostico', async (req: Request, res: Response) => {
  try {
    const codIBGE = getParam(req.params, 'codIBGE');
    if (!/^\d{7}$/.test(codIBGE)) {
      res.status(400).json({ error: 'Código IBGE deve ter 7 dígitos' });
      return;
    }
    const dados = await dadosService.getDadosConsolidados(codIBGE);
    const diagnostico = await claudeService.gerarDiagnostico(codIBGE, dados);
    res.json({ dados, diagnostico });
  } catch (err) {
    console.error('[Diagnóstico]', err);
    const message = err instanceof Error ? err.message : 'Erro ao gerar diagnóstico';
    res.status(500).json({ error: message });
  }
});

// POST /api/municipio/:codIBGE/plano
router.post('/municipio/:codIBGE/plano', async (req: Request, res: Response) => {
  try {
    const codIBGE = getParam(req.params, 'codIBGE');
    if (!/^\d{7}$/.test(codIBGE)) {
      res.status(400).json({ error: 'Código IBGE deve ter 7 dígitos' });
      return;
    }
    const dados = await dadosService.getDadosConsolidados(codIBGE);
    const diagnostico = await claudeService.gerarDiagnostico(codIBGE, dados);
    const plano = await claudeService.gerarPlano(codIBGE, dados, diagnostico);
    res.json({ dados, diagnostico, plano });
  } catch (err) {
    console.error('[Plano]', err);
    const message = err instanceof Error ? err.message : 'Erro ao gerar plano';
    res.status(500).json({ error: message });
  }
});

export default router;
