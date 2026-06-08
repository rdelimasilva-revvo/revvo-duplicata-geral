import { useState, useMemo } from 'react';
import { PendenciesFilter, PendencyFilters } from './PendenciesFilter';
import { PendenciesList } from './PendenciesList';
import { Pendency } from '../../types/pendency';
import { mockPendencies } from '../../data/mockPendencies';

interface PendenciesViewProps {
  onSelectPendency?: (pendency: Pendency) => void;
}

export function PendenciesView({ onSelectPendency }: PendenciesViewProps) {
  const [filters, setFilters] = useState<PendencyFilters>({
    searchTerm: '',
    status: 'all',
    priority: 'all',
    type: 'all',
  });

  const filteredPendencies = useMemo(() => {
    return mockPendencies.filter((pendency) => {
      if (
        filters.searchTerm &&
        !pendency.supplierName.toLowerCase().includes(filters.searchTerm.toLowerCase()) &&
        !pendency.supplierDocument.includes(filters.searchTerm)
      ) {
        return false;
      }

      if (filters.status !== 'all' && pendency.status !== filters.status) {
        return false;
      }

      if (filters.priority !== 'all' && pendency.priority !== filters.priority) {
        return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div>
      <PendenciesFilter onFilterChange={setFilters} />
      <PendenciesList pendencies={filteredPendencies} onSelectPendency={onSelectPendency} />
    </div>
  );
}
