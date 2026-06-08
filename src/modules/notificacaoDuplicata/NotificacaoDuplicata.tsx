import { useState, useMemo, useCallback } from 'react';
import { KPIGrid } from '@/modules/notificacaoDuplicata/components/dashboard/KPIGrid';
import { ManifestationStatusChart } from '@/modules/notificacaoDuplicata/components/charts/ManifestationStatusChart';
import { ReceivedBillsList } from '@/modules/notificacaoDuplicata/components/dashboard/ReceivedBillsList';
import { ReceivedBillsFilterBar, ReceivedBillsFilters } from '@/modules/notificacaoDuplicata/components/filters/ReceivedBillsFilterBar';
import { BillsTable } from '@/modules/notificacaoDuplicata/components/bills/BillsTable';
import { BillDetailsPanel } from '@/modules/notificacaoDuplicata/components/bills/BillDetailsPanel';
import { PeriodSelector } from '@/modules/notificacaoDuplicata/components/ui/PeriodSelector';
import { mockBills } from '@/modules/notificacaoDuplicata/data/mockBills';

import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { CommercialAnnotationModal } from '@/modules/notificacaoDuplicata/components/modals/CommercialAnnotationModal';

const parseBrDate = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

function NotificacaoDuplicata() {
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filters, setFilters] = useState<ReceivedBillsFilters>({
    search: '',
    issueDateFrom: '',
    issueDateTo: '',
    remainingDays: '',
  });
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [billForAnnotation, setBillForAnnotation] = useState<Bill | null>(null);

  const handleAnnotation = (bill: Bill) => {
    setBillForAnnotation(bill);
    setShowAnnotationModal(true);
  };

  const handleSaveAnnotation = async (data: {
    problemType: string;
    description: string;
    occurrenceDate: string;
    attachments: File[];
    additionalNotes: string;
  }) => {
    console.log('Salvando anotacao comercial:', {
      bill: billForAnnotation?.id,
      ...data,
    });
    setShowAnnotationModal(false);
    setBillForAnnotation(null);
  };

  const handleFilterChange = useCallback((newFilters: ReceivedBillsFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredBills = useMemo(() => {
    return mockBills.filter((bill) => {
      if (filters.search) {
        const term = filters.search.toLowerCase();
        const matchesNota = (bill.numeroNota || bill.notaFiscal?.numero || '').toLowerCase().includes(term);
        const matchesDocContabil = (bill.erp?.documentoContabil || '').toLowerCase().includes(term);
        const matchesCnpj = bill.sacador.cnpj.toLowerCase().replace(/[.\-\/]/g, '').includes(term.replace(/[.\-\/]/g, ''));
        const matchesRazaoSocial = bill.sacador.name.toLowerCase().includes(term);
        const matchesId = bill.id.toLowerCase().includes(term);
        if (!matchesNota && !matchesDocContabil && !matchesCnpj && !matchesRazaoSocial && !matchesId) {
          return false;
        }
      }

      if (filters.issueDateFrom || filters.issueDateTo) {
        const issueDate = parseBrDate(bill.issueDate);
        if (issueDate) {
          if (filters.issueDateFrom) {
            const from = new Date(filters.issueDateFrom + 'T00:00:00');
            if (issueDate < from) return false;
          }
          if (filters.issueDateTo) {
            const to = new Date(filters.issueDateTo + 'T23:59:59');
            if (issueDate > to) return false;
          }
        }
      }

      if (filters.remainingDays) {
        const days = bill.diasParaManifestacao;
        switch (filters.remainingDays) {
          case '0': if (days !== 0) return false; break;
          case '1-3': if (days < 1 || days > 3) return false; break;
          case '4-7': if (days < 4 || days > 7) return false; break;
          case '8-15': if (days < 8 || days > 15) return false; break;
          case '15+': if (days <= 15) return false; break;
        }
      }

      return true;
    });
  }, [filters]);

  return (
    <div className={
      selectedBill
        ? 'p-4 md:p-6 h-full flex flex-col overflow-hidden bg-gray-100'
        : 'p-4 md:p-6 min-h-full max-h-full overflow-y-auto overflow-x-hidden bg-gray-100'
    }>
      {selectedBill ? (
        <>
          <div className="mb-4 flex items-center justify-between flex-shrink-0">
            <h1 className="text-lg md:text-2xl font-bold">Duplicatas Recebidas</h1>
            <PeriodSelector />
          </div>
          <div className="flex-1 min-h-0">
            <BillDetailsPanel
              bill={selectedBill}
              onClose={() => setSelectedBill(null)}
            />
          </div>
        </>
      ) : (
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-lg md:text-2xl font-bold">Duplicatas Recebidas</h1>
            <PeriodSelector />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
            <div className="lg:col-span-8 flex flex-col gap-4">
              <KPIGrid bills={mockBills} />

              <div className="flex-1 flex">
                <ManifestationStatusChart />
              </div>
            </div>
            <div className="lg:col-span-4 flex">
              <ReceivedBillsList onSelectBill={setSelectedBill} />
            </div>
          </div>

          <div className="mt-4">
            <ReceivedBillsFilterBar onFilterChange={handleFilterChange} />
          </div>

          <BillsTable
            onSelectBill={setSelectedBill}
            onAnnotation={handleAnnotation}
            bills={filteredBills}
          />
        </div>
      )}

      {showAnnotationModal && billForAnnotation && (
        <CommercialAnnotationModal
          bill={billForAnnotation}
          onClose={() => {
            setShowAnnotationModal(false);
            setBillForAnnotation(null);
          }}
          onSave={handleSaveAnnotation}
        />
      )}
    </div>
  );
}

export default NotificacaoDuplicata;
