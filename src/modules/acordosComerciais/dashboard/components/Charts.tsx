import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
} from 'recharts';
import type { PipelineStageData, TimeSeriesPoint } from '../hooks';
import type { AgreementRecord } from '../types';
import { CONTRACT_TYPE_LABEL } from '../types';

const formatCompact = (value: number) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
};

const chartCard = 'bg-white border border-gray-200 rounded-xl p-5';

export function PipelineValueChart({ data }: { data: PipelineStageData[] }) {
  return (
    <div className={chartCard}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800">Valor por etapa</h3>
        <p className="text-[11px] text-gray-500">Distribuição financeira dos acordos ao longo do processo</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              padding: 8,
            }}
            formatter={(value: number) => [formatCompact(value), 'Valor']}
            labelStyle={{ fontWeight: 600, color: '#334155', fontSize: 11 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.id} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EvolutionChart({ data }: { data: TimeSeriesPoint[] }) {
  return (
    <div className={chartCard}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">Evolução Mensal</h3>
          <p className="text-[11px] text-gray-500">Acordos criados vs. finalizados</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              padding: 8,
            }}
            labelStyle={{ fontWeight: 600, color: '#334155', fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          <Line
            type="monotone"
            dataKey="created"
            name="Criados"
            stroke="#0070f2"
            strokeWidth={2.5}
            dot={{ fill: '#0070f2', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="closed"
            name="Encerrados"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ContractTypeChart({ agreements }: { agreements: AgreementRecord[] }) {
  const data = React.useMemo(() => {
    const agg: Record<string, number> = {};
    agreements.forEach((a) => {
      const key = CONTRACT_TYPE_LABEL[a.contractType];
      agg[key] = (agg[key] || 0) + a.totalValue;
    });
    return Object.entries(agg).map(([name, value]) => ({ name, value }));
  }, [agreements]);

  const colors = ['#0070f2', '#14b8a6', '#f59e0b'];

  return (
    <div className={chartCard}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-800">Modalidade de Contrato</h3>
        <p className="text-[11px] text-gray-500">Valor por tipo de operação</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {data.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              fontSize: 12,
              padding: 8,
            }}
            formatter={(value: number) => [formatCompact(value), 'Valor']}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
