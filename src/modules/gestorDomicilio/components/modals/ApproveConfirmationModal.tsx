import { CheckCircle, X } from '@phosphor-icons/react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';

interface ApproveConfirmationModalProps {
  bill: Bill;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ApproveConfirmationModal({
  bill,
  onConfirm,
  onCancel,
}: ApproveConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" weight="fill" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Confirmar Aprovação</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Você tem certeza que deseja aprovar esta solicitação?
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium text-gray-900">{bill.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">IUD:</span>
              <span className="font-medium text-blue-600">{bill.iud}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Emitente:</span>
              <span className="font-medium text-gray-900">{bill.sacador.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(bill.amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-green-600 rounded-md text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            Confirmar Aprovação
          </button>
        </div>
      </div>
    </div>
  );
}
