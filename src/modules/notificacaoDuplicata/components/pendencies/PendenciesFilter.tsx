import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface PendenciesFilterProps {
  onFilterChange?: (filters: PendencyFilters) => void;
}

export interface PendencyFilters {
  searchTerm: string;
  status: string;
  priority: string;
  type: string;
}

export function PendenciesFilter({ onFilterChange }: PendenciesFilterProps) {
  const [filters, setFilters] = useState<PendencyFilters>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    type: 'all',
  });

  const handleFilterChange = (key: keyof PendencyFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-gray-700">Filtros</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por fornecedor..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Aguardando Manifestação</option>
          <option value="partial">Parcialmente Manifestado</option>
          <option value="urgent">Urgente</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          <option value="all">Todas as prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>

        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
        >
          <option value="all">Todos os tipos</option>
          <option value="manifestation">Manifestação</option>
          <option value="confirmation">Confirmação</option>
          <option value="rejection">Rejeição</option>
        </select>
      </div>
    </div>
  );
}
