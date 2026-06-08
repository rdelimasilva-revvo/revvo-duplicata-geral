import { useState, useMemo } from 'react';
import { InvoicesTableHeader } from './InvoicesTableHeader';
import { InvoicesTableRow } from './InvoicesTableRow';
import { Invoice } from '../types/invoice';
import { mockInvoices } from '../data/mockInvoices';

interface InvoicesTableProps {
  onEditClick: (invoice: Invoice) => void;
  onCancelDuplicate: () => void;
  onCancelInstallment: () => void;
}

export function InvoicesTable({
  onEditClick,
  onCancelDuplicate,
  onCancelInstallment
}: InvoicesTableProps) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(mockInvoices.length / itemsPerPage));

  const visibleInvoices = useMemo(
    () => mockInvoices.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [currentPage, itemsPerPage]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <InvoicesTableHeader />
          <tbody>
            {visibleInvoices.map((invoice) => (
              <InvoicesTableRow
                key={invoice.id}
                invoice={invoice}
                onEditClick={onEditClick}
                onCancelDuplicate={onCancelDuplicate}
                onCancelInstallment={onCancelInstallment}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end gap-2 px-4 py-3 bg-gray-50 border-t border-gray-200">
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
  );
}
