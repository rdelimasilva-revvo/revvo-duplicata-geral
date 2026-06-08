import { useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, FileText } from 'lucide-react';
import { Modal } from '@/modules/gestorDomicilio/components/ui/Modal';
import { StandardButton } from '@/components/ui';
import { RejectDialog } from '@/modules/gestorDomicilio/components/ui/RejectDialog';
import { Toast } from '@/modules/gestorDomicilio/components/ui/Toast';
import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { formatCurrency } from '@/modules/gestorDomicilio/utils/format';

interface BatchManifestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBills: Bill[];
  onSuccess: () => void;
}

export function BatchManifestationModal({ 
  isOpen, 
  onClose, 
  selectedBills, 
  onSuccess 
}: BatchManifestationModalProps) {
  const [action, setAction] = useState<'accept' | 'reject' | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const totalAmount = selectedBills.reduce((sum, bill) => sum + bill.amount, 0);
  const pendingBills = selectedBills.filter(bill => 
    bill.manifestation === 'Manifestação Aceite/Recusa'
  );

  const handleAcceptAll = () => {
    setAction('accept');
    setSuccessMessage(`${pendingBills.length} duplicata${pendingBills.length > 1 ? 's' : ''} aceita${pendingBills.length > 1 ? 's' : ''} com sucesso`);
    setShowSuccessToast(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  const handleRejectAll = () => {
    setAction('reject');
    setShowRejectDialog(true);
  };

  const handleConfirmReject = (reason: string, description: string) => {
    setShowRejectDialog(false);
    setSuccessMessage(`${pendingBills.length} duplicata${pendingBills.length > 1 ? 's' : ''} recusada${pendingBills.length > 1 ? 's' : ''} com sucesso`);
    setShowSuccessToast(true);
    setTimeout(() => {
      onSuccess();
      onClose();
    }, 2000);
  };

  const handleCloseModal = () => {
    setAction(null);
    onClose();
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleCloseModal} maxWidth="max-w-[800px]">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Manifestação em Lote</h2>
          
          {/* Alerta de Prazos Legais */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Atenção aos Prazos Legais</p>
                <p className="text-amber-700">
                  <strong>Recusa:</strong> 10 dias úteis para manifestação • 
                  <strong> Aceite:</strong> 10 dias úteis para manifestação •
                  Documentar motivos de recusa obrigatório
                </p>
              </div>
            </div>
          </div>

          {/* Resumo da Seleção */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-3">Resumo da Seleção</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total selecionado:</span>
                <p className="font-medium">{selectedBills.length} duplicata{selectedBills.length > 1 ? 's' : ''}</p>
              </div>
              <div>
                <span className="text-gray-600">Pendentes de manifestação:</span>
                <p className="font-medium text-orange-600">{pendingBills.length} duplicata{pendingBills.length > 1 ? 's' : ''}</p>
              </div>
              <div>
                <span className="text-gray-600">Valor total:</span>
                <p className="font-medium">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Lista de Duplicatas */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Duplicatas Selecionadas</h3>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">IUD</th>
                    <th className="px-3 py-2 text-left">Sacador</th>
                    <th className="px-3 py-2 text-left">Valor</th>
                    <th className="px-3 py-2 text-left">Vencimento</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBills.map((bill) => (
                    <tr key={bill.id} className="border-b">
                      <td className="px-3 py-2 text-blue-600">{bill.iud}</td>
                      <td className="px-3 py-2">{bill.sacador.name}</td>
                      <td className="px-3 py-2">{formatCurrency(bill.amount)}</td>
                      <td className="px-3 py-2">{bill.dueDate}</td>
                      <td className="px-3 py-2">
                        <span className={
                          bill.manifestation === 'Manifestação Aceite/Recusa' 
                            ? 'text-orange-600' 
                            : bill.manifestation === 'Aceito' 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                        }>
                          {bill.manifestation}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>


          {pendingBills.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 mb-1">Nenhuma duplicata pendente</p>
                  <p className="text-yellow-700">
                    Todas as duplicatas selecionadas já foram manifestadas anteriormente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <StandardButton variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </StandardButton>
            <StandardButton
              variant="primary"
              onClick={handleAcceptAll}
              disabled={pendingBills.length === 0}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Aceitar Todas ({pendingBills.length})
            </StandardButton>
            <StandardButton
              variant="danger"
              onClick={handleRejectAll}
              disabled={pendingBills.length === 0}
              icon={<XCircle className="w-4 h-4" />}
            >
              Recusar Todas ({pendingBills.length})
            </StandardButton>
          </div>
        </div>
      </Modal>

      <RejectDialog
        isOpen={showRejectDialog}
        onConfirm={handleConfirmReject}
        onCancel={() => setShowRejectDialog(false)}
        billData={{
          sacado: `${pendingBills.length} duplicata${pendingBills.length > 1 ? 's' : ''} selecionada${pendingBills.length > 1 ? 's' : ''}`,
          date: new Date().toLocaleDateString('pt-BR'),
          value: totalAmount,
          dueDate: 'Múltiplas datas',
          invoiceNumber: 'Múltiplas faturas',
          orderNumber: 'Múltiplas ordens'
        }}
      />

      <Toast
        isOpen={showSuccessToast}
        title="Manifestação em Lote"
        message={successMessage}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
}