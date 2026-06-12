import { useEffect, useMemo, useRef, useState } from 'react';
import {
  X as XIcon,
  Search,
  CheckCircle2,
  CircleDollarSign,
  Ticket,
  Building2,
  Calendar,
  FileText,
  MessageSquareText,
  Zap,
  Receipt,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type RegistradoraId = 'cerc' | 'b3';

interface Credit {
  id: string;
  label: string;
  origin: string;
  issuedAt: string;
  balance: number;
}

interface Invoice {
  id: string;
  number: string;
  issuedAt: string;
  originalAmount: number;
  registradora: RegistradoraId;
  supplierOrigin: string;
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
}

const REGISTRADORA_LABEL: Record<RegistradoraId, string> = {
  cerc: 'CERC',
  b3: 'B3',
};

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
};

const MOCK_CREDITS: Credit[] = [
  { id: 'NC-7721', label: 'Nota de Crédito #7721', origin: 'Devolução lote 334', issuedAt: '2026-02-17', balance: 38500 },
  { id: 'NC-7802', label: 'Nota de Crédito #7802', origin: 'Bonificação Q1', issuedAt: '2026-03-01', balance: 25000 },
  { id: 'NC-7845', label: 'Nota de Crédito #7845', origin: 'Ajuste preço tabela', issuedAt: '2026-03-14', balance: 17400 },
  { id: 'NC-7891', label: 'Nota de Crédito #7891', origin: 'Devolução NF 81200', issuedAt: '2026-03-31', balance: 9800 },
  { id: 'NC-7904', label: 'Nota de Crédito #7904', origin: 'Acordo comercial 2025', issuedAt: '2026-04-09', balance: 54200 },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 'NF-12091', number: '12.091', issuedAt: '2026-03-21', originalAmount: 20700, registradora: 'cerc', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'aberto' },
  { id: 'NF-12114', number: '12.114', issuedAt: '2026-03-25', originalAmount: 19200, registradora: 'cerc', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'aberto' },
  { id: 'NF-12137', number: '12.137', issuedAt: '2026-03-29', originalAmount: 19200, registradora: 'b3', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'aberto' },
  { id: 'NF-12160', number: '12.160', issuedAt: '2026-04-02', originalAmount: 19200, registradora: 'cerc', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'aberto' },
  { id: 'NF-12183', number: '12.183', issuedAt: '2026-04-06', originalAmount: 19200, registradora: 'b3', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'aberto' },
  { id: 'NF-12206', number: '12.206', issuedAt: '2026-04-10', originalAmount: 19200, registradora: 'cerc', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'pago' },
  { id: 'NF-12229', number: '12.229', issuedAt: '2026-04-14', originalAmount: 19200, registradora: 'b3', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'pago' },
  { id: 'NF-12252', number: '12.252', issuedAt: '2026-04-18', originalAmount: 19200, registradora: 'cerc', supplierOrigin: 'Indústria Alfa Têxtil Ltda.', status: 'aberto' },
];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AcordosComerciaisPortal() {
  const [period, setPeriod] = useState(MOCK_PROPOSAL.defaultPeriod);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('supplier_portal_credit_allocations')
        .select('invoice_id, credit_id, amount')
        .eq('proposal_code', MOCK_PROPOSAL.code);
      if (cancelled || !data) return;
      setAllocations(
        data.map((row) => ({
          invoiceId: row.invoice_id,
          creditId: row.credit_id,
          amount: Number(row.amount ?? 0),
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
    allocations.forEach((a) => {
      map.set(a.creditId, (map.get(a.creditId) ?? 0) + a.amount);
    });
    return map;
  }, [allocations]);

  const totalOpen = MOCK_INVOICES.filter((i) => i.status === 'aberto').length;
  const totalPaid = MOCK_INVOICES.filter((i) => i.status === 'pago').length;
  const totalIssued = MOCK_INVOICES.length;
  const availableCredits = MOCK_CREDITS.reduce(
    (acc, c) => acc + Math.max(c.balance - (creditUsageById.get(c.id) ?? 0), 0),
    0,
  );

  const handleAddAllocation = async (invoiceId: string, creditId: string, amount: number) => {
    setAllocations((prev) => [...prev, { invoiceId, creditId, amount }]);
    try {
      await supabase.from('supplier_portal_credit_allocations').insert({
        proposal_code: MOCK_PROPOSAL.code,
        supplier_cnpj: MOCK_PROPOSAL.supplierCnpj.replace(/\D/g, ''),
        invoice_id: invoiceId,
        credit_id: creditId,
        amount,
      });
    } catch {
      // noop — mock/offline fallback
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F7]">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0A6ED1] text-white flex items-center justify-center font-bold text-sm">
            R
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Revvo · Portal do Fornecedor</p>
            <h1 className="text-sm font-semibold text-gray-900">Acordos Comerciais</h1>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} />
          Sessão ativa · {new Date().toLocaleDateString('pt-BR')}
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6 space-y-5">
        <section className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                Empresa Fornecedora
              </p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight truncate">
                {MOCK_PROPOSAL.supplierName}
              </h2>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <FileText size={13} className="text-gray-400" />
                <span className="font-mono font-semibold text-gray-700">#{MOCK_PROPOSAL.code}</span>
                <span className="text-gray-300">·</span>
                <span>CNPJ {MOCK_PROPOSAL.supplierCnpj}</span>
              </div>
            </div>

            <div className="min-w-0 lg:border-l lg:border-gray-100 lg:pl-8">
              <label className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5 block">
                Período
              </label>
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
                <RefreshCw
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-2">Filtra documentos e registros exibidos abaixo.</p>
            </div>

            <div className="min-w-0 lg:border-l lg:border-gray-100 lg:pl-8">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquareText size={14} className="text-[#0A6ED1]" />
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
          <PerformanceCard
            icon={Receipt}
            label="NF Emitidas"
            value={String(totalIssued)}
            caption="No período selecionado"
          />
          <PerformanceCard
            icon={CheckCircle2}
            label="NF Pagas"
            value={String(totalPaid)}
            caption={`${totalIssued ? Math.round((totalPaid / totalIssued) * 100) : 0}% do total`}
            tone="positive"
          />
          <PerformanceCard
            icon={FileText}
            label="NF em Aberto"
            value={String(totalOpen)}
            caption="Aguardando liquidação"
          />
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
                Vincule créditos para liquidar o saldo das NFs emitidas.
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
                  <th className="text-left font-semibold px-6 py-3">NF / Emissão</th>
                  <th className="text-left font-semibold px-4 py-3">Origem</th>
                  <th className="text-right font-semibold px-4 py-3">Valor Original</th>
                  <th className="text-right font-semibold px-4 py-3">Crédito Vinculado</th>
                  <th className="text-right font-semibold px-4 py-3">Saldo Final</th>
                  <th className="text-center font-semibold px-4 py-3">Registradora</th>
                  <th className="text-center font-semibold px-4 py-3">Status</th>
                  <th className="text-right font-semibold px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {MOCK_INVOICES.map((inv) => {
                  const invAllocations = allocationsByInvoice.get(inv.id) ?? [];
                  const linked = invAllocations.reduce((s, a) => s + a.amount, 0);
                  const balance = Math.max(inv.originalAmount - linked, 0);
                  const isPaid = inv.status === 'pago';
                  const isSettled = !isPaid && balance === 0 && linked > 0;
                  const isPartial = !isPaid && linked > 0 && balance > 0;
                  const statusLabel = isPaid
                    ? { label: 'Paga', className: 'bg-slate-100 text-slate-700 ring-slate-200' }
                    : isSettled
                      ? { label: 'Liquidada', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' }
                      : isPartial
                        ? { label: 'Parcial', className: 'bg-amber-50 text-amber-800 ring-amber-200' }
                        : { label: 'Em Aberto', className: 'bg-sky-50 text-sky-700 ring-sky-200' };
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-3.5 align-middle">
                        <div className="font-mono text-[13px] font-semibold text-gray-900">NF {inv.number}</div>
                        <div className="text-[11px] text-gray-500">{formatDate(inv.issuedAt)}</div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 size={14} className="text-gray-400" />
                          <span className="truncate max-w-[220px]">{inv.supplierOrigin}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-900 align-middle">
                        {formatCurrency(inv.originalAmount)}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums align-middle">
                        {linked > 0 ? (
                          <span className="text-emerald-700 font-semibold">- {formatCurrency(linked)}</span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums font-semibold text-gray-900 align-middle">
                        {formatCurrency(balance)}
                      </td>
                      <td className="px-4 py-3.5 text-center align-middle">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-gray-100 text-gray-700">
                          {REGISTRADORA_LABEL[inv.registradora]}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold rounded-full ring-1 ${statusLabel.className}`}
                        >
                          {statusLabel.label}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right align-middle">
                        <button
                          type="button"
                          onClick={() => setActiveInvoice(inv)}
                          disabled={isPaid || balance === 0}
                          className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-semibold text-[#0A6ED1] bg-[#E8F2FD] hover:bg-[#D6E7FA] rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Ticket size={13} />
                          Vincular
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {activeInvoice && (
        <VincularCreditoModal
          invoice={activeInvoice}
          allocations={allocations}
          credits={MOCK_CREDITS}
          onClose={() => setActiveInvoice(null)}
          onConfirm={async (creditId, amount) => {
            await handleAddAllocation(activeInvoice.id, creditId, amount);
            setActiveInvoice(null);
          }}
        />
      )}
    </div>
  );
}

interface PerformanceCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
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
          <Icon size={16} />
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
  onConfirm: (creditId: string, amount: number) => Promise<void> | void;
}

function VincularCreditoModal({ invoice, allocations, credits, onClose, onConfirm }: VincularCreditoModalProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  const linkedOnInvoice = allocations
    .filter((a) => a.invoiceId === invoice.id)
    .reduce((s, a) => s + a.amount, 0);
  const invoiceRemaining = Math.max(invoice.originalAmount - linkedOnInvoice, 0);

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

  const amountNumber = Number((amount || '').replace(/\./g, '').replace(',', '.'));
  const amountValid =
    !Number.isNaN(amountNumber) &&
    amountNumber > 0 &&
    amountNumber <= selectedRemaining &&
    amountNumber <= invoiceRemaining;

  const canSettleFully = selected ? selectedRemaining >= invoiceRemaining : false;
  const wouldBePartial = selected && amountValid && amountNumber < invoiceRemaining && canSettleFully;

  const selectCredit = (credit: Credit) => {
    const remaining = Math.max(credit.balance - (creditUsage.get(credit.id) ?? 0), 0);
    setSelectedId(credit.id);
    const defaultAmount = Math.min(remaining, invoiceRemaining);
    setAmount(defaultAmount.toString().replace('.', ','));
    setWarning(null);
  };

  const handleLiquidateAll = () => {
    if (!selected) return;
    setAmount(invoiceRemaining.toString().replace('.', ','));
    setWarning(null);
  };

  const handleConfirm = async () => {
    if (!selected || !amountValid) return;
    if (wouldBePartial) {
      setWarning(
        'Existe saldo suficiente para liquidar totalmente esta NF. Use "Liquidar Total" para evitar distribuições parciais desnecessárias.',
      );
      return;
    }
    setSubmitting(true);
    await onConfirm(selected.id, amountNumber);
    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        className="relative w-full max-w-[560px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-[modalIn_.2s_ease-out]"
      >
        <header className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#E8F2FD] text-[#0A6ED1] flex items-center justify-center">
                <Ticket size={18} />
              </div>
              <h3 className="text-base font-semibold text-gray-900">Vincular Crédito</h3>
            </div>
            <p className="text-xs text-gray-500">
              Abatendo{' '}
              <span className="font-semibold text-gray-900">NF {invoice.number}</span> · saldo{' '}
              <span className="font-semibold tabular-nums text-gray-900">
                {formatCurrency(invoiceRemaining)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <XIcon size={18} />
          </button>
        </header>

        <div className="px-6 py-4 border-b border-gray-100">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar crédito por identificador ou origem"
              className="w-full h-10 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1]"
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
            const used = creditUsage.get(c.id) ?? 0;
            const remaining = Math.max(c.balance - used, 0);
            const isSelected = selectedId === c.id;
            const disabled = remaining <= 0;
            return (
              <button
                key={c.id}
                type="button"
                disabled={disabled}
                onClick={() => selectCredit(c)}
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
                      <CircleDollarSign size={16} />
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Valor de abatimento
            </label>
            {selected && canSettleFully && (
              <button
                type="button"
                onClick={handleLiquidateAll}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0A6ED1] hover:text-[#0855A8]"
              >
                <Zap size={12} />
                Liquidar Total ({formatCurrency(invoiceRemaining)})
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value.replace(/[^\d.,]/g, ''));
                  setWarning(null);
                }}
                disabled={!selected}
                placeholder="0,00"
                className="w-full h-11 pl-9 pr-3 text-sm font-semibold tabular-nums bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A6ED1]/20 focus:border-[#0A6ED1] disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!amountValid || submitting}
              className="h-11 px-5 inline-flex items-center gap-2 text-sm font-semibold text-white bg-[#0A6ED1] hover:bg-[#0855A8] rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={16} />
              Aplicar
            </button>
          </div>
          {warning && (
            <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5">
              {warning}
            </p>
          )}
          {selected && !warning && (
            <p className="mt-2 text-[11px] text-gray-500">
              Disponível no crédito:{' '}
              <span className="font-semibold text-gray-700 tabular-nums">
                {formatCurrency(selectedRemaining)}
              </span>{' '}
              · Saldo da NF:{' '}
              <span className="font-semibold text-gray-700 tabular-nums">
                {formatCurrency(invoiceRemaining)}
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
