import { useState, useMemo, useEffect } from 'react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { ExpandableRow } from './ExpandableRow';
import { ExpandableRowCompact } from './ExpandableRowCompact';

interface ExpandableTableProps {
  bills: Bill[];
}

export function ExpandableTable({ bills }: ExpandableTableProps) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [isCompactView, setIsCompactView] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsCompactView(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(bills.length / itemsPerPage));

  const visibleBills = useMemo(
    () => bills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [bills, currentPage, itemsPerPage]
  );

  if (isCompactView) {
    return (
      <div className="space-y-3">
        {visibleBills.map((bill) => (
          <ExpandableRowCompact key={bill.id} bill={bill} />
        ))}
        <div className="flex justify-center gap-2 pt-4">
          {currentPage > 1 && (
            <button
              className="h-10 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white active:bg-gray-100 transition-colors"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
          )}
          <div className="flex items-center px-3 text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          {currentPage < totalPages && (
            <button
              className="h-10 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium active:bg-blue-700 transition-colors"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Próxima
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Nº da Duplicata
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Sacador
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Data de emissão
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Data de vencimento
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Valor total
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap w-[80px]">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleBills.map((bill) => (
              <ExpandableRow key={bill.id} bill={bill} />
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
        <div className="flex items-center px-3 text-sm text-gray-600">
          Página {currentPage} de {totalPages}
        </div>
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
