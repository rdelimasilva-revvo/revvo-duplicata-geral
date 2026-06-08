import { XCircle, X } from '@phosphor-icons/react';
import { useState } from 'react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';

interface RejectConfirmationModalProps {
  bill: Bill;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function RejectConfirmationModal({
  bill,
  onConfirm,
  onCancel,
}: RejectConfirmationModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" weight="fill" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Confirmar Rejeição</h2>
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
            Você tem certeza que deseja rejeitar esta solicitação?
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2 mb-4">
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

          <div>
            <label htmlFor="rejectReason" className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da rejeição <span className="text-red-500">*</span>
            </label>
            <textarea
              id="rejectReason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva o motivo da rejeição..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
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
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Rejeição
          </button>
        </div>
      </div>
    </div>
  );
}
