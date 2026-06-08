import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { mockBills } from '@/modules/notificacaoDuplicata/data/mockBills';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { ROUTES } from '@/constants/routes';

interface ReceivedBillsListProps {
  onSelectBill?: (bill: Bill) => void;
}

export function ReceivedBillsList({ onSelectBill }: ReceivedBillsListProps) {
  const navigate = useNavigate();
  const recentBills = mockBills
    .filter(bill => bill.statusManifestacao === 'em_fila_analise_manual')
    .sort((a, b) => b.diasPendente - a.diasPendente)
    .slice(0, 5);

  const handleViewMore = () => {
    navigate(`/app/${ROUTES.NOTIFICACOES_DUPLICATAS_PENDENTES}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDaysBadgeColor = (days: number) => {
    if (days > 7) return 'bg-green-100 text-green-700 border-green-200';
    if (days > 3) return 'bg-gray-100 text-gray-900 border-gray-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full w-full">
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-gray-900">
            Pendentes de Manifestação
          </h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Pendentes de manifestação
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {recentBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FileText className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-gray-500 text-sm">
              Nenhuma duplicata pendente
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentBills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectBill?.(bill)}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {bill.sacador.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {bill.sacador.cnpj}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium border rounded-md whitespace-nowrap ${getDaysBadgeColor(
                      bill.diasParaManifestacao
                    )}`}
                  >
                    {bill.diasParaManifestacao}d
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <p className="text-xs text-gray-500">Valor</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(bill.amount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">N° Nota</p>
                    <p className="text-sm font-medium text-gray-700">
                      {bill.numeroNota ?? bill.notaFiscal?.numero ?? bill.id}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t-2 border-gray-200 flex-shrink-0">
        <button
          onClick={handleViewMore}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          Ver Mais
          <ChevronRight className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
