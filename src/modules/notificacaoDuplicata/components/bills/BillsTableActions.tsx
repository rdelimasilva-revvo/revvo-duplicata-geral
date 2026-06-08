import { useState } from 'react';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';
import { BatchManifestationModal } from '@/modules/notificacaoDuplicata/components/modals/BatchManifestationModal';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';

interface BillsTableActionsProps {
  selectedCount: number;
  selectedBills: Set<string>;
  bills: Bill[];
}

export function BillsTableActions({ selectedCount, selectedBills, bills }: BillsTableActionsProps) {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const selectedBillsList = bills.filter(b => selectedBills.has(b.id));

  return (
    <>
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <span className="text-sm text-gray-600">
          {selectedCount === 0
            ? 'Nenhuma duplicata selecionada'
            : `${selectedCount} duplicata${selectedCount > 1 ? 's' : ''} selecionada${selectedCount > 1 ? 's' : ''}`
          }
        </span>
        <Button
          variant="primary"
          size="sm"
          disabled={selectedCount === 0}
          onClick={() => setIsBatchModalOpen(true)}
          className="my-1"
        >
          Manifestar aceite/recusa em lote
        </Button>
      </div>

      <BatchManifestationModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        selectedBills={selectedBillsList}
        onSuccess={() => setIsBatchModalOpen(false)}
      />
    </>
  );
}
