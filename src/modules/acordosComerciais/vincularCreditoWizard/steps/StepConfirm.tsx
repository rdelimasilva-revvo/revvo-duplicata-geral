import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Building2, Receipt, NotepadText, Wallet } from 'lucide-react';
import { useVincularCreditoWizardStore, selectComputed } from '../store';
import { StepCard, StepCardTitle, StepCardSubtitle } from '../styles';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

const ORIGIN_LABEL: Record<string, string> = {
  acordo_comercial: 'Acordo Comercial',
  devolucao: 'Devolução',
  bonificacao: 'Bonificação',
};

export function StepConfirm() {
  const allocations = useVincularCreditoWizardStore((s) => s.allocations);
  const notes = useVincularCreditoWizardStore((s) => s.notes);
  const setNotes = useVincularCreditoWizardStore((s) => s.setNotes);
  const submissionError = useVincularCreditoWizardStore((s) => s.submissionError);
  const computed = useVincularCreditoWizardStore(selectComputed);
  const { credit, selectedInvoices, totalAllocated, residual, hasResidual, balanced } = computed;

  if (!credit) {
    return (
      <StepCard>
        <p className="text-sm text-gray-500">Nada para confirmar.</p>
      </StepCard>
    );
  }

  return (
    <>
      <StepCard>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
            <Building2 size={16} className="text-[#0070f2]" />
          </div>
          <div>
            <StepCardTitle>Resumo da vinculação</StepCardTitle>
            <StepCardSubtitle>Revise os dados antes de gravar a operação</StepCardSubtitle>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow label="Fornecedor" value={credit.supplierName} subtext={credit.supplierCnpj} />
          <InfoRow
            label="Crédito"
            value={credit.code}
            subtext={`${ORIGIN_LABEL[credit.origin] || credit.origin} · ${formatCurrency(
              credit.remainingValue,
            )} disponível`}
          />
          <InfoRow
            label="NFs vinculadas"
            value={`${selectedInvoices.length}`}
            subtext={`${formatCurrency(totalAllocated)} distribuídos`}
          />
          <InfoRow
            label="Validade"
            value={
              credit.expiresAt
                ? format(parseISO(credit.expiresAt), 'dd/MM/yyyy', { locale: ptBR })
                : 'Sem validade'
            }
            subtext={credit.status === 'partial' ? 'Crédito parcial' : 'Crédito disponível'}
          />
        </div>
      </StepCard>

      <StepCard>
        <div className="flex items-center gap-2 mb-3">
          <Receipt size={18} className="text-[#0070f2]" />
          <StepCardTitle>Notas fiscais que receberão o abatimento</StepCardTitle>
        </div>
        <div className="overflow-x-auto border border-gray-100 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  NF
                </th>
                <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Saldo aberto
                </th>
                <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Abatimento
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {selectedInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/40">
                  <td className="px-3 py-2.5">
                    <span className="text-xs font-mono font-medium text-gray-800">
                      {inv.number}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-xs text-gray-600 tabular-nums">
                      {inv.dueDate
                        ? format(parseISO(inv.dueDate), 'dd/MM/yyyy', { locale: ptBR })
                        : '—'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs text-gray-600 tabular-nums">
                      {formatCurrency(inv.openBalance)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="text-xs font-bold text-[#0070f2] tabular-nums">
                      {formatCurrency(allocations[inv.id] || 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#0070f2]/20 bg-[#0070f2]/5">
                <td colSpan={3} className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-700">
                  Total distribuído
                </td>
                <td className="px-3 py-2.5 text-right text-sm font-bold text-[#0070f2] tabular-nums">
                  {formatCurrency(totalAllocated)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </StepCard>

      <StepCard>
        <div className="flex items-center gap-2 mb-3">
          <NotepadText size={18} className="text-[#0070f2]" />
          <StepCardTitle>Observações (opcional)</StepCardTitle>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Anote qualquer informação relevante para auditoria desta vinculação..."
          className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] resize-y"
        />
        <p className="text-[10px] text-gray-400 mt-1">{notes.length}/500</p>
      </StepCard>

      {balanced ? (
        <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-emerald-800">
            <p className="font-semibold">A conta fecha sem diferença.</p>
            <p className="opacity-80 mt-0.5">
              Ao confirmar, a vinculação será gravada e o saldo do crédito será reduzido em{' '}
              {formatCurrency(totalAllocated)}.
            </p>
          </div>
        </div>
      ) : (
        hasResidual && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Wallet size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-amber-900 flex-1">
              <p className="font-semibold">
                Saldo restante de {formatCurrency(residual)} será preservado.
              </p>
              <p className="opacity-90 mt-0.5">
                Ao confirmar, {formatCurrency(totalAllocated)} serão consumidos do crédito{' '}
                <span className="font-mono font-semibold">{credit.code}</span> e os{' '}
                <span className="font-semibold">{formatCurrency(residual)}</span> restantes
                continuarão disponíveis para uma vinculação futura.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <ResidualPill label="Crédito original" value={formatCurrency(credit.remainingValue)} />
                <ResidualPill label="A consumir agora" value={formatCurrency(totalAllocated)} highlight />
                <ResidualPill label="Saldo preservado" value={formatCurrency(residual)} success />
              </div>
            </div>
          </div>
        )
      )}

      {submissionError && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {submissionError}
        </div>
      )}
    </>
  );
}

function ResidualPill({
  label,
  value,
  highlight,
  success,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  success?: boolean;
}) {
  const tone = success
    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
    : highlight
      ? 'bg-[#0070f2]/5 border-[#0070f2]/20 text-[#0070f2]'
      : 'bg-white border-amber-200 text-gray-700';
  return (
    <div className={`px-2 py-1.5 rounded-md border ${tone}`}>
      <p className="text-[9px] uppercase tracking-wider font-semibold opacity-80">{label}</p>
      <p className="text-xs font-bold tabular-nums mt-0.5">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, subtext }: { label: string; value: string; subtext?: string }) {
  return (
    <div className="px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/40">
      <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{value}</p>
      {subtext && <p className="text-[10px] text-gray-500 truncate">{subtext}</p>}
    </div>
  );
}
