import { CheckCircle2, X, XCircle } from 'lucide-react';
import { AlertTriangle, Clock, Shield } from 'lucide-react';
import { useState } from 'react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';
import { Dialog } from '@/modules/gestorDomicilio/components/ui/Dialog';
import { Toast } from '@/modules/gestorDomicilio/components/ui/Toast';
import { RejectDialog } from '@/modules/gestorDomicilio/components/ui/RejectDialog';
import { formatCurrency } from '@/modules/gestorDomicilio/utils/format';

function calculateDaysRemaining(dueDate: string): number {
  const due = new Date(dueDate.split('/').reverse().join('-'));
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
interface BillDetailsPanelProps {
  bill: Bill;
  onClose: () => void;
}

export function BillDetailsPanel({ bill, onClose }: BillDetailsPanelProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastData, setSuccessToastData] = useState({ title: '', message: '' });
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

  const daysRemaining = calculateDaysRemaining(bill.dueDate);
  const isUrgent = bill.manifestation === 'Manifestação Aceite/Recusa' && daysRemaining <= 3;
  const isOverdue = daysRemaining < 0;
  const handleAccept = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmAccept = () => {
    setShowConfirmDialog(false);
    setSuccessToastData({
      title: 'Aceito com sucesso',
      message: 'Aceito com sucesso'
    });
    setShowSuccessToast(true);
    setStatus('accepted');
  };

  const handleReject = () => {
    setShowRejectDialog(true);
  };

  const handleConfirmReject = (reason: string, description: string) => {
    setShowRejectDialog(false);
    setSuccessToastData({
      title: 'Recusa de duplicata',
      message: 'Manifestação enviada com sucesso'
    });
    setShowSuccessToast(true);
    setStatus('rejected');
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Alertas de Prazo */}
      {bill.manifestation === 'Manifestação Aceite/Recusa' && (
        <div className={`border rounded-lg p-3 mb-4 ${
          isOverdue ? 'bg-red-50 border-red-200' : 
          isUrgent ? 'bg-amber-50 border-amber-200' : 
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start gap-2">
            {isOverdue ? (
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            ) : isUrgent ? (
              <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
            ) : (
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            )}
            <div className="text-sm">
              <p className={`font-medium mb-1 ${
                isOverdue ? 'text-red-800' : 
                isUrgent ? 'text-amber-800' : 
                'text-blue-800'
              }`}>
                {isOverdue ? 'Prazo Vencido!' : 
                 isUrgent ? 'Prazo Urgente!' : 
                 'Prazo para Manifestação'}
              </p>
              <p className={
                isOverdue ? 'text-red-700' : 
                isUrgent ? 'text-amber-700' : 
                'text-blue-700'
              }>
                {isOverdue ? 
                  `Prazo vencido há ${Math.abs(daysRemaining)} dias. Manifestação ainda possível.` :
                  `${daysRemaining} dias restantes para manifestação (Recusa: 10 dias úteis | Aceite: 10 dias úteis)`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Notificação de Duplicata: {bill.type}</h2>
          <p className="text-sm text-gray-600 mt-1">IUD: {bill.iud}</p>
          <p className="text-sm text-gray-600 mt-1">Data da notificação: 10/10/2024</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-gray-600 mb-1">Sacador/Credor</h3>
          <p className="font-medium">{bill.sacador.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            CNPJ: {bill.sacador.cnpj}
          </p>
          {bill.sacador.address && (
            <p className="text-sm text-gray-600 mt-1">{bill.sacador.address}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Data de Emissão</h3>
            <p className="font-medium">{bill.issueDate}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Data de Vencimento</h3>
            <p className="font-medium">{bill.dueDate}</p>
            <p className="text-sm text-gray-600 mt-1">
              Prazo para manifestação: {daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencido'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Valor da duplicata</h3>
            <p className="font-medium">{formatCurrency(bill.amount)}</p>
            <p className="text-sm text-gray-600 mt-1">Valor original</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Valor de Abatimento</h3>
            <p className="font-medium">
              {bill.discountValue > 0 ? formatCurrency(bill.discountValue) : 'Sem abatimento'}
            </p>
          </div>
          <div>
            <h3 className="text-sm text-gray-600 mb-1">Valor de Atualização</h3>
            <p className="font-medium">
              {bill.updateValue > 0 ? formatCurrency(bill.updateValue) : 'Sem atualização'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Última atualização: {bill.lastUpdateDate}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm text-gray-600 mb-1">Instrumento de Pagamento</h3>
          <p className="font-medium">{bill.paymentInstrument.type}</p>
          <p className="text-sm text-gray-600 mt-1">{bill.paymentInstrument.details}</p>
          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <p><strong>Interoperabilidade:</strong> Dados validados via sistema do Banco Central</p>
          </div>
          </div>
        </div>

        {status === 'accepted' && (
          <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>Duplicata aceita - Conta a pagar criada</span>
          </div>
        )}

        {status === 'rejected' && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            <span>Duplicata recusada - Motivo enviado ao sacador</span>
          </div>
        )}

        {status === 'pending' && (
          <div className="flex gap-3">
            <Button 
              variant="success"
              onClick={handleAccept}
            >
              Aceitar
            </Button>
            <Button
              variant="secondary"
              onClick={handleReject}
            >
              Recusar
            </Button>
          </div>
        )}

        <div className="border-t pt-6">
          <div className="flex gap-6">
            <button className="text-blue-600 font-medium pb-2 border-b-2 border-blue-600 h-[26px]">
              Detalhes da notificação
            </button>
            <button className="text-gray-600 hover:text-gray-800 pb-2 h-[26px]">
              Histórico de ações
            </button>
          </div>
        </div>

        {status === 'accepted' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm text-gray-600 mb-2">Conta a pagar criada para</h3>
              <p className="font-medium">{bill.sacador.name}</p>
              <p className="text-sm text-gray-600">{bill.id} - {bill.sacador.cnpj}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Centro de custo</h3>
                <p className="font-medium">Operações - 001</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">ID da conta a pagar</h3>
                <p className="font-medium">374c6a2e-f39e-4abb-bb48-acacd0e40bcb</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Valor original</h3>
                <p className="font-medium">{formatCurrency(bill.amount)}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Vencimento original</h3>
                <p className="font-medium">{bill.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Tipo de duplicata</h3>
                <p className="font-medium">{bill.type}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Tipo do DF-e</h3>
                <p className="font-medium">NF-e</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Status da conta</h3>
                <p className="font-medium">Aguardando pagamento</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-600 mb-2">Integração ERP</h3>
                <p className="font-medium">Não</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-gray-600 mb-2">Chave de acesso NF-e</h3>
              <p className="font-medium">43984939489384983483</p>
            </div>

            <div>
              <h3 className="text-sm text-gray-600 mb-2">IUD da Duplicata</h3>
              <p className="font-medium">{bill.iud}</p>
            </div>
          </div>
        )}
      </div>

      <Dialog
        isOpen={showConfirmDialog}
        title="Aceitar"
        onConfirm={handleConfirmAccept}
        onCancel={() => setShowConfirmDialog(false)}
      >
        <p>Deseja realmente aceitar?</p>
      </Dialog>

      <RejectDialog
        isOpen={showRejectDialog}
        onConfirm={handleConfirmReject}
        onCancel={() => setShowRejectDialog(false)}
        billData={{
          sacado: 'Nome Sacador 11.222333/0001-44',
          date: '13/12/2023 às 17:45',
          value: 5000.00,
          dueDate: '25/12/2023',
          invoiceNumber: '3124312512',
          orderNumber: '442'
        }}
      />

      <Toast
        isOpen={showSuccessToast}
        title={successToastData.title}
        message={successToastData.message}
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
}