import { Filter } from 'lucide-react';
import type { PipelineStageData } from '../hooks';
import { PIPELINE_CONFIG, type PipelineStatus, type AgreementRecord } from '../types';

interface PipelineBoardProps {
  data: PipelineStageData[];
  agreements: AgreementRecord[];
  activeStatus: PipelineStatus | 'all';
  onStageSelect: (status: PipelineStatus | 'all') => void;
  onAgreementClick: (agreement: AgreementRecord) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function PipelineBoard({
  data,
  agreements,
  activeStatus,
  onStageSelect,
}: PipelineBoardProps) {
  const totalCount = agreements.length;
  const maxCount = Math.max(...data.map((s) => s.count), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-full flex flex-col">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0070f2]/10 flex items-center justify-center">
            <Filter className="w-4 h-4 text-[#0070f2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">Pipeline de Acordos</h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Status do funil por etapa · {totalCount} {totalCount === 1 ? 'acordo' : 'acordos'}
            </p>
          </div>
        </div>
        {activeStatus !== 'all' && (
          <button
            onClick={() => onStageSelect('all')}
            className="text-[11px] font-semibold text-[#0070f2] hover:underline"
          >
            Limpar filtro
          </button>
        )}
      </div>

      <div className="p-5 space-y-2.5 flex-1">
        {data.map((stage) => {
          const cfg = PIPELINE_CONFIG[stage.id];
          const isActive = activeStatus === stage.id;
          const pctConversion = totalCount > 0 ? (stage.count / totalCount) * 100 : 0;
          const barWidth = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;

          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => onStageSelect(isActive ? 'all' : stage.id)}
              className={`w-full text-left rounded-lg px-3 py-2.5 border transition-all ${
                isActive
                  ? `${cfg.border} ${cfg.bg} shadow-sm`
                  : 'border-transparent hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                  <span className={`text-[11px] font-semibold ${cfg.color} truncate`}>
                    {cfg.label}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 text-[11px] tabular-nums">
                  <span className="font-bold text-gray-800">{stage.count}</span>
                  <span className="text-gray-500 hidden sm:inline">
                    {formatCurrency(stage.value)}
                  </span>
                  <span className="font-semibold text-gray-700 w-10 text-right">
                    {pctConversion.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, backgroundColor: cfg.fill }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
