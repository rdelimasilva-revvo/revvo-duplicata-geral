import { useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useTransactionSyncStore } from './store';
import { NFTable } from './NFTable';
import { PaymentsCreditTable } from './PaymentsCreditTable';
import { TransactionDetailModal } from './TransactionDetailModal';
import { supabase } from '@/lib/supabase';
import type { UserRole } from './types';

interface AcordosSyncPageProps {
  onBack?: () => void;
  view: UserRole;
}

export function AcordosSyncPage({ onBack, view }: AcordosSyncPageProps) {
  const loadNotasFiscais = useTransactionSyncStore((s) => s.loadNotasFiscais);
  const loadPagamentos = useTransactionSyncStore((s) => s.loadPagamentos);

  useEffect(() => {
    if (view === 'empresa') {
      loadNotasFiscais();
    } else {
      loadPagamentos();
    }
  }, [view, loadNotasFiscais, loadPagamentos]);

  useEffect(() => {
    const table = view === 'empresa' ? 'notas_fiscais' : 'pagamentos_creditos';
    const reload = view === 'empresa' ? loadNotasFiscais : loadPagamentos;

    const channel = supabase
      .channel(`sync-${view}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => { reload(); },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [view, loadNotasFiscais, loadPagamentos]);

  const handleReload = () => {
    if (view === 'empresa') {
      loadNotasFiscais();
    } else {
      loadPagamentos();
    }
  };

  const title = view === 'empresa' ? 'Gestão de Notas Fiscais' : 'Gestão de Pagamentos';
  const subtitle = view === 'empresa'
    ? 'Acompanhe e gerencie as NFs vinculadas aos acordos comerciais'
    : 'Acompanhe e gerencie os pagamentos e créditos recebidos';

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F6F7]">
      <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-lg text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent hover:border-gray-200 flex items-center justify-center transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Atualizar
            </button>
          </div>
        </div>

        {view === 'empresa' ? <NFTable /> : <PaymentsCreditTable />}
      </div>

      <TransactionDetailModal />
    </div>
  );
}
