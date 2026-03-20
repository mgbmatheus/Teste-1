interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-ipax-bg">
      <header className="bg-gradient-to-r from-ipax-dark to-ipax-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-ipax-teal rounded-lg flex items-center justify-center font-serif font-bold text-xl">
                iP
              </div>
              <div>
                <h1 className="text-2xl font-serif tracking-tight">iPax</h1>
                <p className="text-sm text-blue-200 -mt-1">Planejamento Municipal Inteligente</p>
              </div>
            </div>
            <div className="hidden sm:block text-right text-sm text-blue-200">
              <p>Plataforma de Planejamento</p>
              <p>de Obras Municipais com IA</p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="bg-ipax-dark text-blue-300 text-center py-4 text-sm mt-8">
        iPax - Dados de APIs p&uacute;blicas brasileiras (IBGE, DataSUS, SNIS) &bull; An&aacute;lise por IA Claude
      </footer>
    </div>
  );
}
