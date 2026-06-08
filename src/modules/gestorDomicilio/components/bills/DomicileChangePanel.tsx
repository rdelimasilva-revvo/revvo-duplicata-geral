import { X, Building2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';
import { Toast } from '@/modules/gestorDomicilio/components/ui/Toast';
import { LoadingSpinner } from '@/modules/gestorDomicilio/components/ui/LoadingSpinner';
import { formatCurrency } from '@/modules/gestorDomicilio/utils/format';
import { useError } from '@/modules/gestorDomicilio/contexts/ErrorContext';
import { useKeyboardShortcuts } from '@/modules/gestorDomicilio/hooks/useKeyboardShortcuts';

interface DomicileChangePanelProps {
  bill: Bill;
  onClose: () => void;
}

export function DomicileChangePanel({ bill, onClose }: DomicileChangePanelProps) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { showError } = useError();

  useKeyboardShortcuts(
    [
      {
        key: 'Escape',
        callback: onClose,
        description: 'Fechar painel'
      }
    ],
    true
  );

  const handleApprove = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('approved');
      setShowSuccessToast(true);
    } catch (error) {
      showError({
        title: 'Erro ao aprovar alteração',
        message: 'Não foi possível processar a aprovação do domicílio.',
        suggestion: 'Verifique sua conexão e tente novamente.',
        code: 'DOMICILE_001',
        canRetry: true,
        onRetry: handleApprove
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStatus('rejected');
      setShowSuccessToast(true);
    } catch (error) {
      showError({
        title: 'Erro ao rejeitar alteração',
        message: 'Não foi possível processar a rejeição do domicílio.',
        suggestion: 'Tente novamente.',
        code: 'DOMICILE_002',
        canRetry: true,
        onRetry: handleReject
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {bill.requiredAction === 'Alteração de Domicílio de Pgto'
                ? 'Alterações de Domicílio Bancário'
                : 'Detalhes da Alteração'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {bill.requiredAction === 'Alteração de Domicílio'
                ? 'Comparativo entre credores originais e novos credores'
                : 'Informações completas sobre a solicitação de alteração'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{bill.iud}</p>
              <p className="text-sm text-gray-600 mt-1">{bill.sacador.name}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(bill.amount)}</p>
              <p className="text-sm text-gray-600 mt-1">Negociada em {bill.issueDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="border border-gray-200 rounded-lg p-6 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Credor Original</h3>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase mb-1">Empresa</p>
                <p className="text-base font-semibold text-gray-900">{bill.sacador.name}</p>
                <p className="text-sm text-gray-600">CNPJ: {bill.sacador.cnpj}</p>
              </div>

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 uppercase mb-2">Dados bancários</p>
                <p className="text-base font-semibold text-gray-900">{bill.paymentInstrument.type}</p>
                <p className="text-sm text-gray-600">{bill.paymentInstrument.details}</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Novo Credor</h3>
            </div>

            {bill.newReceiver && bill.newLiquidationAccount ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-blue-600 uppercase mb-1">Empresa</p>
                  <p className="text-base font-semibold text-blue-900">{bill.newReceiver.name}</p>
                  <p className="text-sm text-blue-700">CNPJ: {bill.newReceiver.cnpj}</p>
                </div>

                <div className="border-t border-blue-200 pt-4">
                  <p className="text-xs text-blue-600 uppercase mb-2">Dados bancários</p>
                  <p className="text-base font-semibold text-blue-900">{bill.newLiquidationAccount.instrument}</p>
                  <p className="text-sm text-blue-700">{bill.newLiquidationAccount.details}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma alteração solicitada</p>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-4 mb-6">
            <LoadingSpinner size="md" text="Processando..." />
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-gray-500">Status:</span>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                  status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {status === 'approved' ? 'Aprovada' : status === 'rejected' ? 'Rejeitada' : 'Ativa'}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Pagamento:</span>
              <span className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                Pendente
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500">Vencimento:</span>
              <span className="ml-2 text-sm font-medium text-gray-900">{bill.dueDate}</span>
            </div>
          </div>

          {status === 'pending' && !isLoading && (
            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleReject}>
                Rejeitar
              </Button>
              <Button variant="primary" onClick={handleApprove}>
                Aprovar Alteração
              </Button>
            </div>
          )}

          {status === 'approved' && (
            <div className="flex items-center gap-2 text-green-600">
              <ArrowRight className="w-5 h-5" />
              <span className="font-medium">Alteração aprovada com sucesso</span>
            </div>
          )}

          {status === 'rejected' && (
            <div className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              <span className="font-medium">Alteração rejeitada</span>
            </div>
          )}
        </div>

        {bill.requiredAction === 'Alteração de Domicílio de Pgto' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Sobre Alteração de Domicílio</p>
                <p className="text-blue-700">
                  A alteração de domicílio bancário transfere o direito de recebimento da duplicata para um novo credor.
                  Após aprovação, todos os pagamentos devem ser realizados na nova conta indicada.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Toast
        isOpen={showSuccessToast}
        title={status === 'approved' ? 'Alteração Aprovada' : 'Alteração Rejeitada'}
        message={
          status === 'approved'
            ? 'A alteração de domicílio foi aprovada com sucesso.'
            : 'A alteração de domicílio foi rejeitada.'
        }
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  );
}
