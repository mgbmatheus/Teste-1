import { Card } from '../ui/Card';
import type { PlanoObras, ObraPlanejada } from '../../types';

interface Props {
  plano: PlanoObras;
}

function ObraItem({ obra }: { obra: ObraPlanejada }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-ipax-bg rounded-lg">
      <span className="flex-shrink-0 w-6 h-6 bg-ipax-teal text-white rounded-full flex items-center justify-center text-xs font-bold">
        {obra.prioridade}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ipax-dark text-sm">{obra.titulo}</p>
        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
          <span>{obra.custoFormatado}</span>
          <span>&bull;</span>
          <span>{obra.duracaoMeses} meses</span>
          <span>&bull;</span>
          <span>{obra.categoria}</span>
        </div>
      </div>
    </div>
  );
}

export function CronogramaTab({ plano }: Props) {
  const { cronograma } = plano;

  // Fallback: if cronograma is empty, group from obras
  const curto = cronograma?.curtoPrazo?.length ? cronograma.curtoPrazo : plano.obras.filter(o => o.prazo === 'curto');
  const medio = cronograma?.medioPrazo?.length ? cronograma.medioPrazo : plano.obras.filter(o => o.prazo === 'medio');
  const longo = cronograma?.longoPrazo?.length ? cronograma.longoPrazo : plano.obras.filter(o => o.prazo === 'longo');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Short term */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-ipax-green" />
            <h3 className="text-lg font-serif text-ipax-dark">Curto Prazo</h3>
            <span className="text-sm text-gray-400">(0-12 meses)</span>
          </div>
          <div className="space-y-3 border-l-2 border-ipax-green pl-4">
            {curto.length > 0 ? (
              curto.map((obra) => <ObraItem key={obra.id} obra={obra} />)
            ) : (
              <p className="text-gray-400 text-sm italic">Nenhuma obra neste per&iacute;odo</p>
            )}
          </div>
        </div>

        {/* Medium term */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-ipax-teal" />
            <h3 className="text-lg font-serif text-ipax-dark">M&eacute;dio Prazo</h3>
            <span className="text-sm text-gray-400">(1-3 anos)</span>
          </div>
          <div className="space-y-3 border-l-2 border-ipax-teal pl-4">
            {medio.length > 0 ? (
              medio.map((obra) => <ObraItem key={obra.id} obra={obra} />)
            ) : (
              <p className="text-gray-400 text-sm italic">Nenhuma obra neste per&iacute;odo</p>
            )}
          </div>
        </div>

        {/* Long term */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 rounded-full bg-ipax-blue" />
            <h3 className="text-lg font-serif text-ipax-dark">Longo Prazo</h3>
            <span className="text-sm text-gray-400">(3-10 anos)</span>
          </div>
          <div className="space-y-3 border-l-2 border-ipax-blue pl-4">
            {longo.length > 0 ? (
              longo.map((obra) => <ObraItem key={obra.id} obra={obra} />)
            ) : (
              <p className="text-gray-400 text-sm italic">Nenhuma obra neste per&iacute;odo</p>
            )}
          </div>
        </div>
      </div>

      {/* Recommended financing sources */}
      {plano.fontesRecomendadas.length > 0 && (
        <Card title="Fontes de Financiamento Recomendadas" icon="💰">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plano.fontesRecomendadas.map((fonte, i) => (
              <div key={i} className="bg-ipax-bg rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-ipax-blue text-white px-2 py-0.5 rounded">{fonte.tipo}</span>
                  <h4 className="font-semibold text-ipax-dark text-sm">{fonte.nome}</h4>
                </div>
                <p className="text-xs text-gray-600">{fonte.descricao}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
