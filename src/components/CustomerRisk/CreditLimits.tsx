import React, { useEffect, useState, useCallback } from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeErrorBoundary from '../common/IframeErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import { validateIframeOrigin, createIframeMessage } from '../../utils';

const CreditLimits = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [iframeHeight, setIframeHeight] = useState('calc(100vh - 180px)');

  const handleIframeMessage = useCallback((event: MessageEvent) => {
    const allowedOrigin = PROJECT_URLS[ROUTES.CUSTOMER_RISK_CREDIT_LIMITS];
    if (!validateIframeOrigin(event.origin, allowedOrigin)) {
      return;
    }

    const { data } = event;
    if (data.source !== 'credit-limit-manager') {
      return;
    }

    switch (data.type) {
      case 'IFRAME_READY':
        // Send initial configuration if needed
        const iframe = document.querySelector('[data-iframe="credit-limits"]');
        if (iframe) {
          (iframe as HTMLIFrameElement).contentWindow?.postMessage(
            createIframeMessage('INIT', {
              theme: 'light',
              language: 'pt-BR'
            }),
            allowedOrigin
          );
        }
        break;

      case 'IFRAME_RESIZE':
        if (data.payload?.height) {
          setIframeHeight(`${data.payload.height}px`);
        }
        break;

      case 'CUSTOMER_SELECTED':
      case 'FILTERS_CHANGED':
      case 'LIMIT_ADJUSTMENT_SAVED':
        // Handle these events if needed
        console.log('Credit limits event:', data.type, data.payload);
        break;
    }
  }, []);

  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const handleIframeError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    window.addEventListener('message', handleIframeMessage);
    
    const iframe = document.querySelector('[data-iframe="credit-limits"]');
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);
    }

    return () => {
      window.removeEventListener('message', handleIframeMessage);
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      }
    };
  }, [handleIframeMessage]);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Não foi possível carregar o Gestor de Limites
          </h2>
          <p className="text-gray-600">
            Por favor, tente novamente mais tarde ou contate o suporte.
          </p>
        </div>
      </div>
    );
  }

  return (
    <IframeErrorBoundary>
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner />}
        <iframe
          data-iframe="credit-limits"
          src={PROJECT_URLS[ROUTES.CUSTOMER_RISK_CREDIT_LIMITS]}
          className="w-full h-full"
          style={{ 
            border: 'none',
            display: 'block',
            height: iframeHeight,
            minHeight: 'calc(100vh - 180px)'
          }}
          title="Gestão de Limites"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default CreditLimits;