import { useEffect } from 'react';
import { Clock, ArrowRight, User, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactionSyncStore } from './store';

const STATUS_LABELS: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  creditado: 'Creditado',
  liquidado: 'Liquidado',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
};

interface MovementHistoryTimelineProps {
  transactionId: string;
}

export function MovementHistoryTimeline({ transactionId }: MovementHistoryTimelineProps) {
  const historico = useTransactionSyncStore((s) => s.historico);
  const loadHistorico = useTransactionSyncStore((s) => s.loadHistorico);

  useEffect(() => {
    loadHistorico(transactionId);
  }, [transactionId, loadHistorico]);

  if (historico.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Nenhuma movimentação registrada</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-3 bottom-3 w-px bg-gray-200" />
      <ul className="space-y-4">
        {historico.map((item) => (
          <li key={item.id} className="relative pl-10">
            <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#0070f2]" />
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="font-semibold text-gray-800">{item.usuarioNome}</span>
                  <span className="text-gray-400">·</span>
                  <FileText className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">
                    {item.tabelaOrigem === 'notas_fiscais' ? 'NF' : 'Pagamento'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 tabular-nums">
                  {format(parseISO(item.createdAt), "dd MMM yyyy · HH:mm", { locale: ptBR })}
                </span>
              </div>
              {item.valorAnterior && item.valorNovo && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
                    {STATUS_LABELS[item.valorAnterior] ?? item.valorAnterior}
                  </span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                    {STATUS_LABELS[item.valorNovo] ?? item.valorNovo}
                  </span>
                </div>
              )}
              {item.motivo && (
                <p className="mt-2 text-[11px] text-gray-600 italic">
                  &ldquo;{item.motivo}&rdquo;
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
