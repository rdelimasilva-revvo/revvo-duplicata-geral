import React, { useState, useMemo } from 'react';
import {
  CreditCard, FileText, Search, ArrowUpDown, ChevronDown,
  Link2, Unlink, Filter, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { Credit, Invoice, CREDIT_TYPE_LABELS } from '../../abatimento/types';
import { invoices as allInvoices } from '../../abatimento/mockData';
import { formatCurrency, formatDate } from '../../utils';

interface LinkedItem {
  invoiceId: string;
  creditId: string;
  nfNumber: string;
  openBalance: number;
  offsetAmount: number;
}

interface LinkageViewProps {
  selectedCredits: Credit[];
  linkedItems: LinkedItem[];
  onLinkInvoice: (invoice: Invoice, credit: Credit) => void;
  onUnlinkInvoice: (invoiceId: string) => void;
  requiresApproval: boolean;
  onToggleApproval: () => void;
  onAdvance: () => void;
  onBack: () => void;
}

export function LinkageView({
  selectedCredits, linkedItems, onLinkInvoice, onUnlinkInvoice,
  requiresApproval, onToggleApproval, onAdvance, onBack,
}: LinkageViewProps) {
  const [search, setSearch] = useState('');
  const [activeCreditId, setActiveCreditId] = useState<string | null>(
    selectedCredits.length > 0 ? selectedCredits[0].id : null
  );

  const activeCredit = selectedCredits.find((c) => c.id === activeCreditId);

  const availableInvoices = useMemo(() => {
    if (!activeCredit) return [];
    let result = allInvoices.filter(
      (inv) =>
        inv.contraparte === activeCredit.contraparte &&
        inv.company === activeCredit.company &&
        inv.openBalance > 0
    );
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) => inv.nfNumber.toLowerCase().includes(q) || inv.supplierName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeCredit, search]);

  const linkedForCredit = linkedItems.filter((l) => l.creditId === activeCreditId);
  const linkedInvoiceIds = new Set(linkedItems.map((l) => l.invoiceId));

  const totalCredits = selectedCredits.reduce((sum, c) => sum + c.availableValue, 0);
  const totalLinked = linkedItems.reduce((sum, l) => sum + l.offsetAmount, 0);
  const difference = totalCredits - totalLinked;

  const getCreditUsed = (creditId: string) =>
    linkedItems.filter((l) => l.creditId === creditId).reduce((sum, l) => sum + l.offsetAmount, 0);

  const getCreditRemaining = (credit: Credit) => credit.availableValue - getCreditUsed(credit.id);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 min-h-0">
        <div className="w-[320px] flex-shrink-0 border-r border-gray-200 bg-gray-50/50 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0070f2]" />
              Creditos Selecionados ({selectedCredits.length})
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Clique em um credito para vincular faturas</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {selectedCredits.map((credit) => {
              const used = getCreditUsed(credit.id);
              const remaining = credit.availableValue - used;
              const isActive = credit.id === activeCreditId;
              const pct = credit.availableValue > 0 ? (used / credit.availableValue) * 100 : 0;

              return (
                <button
                  key={credit.id}
                  onClick={() => setActiveCreditId(credit.id)}
                  className={`w-full text-left p-3 rounded-md border transition-all ${
                    isActive
                      ? 'border-[#0070f2] bg-white shadow-sm ring-1 ring-[#0070f2]/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-[#0070f2]">{credit.code}</span>
                    <span className="text-[10px] text-gray-400">{CREDIT_TYPE_LABELS[credit.type]}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mb-2">{credit.description}</p>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-gray-400">Disponivel</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(credit.availableValue)}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full rounded-full bg-[#0070f2] transition-all duration-300"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Vinculado: {formatCurrency(used)}</span>
                    <span className={`font-semibold ${remaining > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      Restante: {formatCurrency(remaining)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                Faturas em Aberto
                {activeCredit && (
                  <span className="text-[10px] font-normal text-gray-400 ml-1">
                    para {activeCredit.contraparte}
                  </span>
                )}
              </h3>
            </div>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar NF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!activeCredit ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <CreditCard className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Selecione um credito ao lado</p>
                  <p className="text-xs text-gray-400">para ver as faturas disponiveis</p>
                </div>
              </div>
            ) : availableInvoices.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <Filter className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma fatura disponivel</p>
                  <p className="text-xs text-gray-400">para este credito/contraparte</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur-sm">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">NF</th>
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Fornecedor</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Valor Bruto</th>
                    <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Saldo Aberto</th>
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vencimento</th>
                    <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-28">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {availableInvoices.map((inv) => {
                    const isLinked = linkedInvoiceIds.has(inv.id);
                    const creditRemaining = getCreditRemaining(activeCredit);
                    const canLink = !isLinked && creditRemaining > 0;

                    return (
                      <tr
                        key={inv.id}
                        className={`transition-colors ${isLinked ? 'bg-[#0070f2]/[0.03]' : 'hover:bg-gray-50/60'}`}
                      >
                        <td className="px-3 py-2.5">
                          <span className="text-sm font-mono font-medium text-gray-800">{inv.nfNumber}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-sm text-gray-600">{inv.supplierName}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm text-gray-500">{formatCurrency(inv.grossValue)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-sm font-semibold text-gray-800">{formatCurrency(inv.openBalance)}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-sm text-gray-500">{formatDate(inv.dueDate)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {isLinked ? (
                            <button
                              onClick={() => onUnlinkInvoice(inv.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                            >
                              <Unlink className="w-3 h-3" />
                              Desvincular
                            </button>
                          ) : (
                            <button
                              onClick={() => canLink && onLinkInvoice(inv, activeCredit)}
                              disabled={!canLink}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#0070f2] bg-blue-50 border border-[#0070f2]/20 rounded-md hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                              <Link2 className="w-3 h-3" />
                              Vincular
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-5 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Creditos</p>
              <p className="text-sm font-bold text-[#0070f2]">{formatCurrency(totalCredits)}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Total Vinculado</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(totalLinked)}</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Diferenca</p>
              <p className={`text-sm font-bold ${difference > 0 ? 'text-emerald-600' : difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {formatCurrency(difference)}
              </p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <button
              onClick={onToggleApproval}
              className="flex items-center gap-2 group"
            >
              {requiresApproval ? (
                <ToggleRight className="w-7 h-7 text-[#0070f2]" />
              ) : (
                <ToggleLeft className="w-7 h-7 text-gray-300 group-hover:text-gray-400" />
              )}
              <span className="text-xs text-gray-600">
                Requer aprovacao do Fornecedor?
              </span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={onAdvance}
              disabled={linkedItems.length === 0}
              className="px-5 py-2 bg-[#0070f2] text-white text-sm font-semibold rounded-md hover:bg-[#005bc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Avancar para Revisao
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
