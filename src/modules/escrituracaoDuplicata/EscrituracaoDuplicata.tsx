import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Plus,
  Filter,
  ChevronUp,
  ChevronDown,
  FileText,
  AlertCircle,
  AlertTriangle,
  Lock,
  CheckCircle2,
  Ban,
  MoreHorizontal,
  Eye,
  Link2,
  Building2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useSacador } from '@/context/SacadorContext';
import { formatCNPJ } from '@/utils/formatters';
import { Button, Tooltip } from '@/components/ui';
import { NovaDuplicataModal } from './components/NovaDuplicataModal';
import { DuplicataPanel } from './components/DuplicataPanel';
import { mockDuplicatas } from './data/mockDuplicatas';
import { Duplicata, DuplicataStatus } from './types/duplicata';
import { formatBRL } from './utils/format';

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

const STATUS_TEXT: Record<DuplicataStatus, { label: string; cls: string }> = {
  ativa: { label: 'Ativa', cls: 'text-blue-600' },
  aguardando: { label: 'Aguardando', cls: 'text-red-600 font-medium' },
  negociada: { label: 'Negociada', cls: 'text-gray-600' },
  paga: { label: 'Paga', cls: 'text-green-600 font-medium' },
  cancelada: { label: 'Cancelada', cls: 'text-gray-500' },
};

const STATUS_CARDS: {
  key: DuplicataStatus;
  label: string;
  icon: ReactNode;
  urgent?: boolean;
}[] = [
  { key: 'ativa', label: 'Ativas', icon: <FileText size={20} /> },
  { key: 'aguardando', label: 'Aguardando', icon: <AlertCircle size={20} />, urgent: true },
  { key: 'negociada', label: 'Negociadas', icon: <Lock size={20} /> },
  { key: 'paga', label: 'Pagas', icon: <CheckCircle2 size={20} /> },
  { key: 'cancelada', label: 'Canceladas', icon: <Ban size={20} /> },
];

// dd/mm/aaaa -> aaaa-mm-dd (para comparar com input date)
const toISO = (v: string) => {
  const [d, m, y] = v.split('/');
  return `${y}-${m}-${d}`;
};

const ITEMS_PER_PAGE = 25;

