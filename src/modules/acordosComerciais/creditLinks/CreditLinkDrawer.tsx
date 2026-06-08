import { useMemo, useState } from 'react';
import {
  Ticket,
  X,
  CheckCircle,
  MagnifyingGlass,
  CurrencyCircleDollar,
} from '@phosphor-icons/react';
import { useCreditLinksStore, type AvailableCredit } from './store';

interface CreditLinkDrawerProps {
  proposalCode: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    remainingBalance: number;
  };
  onClose: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function CreditLinkDrawer({ proposalCode, invoice, onClose }: CreditLinkDrawerProps) {
  const credits = useCreditLinksStore((s) => s.credits);
  const addLink = useCreditLinksStore((s) => s.addLink);
  const creditUsageById = useCreditLinksStore((s) => s.getCreditUsage(proposalCode));

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AvailableCredit | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return credits;
    return credits.filter(
      (c) => c.label.toLowerCase().includes(q) || c.origin.toLowerCase().includes(q),
    );
  }, [credits, search]);

  const selectedRemaining = selected
    ? Math.max(selected.balance - (creditUsageById.get(selected.id) ?? 0), 0)
    : 0;
  const amountNumber = Number((amount || '').replace(',', '.'));
  const validAmount =
    !Number.isNaN(amountNumber) &&
    amountNumber > 0 &&
    amountNumber <= selectedRemaining &&
    amountNumber <= invoice.remainingBalance;

  async function handleConfirm() {
    if (!selected || !validAmount) return;
    setSubmitting(true);
    await addLink(proposalCode, invoice.id, selected, amountNumber);
    setSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[520px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-[modalIn_.2s_ease-out]">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#E6F0FF] text-[#007BFF] flex items-center justify-center">
                <Ticket size={18} weight="duotone" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Vincular Crédito</h3>
            </div>
            <p className="text-xs text-gray-500">
              Abatendo{' '}
              <span className="font-semibold text-gray-900">{invoice.invoiceNumber}</span> · saldo{' '}
              <span className="font-semibold tabular-nums text-gray-900">
                {formatCurrency(invoice.remainingBalance)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar crédito por identificador ou origem"
              className="w-full h-10 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007BFF]/20 focus:border-[#007BFF]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
            Créditos Disponíveis
          </p>
          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">Nenhum crédito encontrado.</div>
          )}
          {filtered.map((c) => {
            const used = creditUsageById.get(c.id) ?? 0;
            const remaining = Math.max(c.balance - used, 0);
            const isSelected = selected?.id === c.id;
            const disabled = remaining <= 0;
            return (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  setSelected(c);
                  setAmount(Math.min(remaining, invoice.remainingBalance).toString());
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#007BFF] bg-[#E6F0FF]/40 shadow-[0_0_0_3px_rgba(0,123,255,0.1)]'
                    : disabled
                      ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-[#007BFF]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#007BFF] text-white' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <CurrencyCircleDollar size={16} weight="fill" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{c.label}</div>
                      <div className="text-[11px] text-gray-500 truncate">{c.origin}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Emitido em {formatDate(c.issuedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(remaining)}
                    </div>
                    {used > 0 && (
                      <div className="text-[10px] text-gray-400 tabular-nums">
                        saldo de {formatCurrency(c.balance)}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/60">
          <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Valor de abatimento
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ''))}
                disabled={!selected}
                placeholder="0,00"
                className="w-full h-11 pl-9 pr-3 text-sm font-semibold tabular-nums bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007BFF]/20 focus:border-[#007BFF] disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!validAmount || submitting}
              className="h-11 px-5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#007BFF] hover:bg-[#0066E0] rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <CheckCircle size={16} weight="fill" />
              Aplicar
            </button>
          </div>
          {selected && (
            <p className="mt-2 text-[11px] text-gray-500">
              Disponível no crédito:{' '}
              <span className="font-semibold text-gray-700 tabular-nums">
                {formatCurrency(selectedRemaining)}
              </span>{' '}
              · Saldo da NF:{' '}
              <span className="font-semibold text-gray-700 tabular-nums">
                {formatCurrency(invoice.remainingBalance)}
              </span>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { transform: scale(0.96); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
