import { TableCheckbox } from '@/modules/gestorDomicilio/components/ui/TableCheckbox';

interface BillsTableHeaderProps {
  allSelected: boolean;
  onToggleAll: () => void;
}

export function BillsTableHeader({ allSelected, onToggleAll }: BillsTableHeaderProps) {
  return (
    <thead>
      <tr className="border-b border-gray-200 bg-gray-50">
        <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <TableCheckbox
              checked={allSelected}
              onChange={onToggleAll}
              aria-label="Selecionar todas as notificações"
            />
            <span>Tipo / ID Duplicata</span>
          </div>
        </th>
        <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
          Data de Emissão
        </th>
        <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
          Valor
        </th>
        <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
          Vencimento
        </th>
        <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
          Emitente
        </th>
        <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
          Novo Recebedor
        </th>
        <th className="px-4 py-2 font-medium text-left text-xs text-gray-600">
          Status
        </th>
        <th className="px-4 py-2 font-medium text-center text-xs text-gray-600 w-20">
          Ações
        </th>
      </tr>
    </thead>
  );
}
