import { useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  Download,
  X as XIcon,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Landmark,
  Clock,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { useSupplierPortalStore } from './store';
import type { PaymentStatus, SupplierPayment } from './types';

const STATUS_META: Record<PaymentStatus, { label: string; dot: string; pill: string }> = {
  settled: {
    label: 'Liquidado',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  scheduled: {
    label: 'Agendado',
    dot: 'bg-sky-500',
    pill: 'bg-sky-50 text-sky-700 ring-sky-200',
  },
  pending: {
    label: 'Pendente',
    dot: 'bg-slate-400',
    pill: 'bg-slate-100 text-slate-700 ring-slate-200',
  },
  failed: {
    label: 'Falhou',
    dot: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  action_required: {
    label: 'Ação necessária',
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
};

const STATUS_FILTERS: { id: PaymentStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'settled', label: 'Liquidados' },
  { id: 'scheduled', label: 'Agendados' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'action_required', label: 'Ação' },
  { id: 'failed', label: 'Falhou' },
];

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR');
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function formatCnpj(cnpj: string) {
  const d = cnpj.replace(/\D/g, '').padStart(14, '0').slice(-14);
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export default function SupplierPortalPage() {
  const {
    payments,
    loading,
    error,
    filters,
    selectedId,
    fetchPayments,
    setFilters,
    selectPayment,
  } = useSupplierPortalStore();

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return payments.filter((p) => {
      if (filters.status !== 'all' && p.status !== filters.status) return false;
      if (!q) return true;
      return (
        p.invoiceNumber.toLowerCase().includes(q) ||
        p.companyName.toLowerCase().includes(q) ||
        p.destinationBank.toLowerCase().includes(q)
      );
    });
  }, [payments, filters]);

  const stats = useMemo(() => {
    let totalReceivable = 0;
    let settledCount = 0;
    let settledTotal = 0;
    let actionsNeeded = 0;
    for (const p of payments) {
      if (p.status === 'settled') {
        settledCount += 1;
        settledTotal += p.netValue;
      } else if (p.status === 'action_required' || p.status === 'failed') {
        actionsNeeded += 1;
        totalReceivable += p.netValue;
      } else {
        totalReceivable += p.netValue;
      }
    }
    return { totalReceivable, settledCount, settledTotal, actionsNeeded };
  }, [payments]);

  const selected = useMemo(
    () => (selectedId ? payments.find((p) => p.id === selectedId) ?? null : null),
    [selectedId, payments],
  );

  return (
    <div
      className="h-screen w-full flex flex-col bg-slate-50"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif' }}
    >
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-3 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Portal do Fornecedor
              </p>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                Pagamentos e liquidações
              </h1>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <label className="relative flex-1 min-w-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                placeholder="Buscar por NF, sacado ou banco..."
                className="w-full h-9 pl-8 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                aria-label="Buscar pagamentos"
              />
            </label>

            <div
              role="tablist"
              aria-label="Filtrar por status"
              className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-50 p-1 border border-slate-200"
            >
              {STATUS_FILTERS.map((s) => {
                const active = filters.status === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFilters({ status: s.id })}
                    className={`whitespace-nowrap h-7 px-3 rounded-lg text-[11px] font-semibold transition-colors ${
                      active
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <StatCard
              icon={<Receipt size={16} />}
              tone="sky"
              label="Total a Receber"
              value={formatCurrency(stats.totalReceivable)}
              hint={`${payments.length - stats.settledCount} faturas abertas`}
            />
            <StatCard
              icon={<CheckCircle2 size={16} />}
              tone="emerald"
              label="Pagamentos Concluídos"
              value={formatCurrency(stats.settledTotal)}
              hint={`${stats.settledCount} liquidadas`}
            />
            <StatCard
              icon={<AlertTriangle size={16} />}
              tone="amber"
              label="Ações Necessárias"
              value={String(stats.actionsNeeded)}
              hint="Divergências e falhas"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 py-4">
          {error && (
            <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Não foi possível carregar os pagamentos: {error}
            </div>
          )}

          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200">
                <tr className="text-left">
                  <Th>NF</Th>
                  <Th>Sacado</Th>
                  <Th className="text-right">Valor líquido</Th>
                  <Th>Status</Th>
                  <Th>Domicílio</Th>
                  <Th className="text-right pr-4">Ações</Th>
                </tr>
              </thead>
              <tbody>
                {loading && payments.length === 0 ? (
                  <SkeletonRows />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-xs text-slate-400">
                      Nenhum pagamento encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <DesktopRow
                      key={p.id}
                      p={p}
                      onOpen={() => selectPayment(p.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-2">
            {loading && payments.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-10">Carregando…</div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-10">
                Nenhum pagamento encontrado.
              </div>
            ) : (
              filtered.map((p) => <MobileCard key={p.id} p={p} onOpen={() => selectPayment(p.id)} />)
            )}
          </div>
        </div>
      </main>

      <DetailsDrawer payment={selected} onClose={() => selectPayment(null)} />
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={`text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-2.5 ${className}`}
    >
      {children}
    </th>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone: 'sky' | 'emerald' | 'amber';
}) {
  const palette = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }[tone];
  return (
    <div className="rounded-xl bg-white border border-slate-200 px-3 py-2.5 flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${palette}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-base font-bold text-slate-900 tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] text-slate-500 truncate">{hint}</p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100 last:border-0">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-3 py-3">
              <div className="h-3 rounded bg-slate-100 animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function DesktopRow({ p, onOpen }: { p: SupplierPayment; onOpen: () => void }) {
  const meta = STATUS_META[p.status];
  return (
    <tr
      tabIndex={0}
      role="button"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 focus:bg-sky-50/60 focus:outline-none cursor-pointer transition-colors"
    >
      <td className="px-3 py-2.5 align-middle">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-900 tabular-nums text-[13px]">
            {p.invoiceNumber}
          </span>
        </div>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {formatDate(p.issueDate)} <span className="text-slate-300">›</span> {formatDate(p.dueDate)}
        </p>
      </td>
      <td className="px-3 py-2.5 align-middle">
        <p className="text-[13px] font-semibold text-slate-900 truncate max-w-[200px]">
          {p.companyName}
        </p>
        <p className="text-[10px] text-slate-500 font-mono">{formatCnpj(p.companyCnpj)}</p>
      </td>
      <td className="px-3 py-2.5 align-middle text-right">
        <span className="text-[14px] font-bold text-slate-900 tabular-nums">
          {formatCurrency(p.netValue)}
        </span>
      </td>
      <td className="px-3 py-2.5 align-middle">
        <span
          className={`inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[10px] font-semibold ring-1 ${meta.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} aria-hidden />
          {meta.label}
        </span>
      </td>
      <td className="px-3 py-2.5 align-middle">
        <div className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-[9px] font-bold text-slate-700">
            {p.destinationBankCode}
          </span>
          <span className="text-[12px] font-semibold text-slate-700">{p.destinationBank}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 align-middle text-right pr-3">
        <div className="inline-flex items-center gap-1">
          <IconAction
            label="Ver detalhes"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
          >
            <Eye size={14} />
          </IconAction>
          <IconAction
            label="Baixar comprovante"
            disabled={p.status !== 'settled'}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Download size={14} />
          </IconAction>
        </div>
      </td>
    </tr>
  );
}

function IconAction({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-500 hover:text-sky-700 hover:bg-sky-50 disabled:text-slate-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
    >
      {children}
    </button>
  );
}

function MobileCard({ p, onOpen }: { p: SupplierPayment; onOpen: () => void }) {
  const meta = STATUS_META[p.status];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl bg-white border border-slate-200 px-3 py-3 shadow-sm active:scale-[0.99] transition-transform"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-900 tabular-nums">{p.invoiceNumber}</p>
          <p className="text-[12px] font-semibold text-slate-800 truncate">{p.companyName}</p>
          <p className="text-[10px] text-slate-500 font-mono truncate">
            {formatCnpj(p.companyCnpj)}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 h-6 px-2 rounded-full text-[10px] font-semibold ring-1 ${meta.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} aria-hidden />
          {meta.label}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3 mt-2 pt-2 border-t border-slate-100">
        <div className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-[9px] font-bold text-slate-700">
            {p.destinationBankCode}
          </span>
          <span className="text-[11px] font-semibold text-slate-700">{p.destinationBank}</span>
        </div>
        <span className="text-[15px] font-bold text-slate-900 tabular-nums">
          {formatCurrency(p.netValue)}
        </span>
      </div>
    </button>
  );
}

function DetailsDrawer({
  payment,
  onClose,
}: {
  payment: SupplierPayment | null;
  onClose: () => void;
}) {
  const open = !!payment;
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-40 flex items-center justify-center p-4 transition-opacity duration-200 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-[1px]" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do pagamento"
        className={`relative w-full max-w-[520px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-200 ${
          open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {payment && (
          <>
            <header className="shrink-0 border-b border-slate-200 px-5 py-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Duplicata
                </p>
                <h2 className="text-base font-bold text-slate-900 tabular-nums">
                  {payment.invoiceNumber}
                </h2>
                <p className="text-xs text-slate-500 truncate mt-0.5">{payment.companyName}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar detalhes"
                className="inline-flex items-center justify-center w-8 h-8 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <XIcon size={16} />
              </button>
            </header>

            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5">
              <section className="grid grid-cols-2 gap-2">
                <InfoTile
                  icon={<Receipt size={14} />}
                  label="Valor líquido"
                  value={formatCurrency(payment.netValue)}
                />
                <InfoTile
                  icon={<Clock size={14} />}
                  label="Vencimento"
                  value={formatDate(payment.dueDate)}
                />
                <InfoTile
                  icon={<Building2 size={14} />}
                  label="CNPJ Sacado"
                  value={formatCnpj(payment.companyCnpj)}
                  mono
                />
                <InfoTile
                  icon={<CheckCircle2 size={14} />}
                  label="Liquidação"
                  value={formatDate(payment.settlementDate)}
                />
              </section>

              <section>
                <SectionTitle icon={<Landmark size={13} />}>Domicílio bancário</SectionTitle>
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">
                      {payment.destinationBankCode}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {payment.destinationBank}
                    </span>
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <dt className="text-slate-400 uppercase tracking-wider text-[9px] font-semibold">
                        Agência
                      </dt>
                      <dd className="font-mono text-slate-800">{payment.destinationAgency || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400 uppercase tracking-wider text-[9px] font-semibold">
                        Conta
                      </dt>
                      <dd className="font-mono text-slate-800">{payment.destinationAccount || '—'}</dd>
                    </div>
                  </dl>
                </div>
              </section>

              <section>
                <SectionTitle icon={<Clock size={13} />}>
                  Timeline de liquidação
                </SectionTitle>
                {payment.timeline.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum evento registrado.</p>
                ) : (
                  <ol className="relative border-l-2 border-slate-100 pl-4 space-y-3">
                    {payment.timeline.map((t, idx) => (
                      <li key={idx} className="relative">
                        <span className="absolute -left-[22px] top-1 w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-white" />
                        <p className="text-[10px] text-slate-400 tabular-nums">
                          {formatDateTime(t.ts)}
                        </p>
                        <p className="text-[12px] font-semibold text-slate-800">{t.label}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section>
                <SectionTitle icon={<ShieldCheck size={13} />}>
                  Logs CERC
                </SectionTitle>
                <RegistrarList entries={payment.cercLog} empty="Sem registros CERC." />
              </section>

              <section>
                <SectionTitle icon={<ShieldCheck size={13} />}>
                  Logs TAG
                </SectionTitle>
                <RegistrarList entries={payment.tagLog} empty="Sem registros TAG." />
              </section>

              {payment.notes && (
                <section className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 mb-1">
                    Observação
                  </p>
                  <p className="text-xs text-amber-900 leading-relaxed">{payment.notes}</p>
                </section>
              )}
            </div>

            <footer className="shrink-0 border-t border-slate-200 px-5 py-3 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-400">
                Feche pelo ícone
                <span className="mx-1 inline-flex items-center justify-center w-4 h-4 rounded-sm bg-slate-100">
                  <XIcon size={10} />
                </span>
                no topo.
              </span>
              <button
                type="button"
                disabled={payment.status !== 'settled'}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                <Download size={13} />
                Comprovante
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
      <span className="text-slate-400">{icon}</span>
      {children}
    </h3>
  );
}

function InfoTile({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <span className="text-slate-400">{icon}</span>
        {label}
      </p>
      <p
        className={`mt-0.5 text-[13px] font-bold text-slate-900 tabular-nums ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </p>
    </div>
  );
}

function RegistrarList({
  entries,
  empty,
}: {
  entries: { ts: string; event: string; ref: string }[];
  empty: string;
}) {
  if (entries.length === 0) {
    return <p className="text-xs text-slate-400">{empty}</p>;
  }
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
      {entries.map((e, idx) => (
        <li key={idx} className="px-3 py-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-800 truncate">{e.event}</p>
            <p className="text-[10px] text-slate-400 tabular-nums">{formatDateTime(e.ts)}</p>
          </div>
          <span className="shrink-0 text-[10px] font-mono text-slate-500 bg-slate-50 rounded px-1.5 py-0.5 border border-slate-200">
            {e.ref}
          </span>
        </li>
      ))}
    </ul>
  );
}
