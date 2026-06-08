import { CaretDown, MagnifyingGlass, X } from '@phosphor-icons/react';
import { useState } from 'react';

export function FilterBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 w-full">
      <div className="flex items-center gap-2 text-sm text-blue-600 mb-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CaretDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        <span className="font-medium">Pesquisar faturas</span>
        <span className="font-medium">Pesquisar notificações</span>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-[200px]">
              <label htmlFor="dueDate" className="block text-sm text-gray-600 mb-1">
                Data de vencimento
              </label>
              <input
                type="date"
                id="dueDate"
                defaultValue="2023-12-22"
                className="w-full h-[26px] px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="w-[200px]">
              <label htmlFor="clientCode" className="block text-sm text-gray-600 mb-1">
                Código do cliente
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="clientCode"
                  placeholder="Digite o código"
                  className="w-full h-[26px] px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 pr-8 text-sm"
                />
                <MagnifyingGlass className="w-3 h-3 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 h-[26px]">
              <X className="w-3 h-3" />
              Limpar filtros
            </button>
            <button className="px-3 h-[26px] text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Buscar
            </button>
            <button className="text-sm text-blue-600 hover:text-blue-700 h-[26px]">
              Filtros Avançados
            </button>
          </div>
        </div>
      )}
    </div>
  );
}