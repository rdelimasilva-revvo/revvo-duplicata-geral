import { Eye } from 'lucide-react';
import { Bill, StatusManifestacao } from '@/modules/notificacaoDuplicata/types/bill';
import { TableCheckbox } from '@/modules/notificacaoDuplicata/components/ui/TableCheckbox';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import { STATUS_CONFIG } from '@/modules/notificacaoDuplicata/utils/statusConfig';

interface BillsTableRowProps {
  bill: Bill;
  isSelected: boolean;
  isSelectable: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
  onAnnotation?: (bill: Bill) => void;
}

const getStatusBadge = (status: StatusManifestacao) => {
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bgColor} ${config.textColor}`}>
      {config.shortLabel}
    </span>
  );
};

const getDaysBadge = (days: number) => {
  if (days <= 0) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
        -
      </span>
    );
  }
  if (days <= 3) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
        {days}d
      </span>
    );
  }
  if (days <= 7) {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-900">
        {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
      {days}d
    </span>
  );
};

export function BillsTableRow({
  bill,
  isSelected,
  isSelectable,
  onToggle,
  onClick,
}: BillsTableRowProps) {
  const displayNumeroNota = bill.numeroNota ?? bill.notaFiscal?.numero ?? bill.id;

  return (
    <tr className="border-b-2 border-gray-200 hover:bg-gray-50 transition-all duration-200">
      <td className="px-3 py-3 w-[160px]">
        <div className="flex items-center gap-2">
          <TableCheckbox
            checked={isSelected}
            disabled={!isSelectable}
            onChange={(e) => {
              e.stopPropagation();
              onToggle(e);
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Selecionar notificação ${bill.id}`}
          />
          <div>
            <div className="text-xs font-semibold text-blue-600">{displayNumeroNota}</div>
            <div className="text-[10px] text-gray-500">{bill.type}</div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-xs text-gray-900 w-[90px]">{bill.issueDate}</td>
      <td className="px-3 py-3 w-[160px]">
        <div>
          <div className="font-medium text-xs text-gray-900">{bill.sacador.name}</div>
          <div className="text-[10px] text-gray-500">{bill.sacador.cnpj}</div>
        </div>
      </td>
      <td className="px-3 py-3 w-[160px]">
        {bill.sacado ? (
          <div>
            <div className="font-medium text-xs text-gray-900">{bill.sacado.name}</div>
            <div className="text-[10px] text-gray-500">{bill.sacado.cnpj}</div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </td>
      <td className="px-3 py-3 w-[100px]">
        {getStatusBadge(bill.statusManifestacao)}
      </td>
      <td className="px-3 py-3 w-[70px]">
        {getDaysBadge(bill.diasParaManifestacao)}
      </td>
      <td className="px-3 py-3 text-xs font-semibold text-gray-900 w-[80px] text-right">{formatCurrency(bill.amount)}</td>
      <td className="px-3 py-3 w-[60px]">
        <div className="flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalhes"
            aria-label="Ver detalhes"
          >
            <Eye size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
