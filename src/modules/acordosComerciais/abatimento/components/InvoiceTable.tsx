import React, { useMemo, useState } from 'react';
import {
  Clock, CheckCircle2, AlertTriangle, Lock, Plus, ArrowUpDown,
  Search, FileText, Loader2, RefreshCw, SplitSquareHorizontal,
  CreditCard, Building2, ShieldAlert,
} from 'lucide-react';
import { useAbatimentoStore } from '../store';
import { Invoice, OFFSET_STATUS_CONFIG, DISPUTE_STATUS_CONFIG, CLASSIFICATION_CONFIG } from '../types';
import { formatCurrency, formatDate } from '../../utils';

const DISPUTE_ICONS = {
  acordo_pendente: Clock,
  credito_aplicado: CheckCircle2,
  em_disputa: AlertTriangle,
  bloqueada: Lock,
};

function DisputeIcon({ status }: { status: Invoice['disputeStatus'] }) {
  if (!status) return null;
  const Icon = DISPUTE_ICONS[status];
  const config = DISPUTE_STATUS_CONFIG[status];
  return (
    <div className="group/tip relative inline-flex">
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none z-10">
        {config.label}
      </div>
    </div>
  );
}

function DisputeBadge({ status }: { status: Invoice['disputeStatus'] }) {
  if (!status) return null;
  const config = DISPUTE_STATUS_CONFIG[status];
  const Icon = DISPUTE_ICONS[status];
  const bgMap = {
    acordo_pendente: 'bg-amber-50 border-amber-200',
    credito_aplicado: 'bg-emerald-50 border-emerald-200',
    em_disputa: 'bg-red-50 border-red-200',
    bloqueada: 'bg-gray-100 border-gray-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold ${config.color} ${bgMap[status]}`}>
      <Icon className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

function OffsetBadge({ status }: { status: Invoice['offsetStatus'] }) {
  const config = OFFSET_STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${config.color} ${config.bg}`}>
      {config.label}
    </span>
  );
}

function CompatibilityWarning({ reason }: { reason: string }) {
  return (
    <div className="group/compat relative inline-flex">
      <ShieldAlert className="w-3.5 h-3.5 text-gray-400" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/compat:opacity-100 transition-opacity pointer-events-none z-10">
        {reason}
      </div>
    </div>
  );
}

export function InvoiceTable() {
  const {
    getSupplierInvoices, selectedCreditId, getSelectedCredit, addInvoiceToCart,
    linkedInvoices, selectedSupplierId, bapiLoadingInvoices,
    getClassification, hasPartialLiquidations, getRemainingBalance,
  } = useAbatimentoStore();

  const invoicesList = getSupplierInvoices();
  const credit = getSelectedCredit();
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'dueDate' | 'openBalance' | 'grossValue'>('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const classification = linkedInvoices.length > 0 ? getClassification() : null;
  const hasPartials = hasPartialLiquidations();
  const remaining = getRemainingBalance();

  const filtered = useMemo(() => {
    let result = [...invoicesList];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.nfNumber.toLowerCase().includes(q) ||
          i.duplicateCode.toLowerCase().includes(q) ||
          i.supplierName.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'dueDate') cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      else if (sortField === 'openBalance') cmp = a.openBalance - b.openBalance;
      else cmp = a.grossValue - b.grossValue;
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [invoicesList, search, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const isInCart = (id: string) => linkedInvoices.some((l) => l.invoiceId === id);
  const getLinkedItem = (id: string) => linkedInvoices.find((l) => l.invoiceId === id);

  const getIncompatibilityReason = (inv: Invoice): string | null => {
    if (!credit) return 'Selecione um credito primeiro';
    if (inv.offsetStatus === 'liquidada') return 'NF ja liquidada integralmente';
    if (inv.openBalance <= 0) return 'Saldo em aberto zerado';
    if (inv.contraparte !== credit.contraparte) return `Contraparte divergente (${inv.contraparte})`;
    if (inv.company !== credit.company) return `Empresa divergente (${inv.company})`;
    if (inv.disputeStatus === 'bloqueada') return 'NF bloqueada para vinculacao';
    return null;
  };

  const canAdd = (inv: Invoice) => {
    if (!credit) return false;
    return getIncompatibilityReason(inv) === null && !isInCart(inv.id);
  };

  const totalFiltered = filtered.length;
  const totalOpenBalance = filtered.reduce((sum, inv) => sum + inv.openBalance, 0);

  if (!selectedSupplierId) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Selecione um fornecedor para visualizar as notas fiscais</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50/50 gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            NFs / Duplicatas ({totalFiltered})
          </h3>
          {credit && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-[#0070f2] bg-[#0070f2]/10">
              <CreditCard className="w-3 h-3" />
              Saldo credito: {formatCurrency(remaining > 0 ? remaining : 0)}
            </span>
          )}
          {totalFiltered > 0 && (
            <span className="text-[10px] text-gray-400 tabular-nums">
              Saldo total aberto: {formatCurrency(totalOpenBalance)}
            </span>
          )}
          {classification && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${CLASSIFICATION_CONFIG[classification].color} ${CLASSIFICATION_CONFIG[classification].bg}`}>
              {classification === 'compensacao_parcial' && <SplitSquareHorizontal className="w-3 h-3" />}
              {classification === 'compensacao_integral' && <CheckCircle2 className="w-3 h-3" />}
              {CLASSIFICATION_CONFIG[classification].label}
            </span>
          )}
          {hasPartials && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200">
              Baixa Parcial
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {bapiLoadingInvoices && (
            <span className="flex items-center gap-1 text-[10px] text-[#0070f2] font-mono">
              <Loader2 className="w-3 h-3 animate-spin" /> ZREVVO_AP_ACC_GETOPENITEMS
            </span>
          )}
          <div className="relative w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar NF, duplicata ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
            />
          </div>
        </div>
      </div>

      {bapiLoadingInvoices ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Loader2 className="w-7 h-7 text-[#0070f2] animate-spin mx-auto mb-2" />
            <p className="text-xs font-medium text-[#0070f2]">Carregando itens em aberto...</p>
            <p className="text-[10px] text-gray-400 mt-1 font-mono">ZREVVO_AP_ACC_GETOPENITEMS</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">NF / Duplicata</th>
                <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="flex items-center gap-0.5">
                    <Building2 className="w-3 h-3 text-gray-400" /> Fornecedor
                  </span>
                </th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('grossValue')} className="inline-flex items-center gap-0.5 hover:text-gray-700">
                    Valor Bruto <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">Ja Abatido</th>
                <th className="text-right px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('openBalance')} className="inline-flex items-center gap-0.5 hover:text-gray-700">
                    Saldo Aberto <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('dueDate')} className="inline-flex items-center gap-0.5 hover:text-gray-700">
                    Vencimento <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-center px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">Situacao</th>
                <th className="text-center px-3 py-2 font-semibold text-gray-500 uppercase tracking-wider">Sinalizacao</th>
                <th className="text-center px-2 py-2 font-semibold text-gray-500 uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((inv) => {
                const inCart = isInCart(inv.id);
                const linkedItem = getLinkedItem(inv.id);
                const isPartial = linkedItem?.isPartialLiquidation;
                const incompatReason = credit ? getIncompatibilityReason(inv) : null;
                const isBlocked = inv.disputeStatus === 'bloqueada';
                const isOverdue = new Date(inv.dueDate) < new Date() && inv.duplicateStatus !== 'liquidada';
                const wasPartiallyOffset = inv.alreadyOffset > 0 && inv.openBalance > 0;

                return (
                  <tr
                    key={inv.id}
                    className={`transition-colors group ${
                      inCart
                        ? isPartial ? 'bg-amber-50/30' : 'bg-blue-50/40'
                        : isBlocked
                        ? 'bg-gray-50/70 opacity-60'
                        : inv.offsetStatus === 'liquidada'
                        ? 'bg-gray-50/50 opacity-50'
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <DisputeIcon status={inv.disputeStatus} />
                        <div>
                          <span className="font-mono font-medium text-gray-800">{inv.nfNumber}</span>
                          {isPartial && (
                            <span className="ml-1 text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">PARCIAL</span>
                          )}
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{inv.duplicateCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-[11px] text-gray-700 font-medium truncate max-w-[140px]">{inv.supplierName}</p>
                      <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{inv.company}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-700 tabular-nums">{formatCurrency(inv.grossValue)}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {inv.alreadyOffset > 0 ? (
                        <span className="text-gray-500">
                          {formatCurrency(inv.alreadyOffset)}
                          {wasPartiallyOffset && (
                            <span className="block text-[9px] text-blue-600 font-semibold">abatido anterior</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <span className="font-semibold text-gray-900">{formatCurrency(inv.openBalance)}</span>
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                      <div className="flex items-center gap-1">
                        {formatDate(inv.dueDate)}
                        {isOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <OffsetBadge status={inv.offsetStatus} />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <DisputeBadge status={inv.disputeStatus} />
                        {incompatReason && !inCart && credit && (
                          <CompatibilityWarning reason={incompatReason} />
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {canAdd(inv) ? (
                        <button
                          onClick={() => addInvoiceToCart(inv)}
                          disabled={!selectedCreditId}
                          className="p-1 rounded-md bg-[#0070f2] text-white hover:bg-[#005bc4] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors opacity-0 group-hover:opacity-100"
                          title={!selectedCreditId ? 'Selecione um credito primeiro' : 'Adicionar ao abatimento'}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      ) : inCart ? (
                        <span className={`inline-flex w-5 h-5 items-center justify-center rounded-full ${isPartial ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                          {isPartial ? (
                            <SplitSquareHorizontal className="w-3 h-3 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          )}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <FileText className="w-7 h-7 text-gray-300 mx-auto mb-1.5" />
                    <p className="text-xs text-gray-400">Nenhuma nota fiscal encontrada com os filtros aplicados</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!bapiLoadingInvoices && filtered.length > 0 && credit && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              Livre para vinculacao
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              Pendente de aprovacao
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              Parcialmente compensada
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              Liquidada
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-gray-400">
              Elegíveis: <span className="font-semibold text-gray-600">{filtered.filter((inv) => !getIncompatibilityReason(inv)).length}</span> de {totalFiltered}
            </span>
            <span className="text-gray-400">
              No carrinho: <span className="font-semibold text-[#0070f2]">{linkedInvoices.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
