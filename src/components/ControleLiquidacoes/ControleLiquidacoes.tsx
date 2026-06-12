import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Filter,
  ChevronUp,
  ChevronDown,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  MoreHorizontal,
  Eye,
  Bell,
  Landmark,
  ArrowRightLeft,
  ShieldCheck,
  FileCheck2,
  Building2,
  Zap,
  UserCheck,
  HelpCircle,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSacador } from '@/context/SacadorContext';
import { formatCNPJ } from '@/utils/formatters';
import { Button, Tooltip } from '@/components/ui';
import { LiquidacaoPanel } from './LiquidacaoPanel';
import { mockLiquidacoes } from './mockLiquidacoes';
import { BaixaModo, Liquidacao, LiquidacaoStatus, NegociacaoTipo } from './types';
import { formatBRL, toISO } from './format';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

const STATUS_TEXT: Record<LiquidacaoStatus, { label: string; cls: string }> = {
  a_liquidar: { label: 'A liquidar', cls: 'text-blue-600' },
  parcial: { label: 'Parcial', cls: 'text-amber-600 font-medium' },
  liquidada: { label: 'Liquidada', cls: 'text-green-600 font-medium' },
  em_atraso: { label: 'Em atraso', cls: 'text-red-600 font-medium' },
};

const NEGOCIACAO_LABEL: Record<NegociacaoTipo, string> = {
  cessao: 'Cedida',
  onus: 'Onerada',
};

const STATUS_CARDS: {
  key: LiquidacaoStatus;
  label: string;
  icon: ReactNode;
  urgent?: boolean;
}[] = [
  { key: 'a_liquidar', label: 'A liquidar', icon: <Clock size={20} /> },
  { key: 'parcial', label: 'Parciais', icon: <Coins size={20} /> },
  { key: 'liquidada', label: 'Liquidadas', icon: <CheckCircle2 size={20} /> },
  { key: 'em_atraso', label: 'Em atraso', icon: <AlertTriangle size={20} />, urgent: true },
];

const ITEMS_PER_PAGE = 10;

