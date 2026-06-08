import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Até 15 dias', value: 30 },
  { name: '16 a 30 dias', value: 25 },
  { name: '30 a 45 dias', value: 25 },
  { name: 'Mais de 45 dias', value: 20 }
];

const COLORS = [
  '#10B981',
  '#68B9E8',
  '#F59E0B',
  '#9CA3AF'
];

const renderCenterLabel = () => {
  return (
    <text
      x="35%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      <tspan
        x="35%"
        dy="-0.3em"
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          fill: '#1f2937'
        }}
      >
        100%
      </tspan>
      <tspan
        x="35%"
        dy="1.4em"
        style={{
          fontSize: '12px',
          fill: '#6b7280'
        }}
      >
        Total
      </tspan>
    </text>
  );
};

export function PeriodDistributionChart() {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">Proporção por Período</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
            <Pie
              data={data}
              cx="35%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              {renderCenterLabel()}
            </Pie>
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              wrapperStyle={{
                paddingLeft: '20px',
                fontSize: '13px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}