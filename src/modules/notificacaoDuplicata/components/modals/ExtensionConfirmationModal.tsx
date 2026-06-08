import { Modal } from '@/modules/notificacaoDuplicata/components/ui/Modal';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';

interface ExtensionConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCount: number;
  totalAmount: number;
}

export function ExtensionConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  totalAmount,
}: ExtensionConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Confirmar solicitação de prorrogação</h2>
        
        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            Você está prestes a solicitar a prorrogação de vencimento para:
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Quantidade de duplicatas:</span>
              <span className="font-medium">{selectedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Valor total:</span>
              <span className="font-medium">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <p className="text-gray-600">
            Após a confirmação, sua solicitação será enviada para análise.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Confirmar solicitação
          </Button>
        </div>
      </div>
    </Modal>
  );
}