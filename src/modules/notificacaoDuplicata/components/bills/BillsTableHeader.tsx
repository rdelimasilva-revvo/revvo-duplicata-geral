import { TableCheckbox } from '@/modules/notificacaoDuplicata/components/ui/TableCheckbox';
import { CaretUp, CaretDown } from '@phosphor-icons/react';

export type SortField = 'issueDate' | 'numeroNota' | 'sacador' | 'sacado' | 'amount' | 'statusManifestacao' | 'diasParaManifestacao';
export type SortOrder = 'asc' | 'desc';

interface BillsTableHeaderProps {
  allSelected: boolean;
  onToggleAll: () => void;
  sortField: SortField | null;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export function BillsTableHeader({ allSelected, onToggleAll, sortField, sortOrder, onSort }: BillsTableHeaderProps) {
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <CaretUp size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortOrder === 'asc' ? (
      <CaretUp size={14} className="text-blue-600" />
    ) : (
      <CaretDown size={14} className="text-blue-600" />
    );
  };

  const SortableHeader = ({ field, children, width }: { field: SortField; children: React.ReactNode; width?: string }) => (
    <th
      className={`px-3 py-2.5 font-medium text-left text-[10px] text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group ${width || ''}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {renderSortIcon(field)}
      </div>
    </th>
  );

  return (
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50">
        <th className="px-3 py-2.5 font-medium text-left text-[10px] text-gray-500 uppercase tracking-wider w-[160px]">
          <div className="flex items-center gap-2">
            <TableCheckbox
              checked={allSelected}
              onChange={onToggleAll}
              aria-label="Selecionar todas as notificações"
            />
            <button
              onClick={() => onSort('numeroNota')}
              className="flex items-center gap-1 hover:text-gray-700 transition-colors"
            >
              <span>Numero Nota</span>
              {renderSortIcon('numeroNota')}
            </button>
          </div>
        </th>
        <SortableHeader field="issueDate" width="w-[90px]">Data Entrada</SortableHeader>
        <SortableHeader field="sacador" width="w-[160px]">Cedente</SortableHeader>
        <SortableHeader field="sacado" width="w-[160px]">Sacado</SortableHeader>
        <SortableHeader field="statusManifestacao" width="w-[100px]">Status</SortableHeader>
        <SortableHeader field="diasParaManifestacao" width="w-[70px]">Dias Manif.</SortableHeader>
        <SortableHeader field="amount" width="w-[80px]">Valor</SortableHeader>
        <th className="px-3 py-2.5 font-medium text-center text-[10px] text-gray-500 uppercase tracking-wider w-[60px]">
          Ações
        </th>
      </tr>
    </thead>
  );
}
