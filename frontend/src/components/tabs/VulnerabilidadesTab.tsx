import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { DiagnosticoIA } from '../../types';

interface Props {
  diagnostico: DiagnosticoIA;
}

const severidadeOrder = { critico: 0, alto: 1, medio: 2, baixo: 3 };
const severidadeLabels = { critico: 'CR\u00cdTICO', alto: 'ALTO', medio: 'M\u00c9DIO', baixo: 'BAIXO' };
const severidadeIcons = { critico: '\ud83d\udd34', alto: '\ud83d\udfe0', medio: '\ud83d\udfe1', baixo: '\ud83d\udfe2' };

export function VulnerabilidadesTab({ diagnostico }: Props) {
  const sorted = [...diagnostico.vulnerabilidades].sort(
    (a, b) => severidadeOrder[a.severidade] - severidadeOrder[b.severidade]
  );

  const counts = { critico: 0, alto: 0, medio: 0, baixo: 0 };
  sorted.forEach((v) => counts[v.severidade]++);

  return (
    <div className="space-y-6">
      {/* Summary counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['critico', 'alto', 'medio', 'baixo'] as const).map((sev) => (
          <div key={sev} className={`severity-${sev} rounded-xl p-4 border-l-4`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{severidadeIcons[sev]}</span>
              <div>
                <p className="text-2xl font-bold">{counts[sev]}</p>
                <p className="text-xs font-semibold uppercase">{severidadeLabels[sev]}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority ranking */}
      <Card title="Ranking de Prioridades" icon="🏆">
        <ol className="space-y-2">
          {diagnostico.rankingPrioridades.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 bg-ipax-teal text-white rounded-full flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <span className="text-gray-700 pt-0.5">{p}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Vulnerability details */}
      <div className="space-y-4">
        <h3 className="text-xl font-serif text-ipax-dark">Detalhamento das Vulnerabilidades</h3>
        {sorted.map((v, i) => (
          <div key={i} className={`severity-${v.severidade} rounded-xl p-5 border-l-4`}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={v.severidade}>{severidadeLabels[v.severidade]}</Badge>
              <Badge>{v.area}</Badge>
              <h4 className="font-semibold text-gray-800 ml-1">{v.titulo}</h4>
            </div>
            <p className="text-sm text-gray-700 mb-3">{v.descricao}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Indicador Relacionado</p>
                <p className="text-gray-700">{v.indicadorRelacionado}</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase mb-1">Recomenda&ccedil;&atilde;o</p>
                <p className="text-gray-700">{v.recomendacao}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
