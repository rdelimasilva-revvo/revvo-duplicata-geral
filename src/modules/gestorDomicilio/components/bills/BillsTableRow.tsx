import { useState } from 'react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { TableCheckbox } from '@/modules/gestorDomicilio/components/ui/TableCheckbox';
import { formatCurrency } from '@/modules/gestorDomicilio/utils/format';
import { ActionsMenu } from '@/modules/gestorDomicilio/components/bills/ActionsMenu';
import { ApproveConfirmationModal } from '@/modules/gestorDomicilio/components/modals/ApproveConfirmationModal';
import { RejectConfirmationModal } from '@/modules/gestorDomicilio/components/modals/RejectConfirmationModal';

interface BillsTableRowProps {
  bill: Bill;
  isSelected: boolean;
  isSelectable: boolean;
  onToggle: (e: React.MouseEvent) => void;
  onClick: () => void;
  showUrgencyIndicators?: boolean;
}

export function BillsTableRow({
  bill,
  isSelected,
  isSelectable,
  onToggle,
  onClick,
}: BillsTableRowProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const getActionRequiredStyle = (action: string) => {
    switch (action) {
      case 'Alteração Pendente':
      case 'Alteração de Domicílio de Pgto':
        return 'text-orange-600 font-medium';
      case 'Manifestação Aceite/Recusa':
        return 'text-red-600 font-medium';
      case 'Acatado':
        return 'text-green-600';
      case 'Recusado':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleApprove = () => {
    console.log('Aprovado:', bill);
    setShowApproveModal(false);
  };

  const handleReject = (reason: string) => {
    console.log('Rejeitado:', bill, 'Motivo:', reason);
    setShowRejectModal(false);
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-2">
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
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{bill.type}</span>
            <span className="text-xs text-blue-600">{bill.iud}</span>
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm" onClick={onClick}>
        {bill.issueDate}
      </td>

      <td className="px-4 py-3 text-sm font-medium" onClick={onClick}>
        {formatCurrency(bill.amount)}
      </td>

      <td className="px-4 py-3 text-sm" onClick={onClick}>
        {bill.dueDate}
      </td>

      <td className="px-4 py-3" onClick={onClick}>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{bill.sacador.name}</span>
          <span className="text-xs text-gray-500">{bill.sacador.cnpj}</span>
        </div>
      </td>

      <td className="px-4 py-3" onClick={onClick}>
        {bill.newReceiver ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium">{bill.newReceiver.name}</span>
            <span className="text-xs text-gray-500">{bill.newReceiver.cnpj}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>

      <td className="px-4 py-3" onClick={onClick}>
        <span className={`text-sm ${getActionRequiredStyle(bill.requiredAction)}`}>
          {bill.requiredAction}
        </span>
      </td>

      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-center">
          <ActionsMenu
            onViewDetails={onClick}
            onApprove={() => setShowApproveModal(true)}
            onReject={() => setShowRejectModal(true)}
          />
        </div>
      </td>

      {showApproveModal && (
        <ApproveConfirmationModal
          bill={bill}
          onConfirm={handleApprove}
          onCancel={() => setShowApproveModal(false)}
        />
      )}

      {showRejectModal && (
        <RejectConfirmationModal
          bill={bill}
          onConfirm={handleReject}
          onCancel={() => setShowRejectModal(false)}
        />
      )}
    </tr>
  );
}
