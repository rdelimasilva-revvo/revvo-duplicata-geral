import { ReactNode } from 'react';
import { cn } from '@/modules/notificacaoDuplicata/utils/cn';

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

export function DashboardCard({
  title,
  value,
  icon,
  trend,
  className
}: DashboardCardProps) {
  return (
    <div className={cn("bg-white rounded-lg p-6 shadow-sm border border-gray-100", className)}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        {icon && <div className="text-gray-400 opacity-70">{icon}</div>}
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-semibold",
            trend.isPositive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}