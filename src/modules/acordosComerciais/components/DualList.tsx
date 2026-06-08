import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft } from 'lucide-react';
import { AvailableClient } from '../types';

interface DualListProps {
  available: AvailableClient[];
  selected: AvailableClient[];
  onSelectionChange: (selected: AvailableClient[]) => void;
}

export function DualList({ available, selected, onSelectionChange }: DualListProps) {
  const [searchLeft, setSearchLeft] = useState('');
  const [searchRight, setSearchRight] = useState('');
  const [highlightedLeft, setHighlightedLeft] = useState<Set<string>>(new Set());
  const [highlightedRight, setHighlightedRight] = useState<Set<string>>(new Set());

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);

  const filteredAvailable = useMemo(
    () =>
      available.filter(
        (c) =>
          !selectedIds.has(c.id) &&
          (c.name.toLowerCase().includes(searchLeft.toLowerCase()) ||
            c.cnpj.includes(searchLeft))
      ),
    [available, selectedIds, searchLeft]
  );

  const filteredSelected = useMemo(
    () =>
      selected.filter(
        (c) =>
          c.name.toLowerCase().includes(searchRight.toLowerCase()) ||
          c.cnpj.includes(searchRight)
      ),
    [selected, searchRight]
  );

  const toggleHighlightLeft = (id: string) => {
    setHighlightedLeft((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleHighlightRight = (id: string) => {
    setHighlightedRight((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const moveRight = () => {
    const toMove = available.filter((c) => highlightedLeft.has(c.id));
    onSelectionChange([...selected, ...toMove]);
    setHighlightedLeft(new Set());
  };

  const moveLeft = () => {
    onSelectionChange(selected.filter((c) => !highlightedRight.has(c.id)));
    setHighlightedRight(new Set());
  };

  const moveAllRight = () => {
    onSelectionChange([...selected, ...filteredAvailable]);
    setHighlightedLeft(new Set());
  };

  const moveAllLeft = () => {
    onSelectionChange([]);
    setHighlightedRight(new Set());
  };

  const renderItem = (
    client: AvailableClient,
    isHighlighted: boolean,
    onToggle: (id: string) => void
  ) => (
    <div
      key={client.id}
      onClick={() => onToggle(client.id)}
      className={`px-3 py-2.5 cursor-pointer border-b border-gray-50 transition-colors ${
        isHighlighted ? 'bg-blue-50 border-l-2 border-l-[#0070f2]' : 'hover:bg-gray-50'
      }`}
    >
      <p className={`text-sm font-medium ${isHighlighted ? 'text-[#0070f2]' : 'text-gray-800'}`}>
        {client.name}
      </p>
      <div className="flex items-center gap-3 mt-0.5">
        <span className="text-xs text-gray-500">{client.cnpj}</span>
        <span className="text-xs text-gray-400">{client.segment}</span>
        {client.city && (
          <span className="text-xs text-gray-400">
            {client.city}/{client.state}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex gap-3 items-stretch">
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Disponíveis
            </span>
            <span className="text-xs text-gray-400">{filteredAvailable.length} itens</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchLeft}
              onChange={(e) => setSearchLeft(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0070f2] focus:border-[#0070f2]"
            />
          </div>
        </div>
        <div className="h-[280px] overflow-y-auto">
          {filteredAvailable.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Nenhum cliente encontrado
            </div>
          ) : (
            filteredAvailable.map((c) => renderItem(c, highlightedLeft.has(c.id), toggleHighlightLeft))
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-2 py-4">
        <button
          onClick={moveAllRight}
          disabled={filteredAvailable.length === 0}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Mover todos"
        >
          <ChevronsRight className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={moveRight}
          disabled={highlightedLeft.size === 0}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Mover selecionados"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={moveLeft}
          disabled={highlightedRight.size === 0}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-blue-50 hover:border-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Remover selecionados"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={moveAllLeft}
          disabled={selected.length === 0}
          className="p-1.5 rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Remover todos"
        >
          <ChevronsLeft className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="px-3 py-2.5 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Vinculados
            </span>
            <span className="text-xs text-gray-400">{filteredSelected.length} itens</span>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar vinculado..."
              value={searchRight}
              onChange={(e) => setSearchRight(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0070f2] focus:border-[#0070f2]"
            />
          </div>
        </div>
        <div className="h-[280px] overflow-y-auto">
          {filteredSelected.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Nenhum cliente vinculado
            </div>
          ) : (
            filteredSelected.map((c) => renderItem(c, highlightedRight.has(c.id), toggleHighlightRight))
          )}
        </div>
      </div>
    </div>
  );
}
