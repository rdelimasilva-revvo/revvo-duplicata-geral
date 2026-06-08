import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { formatCurrency } from '@/modules/gestorDomicilio/utils/format';

interface BillsTableCompactProps {
  bills: Bill[];
  selectedBill: Bill | null;
  onSelectBill: (bill: Bill) => void;
}

export function BillsTableCompact({ bills, selectedBill, onSelectBill }: BillsTableCompactProps) {
  return (
    <div className="rounded-lg shadow-sm">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700">Lista de Duplicatas</h3>
      </div>
      <div className="overflow-y-auto max-h-[600px]">
        {bills.map((bill) => {
          return (
            <div
              key={bill.id}
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedBill?.id === bill.id ? 'border-l-4 border-l-blue-600' : ''
              }`}
              onClick={() => onSelectBill(bill)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-900">{bill.type}</span>
                  </div>
                  <p className="text-xs text-blue-600">{bill.iud}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(bill.amount)}</p>
                <p className="text-xs text-gray-600">{bill.sacador.name}</p>
                <span className="text-xs text-gray-500">Venc: {bill.dueDate}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
