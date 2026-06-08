import React from 'react';
import { ROUTES } from '../../constants/routes';
import Home from '../Home/Home';
import Banks from '../Banks/Banks';
import Warranties from '../Warranties/Warranties';
import Payables from '../Payables/Payables';
import CustomerRisk from '../CustomerRisk/CustomerRisk';
import ModelMaintenance from '../CustomerRisk/ModelMaintenance';
import MonitoringSystem from '../CustomerRisk/MonitoringSystem';
import CustomerRiskAssessment from '../CustomerRisk/CustomerRiskAssessment';
import Collection from '../CustomerRisk/Collection';
import Negotiation from '../Negotiation';
import { AutomaticBookkeeping, Subscriptions, OptInManagement } from '../Settings';
import { PaymentReport } from '../Settings';
import { ProfilesAccess } from '../Settings';
import UserProfilePage from '@/pages/UserProfilePage';
import Notifications from '../Notifications';
import AgenteIntermediador from '../AgenteIntermediador/AgenteIntermediador';
import FornecedorDivergente from '../FornecedorDivergente/FornecedorDivergente';
import { NovosRecebedores } from '../Revvo/pages/NovosRecebedores';
import {
  Overview as DebtsOverview,
  CommercialLines as DebtsCommercialLines,
  StructuredLines as DebtsStructuredLines,
  IntercompanyLines as DebtsIntercompanyLines,
  Covenants as DebtsCovenants
} from '../Debts';
import { modulesRoutes } from '@/router/modulesRoutes';
import { Breadcrumbs, buildBreadcrumbs } from '../common/Breadcrumbs';

interface MainContentProps {
  currentView: string;
  onNavigate?: (route: string) => void;
}

const MainContent = ({ currentView, onNavigate }: MainContentProps) => {
  const isCustomerRiskRoute = (route: string) => {
    return [
      ROUTES.CUSTOMER_RISK,
      ROUTES.CUSTOMER_RISK_MONITORING_SYSTEM,
      ROUTES.CUSTOMER_RISK_MODEL_MAINTENANCE,
      ROUTES.CUSTOMER_RISK_COLLECTION,
      ROUTES.CUSTOMER_RISK_ASSESSMENT
    ].includes(route);
  };

  const breadcrumbItems = buildBreadcrumbs(currentView);

  return (
    <main className="flex-1 bg-[#F5F6F7] border border-[#D3D6DA] pt-4 px-4 pb-2 min-w-0 overflow-x-hidden">
      <Breadcrumbs items={breadcrumbItems} onNavigate={onNavigate} />
      <div className="w-full h-[calc(100vh-108px)] bg-white rounded-lg overflow-y-auto overflow-x-hidden flex flex-col">
        {currentView === ROUTES.HOME && <Home />}
        {(modulesRoutes.find(route => currentView === route.path) ?? modulesRoutes.find(route => currentView.startsWith(route.path + '/')))?.element}
        {currentView === ROUTES.RECEIVABLES_AUTOMATIONS && <AutomaticBookkeeping />}
        {currentView === ROUTES.BANKS && <Banks />}
        {currentView === ROUTES.WARRANTIES && <Warranties />}
        {currentView === ROUTES.PAYABLES && <Payables />}
        {currentView === ROUTES.DEBTS_OVERVIEW && <DebtsOverview />}
        {currentView === ROUTES.DEBTS_COMMERCIAL_LINES && <DebtsCommercialLines />}
        {currentView === ROUTES.DEBTS_STRUCTURED_LINES && <DebtsStructuredLines />}
        {currentView === ROUTES.DEBTS_STRUCTURED_LINES_FOREIGN && (
          <DebtsStructuredLines isForeignCurrency={true} />
        )}
        {currentView === ROUTES.DEBTS_INTERCOMPANY_LINES && (
          <DebtsIntercompanyLines />
        )}
        {currentView === ROUTES.DEBTS_SUPPLY_CHAIN && (
          <DebtsIntercompanyLines isSupplyChain={true} />
        )}
        {currentView === ROUTES.DEBTS_COVENANTS && <DebtsCovenants />}
        {currentView === ROUTES.NEGOTIATION && <Negotiation />}
        {isCustomerRiskRoute(currentView) && <CustomerRisk subRoute={currentView} />}
        {currentView === ROUTES.CUSTOMER_RISK_ASSESSMENT && <CustomerRiskAssessment />}
        {currentView === ROUTES.CUSTOMER_RISK_MODEL_MAINTENANCE && <ModelMaintenance />}
        {currentView === ROUTES.CUSTOMER_RISK_MONITORING_SYSTEM && <MonitoringSystem />}
        {currentView === ROUTES.CUSTOMER_RISK_COLLECTION && <Collection />}
        {currentView === ROUTES.AUTOMATIC_BOOKKEEPING && <AutomaticBookkeeping />}
        {currentView === ROUTES.SUBSCRIPTIONS && <Subscriptions />}
        {currentView === ROUTES.OPT_IN_MANAGEMENT && <OptInManagement />}
        {currentView === ROUTES.AGENTE_INTERMEDIADOR && <AgenteIntermediador />}
        {currentView === ROUTES.FORNECEDOR_DIVERGENTE && <NovosRecebedores />}
        {currentView === ROUTES.FORNECEDOR_DIVERGENTE_LEGACY && <FornecedorDivergente />}
        {currentView === ROUTES.PAYMENT_REPORT && <PaymentReport />}
        {currentView === ROUTES.PROFILES_ACCESS && <ProfilesAccess />}
        {currentView === ROUTES.USER_PROFILE && <UserProfilePage />}
      </div>
    </main>
  );
};

export default MainContent;
