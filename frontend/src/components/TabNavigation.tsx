import type { TabId } from '../types';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: 'diagnostico', label: 'Diagn\u00f3stico', icon: '\ud83d\udcca' },
  { id: 'vulnerabilidades', label: 'Vulnerabilidades', icon: '\u26a0\ufe0f' },
  { id: 'plano', label: 'Plano de Obras', icon: '\ud83c\udfd7\ufe0f' },
  { id: 'cronograma', label: 'Cronograma', icon: '\ud83d\udcc5' },
  { id: 'fontes', label: 'Fontes', icon: '\ud83d\udcc1' },
];

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasDados: boolean;
  hasDiagnostico: boolean;
  hasPlano: boolean;
}

export function TabNavigation({ activeTab, onTabChange, hasDados, hasDiagnostico, hasPlano }: TabNavigationProps) {
  function isEnabled(tabId: TabId): boolean {
    switch (tabId) {
      case 'diagnostico': return hasDados;
      case 'vulnerabilidades': return hasDiagnostico;
      case 'plano': return hasPlano;
      case 'cronograma': return hasPlano;
      case 'fontes': return hasDados;
      default: return false;
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const enabled = isEnabled(tab.id);
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => enabled && onTabChange(tab.id)}
              disabled={!enabled}
              className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-3
                ${active
                  ? 'border-ipax-teal text-ipax-teal bg-ipax-light/50'
                  : enabled
                    ? 'border-transparent text-gray-500 hover:text-ipax-blue hover:bg-gray-50'
                    : 'border-transparent text-gray-300 cursor-not-allowed'
                }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
