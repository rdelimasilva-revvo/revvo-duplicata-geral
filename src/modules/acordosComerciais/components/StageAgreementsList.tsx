import React from 'react';
import {
  Building2, ArrowRight, Clock, AlertTriangle, MessageSquare,
  RefreshCw, FileText, CheckCircle2, Send, Wallet, Link2, Search,
} from 'lucide-react';
import type { Agreement } from '../types';
import { STATUS_CONFIG } from '../types';
import { formatCurrency, formatDate } from '../utils';
import type { PipelineStageId } from './WorkflowPipeline';

interface StageAgreementsListProps {
  stageId: PipelineStageId;
  stageTitle: string;
  agreements: Agreement[];
  onOpenAgreement: (id: string) => void;
  onActionClick: (stageId: PipelineStageId, agreementId: string) => void;
}

export function StageAgreementsList({
  stageId,
  stageTitle,
  agreements,
  onOpenAgreement,
  onActionClick,
}: StageAgreementsListProps) {
  if (stageId === 'discover') {
    return (
      <EmptyState
        icon={<Search className="w-6 h-6" />}
        title="Fase de descoberta"
        description="Use o filtro de fornecedor e a lista de créditos por fornecedor abaixo para identificar oportunidades de abatimento."
        accent="blue"
      />
    );
  }

  if (stageId === 'free_balance') {
    return (
      <EmptyState
        icon={<Wallet className="w-6 h-6" />}
        title="Ação no portal do fornecedor"
        description="Quando um saldo livre é liberado, o fornecedor decide em qual NF aplicar. Acompanhe pelo painel do portal."
        accent="teal"
      />
    );
  }

  if (agreements.length === 0) {
    return (
      <EmptyState
        icon={getStageIcon(stageId)}
        title="Nenhum item nesta etapa"
        description={`Nenhum acordo se encontra em "${stageTitle}" no momento.`}
        accent="gray"
      />
    );
  }

  return (
    <div className="space-y-2">
      {agreements.map((a) => {
        const cfg = STATUS_CONFIG[a.status];
        const daysIdle = Math.max(0, Math.floor(
          (Date.now() - new Date(a.updatedAt).getTime()) / 86400000,
        ));
        return (
          <div
            key={a.id}
            className="bg-white border border-gray-200 rounded-xl p-3 hover:border-[#0070f2]/40 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold text-[#0070f2]">{a.code}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  {daysIdle >= 3 && (
                    <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {daysIdle}d parado
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-800 truncate mt-0.5">{a.supplierName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 truncate">{a.title}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-gray-400 uppercase">Valor</p>
                <p className="text-sm font-bold text-gray-800 tabular-nums">{formatCurrency(a.totalValue)}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Atualizado {formatDate(a.updatedAt)}</p>
              </div>

              <div className="flex flex-col gap-1.5 flex-shrink-0 w-44">
                <button
                  onClick={() => onActionClick(stageId, a.id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0070f2] text-white text-[11px] font-semibold rounded-md hover:bg-[#005bc4] transition-colors"
                >
                  {getActionIcon(stageId)}
                  {getActionLabel(stageId)}
                </button>
                <button
                  onClick={() => onOpenAgreement(a.id)}
                  className="flex items-center justify-center gap-1 px-3 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Detalhes
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {stageId === 'handle_refusal' && a.supplierResponse?.reason && (
              <div className="mt-3 pl-12 flex items-start gap-2 p-2 bg-rose-50 border border-rose-100 rounded-lg">
                <MessageSquare className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-rose-700 uppercase">Motivo da recusa</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">{a.supplierResponse.reason}</p>
                </div>
              </div>
            )}

            {stageId === 'link' && a.status === 'inconsistency' && (
              <div className="mt-3 pl-12 flex items-start gap-2 p-2 bg-rose-50 border border-rose-100 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-rose-700 uppercase">Inconsistência SAP</p>
                  <p className="text-[11px] text-rose-600 mt-0.5">Valores não bateram na sincronização. Revise os vínculos.</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getActionLabel(stageId: PipelineStageId): string {
  switch (stageId) {
    case 'link': return 'Vincular NFs';
    case 'send': return 'Reenviar aviso';
    case 'analyze': return 'Abrir proposta';
    case 'handle_refusal': return 'Nova versão';
    case 'finalize': return 'Efetivar ERP';
    default: return 'Abrir';
  }
}

function getActionIcon(stageId: PipelineStageId): React.ReactNode {
  switch (stageId) {
    case 'link': return <Link2 className="w-3 h-3" />;
    case 'send': return <Send className="w-3 h-3" />;
    case 'analyze': return <FileText className="w-3 h-3" />;
    case 'handle_refusal': return <RefreshCw className="w-3 h-3" />;
    case 'finalize': return <CheckCircle2 className="w-3 h-3" />;
    default: return <ArrowRight className="w-3 h-3" />;
  }
}

function getStageIcon(stageId: PipelineStageId): React.ReactNode {
  switch (stageId) {
    case 'link': return <Link2 className="w-6 h-6" />;
    case 'send': return <Send className="w-6 h-6" />;
    case 'analyze': return <FileText className="w-6 h-6" />;
    case 'handle_refusal': return <RefreshCw className="w-6 h-6" />;
    case 'finalize': return <CheckCircle2 className="w-6 h-6" />;
    default: return <Search className="w-6 h-6" />;
  }
}

function EmptyState({
  icon, title, description, accent,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: 'blue' | 'teal' | 'gray';
}) {
  const toneBg = accent === 'blue' ? 'bg-[#0070f2]/10' : accent === 'teal' ? 'bg-teal-100' : 'bg-gray-100';
  const toneText = accent === 'blue' ? 'text-[#0070f2]' : accent === 'teal' ? 'text-teal-700' : 'text-gray-500';
  return (
    <div className="bg-white border border-gray-200 border-dashed rounded-xl p-8 text-center">
      <div className={`w-12 h-12 rounded-full ${toneBg} ${toneText} flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto leading-relaxed">{description}</p>
    </div>
  );
}
