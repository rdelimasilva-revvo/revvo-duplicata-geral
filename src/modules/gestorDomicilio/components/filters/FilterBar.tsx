import { CaretUp, FunnelSimple } from '@phosphor-icons/react';
import { useState } from 'react';

export function FilterBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    tipoDuplicata: '',
    idDuplicata: '',
    dataEmissao: '',
    dataVencimento: '',
    emitente: '',
    acaoRequerida: ''
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 w-full overflow-hidden">
      <button
        className={`flex items-center justify-between w-full px-6 py-4 bg-white hover:bg-gray-50 transition-colors ${isExpanded ? '' : 'rounded-lg'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <FunnelSimple className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900 text-base">Filtros</span>
        </div>
        <CaretUp className={`w-5 h-5 text-gray-700 transition-transform ${isExpanded ? '' : 'rotate-180'}`} />
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2">
          <div className="grid grid-cols-3 gap-x-6 gap-y-6">
            <div>
              <label htmlFor="tipoDuplicata" className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Duplicata
              </label>
              <select
                id="tipoDuplicata"
                value={filters.tipoDuplicata}
                onChange={(e) => setFilters(prev => ({ ...prev, tipoDuplicata: e.target.value }))}
                className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Todos os tipos</option>
                <option value="mercantil">Duplicata Mercantil</option>
                <option value="servico">Duplicata de Serviço</option>
              </select>
            </div>

            <div>
              <label htmlFor="idDuplicata" className="block text-sm font-semibold text-gray-700 mb-2">
                ID Duplicata
              </label>
              <input
                type="text"
                id="idDuplicata"
                placeholder="Digite o ID..."
                value={filters.idDuplicata}
                onChange={(e) => setFilters(prev => ({ ...prev, idDuplicata: e.target.value }))}
                className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="dataEmissao" className="block text-sm font-semibold text-gray-700 mb-2">
                Data de Emissão
              </label>
              <input
                type="date"
                id="dataEmissao"
                value={filters.dataEmissao}
                onChange={(e) => setFilters(prev => ({ ...prev, dataEmissao: e.target.value }))}
                className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="dataVencimento" className="block text-sm font-semibold text-gray-700 mb-2">
                Data de Vencimento
              </label>
              <input
                type="date"
                id="dataVencimento"
                value={filters.dataVencimento}
                onChange={(e) => setFilters(prev => ({ ...prev, dataVencimento: e.target.value }))}
                className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="emitente" className="block text-sm font-semibold text-gray-700 mb-2">
                Emitente
              </label>
              <input
                type="text"
                id="emitente"
                placeholder="Nome ou CNPJ do emitente..."
                value={filters.emitente}
                onChange={(e) => setFilters(prev => ({ ...prev, emitente: e.target.value }))}
                className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white"
              />
            </div>

            <div>
              <label htmlFor="acaoRequerida" className="block text-sm font-semibold text-gray-700 mb-2">
                Ação Requerida
              </label>
              <select
                id="acaoRequerida"
                value={filters.acaoRequerida}
                onChange={(e) => setFilters(prev => ({ ...prev, acaoRequerida: e.target.value }))}
                className="w-full h-[26px] px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 bg-white appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Todas as ações</option>
                <option value="aceite">Aceite</option>
                <option value="recusa">Recusa</option>
                <option value="prorrogacao">Prorrogação</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setFilters({ tipoDuplicata: '', idDuplicata: '', dataEmissao: '', dataVencimento: '', emitente: '', acaoRequerida: '' })}
              className="px-6 h-[26px] bg-white text-gray-700 font-medium text-sm rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={() => console.log('Aplicar filtros:', filters)}
              className="px-6 h-[26px] bg-blue-600 text-white font-medium text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
