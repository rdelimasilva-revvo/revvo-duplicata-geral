import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { useCreditsTableStore } from './creditsTableStore';

const ORIGIN_OPTIONS = [
  { value: 'all', label: 'Todas as origens' },
  { value: 'acordo_comercial', label: 'Acordo Comercial' },
  { value: 'devolucao', label: 'Devolução' },
  { value: 'bonificacao', label: 'Bonificação' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'available', label: 'Disponível' },
  { value: 'partial', label: 'Parcial' },
  { value: 'consumed', label: 'Consumido' },
];

const inputBase =
  'w-full text-[12px] text-gray-700 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0070f2]/30 focus:border-[#0070f2] transition-colors placeholder:text-gray-400';

const labelBase =
  'block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1';

export function CreditsTableFilters() {
  const filters = useCreditsTableStore((s) => s.filters);
  const setFilter = useCreditsTableStore((s) => s.setFilter);
  const resetFilters = useCreditsTableStore((s) => s.resetFilters);
  const hasActive = useCreditsTableStore((s) => s.hasActiveFilters)();

  return (
    <div className="px-5 py-3 bg-gray-50/60 border-b border-gray-100">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <span>Filtros</span>
          {hasActive && (
            <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#0070f2] text-white text-[9px] font-bold">
              ativo
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasActive}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-[#0070f2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Limpar filtros"
        >
          <X className="w-3 h-3" />
          Limpar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <div className="lg:col-span-2">
          <label htmlFor="credits-search" className={labelBase}>
            Buscar
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="credits-search"
              type="search"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Fornecedor, CNPJ ou código…"
              className={`${inputBase} pl-7`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="credits-origin" className={labelBase}>
            Origem
          </label>
          <select
            id="credits-origin"
            value={filters.origin}
            onChange={(e) => setFilter('origin', e.target.value)}
            className={inputBase}
          >
            {ORIGIN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="credits-status" className={labelBase}>
            Status
          </label>
          <select
            id="credits-status"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            className={inputBase}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelBase}>Saldo (R$)</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={filters.minRemaining}
              onChange={(e) => setFilter('minRemaining', e.target.value)}
              placeholder="Min"
              aria-label="Saldo mínimo"
              className={inputBase}
            />
            <span className="text-[10px] text-gray-400">a</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={filters.maxRemaining}
              onChange={(e) => setFilter('maxRemaining', e.target.value)}
              placeholder="Max"
              aria-label="Saldo máximo"
              className={inputBase}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
