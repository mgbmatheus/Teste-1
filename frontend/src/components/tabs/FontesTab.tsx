import { Card } from '../ui/Card';
import type { DadosConsolidados } from '../../types';

interface Props {
  dados: DadosConsolidados;
}

const statusLabels = { ok: 'Dispon\u00edvel', parcial: 'Parcial', falha: 'Indispon\u00edvel', fallback: 'Estimativa' };
const statusColors = {
  ok: 'bg-green-100 text-green-800',
  parcial: 'bg-yellow-100 text-yellow-800',
  falha: 'bg-red-100 text-red-800',
  fallback: 'bg-blue-100 text-blue-800',
};
const statusIcons = { ok: '\u2705', parcial: '\u26a0\ufe0f', falha: '\u274c', fallback: '\ud83d\udcca' };

export function FontesTab({ dados }: Props) {
  return (
    <div className="space-y-6">
      <Card title="Bases de Dados Consultadas" icon="🔗">
        <div className="space-y-4">
          {dados.fontes.map((fonte, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-ipax-bg rounded-lg">
              <span className="text-2xl">{statusIcons[fonte.status]}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold text-ipax-dark">{fonte.nome}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[fonte.status]}`}>
                    {statusLabels[fonte.status]}
                  </span>
                </div>
                {fonte.detalhes && (
                  <p className="text-sm text-gray-600 mt-1">{fonte.detalhes}</p>
                )}
                {fonte.ultimaAtualizacao && (
                  <p className="text-xs text-gray-400 mt-1">&Uacute;ltima atualiza&ccedil;&atilde;o: {fonte.ultimaAtualizacao}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Fontes de Financiamento Dispon&iacute;veis" icon="💰">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {dados.financeiro.fontesDisponiveis.map((fonte, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-ipax-bg rounded-lg">
              <div className="w-2 h-2 rounded-full bg-ipax-teal flex-shrink-0" />
              <span className="text-sm text-gray-700">{fonte}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Sobre os Dados" icon="ℹ️">
        <div className="prose prose-sm max-w-none text-gray-600">
          <p>
            Os dados utilizados nesta an&aacute;lise s&atilde;o provenientes de APIs p&uacute;blicas oficiais do governo brasileiro.
            A qualidade e disponibilidade dos dados varia conforme a fonte e o munic&iacute;pio consultado.
          </p>
          <ul className="mt-2 space-y-1">
            <li><strong>IBGE:</strong> Indicadores socioecon&ocirc;micos oficiais (popula&ccedil;&atilde;o, PIB, IDH, &aacute;rea territorial)</li>
            <li><strong>DataSUS/CNES:</strong> Cadastro Nacional de Estabelecimentos de Sa&uacute;de</li>
            <li><strong>SNIS:</strong> Sistema Nacional de Informa&ccedil;&otilde;es sobre Saneamento (dados regionais estimados)</li>
            <li><strong>Portal da Transpar&ecirc;ncia:</strong> Transfer&ecirc;ncias federais para o munic&iacute;pio</li>
          </ul>
          <p className="mt-3 text-xs text-gray-400">
            Dados coletados em: {new Date(dados.coletadoEm).toLocaleString('pt-BR')}
          </p>
        </div>
      </Card>
    </div>
  );
}
