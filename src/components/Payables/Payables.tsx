import React, { useEffect, useState } from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeErrorBoundary from '../common/IframeErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';

const Payables = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    const handleIframeError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    // Get the specific iframe for this component
    const iframe = document.querySelector('[data-iframe="payables"]');
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
      iframe.addEventListener('error', handleIframeError);
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
        iframe.removeEventListener('error', handleIframeError);
      }
    };
  }, []);

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Não foi possível carregar o Contas a Pagar
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
          data-iframe="payables"
          src={PROJECT_URLS[ROUTES.PAYABLES]}
          className="w-full h-full min-h-[calc(100vh-180px)]"
          style={{ 
            border: 'none',
            display: 'block'
          }}
          title="Contas a Pagar"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default Payables;