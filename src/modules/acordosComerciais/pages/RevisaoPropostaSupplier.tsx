import React, { useEffect, useMemo, useState } from 'react';
import {
  X as XIcon,
  MagnifyingGlass,
  CheckCircle,
  CurrencyCircleDollar,
  Ticket,
  Buildings,
  CalendarBlank,
  FileText,
  ChatCircleText,
  Receipt,
  ArrowsClockwise,
  ArrowsLeftRight,
  FilePdf,
  FileXls,
  FileArchive,
  ClockCounterClockwise,
  DownloadSimple,
  X as XCloseIcon,
  Warning,
  CaretDown,
  CaretRight,
  XCircle,
  Tag,
} from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';

interface Credit {
  id: string;
  label: string;
  origin: string;
  issuedAt: string;
  balance: number;
}

type Registradora = 'cerc' | 'b3';

interface Invoice {
  id: string;
  number: string;
  issuedAt: string;
  originalAmount: number;
  registradora: Registradora;
  origin: string;
  negotiatedWith?: string;
  discount: number;
  status: 'aberto' | 'pago';
}

interface Allocation {
  invoiceId: string;
  creditId: string;
  amount: number;
}

interface Proposal {
  code: string;
  supplierName: string;
  supplierCnpj: string;
  justification: string;
  totalDocuments: number;
  periods: { id: string; label: string }[];
  defaultPeriod: string;
  issuedAt: string;
}

interface AgreementDocGroupItem {
  id: string;
  name: string;
  sizeLabel: string;
  updatedAt: string;
}

interface AgreementDocGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: 'fill' | 'bold' | 'duotone' | 'regular' }>;
  accent: string;
  items: AgreementDocGroupItem[];
}

const MOCK_PROPOSAL: Proposal = {
  code: 'PRP-2026-0501',
  supplierName: 'Indústria Alfa Têxtil Ltda.',
  supplierCnpj: '12.345.678/0001-99',
  justification:
    'Proposta de abatimento sobre duplicatas em aberto referentes ao 2º trimestre — alinhada ao contrato comercial vigente.',
  totalDocuments: 8,
  periods: [
    { id: '2026-q2', label: '2º Trimestre 2026' },
    { id: '2026-q1', label: '1º Trimestre 2026' },
    { id: '2025-q4', label: '4º Trimestre 2025' },
  ],
  defaultPeriod: '2026-q2',
  issuedAt: '2026-05-02',
};

const MOCK_CREDITS: Credit[] = [
  { id: 'NC-7721', label: 'Nota de Crédito #7721', origin: 'Devolução lote 334', issuedAt: '2026-02-17', balance: 38500 },
  { id: 'NC-7802', label: 'Nota de Crédito #7802', origin: 'Bonificação Q1', issuedAt: '2026-03-01', balance: 25000 },
  { id: 'NC-7845', label: 'Nota de Crédito #7845', origin: 'Ajuste preço tabela', issuedAt: '2026-03-14', balance: 17400 },
  { id: 'NC-7891', label: 'Nota de Crédito #7891', origin: 'Devolução NF 81200', issuedAt: '2026-03-31', balance: 9800 },
  { id: 'NC-7904', label: 'Nota de Crédito #7904', origin: 'Acordo comercial 2025', issuedAt: '2026-04-09', balance: 54200 },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'NF-12091', number: '12.091', issuedAt: '2026-03-21', originalAmount: 20700, registradora: 'cerc', origin: 'Indústria Alfa Têxtil Ltda.', discount: 700, status: 'aberto' },
  { id: 'NF-12114', number: '12.114', issuedAt: '2026-03-25', originalAmount: 19200, registradora: 'cerc', origin: 'Indústria Alfa Têxtil Ltda.', negotiatedWith: 'Itaú BBA', discount: 0, status: 'aberto' },
  { id: 'NF-12137', number: '12.137', issuedAt: '2026-03-29', originalAmount: 19200, registradora: 'b3', origin: 'Indústria Alfa Têxtil Ltda.', discount: 540, status: 'aberto' },
  { id: 'NF-12160', number: '12.160', issuedAt: '2026-04-02', originalAmount: 19200, registradora: 'cerc', origin: 'Indústria Alfa Têxtil Ltda.', discount: 0, status: 'aberto' },
  { id: 'NF-12183', number: '12.183', issuedAt: '2026-04-06', originalAmount: 19200, registradora: 'b3', origin: 'Indústria Alfa Têxtil Ltda.', negotiatedWith: 'Santander', discount: 360, status: 'aberto' },
  { id: 'NF-12206', number: '12.206', issuedAt: '2026-04-10', originalAmount: 19200, registradora: 'cerc', origin: 'Indústria Alfa Têxtil Ltda.', discount: 0, status: 'pago' },
  { id: 'NF-12229', number: '12.229', issuedAt: '2026-04-14', originalAmount: 19200, registradora: 'b3', origin: 'Indústria Alfa Têxtil Ltda.', discount: 0, status: 'pago' },
  { id: 'NF-12252', number: '12.252', issuedAt: '2026-04-18', originalAmount: 19200, registradora: 'cerc', origin: 'Indústria Alfa Têxtil Ltda.', discount: 0, status: 'aberto' },
];

