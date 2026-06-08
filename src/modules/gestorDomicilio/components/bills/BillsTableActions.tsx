import { useState } from 'react';
import { Download as FileDownload, MessageSquare, CreditCard, Building2 } from 'lucide-react';
import { BatchManifestationModal } from '@/modules/gestorDomicilio/components/modals/BatchManifestationModal';
import { PaymentConsultationModal } from '@/modules/gestorDomicilio/components/modals/PaymentConsultationModal';
import { DomicileManagementModal } from '@/modules/gestorDomicilio/components/domicile/DomicileManagementModal';
import { Bill } from '@/modules/gestorDomicilio/types/bill';

interface BillsTableActionsProps {
  selectedCount: number;
  selectedBills: Bill[];
  onRefresh: () => void;
}

export function BillsTableActions({ selectedCount, selectedBills, onRefresh }: BillsTableActionsProps) {
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDomicileModal, setShowDomicileModal] = useState(false);

  const pendingBills = selectedBills.filter(bill => bill.manifestation === 'Manifestação Aceite/Recusa');

  return (
    <>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setShowBatchModal(true)}
          disabled={pendingBills.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <MessageSquare size={16} />
          Manifestação em Lote ({pendingBills.length})
        </button>

        <button
          onClick={() => setShowPaymentModal(true)}
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <CreditCard size={16} />
          Consulta para Pagamento ({selectedCount})
        </button>

        <button
          onClick={() => setShowDomicileModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Building2 size={16} />
          Gestão de Domicílio
        </button>

        <button
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <FileDownload size={16} />
          Exportar ({selectedCount})
        </button>
      </div>

      {showBatchModal && (
        <BatchManifestationModal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          selectedBills={pendingBills}
          onSuccess={onRefresh}
        />
      )}

      {showPaymentModal && (
        <PaymentConsultationModal
          selectedBills={selectedBills}
          onClose={() => setShowPaymentModal(false)}
        />
      )}

      {showDomicileModal && (
        <DomicileManagementModal
          onClose={() => setShowDomicileModal(false)}
        />
      )}
    </>
  );
}