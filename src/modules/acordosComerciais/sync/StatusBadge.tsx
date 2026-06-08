import { CheckCircle2, Clock, CreditCard, Ban, XCircle } from 'lucide-react';
import type { NFStatus, PagamentoStatus, PagamentoTipo } from './types';

const NF_STATUS_CONFIG: Record<NFStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pendente: { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock className="w-3 h-3" /> },
  pago: { label: 'Pago', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  creditado: { label: 'Creditado', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <CreditCard className="w-3 h-3" /> },
  liquidado: { label: 'Liquidado', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', icon: <CheckCircle2 className="w-3 h-3" /> },
};

const PAG_STATUS_CONFIG: Record<PagamentoStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pendente: { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: <Clock className="w-3 h-3" /> },
  confirmado: { label: 'Confirmado', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: <XCircle className="w-3 h-3" /> },
};

const TIPO_CONFIG: Record<PagamentoTipo, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pagamento: { label: 'Pagamento', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 className="w-3 h-3" /> },
  credito: { label: 'Crédito', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: <CreditCard className="w-3 h-3" /> },
  liquidacao: { label: 'Liquidação', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', icon: <Ban className="w-3 h-3" /> },
};

interface StatusBadgeProps {
  value: string;
  variant: 'nf' | 'pagamento' | 'tipo';
}

export function StatusBadge({ value, variant }: StatusBadgeProps) {
  let cfg: { label: string; color: string; bg: string; border: string; icon: React.ReactNode };

  if (variant === 'nf') {
    cfg = NF_STATUS_CONFIG[value as NFStatus] ?? NF_STATUS_CONFIG.pendente;
  } else if (variant === 'pagamento') {
    cfg = PAG_STATUS_CONFIG[value as PagamentoStatus] ?? PAG_STATUS_CONFIG.pendente;
  } else {
    cfg = TIPO_CONFIG[value as PagamentoTipo] ?? TIPO_CONFIG.pagamento;
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}