const DOC_GROUPS: AgreementDocGroup[] = [
  {
    id: 'contracts',
    label: 'Contratos e Acordos',
    icon: FilePdf,
    accent: 'text-rose-600 bg-rose-50',
    items: [
      { id: 'c1', name: 'Acordo Comercial - PRP-2026-0501.pdf', sizeLabel: '482 KB', updatedAt: '2026-05-02' },
      { id: 'c2', name: 'Termo Aditivo 02.pdf', sizeLabel: '221 KB', updatedAt: '2026-05-04' },
    ],
  },
  {
    id: 'sheets',
    label: 'Planilhas e Extratos',
    icon: FileXls,
    accent: 'text-emerald-600 bg-emerald-50',
    items: [
      { id: 's1', name: 'Extrato-Creditos-Q2.xlsx', sizeLabel: '98 KB', updatedAt: '2026-05-01' },
      { id: 's2', name: 'Duplicatas-Abertas-2026-04.xlsx', sizeLabel: '142 KB', updatedAt: '2026-05-01' },
    ],
  },
  {
    id: 'logs',
    label: 'Logs e Auditoria',
    icon: ClockCounterClockwise,
    accent: 'text-sky-600 bg-sky-50',
    items: [
      { id: 'l1', name: 'Log de aceite eletronico.txt', sizeLabel: '12 KB', updatedAt: '2026-05-03' },
      { id: 'l2', name: 'Historico de alteracoes.csv', sizeLabel: '34 KB', updatedAt: '2026-05-03' },
    ],
  },
];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface RevisaoPropostaSupplierProps {
  proposalCode?: string;
  onBack?: () => void;
  onOpenSync?: () => void;
}

type Decision = 'approve' | 'reject' | null;

