import React from 'react';
import { AlertCircle, WifiOff, Lock, AlertTriangle, Info } from 'lucide-react';

export type ErrorType = 'network' | 'permission' | 'validation' | 'expired' | 'generic';

interface ErrorMessageProps {
  type?: ErrorType;
  title: string;
  message: string;
  suggestion?: string;
  errorCode?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

const errorIcons = {
  network: WifiOff,
  permission: Lock,
  validation: AlertTriangle,
  expired: AlertCircle,
  generic: AlertCircle
};

const errorColors = {
  network: 'text-orange-600 bg-orange-50 border-orange-200',
  permission: 'text-red-600 bg-red-50 border-red-200',
  validation: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  expired: 'text-gray-600 bg-gray-50 border-gray-200',
  generic: 'text-red-600 bg-red-50 border-red-200'
};

export function ErrorMessage({
  type = 'generic',
  title,
  message,
  suggestion,
  errorCode,
  onRetry,
  onContactSupport,
  className = ''
}: ErrorMessageProps) {
  const Icon = errorIcons[type];
  const colorClass = errorColors[type];

  return (
    <div className={`rounded-lg border p-4 ${colorClass} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1">{title}</h3>
          <p className="text-sm mb-2">{message}</p>

          {suggestion && (
            <div className="flex items-start gap-2 mt-2 text-sm">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{suggestion}</p>
            </div>
          )}

          {(onRetry || onContactSupport || errorCode) && (
            <div className="flex items-center gap-3 mt-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  Tentar novamente
                </button>
              )}
              {onContactSupport && (
                <button
                  onClick={onContactSupport}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  Contatar suporte
                </button>
              )}
              {errorCode && (
                <span className="text-xs opacity-70 ml-auto">
                  Código: {errorCode}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineError({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-red-600 text-sm mt-1 ${className}`}>
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
