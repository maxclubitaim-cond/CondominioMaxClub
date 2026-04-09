import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-slate-200">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Ops! Algo deu errado.
            </h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Ocorreu um erro inesperado ao carregar este componente. 
              Tente recarregar a página ou restaurar o app.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all uppercase text-xs tracking-widest"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.removeItem('pwa_reset_attempted');
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                      for(let reg of regs) reg.unregister();
                      setTimeout(() => window.location.reload(true), 500);
                    });
                  } else {
                    window.location.reload(true);
                  }
                }}
                className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
              >
                Restaurar do Zero
              </button>
            </div>
            {this.state.error && (
              <div className="mt-8 p-4 bg-slate-900 rounded-xl text-left overflow-hidden">
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2">Detalhes técnicos:</p>
                <div className="text-[10px] text-slate-400 font-mono break-all line-clamp-3">
                  {this.state.error.toString()}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
