import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bill } from '@/modules/notificacaoDuplicata/components/BillsTable/types';
import { tableStyles } from '@/modules/notificacaoDuplicata/components/BillsTable/styles';
import { DotsThree } from '@phosphor-icons/react';
import { ROUTES } from '@/constants/routes';

interface BillsTableRowProps {
  bill: Bill;
}

export function BillsTableRow({ bill }: BillsTableRowProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  return (
    <tr style={{ 
      height: tableStyles.sizing.rowHeight,
      borderBottom: `1px solid ${tableStyles.colors.border}`
    }}>
      <td className="px-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300"
            aria-label={`Selecionar duplicata ${bill.id}`}
          />
          <span 
            className="ml-3"
            style={{ color: tableStyles.colors.text.primary }}
          >
            {bill.id}
          </span>
        </div>
      </td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>{bill.parcelNumber}</td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>{bill.supplier}</td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>{bill.dueDate}</td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>
        {`R$ ${bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      </td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>
        <span style={{ color: tableStyles.colors.text.primary }}>{bill.status}</span>
      </td>
      <td className="px-6" style={{ color: tableStyles.colors.text.primary }}>
        <span style={{ color: tableStyles.colors.text.primary }}>{bill.manifestation}</span>
      </td>
      <td className="px-6 relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Ações"
        >
          <DotsThree size={20} className="text-gray-600" />
        </button>
        {showActions && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowActions(false)}
            />
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  console.log('Ver detalhes', bill.id);
                  setShowActions(false);
                }}
              >
                Ver detalhes
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  navigate(`/app/${ROUTES.NOTIFICACOES_DUPLICATAS_MANIFESTACAO}?id=${bill.id}`);
                  setShowActions(false);
                }}
              >
                Manifestação
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  console.log('Abatimento/Acordo comercial', bill.id);
                  setShowActions(false);
                }}
              >
                Abatimento/Acordo Comercial
              </button>
            </div>
          </>
        )}
      </td>
    </tr>
  );
}