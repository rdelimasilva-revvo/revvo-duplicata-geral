import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { TableCheckbox } from '@/modules/notificacaoDuplicata/components/ui/TableCheckbox';

interface BillsTableCompactProps {
  bills: Bill[];
  selectedBill: Bill | null;
  onSelectBill: (bill: Bill) => void;
}

export function BillsTableCompact({ bills, selectedBill, onSelectBill }: BillsTableCompactProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 h-8 font-normal text-left bg-white">
                <div className="flex items-center gap-3">
                  <TableCheckbox aria-label="Selecionar Tudo" />
                  <span>IUD</span>
                </div>
              </th>
              <th className="px-6 h-8 font-normal text-left bg-white">Sacador</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr
                key={bill.id}
                className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer h-8 ${
                  selectedBill?.id === bill.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectBill(bill)}
              >
                <td className="px-6">
                  <div className="flex items-center gap-3">
                    <TableCheckbox
                      aria-label={`Selecionar notificação ${bill.id}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-blue-600 text-sm">{bill.iud}</span>
                  </div>
                </td>
                <td className="px-6 text-sm">{bill.sacador.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}