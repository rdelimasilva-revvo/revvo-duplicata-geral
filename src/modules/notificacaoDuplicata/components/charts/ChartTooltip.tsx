import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
      <p className="text-sm font-medium text-gray-900">{label}</p>
      <p className="text-sm font-semibold text-blue-600">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}