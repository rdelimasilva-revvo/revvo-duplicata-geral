import React from 'react';
import { useIframeLoader } from '../../hooks';
import IframeErrorBoundary from '../common/IframeErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import { useCompany } from '../../context/CompanyContext';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';

const Setup = () => {
  const { companyId } = useCompany();
  const { isLoading, hasError } = useIframeLoader({
    iframeSelector: '[data-iframe="setup"]'
  });

  if (!companyId) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao carregar configuração
          </h2>
          <p className="text-gray-600">
            ID da empresa não encontrado. Por favor, faça login novamente.
          </p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Não foi possível carregar a tela de configuração
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
          data-iframe="setup"
          src={`${PROJECT_URLS[ROUTES.SETUP]}?companyId=${companyId}`}
          className="w-full h-screen"
          style={{ 
            border: 'none',
            display: 'block'
          }}
          title="Configuração"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default Setup;