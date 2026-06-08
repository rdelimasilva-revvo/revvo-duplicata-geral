import React, { useEffect, useMemo, useState } from 'react';
import {
  Wallet, FileText, CheckCircle2, AlertTriangle, Clock, Lock,
  Scale, Sparkles, Send, RotateCcw, Loader2, ChevronRight, Info,
  Building2, Calendar,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { CreditsBySupplierList } from '@/modules/acordosComerciais/components/CreditsBySupplierList';

interface SupplierCredit {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  supplierCnpj: string;
  origin: string;
  totalValue: number;
  remainingValue: number;
  issueDate: string | null;
  expiresAt: string | null;
  status: string;
}

interface EligibleInvoice {
  id: string;
  supplierId: string;
  number: string;
  issueDate: string | null;
  dueDate: string | null;
  originalValue: number;
  openBalance: number;
  status: 'livre' | 'em_disputa' | 'bloqueada' | 'pendente';
}

const ORIGIN_LABEL: Record<string, string> = {
  acordo_comercial: 'Acordo Comercial',
  devolucao: 'Devolução',
  bonificacao: 'Bonificação',
};

const STATUS_CFG: Record<EligibleInvoice['status'], { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  livre: {
    label: 'Livre',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  pendente: {
    label: 'Pendente',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Clock className="w-3 h-3" />,
  },
  em_disputa: {
    label: 'Em Disputa',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  bloqueada: {
    label: 'Bloqueada',
    color: 'text-gray-600',
    bg: 'bg-gray-100',
    border: 'border-gray-200',
    icon: <Lock className="w-3 h-3" />,
  },
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

const roundCents = (value: number) => Math.round(value * 100) / 100;

interface VincularCreditoProps {
  onBack: () => void;
  onSubmit?: (creditId: string, allocations: Record<string, number>) => void;
}

export function VincularCredito({ onBack, onSubmit }: VincularCreditoProps) {
  const { showToast } = useToast();
  const [credits, setCredits] = useState<SupplierCredit[]>([]);
  const [invoices, setInvoices] = useState<EligibleInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Record<string, boolean>>({});
  const [allocations, setAllocations] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [creditsRes, invoicesRes] = await Promise.all([
          supabase.from('supplier_credits').select('*').order('created_at', { ascending: false }),
          supabase.from('eligible_invoices').select('*').order('due_date', { ascending: true }),
        ]);
        if (creditsRes.error) throw creditsRes.error;
        if (invoicesRes.error) throw invoicesRes.error;
        if (cancelled) return;
        setCredits(
          (creditsRes.data || []).map((r: any) => ({
            id: r.id,
            code: r.code,
            supplierId: r.supplier_id,
            supplierName: r.supplier_name,
            supplierCnpj: r.supplier_cnpj,
            origin: r.origin,
            totalValue: Number(r.total_value),
            remainingValue: Number(r.remaining_value),
            issueDate: r.issue_date,
            expiresAt: r.expires_at,
            status: r.status,
          })),
        );
        setInvoices(
          (invoicesRes.data || []).map((r: any) => ({
            id: r.id,
            supplierId: r.supplier_id,
            number: r.number,
            issueDate: r.issue_date,
            dueDate: r.due_date,
            originalValue: Number(r.original_value),
            openBalance: Number(r.open_balance),
            status: r.status,
          })),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCredit = useMemo(
    () => credits.find((c) => c.id === selectedCreditId) || null,
    [credits, selectedCreditId],
  );

  const invoicesForCredit = useMemo(
    () => (selectedCredit ? invoices.filter((i) => i.supplierId === selectedCredit.supplierId) : []),
    [selectedCredit, invoices],
  );

  const totalDistribuido = useMemo(() => {
    return Object.entries(allocations).reduce((sum, [id, value]) => {
      if (!selectedInvoices[id]) return sum;
      return sum + (Number(value) || 0);
    }, 0);
  }, [allocations, selectedInvoices]);

  const creditoValue = selectedCredit?.remainingValue ?? 0;
  const saldo = roundCents(creditoValue - totalDistribuido);
  const diferenca = Math.abs(saldo);
  const contaFecha = selectedCredit !== null && diferenca < 0.01 && totalDistribuido > 0;
  const saldoNegativo = saldo < -0.009;
  const pctConsumido = creditoValue > 0 ? Math.min(100, (totalDistribuido / creditoValue) * 100) : 0;

  const linhasSelecionadas = invoicesForCredit.filter((i) => selectedInvoices[i.id]);

  const resetDistribution = () => {
    setSelectedInvoices({});
    setAllocations({});
  };

  const handleSelectCredit = (creditId: string) => {
    if (creditId !== selectedCreditId) {
      resetDistribution();
    }
    setSelectedCreditId(creditId);
  };

  const toggleInvoice = (invoice: EligibleInvoice) => {
    if (invoice.status === 'bloqueada') {
      showToast('warning', 'NF bloqueada', 'Esta nota fiscal não pode receber abatimentos.');
      return;
    }
    setSelectedInvoices((prev) => {
      const next = { ...prev, [invoice.id]: !prev[invoice.id] };
      if (!next[invoice.id]) {
        setAllocations((a) => {
          const { [invoice.id]: _removed, ...rest } = a;
          return rest;
        });
      }
      return next;
    });
  };

  const handleAllocationChange = (invoice: EligibleInvoice, raw: string) => {
    const cleaned = raw.replace(/[^\d.,]/g, '').replace(',', '.');
    const value = Number(cleaned);
    const clamped = Math.max(0, Math.min(invoice.openBalance, isFinite(value) ? value : 0));
    setAllocations((prev) => ({ ...prev, [invoice.id]: clamped }));
  };

  const distribuirAutomatico = () => {
    if (!selectedCredit) {
      showToast('warning', 'Selecione um crédito', 'Escolha um crédito para poder distribuir o valor.');
      return;
    }
    if (linhasSelecionadas.length === 0) {
      showToast('warning', 'Nenhuma NF marcada', 'Marque ao menos uma nota fiscal antes de distribuir.');
      return;
    }

    let restante = creditoValue;
    const next: Record<string, number> = {};
    const elegiveis = [...linhasSelecionadas];

    const somaCap = elegiveis.reduce((s, inv) => s + inv.openBalance, 0);

    if (somaCap <= creditoValue) {
      elegiveis.forEach((inv) => {
        next[inv.id] = roundCents(inv.openBalance);
      });
    } else {
      elegiveis.forEach((inv, idx) => {
        if (idx === elegiveis.length - 1) {
          next[inv.id] = roundCents(Math.max(0, Math.min(inv.openBalance, restante)));
        } else {
          const proporcao = inv.openBalance / somaCap;
          const valor = Math.min(inv.openBalance, roundCents(creditoValue * proporcao));
          next[inv.id] = valor;
          restante = roundCents(restante - valor);
        }
      });
    }

    setAllocations(next);
    showToast('success', 'Distribuição aplicada', 'Valores ajustados proporcionalmente entre as NFs.');
  };

  const handleConfirmar = () => {
    if (!selectedCredit) return;
    if (!contaFecha) {
      showToast(
        'error',
        'A conta não fecha',
        `Há uma diferença de ${formatCurrency(diferenca)} entre o crédito e o distribuído.`,
      );
      return;
    }
    const alloc: Record<string, number> = {};
    linhasSelecionadas.forEach((inv) => {
      alloc[inv.id] = allocations[inv.id] || 0;
    });
    showToast(
      'success',
      'Vinculação confirmada',
      `${formatCurrency(totalDistribuido)} distribuídos em ${linhasSelecionadas.length} NF(s).`,
    );
    onSubmit?.(selectedCredit.id, alloc);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#F5F6F7]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0070f2]" />
        <p className="text-sm text-gray-500 mt-3">Carregando créditos e notas…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F6F7]">
      <div className="p-6 pb-40 space-y-5 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0070f2] to-[#005bc4] flex items-center justify-center shadow-sm">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Selecionar NFs e Vincular Crédito</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Distribua o valor do crédito entre as notas fiscais e garanta que a conta feche sem diferença
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#0070f2]" />
            <h2 className="text-sm font-bold text-gray-800">1. Escolha o crédito</h2>
            <span className="text-[11px] text-gray-400">
              ({credits.length} {credits.length === 1 ? 'disponível' : 'disponíveis'})
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {credits.length === 0 && (
              <div className="col-span-full text-center py-6 text-xs text-gray-400">
                Nenhum crédito disponível.
              </div>
            )}
            {credits.map((credit) => {
              const isActive = credit.id === selectedCreditId;
              return (
                <button
                  key={credit.id}
                  onClick={() => handleSelectCredit(credit.id)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-[#0070f2] bg-[#0070f2]/5 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                  }`}
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
                        <CheckCircle2 className="w-3 h-3 text-white" />
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
                      <Calendar className="w-2.5 h-2.5" />
                      Expira em {format(parseISO(credit.expiresAt), 'dd/MM/yyyy')}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {selectedCredit ? (
          <>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0070f2]" />
                  <h2 className="text-sm font-bold text-gray-800">
                    2. Selecione as NFs de {selectedCredit.supplierName}
                  </h2>
                  <span className="text-[11px] text-gray-400">
                    ({invoicesForCredit.length} elegíveis)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetDistribution}
                    disabled={linhasSelecionadas.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Limpar
                  </button>
                  <button
                    onClick={distribuirAutomatico}
                    disabled={linhasSelecionadas.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#0070f2] rounded-lg hover:bg-[#005bc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    <Sparkles className="w-3 h-3" />
                    Distribuir automaticamente
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
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
                      <th className="text-right px-3 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Sobra / Ajuste
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invoicesForCredit.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center">
                          <Building2 className="w-7 h-7 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-500">
                            Nenhuma NF elegível para este fornecedor.
                          </p>
                        </td>
                      </tr>
                    )}
                    {invoicesForCredit.map((invoice) => {
                      const isSelected = !!selectedInvoices[invoice.id];
                      const isBlocked = invoice.status === 'bloqueada';
                      const cfg = STATUS_CFG[invoice.status];
                      const valor = allocations[invoice.id] || 0;
                      const sobra = isSelected ? invoice.openBalance - valor : 0;
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
                              onChange={() => toggleInvoice(invoice)}
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
                              value={isSelected && valor > 0 ? valor.toString() : ''}
                              placeholder={isSelected ? '0,00' : '—'}
                              onChange={(e) => handleAllocationChange(invoice, e.target.value)}
                              className={`w-32 px-2 py-1.5 text-xs text-right font-semibold border rounded-md tabular-nums transition-colors ${
                                isSelected
                                  ? 'border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]'
                                  : 'border-transparent bg-gray-50 text-gray-300 cursor-not-allowed'
                              }`}
                            />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <span
                              className={`text-[11px] font-semibold tabular-nums ${
                                !isSelected
                                  ? 'text-gray-300'
                                  : sobra > 0
                                    ? 'text-amber-600'
                                    : 'text-emerald-600'
                              }`}
                            >
                              {isSelected ? formatCurrency(sobra) : '—'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <CreditsBySupplierList
              highlightSupplierId={selectedCredit.supplierId}
              onSelectCredit={(credito) => handleSelectCredit(credito.id)}
            />
          </>
        ) : (
          <div className="flex items-center gap-3 p-5 bg-blue-50 border border-blue-200 rounded-xl">
            <Info className="w-5 h-5 text-[#0070f2] flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Selecione um crédito acima para começar
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                As notas fiscais do mesmo fornecedor serão carregadas automaticamente para você
                distribuir o valor.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-width,16rem)] bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-30">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[420px]">
              <div className="grid grid-cols-3 gap-3">
                <TotalBlock
                  label="Crédito"
                  value={formatCurrency(creditoValue)}
                  hint={selectedCredit ? selectedCredit.code : 'Nenhum selecionado'}
                  tone="neutral"
                />
                <TotalBlock
                  label="Distribuído"
                  value={formatCurrency(totalDistribuido)}
                  hint={`${linhasSelecionadas.length} NF(s) marcadas`}
                  tone="blue"
                />
                <TotalBlock
                  label={saldoNegativo ? 'Excedeu em' : diferenca < 0.01 ? 'Conta fecha' : 'Falta distribuir'}
                  value={formatCurrency(diferenca)}
                  hint={
                    !selectedCredit
                      ? 'Selecione um crédito'
                      : contaFecha
                        ? 'Pronto para vincular'
                        : saldoNegativo
                          ? 'Reduza os valores'
                          : 'Ajuste os valores'
                  }
                  tone={
                    !selectedCredit ? 'neutral' : saldoNegativo ? 'danger' : contaFecha ? 'success' : 'warning'
                  }
                />
              </div>
              {selectedCredit && totalDistribuido > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span className="font-semibold">Consumo do crédito</span>
                    <span className="tabular-nums">{pctConsumido.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        saldoNegativo
                          ? 'bg-rose-500'
                          : contaFecha
                            ? 'bg-emerald-500'
                            : 'bg-[#0070f2]'
                      }`}
                      style={{ width: `${Math.min(100, pctConsumido)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onBack}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={!contaFecha}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  contaFecha
                    ? 'bg-[#0070f2] text-white hover:bg-[#005bc4] shadow-sm hover:shadow-md'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title={!contaFecha ? 'A conta precisa fechar sem diferença' : undefined}
              >
                <Send className="w-4 h-4" />
                Confirmar Vinculação
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {selectedCredit && !contaFecha && totalDistribuido > 0 && (
            <div className="mt-3 flex items-center gap-2 text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {saldoNegativo ? (
                <span>
                  O valor distribuído excedeu o crédito em{' '}
                  <span className="font-bold">{formatCurrency(diferenca)}</span>. A operação está
                  bloqueada até ajustar os valores.
                </span>
              ) : (
                <span>
                  Ainda faltam <span className="font-bold">{formatCurrency(diferenca)}</span> para
                  que a conta feche. Distribua o saldo restante entre as NFs ou reduza o crédito
                  aplicado.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TotalBlock({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: 'neutral' | 'blue' | 'success' | 'warning' | 'danger';
}) {
  const palette: Record<typeof tone, string> = {
    neutral: 'text-gray-800',
    blue: 'text-[#0070f2]',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-rose-600',
  };
  const bg: Record<typeof tone, string> = {
    neutral: 'bg-gray-50 border-gray-200',
    blue: 'bg-[#0070f2]/5 border-[#0070f2]/20',
    success: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-rose-50 border-rose-200',
  };
  return (
    <div className={`px-3 py-2 rounded-lg border ${bg[tone]}`}>
      <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold tabular-nums ${palette[tone]}`}>{value}</p>
      <p className="text-[10px] text-gray-500 truncate">{hint}</p>
    </div>
  );
}
