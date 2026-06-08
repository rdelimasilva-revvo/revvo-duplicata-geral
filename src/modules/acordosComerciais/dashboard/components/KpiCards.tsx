import React from 'react';
import { DollarSign, Activity, TrendingUp, Clock } from 'lucide-react';
import type { KpiMetrics } from '../hooks';

interface KpiCardsProps {
  metrics: KpiMetrics;
}

const formatCompact = (value: number) => {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}k`;
  return `R$ ${value.toFixed(0)}`;
};

export function KpiCards({ metrics }: KpiCardsProps) {
  const cards = [
    {
      label: 'Valor Total Contratado',
      value: formatCompact(metrics.totalValue),
      hint: `${metrics.totalCount} acordos em andamento`,
      icon: <DollarSign className="w-5 h-5" />,
      tone: 'blue' as const,
    },
    {
      label: 'Acordos Ativos',
      value: String(metrics.activeCount),
      hint: `${formatCompact(metrics.activeValue)} em vigor`,
      icon: <Activity className="w-5 h-5" />,
      tone: 'emerald' as const,
    },
    {
      label: 'Taxa de Conversão',
      value: `${metrics.conversionRate.toFixed(0)}%`,
      hint: 'Aprovados / concluídos',
      icon: <TrendingUp className="w-5 h-5" />,
      tone: 'teal' as const,
    },
    {
      label: 'Ciclo Médio',
      value: `${metrics.avgCycleDays}d`,
      hint: 'Do rascunho à assinatura',
      icon: <Clock className="w-5 h-5" />,
      tone: 'amber' as const,
    },
  ];

  const palette = {
    blue: 'text-[#0070f2] bg-[#0070f2]/10 ring-[#0070f2]/10',
    emerald: 'text-emerald-600 bg-emerald-100 ring-emerald-50',
    teal: 'text-teal-600 bg-teal-100 ring-teal-50',
    amber: 'text-amber-600 bg-amber-100 ring-amber-50',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1.5 tabular-nums truncate">
                {card.value}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">{card.hint}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ring-4 flex items-center justify-center flex-shrink-0 ${palette[card.tone]}`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
