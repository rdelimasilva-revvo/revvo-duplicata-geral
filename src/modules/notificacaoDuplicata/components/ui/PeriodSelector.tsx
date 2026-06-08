import { Calendar } from 'lucide-react';
import { useState } from 'react';

interface PeriodSelectorProps {
  onChange?: (period: string) => void;
}

export function PeriodSelector({ onChange }: PeriodSelectorProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30days');

  const periods = [
    { value: '7days', label: 'Últimos 7 dias' },
    { value: '30days', label: 'Últimos 30 dias' },
    { value: '90days', label: 'Últimos 90 dias' },
    { value: 'custom', label: 'Personalizado' },
  ];

  const handleChange = (value: string) => {
    setSelectedPeriod(value);
    onChange?.(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
      <select
        value={selectedPeriod}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
}