function ControleLiquidacoes() {
  const { showToast } = useToast();
  const { sacadorAtivo } = useSacador();
  const [selected, setSelected] = useState<Liquidacao | null>(null);

  // Modo de report da baixa à registradora. Padrão automático; manual = double check.
  const [modoBaixa, setModoBaixa] = useState<BaixaModo>('automatico');

  const [statusFilter, setStatusFilter] = useState<LiquidacaoStatus | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState({ cliente: '', liquidante: '', negociacao: '', vencimento: '' });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const setFilter = (k: keyof typeof f, v: string) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setPage(1);
  };

  const clearFilters = () => {
    setF({ cliente: '', liquidante: '', negociacao: '', vencimento: '' });
    setPage(1);
  };

  // Recorte base: só as liquidações do emissor (sacador) selecionado em Início.
  const doSacador = useMemo(
    () => mockLiquidacoes.filter((l) => !sacadorAtivo || l.sacadorId === sacadorAtivo.id),
    [sacadorAtivo],
  );

  const liquidantes = useMemo(
    () => Array.from(new Set(doSacador.map((l) => l.liquidante))).sort(),
    [doSacador],
  );

  // Filtro por texto/seleção (não aplica o status — usado para a contagem dos cards)
  const byText = useMemo(() => {
    return doSacador.filter((l) => {
      if (f.cliente && !l.cliente.toLowerCase().includes(f.cliente.toLowerCase())) return false;
      if (f.liquidante && l.liquidante !== f.liquidante) return false;
      if (f.negociacao && l.negociacao !== f.negociacao) return false;
      if (f.vencimento && toISO(l.vencimento) !== f.vencimento) return false;
      return true;
    });
  }, [doSacador, f]);

  const counts = useMemo(() => {
    const c: Record<LiquidacaoStatus, number> = {
      a_liquidar: 0,
      parcial: 0,
      liquidada: 0,
      em_atraso: 0,
    };
    byText.forEach((l) => {
      c[l.status] += 1;
    });
    return c;
  }, [byText]);

  // Totais financeiros (valor cedido / valor já liquidado) sobre o recorte atual
  const totais = useMemo(() => {
    const cedido = byText.reduce((s, l) => s + l.valorCedido, 0);
    const liquidado = byText.reduce((s, l) => s + l.valorLiquidado, 0);
    return { cedido, liquidado, aberto: cedido - liquidado };
  }, [byText]);

  const rows = useMemo(
    () => (statusFilter ? byText.filter((l) => l.status === statusFilter) : byText),
    [byText, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setSelectedIds((prev) => {
      const validas = new Set(rows.map((l) => l.id));
      const next = new Set([...prev].filter((id) => validas.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const allVisibleSelected = visible.length > 0 && visible.every((l) => selectedIds.has(l.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach((l) => next.delete(l.id));
      else visible.forEach((l) => next.add(l.id));
      return next;
    });
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="min-h-full bg-gray-100">
      <div className="w-full p-4 md:p-6">
        {/* Título + emissor (mesmo sacador selecionado em Início) */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Controle de Liquidações</h1>
            <p className="mt-1 text-sm text-gray-500">
              Acompanhe as duplicatas negociadas com financiadores e se o cliente já pagou o
              liquidante.
            </p>
            {sacadorAtivo && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
                <Building2 className="h-4 w-4 shrink-0 text-[#0854a0]" />
                <span className="text-xs font-medium text-gray-500">Emissor</span>
                <span className="font-medium text-gray-900">{sacadorAtivo.razaoSocial}</span>
                <span className="text-gray-500">· {formatCNPJ(sacadorAtivo.cnpj)}</span>
              </div>
            )}
          </div>

          {/* Modo de baixa na registradora (automático por padrão, manual = double check) */}
          <BaixaModeToggle modo={modoBaixa} onChange={setModoBaixa} />
        </div>

        {/* Cards de status (clicáveis para filtrar) */}
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATUS_CARDS.map((card) => {
            const active = statusFilter === card.key;
            const count = counts[card.key];
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => setStatusFilter(active ? null : card.key)}
                className={cx(
                  'flex h-[120px] flex-col rounded-lg bg-white px-4 py-4 text-left shadow-sm transition-all hover:shadow',
                  active ? 'ring-2 ring-[#0854a0]' : 'ring-1 ring-transparent',
                )}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">{card.label}</span>
                  <span
                    className={cx(
                      'flex-shrink-0',
                      card.urgent && count > 0 ? 'text-red-500' : 'text-gray-400',
                    )}
                  >
                    {card.icon}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{count}</span>
                {card.urgent && count > 0 && (
                  <span className="mt-auto flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Requer atenção
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Resumo financeiro */}
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard label="Total cedido aos liquidantes" value={formatBRL(totais.cedido)} tone="neutral" />
          <SummaryCard label="Já liquidado" value={formatBRL(totais.liquidado)} tone="success" />
          <SummaryCard label="Em aberto" value={formatBRL(totais.aberto)} tone="primary" />
        </div>

        {/* Filtros */}
        <div className="mb-4 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className={cx(
              'flex w-full items-center justify-between bg-white px-6 py-4 transition-colors hover:bg-gray-50',
              !filtersOpen && 'rounded-lg',
            )}
          >
            <span className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-700" />
              <span className="text-base font-semibold text-gray-900">Filtros</span>
            </span>
            {filtersOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-700" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-700" />
            )}
          </button>

          {filtersOpen && (
            <div className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Cliente (sacado)">
                  <input
                    type="text"
                    placeholder="Nome do cliente..."
                    value={f.cliente}
                    onChange={(e) => setFilter('cliente', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Liquidante">
                  <select
                    value={f.liquidante}
                    onChange={(e) => setFilter('liquidante', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Todos</option>
                    {liquidantes.map((nome) => (
                      <option key={nome} value={nome}>
                        {nome}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Negociação">
                  <select
                    value={f.negociacao}
                    onChange={(e) => setFilter('negociacao', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Todas</option>
                    <option value="cessao">Cedida</option>
                    <option value="onus">Onerada</option>
                  </select>
                </Field>
                <Field label="Vencimento">
                  <input
                    type="date"
                    value={f.vencimento}
                    onChange={(e) => setFilter('vencimento', e.target.value)}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" size="md" onClick={clearFilters}>
                  Limpar
                </Button>
                <Button variant="primary" size="md" onClick={() => setFiltersOpen(false)}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Linha de seleção */}
        <div className="mb-3 px-1">
          <h2 className="text-lg font-medium text-gray-900">
            {selectedCount === 0
              ? 'Nenhum item selecionado'
              : `${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`}
          </h2>
        </div>

        {/* Tabela */}
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-600">
                  <th className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-[#0854a0] focus:ring-blue-500"
                        checked={allVisibleSelected}
                        onChange={toggleAll}
                        aria-label="Selecionar todas"
                      />
                      <span>Duplicata</span>
                    </div>
                  </th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Valor</th>
                  <th className="px-4 py-2.5">Vencimento</th>
                  <th className="px-4 py-2.5">Negociação</th>
                  <th className="px-4 py-2.5">Liquidante</th>
                  <th className="px-4 py-2.5">Liquidado</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="w-20 px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                      Nenhuma liquidação encontrada.
                    </td>
                  </tr>
                ) : (
                  visible.map((l) => {
                    const st = STATUS_TEXT[l.status];
                    const pct =
                      l.valorCedido > 0
                        ? Math.min(100, Math.round((l.valorLiquidado / l.valorCedido) * 100))
                        : 0;
                    return (
                      <tr
                        key={l.id}
                        onClick={() => setSelected(l)}
                        className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0854a0] focus:ring-blue-500"
                              checked={selectedIds.has(l.id)}
                              onChange={() => toggleOne(l.id)}
                              aria-label={`Selecionar ${l.duplicataNumero}`}
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-gray-900">
                                {l.tipoDuplicata}
                              </span>
                              <button
                                type="button"
                                onClick={() => setSelected(l)}
                                className="text-left text-xs text-blue-600 hover:underline"
                              >
                                {l.duplicataNumero}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{l.cliente}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatBRL(l.valor)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{l.vencimento}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                            {l.negociacao === 'cessao' ? (
                              <ArrowRightLeft size={13} className="text-[#0854a0]" />
                            ) : (
                              <ShieldCheck size={13} className="text-[#0854a0]" />
                            )}
                            {NEGOCIACAO_LABEL[l.negociacao]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                            <Landmark size={13} className="shrink-0 text-gray-400" />
                            <span className="max-w-[150px] truncate">{l.liquidante}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-gray-600">
                              {formatBRL(l.valorLiquidado)} / {formatBRL(l.valorCedido)}
                            </span>
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className={cx(
                                  'h-full rounded-full',
                                  l.status === 'liquidada'
                                    ? 'bg-green-500'
                                    : l.status === 'em_atraso'
                                      ? 'bg-red-500'
                                      : 'bg-[#0854a0]',
                                )}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={cx('text-sm', st.cls)}>{st.label}</span>
                            {l.status === 'em_atraso' && (
                              <Tooltip content={`Vencida há ${l.diasAtraso} dia(s) sem liquidação total`}>
                                <AlertTriangle size={13} className="text-red-500" />
                              </Tooltip>
                            )}
                            {!l.clienteNotificado && l.status !== 'liquidada' && (
                              <Tooltip content="Cliente ainda não notificado para pagar o liquidante">
                                <Bell size={13} className="text-amber-500" />
                              </Tooltip>
                            )}
                            {l.status === 'liquidada' &&
                              (l.baixaRegistradora ?? 'pendente') === 'pendente' && (
                                <Tooltip
                                  content={
                                    modoBaixa === 'automatico'
                                      ? 'Baixa será reportada automaticamente à registradora'
                                      : 'Baixa requer report manual (double check)'
                                  }
                                >
                                  <FileCheck2
                                    size={13}
                                    className={
                                      modoBaixa === 'automatico' ? 'text-[#0854a0]' : 'text-amber-500'
                                    }
                                  />
                                </Tooltip>
                              )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <ActionsMenu
                              items={[
                                {
                                  label: 'Ver detalhes',
                                  icon: <Eye className="h-4 w-4" />,
                                  onClick: () => setSelected(l),
                                },
                                ...(l.status !== 'liquidada'
                                  ? [
                                      {
                                        label: 'Registrar liquidação',
                                        icon: <CheckCircle2 className="h-4 w-4" />,
                                        onClick: () => setSelected(l),
                                      },
                                    ]
                                  : []),
                                ...(!l.clienteNotificado && l.status !== 'liquidada'
                                  ? [
                                      {
                                        label: 'Notificar cliente',
                                        icon: <Bell className="h-4 w-4" />,
                                        tone: 'danger' as const,
                                        onClick: () => setSelected(l),
                                      },
                                    ]
                                  : []),
                                ...(l.status === 'liquidada' &&
                                (l.baixaRegistradora ?? 'pendente') === 'pendente'
                                  ? [
                                      {
                                        label: 'Reportar baixa',
                                        icon: <FileCheck2 className="h-4 w-4" />,
                                        onClick: () => setSelected(l),
                                      },
                                    ]
                                  : []),
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <span className="px-2 text-sm text-gray-600">
                {currentPage} de {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Painel lateral de detalhe */}
      {selected && (
        <LiquidacaoPanel
          liquidacao={selected}
          modoBaixa={modoBaixa}
          onClose={() => setSelected(null)}
          showToast={showToast}
        />
      )}
    </div>
  );
}

const inputCls =
  'w-full h-9 px-3 border border-gray-300 rounded-md text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function BaixaModeToggle({
  modo,
  onChange,
}: {
  modo: BaixaModo;
  onChange: (m: BaixaModo) => void;
}) {
  const options: { key: BaixaModo; label: string; icon: ReactNode }[] = [
    { key: 'automatico', label: 'Automática', icon: <Zap size={14} /> },
    { key: 'manual', label: 'Manual', icon: <UserCheck size={14} /> },
  ];
  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
        Baixa na registradora
        <Tooltip content="No modo automático, a baixa é reportada à registradora assim que a liquidação é confirmada. No modo manual, um operador reporta cada baixa (double check). Mesmo no automático você pode reportar manualmente.">
          <HelpCircle size={13} className="text-gray-400" />
        </Tooltip>
      </span>
      <div className="inline-flex rounded-md border border-gray-200 bg-white p-0.5 shadow-sm">
        {options.map((o) => {
          const active = modo === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              className={cx(
                'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors',
                active ? 'bg-[#0854a0] text-white' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              {o.icon}
              {o.label}
            </button>
          );
        })}
      </div>
      <span className="max-w-[260px] text-right text-xs text-gray-400">
        {modo === 'automatico'
          ? 'Reportada automaticamente ao confirmar a liquidação.'
          : 'Operador reporta cada baixa (double check).'}
      </span>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'neutral' | 'success' | 'primary';
}) {
  const valueCls =
    tone === 'success' ? 'text-green-700' : tone === 'primary' ? 'text-[#0854a0]' : 'text-gray-900';
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={cx('mt-1 text-xl font-bold', valueCls)}>{value}</p>
    </div>
  );
}

interface ActionItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: 'default' | 'danger';
}

function ActionsMenu({ items }: { items: ActionItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-md p-1 transition-colors hover:bg-gray-100"
        aria-label="Menu de ações"
      >
        <MoreHorizontal className="h-5 w-5 text-gray-600" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                it.onClick();
                setOpen(false);
              }}
              className={cx(
                'flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50',
                it.tone === 'danger' ? 'text-red-600' : 'text-gray-700',
              )}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ControleLiquidacoes;
