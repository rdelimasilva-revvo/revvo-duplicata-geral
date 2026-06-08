import { createContext, useContext, useState, ReactNode } from 'react';

interface ErrorInfo {
  id: string;
  title: string;
  message: string;
  code?: string;
  suggestion?: string;
  canRetry?: boolean;
  onRetry?: () => void;
}

interface ErrorContextValue {
  showError: (error: Omit<ErrorInfo, 'id'>) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const showError = (error: Omit<ErrorInfo, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 11);
    setErrors((prev) => [...prev, { ...error, id }]);

    setTimeout(() => {
      clearError(id);
    }, 10000);
  };

  const clearError = (id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ showError, clearError, clearAllErrors }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
        {errors.map((error) => (
          <div
            key={error.id}
            className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-red-800">{error.title}</h3>
                  <button
                    onClick={() => clearError(error.id)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ×
                  </button>
                </div>
                <p className="text-sm text-red-700 mt-1">{error.message}</p>
                {error.suggestion && (
                  <p className="text-sm text-red-600 mt-2">
                    <strong>Sugestão:</strong> {error.suggestion}
                  </p>
                )}
                {error.code && (
                  <p className="text-xs text-red-500 mt-2">Código: {error.code}</p>
                )}
                {error.canRetry && error.onRetry && (
                  <button
                    onClick={error.onRetry}
                    className="mt-3 text-sm font-medium text-red-700 hover:text-red-800 underline"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
}
