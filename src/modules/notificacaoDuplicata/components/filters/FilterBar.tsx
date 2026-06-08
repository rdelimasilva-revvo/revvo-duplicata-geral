import { ChevronDown, Search, X } from 'lucide-react';
import { FunnelSimple } from '@phosphor-icons/react';
import { useState } from 'react';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';
import { BillFilters } from '@/modules/notificacaoDuplicata/types/bill';
import { STATUS_FILTER_GROUPS } from '@/modules/notificacaoDuplicata/utils/statusConfig';

interface FilterBarProps {
  onFilterChange?: (filters: BillFilters) => void;
}

const EMPTY_FILTERS: BillFilters = {
  dueDate: '',
  sacador: '',
  status: '',
  urgentOnly: false,
};

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<BillFilters>({ ...EMPTY_FILTERS });

  const handleSearch = () => {
    onFilterChange?.(filters);
  };

  const handleClear = () => {
    const cleared = { ...EMPTY_FILTERS };
    setFilters(cleared);
    onFilterChange?.(cleared);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <button
          className="flex items-center justify-between w-full px-6 py-4 hover:bg-gray-50 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <FunnelSimple className="w-5 h-5 text-gray-700" weight="regular" />
            <span className="text-base font-medium text-gray-900">Filtros</span>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-4 space-y-4 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-4">
            <div className="w-[200px]">
              <label htmlFor="dueDate" className="block text-sm text-gray-600 mb-1">
                Data de vencimento
              </label>
              <input
                type="date"
                id="dueDate"
                value={filters.dueDate}
                onChange={(e) => setFilters(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full h-[26px] px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="w-[200px]">
              <label htmlFor="sacador" className="block text-sm text-gray-600 mb-1">
                Sacador/Credor
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="sacador"
                  placeholder="Nome ou CNPJ"
                  value={filters.sacador}
                  onChange={(e) => setFilters(prev => ({ ...prev, sacador: e.target.value }))}
                  className="w-full h-[26px] px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 text-sm"
                />
                <Search className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="w-[200px]">
              <label htmlFor="status" className="block text-sm text-gray-600 mb-1">
                Status de Manifestação
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full h-[26px] px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              >
                <option value="">Todos os status</option>
                {STATUS_FILTER_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">
                Filtros especiais
              </label>
              <div className="flex items-center h-[26px]">
                <input
                  type="checkbox"
                  id="urgentOnly"
                  checked={filters.urgentOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, urgentOnly: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 mr-2"
                />
                <label htmlFor="urgentOnly" className="text-sm text-gray-700">
                  Apenas urgentes
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClear}
            >
              <X className="w-3 h-3 mr-1" />
              Limpar filtros
            </Button>
            <Button variant="primary" size="sm" onClick={handleSearch}>
              Buscar
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
