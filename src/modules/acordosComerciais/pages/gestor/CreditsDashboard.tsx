import React, { useState, useMemo } from 'react';
import { Search, CreditCard, ArrowUpDown, ChevronDown, Filter } from 'lucide-react';
import { credits } from '../../abatimento/mockData';
import { Credit, CREDIT_TYPE_LABELS } from '../../abatimento/types';
import { formatCurrency, formatDate } from '../../utils';

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  disponivel: { label: 'Disponivel', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  parcialmente_utilizado: { label: 'Parc. Utilizado', color: 'text-blue-700', bg: 'bg-blue-50' },
  utilizado: { label: 'Utilizado', color: 'text-gray-500', bg: 'bg-gray-100' },
  expirado: { label: 'Expirado', color: 'text-red-600', bg: 'bg-red-50' },
};

interface CreditsDashboardProps {
  selectedCredits: Credit[];
  onToggleCredit: (credit: Credit) => void;
  onAdvance: () => void;
}

export function CreditsDashboard({ selectedCredits, onToggleCredit, onAdvance }: CreditsDashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('available');
  const [sortField, setSortField] = useState<'availableValue' | 'issueDate' | 'code'>('availableValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...credits];

    if (statusFilter === 'available') {
      result = result.filter((c) => c.availableValue > 0 && c.status !== 'expirado');
    } else if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.supplierName.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'availableValue') cmp = a.availableValue - b.availableValue;
      else if (sortField === 'issueDate') cmp = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
      else cmp = a.code.localeCompare(b.code);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [search, statusFilter, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const isSelected = (id: string) => selectedCredits.some((c) => c.id === id);
  const allFilteredSelected = filtered.length > 0 && filtered.every((c) => isSelected(c.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      filtered.forEach((c) => {
        if (isSelected(c.id)) onToggleCredit(c);
      });
    } else {
      filtered.forEach((c) => {
        if (!isSelected(c.id)) onToggleCredit(c);
      });
    }
  };

  const totalSelected = selectedCredits.reduce((sum, c) => sum + c.availableValue, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
            <CreditCard className="w-4.5 h-4.5 text-[#0070f2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Creditos Disponiveis</h2>
            <p className="text-xs text-gray-500">Selecione os creditos que deseja vincular a faturas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedCredits.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0070f2]/5 border border-[#0070f2]/20 rounded-lg">
              <span className="text-xs text-[#0070f2] font-medium">
                {selectedCredits.length} selecionado{selectedCredits.length > 1 ? 's' : ''}
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs font-bold text-[#0070f2]">{formatCurrency(totalSelected)}</span>
            </div>
          )}
          <button
            onClick={onAdvance}
            disabled={selectedCredits.length === 0}
            className="px-5 py-2 bg-[#0070f2] text-white text-sm font-semibold rounded-md hover:bg-[#005bc4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Selecionar Creditos
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
        <div className="p-3.5 border-b border-gray-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por codigo, fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] bg-white"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] cursor-pointer"
            >
              <option value="available">Disponiveis</option>
              <option value="all">Todos</option>
              <option value="disponivel">Disponivel</option>
              <option value="parcialmente_utilizado">Parc. Utilizado</option>
              <option value="utilizado">Utilizado</option>
              <option value="expirado">Expirado</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80">
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#0070f2] focus:ring-[#0070f2]/30 cursor-pointer"
                  />
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('code')} className="flex items-center gap-1 hover:text-gray-700">
                    ID Credito <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Fornecedor
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Descricao
                </th>
                <th className="text-right px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('availableValue')} className="flex items-center gap-1 hover:text-gray-700 ml-auto">
                    Valor Disponivel <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <button onClick={() => toggleSort('issueDate')} className="flex items-center gap-1 hover:text-gray-700">
                    Data <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((credit) => {
                const selected = isSelected(credit.id);
                const statusConf = STATUS_LABELS[credit.status];
                const disabled = credit.availableValue === 0;

                return (
                  <tr
                    key={credit.id}
                    onClick={() => !disabled && onToggleCredit(credit)}
                    className={`transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#0070f2]/[0.03]'
                        : disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <td className="w-10 px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={disabled}
                        onChange={() => onToggleCredit(credit)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 text-[#0070f2] focus:ring-[#0070f2]/30 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm font-mono font-medium text-[#0070f2]">{credit.code}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm text-gray-700">{credit.supplierName}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{credit.contraparte}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-gray-600">{CREDIT_TYPE_LABELS[credit.type]}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">{credit.description}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(credit.availableValue)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-sm text-gray-500">{formatDate(credit.issueDate)}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-xs text-gray-600">{credit.company}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      {statusConf && (
                        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConf.color} ${statusConf.bg}`}>
                          {statusConf.label}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Filter className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum credito encontrado</p>
                    <p className="text-xs text-gray-400 mt-0.5">Tente ajustar os filtros</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
