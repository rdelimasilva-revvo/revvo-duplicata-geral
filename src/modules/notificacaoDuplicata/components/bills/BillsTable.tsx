import { Bill, BillFilters, StatusManifestacao } from '@/modules/notificacaoDuplicata/types/bill';
import { mockBills } from '@/modules/notificacaoDuplicata/data/mockBills';
import { BillsTableActions } from '@/modules/notificacaoDuplicata/components/bills/BillsTableActions';
import { BillsTableHeader, SortField, SortOrder } from '@/modules/notificacaoDuplicata/components/bills/BillsTableHeader';
import { BillsTableRow } from '@/modules/notificacaoDuplicata/components/bills/BillsTableRow';
import { useSelectedBills } from '@/modules/notificacaoDuplicata/hooks/useSelectedBills';
import { useState, useMemo, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { STATUS_SORT_ORDER } from '@/modules/notificacaoDuplicata/utils/statusConfig';

interface BillsTableProps {
  onSelectBill: (bill: Bill) => void;
  onAnnotation?: (bill: Bill) => void;
  filters?: BillFilters;
  bills?: Bill[];
  selectableStatuses?: StatusManifestacao[];
}

function parseBRDate(dateStr: string): Date | null {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

function matchesDueDate(bill: Bill, filterDate: string): boolean {
  if (!filterDate) return true;
  const filterParts = filterDate.split('-');
  if (filterParts.length !== 3) return true;
  const formatted = `${filterParts[2]}/${filterParts[1]}/${filterParts[0]}`;
  return bill.dueDate === formatted;
}

function matchesSacador(bill: Bill, search: string): boolean {
  if (!search) return true;
  const lower = search.toLowerCase();
  return (
    bill.sacador.name.toLowerCase().includes(lower) ||
    bill.sacador.cnpj.toLowerCase().includes(lower)
  );
}

export function BillsTable({ onSelectBill, onAnnotation, filters, bills: externalBills, selectableStatuses }: BillsTableProps) {
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sourceBills = externalBills ?? mockBills;

  const filteredBills = useMemo(() => {
    if (!filters) return sourceBills;

    return sourceBills.filter((bill) => {
      if (!matchesDueDate(bill, filters.dueDate)) return false;
      if (!matchesSacador(bill, filters.sacador)) return false;
      if (filters.status && bill.statusManifestacao !== filters.status) return false;
      if (filters.urgentOnly && !(bill.diasParaManifestacao > 0 && bill.diasParaManifestacao <= 3)) return false;
      return true;
    });
  }, [filters, sourceBills]);

  const sortedBills = useMemo(() => {
    if (!sortField) return filteredBills;

    return [...filteredBills].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'issueDate': {
          const aDate = parseBRDate(a.issueDate);
          const bDate = parseBRDate(b.issueDate);
          aValue = aDate?.getTime() ?? 0;
          bValue = bDate?.getTime() ?? 0;
          break;
        }
        case 'numeroNota': {
          const aNota = a.numeroNota ?? a.notaFiscal?.numero ?? a.id;
          const bNota = b.numeroNota ?? b.notaFiscal?.numero ?? b.id;
          aValue = aNota.toLowerCase();
          bValue = bNota.toLowerCase();
          break;
        }
        case 'sacado':
          aValue = (a.sacado?.name ?? '').toLowerCase();
          bValue = (b.sacado?.name ?? '').toLowerCase();
          break;
        case 'sacador':
          aValue = a.sacador.name.toLowerCase();
          bValue = b.sacador.name.toLowerCase();
          break;
        case 'statusManifestacao':
          aValue = STATUS_SORT_ORDER[a.statusManifestacao] ?? 99;
          bValue = STATUS_SORT_ORDER[b.statusManifestacao] ?? 99;
          break;
        case 'diasParaManifestacao':
          aValue = a.diasParaManifestacao;
          bValue = b.diasParaManifestacao;
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBills, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedBills.length / itemsPerPage));
  const visibleBills = useMemo(
    () => sortedBills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [sortedBills, currentPage, itemsPerPage]
  );

  const {
    selectedBills,
    isSelected,
    isSelectable,
    toggleBill,
    toggleAll,
    allSelected,
    selectedCount
  } = useSelectedBills(filteredBills, selectableStatuses);

  return (
    <div className="bg-white rounded-lg shadow-sm mt-6 relative">
      <BillsTableActions
        selectedCount={selectedCount}
        selectedBills={selectedBills}
        bills={filteredBills}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <BillsTableHeader
            allSelected={allSelected}
            onToggleAll={toggleAll}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
          <tbody>
            {visibleBills.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-16">
                  <div className="flex flex-col items-center justify-center text-center">
                    <FileText className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1.5} />
                    <p className="text-sm font-medium text-gray-500">
                      Nenhuma duplicata encontrada
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tente ajustar os filtros para ver mais resultados
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleBills.map((bill) => (
                <BillsTableRow
                  key={bill.id}
                  bill={bill}
                  isSelected={isSelected(bill.id)}
                  isSelectable={isSelectable(bill.id)}
                  onToggle={() => toggleBill(bill.id)}
                  onClick={() => onSelectBill(bill)}
                  onAnnotation={onAnnotation}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-gray-500">
          {sortedBills.length > 0
            ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, sortedBills.length)} de ${sortedBills.length}`
            : '0 resultados'}
        </span>
        <div className="flex gap-2">
          {currentPage > 1 && (
            <button
              className="h-[26px] px-3 border rounded-md text-sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </button>
          )}
          {currentPage < totalPages && sortedBills.length > 0 && (
            <button
              className="h-[26px] px-3 border rounded-md text-sm bg-[#0070F2] text-white"
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
