import { Card } from '../ui/Card';
import type { DadosConsolidados, DiagnosticoIA } from '../../types';

interface Props {
  dados: DadosConsolidados;
  diagnostico: DiagnosticoIA | null;
  loadingDiagnostico: boolean;
}

function formatNum(n: number | null, decimals = 0): string {
  if (n === null) return 'N/D';
  return n.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function DiagnosticoTab({ dados, diagnostico, loadingDiagnostico }: Props) {
  const { indicadores, saude, saneamento, municipio } = dados;

  return (
    <div className="space-y-6">
      {/* Municipality header */}
      <div className="bg-gradient-to-r from-ipax-dark to-ipax-blue text-white rounded-xl p-6">
        <h2 className="text-2xl font-serif">{municipio.nome} - {municipio.ufSigla}</h2>
        <p className="text-blue-200 mt-1">
          {municipio.microrregiao} &bull; {municipio.mesorregiao} &bull; Regi&atilde;o {municipio.regiao}
        </p>
        {diagnostico && (
          <p className="mt-2 text-sm text-blue-100">{diagnostico.perfilMunicipio}</p>
        )}
      </div>

      {/* Key indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <IndicadorCard
          label="Popula&ccedil;&atilde;o"
          valor={formatNum(indicadores.populacao)}
          ano={indicadores.anoReferencia?.populacao}
          cor="bg-ipax-blue"
        />
        <IndicadorCard
          label="PIB per capita"
          valor={indicadores.pibPerCapita ? `R$ ${formatNum(indicadores.pibPerCapita, 2)}` : 'N/D'}
          ano={indicadores.anoReferencia?.pibPerCapita}
          cor="bg-ipax-teal"
        />
        <IndicadorCard
          label="IDH"
          valor={indicadores.idh !== null ? String(indicadores.idh) : 'N/D'}
          ano={indicadores.anoReferencia?.idh}
          cor={indicadores.idh !== null && indicadores.idh < 0.6 ? 'bg-ipax-red' : indicadores.idh !== null && indicadores.idh < 0.7 ? 'bg-ipax-orange' : 'bg-ipax-green'}
        />
        <IndicadorCard
          label="&Aacute;rea"
          valor={indicadores.areaKm2 ? `${formatNum(indicadores.areaKm2, 1)} km&sup2;` : 'N/D'}
          ano={indicadores.anoReferencia?.area}
          cor="bg-gray-600"
        />
        <IndicadorCard
          label="Densidade"
          valor={indicadores.densidadeDemografica ? `${formatNum(indicadores.densidadeDemografica, 2)} hab/km&sup2;` : 'N/D'}
          cor="bg-gray-500"
        />
      </div>

      {/* Health & Sanitation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Sa&uacute;de" icon="🏥">
          {saude.disponivel ? (
            <div className="grid grid-cols-2 gap-3">
              <StatItem label="Estabelecimentos" value={String(saude.totalEstabelecimentos)} />
              <StatItem label="Hospitais" value={String(saude.hospitais)} />
              <StatItem label="UBS" value={String(saude.ubs)} />
              <StatItem label="UPA" value={String(saude.upa)} />
              <StatItem label="Cl&iacute;nicas" value={String(saude.clinicas)} />
              <StatItem label="Outros" value={String(saude.outros)} />
            </div>
          ) : (
            <p className="text-gray-500 italic">{saude.motivo || 'Dados indispon\u00edveis'}</p>
          )}
        </Card>

        <Card title="Saneamento" icon="💧">
          {saneamento.disponivel ? (
            <div className="space-y-3">
              <BarIndicator label="Cobertura de &aacute;gua" value={saneamento.coberturaAgua} />
              <BarIndicator label="Cobertura de esgoto" value={saneamento.coberturaEsgoto} />
              <BarIndicator label="Tratamento de esgoto" value={saneamento.tratamentoEsgoto} />
              <BarIndicator label="Perda na distribui&ccedil;&atilde;o" value={saneamento.perdaDistribuicao} invert />
              <p className="text-xs text-gray-400 mt-2">{saneamento.fonte}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">{saneamento.motivo || 'Dados indispon\u00edveis'}</p>
          )}
        </Card>
      </div>

      {/* AI Summary */}
      {loadingDiagnostico ? (
        <Card>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </Card>
      ) : diagnostico ? (
        <Card title="Resumo da An&aacute;lise" icon="🤖">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
            {diagnostico.resumo}
          </div>
          {diagnostico.pontosFortesIdentificados.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="font-semibold text-ipax-green mb-2">Pontos Fortes Identificados</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                {diagnostico.pontosFortesIdentificados.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}

function IndicadorCard({ label, valor, ano, cor }: { label: string; valor: string; ano?: string; cor: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className={`w-8 h-1 ${cor} rounded mb-3`} />
      <p className="text-xs text-gray-500 uppercase tracking-wide" dangerouslySetInnerHTML={{ __html: label }} />
      <p className="text-lg font-bold text-ipax-dark mt-1" dangerouslySetInnerHTML={{ __html: valor }} />
      {ano && <p className="text-xs text-gray-400 mt-1">Ref: {ano}</p>}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ipax-bg rounded-lg p-3">
      <p className="text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: label }} />
      <p className="text-lg font-bold text-ipax-dark">{value}</p>
    </div>
  );
}

function BarIndicator({ label, value, invert }: { label: string; value: number | null; invert?: boolean }) {
  if (value === null) return null;
  const color = invert
    ? value > 40 ? 'bg-red-400' : value > 25 ? 'bg-yellow-400' : 'bg-green-400'
    : value > 80 ? 'bg-green-400' : value > 50 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600" dangerouslySetInnerHTML={{ __html: label }} />
        <span className="font-semibold">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}
