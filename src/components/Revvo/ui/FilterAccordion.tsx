import React, { useState } from 'react';
import { FunnelSimple } from '@phosphor-icons/react';

interface FilterAccordionProps {
  children: React.ReactNode;
}

export const FilterAccordion: React.FC<FilterAccordionProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <FunnelSimple size={16} weight="bold" />
        <span>Filtros</span>
        <span className="ml-auto text-gray-400">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};
