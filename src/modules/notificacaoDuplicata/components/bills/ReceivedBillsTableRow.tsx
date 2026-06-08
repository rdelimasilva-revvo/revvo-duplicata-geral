import { useState } from 'react';
import { Eye, MoreVertical } from 'lucide-react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';
import { STATUS_CONFIG, MANIFESTABLE_STATUSES } from '@/modules/notificacaoDuplicata/utils/statusConfig';
import { BillDetailsPanel } from './BillDetailsPanel';

interface ReceivedBillsTableRowProps {
  bill: Bill;
  onAccept?: (bill: Bill) => void;
  onReject?: (bill: Bill) => void;
  onEditClick?: (bill: Bill) => void;
  onCancelDuplicate?: () => void;
  onCancelInstallment?: () => void;
  onAbatimento?: (bill: Bill) => void;
}

export function ReceivedBillsTableRow({
  bill,
  onAccept,
  onReject,
  onAbatimento,
}: ReceivedBillsTableRowProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isPending = MANIFESTABLE_STATUSES.includes(bill.statusManifestacao);

  const config = STATUS_CONFIG[bill.statusManifestacao];
  const statusBadge = config ? (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor}`}>
      {config.shortLabel}
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">-</span>
  );

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors border-b border-gray-200">
        <td className="px-4 py-4 text-sm text-gray-900">{bill.id}</td>
        <td className="px-4 py-4 text-sm text-gray-900">{bill.sacador.name}</td>
        <td className="px-4 py-4 text-sm text-gray-900">{bill.issueDate}</td>
        <td className="px-4 py-4 text-sm text-gray-900">{bill.dueDate}</td>
        <td className="px-4 py-4 text-sm text-gray-900 text-right font-semibold">
          {formatCurrency(bill.amount)}
        </td>
        <td className="px-4 py-4 text-sm text-gray-900 text-center">
          {statusBadge}
        </td>
        <td className="px-4 py-4 relative w-[100px]">
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetailModal(true);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Ver detalhes"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Ações"
            >
              <MoreVertical size={16} />
            </button>
          </div>
          {showActions && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(false);
                }}
              />
              <div className="absolute right-4 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailModal(true);
                    setShowActions(false);
                  }}
                >
                  Ver detalhes
                </button>
                {isPending && (
                  <>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-green-700 hover:bg-green-50 transition-colors font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAccept?.(bill);
                        setShowActions(false);
                      }}
                    >
                      Aceitar
                    </button>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject?.(bill);
                        setShowActions(false);
                      }}
                    >
                      Recusar
                    </button>
                    {onAbatimento && (
                      <button
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAbatimento(bill);
                          setShowActions(false);
                        }}
                      >
                        Registrar abatimento
                      </button>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </td>
      </tr>
      {showDetailModal && (
        <tr>
          <td colSpan={7} className="p-0">
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1000]" onClick={() => setShowDetailModal(false)}>
              <div className="w-[900px] max-w-[90vw] h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <BillDetailsPanel
                  bill={bill}
                  onClose={() => setShowDetailModal(false)}
                />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
