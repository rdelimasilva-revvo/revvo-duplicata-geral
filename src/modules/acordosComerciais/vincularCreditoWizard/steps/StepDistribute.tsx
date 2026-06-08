import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Sparkle,
  ArrowsClockwise,
  Warning,
  CheckCircle,
  Clock,
  Lock,
  Info,
  Wallet,
} from '@phosphor-icons/react';
import { useVincularCreditoWizardStore, selectComputed } from '../store';
import { StepCard, StepCardTitle, StepCardSubtitle, WizardButton } from '../styles';
import { EligibleInvoice } from '../types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

const STATUS_CFG: Record<
  EligibleInvoice['status'],
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  livre: {
    label: 'Livre',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle size={10} weight="fill" />,
  },
  pendente: {
    label: 'Pendente',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Clock size={10} weight="fill" />,
  },
  em_disputa: {
    label: 'Em Disputa',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <Warning size={10} weight="fill" />,
  },
  bloqueada: {
    label: 'Bloqueada',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    icon: <Lock size={10} weight="fill" />,
  },
};

export function StepDistribute() {
  const allocations = useVincularCreditoWizardStore((s) => s.allocations);
  const selectedInvoiceIds = useVincularCreditoWizardStore((s) => s.selectedInvoiceIds);
  const acceptResidual = useVincularCreditoWizardStore((s) => s.acceptResidual);
  const toggleInvoice = useVincularCreditoWizardStore((s) => s.toggleInvoice);
  const setAllocation = useVincularCreditoWizardStore((s) => s.setAllocation);
  const setAcceptResidual = useVincularCreditoWizardStore((s) => s.setAcceptResidual);
  const autoDistribute = useVincularCreditoWizardStore((s) => s.autoDistribute);
  const clearDistribution = useVincularCreditoWizardStore((s) => s.clearDistribution);

  const computed = useVincularCreditoWizardStore(selectComputed);
  const {
    credit,
    invoicesForSupplier,
    totalAllocated,
    creditValue,
    remaining,
    overspent,
    balanced,
    insufficientInvoices,
    residual,
    hasResidual,
  } = computed;

  if (!credit) {
    return (
      <StepCard>
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <Warning size={16} />
          Volte à etapa anterior e selecione um crédito antes de distribuir.
        </div>
      </StepCard>
    );
  }

  const handleAllocationChange = (invoice: EligibleInvoice, raw: string) => {
    const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
    const value = Number(cleaned);
    const clamped = Math.max(0, Math.min(invoice.openBalance, isFinite(value) ? value : 0));
    setAllocation(invoice.id, clamped);
  };

  const pct = creditValue > 0 ? Math.min(100, (totalAllocated / creditValue) * 100) : 0;

  return (
    <>
      <StepCard>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <StepCardTitle>Distribua o crédito entre as NFs de {credit.supplierName}</StepCardTitle>
            <StepCardSubtitle>
              Crédito {credit.code} — saldo de {formatCurrency(credit.remainingValue)} para distribuir
            </StepCardSubtitle>
          </div>
          <div className="flex items-center gap-2">
            <WizardButton type="button" $variant="ghost" onClick={clearDistribution}>
              <ArrowsClockwise size={14} />
              Limpar
            </WizardButton>
            <WizardButton type="button" $variant="primary" onClick={autoDistribute}>
              <Sparkle size={14} weight="fill" />
              Distribuir automaticamente
            </WizardButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <SummaryTile
            label="Crédito"
            value={formatCurrency(creditValue)}
            tone="neutral"
          />
          <SummaryTile
            label="Distribuído"
            value={formatCurrency(totalAllocated)}
            tone="blue"
          />
          <SummaryTile
            label={
              overspent
                ? 'Excedeu em'
                : balanced
                  ? 'Conta fecha'
                  : acceptResidual && hasResidual
                    ? 'Saldo preservado'
                    : 'Falta distribuir'
            }
            value={formatCurrency(Math.abs(remaining))}
            tone={
              overspent
                ? 'danger'
                : balanced
                  ? 'success'
                  : acceptResidual && hasResidual
                    ? 'blue'
                    : 'warning'
            }
          />
        </div>

        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all ${
              overspent ? 'bg-rose-500' : balanced ? 'bg-emerald-500' : 'bg-[#0070f2]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="w-10 px-4 py-2.5"></th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  NF
                </th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Saldo em Aberto
                </th>
                <th className="text-left px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Valor a Abater
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoicesForSupplier.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-gray-500">
                    Nenhuma NF elegível para este fornecedor.
                  </td>
                </tr>
              )}
              {invoicesForSupplier.map((invoice) => {
                const isSelected = !!selectedInvoiceIds[invoice.id];
                const isBlocked = invoice.status === 'bloqueada';
                const cfg = STATUS_CFG[invoice.status];
                const value = allocations[invoice.id] || 0;
                return (
                  <tr
                    key={invoice.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-[#0070f2]/5' : 'hover:bg-gray-50/50'
                    } ${isBlocked ? 'opacity-60' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isBlocked}
                        onChange={() => toggleInvoice(invoice.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0070f2] focus:ring-2 focus:ring-[#0070f2]/20 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-mono font-medium text-gray-800">
                        {invoice.number}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-gray-600 tabular-nums">
                        {invoice.dueDate
                          ? format(parseISO(invoice.dueDate), 'dd/MM/yyyy', { locale: ptBR })
                          : '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="text-xs font-semibold text-gray-800 tabular-nums">
                        {formatCurrency(invoice.openBalance)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                      >
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <input
                        type="text"
                        inputMode="decimal"
                        disabled={!isSelected}
                        value={isSelected && value > 0 ? value.toString() : ''}
                        placeholder={isSelected ? '0,00' : '—'}
                        onChange={(e) => handleAllocationChange(invoice, e.target.value)}
                        className={`w-32 px-2 py-1.5 text-xs text-right font-semibold border rounded-md tabular-nums transition-colors ${
                          isSelected
                            ? 'border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]'
                            : 'border-transparent bg-gray-50 text-gray-300 cursor-not-allowed'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {overspent && (
          <div className="mt-3 flex items-center gap-2 text-[11px] bg-rose-50 border border-rose-200 text-rose-800 rounded-md px-3 py-2">
            <Warning size={14} weight="fill" />
            <span>
              O valor distribuído excedeu o crédito em{' '}
              <strong>{formatCurrency(Math.abs(remaining))}</strong>. Reduza os valores antes de
              continuar.
            </span>
          </div>
        )}

        {!balanced && !overspent && hasResidual && totalAllocated > 0 && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-2">
            <div className="flex items-start gap-2">
              <Wallet size={16} className="text-amber-600 mt-0.5" weight="fill" />
              <div className="text-[12px] text-amber-900 flex-1">
                <p className="font-semibold">
                  A conta não fecha — sobram {formatCurrency(residual)} sem destino
                </p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {insufficientInvoices
                    ? 'Não há saldo suficiente nas NFs elegíveis deste fornecedor para consumir todo o crédito.'
                    : 'Você ainda pode marcar mais NFs ou ajustar valores. Caso prefira, mantenha o saldo restante para uma vinculação futura.'}
                </p>
              </div>
            </div>
            <label className="flex items-start gap-2 cursor-pointer rounded-md border border-amber-300 bg-white px-3 py-2 hover:bg-amber-50/40 transition-colors">
              <input
                type="checkbox"
                checked={acceptResidual}
                onChange={(e) => setAcceptResidual(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-2 focus:ring-amber-300"
              />
              <span className="text-[12px] text-amber-900">
                <span className="font-semibold">Manter saldo restante para uso futuro</span>
                <span className="block text-[11px] text-amber-800 mt-0.5">
                  Os {formatCurrency(residual)} permanecem disponíveis no crédito{' '}
                  <span className="font-mono">{credit.code}</span> e poderão ser usados em uma nova
                  vinculação a qualquer momento.
                </span>
              </span>
            </label>
          </div>
        )}

        {balanced && (
          <div className="mt-3 flex items-center gap-2 text-[11px] bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md px-3 py-2">
            <CheckCircle size={14} weight="fill" />
            <span>A conta fecha sem diferença — pronto para revisar.</span>
          </div>
        )}

        {!balanced && !overspent && totalAllocated === 0 && (
          <div className="mt-3 flex items-center gap-2 text-[11px] bg-blue-50 border border-blue-200 text-blue-800 rounded-md px-3 py-2">
            <Info size={14} />
            <span>Marque as NFs e informe os valores para distribuir o crédito.</span>
          </div>
        )}
      </StepCard>
    </>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'neutral' | 'blue' | 'success' | 'warning' | 'danger';
}) {
  const palette: Record<typeof tone, string> = {
    neutral: 'text-gray-800 bg-gray-50 border-gray-200',
    blue: 'text-[#0070f2] bg-[#0070f2]/5 border-[#0070f2]/20',
    success: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-600 bg-amber-50 border-amber-200',
    danger: 'text-rose-600 bg-rose-50 border-rose-200',
  };
  return (
    <div className={`px-3 py-2.5 rounded-lg border ${palette[tone]}`}>
      <p className="text-[9px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className="text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}
