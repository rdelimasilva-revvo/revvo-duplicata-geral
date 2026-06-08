import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartTooltip } from '@/modules/gestorDomicilio/components/charts/ChartTooltip';
import { dueAmountsData } from '@/modules/gestorDomicilio/data/chartData';

export function DueAmountsChart() {
  return (
    <div className="h-[408px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dueAmountsData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barSize={48}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 13, fill: "#1D2D3E" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tickFormatter={(value) => `${value / 1000}k`}
            ticks={[0, 50000, 100000, 150000, 200000, 250000]}
            tick={{ fontSize: 13, fill: "#1D2D3E" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="amount"
            fill="#E74A51"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}