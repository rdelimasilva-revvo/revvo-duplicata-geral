import React, { useEffect, useMemo, useState } from 'react';
import {
  Coins, Loader2, AlertTriangle, Building2,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ArrowUp, ArrowDown, ArrowUpDown, ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreditsTableFilters } from './CreditsTableFilters';
import { useCreditsTableStore, type SortKey } from './creditsTableStore';

export interface CreditRowData {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  supplierCnpj: string;
  origin: string;
  totalValue: number;
  remainingValue: number;
  status: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

type CreditRow = CreditRowData;

interface AllCreditsListProps {
  expandedRowId?: string | null;
  onToggleExpand?: (row: CreditRow) => void;
  renderExpanded?: (row: CreditRow) => React.ReactNode;
  onRowsLoaded?: (rows: CreditRow[]) => void;
  hideFooter?: boolean;
}

const ORIGIN_LABEL: Record<string, string> = {
  acordo_comercial: 'Acordo Comercial',
  devolucao: 'Devolução',
  bonificacao: 'Bonificação',
};

const STATUS_LABEL: Record<string, string> = {
  available: 'Disponível',
  partial: 'Parcial',
  consumed: 'Consumido',
};

const STATUS_STYLE: Record<string, string> = {
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  consumed: 'bg-gray-100 text-gray-500 border-gray-200',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

export function AllCreditsList({
  expandedRowId,
  onToggleExpand,
  renderExpanded,
  onRowsLoaded,
  hideFooter = false,
}: AllCreditsListProps = {}) {
  const [rows, setRows] = useState<CreditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('supplier_credits')
          .select('*')
          .order('supplier_name', { ascending: true })
          .order('code', { ascending: true });
        if (fetchError) throw fetchError;
        if (cancelled) return;
        setRows(
          (data || []).map((r: any) => ({
            id: r.id,
            code: r.code,
            supplierId: r.supplier_id,
            supplierName: r.supplier_name,
            supplierCnpj: r.supplier_cnpj,
            origin: r.origin,
            totalValue: Number(r.total_value),
            remainingValue: Number(r.remaining_value),
            status: r.status,
          })),
        );
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Erro ao carregar créditos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    onRowsLoaded?.(rows);
  }, [rows, onRowsLoaded]);

  const sort = useCreditsTableStore((s) => s.sort);
  const filters = useCreditsTableStore((s) => s.filters);
  const cycleSort = useCreditsTableStore((s) => s.cycleSort);

