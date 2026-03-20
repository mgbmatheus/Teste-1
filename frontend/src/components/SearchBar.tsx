import { useState, useRef, useEffect } from 'react';
import { useMunicipioSearch } from '../hooks/useMunicipioSearch';
import type { MunicipioResumo } from '../types';
import { Spinner } from './ui/Spinner';

const UFS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB',
  'PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

interface SearchBarProps {
  onSelect: (municipio: MunicipioResumo) => void;
  disabled?: boolean;
}

export function SearchBar({ onSelect, disabled }: SearchBarProps) {
  const [nome, setNome] = useState('');
  const [uf, setUf] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const { resultados, loading, buscar, limpar } = useMunicipioSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (nome.length >= 2) {
      buscar(nome, uf);
    } else {
      limpar();
    }
  }, [nome, uf, buscar, limpar]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(m: MunicipioResumo) {
    setNome(`${m.nome} - ${m.ufSigla}`);
    setShowDropdown(false);
    limpar();
    onSelect(m);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h2 className="text-xl font-serif text-ipax-dark mb-4">Selecione o Munic&iacute;pio</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1" ref={dropdownRef}>
          <input
            type="text"
            value={nome}
            onChange={(e) => {
              setNome(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => resultados.length > 0 && setShowDropdown(true)}
            placeholder="Digite o nome do munic&iacute;pio..."
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ipax-teal focus:border-ipax-teal outline-none transition disabled:bg-gray-100"
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <Spinner size="sm" />
            </div>
          )}
          {showDropdown && resultados.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {resultados.map((m) => (
                <button
                  key={m.codigo}
                  onClick={() => handleSelect(m)}
                  className="w-full text-left px-4 py-3 hover:bg-ipax-light transition border-b border-gray-50 last:border-0"
                >
                  <span className="font-semibold text-ipax-dark">{m.nome}</span>
                  <span className="text-gray-500 ml-2">- {m.ufSigla}</span>
                  <span className="text-gray-400 text-sm ml-2">({m.microrregiao})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <select
          value={uf}
          onChange={(e) => setUf(e.target.value)}
          disabled={disabled}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ipax-teal focus:border-ipax-teal outline-none transition sm:w-24 disabled:bg-gray-100"
        >
          <option value="">UF</option>
          {UFS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
