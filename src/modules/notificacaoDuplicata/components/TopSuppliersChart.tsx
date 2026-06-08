import { chartColors } from '@/modules/notificacaoDuplicata/lib/chart-utils';

const data = [
  { name: 'Nome Fornecedor 1', value: 4000 },
  { name: 'Nome Fornecedor 2', value: 3800 },
  { name: 'Nome Fornecedor 3', value: 3000 },
  { name: 'Nome Fornecedor 4', value: 2600 },
  { name: 'Nome Fornecedor 5', value: 2000 }
];

export function TopSuppliersChart() {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm h-[300px] border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Top 5 Sacadores - Duplicatas Recebidas</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-700">{item.name}</span>
              <span className="text-xs font-semibold text-gray-900">
                R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: chartColors.secondary
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}