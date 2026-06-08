import { useState } from 'react';
import { Search, X, Calendar, Clock, ChevronDown } from 'lucide-react';
import { FunnelSimple } from '@phosphor-icons/react';

export interface ReceivedBillsFilters {
  search: string;
  issueDateFrom: string;
  issueDateTo: string;
  remainingDays: string;
}

const EMPTY_FILTERS: ReceivedBillsFilters = {
  search: '',
  issueDateFrom: '',
  issueDateTo: '',
  remainingDays: '',
};

const REMAINING_DAYS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: '0', label: 'Vencido (0 dias)' },
  { value: '1-3', label: '1 a 3 dias' },
  { value: '4-7', label: '4 a 7 dias' },
  { value: '8-15', label: '8 a 15 dias' },
  { value: '15+', label: 'Mais de 15 dias' },
];

interface ReceivedBillsFilterBarProps {
  onFilterChange: (filters: ReceivedBillsFilters) => void;
}

export function ReceivedBillsFilterBar({ onFilterChange }: ReceivedBillsFilterBarProps) {
  const [filters, setFilters] = useState<ReceivedBillsFilters>({ ...EMPTY_FILTERS });
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof ReceivedBillsFilters, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleClear = () => {
    setFilters({ ...EMPTY_FILTERS });
    onFilterChange({ ...EMPTY_FILTERS });
  };

  const hasActiveFilters = filters.search || filters.issueDateFrom || filters.issueDateTo || filters.remainingDays;

  const activeFilterCount = [filters.search, filters.issueDateFrom || filters.issueDateTo, filters.remainingDays].filter(Boolean).length;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 md:mb-6">
      <button
        className="flex items-center justify-between w-full px-5 py-3.5 hover:bg-gray-50/50 transition-colors rounded-xl"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <FunnelSimple className="w-5 h-5 text-gray-600" weight="regular" />
          <span className="text-sm font-semibold text-gray-800">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por número da nota, documento contábil, CNPJ cedente ou razão social..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full h-10 pl-10 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-end gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Data de Entrada
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.issueDateFrom}
                    onChange={(e) => updateFilter('issueDateFrom', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="text-xs text-gray-400 shrink-0">a</span>
                  <input
                    type="date"
                    value={filters.issueDateTo}
                    onChange={(e) => updateFilter('issueDateTo', e.target.value)}
                    className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="w-52">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  Dias p/ Manifestar
                </label>
                <select
                  value={filters.remainingDays}
                  onChange={(e) => updateFilter('remainingDays', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  {REMAINING_DAYS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClear}
                  className="h-10 px-4 flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
