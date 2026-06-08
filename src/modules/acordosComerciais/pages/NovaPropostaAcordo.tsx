import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Lock, Clock, Send,
  LayoutDashboard, Building2, Coins, Info, Inbox, X, XCircle, FileX, Wallet, Files,
} from 'lucide-react';
import {
  MagicWand,
  WarningCircle,
  TrendUp,
  CheckCircle as PhCheckCircle,
  LinkSimple,
  ChatsCircle,
  Flag,
} from '@phosphor-icons/react';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { AllCreditsList, type CreditRowData } from '../components/AllCreditsList';
import { formatCurrency, formatDate } from '../utils';
import {
  publishProposalEvent,
  useProposalEvent,
} from '../communication';

interface NovaPropostaAcordoProps {
  onBack: () => void;
  onSubmit?: (proposalId: string) => void;
  onOpenDashboard?: () => void;
}

type FaturaStatus = 'livre' | 'em_disputa' | 'bloqueada' | 'pendente';

interface NotaFiscal {
  id: string;
  numero: string;
  vencimento: string;
  valorOriginal: number;
  saldoAberto: number;
  status: FaturaStatus;
}

type DrillView = 'selection' | 'binding';

const STATUS_CONFIG: Record<FaturaStatus, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
}> = {
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

export function NovaPropostaAcordo({ onBack, onSubmit, onOpenDashboard }: NovaPropostaAcordoProps) {
  const [view, setView] = useState<DrillView>('selection');
  const [selectedCredit, setSelectedCredit] = useState<CreditRowData | null>(null);

  const handleCreditSelect = useCallback((credit: CreditRowData) => {
    setSelectedCredit(credit);
    setView('binding');
  }, []);

  const handleBackToSelection = useCallback(() => {
    setView('selection');
    setSelectedCredit(null);
  }, []);

  if (view === 'binding' && selectedCredit) {
    return (
      <BindingView
        credit={selectedCredit}
        onBack={handleBackToSelection}
        onCancelAll={onBack}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <SelectionView
      onCreditSelect={handleCreditSelect}
      onBack={onBack}
      onOpenDashboard={onOpenDashboard}
    />
  );
}

interface SelectionViewProps {
  onCreditSelect: (credit: CreditRowData) => void;
  onBack: () => void;
  onOpenDashboard?: () => void;
}

function SelectionView({ onCreditSelect, onOpenDashboard }: SelectionViewProps) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F6F7]">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0070f2] to-[#005bc4] flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Novo Acordo Comercial</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Selecione o crédito que deseja vincular a notas fiscais
              </p>
            </div>
          </div>
          {onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Visão geral do pipeline
            </button>
          )}
        </div>

        <AllCreditsList
          expandedRowId={null}
          onToggleExpand={onCreditSelect}
          onRowsLoaded={() => {}}
          hideFooter
        />
      </div>
    </div>
  );
}

interface BindingViewProps {
  credit: CreditRowData;
  onBack: () => void;
  onCancelAll: () => void;
  onSubmit?: (proposalId: string) => void;
}

