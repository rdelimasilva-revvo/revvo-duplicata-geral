import React from 'react';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import IframeErrorBoundary from '../common/IframeErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import CreditLimits from './CreditLimits';
import Collection from './Collection';
import MonitoringSystem from './MonitoringSystem';
import CustomerRiskAssessment from './CustomerRiskAssessment';
import { useIframeLoader } from '../../hooks';

interface CustomerRiskProps {
  subRoute?: string;
}

const CustomerRisk: React.FC<CustomerRiskProps> = ({ subRoute }) => {
  // Use dedicated components for specific routes
  if (subRoute === ROUTES.CUSTOMER_RISK_CREDIT_LIMITS) {
    return <CreditLimits />;
  }

  if (subRoute === ROUTES.CUSTOMER_RISK_COLLECTION) {
    return <Collection />;
  }
  
  if (subRoute === ROUTES.CUSTOMER_RISK_ASSESSMENT) {
    return <CustomerRiskAssessment />;
  }

  if (subRoute === ROUTES.CUSTOMER_RISK_MONITORING_SYSTEM) {
    return <MonitoringSystem />;
  }

  const { isLoading, hasError } = useIframeLoader();

  if (hasError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Não foi possível carregar o Gestor de Risco
          </h2>
          <p className="text-gray-600">
            Por favor, tente novamente mais tarde ou contate o suporte.
          </p>
        </div>
      </div>
    );
  }

  const iframeSrc = subRoute 
    ? PROJECT_URLS[subRoute as keyof typeof PROJECT_URLS] 
    : PROJECT_URLS[ROUTES.CUSTOMER_RISK];

  return (
    <IframeErrorBoundary>
      <div className="relative w-full h-full">
        {isLoading && <LoadingSpinner />}
        <iframe
          src={iframeSrc}
          className="w-full h-full min-h-[calc(100vh-180px)]"
          style={{ 
            border: 'none',
            display: 'block'
          }}
          title="Gestor de Risco"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default CustomerRisk;