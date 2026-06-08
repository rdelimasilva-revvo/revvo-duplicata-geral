import { useState, useMemo, useEffect } from 'react';
import { ReceivedBillsTableHeader } from './ReceivedBillsTableHeader';
import { ReceivedBillsTableRow } from './ReceivedBillsTableRow';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { mockBills } from '@/modules/notificacaoDuplicata/data/mockBills';

interface ReceivedBillsTableProps {
  bills?: Bill[];
  onAccept?: (bill: Bill) => void;
  onReject?: (bill: Bill) => void;
  onEditClick?: (bill: Bill) => void;
  onCancelDuplicate?: () => void;
  onCancelInstallment?: () => void;
  onAbatimento?: (bill: Bill) => void;
}

export function ReceivedBillsTable({
  bills,
  onAccept,
  onReject,
  onEditClick,
  onCancelDuplicate,
  onCancelInstallment,
  onAbatimento
}: ReceivedBillsTableProps) {
  const data = bills ?? mockBills;
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  const visibleBills = useMemo(
    () => data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [data, currentPage, itemsPerPage]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <ReceivedBillsTableHeader />
          <tbody>
            {visibleBills.length === 0 ? (
              <tr>
                <td colSpan={100} className="text-center py-12 text-sm text-gray-500">
                  Nenhuma duplicata encontrada com os filtros aplicados.
                </td>
              </tr>
            ) : (
              visibleBills.map((bill) => (
                <ReceivedBillsTableRow
                  key={bill.id}
                  bill={bill}
                  onAccept={onAccept}
                  onReject={onReject}
                  onEditClick={onEditClick}
                  onCancelDuplicate={onCancelDuplicate}
                  onCancelInstallment={onCancelInstallment}
                  onAbatimento={onAbatimento}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          {data.length} {data.length === 1 ? 'resultado' : 'resultados'}
        </span>
        <div className="flex gap-2">
        {currentPage > 1 && (
          <button
            className="h-9 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
        )}
        {currentPage < totalPages && (
          <button
            className="h-9 px-4 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
