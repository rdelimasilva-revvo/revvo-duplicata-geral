import { ChevronDown } from 'lucide-react';
import { Bill } from '@/modules/gestorDomicilio/components/BillsTable/types';

const bills: Bill[] = [
  {
    id: '112233445008',
    parcelNumber: '001',
    supplier: '222222222',
    dueDate: 'Dec 25, 2023',
    amount: 20000.00,
    status: 'Disponível para Negociar',
    manifestation: 'Manifestação Aceite/Recusa'
  },
  {
    id: '112233445007',
    parcelNumber: '002',
    supplier: '222222222',
    dueDate: 'Dec 24, 2023',
    amount: 70000.00,
    status: 'Duplicata Negociada',
    manifestation: 'Não Manifestado'
  },
  {
    id: '112233445006',
    parcelNumber: '003',
    supplier: '222222222',
    dueDate: 'Dec 23, 2023',
    amount: 60000.00,
    status: 'Duplicata Negociada',
    manifestation: 'Aceito'
  },
  {
    id: '112233445005',
    parcelNumber: '004',
    supplier: '333333333',
    dueDate: 'Dec 22, 2023',
    amount: 40000.00,
    status: 'Duplicata Negociada',
    manifestation: 'Aceito'
  },
  {
    id: '112233445003',
    parcelNumber: '005',
    supplier: '333333333',
    dueDate: 'Dec 21, 2023',
    amount: 30000.00,
    status: 'Duplicata Negociada',
    manifestation: 'Aceito'
  },
  {
    id: '112233445002',
    parcelNumber: '006',
    supplier: '333333333',
    dueDate: 'Dec 20, 2023',
    amount: 20000.00,
    status: 'Disponível para Negociar',
    manifestation: 'Aceito'
  },
  {
    id: '112233445001',
    parcelNumber: '007',
    supplier: '333333333',
    dueDate: 'Dec 19, 2023',
    amount: 10000.00,
    status: 'Disponível para Negociar',
    manifestation: 'Recusado'
  },
  {
    id: '112233445001',
    parcelNumber: '008',
    supplier: '333333333',
    dueDate: 'Dec 18, 2023',
    amount: 10000.00,
    status: 'Disponível para Negociar',
    manifestation: 'Recusado'
  }
];

export function BillsTable() {
  return (
    <div className="bg-white rounded-lg shadow-sm mt-6">
      <div className="px-6 py-4 text-sm text-gray-500 border-b border-gray-200">
        Nenhuma parcela/duplicata selecionada
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-4 font-normal text-left bg-white">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                    aria-label="Selecionar Tudo"
                  />
                  <span className="ml-3">Duplicata</span>
                </div>
              </th>
              <th className="px-6 py-4 font-normal text-left bg-white">Nº da Parcela</th>
              <th className="px-6 py-4 font-normal text-left bg-white">Fornecedor</th>
              <th className="px-6 py-4 font-normal text-left bg-white">Vencimento</th>
              <th className="px-6 py-4 font-normal text-left bg-white">Valor Atualizado</th>
              <th className="px-6 py-4 font-normal text-left bg-white">
                <div className="flex items-center gap-1">
                  Situação da Duplicata
                  <ChevronDown className="w-4 h-4" />
                </div>
              </th>
              <th className="px-6 py-4 font-normal text-left bg-white">Manifestação</th>
              <th className="px-6 py-4 font-normal text-left bg-white w-8"></th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={`${bill.id}-${bill.parcelNumber}`} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300"
                      aria-label={`Selecionar duplicata ${bill.id}`}
                    />
                    <span className="ml-3 text-blue-600 cursor-pointer">{bill.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{bill.parcelNumber}</td>
                <td className="px-6 py-4">{bill.supplier}</td>
                <td className="px-6 py-4">{bill.dueDate}</td>
                <td className="px-6 py-4">
                  {`R$ ${bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </td>
                <td className="px-6 py-4">
                  <span className={bill.status === 'Disponível para Negociar' ? 'text-blue-600' : ''}>
                    {bill.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={bill.manifestation === 'Manifestação Aceite/Recusa' ? 'text-blue-600' : ''}>
                    {bill.manifestation}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <ChevronDown className="w-4 h-4 text-gray-400 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}