function Duplicatas() {
  const { showToast } = useToast();
  const { sacadorAtivo } = useSacador();
  const [novaOpen, setNovaOpen] = useState(false);
  const [selected, setSelected] = useState<Duplicata | null>(null);
  const [openResolve, setOpenResolve] = useState(false);

  const [statusFilter, setStatusFilter] = useState<DuplicataStatus | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [f, setF] = useState({ cliente: '', numero: '', valor: '', vencimento: '', origem: '' });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const setFilter = (k: keyof typeof f, v: string) => {
    setF((prev) => ({ ...prev, [k]: v }));
    setPage(1);
  };

  const clearFilters = () => {
    setF({ cliente: '', numero: '', valor: '', vencimento: '', origem: '' });
    setPage(1);
  };

  // Filtro por sacador ativo, texto/origem (não aplica o status — usado também para a contagem dos cards)
  const byText = useMemo(() => {
    return mockDuplicatas.filter((d) => {
      if (sacadorAtivo && d.sacadorId !== sacadorAtivo.id) return false;
      if (f.cliente && !d.cliente.toLowerCase().includes(f.cliente.toLowerCase())) return false;
      if (f.numero && !d.numero.toLowerCase().includes(f.numero.toLowerCase())) return false;
      if (
        f.valor &&
        !formatBRL(d.valor).toLowerCase().includes(f.valor.toLowerCase()) &&
        !String(d.valor).includes(f.valor)
      )
        return false;
      if (f.vencimento && toISO(d.vencimento) !== f.vencimento) return false;
      if (f.origem && d.origem !== f.origem) return false;
      return true;
    });
  }, [f, sacadorAtivo]);

  const counts = useMemo(() => {
    const c: Record<DuplicataStatus, number> = {
      ativa: 0,
      aguardando: 0,
      negociada: 0,
      paga: 0,
      cancelada: 0,
    };
    byText.forEach((d) => {
      c[d.status] += 1;
    });
    return c;
  }, [byText]);

  const rows = useMemo(
    () => (statusFilter ? byText.filter((d) => d.status === statusFilter) : byText),
    [byText, statusFilter],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visible = rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Mantém a seleção coerente com as linhas visíveis no filtro atual
  useEffect(() => {
    setSelectedIds((prev) => {
      const validas = new Set(rows.map((d) => d.id));
      const next = new Set([...prev].filter((id) => validas.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  const allVisibleSelected =
    visible.length > 0 && visible.every((d) => selectedIds.has(d.id));

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visible.forEach((d) => next.delete(d.id));
      else visible.forEach((d) => next.add(d.id));
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

  const openDetail = (d: Duplicata, resolve = false) => {
    setSelected(d);
    setOpenResolve(resolve);
  };

  const selectedCount = selectedIds.size;

  return (
    <div className="min-h-full bg-gray-100">
      <div className="w-full p-4 md:p-6">
        {/* Título + Nova duplicata */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Duplicatas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Veja onde está cada duplicata e o que você pode fazer com ela.
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
          <Button variant="primary" size="md" icon={<Plus size={16} />} onClick={() => setNovaOpen(true)}>
            Nova duplicata
          </Button>
        </div>

        {/* Cards de status (clicáveis para filtrar) */}
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
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
                  <span className={cx('flex-shrink-0', card.urgent && count > 0 ? 'text-red-500' : 'text-gray-400')}>
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
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Cliente">
                  <input
                    type="text"
                    placeholder="Nome do cliente..."
                    value={f.cliente}
                    onChange={(e) => setFilter('cliente', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Número">
                  <input
                    type="text"
                    placeholder="Número da duplicata..."
                    value={f.numero}
                    onChange={(e) => setFilter('numero', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Valor">
                  <input
                    type="text"
                    placeholder="Ex.: 3.250,00"
                    value={f.valor}
                    onChange={(e) => setFilter('valor', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Vencimento">
                  <input
                    type="date"
                    value={f.vencimento}
                    onChange={(e) => setFilter('vencimento', e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Origem">
                  <select
                    value={f.origem}
                    onChange={(e) => setFilter('origem', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Todas</option>
                    <option value="automatica">Automática</option>
                    <option value="manual">Manual</option>
                  </select>
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
                      <span>Tipo / Número</span>
                    </div>
                  </th>
                  <th className="px-4 py-2.5">Data de emissão</th>
                  <th className="px-4 py-2.5">Valor</th>
                  <th className="px-4 py-2.5">Vencimento</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Origem</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="w-20 px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                      Nenhuma duplicata encontrada.
                    </td>
                  </tr>
                ) : (
                  visible.map((d) => {
                    const st = STATUS_TEXT[d.status];
                    return (
                      <tr
                        key={d.id}
                        onClick={() => openDetail(d)}
                        className="cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0854a0] focus:ring-blue-500"
                              checked={selectedIds.has(d.id)}
                              onChange={() => toggleOne(d.id)}
                              aria-label={`Selecionar ${d.numero}`}
                            />
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-gray-900">{d.tipo}</span>
                              <button
                                type="button"
                                onClick={() => openDetail(d)}
                                className="text-left text-xs text-blue-600 hover:underline"
                              >
                                {d.numero}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{d.criadaEm ?? '—'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatBRL(d.valor)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{d.vencimento}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{d.cliente}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {d.origem === 'automatica' ? 'Automática' : 'Manual'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={cx('text-sm', st.cls)}>{st.label}</span>
                            {d.status === 'negociada' && (
                              <Tooltip content="Duplicata negociada — alterações bloqueadas">
                                <Lock size={13} className="text-gray-400" />
                              </Tooltip>
                            )}
                            {d.creditoVinculado && (
                              <Tooltip
                                content={`Crédito vinculado (${
                                  d.creditoVinculado.tipo === 'cessao' ? 'cessão' : 'ônus'
                                }) — ${d.creditoVinculado.financiador}`}
                              >
                                <Link2 size={13} className="text-[#0854a0]" />
                              </Tooltip>
                            )}
                          </div>
                          {d.status === 'aguardando' && d.motivoPendencia && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                              <span>{d.motivoPendencia}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetail(d, true);
                                }}
                                className="ml-1 font-semibold text-[#0854a0] hover:underline"
                              >
                                Resolver
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-center">
                            <ActionsMenu
                              items={[
                                { label: 'Ver detalhes', icon: <Eye className="h-4 w-4" />, onClick: () => openDetail(d) },
                                ...(d.status === 'aguardando'
                                  ? [
                                      {
                                        label: 'Resolver pendência',
                                        icon: <AlertCircle className="h-4 w-4" />,
                                        tone: 'danger' as const,
                                        onClick: () => openDetail(d, true),
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

      {/* Modal de criação manual (componente existente) */}
      {novaOpen && <NovaDuplicataModal onClose={() => setNovaOpen(false)} />}

      {/* Painel lateral de detalhe */}
      {selected && (
        <DuplicataPanel
          duplicata={selected}
          openResolve={openResolve}
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

export default Duplicatas;
