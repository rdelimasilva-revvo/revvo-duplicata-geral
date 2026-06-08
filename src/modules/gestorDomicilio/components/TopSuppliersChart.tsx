import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { chartColors } from '@/modules/gestorDomicilio/lib/chart-utils';

const data = [
  { name: 'Nome Fornecedor 1', value: 4000 },
  { name: 'Nome Fornecedor 2', value: 3800 },
  { name: 'Nome Fornecedor 3', value: 3000 },
  { name: 'Nome Fornecedor 4', value: 2600 },
  { name: 'Nome Fornecedor 5', value: 2000 }
];

export function TopSuppliersChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm h-[300px]">
      <h3 className="text-sm font-semibold mb-4">Top 5 Sacadores - Duplicatas Recebidas</h3>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 25, right: 20, bottom: 5, left: 120 }}
            barSize={20}
          >
            <XAxis
              type="number"
              hide
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={(props) => {
                const { x, y, payload } = props;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    fill="#1D2D3E"
                    fontSize={13}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <Bar
              dataKey="value"
              fill={chartColors.primary}
              radius={[0, 4, 4, 0]}
            >
              {data.map((entry, index) => (
                <g key={`label-${index}`}>
                  {/* Value on the right */}
                  <text
                    x={entry.value * 0.8 + 20}
                    y={index * 32 + 20}
                    textAnchor="end"
                    fontSize={13}
                    fill="#1D2D3E"
                    dominantBaseline="middle"
                  >
                    {`R$ ${entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </text>
                </g>
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}