function BindingView({ credit, onBack, onCancelAll, onSubmit }: BindingViewProps) {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selecionadas, setSelecionadas] = useState<Record<string, boolean>>({});
  const [valoresAbate, setValoresAbate] = useState<Record<string, number>>({});
  const [valoresAbateRaw, setValoresAbateRaw] = useState<Record<string, string>>({});
  const [autoFilled, setAutoFilled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('eligible_invoices')
          .select('*')
          .eq('supplier_id', credit.supplierId)
          .order('due_date', { ascending: true });
        if (fetchError) throw fetchError;
        if (cancelled) return;
        setInvoices(
          (data || []).map((r: any) => ({
            id: r.id,
            numero: r.number,
            vencimento: r.due_date,
            valorOriginal: Number(r.original_value),
            saldoAberto: Number(r.open_balance ?? r.original_value),
            status: r.status as FaturaStatus,
          })),
        );
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar notas fiscais');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [credit.supplierId]);

  const formatAmount = (n: number) =>
    n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const clearFatura = (faturaId: string) => {
    setSelecionadas((prev) => {
      const next = { ...prev };
      delete next[faturaId];
      return next;
    });
    setValoresAbate((prev) => {
      const next = { ...prev };
      delete next[faturaId];
      return next;
    });
    setValoresAbateRaw((prev) => {
      const next = { ...prev };
      delete next[faturaId];
      return next;
    });
    setAutoFilled((prev) => {
      const next = { ...prev };
      delete next[faturaId];
      return next;
    });
  };

  const toggleFatura = (fatura: NotaFiscal) => {
    if (fatura.status === 'bloqueada') {
      showToast('warning', 'NF bloqueada', 'Esta nota fiscal não pode ser incluída em acordos.');
      return;
    }
    if (selecionadas[fatura.id]) {
      clearFatura(fatura.id);
      return;
    }

    const newSelected = { ...selecionadas, [fatura.id]: true };
    const newAutoFilled = { ...autoFilled, [fatura.id]: true };

    const manualTotal = Object.keys(newSelected).reduce((acc, id) => {
      return newSelected[id] && !newAutoFilled[id] ? acc + (Number(valoresAbate[id]) || 0) : acc;
    }, 0);
    const autoIds = Object.keys(newSelected).filter((id) => newSelected[id] && newAutoFilled[id]);
    const autoInvoices = autoIds
      .map((id) => invoices.find((inv) => inv.id === id))
      .filter((inv): inv is NotaFiscal => !!inv);

    let remaining = Math.max(0, credit.remainingValue - manualTotal);
    const updates: Record<string, number> = {};
    const sorted = [...autoInvoices].sort((a, b) => {
      const la = Math.min(a.valorOriginal, a.saldoAberto || a.valorOriginal);
      const lb = Math.min(b.valorOriginal, b.saldoAberto || b.valorOriginal);
      return la - lb;
    });

    let pending = sorted.length;
    for (const inv of sorted) {
      const limite = Math.min(inv.valorOriginal, inv.saldoAberto || inv.valorOriginal);
      const share = pending > 0 ? remaining / pending : 0;
      const assigned = Math.min(limite, share);
      updates[inv.id] = Math.round(assigned * 100) / 100;
      remaining = Math.max(0, remaining - assigned);
      pending -= 1;
    }

    setSelecionadas(newSelected);
    setAutoFilled(newAutoFilled);
    setValoresAbate((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(updates)) next[id] = updates[id];
      return next;
    });
    setValoresAbateRaw((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(updates)) next[id] = formatAmount(updates[id]);
      return next;
    });
  };

  const autoDistribuir = () => {
    const elegiveis = invoices.filter((inv) => inv.status !== 'bloqueada');
    if (elegiveis.length === 0) {
      showToast('info', 'Sem notas elegíveis', 'Não há NFs em aberto para distribuir o crédito.');
      return;
    }
    let remaining = credit.remainingValue;
    const sorted = [...elegiveis].sort((a, b) => {
      const la = Math.min(a.valorOriginal, a.saldoAberto || a.valorOriginal);
      const lb = Math.min(b.valorOriginal, b.saldoAberto || b.valorOriginal);
      return la - lb;
    });
    const novosValores: Record<string, number> = {};
    const novosRaw: Record<string, string> = {};
    const novosSelecionadas: Record<string, boolean> = {};
    const novosAuto: Record<string, boolean> = {};
    let pending = sorted.length;
    for (const inv of sorted) {
      const limite = Math.min(inv.valorOriginal, inv.saldoAberto || inv.valorOriginal);
      const share = pending > 0 ? remaining / pending : 0;
      const assigned = Math.max(0, Math.min(limite, share));
      const rounded = Math.round(assigned * 100) / 100;
      novosValores[inv.id] = rounded;
      novosRaw[inv.id] = formatAmount(rounded);
      novosSelecionadas[inv.id] = rounded > 0;
      novosAuto[inv.id] = true;
      remaining = Math.max(0, remaining - assigned);
      pending -= 1;
    }
    setSelecionadas(novosSelecionadas);
    setValoresAbate(novosValores);
    setValoresAbateRaw(novosRaw);
    setAutoFilled(novosAuto);
    showToast(
      'success',
      'Distribuição automática aplicada',
      `${elegiveis.length} NFs preenchidas com o saldo disponível.`,
    );
  };

  const handleValorChange = (fatura: NotaFiscal, valor: string) => {
    const sanitized = valor.replace(/[^\d.,]/g, '');
    setValoresAbateRaw((prev) => ({ ...prev, [fatura.id]: sanitized }));
    const numerico = Number(sanitized.replace(/\./g, '').replace(',', '.'));
    const limite = Math.min(fatura.valorOriginal, fatura.saldoAberto || fatura.valorOriginal);
    const clamp = Math.max(0, Math.min(limite, numerico || 0));
    setValoresAbate((prev) => ({ ...prev, [fatura.id]: clamp }));
    setAutoFilled((prev) => ({ ...prev, [fatura.id]: false }));
  };

  const distribuido = useMemo(() => {
    let total = 0;
    Object.keys(selecionadas).forEach((invId) => {
      if (selecionadas[invId]) total += Number(valoresAbate[invId]) || 0;
    });
    return total;
  }, [selecionadas, valoresAbate]);

  const saldoRestante = credit.remainingValue - distribuido;
  const saldoNegativo = saldoRestante < 0;

  const openInvoices = useMemo(
    () => invoices.filter((nf) => nf.status !== 'bloqueada'),
    [invoices],
  );
  const openCount = openInvoices.length;
  const openTotal = useMemo(
    () => openInvoices.reduce((s, nf) => s + (nf.saldoAberto || nf.valorOriginal), 0),
    [openInvoices],
  );
  const hasOpenInvoices = openCount > 0;

  const isValidDistribution = useMemo(() => {
    const algumaSelecionada = Object.values(selecionadas).some(Boolean);
    return hasOpenInvoices && algumaSelecionada && distribuido > 0 && !saldoNegativo;
  }, [selecionadas, distribuido, saldoNegativo, hasOpenInvoices]);

  const temAlgumaSelecao = Object.values(selecionadas).some(Boolean);

  const handleCancel = () => {
    if (temAlgumaSelecao) {
      if (!confirm('Descartar a vinculação em andamento?')) return;
    }
    onCancelAll();
  };

  const handleConfirm = async () => {
    if (!isValidDistribution) {
      showToast(
        'warning',
        'Vinculação incompleta',
        'Marque ao menos uma NF e ajuste os valores antes de confirmar.',
      );
      return;
    }
    const id = `AC-${Date.now()}`;
    const selectedInvoices = invoices.filter((nf) => selecionadas[nf.id]);
    const totalOriginal = selectedInvoices.reduce((s, nf) => s + nf.valorOriginal, 0);

    await publishProposalEvent(
      'proposal:created',
      credit.code,
      {
        code: credit.code,
        origin_company: credit.supplierName,
        total_original: totalOriginal,
        total_discount: distribuido,
        invoices_count: selectedInvoices.length,
        sent_at: new Date().toISOString(),
      },
      'acordos',
    );

    showToast(
      'success',
      'Proposta gerada',
      `Acordo ${id} criado com ${formatCurrency(distribuido)} em abatimento.`,
    );
    setSelecionadas({});
    setValoresAbate({});
    onSubmit?.(id);
  };

  useProposalEvent('proposal:decided', credit.code, (event) => {
    const isApproved = event.payload.decision === 'approved';
    showToast(
      isApproved ? 'success' : 'info',
      isApproved ? 'Fornecedor aprovou o acordo' : 'Fornecedor recusou o acordo',
      isApproved
        ? `Desconto de ${formatCurrency(event.payload.total_discount)} confirmado.`
        : event.payload.refusal_reason ?? 'Acompanhe pelos detalhes da proposta.',
    );
  });

  useProposalEvent('proposal:viewed', credit.code, () => {
    showToast('info', 'Fornecedor abriu a proposta', 'O fornecedor está revisando o acordo agora.');
  });

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#F5F6F7]">
      <div className="p-6 pb-32 space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={onBack}
              aria-label="Voltar para lista de créditos"
              title="Voltar para lista de créditos"
              className="flex items-center justify-center w-8 h-8 text-gray-500 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 hover:text-[#0070f2] hover:border-[#0070f2]/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="w-px h-8 bg-gray-200 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-[#0070f2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  Vinculando NFs para
                </p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[260px]">
                  {credit.supplierName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Crédito
              </span>
              <span className="text-sm font-mono font-bold text-gray-800 mt-0.5">
                {credit.code}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                Saldo Disponível
                <InfoHint
                  label="Composição do crédito"
                  lines={creditOriginBreakdown(credit.remainingValue)}
                />
              </span>
              <span className="text-sm font-bold text-[#0070f2] tabular-nums mt-0.5">
                {formatCurrency(credit.remainingValue)}
              </span>
            </div>
          </div>
        </div>

        <CashOutEvitadoWidget monthlySaved={distribuido} creditAvailable={credit.remainingValue} />

        <AgreementStepper
          currentStep={
            distribuido > 0 && !saldoNegativo && temAlgumaSelecao
              ? 'review'
              : temAlgumaSelecao
                ? 'linked'
                : 'created'
          }
        />

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#0070f2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  Notas Fiscais Elegíveis
                  <InfoHint
                    label="Rateio"
                    lines={[
                      'Rateio é a distribuição do crédito disponível entre uma ou mais notas fiscais selecionadas, respeitando o saldo de cada uma.',
                    ]}
                  />
                </h2>
                <p className="text-[11px] text-gray-500">
                  Selecione e distribua o crédito entre as notas (abatimento)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!loading && !error && invoices.length > 0 && (
                <button
                  type="button"
                  onClick={autoDistribuir}
                  aria-label="Auto-distribuir crédito entre NFs em aberto"
                  title="Preenche automaticamente os valores a abater usando o saldo disponível"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0070f2] bg-white border border-[#0070f2]/30 rounded-lg hover:bg-[#0070f2]/5 hover:border-[#0070f2] transition-colors"
                >
                  <MagicWand size={14} weight="fill" />
                  Auto-Distribuir
                </button>
              )}
              {!loading && !error && (
                <span className="text-[10px] text-gray-500">
                  <span className="tabular-nums font-semibold text-gray-700">{invoices.length}</span>{' '}
                  {invoices.length === 1 ? 'nota fiscal' : 'notas fiscais'}
                </span>
              )}
            </div>
          </div>

          {!loading && !error && (
            <PreflowSummary
              openCount={openCount}
              openTotal={openTotal}
              availableCredits={credit.remainingValue}
            />
          )}

          {saldoNegativo && (
            <div className="mx-5 mt-3 flex items-center gap-2 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              Total a abater excede o saldo deste crédito em{' '}
              <span className="font-bold">{formatCurrency(Math.abs(saldoRestante))}</span>.
            </div>
          )}

          {loading ? (
            <InvoicesTableSkeleton />
          ) : error ? (
            <div className="m-5 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-800">
                  Erro ao carregar notas fiscais
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
          ) : invoices.length === 0 ? (
            <EmptyInvoicesIllustration supplierName={credit.supplierName} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="w-10 px-4 py-2.5"></th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Número da NF
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Vencimento
                    </th>
                    <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      ID da NF
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Valor Original
                    </th>
                    <th className="text-center px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Valor a Abater
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((nf) => {
                    const isSel = !!selecionadas[nf.id];
                    const isBloqueada = nf.status === 'bloqueada';
                    const cfg = STATUS_CONFIG[nf.status];
                    const valor = valoresAbate[nf.id] || 0;
                    const excede = isSel && valor > nf.valorOriginal;
                    return (
                      <tr
                        key={nf.id}
                        className={`transition-colors ${
                          isSel
                            ? 'bg-[#0070f2]/5 shadow-[inset_3px_0_0_0_#0070f2]'
                            : 'hover:bg-gray-50/60'
                        } ${isBloqueada ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={isSel}
                            disabled={isBloqueada}
                            onChange={() => toggleFatura(nf)}
                            aria-label={`Selecionar ${nf.numero}`}
                            className="w-4 h-4 rounded border-gray-300 text-[#0070f2] focus:ring-2 focus:ring-[#0070f2]/20 disabled:cursor-not-allowed"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-mono font-semibold text-gray-800">
                            {nf.numero}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-gray-600 tabular-nums">
                            {formatDate(nf.vencimento)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-mono text-gray-600">
                            {nf.id}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-xs font-semibold text-gray-800 tabular-nums">
                            {formatCurrency(nf.valorOriginal)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-semibold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                          >
                            {cfg.icon}
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="relative inline-block">
                            <input
                              type="text"
                              inputMode="decimal"
                              disabled={!isSel}
                              value={isSel ? (valoresAbateRaw[nf.id] ?? (valor > 0 ? valor.toString() : '')) : ''}
                              placeholder={isSel ? '0,00' : '—'}
                              onChange={(e) => handleValorChange(nf, e.target.value)}
                              aria-label={`Valor a abater para ${nf.numero}`}
                              className={`w-36 text-right text-xs font-semibold tabular-nums pl-2 pr-7 py-1.5 border rounded-md transition-all ${
                                !isSel
                                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                  : excede
                                    ? 'border-red-300 bg-red-50 text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200'
                                    : autoFilled[nf.id]
                                      ? 'border-[#0070f2] bg-[#0070f2]/5 text-gray-800 ring-2 ring-[#0070f2]/20 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/30'
                                      : 'border-[#0070f2]/30 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]'
                              }`}
                            />
                            {isSel && (
                              <button
                                type="button"
                                onClick={() => clearFatura(nf.id)}
                                aria-label={`Limpar valor de ${nf.numero}`}
                                title="Limpar e desmarcar"
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-width,16rem)] bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-30 animate-sticky-up">
        {(!temAlgumaSelecao || !hasOpenInvoices) && (
          <div className="px-6 pt-2.5 -mb-1 flex items-center gap-2 text-[11px] text-amber-800 bg-amber-50 border-t border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="py-1">
              {!hasOpenInvoices
                ? 'Não há notas fiscais em aberto disponíveis para vinculação.'
                : 'Selecione ao menos uma nota para prosseguir com a vinculação.'}
            </span>
          </div>
        )}
        <div className="px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
                <Coins className="w-4 h-4 text-[#0070f2]" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold leading-tight">
                Resumo da<br />distribuição
              </div>
            </div>
            <span className="w-px h-8 bg-gray-200" />
            <FooterStat label="Crédito" value={formatCurrency(credit.remainingValue)} tone="neutral" />
            <FooterStat
              label="Distribuído"
              value={formatCurrency(distribuido)}
              tone="blue"
              hint="Total de abatimento já alocado às notas selecionadas. Será compensado no SAP após o aceite do fornecedor."
            />
            <FooterStat
              label={saldoRestante >= 0 ? 'Falta Distribuir' : 'Sobra'}
              value={formatCurrency(Math.abs(saldoRestante))}
              tone={
                saldoNegativo
                  ? 'danger'
                  : saldoRestante === 0 && distribuido > 0
                    ? 'success'
                    : 'neutral'
              }
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValidDistribution}
              aria-label={
                saldoNegativo
                  ? 'Valor distribuído excede o saldo'
                  : 'Aprovar liquidação e enviar proposta'
              }
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                isValidDistribution
                  ? 'bg-[#0070f2] text-white hover:bg-[#005bc4] shadow-sm hover:shadow-md'
                  : saldoNegativo
                    ? 'bg-red-50 text-red-400 border border-red-200 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saldoNegativo ? (
                <WarningCircle size={16} weight="fill" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Aprovar Liquidação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterStat({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone: 'neutral' | 'blue' | 'success' | 'danger';
  hint?: string;
}) {
  const toneMap = {
    neutral: 'text-gray-800',
    blue: 'text-[#0070f2]',
    success: 'text-emerald-600',
    danger: 'text-red-600',
  };
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
        {label}
        {hint && <InfoHint label={label} lines={[hint]} />}
      </span>
      <span className={`text-base font-bold tabular-nums mt-0.5 ${toneMap[tone]}`}>{value}</span>
    </div>
  );
}

interface InfoHintProps {
  label: string;
  lines: string[];
}

function InfoHint({ label, lines }: InfoHintProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="inline-flex items-center justify-center w-3.5 h-3.5 text-gray-400 hover:text-[#0070f2] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 rounded-full transition-colors"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`Detalhes sobre ${label}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[16rem] bg-gray-900 text-white text-[11px] rounded-md shadow-xl px-3 py-2 leading-relaxed normal-case tracking-normal font-normal"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-1">
            {label}
          </span>
          {lines.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-gray-900" />
        </span>
      )}
    </span>
  );
}

function creditOriginBreakdown(total: number): string[] {
  const devolucao = Math.round(total * 0.78);
  const bonus = total - devolucao;
  return [
    `${formatCurrency(devolucao)} de Devoluções`,
    `${formatCurrency(bonus)} de Bônus comercial`,
  ];
}

function InvoicesTableSkeleton() {
  return (
    <div className="px-5 py-4">
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-10 rounded-md bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:800px_100%] animate-shimmer"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyInvoicesIllustration({ supplierName: _supplierName }: { supplierName: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="py-14 text-center px-6"
    >
      <div className="mx-auto w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
        <FileX className="w-9 h-9 text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-gray-700 max-w-md mx-auto leading-relaxed">
        Não existem Notas Fiscais em aberto para este fornecedor. O abatimento de crédito não é possível.
      </p>
    </div>
  );
}

interface PreflowSummaryProps {
  openCount: number;
  openTotal: number;
  availableCredits: number;
}

function PreflowSummary({ openCount, openTotal, availableCredits }: PreflowSummaryProps) {
  return (
    <div
      role="region"
      aria-label="Resumo de notas fiscais e créditos"
      className="px-5 pt-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryStat
          icon={<Files className="w-4 h-4 text-gray-500" />}
          label="NFs em aberto"
          value={openCount.toLocaleString('pt-BR')}
          valueClass="text-gray-900"
        />
        <SummaryStat
          icon={<FileText className="w-4 h-4 text-gray-500" />}
          label="Total em NFs abertas"
          value={formatCurrency(openTotal)}
          valueClass="text-gray-900"
        />
        <SummaryStat
          icon={<Wallet className="w-4 h-4 text-[#0070f2]" />}
          label="Créditos disponíveis"
          value={formatCurrency(availableCredits)}
          valueClass="text-[#0070f2]"
        />
      </div>
    </div>
  );
}

function SummaryStat({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex flex-col">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <span className={`text-base font-bold tabular-nums mt-0.5 truncate ${valueClass}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function CashOutEvitadoWidget({
  monthlySaved,
  creditAvailable,
}: {
  monthlySaved: number;
  creditAvailable: number;
}) {
  const efficiency = creditAvailable > 0
    ? Math.min(100, Math.round((monthlySaved / creditAvailable) * 100))
    : 0;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <TrendUp size={22} className="text-emerald-600" weight="bold" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Cash Out Evitado · Este mês
            </p>
            <p className="text-3xl font-bold text-emerald-600 tabular-nums leading-tight mt-1">
              {formatCurrency(monthlySaved)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Valor economizado via créditos vinculados, sem desembolso financeiro.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[180px]">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900 tabular-nums">{efficiency}%</span>
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Eficiência
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500"
              style={{ width: `${efficiency}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type StepKey = 'created' | 'linked' | 'review' | 'settlement';

const STEPPER_STEPS: { key: StepKey; label: string; icon: React.ComponentType<any> }[] = [
  { key: 'created', label: 'Criado', icon: FileText },
  { key: 'linked', label: 'Créditos Vinculados', icon: LinkSimple },
  { key: 'review', label: 'Revisado pelo Fornecedor', icon: ChatsCircle },
  { key: 'settlement', label: 'Pronto p/ Liquidação', icon: PhCheckCircle },
];

function AgreementStepper({ currentStep }: { currentStep: StepKey }) {
  const currentIdx = STEPPER_STEPS.findIndex((s) => s.key === currentStep);
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4">
      <div className="flex items-center justify-between gap-2">
        {STEPPER_STEPS.map((step, idx) => {
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const Icon = step.icon;
          return (
            <React.Fragment key={step.key}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600'
                      : isCurrent
                        ? 'bg-[#0070f2] text-white shadow-sm ring-4 ring-[#0070f2]/15'
                        : 'bg-gray-50 border border-gray-200 text-gray-400'
                  }`}
                >
                  <Icon size={16} weight={isDone || isCurrent ? 'fill' : 'regular'} />
                </div>
                <div className="min-w-0 hidden sm:block">
                  <p
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isCurrent ? 'text-[#0070f2]' : isDone ? 'text-emerald-700' : 'text-gray-400'
                    }`}
                  >
                    Passo {idx + 1}
                  </p>
                  <p
                    className={`text-xs font-semibold truncate ${
                      isCurrent ? 'text-gray-900' : isDone ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
              {idx < STEPPER_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 rounded-full ${
                    idx < currentIdx ? 'bg-emerald-400' : 'bg-gray-100'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
