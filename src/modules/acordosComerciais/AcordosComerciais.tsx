import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { InternalDashboard } from './pages/InternalDashboard';
import { FormalizationWizard } from './pages/FormalizationWizard';
import { AgreementDetail } from './pages/AgreementDetail';
import { SupplierAgreementView } from './pages/SupplierAgreementView';
import { SignatureValidation } from './pages/SignatureValidation';
import { CompletedAgreement } from './pages/CompletedAgreement';
import { AbatimentoAcordos } from './abatimento/AbatimentoAcordos';
import { GestorEscritural } from './pages/gestor/GestorEscritural';
import { AgreementJourneyExperience } from './pages/AgreementJourneyExperience';
import { NovaPropostaAcordo } from './pages/NovaPropostaAcordo';
import { AgreementsDashboard } from './dashboard/AgreementsDashboard';
import { VincularCreditoWizard } from './vincularCreditoWizard/VincularCreditoWizard';
import { RevisaoPropostaSupplier } from './pages/RevisaoPropostaSupplier';
import { RevisaoAcordosDashboard } from './pages/RevisaoAcordosDashboard';
import { AcordoAccessGate } from './components/AcordoAccessGate';
import { SharedCompaniesProvider } from './context/SharedCompaniesContext';
import { AcordosSyncPage } from './sync/AcordosSyncPage';

export default function AcordosComerciais() {
  return (
    <AcordoAccessGate>
      <SharedCompaniesProvider>
        <AcordosComerciaisContent />
      </SharedCompaniesProvider>
    </AcordoAccessGate>
  );
}

function AcordosComerciaisContent() {
  const basePath = '/app/acordos-comerciais';
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const subPath = pathname.replace(/^\/app\/acordos-comerciais/, '');

  const handleNavigate = (path: string) => {
    navigate(`${basePath}/${path}`);
  };

  const handleBack = () => {
    navigate(basePath);
  };

  const isGestor = subPath.startsWith('/gestor');
  const isAbatimento = subPath.startsWith('/abatimento');
  const isJourney = subPath.startsWith('/journey');
  const isNovaProposta = subPath.startsWith('/nova-proposta');
  const isDashboard = subPath.startsWith('/dashboard');
  const isVincular = subPath.startsWith('/vincular-credito');
  const isRevisao = subPath.startsWith('/revisao-proposta');
  const isSyncNFs = subPath.startsWith('/sync-nfs');
  const isSyncPagamentos = subPath.startsWith('/sync-pagamentos');
  const revisaoDetailMatch = subPath.match(/^\/revisao-proposta\/(.+)$/);
  const wizardMatch = subPath.match(/^\/wizard\/?(.*)?$/);
  const detailMatch = subPath.match(/^\/detail\/(.+)$/);
  const signaturesMatch = subPath.match(/^\/signatures\/(.+)$/);
  const completedMatch = subPath.match(/^\/completed\/(.+)$/);
  const supplierViewMatch = subPath.match(/^\/supplier-view\/(.+)$/);

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-[#F5F6F7] overflow-auto">
      {isSyncNFs ? (
        <AcordosSyncPage view="empresa" onBack={() => navigate(`${basePath}/dashboard`)} />
      ) : isSyncPagamentos ? (
        <AcordosSyncPage view="fornecedor" onBack={() => navigate(`${basePath}/revisao-proposta`)} />
      ) : isVincular ? (
        <VincularCreditoWizard
          onBack={() => navigate(`${basePath}/dashboard`)}
          onSubmit={() => navigate(`${basePath}/dashboard`)}
        />
      ) : revisaoDetailMatch ? (
        <RevisaoPropostaSupplier
          proposalCode={revisaoDetailMatch[1]}
          onBack={() => navigate(`${basePath}/revisao-proposta`)}
          onOpenSync={() => navigate(`${basePath}/sync-pagamentos`)}
        />
      ) : isRevisao ? (
        <RevisaoAcordosDashboard
          onOpenProposal={(code) => navigate(`${basePath}/revisao-proposta/${code}`)}
          onOpenSync={() => navigate(`${basePath}/sync-pagamentos`)}
          onBack={handleBack}
        />
      ) : isNovaProposta ? (
        <NovaPropostaAcordo onBack={handleBack} />
      ) : isJourney ? (
        <AgreementJourneyExperience onExit={handleBack} />
      ) : isGestor ? (
        <GestorEscritural onBack={handleBack} />
      ) : isAbatimento ? (
        <AbatimentoAcordos onBack={handleBack} />
      ) : wizardMatch ? (
        <FormalizationWizard
          agreementId={wizardMatch[1] && wizardMatch[1] !== 'new' ? wizardMatch[1] : undefined}
          onBack={handleBack}
          onComplete={handleBack}
        />
      ) : detailMatch ? (
        <AgreementDetail
          agreementId={detailMatch[1]}
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      ) : signaturesMatch ? (
        <SignatureValidation
          agreementId={signaturesMatch[1]}
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      ) : completedMatch ? (
        <CompletedAgreement
          agreementId={completedMatch[1]}
          onBack={handleBack}
        />
      ) : supplierViewMatch ? (
        <SupplierAgreementView
          agreementId={supplierViewMatch[1]}
          onBack={handleBack}
          onNavigate={handleNavigate}
        />
      ) : isDashboard ? (
        <AgreementsDashboard
          onNewProposal={() => navigate(`${basePath}/nova-proposta`)}
          onVincularCredito={() => navigate(`${basePath}/vincular-credito`)}
          onOpenReview={(code) => navigate(`${basePath}/revisao-proposta/${code}`)}
          onOpenSync={() => navigate(`${basePath}/sync-nfs`)}
          onBack={handleBack}
        />
      ) : (
        <NovaPropostaAcordo
          onBack={() => navigate(`${basePath}/dashboard`)}
          onSubmit={() => navigate(`${basePath}/dashboard`)}
          onOpenDashboard={() => navigate(`${basePath}/dashboard`)}
        />
      )}
    </div>
  );
}
