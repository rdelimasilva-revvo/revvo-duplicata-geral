import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS: Record<string, string> = {
  'Aceite Automático': '#152D6B',
  'Aceite Manual': '#2E5EAA',
  'Em Fila de Análise Manual': '#6AADE4',
  'Recusa Automática': '#6B7A8D',
  'Recusa Manual': '#A3B1C2',
  'Contestada': '#3B6E8F',
};

const PERIOD_OPTIONS = [
  { value: '7days', label: 'Últimos 7 dias' },
  { value: '15days', label: 'Últimos 15 dias' },
  { value: 'monthly', label: 'Mensal' },
] as const;

const generateMonthlyData = () => {
  const months = [
    'Dez/23', 'Jan/24', 'Fev/24', 'Mar/24', 'Abr/24', 'Mai/24',
    'Jun/24', 'Jul/24', 'Ago/24', 'Set/24', 'Out/24', 'Nov/24', 'Dez/24'
  ];

  return months.map((month, index) => {
    const baseMultiplier = 1 + (index * 0.08);
    return {
      name: month,
      'Em Fila de Análise Manual': Math.round(25 * baseMultiplier + Math.random() * 15),
      'Recusa Manual': Math.round(3 * baseMultiplier + Math.random() * 3),
      'Recusa Automática': Math.round(5 * baseMultiplier + Math.random() * 4),
      'Aceite Manual': Math.round(120 * baseMultiplier + Math.random() * 30),
      'Aceite Automático': Math.round(330 * baseMultiplier + Math.random() * 60),
      'Contestada': Math.round(2 * baseMultiplier + Math.random() * 2),
    };
  });
};

const generate7DaysData = () => {
  const days = ['06/12', '07/12', '08/12', '09/12', '10/12', '11/12', '12/12'];
  return days.map((day) => ({
    name: day,
    'Em Fila de Análise Manual': Math.round(3 + Math.random() * 5),
    'Recusa Manual': Math.round(1 + Math.random() * 2),
    'Recusa Automática': Math.round(1 + Math.random() * 2),
    'Aceite Manual': Math.round(15 + Math.random() * 10),
    'Aceite Automático': Math.round(40 + Math.random() * 18),
    'Contestada': Math.round(Math.random() * 2),
  }));
};

const generate15DaysData = () => {
  const days = [
    '28/11', '29/11', '30/11', '01/12', '02/12', '03/12', '04/12',
    '05/12', '06/12', '07/12', '08/12', '09/12', '10/12', '11/12', '12/12'
  ];
  return days.map((day) => ({
    name: day,
    'Em Fila de Análise Manual': Math.round(4 + Math.random() * 6),
    'Recusa Manual': Math.round(1 + Math.random() * 2),
    'Recusa Automática': Math.round(1 + Math.random() * 3),
    'Aceite Manual': Math.round(20 + Math.random() * 12),
    'Aceite Automático': Math.round(45 + Math.random() * 22),
    'Contestada': Math.round(Math.random() * 3),
  }));
};

const dataByPeriod: Record<string, any[]> = {
  '7days': generate7DaysData(),
  '15days': generate15DaysData(),
  'monthly': generateMonthlyData(),
};

interface ManifestationStatusChartProps {
  period?: string;
}

export function ManifestationStatusChart({ period: _externalPeriod }: ManifestationStatusChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const data = dataByPeriod[selectedPeriod] || dataByPeriod['monthly'];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6 flex-shrink-0 gap-3">
        <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">Status de Manifestação</h3>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {PERIOD_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSelectedPeriod(option.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                selectedPeriod === option.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            labelStyle={{ color: '#111827', fontWeight: 600, marginBottom: '8px' }}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
            iconSize={10}
            align="left"
            formatter={(value) => <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 400 }}>{value}</span>}
          />
          <Bar dataKey="Aceite Automático" stackId="a" fill={COLORS['Aceite Automático']} radius={0} />
          <Bar dataKey="Aceite Manual" stackId="a" fill={COLORS['Aceite Manual']} radius={0} />
          <Bar dataKey="Em Fila de Análise Manual" stackId="a" fill={COLORS['Em Fila de Análise Manual']} radius={0} />
          <Bar dataKey="Recusa Automática" stackId="a" fill={COLORS['Recusa Automática']} radius={0} />
          <Bar dataKey="Recusa Manual" stackId="a" fill={COLORS['Recusa Manual']} radius={0} />
          <Bar dataKey="Contestada" stackId="a" fill={COLORS['Contestada']} radius={0} />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
