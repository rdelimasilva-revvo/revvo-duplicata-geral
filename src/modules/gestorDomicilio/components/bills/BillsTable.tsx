import { useMemo, useState } from 'react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { mockBills } from '@/modules/gestorDomicilio/data/mockBills';
import { BillsTableHeader } from '@/modules/gestorDomicilio/components/bills/BillsTableHeader';
import { BillsTableRow } from '@/modules/gestorDomicilio/components/bills/BillsTableRow';
import { useSelectedBills } from '@/modules/gestorDomicilio/hooks/useSelectedBills';
import { useSettings } from '@/modules/gestorDomicilio/contexts/SettingsContext';

interface BillsTableProps {
  onSelectBill: (bill: Bill) => void;
  onRefresh?: () => void;
}

export function BillsTable({ onSelectBill, onRefresh }: BillsTableProps) {
  const { twoStepPayment } = useSettings();
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(mockBills.length / itemsPerPage));
  const visibleBills = useMemo(
    () => mockBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage]
  );
  const {
    selectedBills,
    isSelected,
    isSelectable,
    toggleBill,
    toggleAll,
    allSelected,
    selectedCount
  } = useSelectedBills(mockBills);

  const selectedBillsData = mockBills.filter((bill) => selectedBills.has(bill.id));

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <div className="mt-6 space-y-3">
      <div className="px-4">
        <h2 className="text-lg font-medium text-gray-900">
          {selectedCount === 0
            ? 'Nenhum item selecionado'
            : `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`
          }
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <BillsTableHeader
              allSelected={allSelected}
              onToggleAll={toggleAll}
            />
            <tbody>
              {visibleBills.map((bill) => {
                const billId = bill.id;
                return (
                  <BillsTableRow
                    key={billId}
                    bill={bill}
                    isSelected={isSelected(billId)}
                    isSelectable={isSelectable(billId)}
                    onToggle={() => toggleBill(billId)}
                    onClick={() => onSelectBill(bill)}
                    showUrgencyIndicators={!twoStepPayment}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-2 px-4 py-3">
        {currentPage > 1 && (
          <button
            className="h-8 px-3 border rounded-md text-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
        )}
        {currentPage < totalPages && (
          <button
            className="h-8 px-3 border rounded-md text-sm bg-[#0070F2] text-white"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>
        )}
      </div>
    </div>
  );
}
