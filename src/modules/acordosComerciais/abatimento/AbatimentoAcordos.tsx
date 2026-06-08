import React from 'react';
import { X } from 'lucide-react';
import { useAbatimentoStore } from './store';
import { AbatimentoStepper } from './components/AbatimentoStepper';
import { FiltersPanel } from './components/FiltersPanel';
import { CreditCardsList } from './components/CreditCardsList';
import { InvoiceTable } from './components/InvoiceTable';
import { VinculacaoChecklist } from './components/VinculacaoChecklist';
import { SapSyncView } from './components/SapSyncView';
import { SupplierAceiteView } from './components/SupplierAceiteView';
import { SignatureView } from './components/SignatureView';
import { useToast } from '@/context/ToastContext';

interface AbatimentoAcordosProps {
  onBack: () => void;
}

export function AbatimentoAcordos({ onBack }: AbatimentoAcordosProps) {
  const { currentStep, setCurrentStep, requiresSupplierApproval } = useAbatimentoStore();
  const { showToast } = useToast();

  const handleFinalize = () => {
    showToast('info', 'Iniciando sincronizacao', 'Enviando dados para o SAP/Sankhya');
    setCurrentStep('sincronizacao_sap');
  };

  const isFormalizacao = currentStep === 'formalizacao';

  return (
    <div className="flex flex-col h-[calc(100vh-108px)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Fechar">
            <X className="w-4.5 h-4.5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">Abatimento de Acordos</h1>
            <p className="text-[11px] text-gray-400">Vinculacao de creditos a notas fiscais</p>
          </div>
        </div>
        <AbatimentoStepper
          currentStep={currentStep}
          requiresSupplierApproval={requiresSupplierApproval}
        />
      </div>

      {isFormalizacao ? (
        <div className="flex flex-1 min-h-0">
          <div className="w-[220px] flex-shrink-0 overflow-y-auto">
            <FiltersPanel />
          </div>

          <div className="flex-1 flex flex-col min-w-0 border-x border-gray-200">
            <div className="flex-shrink-0 border-b border-gray-100">
              <div className="px-4 py-2.5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Selecionar Credito
                </h3>
              </div>
              <div className="px-4 pb-3 max-h-[240px] overflow-y-auto">
                <CreditCardsList />
              </div>
            </div>
            <InvoiceTable />
          </div>

          <div className="w-[300px] flex-shrink-0 overflow-hidden">
            <VinculacaoChecklist onFinalize={handleFinalize} />
          </div>
        </div>
      ) : currentStep === 'sincronizacao_sap' ? (
        <SapSyncView mode="read" />
      ) : currentStep === 'aceite_fornecedor' ? (
        <SupplierAceiteView />
      ) : currentStep === 'escrita_sap' ? (
        <SapSyncView mode="write" />
      ) : currentStep === 'validacao_assinatura' ? (
        <SignatureView />
      ) : null}
    </div>
  );
}
