import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { PlanoObras } from '../../types';

interface Props {
  plano: PlanoObras;
}

const prazoLabels = { curto: 'Curto Prazo', medio: 'M\u00e9dio Prazo', longo: 'Longo Prazo' };
const prazoColors = { curto: 'bg-ipax-green', medio: 'bg-ipax-teal', longo: 'bg-ipax-blue' };

function catClass(cat: string): string {
  const c = cat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (c.includes('saude')) return 'cat-saude';
  if (c.includes('saneamento')) return 'cat-saneamento';
  if (c.includes('educacao')) return 'cat-educacao';
  if (c.includes('infraestrutura')) return 'cat-infraestrutura';
  if (c.includes('habitacao')) return 'cat-habitacao';
  if (c.includes('mobilidade')) return 'cat-mobilidade';
  if (c.includes('meio') || c.includes('ambiente')) return 'cat-meio-ambiente';
  return 'bg-gray-500';
}

export function PlanoObrasTab({ plano }: Props) {
  return (
    <div className="space-y-6">
      {/* Executive summary */}
      <Card title="Resumo Executivo" icon="📋">
        <p className="text-gray-700 whitespace-pre-line">{plano.resumoExecutivo}</p>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-ipax-light rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">Investimento Total</p>
            <p className="text-2xl font-bold text-ipax-dark">{plano.investimentoTotalFormatado}</p>
          </div>
          <div className="bg-ipax-light rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase">Total de Obras</p>
            <p className="text-2xl font-bold text-ipax-dark">{plano.obras.length}</p>
          </div>
        </div>
      </Card>

      {/* Obra cards */}
      <h3 className="text-xl font-serif text-ipax-dark">Obras Propostas</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {plano.obras
          .sort((a, b) => a.prioridade - b.prioridade)
          .map((obra) => (
          <div key={obra.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-white text-xs px-2 py-1 rounded-full ${catClass(obra.categoria)}`}>
                {obra.categoria}
              </span>
              <span className={`text-white text-xs px-2 py-1 rounded-full ${prazoColors[obra.prazo]}`}>
                {prazoLabels[obra.prazo]}
              </span>
              <Badge>#{obra.prioridade}</Badge>
            </div>

            <h4 className="font-semibold text-ipax-dark text-lg mb-2">{obra.titulo}</h4>
            <p className="text-sm text-gray-600 mb-4">{obra.descricao}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-ipax-bg rounded-lg p-3">
                <p className="text-xs text-gray-500">Custo Estimado</p>
                <p className="font-bold text-ipax-dark">{obra.custoFormatado}</p>
              </div>
              <div className="bg-ipax-bg rounded-lg p-3">
                <p className="text-xs text-gray-500">Dura&ccedil;&atilde;o</p>
                <p className="font-bold text-ipax-dark">{obra.duracaoMeses} meses</p>
              </div>
            </div>

            <div className="mt-3 text-sm">
              <p className="text-xs text-gray-500 mb-1">Fontes de Financiamento</p>
              <div className="flex flex-wrap gap-1">
                {obra.fonteFinanciamento.map((f, i) => (
                  <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>
            </div>

            <div className="mt-3 text-sm">
              <p className="text-xs text-gray-500 mb-1">Impacto Esperado</p>
              <p className="text-gray-600">{obra.impactoEsperado}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
