import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { chartConfig } from '@/modules/gestorDomicilio/config/chart';
import { ChartTooltip } from '@/modules/gestorDomicilio/components/charts/ChartTooltip';
import { dueAmountsData } from '@/modules/gestorDomicilio/data/chartData';

export function DueAmountsChart() {
  return (
    <div className="h-[408px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dueAmountsData}
          margin={chartConfig.margins}
          barSize={48}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={chartConfig.colors.grid}
          />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 13, fill: chartConfig.colors.text }}
            tickLine={{ stroke: chartConfig.colors.grid }}
            axisLine={{ stroke: chartConfig.colors.grid }}
          />
          <YAxis
            tickFormatter={(value) => `${value / 1000}k`}
            ticks={[0, 50000, 100000, 150000, 200000, 250000]}
            tick={{ fontSize: 13, fill: chartConfig.colors.text }}
            tickLine={{ stroke: chartConfig.colors.grid }}
            axisLine={{ stroke: chartConfig.colors.grid }}
          />
          <Tooltip content={<ChartTooltip />} />
          <Bar
            dataKey="amount"
            fill={chartConfig.colors.primary}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}