import React from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeErrorBoundary from '../common/IframeErrorBoundary';
import { useIframeLoader } from '../../hooks';
import LoadingSpinner from '../common/LoadingSpinner';

const Notifications = () => {
  const { isLoading, hasError } = useIframeLoader();

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Não foi possível carregar as Notificações e Alertas de Dívidas
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
          data-iframe="debts-notifications"
          src={PROJECT_URLS[ROUTES.DEBTS_NOTIFICATIONS]}
          className="w-full h-full min-h-[calc(100vh-180px)]"
          style={{ 
            border: 'none',
            display: 'block'
          }}
          title="Notificações e Alertas de Dívidas"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default Notifications;