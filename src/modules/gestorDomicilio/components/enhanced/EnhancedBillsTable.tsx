import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { SkeletonTable } from '@/components/common/SkeletonLoader';
import { UndoToast } from '@/components/common/UndoToast';
import { useUndo } from '@/hooks/useUndo';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { CheckCircle2, XCircle, Filter, RefreshCw } from 'lucide-react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';

interface EnhancedBillsTableProps {
  bills: Bill[];
  loading?: boolean;
  error?: Error | null;
  onSelectBill: (bill: Bill) => void;
  onRefresh: () => void;
}

export function EnhancedBillsTable({
  bills,
  loading = false,
  error = null,
  onSelectBill,
  onRefresh
}: EnhancedBillsTableProps) {
  const [selectedBills, setSelectedBills] = useState<Set<number>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: 'accept' | 'reject' | null;
  }>({ isOpen: false, action: null });

  const { addUndoAction, executeUndo, currentAction, clearUndo } = useUndo();

  useKeyboardShortcuts({
    onFilter: () => setFilterOpen(prev => !prev),
    onRefresh: () => onRefresh(),
    onEscape: () => {
      setFilterOpen(false);
      setConfirmModal({ isOpen: false, action: null });
    }
  });

  const handleBatchAction = async (action: 'accept' | 'reject') => {
    const selectedBillsArray = bills.filter(b => selectedBills.has(b.id));
    const previousStates = selectedBillsArray.map(b => ({
      id: b.id,
      manifestation: b.manifestation
    }));

    const actionText = action === 'accept' ? 'aceitas' : 'recusadas';

    addUndoAction(
      `${selectedBills.size} duplicata${selectedBills.size > 1 ? 's' : ''} ${actionText}`,
      async () => {
        console.log('Desfazendo ação...', previousStates);
      }
    );

    setSelectedBills(new Set());
    setConfirmModal({ isOpen: false, action: null });
  };

  if (error) {
    return (
      <ErrorMessage
        type="network"
        title="Erro ao carregar duplicatas"
        message="Não foi possível conectar ao servidor. Verifique sua conexão com a internet."
        suggestion="Tente novamente em alguns instantes ou entre em contato com o suporte se o problema persistir."
        errorCode="ERR_NETWORK_001"
        onRetry={onRefresh}
        onContactSupport={() => console.log('Contatar suporte')}
      />
    );
  }

  if (loading) {
    return <SkeletonTable rows={10} columns={8} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<CheckCircle2 className="w-4 h-4" />}
            onClick={() => setConfirmModal({ isOpen: true, action: 'accept' })}
            disabled={selectedBills.size === 0}
          >
            Aceitar Selecionadas ({selectedBills.size})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<XCircle className="w-4 h-4" />}
            onClick={() => setConfirmModal({ isOpen: true, action: 'reject' })}
            disabled={selectedBills.size === 0}
          >
            Recusar Selecionadas ({selectedBills.size})
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filtros
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={onRefresh}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 animate-fade-in">
          <p className="text-sm text-gray-600">
            Filtros avançados apareceriam aqui...
          </p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBills(new Set(bills.map(b => b.id)));
                      } else {
                        setSelectedBills(new Set());
                      }
                    }}
                    checked={selectedBills.size === bills.length && bills.length > 0}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IUD</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sacador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr
                  key={bill.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectBill(bill)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedBills.has(bill.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedBills);
                        if (e.target.checked) {
                          newSelected.add(bill.id);
                        } else {
                          newSelected.delete(bill.id);
                        }
                        setSelectedBills(newSelected);
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-blue-600">{bill.iud}</td>
                  <td className="px-4 py-3 text-sm">{bill.sacador.name}</td>
                  <td className="px-4 py-3 text-sm">R$ {bill.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm">{bill.dueDate}</td>
                  <td className="px-4 py-3 text-sm">{bill.manifestation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, action: null })}
        onConfirm={() => confirmModal.action && handleBatchAction(confirmModal.action)}
        title={confirmModal.action === 'accept' ? 'Aceitar Duplicatas' : 'Recusar Duplicatas'}
        message={`Confirmar ${confirmModal.action === 'accept' ? 'aceite' : 'recusa'} de ${selectedBills.size} duplicata${selectedBills.size > 1 ? 's' : ''}?`}
        confirmLabel="Confirmar"
        variant={confirmModal.action === 'reject' ? 'danger' : 'primary'}
      />

      {currentAction && (
        <UndoToast
          message={currentAction.description}
          onUndo={() => executeUndo(currentAction.id)}
          onClose={clearUndo}
        />
      )}
    </div>
  );
}
