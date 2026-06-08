import { useEffect, useMemo, useState } from 'react';
import {
  FileText, Loader2, AlertTriangle, Search, X, ArrowUpDown,
  ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTransactionSyncStore } from './store';
import { StatusBadge } from './StatusBadge';
import type { NotaFiscal, SortConfig, NFStatus } from './types';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  try {
    return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return dateStr;
  }
};

const PAGE_SIZE = 10;

const NF_STATUSES: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'pago', label: 'Pago' },
  { value: 'creditado', label: 'Creditado' },
  { value: 'liquidado', label: 'Liquidado' },
];

export function NFTable() {
  const nfs = useTransactionSyncStore((s) => s.notasFiscais);
  const loading = useTransactionSyncStore((s) => s.loading);
  const error = useTransactionSyncStore((s) => s.error);
  const filters = useTransactionSyncStore((s) => s.filters);
  const sort = useTransactionSyncStore((s) => s.sort);
  const setFilter = useTransactionSyncStore((s) => s.setFilter);
  const resetFilters = useTransactionSyncStore((s) => s.resetFilters);
  const setSort = useTransactionSyncStore((s) => s.setSort);
  const setSelectedTransaction = useTransactionSyncStore((s) => s.setSelectedTransaction);
  const loadNotasFiscais = useTransactionSyncStore((s) => s.loadNotasFiscais);

  const [page, setPage] = useState(1);

  useEffect(() => {
    loadNotasFiscais();
  }, [loadNotasFiscais]);

  const filtered = useMemo(() => {
    let result = [...nfs];
    const q = filters.search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (n) =>
          n.numeroNf.toLowerCase().includes(q) ||
          n.fornecedorNome.toLowerCase().includes(q) ||
          n.fornecedorCnpj.includes(q) ||
          n.transactionId.toLowerCase().includes(q),
      );
    }
    if (filters.status !== 'all') {
      result = result.filter((n) => n.status === filters.status);
    }
    if (filters.dateFrom) {
      const from = parseISO(filters.dateFrom);
      result = result.filter((n) => !isBefore(parseISO(n.dataVencimento), from));
    }
    if (filters.dateTo) {
      const to = parseISO(filters.dateTo);
      result = result.filter((n) => !isAfter(parseISO(n.dataVencimento), to));
    }
    if (filters.valorMin) {
      const min = Number(filters.valorMin);
      if (!Number.isNaN(min)) result = result.filter((n) => n.valor >= min);
    }
    if (filters.valorMax) {
      const max = Number(filters.valorMax);
      if (!Number.isNaN(max)) result = result.filter((n) => n.valor <= max);
    }
    return result;
  }, [nfs, filters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, direction } = sort;
    const factor = direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a[key as keyof NotaFiscal];
      const bv = b[key as keyof NotaFiscal];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
      return String(av ?? '').localeCompare(String(bv ?? ''), 'pt-BR') * factor;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const cycleSort = (key: string) => {
    setSort(
      sort?.key === key
        ? sort.direction === 'asc'
          ? { key, direction: 'desc' }
          : null
        : { key, direction: 'asc' },
    );
  };

  const hasFilters = filters.search || filters.status !== 'all' || filters.dateFrom || filters.dateTo || filters.valorMin || filters.valorMax;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#0070f2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-800">Notas Fiscais</h2>
              <p className="text-[11px] text-gray-500">
                {sorted.length} {sorted.length === 1 ? 'nota' : 'notas'} · Visão da Empresa
              </p>
            </div>
          </div>
          {hasFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por NF, fornecedor ou CNPJ…"
              value={filters.search}
              onChange={(e) => { setFilter('search', e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => { setFilter('status', e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] bg-white"
          >
            {NF_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => { setFilter('dateFrom', e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] bg-white"
            title="Data início"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => { setFilter('dateTo', e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] bg-white"
            title="Data fim"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#0070f2]" />
          <p className="text-xs text-gray-500">Carregando notas fiscais…</p>
        </div>
      ) : error ? (
        <div className="m-5 p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-rose-800">Erro ao carregar</p>
            <p className="text-[11px] text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-600">Nenhuma nota fiscal encontrada</p>
          <p className="text-xs text-gray-400 mt-1">Ajuste os filtros para ver resultados.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <SortableHeader label="Nº NF" sortKey="numeroNf" sort={sort} onSort={cycleSort} />
                  <SortableHeader label="Fornecedor" sortKey="fornecedorNome" sort={sort} onSort={cycleSort} />
                  <SortableHeader label="Valor" sortKey="valor" sort={sort} onSort={cycleSort} align="right" />
                  <SortableHeader label="Emissão" sortKey="dataEmissao" sort={sort} onSort={cycleSort} />
                  <SortableHeader label="Vencimento" sortKey="dataVencimento" sort={sort} onSort={cycleSort} />
                  <SortableHeader label="Status" sortKey="status" sort={sort} onSort={cycleSort} align="center" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((nf) => (
                  <tr
                    key={nf.id}
                    onClick={() => setSelectedTransaction(nf.transactionId)}
                    className="cursor-pointer hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-gray-800">{nf.numeroNf}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-800 truncate max-w-[200px]">{nf.fornecedorNome}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{nf.fornecedorCnpj}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs font-bold text-gray-800 tabular-nums">{formatCurrency(nf.valor)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 tabular-nums">{formatDate(nf.dataEmissao)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 tabular-nums">{formatDate(nf.dataVencimento)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge value={nf.status} variant="nf" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} de {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-xs font-medium">
                Página {page} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = 'left',
}: {
  label: string;
  sortKey: string;
  sort: SortConfig | null;
  onSort: (key: string) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const active = sort?.key === sortKey;
  const Icon = active
    ? sort!.direction === 'asc'
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className={`px-4 py-2.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:text-gray-600 transition-colors text-${align}`}
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon className={`w-3 h-3 ${active ? 'text-[#0070f2]' : ''}`} />
      </span>
    </th>
  );
}
