import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreVertical, FileText } from 'lucide-react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import { MANIFESTABLE_STATUSES, STATUS_CONFIG } from '@/modules/notificacaoDuplicata/utils/statusConfig';
import { ROUTES } from '@/constants/routes';
import { BillDetailsPanel } from './BillDetailsPanel';

interface ExpandableRowCompactProps {
  bill: Bill;
}

export function ExpandableRowCompact({ bill }: ExpandableRowCompactProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getStatusBadge = () => {
    const config = STATUS_CONFIG[bill.statusManifestacao];
    if (!config) return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">-</span>;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor}`}>
        {config.shortLabel}
      </span>
    );
  };

  const isPending = MANIFESTABLE_STATUSES.includes(bill.statusManifestacao);

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" strokeWidth={1.5} />
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{bill.id}</div>
                <div className="text-xs text-gray-600 truncate">{bill.sacador.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge()}
              <button
                onClick={() => setShowDetailModal(true)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Ver detalhes"
              >
                <Eye size={18} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  title="Ações"
                >
                  <MoreVertical size={18} className="text-gray-600" />
                </button>
                {showActions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowActions(false)}
                    />
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        onClick={() => {
                          navigate(`/${ROUTES.NOTIFICACOES_DUPLICATAS_MANIFESTACAO}?id=${bill.id}`);
                          setShowActions(false);
                        }}
                      >
                        Manifestação
                      </button>
                      {isPending ? (
                        <>
                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 transition-colors font-medium"
                            onClick={() => setShowActions(false)}
                          >
                            Aceitar
                          </button>
                          <button
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                            onClick={() => setShowActions(false)}
                          >
                            Recusar
                          </button>
                        </>
                      ) : (
                        <button
                          className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                          onClick={() => {
                            navigate(`/app/${ROUTES.NOTIFICACOES_DUPLICATAS_MANIFESTACAO}?id=${bill.id}`);
                            setShowActions(false);
                          }}
                        >
                          Alterar Manifestação
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Emissão:</span>
              <span className="ml-1 text-gray-900 font-medium">{bill.issueDate}</span>
            </div>
            <div>
              <span className="text-gray-500">Vencimento:</span>
              <span className="ml-1 text-gray-900 font-medium">{bill.dueDate}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500">Valor Total</div>
            <div className="text-lg font-bold text-gray-900">{formatCurrency(bill.amount)}</div>
          </div>
        </div>
      </div>

      {showDetailModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]" onClick={() => setShowDetailModal(false)}>
          <div className="w-[900px] max-w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <BillDetailsPanel
              bill={bill}
              onClose={() => setShowDetailModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
