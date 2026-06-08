import { X, FileText, Building2, Hash, Calendar, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactionSyncStore } from './store';
import { StatusBadge } from './StatusBadge';
import { MovementHistoryTimeline } from './MovementHistoryTimeline';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy', { locale: ptBR });
  } catch {
    return dateStr;
  }
};

export function TransactionDetailModal() {
  const transactionId = useTransactionSyncStore((s) => s.selectedTransactionId);
  const setSelectedTransaction = useTransactionSyncStore((s) => s.setSelectedTransaction);
  const role = useTransactionSyncStore((s) => s.role);
  const notasFiscais = useTransactionSyncStore((s) => s.notasFiscais);
  const pagamentos = useTransactionSyncStore((s) => s.pagamentos);

  if (!transactionId) return null;

  const nf = notasFiscais.find((n) => n.transactionId === transactionId);
  const pg = pagamentos.find((p) => p.transactionId === transactionId);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={() => setSelectedTransaction(null)}
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Fechar"
      />
      <div className="relative w-full max-w-[640px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <header className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Detalhe da Transação</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{transactionId}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedTransaction(null)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {nf && (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Nota Fiscal {role === 'empresa' ? '(Sua Visão)' : '(Visão Empresa)'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={<Hash className="w-3.5 h-3.5" />} label="Número NF" value={nf.numeroNf} />
                <DetailItem icon={<Building2 className="w-3.5 h-3.5" />} label="Fornecedor" value={nf.fornecedorNome} />
                <DetailItem icon={<DollarSign className="w-3.5 h-3.5" />} label="Valor" value={formatCurrency(nf.valor)} />
                <DetailItem icon={<Calendar className="w-3.5 h-3.5" />} label="Emissão" value={formatDate(nf.dataEmissao)} />
                <DetailItem icon={<Calendar className="w-3.5 h-3.5" />} label="Vencimento" value={formatDate(nf.dataVencimento)} />
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-500">Status:</span>
                  <StatusBadge value={nf.status} variant="nf" />
                </div>
              </div>
            </section>
          )}

          {pg && (
            <section>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Pagamento/Crédito {role === 'fornecedor' ? '(Sua Visão)' : '(Visão Fornecedor)'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <DetailItem icon={<Building2 className="w-3.5 h-3.5" />} label="Empresa" value={pg.empresaNome || 'N/D'} />
                <DetailItem icon={<Hash className="w-3.5 h-3.5" />} label="Ref. NF" value={pg.referenciaNf} />
                <DetailItem icon={<DollarSign className="w-3.5 h-3.5" />} label="Valor" value={formatCurrency(pg.valor)} />
                <DetailItem icon={<Calendar className="w-3.5 h-3.5" />} label="Data Operação" value={formatDate(pg.dataOperacao)} />
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-500">Tipo:</span>
                  <StatusBadge value={pg.tipo} variant="tipo" />
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[11px] text-gray-500">Status:</span>
                  <StatusBadge value={pg.status} variant="pagamento" />
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Histórico de Movimentações
            </h3>
            <MovementHistoryTimeline transactionId={transactionId} />
          </section>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}
