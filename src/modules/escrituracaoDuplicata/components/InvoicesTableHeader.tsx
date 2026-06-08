export function InvoicesTableHeader() {
  return (
    <thead>
      <tr className="bg-gray-50 border-b border-gray-200">
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Nº da Fatura
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Cliente
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Data de emissão
        </th>
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Data de vencimento
        </th>
        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Valor total
        </th>
        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Duplicata
        </th>
      </tr>
    </thead>
  );
}
