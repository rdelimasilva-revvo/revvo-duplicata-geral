import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { chartColors } from '@/modules/notificacaoDuplicata/lib/chart-utils';

const data = [
  { name: 'Até 15 dias', value: 35, color: '#0052CC' },
  { name: '16 a 30 dias', value: 28, color: '#68B9E8' },
  { name: '30 a 45 dias', value: 22, color: '#F59E0B' },
  { name: 'Mais que 45 dias', value: 15, color: '#9CA3AF' }
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
        <p className="text-sm font-semibold text-gray-700">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex flex-col gap-2 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.value}</span>
          </div>
          <span className="font-semibold text-gray-900">{entry.payload.value}%</span>
        </div>
      ))}
    </div>
  );
};

export function PeriodProportionChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm h-[300px] border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Proporção por Período</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
