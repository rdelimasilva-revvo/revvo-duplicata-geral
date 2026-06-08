import React, { useEffect } from 'react';
import { useIframeLoader } from '../../hooks';
import IframeErrorBoundary from '../common/IframeErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';
import { useCompany } from '../../context/CompanyContext';
import { PROJECT_URLS, ROUTES } from '../../constants/routes';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../../context/ConfigContext';
import { supabase } from '../../lib/supabase';
import { validateIframeOrigin } from '../../utils';

const Onboarding = () => {
  const { companyId } = useCompany();
  const navigate = useNavigate();
  const { setSetupReady } = useConfig();
  const { isLoading, hasError } = useIframeLoader({
    iframeSelector: '[data-iframe="onboarding"]'
  });

  useEffect(() => {
    const handleSetupMessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);

      // Validate the origin of the message
      if (!validateIframeOrigin(event.origin, PROJECT_URLS[ROUTES.SETUP])) {
        console.warn('Received message from unauthorized origin:', event.origin);
        return;
      }
      
      if (event.data?.type === 'SETUP_COMPLETED' && event.data?.success === true) {
        console.log('Setup completed successfully, updating status...');

        // Atualizar o status no banco de dados
        const updateSetupStatus = async () => {
          try {
            const { error } = await supabase
              .from('company_settings')
              .update({ setup_ready: true })
              .eq('company_id', companyId);

            if (error) throw error;

            setSetupReady(true);
            navigate('/app/home');
          } catch (error) {
            console.error('Error updating setup status:', error);
          }
        };

        updateSetupStatus();
      }
    };

    window.addEventListener('message', handleSetupMessage);
    return () => window.removeEventListener('message', handleSetupMessage);
  }, [navigate, setSetupReady, companyId]);

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
            Não foi possível carregar a tela de configuração inicial
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
          data-iframe="onboarding"
          src={`${PROJECT_URLS[ROUTES.SETUP]}?companyId=${companyId}`}
          className="fixed top-0 left-0 w-full h-full"
          style={{ 
            border: 'none',
            display: 'block',
            height: '100vh',
            zIndex: 9999
          }}
          title="Configuração Inicial"
          allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
          sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-same-origin"
        />
      </div>
    </IframeErrorBoundary>
  );
};

export default Onboarding;