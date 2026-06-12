import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

class IframeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryCount: 0
  };

  public static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Iframe error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState((prev) => ({ hasError: false, retryCount: prev.retryCount + 1 }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Ocorreu um erro ao carregar o conteúdo
            </h2>
            <p className="text-gray-600 mb-4">
              Verifique sua conexão ou tente novamente. Se o problema persistir,
              contate o suporte.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }

    return (
      <React.Fragment key={this.state.retryCount}>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default IframeErrorBoundary;
