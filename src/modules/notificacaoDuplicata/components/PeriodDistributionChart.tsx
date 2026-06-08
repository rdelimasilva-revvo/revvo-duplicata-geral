import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Até 15 dias', value: 30 },
  { name: '16 a 30 dias', value: 25 },
  { name: '30 a 45 dias', value: 25 },
  { name: 'Mais de 45 dias', value: 20 }
];

const COLORS = ['#EF6461', '#F4A19F', '#F8C9C8', '#FDE8E7'];

export function PeriodDistributionChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm h-[300px] border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Proporção por Período</h3>
      <div className="relative" style={{ height: 'calc(100% - 3rem)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: -25 }}>
            <Pie
              data={data}
              cx="32%"
              cy="50%"
              innerRadius={38}
              outerRadius={60}
              paddingAngle={3}
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
              iconSize={8}
              wrapperStyle={{ paddingLeft: '5px', fontSize: '12px' }}
              formatter={(value) => <span style={{ fontSize: '11px', color: '#4B5563' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-1/2 left-[32%] transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <p className="text-lg font-bold text-gray-900">{total}%</p>
          <p className="text-[9px] text-gray-500">Total</p>
        </div>
      </div>
    </div>
  );
}