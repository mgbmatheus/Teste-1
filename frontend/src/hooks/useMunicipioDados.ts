import { useState, useCallback } from 'react';
import { getDados, getDiagnostico, getPlano } from '../api/client';
import type { DadosConsolidados, DiagnosticoIA, PlanoObras } from '../types';

interface State {
  dados: DadosConsolidados | null;
  diagnostico: DiagnosticoIA | null;
  plano: PlanoObras | null;
  loading: { dados: boolean; diagnostico: boolean; plano: boolean };
  error: string | null;
  etapa: string;
}

export function useMunicipioDados() {
  const [state, setState] = useState<State>({
    dados: null,
    diagnostico: null,
    plano: null,
    loading: { dados: false, diagnostico: false, plano: false },
    error: null,
    etapa: '',
  });

  const analisar = useCallback(async (codIBGE: string) => {
    setState({
      dados: null,
      diagnostico: null,
      plano: null,
      loading: { dados: true, diagnostico: false, plano: false },
      error: null,
      etapa: 'Consultando bases de dados públicas...',
    });

    try {
      // Step 1: Get consolidated data
      const dados = await getDados(codIBGE);
      setState((s) => ({
        ...s,
        dados,
        loading: { ...s.loading, dados: false, diagnostico: true },
        etapa: 'Analisando vulnerabilidades com IA...',
      }));

      // Step 2: Get AI diagnosis
      const diagResult = await getDiagnostico(codIBGE);
      setState((s) => ({
        ...s,
        diagnostico: diagResult.diagnostico,
        loading: { ...s.loading, diagnostico: false, plano: true },
        etapa: 'Gerando plano de obras prioritárias...',
      }));

      // Step 3: Get AI plan
      const planoResult = await getPlano(codIBGE);
      setState((s) => ({
        ...s,
        plano: planoResult.plano,
        loading: { ...s.loading, plano: false },
        etapa: 'Análise concluída!',
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar análise';
      setState((s) => ({
        ...s,
        loading: { dados: false, diagnostico: false, plano: false },
        error: message,
        etapa: '',
      }));
    }
  }, []);

  const limpar = useCallback(() => {
    setState({
      dados: null,
      diagnostico: null,
      plano: null,
      loading: { dados: false, diagnostico: false, plano: false },
      error: null,
      etapa: '',
    });
  }, []);

  return { ...state, analisar, limpar };
}
