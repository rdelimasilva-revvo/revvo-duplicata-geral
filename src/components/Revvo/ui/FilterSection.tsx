import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { StandardButton } from '../../../components/ui';

interface FilterSectionProps {
  children: React.ReactNode;
  title?: string;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  children,
  title = 'Filtros'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-400" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

interface FilterButtonsProps {
  onClear: () => void;
  onApply: () => void;
}

export const FilterButtons: React.FC<FilterButtonsProps> = ({ onClear, onApply }) => {
  return (
    <div className="flex items-center gap-2 mt-4">
      <StandardButton
        variant="secondary"
        size="sm"
        onClick={onClear}
        icon={<X size={12} />}
      >
        Limpar Filtros
      </StandardButton>
      <StandardButton
        variant="primary"
        size="sm"
        onClick={onApply}
        icon={<Search size={12} />}
      >
        Aplicar Filtros
      </StandardButton>
    </div>
  );
};
