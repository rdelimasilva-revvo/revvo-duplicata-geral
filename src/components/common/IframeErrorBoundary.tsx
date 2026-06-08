import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class IframeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Iframe error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Ocorreu um erro ao carregar o conteúdo
            </h2>
            <p className="text-gray-600">
              Por favor, atualize a página ou tente novamente mais tarde.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default IframeErrorBoundary;