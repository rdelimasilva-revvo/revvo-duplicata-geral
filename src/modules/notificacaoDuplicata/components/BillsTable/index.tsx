import { BillsTableHeader } from '@/modules/notificacaoDuplicata/components/BillsTable/BillsTableHeader';
import { BillsTableRow } from '@/modules/notificacaoDuplicata/components/BillsTable/BillsTableRow';
import { mockBills } from '@/modules/notificacaoDuplicata/components/BillsTable/mockData';
import { tableStyles } from '@/modules/notificacaoDuplicata/components/BillsTable/styles';

export function BillsTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm mt-6">
      <div 
        className="px-6 py-4 text-sm"
        style={{ 
          color: tableStyles.colors.text.primary,
          borderBottom: `1px solid ${tableStyles.colors.border}`
        }}
      >
        Nenhuma parcela/duplicata selecionada
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <BillsTableHeader />
          <tbody>
            {mockBills.map((bill) => (
              <BillsTableRow 
                key={`${bill.id}-${bill.parcelNumber}`} 
                bill={bill}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}