export function RevisaoPropostaSupplier({ proposalCode, onBack, onOpenSync }: RevisaoPropostaSupplierProps) {
  const [period, setPeriod] = useState(MOCK_PROPOSAL.defaultPeriod);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [decision, setDecision] = useState<Decision>(null);
  const { showToast } = useToast();

  const propCode = proposalCode ?? MOCK_PROPOSAL.code;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('supplier_portal_credit_allocations')
        .select('invoice_id, credit_id, amount')
        .eq('proposal_code', propCode);
      if (cancelled || !data) return;
      setAllocations(
        data.map((r) => ({
          invoiceId: r.invoice_id,
          creditId: r.credit_id,
          amount: Number(r.amount ?? 0),
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [propCode]);

  const allocationsByInvoice = useMemo(() => {
    const map = new Map<string, Allocation[]>();
    allocations.forEach((a) => {
      const list = map.get(a.invoiceId) ?? [];
      list.push(a);
      map.set(a.invoiceId, list);
    });
    return map;
  }, [allocations]);

  const creditUsageById = useMemo(() => {
    const map = new Map<string, number>();
    allocations.forEach((a) => map.set(a.creditId, (map.get(a.creditId) ?? 0) + a.amount));
    return map;
  }, [allocations]);

  const totalOpen = MOCK_INVOICES.filter((i) => i.status === 'aberto').length;
  const totalPaid = MOCK_INVOICES.filter((i) => i.status === 'pago').length;
  const totalIssued = MOCK_INVOICES.length;
  const availableCredits = MOCK_CREDITS.reduce(
    (acc, c) => acc + Math.max(c.balance - (creditUsageById.get(c.id) ?? 0), 0),
    0,
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleLinkCredit = async (invoice: Invoice, credit: Credit) => {
    const creditRemaining = Math.max(credit.balance - (creditUsageById.get(credit.id) ?? 0), 0);
    const invoiceLinked = (allocationsByInvoice.get(invoice.id) ?? []).reduce((s, a) => s + a.amount, 0);
    const invoiceNet = Math.max(invoice.originalAmount - invoice.discount - invoiceLinked, 0);

    if (creditRemaining <= 0 || invoiceNet <= 0) return;
    if (creditRemaining < invoiceNet) {
      showToast('error', 'Crédito insuficiente', 'Escolha um crédito que cubra o saldo total da NF.');
      return;
    }

    const amount = invoiceNet;

    setAllocations((prev) => [...prev, { invoiceId: invoice.id, creditId: credit.id, amount }]);
    setActiveInvoice(null);
    showToast('success', `NF ${invoice.number} liquidada`, `Aplicado ${credit.label} integralmente.`);

    try {
      await supabase.from('supplier_portal_credit_allocations').insert({
        proposal_code: propCode,
        supplier_cnpj: MOCK_PROPOSAL.supplierCnpj.replace(/\D/g, ''),
        invoice_id: invoice.id,
        credit_id: credit.id,
        amount,
      });
    } catch {
      // offline fallback
    }
  };

  const handleDownloadAll = () => {
    showToast('success', 'Pacote de documentos gerado', 'Download iniciado.');
  };

  const handleApprove = () => {
    setDecision('approve');
    showToast('success', 'Acordo aprovado', 'O fluxo de assinatura foi iniciado.');
  };
  const handleReject = () => {
    setDecision('reject');
    showToast('error', 'Acordo recusado', 'Devolvido ao comprador.');
  };
  const handleSummary = () => {
    showToast('success', 'Resumo gerado', 'PDF disponível para download.');
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7] font-[Inter,system-ui,sans-serif] pb-24">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center"
              aria-label="Fechar"
            >
              <XCloseIcon size={16} weight="bold" />
            </button>
          )}
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 leading-tight">
              Revvo
            </p>
            <h1 className="text-sm font-semibold text-gray-900 leading-tight">Revisão de Acordo Comercial</h1>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          {onOpenSync && (
            <button
              type="button"
              onClick={onOpenSync}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
            >
              <ArrowsLeftRight size={14} weight="bold" />
              NFs e Pagamentos
            </button>
          )}
          <span className="flex items-center gap-2 text-xs text-gray-500">
            <CalendarBlank size={14} weight="bold" />
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>
      </header>

      <main className="w-full px-6 lg:px-10 py-6 space-y-5">
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Buildings size={14} weight="duotone" className="text-gray-400" />
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                  Fornecedor
                </p>
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight truncate">
                {MOCK_PROPOSAL.supplierName}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span className="font-mono font-semibold text-gray-700">#{propCode}</span>
                <span className="text-gray-300">·</span>
                <span className="tabular-nums">{MOCK_PROPOSAL.supplierCnpj}</span>
              </div>
            </div>

            <div className="min-w-0 lg:border-l lg:border-gray-100 lg:pl-8">
              <div className="flex items-center gap-2 mb-1.5">
                <CalendarBlank size={14} weight="duotone" className="text-gray-400" />
                <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                  Período
                </label>
              </div>
              <div className="relative">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 text-sm font-medium bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1]"
                >
                  {MOCK_PROPOSAL.periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ArrowsClockwise
                  size={14}
                  weight="bold"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Emitido em {formatDate(MOCK_PROPOSAL.issuedAt)} · válido até {formatDate('2026-06-30')}
              </p>
            </div>

            <div className="min-w-0 lg:border-l lg:border-gray-100 lg:pl-8">
              <div className="flex items-center gap-2 mb-1.5">
                <ChatCircleText size={14} weight="duotone" className="text-[#0A6ED1]" />
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                  Justificativa
                </p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{MOCK_PROPOSAL.justification}</p>
              <p className="mt-2 text-xs text-gray-500">
                Total de documentos:{' '}
                <span className="font-semibold text-gray-800">{MOCK_PROPOSAL.totalDocuments}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <PerformanceCard icon={Receipt} label="NF Emitidas" value={String(totalIssued)} caption="No período selecionado" />
          <PerformanceCard
            icon={CheckCircle}
            label="NF Pagas"
            value={String(totalPaid)}
            caption={`${totalIssued ? Math.round((totalPaid / totalIssued) * 100) : 0}% do total`}
            tone="positive"
          />
          <PerformanceCard icon={FileText} label="NF em Aberto" value={String(totalOpen)} caption="Aguardando liquidação" />
          <PerformanceCard
            icon={Ticket}
            label="Créditos Disponíveis"
            value={formatCurrency(availableCredits)}
            caption={`${MOCK_CREDITS.length} créditos ativos`}
            tone="highlight"
          />
        </section>

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Notas Fiscais</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Vincule um crédito para liquidar a NF — regra de liquidação completa aplicada.
              </p>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              {MOCK_INVOICES.length} itens
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-500 bg-gray-50/60">
                  <th className="w-8 px-2 py-3.5" />
                  <th className="text-left font-semibold px-4 py-3.5">NF / Emissão</th>
                  <th className="text-left font-semibold px-4 py-3.5">Origem</th>
                  <th className="text-right font-semibold px-4 py-3.5">Valor Original</th>
                  <th className="text-right font-semibold px-4 py-3.5">Abatimentos</th>
                  <th className="text-right font-semibold px-4 py-3.5">Saldo Final</th>
                  <th className="text-center font-semibold px-4 py-3.5">Status</th>
                  <th className="text-right font-semibold px-6 py-3.5">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_INVOICES.map((inv) => {
                  const invAllocations = allocationsByInvoice.get(inv.id) ?? [];
                  const linked = invAllocations.reduce((s, a) => s + a.amount, 0);
                  const totalAbatimentos = inv.discount + linked;
                  const balance = Math.max(inv.originalAmount - totalAbatimentos, 0);
                  const isPaid = inv.status === 'pago';
                  const isSettled = !isPaid && balance === 0 && totalAbatimentos > 0;
                  const isPartial = !isPaid && totalAbatimentos > 0 && balance > 0;
                  const status = isPaid
                    ? { label: 'Paga', className: 'bg-slate-100 text-slate-700 ring-slate-200' }
                    : isSettled
                      ? { label: 'Liquidada', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
                      : isPartial
                        ? { label: 'Parcial', className: 'bg-amber-50 text-amber-800 ring-amber-200' }
                        : { label: 'Em Aberto', className: 'bg-sky-50 text-sky-700 ring-sky-200' };

                  const hasMultipleAbatimentos =
                    (inv.discount > 0 ? 1 : 0) + invAllocations.length > 1;
                  const isOpen = expanded.has(inv.id);

                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-2 py-4 align-middle">
                          {totalAbatimentos > 0 && hasMultipleAbatimentos ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(inv.id)}
                              className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                              aria-label={isOpen ? 'Recolher' : 'Expandir'}
                            >
                              {isOpen ? <CaretDown size={12} weight="bold" /> : <CaretRight size={12} weight="bold" />}
                            </button>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="font-mono text-[13px] font-semibold text-gray-900">NF {inv.number}</div>
                          <div className="text-[11px] text-gray-500">{formatDate(inv.issuedAt)}</div>
                        </td>
                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-start gap-2 min-w-0">
                            <Buildings size={14} weight="duotone" className="text-gray-400 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <span className="block text-[13px] font-semibold text-gray-900 truncate">
                                {inv.origin}
                              </span>
                              {inv.negotiatedWith && (
                                <span className="block text-[11px] text-gray-400 truncate mt-0.5">
                                  via {inv.negotiatedWith}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums text-gray-700 align-middle">
                          {formatCurrency(inv.originalAmount)}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums align-middle">
                          {totalAbatimentos > 0 ? (
                            <span className="text-emerald-700 font-semibold">
                              − {formatCurrency(totalAbatimentos)}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums font-bold text-[#0A6ED1] align-middle">
                          {formatCurrency(balance)}
                        </td>
                        <td className="px-4 py-4 text-center align-middle">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right align-middle">
                          <button
                            type="button"
                            onClick={() => setActiveInvoice(inv)}
                            disabled={isPaid || balance === 0}
                            className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-semibold text-[#0A6ED1] bg-[#E8F2FD] hover:bg-[#D6E7FA] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Ticket size={13} weight="bold" />
                            Vincular
                          </button>
                        </td>
                      </tr>
                      {isOpen && totalAbatimentos > 0 && (
                        <tr className="bg-gray-50/40">
                          <td />
                          <td colSpan={7} className="px-4 py-3">
                            <div className="pl-6 border-l-2 border-emerald-300/60 space-y-2">
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                                Detalhamento de abatimentos
                              </p>
                              {inv.discount > 0 && (
                                <div className="flex items-center justify-between gap-3 text-xs">
                                  <span className="inline-flex items-center gap-2 text-gray-700">
                                    <span className="w-5 h-5 rounded bg-amber-50 text-amber-700 flex items-center justify-center">
                                      <Tag size={11} weight="fill" />
                                    </span>
                                    Desconto comercial
                                  </span>
                                  <span className="font-semibold text-emerald-700 tabular-nums">
                                    − {formatCurrency(inv.discount)}
                                  </span>
                                </div>
                              )}
                              {invAllocations.map((a) => {
                                const credit = MOCK_CREDITS.find((c) => c.id === a.creditId);
                                return (
                                  <div key={a.creditId} className="flex items-center justify-between gap-3 text-xs">
                                    <span className="inline-flex items-center gap-2 text-gray-700">
                                      <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                        <CurrencyCircleDollar size={11} weight="fill" />
                                      </span>
                                      {credit?.label ?? a.creditId}
                                      <span className="text-gray-400">· {credit?.origin ?? '—'}</span>
                                    </span>
                                    <span className="font-semibold text-emerald-700 tabular-nums">
                                      − {formatCurrency(a.amount)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Documentos do Acordo</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Contratos, extratos e trilha de auditoria vinculados a esta proposta.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadAll}
              className="inline-flex items-center gap-2 px-4 h-9 text-xs font-semibold text-white bg-[#0A6ED1] hover:bg-[#0855A8] rounded-md transition-colors"
            >
              <FileArchive size={14} weight="fill" />
              Baixar Tudo
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {DOC_GROUPS.map((group) => {
              const Icon = group.icon;
              return (
                <div key={group.id} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${group.accent}`}>
                      <Icon size={15} weight="fill" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-gray-900">{group.label}</p>
                      <p className="text-[11px] text-gray-500">{group.items.length} arquivos</p>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-2 group">
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] text-gray-800 truncate font-medium">{item.name}</p>
                          <p className="text-[11px] text-gray-500">
                            {item.sizeLabel} · Atualizado em {formatDate(item.updatedAt)}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Baixar ${item.name}`}
                          className="w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-[#0A6ED1] hover:bg-[#E8F2FD] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <DownloadSimple size={14} weight="bold" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-6px_20px_-8px_rgba(15,23,42,0.08)]">
        <div className="w-full px-6 lg:px-10 py-3 flex items-center justify-between gap-4">
          <div className="text-xs text-gray-500 hidden md:flex items-center gap-2">
            {decision === 'approve' ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <CheckCircle size={14} weight="fill" /> Acordo aprovado — assinatura em andamento.
              </span>
            ) : decision === 'reject' ? (
              <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium">
                <XCircle size={14} weight="fill" /> Acordo recusado e devolvido ao comprador.
              </span>
            ) : (
              <span>Revise os abatimentos antes de decidir. Ação visível para comprador e fornecedor.</span>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleSummary}
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <DownloadSimple size={15} weight="bold" />
              Baixar Resumo
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={decision !== null}
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold text-rose-700 border border-rose-300 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle size={15} weight="bold" />
              Recusar
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={decision !== null}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={15} weight="fill" />
              Aprovar Acordo
            </button>
          </div>
        </div>
      </footer>

      {activeInvoice && (
        <VincularCreditoModal
          invoice={activeInvoice}
          allocations={allocations}
          credits={MOCK_CREDITS}
          onClose={() => setActiveInvoice(null)}
          onConfirm={(credit) => handleLinkCredit(activeInvoice, credit)}
        />
      )}
    </div>
  );
}

interface PerformanceCardProps {
  icon: React.ComponentType<{ size?: number; weight?: 'regular' | 'fill' | 'bold' | 'duotone' }>;
  label: string;
  value: string;
  caption: string;
  tone?: 'default' | 'positive' | 'highlight';
}

function PerformanceCard({ icon: Icon, label, value, caption, tone = 'default' }: PerformanceCardProps) {
  const toneClasses =
    tone === 'highlight'
      ? 'border-[#0A6ED1]/30 ring-1 ring-[#0A6ED1]/15 bg-gradient-to-br from-[#F0F7FF] to-white'
      : 'border-gray-200 bg-white';
  const iconBg =
    tone === 'highlight'
      ? 'bg-[#0A6ED1] text-white'
      : tone === 'positive'
        ? 'bg-emerald-50 text-emerald-600'
        : 'bg-gray-100 text-gray-600';
  const valueColor = tone === 'highlight' ? 'text-[#0A6ED1]' : tone === 'positive' ? 'text-emerald-700' : 'text-gray-900';
  return (
    <div className={`border rounded-lg shadow-sm p-5 ${toneClasses}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon size={16} weight="fill" />
        </div>
        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">{label}</p>
      </div>
      <p className={`text-2xl font-bold tabular-nums leading-tight ${valueColor}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1.5">{caption}</p>
    </div>
  );
}

interface VincularCreditoModalProps {
  invoice: Invoice;
  allocations: Allocation[];
  credits: Credit[];
  onClose: () => void;
  onConfirm: (credit: Credit) => Promise<void> | void;
}

function VincularCreditoModal({ invoice, allocations, credits, onClose, onConfirm }: VincularCreditoModalProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const invoiceLinked = allocations
    .filter((a) => a.invoiceId === invoice.id)
    .reduce((s, a) => s + a.amount, 0);
  const invoiceNet = Math.max(invoice.originalAmount - invoice.discount - invoiceLinked, 0);

  const creditUsage = useMemo(() => {
    const map = new Map<string, number>();
    allocations.forEach((a) => map.set(a.creditId, (map.get(a.creditId) ?? 0) + a.amount));
    return map;
  }, [allocations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return credits;
    return credits.filter(
      (c) => c.label.toLowerCase().includes(q) || c.origin.toLowerCase().includes(q),
    );
  }, [credits, search]);

  const selected = selectedId ? credits.find((c) => c.id === selectedId) ?? null : null;
  const selectedRemaining = selected
    ? Math.max(selected.balance - (creditUsage.get(selected.id) ?? 0), 0)
    : 0;
  const canLiquidate = selected ? selectedRemaining >= invoiceNet : false;

  const confirm = async () => {
    if (!selected || !canLiquidate) return;
    setSubmitting(true);
    await onConfirm(selected);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[580px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-[modalIn_.2s_ease-out]">
        <header className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#E8F2FD] text-[#0A6ED1] flex items-center justify-center">
                <Ticket size={18} weight="duotone" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Vincular Crédito</h3>
            </div>
            <p className="text-xs text-gray-500">
              Abatendo{' '}
              <span className="font-semibold text-gray-900">NF {invoice.number}</span> · saldo a liquidar{' '}
              <span className="font-semibold tabular-nums text-[#0A6ED1]">
                {formatCurrency(invoiceNet)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </header>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar crédito por identificador ou origem"
              className="w-full h-10 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1]"
            />
          </div>
          <p className="mt-2 text-[11px] text-gray-500 flex items-start gap-1.5">
            <Warning size={12} weight="fill" className="text-amber-500 flex-shrink-0 mt-[1px]" />
            Regra do acordo: o crédito só pode ser vinculado se liquidar a NF por inteiro. Valores picados entre múltiplas notas não são permitidos.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-2 mb-1">
            Créditos Disponíveis
          </p>
          {filtered.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">Nenhum crédito encontrado.</div>
          )}
          {filtered.map((c) => {
            const used = creditUsage.get(c.id) ?? 0;
            const remaining = Math.max(c.balance - used, 0);
            const isSelected = selectedId === c.id;
            const insufficient = remaining < invoiceNet;
            const disabled = insufficient;
            return (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-[#0A6ED1] bg-[#E8F2FD]/60 shadow-[0_0_0_3px_rgba(10,110,209,0.1)]'
                    : disabled
                      ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-[#0A6ED1]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-[#0A6ED1] text-white' : 'bg-emerald-50 text-emerald-600'
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
                    <div
                      className={`text-[10px] font-semibold mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${
                        insufficient ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {insufficient ? 'Saldo insuficiente' : 'Liquida integralmente'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/60">
          {selected ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 mb-0.5">
                  Valor a ser aplicado
                </p>
                <p className="text-lg font-bold text-[#0A6ED1] tabular-nums">{formatCurrency(invoiceNet)}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {canLiquidate
                    ? 'A NF será liquidada integralmente; saldo remanescente do crédito permanece disponível.'
                    : 'Este crédito não possui saldo suficiente para liquidar a NF por inteiro.'}
                </p>
              </div>
              <button
                type="button"
                onClick={confirm}
                disabled={submitting || !canLiquidate}
                className="h-11 px-5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0A6ED1] hover:bg-[#0855A8] rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
              >
                <CheckCircle size={16} weight="fill" />
                Liquidar NF
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Selecione um crédito que cubra o saldo total da NF.</p>
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
