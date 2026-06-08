import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  layout?: 'horizontal' | 'stacked';
  secondaryIndicators?: {
    label: string;
    value: string | number;
  }[];
}

export function StatsCard({
  title,
  value,
  icon,
  layout = 'horizontal',
  secondaryIndicators
}: StatsCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-lg px-4 pt-3 pb-3 shadow-sm h-[120px]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      {layout === 'stacked' ? (
        <>
          <p className="mt-1.5 text-2xl font-semibold">{value}</p>
          {secondaryIndicators && secondaryIndicators.length > 0 && (
            <>
              <div className="mt-2 h-px bg-gray-300" />
              <div className="mt-1.5 flex gap-6">
                {secondaryIndicators.map((indicator, index) => (
                  <div key={index} className="text-sm">
                    <span className="text-gray-600">{indicator.label}: </span>
                    <span className="font-semibold text-gray-900">{indicator.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="mt-2 flex items-center gap-6">
          <p className="text-2xl font-semibold">{value}</p>
          {secondaryIndicators && secondaryIndicators.length > 0 && (
            <>
              <div className="h-12 w-[1px] bg-gray-200" />
              <div className="flex gap-4">
                {secondaryIndicators.map((indicator, index) => (
                  <div key={index} className="flex flex-col">
                    <span className="text-xs text-gray-500">{indicator.label}</span>
                    <span className="text-sm font-medium text-gray-900">{indicator.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
