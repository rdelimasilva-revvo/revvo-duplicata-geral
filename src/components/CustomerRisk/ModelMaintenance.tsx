import React, { useEffect, useState } from 'react';
import { PROJECT_URLS } from '../../constants/routes';
import IframeErrorBoundary from '../common/IframeErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';

const ModelMaintenance = () => {
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

    const iframe = document.querySelector('iframe');
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
            Não foi possível carregar a Manutenção do Modelo
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
          src="https://grand-douhua-76fbab.netlify.app/"
          className="w-full h-full min-h-[calc(100vh-180px)]"
          style={{ 
            border: 'none',
            display: 'block'
          }}
          title="Manutenção do Modelo"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default ModelMaintenance;