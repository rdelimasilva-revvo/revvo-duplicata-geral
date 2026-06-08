import { ReactNode } from 'react';
import { cn } from '@/modules/notificacaoDuplicata/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function DashboardCard({ title, value, icon, trend, className }: DashboardCardProps) {
  return (
    <div className={cn("bg-white rounded-lg p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold">{value}</p>
        {trend && (
          <span className={cn(
            "ml-2 text-sm",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "+" : "-"}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}