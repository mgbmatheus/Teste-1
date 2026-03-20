import { useState, useRef, useCallback } from 'react';
import { buscarMunicipios } from '../api/client';
import type { MunicipioResumo } from '../types';

export function useMunicipioSearch() {
  const [resultados, setResultados] = useState<MunicipioResumo[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const buscar = useCallback((nome: string, uf: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (nome.length < 2) {
      setResultados([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await buscarMunicipios(nome, uf || undefined);
        setResultados(data);
      } catch {
        setResultados([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const limpar = useCallback(() => {
    setResultados([]);
  }, []);

  return { resultados, loading, buscar, limpar };
}
