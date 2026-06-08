import { ChevronDown } from 'lucide-react';
import { Bill } from '@/modules/gestorDomicilio/components/BillsTable/types';
import { tableStyles } from '@/modules/gestorDomicilio/components/BillsTable/styles';

interface BillsTableRowProps {
  bill: Bill;
}

export function BillsTableRow({ bill }: BillsTableRowProps) {
  return (
    <tr style={{ 
      height: tableStyles.sizing.rowHeight,
      borderBottom: `1px solid ${tableStyles.colors.border}`
    }}>
      <td className="px-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300"
            aria-label={`Selecionar duplicata ${bill.id}`}
          />
          <span 
            className="ml-3"
            style={{ color: tableStyles.colors.text.primary }}
          >
            {bill.id}
          </span>
        </div>
      </td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>{bill.parcelNumber}</td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>{bill.supplier}</td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>{bill.dueDate}</td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>
        {`R$ ${bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      </td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>
        <span style={{ color: tableStyles.colors.text.primary }}>{bill.status}</span>
      </td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>
        <span style={{ color: tableStyles.colors.text.primary }}>{bill.manifestation}</span>
      </td>
      <td className="px-6">
        <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer" />
      </td>
    </tr>
  );
}