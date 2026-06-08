import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, Building2, Calendar, FileText, CreditCard, RotateCcw, CircleDot } from 'lucide-react';
import { useAbatimentoStore } from '../store';

export function FiltersPanel() {
  const {
    suppliers,
    selectedSupplierId,
    setSelectedSupplier,
    filters,
    updateFilter,
    getSupplierCredits,
  } = useAbatimentoStore();

  const [supplierSearch, setSupplierSearch] = useState('');
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter(
        (s) =>
          s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
          s.cnpj.includes(supplierSearch)
      ),
    [suppliers, supplierSearch]
  );

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId);
  const supplierCredits = getSupplierCredits();
  const hasCredits = supplierCredits.length > 0;

  const handleReset = () => {
    updateFilter('period', { from: '', to: '' });
    updateFilter('duplicateStatus', 'all');
    updateFilter('creditType', 'all');
    updateFilter('offsetStatus', 'all');
    updateFilter('futureOffsetting', false);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Fornecedor
        </h3>
        <div className="relative">
          <div
            onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
            className="w-full flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
          >
            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className={`text-sm flex-1 truncate ${selectedSupplier ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
              {selectedSupplier ? selectedSupplier.name : 'Selecionar fornecedor...'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSupplierDropdown ? 'rotate-180' : ''}`} />
          </div>

          {showSupplierDropdown && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome ou CNPJ..."
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredSuppliers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSupplier(s.id);
                      setShowSupplierDropdown(false);
                      setSupplierSearch('');
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors ${
                      selectedSupplierId === s.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.cnpj}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedSupplierId && !hasCredits && (
        <div className="p-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <CreditCard className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-amber-700">
              Nao existem creditos disponiveis para este fornecedor
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Periodo
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">De</label>
              <input
                type="date"
                value={filters.period.from}
                onChange={(e) => updateFilter('period', { ...filters.period, from: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 mb-0.5">Ate</label>
              <input
                type="date"
                value={filters.period.to}
                onChange={(e) => updateFilter('period', { ...filters.period, to: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Situacao da Duplicata
          </h3>
          <select
            value={filters.duplicateStatus}
            onChange={(e) => updateFilter('duplicateStatus', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
          >
            <option value="all">Todos</option>
            <option value="ativa">Ativa</option>
            <option value="vencida">Vencida</option>
            <option value="liquidada">Liquidada</option>
            <option value="protestada">Protestada</option>
          </select>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            Tipo de Credito
          </h3>
          <select
            value={filters.creditType}
            onChange={(e) => updateFilter('creditType', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
          >
            <option value="all">Todos</option>
            <option value="devolucao">Devolucao</option>
            <option value="bonificacao">Bonificacao</option>
            <option value="acordo_comercial">Acordo Comercial</option>
            <option value="nota_debito">Nota de Debito</option>
          </select>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <CircleDot className="w-3.5 h-3.5" />
            Situacao Operacional
          </h3>
          <select
            value={filters.offsetStatus}
            onChange={(e) => updateFilter('offsetStatus', e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0070f2]/30 focus:border-[#0070f2]"
          >
            <option value="all">Todas</option>
            <option value="livre">Livre para vinculacao</option>
            <option value="pendente">Pendente de aprovacao</option>
            <option value="parcialmente_compensada">Parcialmente compensada</option>
            <option value="liquidada">Liquidada</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <button
              onClick={() => updateFilter('futureOffsetting', !filters.futureOffsetting)}
              className={`relative w-9 h-5 rounded-full transition-colors ${
                filters.futureOffsetting ? 'bg-[#0070f2]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  filters.futureOffsetting ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            <span className="text-xs text-gray-600">Incluir liquidadas</span>
          </label>
        </div>
      </div>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar filtros
        </button>
      </div>
    </div>
  );
}