  const filteredRows = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const min = filters.minRemaining === '' ? null : Number(filters.minRemaining);
    const max = filters.maxRemaining === '' ? null : Number(filters.maxRemaining);
    return rows.filter((r) => {
      if (term) {
        const haystack = `${r.supplierName} ${r.supplierCnpj} ${r.code}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (filters.origin !== 'all' && r.origin !== filters.origin) return false;
      if (filters.status !== 'all' && r.status !== filters.status) return false;
      if (min !== null && !Number.isNaN(min) && r.remainingValue < min) return false;
      if (max !== null && !Number.isNaN(max) && r.remainingValue > max) return false;
      return true;
    });
  }, [rows, filters]);

  const displayedRows = useMemo(() => {
    if (!sort) return filteredRows;
    const { key, direction } = sort;
    const factor = direction === 'asc' ? 1 : -1;
    const sorted = [...filteredRows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') {
        return (av - bv) * factor;
      }
      return String(av).localeCompare(String(bv), 'pt-BR', { sensitivity: 'base' }) * factor;
    });
    return sorted;
  }, [filteredRows, sort]);

  const totalPages = Math.max(1, Math.ceil(displayedRows.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return displayedRows.slice(start, start + pageSize);
  }, [displayedRows, page, pageSize]);

  const rangeStart = displayedRows.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(displayedRows.length, page * pageSize);

  const { totalGeralDisponivel, totalGeralEmitido, fornecedoresUnicos } = useMemo(() => {
    const suppliers = new Set<string>();
    let disponivel = 0;
    let emitido = 0;
    displayedRows.forEach((r) => {
      suppliers.add(r.supplierCnpj);
      disponivel += r.remainingValue;
      emitido += r.totalValue;
    });
    return {
      totalGeralDisponivel: disponivel,
      totalGeralEmitido: emitido,
      fornecedoresUnicos: suppliers.size,
    };
  }, [displayedRows]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
            <Coins className="w-4 h-4 text-[#0070f2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Créditos Disponíveis</h2>
            <p className="text-[11px] text-gray-500">
              Lista consolidada de todos os créditos de todos os fornecedores
            </p>
          </div>
        </div>
        {!loading && !error && rows.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
            <span className="tabular-nums font-semibold text-gray-700">{displayedRows.length}</span>
            <span>{displayedRows.length === 1 ? 'crédito' : 'créditos'}</span>
            {displayedRows.length !== rows.length && (
              <span className="text-gray-400">de {rows.length}</span>
            )}
            <span>·</span>
            <span className="tabular-nums font-semibold text-gray-700">{fornecedoresUnicos}</span>
            <span>{fornecedoresUnicos === 1 ? 'fornecedor' : 'fornecedores'}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#0070f2]" />
          <span className="text-xs text-gray-500">Carregando créditos…</span>
        </div>
      ) : error ? (
        <div className="m-5 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-rose-800">Não foi possível carregar os créditos</p>
            <p className="text-[11px] text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center">
          <Coins className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600">Nenhum crédito disponível</p>
          <p className="text-xs text-gray-400 mt-1">
            Os créditos dos fornecedores aparecerão aqui quando forem emitidos.
          </p>
        </div>
      ) : (
        <>
          <CreditsTableFilters />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {renderExpanded && <th className="w-9 px-2 py-2.5" aria-label="Expandir" />}
                  <SortableHeader
                    label="Fornecedor"
                    sortKey="supplierName"
                    align="left"
                    activeSort={sort}
                    onSort={cycleSort}
                  />
                  <SortableHeader
                    label="Código"
                    sortKey="code"
                    align="left"
                    activeSort={sort}
                    onSort={cycleSort}
                  />
                  <SortableHeader
                    label="Origem"
                    sortKey="origin"
                    align="left"
                    className="hidden md:table-cell"
                    activeSort={sort}
                    onSort={cycleSort}
                  />
                  <SortableHeader
                    label="Status"
                    sortKey="status"
                    align="center"
                    className="hidden sm:table-cell"
                    activeSort={sort}
                    onSort={cycleSort}
                  />
                  <SortableHeader
                    label="Valor Emitido"
                    sortKey="totalValue"
                    align="right"
                    className="hidden lg:table-cell"
                    activeSort={sort}
                    onSort={cycleSort}
                  />
                  <SortableHeader
                    label="Saldo Disponível"
                    sortKey="remainingValue"
                    align="right"
                    activeSort={sort}
                    onSort={cycleSort}
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={renderExpanded ? 7 : 6} className="px-4 py-10 text-center">
                      <p className="text-xs font-semibold text-gray-600">
                        Nenhum crédito corresponde aos filtros
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Ajuste ou limpe os filtros para ver mais resultados.
                      </p>
                    </td>
                  </tr>
                ) : null}
                {paginatedRows.map((row) => {
                  const isExpanded = expandedRowId === row.id;
                  const clickable = !!onToggleExpand;
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        onClick={clickable ? () => onToggleExpand?.(row) : undefined}
                        className={`transition-colors ${
                          clickable ? 'cursor-pointer' : ''
                        } ${
                          isExpanded
                            ? 'bg-[#0070f2]/5 hover:bg-[#0070f2]/10'
                            : 'hover:bg-gray-50/60'
                        }`}
                      >
                        {renderExpanded && (
                          <td className="px-2 py-2.5 text-center">
                            <ChevronDown
                              className={`w-4 h-4 inline-block text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#0070f2]' : ''
                              }`}
                            />
                          </td>
                        )}
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-3 h-3 text-gray-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate max-w-[220px]">
                                {row.supplierName}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono">
                                {row.supplierCnpj}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-[11px] font-mono font-bold text-gray-700">
                            {row.code}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 hidden md:table-cell">
                          <span className="text-[11px] text-gray-600">
                            {ORIGIN_LABEL[row.origin] || row.origin}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center hidden sm:table-cell">
                          <span
                            className={`inline-flex px-2 py-0.5 text-[9px] font-semibold rounded-full border ${
                              STATUS_STYLE[row.status] || 'bg-gray-50 text-gray-500 border-gray-200'
                            }`}
                          >
                            {STATUS_LABEL[row.status] || row.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right hidden lg:table-cell">
                          <span className="text-[11px] text-gray-600 tabular-nums">
                            {formatCurrency(row.totalValue)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <span className="text-xs font-bold text-[#0070f2] tabular-nums">
                            {formatCurrency(row.remainingValue)}
                          </span>
                        </td>
                      </tr>
                      {renderExpanded && isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={7} className="p-0">
                            <div className="border-t border-b border-gray-200">
                              {renderExpanded(row)}
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

          {displayedRows.length > PAGE_SIZE_OPTIONS[0] && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span>
                  Mostrando{' '}
                  <span className="font-semibold text-gray-700 tabular-nums">{rangeStart}</span>
                  {'–'}
                  <span className="font-semibold text-gray-700 tabular-nums">{rangeEnd}</span> de{' '}
                  <span className="font-semibold text-gray-700 tabular-nums">{displayedRows.length}</span>{' '}
                  {displayedRows.length === 1 ? 'crédito' : 'créditos'}
                </span>
                <span className="w-px h-3 bg-gray-200" />
                <label className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                    Por página
                  </span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="text-[11px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="flex items-center gap-1">
                <PagerButton
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  label="Primeira página"
                >
                  <ChevronsLeft className="w-3.5 h-3.5" />
                </PagerButton>
                <PagerButton
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  label="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </PagerButton>
                <div className="px-2.5 text-[11px] text-gray-600 tabular-nums">
                  Página{' '}
                  <span className="font-bold text-gray-800">{page}</span>{' '}
                  de{' '}
                  <span className="font-bold text-gray-800">{totalPages}</span>
                </div>
                <PagerButton
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  label="Próxima página"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </PagerButton>
                <PagerButton
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  label="Última página"
                >
                  <ChevronsRight className="w-3.5 h-3.5" />
                </PagerButton>
              </div>
            </div>
          )}

          {!hideFooter && (
          <div className="px-5 py-4 bg-gradient-to-r from-[#0070f2]/5 via-[#0070f2]/10 to-[#0070f2]/5 border-t-2 border-[#0070f2]/20 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0070f2] flex items-center justify-center">
                <Coins className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                  Total Geral de Créditos Disponíveis
                </p>
                <p className="text-[11px] text-gray-600">
                  {displayedRows.length} {displayedRows.length === 1 ? 'crédito' : 'créditos'} de{' '}
                  {fornecedoresUnicos}{' '}
                  {fornecedoresUnicos === 1 ? 'fornecedor' : 'fornecedores'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="text-right hidden sm:block">
                <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                  Emitido
                </p>
                <p className="text-sm font-semibold text-gray-700 tabular-nums">
                  {formatCurrency(totalGeralEmitido)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                  Disponível
                </p>
                <p className="text-lg font-bold text-[#0070f2] tabular-nums">
                  {formatCurrency(totalGeralDisponivel)}
                </p>
              </div>
            </div>
          </div>
          )}
        </>
      )}
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  sortKey: SortKey;
  align: 'left' | 'center' | 'right';
  className?: string;
  activeSort: { key: SortKey; direction: 'asc' | 'desc' } | null;
  onSort: (key: SortKey) => void;
}

function SortableHeader({
  label,
  sortKey,
  align,
  className,
  activeSort,
  onSort,
}: SortableHeaderProps) {
  const isActive = activeSort?.key === sortKey;
  const direction = isActive ? activeSort?.direction : null;

  const alignment =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  const textAlignTh =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';

  const ariaSort: React.AriaAttributes['aria-sort'] = isActive
    ? direction === 'asc'
      ? 'ascending'
      : 'descending'
    : 'none';

  const Icon = !isActive ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      className={`${textAlignTh} px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${
        className || ''
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`group inline-flex items-center gap-1 ${alignment} w-full transition-colors ${
          isActive ? 'text-[#0070f2]' : 'text-gray-400 hover:text-gray-600'
        }`}
        aria-label={`Ordenar por ${label}`}
      >
        <span>{label}</span>
        <Icon
          className={`w-3 h-3 transition-opacity ${
            isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'
          }`}
        />
      </button>
    </th>
  );
}

interface PagerButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function PagerButton({ onClick, disabled, label, children }: PagerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-[#0070f2] hover:border-[#0070f2]/40 hover:bg-[#0070f2]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 disabled:hover:border-gray-200"
    >
      {children}
    </button>
  );
}
