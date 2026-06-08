import { X } from 'lucide-react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';

interface BillDetailsProps {
  bill: Bill;
  onClose: () => void;
}

export function BillDetails({ bill, onClose }: BillDetailsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 h-full">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Duplicata: {bill.parcelNumber} - NF {bill.id}</h2>
          <p className="text-sm text-gray-600 mt-1">Emissão: 10/10/2024</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Fornecedor</h3>
          <p className="font-medium">{bill.supplier}</p>
          <p className="text-sm text-gray-600 mt-1">
            Última atualização: 01/01/2024
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Vencimento</h3>
            <p className="font-medium">{bill.dueDate}</p>
            <p className="text-sm text-gray-600 mt-1">
              Última atualização em 01/01/2024
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Dados para pagamento</h3>
            <p className="font-medium">117 - Corretora de Câmbio LTDA</p>
            <p className="text-sm text-gray-600 mt-1">Ag: 001 - CC: 12356-9</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Instrumento de pagamento</h3>
            <p className="font-medium">Transferência Bancária</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="primary">Aceitar</Button>
          <Button variant="secondary">Recusar</Button>
        </div>

        <div className="border-t pt-6">
          <div className="flex gap-6">
            <button className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600">
              Detalhes da duplicata
            </button>
            <button className="text-gray-600 hover:text-gray-800 pb-2">
              Eventos da duplicata
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}