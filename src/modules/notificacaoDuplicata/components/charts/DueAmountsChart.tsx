import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartTooltip } from '@/modules/notificacaoDuplicata/components/charts/ChartTooltip';
import { dueAmountsData } from '@/modules/notificacaoDuplicata/data/chartData';

export function DueAmountsChart() {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dueAmountsData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          barSize={24}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e5e7eb"
          />
          <XAxis
            type="number"
            tickFormatter={(value) => `${value / 1000}k`}
            ticks={[0, 50000, 100000, 150000, 200000, 250000]}
            tick={{ fontSize: 11, fill: "#1D2D3E" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            type="category"
            dataKey="formattedDate"
            tick={{ fontSize: 11, fill: "#1D2D3E" }}
            tickLine={{ stroke: "#e5e7eb" }}
            axisLine={{ stroke: "#e5e7eb" }}
            width={70}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="amount"
            fill="#0052CC"
            radius={0}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}