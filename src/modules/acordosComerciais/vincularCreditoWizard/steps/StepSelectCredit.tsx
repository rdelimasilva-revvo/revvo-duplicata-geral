import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Calendar, MagnifyingGlass } from '@phosphor-icons/react';
import { useVincularCreditoWizardStore } from '../store';
import { StepCard, StepCardTitle, StepCardSubtitle } from '../styles';

const ORIGIN_LABEL: Record<string, string> = {
  acordo_comercial: 'Acordo Comercial',
  devolucao: 'Devolução',
  bonificacao: 'Bonificação',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

export function StepSelectCredit() {
  const credits = useVincularCreditoWizardStore((s) => s.credits);
  const selectedCreditId = useVincularCreditoWizardStore((s) => s.selectedCreditId);
  const selectCredit = useVincularCreditoWizardStore((s) => s.selectCredit);

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return credits;
    return credits.filter((c) =>
      `${c.code} ${c.supplierName} ${c.supplierCnpj}`.toLowerCase().includes(term),
    );
  }, [credits, search]);

  return (
    <StepCard>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div>
          <StepCardTitle>Escolha o crédito que deseja vincular</StepCardTitle>
          <StepCardSubtitle>
            {credits.length} {credits.length === 1 ? 'crédito disponível' : 'créditos disponíveis'} ·
            apenas um pode ser vinculado por vez
          </StepCardSubtitle>
        </div>
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por fornecedor, código ou CNPJ"
            className="w-full sm:w-72 text-xs pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-gray-500">
          Nenhum crédito corresponde à busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((credit) => {
            const isActive = credit.id === selectedCreditId;
            return (
              <button
                key={credit.id}
                onClick={() => selectCredit(credit.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  isActive
                    ? 'border-[#0070f2] bg-[#0070f2]/5 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                }`}
                aria-pressed={isActive}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold text-gray-500">
                        {credit.code}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${
                          credit.status === 'partial'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {credit.status === 'partial' ? 'Parcial' : 'Disponível'}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800 truncate">
                      {credit.supplierName}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">{credit.supplierCnpj}</p>
                  </div>
                  {isActive && (
                    <div className="w-5 h-5 rounded-full bg-[#0070f2] flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={12} weight="fill" className="text-white" />
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Saldo</p>
                    <p className="text-sm font-bold text-[#0070f2] tabular-nums">
                      {formatCurrency(credit.remainingValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">Origem</p>
                    <p className="text-[11px] font-medium text-gray-700 truncate">
                      {ORIGIN_LABEL[credit.origin] || credit.origin}
                    </p>
                  </div>
                </div>
                {credit.expiresAt && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                    <Calendar size={10} />
                    Expira em {format(parseISO(credit.expiresAt), 'dd/MM/yyyy')}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </StepCard>
  );
}
