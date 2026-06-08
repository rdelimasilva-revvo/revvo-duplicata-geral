import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronRight,
  Building2,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Inbox,
  ArrowUpRight,
  ArrowLeftRight,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '../utils';
import { useProposalChannel } from '../communication';

interface RevisaoAcordosDashboardProps {
  onOpenProposal: (code: string) => void;
  onOpenSync?: () => void;
  onBack?: () => void;
}

interface Proposal {
  id: string;
  code: string;
  origin_company: string;
  title: string;
  message: string;
  total_original: number;
  total_discount: number;
  invoices_count: number;
  status: 'pending' | 'approved' | 'refused' | 'expired';
  sent_at: string;
  deadline: string | null;
}

type FilterStatus = 'all' | 'pending' | 'approved' | 'refused' | 'expired';

const STATUS_FILTERS: { id: FilterStatus; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'approved', label: 'Aprovados' },
  { id: 'refused', label: 'Recusados' },
  { id: 'expired', label: 'Expirados' },
];

export function RevisaoAcordosDashboard({ onOpenProposal, onOpenSync, onBack }: RevisaoAcordosDashboardProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [search, setSearch] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);

      const nowIso = new Date().toISOString();
      await supabase
        .from('agreement_proposals')
        .update({ status: 'expired' })
        .eq('status', 'pending')
        .not('deadline', 'is', null)
        .lt('deadline', nowIso);

      const { data, error } = await supabase
        .from('agreement_proposals')
        .select('*')
        .order('sent_at', { ascending: false });
      if (cancelled) return;
      if (error) {
        setError(error.message);
      } else {
        setProposals((data ?? []) as Proposal[]);
        setError(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    const onFocus = () => setReloadKey((k) => k + 1);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const events = useProposalChannel();

  useEffect(() => {
    if (!events.length) return;
    setProposals((current) => {
      let changed = false;
      const next = current.map((p) => {
        const decided = events.find(
          (e) => e.event_type === 'proposal:decided' && e.proposal_code === p.code,
        );
        if (!decided) return p;
        const decision = (decided.payload as { decision?: string }).decision;
        if (decision !== 'approved' && decision !== 'refused') return p;
        if (p.status === decision) return p;
        changed = true;
        return { ...p, status: decision };
      });
      return changed ? next : current;
    });
  }, [events]);

  const searchScoped = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return proposals;
    return proposals.filter(
      (p) =>
        p.code.toLowerCase().includes(term) ||
        p.origin_company.toLowerCase().includes(term) ||
        p.title.toLowerCase().includes(term),
    );
  }, [proposals, search]);

  const counts = useMemo(() => {
    const totals = {
      all: searchScoped.length,
      pending: 0,
      approved: 0,
      refused: 0,
      expired: 0,
      pendingDiscount: 0,
    };
    for (const p of searchScoped) {
      totals[p.status] += 1;
      if (p.status === 'pending') totals.pendingDiscount += Number(p.total_discount) || 0;
    }
    return totals;
  }, [searchScoped]);

  const filtered = useMemo(() => {
    if (filter === 'all') return searchScoped;
    return searchScoped.filter((p) => p.status === filter);
  }, [searchScoped, filter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <nav aria-label="Breadcrumb" className="flex items-center text-xs text-gray-500">
              <span>Portal</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400" />
              <span>Acordos</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400" />
              <span className="text-gray-700 font-medium">Revisão de Propostas</span>
            </nav>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                Revisão de Propostas de Acordo
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Acompanhe todos os pedidos recebidos e revise cada proposta individualmente.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {onOpenSync && (
                <button
                  type="button"
                  onClick={onOpenSync}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  NFs e Pagamentos
                </button>
              )}
              <span className="text-xs text-gray-500">
                {search.trim()
                  ? `${searchScoped.length} de ${proposals.length} propostas`
                  : `${proposals.length} propostas no total`}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            icon={<Clock className="w-4 h-4" />}
            label="Aguardando revisão"
            value={String(counts.pending)}
            tone="amber"
            active={filter === 'pending'}
            onClick={() => setFilter((f) => (f === 'pending' ? 'all' : 'pending'))}
            footnote={
              counts.pendingDiscount
                ? `${formatCurrency(counts.pendingDiscount)} em descontos a decidir`
                : 'Nenhuma decisão pendente'
            }
          />
          <KpiCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Aprovados"
            value={String(counts.approved)}
            tone="emerald"
            active={filter === 'approved'}
            onClick={() => setFilter((f) => (f === 'approved' ? 'all' : 'approved'))}
          />
          <KpiCard
            icon={<XCircle className="w-4 h-4" />}
            label="Recusados"
            value={String(counts.refused)}
            tone="rose"
            active={filter === 'refused'}
            onClick={() => setFilter((f) => (f === 'refused' ? 'all' : 'refused'))}
          />
          <KpiCard
            icon={<AlertCircle className="w-4 h-4" />}
            label="Expirados"
            value={String(counts.expired)}
            tone="gray"
            active={filter === 'expired'}
            onClick={() => setFilter((f) => (f === 'expired' ? 'all' : 'expired'))}
          />
        </section>

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {STATUS_FILTERS.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`px-3 h-8 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, fornecedor ou título"
                className="w-full pl-9 pr-3 h-9 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 placeholder:text-gray-400"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-gray-500">Carregando propostas...</div>
          ) : error ? (
            <div className="p-10 text-center text-sm text-red-600">
              Não foi possível carregar as propostas: {error}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState filter={filter} hasSearch={search.trim().length > 0} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                    <Th>Código</Th>
                    <Th>Origem</Th>
                    <Th>Título</Th>
                    <Th>Recebida</Th>
                    <Th>Prazo</Th>
                    <Th align="right">Valor original</Th>
                    <Th align="right">Desconto</Th>
                    <Th>Status</Th>
                    <Th align="right">Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors"
                    >
                      <Td>
                        <span className="font-mono text-gray-900 font-semibold">#{p.code}</span>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-gray-800">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          {p.origin_company}
                        </span>
                      </Td>
                      <Td>
                        <span className="text-gray-700">{p.title}</span>
                      </Td>
                      <Td>
                        <span className="inline-flex items-center gap-1.5 text-gray-600">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(p.sent_at)}
                        </span>
                      </Td>
                      <Td>
                        <DeadlineCell deadline={p.deadline} status={p.status} />
                      </Td>
                      <Td align="right">
                        <span className="tabular-nums text-gray-700">
                          {formatCurrency(Number(p.total_original))}
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="tabular-nums font-semibold text-emerald-700">
                          - {formatCurrency(Number(p.total_discount))}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge status={p.status} />
                      </Td>
                      <Td align="right">
                        <button
                          type="button"
                          onClick={() => onOpenProposal(p.code)}
                          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          {p.status === 'pending' ? 'Revisar' : 'Visualizar'}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  footnote,
  tone,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  footnote?: string;
  tone: 'amber' | 'emerald' | 'rose' | 'gray';
  active?: boolean;
  onClick?: () => void;
}) {
  const palette = {
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    gray: 'bg-gray-100 text-gray-600 border-gray-200',
  }[tone];
  const interactive = typeof onClick === 'function';
  const baseCls = `text-left w-full bg-white border rounded-lg shadow-sm p-5 transition-colors ${
    active ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
  } ${interactive ? 'hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300' : ''}`;
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
          {label}
        </p>
        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md border ${palette}`}>
          {icon}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums leading-tight">{value}</p>
      {footnote && <p className="text-xs text-gray-500 mt-2">{footnote}</p>}
    </>
  );
  if (interactive) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={baseCls}
      >
        {content}
      </button>
    );
  }
  return <div className={baseCls}>{content}</div>;
}

