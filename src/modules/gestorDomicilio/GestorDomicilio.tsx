import { useState } from 'react';
import {
  RequestsReceivedCard,
  PendingApprovalsCard,
  UnregisteredSuppliersCard,
  UnregisteredAccountsCard,
  ProcessesInApprovalCard
} from '@/modules/gestorDomicilio/components/DomicileStatsCard';
import { FilterBar } from '@/modules/gestorDomicilio/components/filters/FilterBar';
import { BillsTable } from '@/modules/gestorDomicilio/components/bills/BillsTable';
import { DomicileChangePanel } from '@/modules/gestorDomicilio/components/bills/DomicileChangePanel';
import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { ErrorProvider } from '@/modules/gestorDomicilio/contexts/ErrorContext';
import { SettingsProvider, useSettings } from '@/modules/gestorDomicilio/contexts/SettingsContext';
import { HelpButton } from '@/modules/gestorDomicilio/components/ui/HelpButton';

function GestorDomicilioContent() {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { twoStepPayment, useWorkflow } = useSettings();

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="bg-gray-100 flex flex-col overflow-x-hidden">
      <div className="p-4 md:p-6 flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl md:text-2xl font-bold">Gestão de Domicílio</h1>
        </div>
        
        {!selectedBill ? (
          <>
            {!twoStepPayment && (
              <div className="mb-4">
                <div className={`grid gap-4 ${useWorkflow ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                  <RequestsReceivedCard />
                  <UnregisteredSuppliersCard />
                  <UnregisteredAccountsCard />
                  {useWorkflow && <PendingApprovalsCard />}
                  {useWorkflow && <ProcessesInApprovalCard />}
                </div>
              </div>
            )}

            <div>
              <FilterBar />
            </div>

            <BillsTable onSelectBill={setSelectedBill} onRefresh={handleRefresh} />
          </>
        ) : (
          <DomicileChangePanel bill={selectedBill} onClose={() => setSelectedBill(null)} />
        )}
      </div>
      <HelpButton />
    </div>
  );
}

function GestorDomicilio() {
  return (
    <ErrorProvider>
      <SettingsProvider>
        <GestorDomicilioContent />
      </SettingsProvider>
    </ErrorProvider>
  );
}

export default GestorDomicilio;
