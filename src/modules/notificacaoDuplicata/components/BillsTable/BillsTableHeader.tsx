import { ChevronDown } from 'lucide-react';
import { tableStyles } from '@/modules/notificacaoDuplicata/components/BillsTable/styles';

export function BillsTableHeader() {
  return (
    <thead>
      <tr style={{ 
        height: tableStyles.sizing.rowHeight,
        backgroundColor: tableStyles.colors.background.header 
      }}>
        <th className="px-6 text-left">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300"
              aria-label="Selecionar Tudo"
            />
            <span className="ml-3 font-bold" style={{ color: tableStyles.colors.text.white }}>Duplicata</span>
          </div>
        </th>
        <th className="px-6 text-left font-bold" style={{ color: tableStyles.colors.text.white }}>Nº da Parcela</th>
        <th className="px-6 text-left font-bold" style={{ color: tableStyles.colors.text.white }}>Fornecedor</th>
        <th className="px-6 text-left font-bold" style={{ color: tableStyles.colors.text.white }}>Vencimento</th>
        <th className="px-6 text-left font-bold" style={{ color: tableStyles.colors.text.white }}>Valor Atualizado</th>
        <th className="px-6 text-left font-bold" style={{ color: tableStyles.colors.text.white }}>
          <div className="flex items-center gap-1">
            Situação da Duplicata
            <ChevronDown className="w-4 h-4" />
          </div>
        </th>
        <th className="px-6 text-left font-bold" style={{ color: tableStyles.colors.text.white }}>Manifestação</th>
        <th className="px-6 text-left w-8 font-bold" style={{ color: tableStyles.colors.text.white }}>Ações</th>
      </tr>
    </thead>
  );
}