function StatusBadge({ status }: { status: Proposal['status'] }) {
  const config = {
    pending: { label: 'Pendente', cls: 'bg-amber-50 text-amber-800 border-amber-200', dot: 'bg-amber-500' },
    approved: { label: 'Aprovado', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    refused: { label: 'Recusado', cls: 'bg-rose-50 text-rose-800 border-rose-200', dot: 'bg-rose-500' },
    expired: { label: 'Expirado', cls: 'bg-gray-100 text-gray-700 border-gray-200', dot: 'bg-gray-400' },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${config.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function DeadlineCell({
  deadline,
  status,
}: {
  deadline: string | null;
  status: Proposal['status'];
}) {
  if (!deadline) return <span className="text-gray-400">—</span>;
  const date = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const overdue = daysLeft < 0;
  const isPending = status === 'pending';
  return (
    <div className="flex flex-col">
      <span className="text-gray-700">{formatDate(deadline)}</span>
      {isPending && (
        <span
          className={`text-[11px] mt-0.5 ${
            overdue ? 'text-rose-600 font-semibold' : daysLeft <= 2 ? 'text-amber-600 font-semibold' : 'text-gray-500'
          }`}
        >
          {overdue
            ? `Vencido há ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? 'dia' : 'dias'}`
            : `${daysLeft} ${daysLeft === 1 ? 'dia restante' : 'dias restantes'}`}
        </span>
      )}
    </div>
  );
}

function EmptyState({ filter, hasSearch }: { filter: FilterStatus; hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">Nenhuma proposta encontrada</h3>
      <p className="text-xs text-gray-500 mt-1 max-w-md">
        {hasSearch
          ? 'Não encontramos propostas que correspondam à sua busca. Ajuste o termo ou limpe os filtros.'
          : filter === 'all'
            ? 'Quando seus parceiros enviarem novas propostas, elas aparecerão aqui.'
            : 'Nenhuma proposta neste status no momento.'}
      </p>
    </div>
  );
}

function Th({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  const cls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return <th className={`px-4 py-2.5 font-semibold ${cls}`}>{children}</th>;
}

function Td({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  const cls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return <td className={`px-4 py-3 text-sm text-gray-700 ${cls}`}>{children}</td>;
}
