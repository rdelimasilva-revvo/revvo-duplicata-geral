import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface TransferItem {
  id: string;
  name: string;
}

interface TransferListProps {
  label: string;
  searchPlaceholder: string;
  availableItems: TransferItem[];
  selectedItemIds: string[];
  onAdd: (ids: string[]) => void;
  onRemove: (ids: string[]) => void;
  onAddAll: () => void;
  onRemoveAll: () => void;
}

export function TransferList({
  label,
  searchPlaceholder,
  availableItems,
  selectedItemIds,
  onAdd,
  onRemove,
  onAddAll,
  onRemoveAll,
}: TransferListProps) {
  const [search, setSearch] = useState('');
  const [checkedToAdd, setCheckedToAdd] = useState<string[]>([]);
  const [checkedToRemove, setCheckedToRemove] = useState<string[]>([]);

  const unselectedItems = availableItems.filter(
    (item) =>
      !selectedItemIds.includes(item.id) &&
      (item.name?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const selectedItems = availableItems.filter((item) =>
    selectedItemIds.includes(item.id)
  );

  const toggleCheckToAdd = (id: string) => {
    setCheckedToAdd((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleCheckToRemove = (id: string) => {
    setCheckedToRemove((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (checkedToAdd.length > 0) {
      onAdd(checkedToAdd);
      setCheckedToAdd([]);
    }
  };

  const handleRemove = () => {
    if (checkedToRemove.length > 0) {
      onRemove(checkedToRemove);
      setCheckedToRemove([]);
    }
  };

  const handleAddAll = () => {
    onAddAll();
    setCheckedToAdd([]);
  };

  const handleRemoveAll = () => {
    onRemoveAll();
    setCheckedToRemove([]);
  };

  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1D2D3E] mb-2">
        {label}
      </label>
      <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-start">
        <div className="border border-[#D3D6DA] rounded-lg p-3 min-h-[180px]">
          <div className="relative mb-3">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#A0A8B4]"
              size={14}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="input-field w-full pl-8 h-[32px] text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[140px] overflow-y-auto space-y-0.5">
            {unselectedItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F5F6F7] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedToAdd.includes(item.id)}
                  onChange={() => toggleCheckToAdd(item.id)}
                  className="w-3.5 h-3.5 rounded border-[#D3D6DA] text-[#0070F2] focus:ring-[#0070F2]/20"
                />
                <span className="text-[13px] text-[#1D2D3E]">{item.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1.5 pt-10">
          <button
            onClick={handleAdd}
            disabled={checkedToAdd.length === 0}
            className="h-[30px] min-w-[140px] rounded-[6px] px-3 text-[13px] font-medium bg-[#0070F2] text-white hover:bg-[#0060D2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Adicionar &gt;
          </button>
          <button
            onClick={handleRemove}
            disabled={checkedToRemove.length === 0}
            className="h-[30px] min-w-[140px] rounded-[6px] px-3 text-[13px] font-medium border border-[#D3D6DA] text-[#556B82] hover:bg-[#F5F6F7] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            &lt; Remover
          </button>
          <button
            onClick={handleAddAll}
            className="text-[13px] font-medium text-[#0070F2] hover:text-[#0060D2] hover:underline py-0.5 transition-colors"
          >
            Adicionar todos &gt;&gt;
          </button>
          <button
            onClick={handleRemoveAll}
            className="text-[13px] font-medium text-[#0070F2] hover:text-[#0060D2] hover:underline py-0.5 transition-colors"
          >
            &lt;&lt; Remover todos
          </button>
        </div>

        <div className="border border-[#D3D6DA] rounded-lg p-3 min-h-[180px]">
          <div className="max-h-[160px] overflow-y-auto space-y-0.5">
            {selectedItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#F5F6F7] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedToRemove.includes(item.id)}
                  onChange={() => toggleCheckToRemove(item.id)}
                  className="w-3.5 h-3.5 rounded border-[#D3D6DA] text-[#0070F2] focus:ring-[#0070F2]/20"
                />
                <span className="text-[13px] text-[#1D2D3E]">{item.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
