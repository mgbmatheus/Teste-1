import { Spinner } from './ui/Spinner';

interface LoadingStateProps {
  etapa: string;
  loading: { dados: boolean; diagnostico: boolean; plano: boolean };
}

const steps = [
  { key: 'dados', label: 'Consultando bases de dados p\u00fablicas (IBGE, DataSUS, SNIS)' },
  { key: 'diagnostico', label: 'Analisando vulnerabilidades com IA' },
  { key: 'plano', label: 'Gerando plano de obras priorit\u00e1rias' },
] as const;

export function LoadingState({ etapa, loading }: LoadingStateProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col items-center gap-6">
        <Spinner size="lg" />
        <p className="text-lg font-semibold text-ipax-dark animate-pulse-slow">{etapa}</p>

        <div className="w-full max-w-md space-y-3">
          {steps.map((step) => {
            const isActive = loading[step.key];
            const isDone = !loading[step.key] && (
              step.key === 'dados' ? !loading.diagnostico || !loading.dados :
              step.key === 'diagnostico' ? !loading.plano || !loading.diagnostico :
              false
            );

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${isDone ? 'bg-ipax-green text-white' : isActive ? 'bg-ipax-teal text-white animate-pulse' : 'bg-gray-200 text-gray-400'}`}>
                  {isDone ? '\u2713' : isActive ? '\u2026' : '\u2022'}
                </div>
                <span className={`text-sm ${isActive ? 'text-ipax-dark font-semibold' : isDone ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
