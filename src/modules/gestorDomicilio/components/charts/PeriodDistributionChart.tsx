import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Até 15 dias', value: 30 },
  { name: '16 a 30 dias', value: 25 },
  { name: '30 a 45 dias', value: 25 },
  { name: 'Mais de 45 dias', value: 20 }
];

const COLORS = [
  '#E74A51',  // Base red
  '#EC6B71',  // Lighter red
  '#F18E93',  // Even lighter red
  '#F7B1B4'   // Lightest red
];

export function PeriodDistributionChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm h-[240px]">
      <h3 className="text-sm font-semibold mb-4">Proporção por Período</h3>
      <div className="h-[calc(100%-2rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <Pie
              data={data}
              innerRadius={45}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              formatter={(value) => <span style={{ fontSize: '13px' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}