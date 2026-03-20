import { useState } from 'react';
import { Layout } from './components/Layout';
import { SearchBar } from './components/SearchBar';
import { TabNavigation } from './components/TabNavigation';
import { LoadingState } from './components/LoadingState';
import { DiagnosticoTab } from './components/tabs/DiagnosticoTab';
import { VulnerabilidadesTab } from './components/tabs/VulnerabilidadesTab';
import { PlanoObrasTab } from './components/tabs/PlanoObrasTab';
import { CronogramaTab } from './components/tabs/CronogramaTab';
import { FontesTab } from './components/tabs/FontesTab';
import { useMunicipioDados } from './hooks/useMunicipioDados';
import type { MunicipioResumo, TabId } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('diagnostico');
  const { dados, diagnostico, plano, loading, error, etapa, analisar, limpar } = useMunicipioDados();

  const isLoading = loading.dados || loading.diagnostico || loading.plano;

  function handleSelect(municipio: MunicipioResumo) {
    limpar();
    setActiveTab('diagnostico');
    analisar(municipio.codigo);
  }

  function renderTab() {
    switch (activeTab) {
      case 'diagnostico':
        return dados ? <DiagnosticoTab dados={dados} diagnostico={diagnostico} loadingDiagnostico={loading.diagnostico} /> : null;
      case 'vulnerabilidades':
        return diagnostico ? <VulnerabilidadesTab diagnostico={diagnostico} /> : null;
      case 'plano':
        return plano ? <PlanoObrasTab plano={plano} /> : null;
      case 'cronograma':
        return plano ? <CronogramaTab plano={plano} /> : null;
      case 'fontes':
        return dados ? <FontesTab dados={dados} /> : null;
      default:
        return null;
    }
  }

  return (
    <Layout>
      <SearchBar onSelect={handleSelect} disabled={isLoading} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6">
          <p className="font-semibold">Erro na an&aacute;lise</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {isLoading && <LoadingState etapa={etapa} loading={loading} />}

      {dados && !isLoading && (
        <>
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasDados={!!dados}
            hasDiagnostico={!!diagnostico}
            hasPlano={!!plano}
          />
          {renderTab()}
        </>
      )}

      {!dados && !isLoading && !error && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🏛️</div>
          <h2 className="text-2xl font-serif text-ipax-dark mb-2">Bem-vindo ao iPax</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Selecione um munic&iacute;pio acima para gerar um diagn&oacute;stico completo de vulnerabilidades
            e um plano de obras priorit&aacute;rias com IA.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span>📊</span> Dados reais do IBGE
            </div>
            <div className="flex items-center gap-2">
              <span>🏥</span> DataSUS/CNES
            </div>
            <div className="flex items-center gap-2">
              <span>🤖</span> An&aacute;lise por IA
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
