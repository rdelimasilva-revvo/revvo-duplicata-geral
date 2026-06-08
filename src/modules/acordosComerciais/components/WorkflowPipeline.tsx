import React from 'react';
import {
  Search, Link2, Send, Eye, RefreshCw, CheckCircle2, Wallet,
  ChevronRight, ArrowRight,
} from 'lucide-react';
import type { Agreement } from '../types';

export type PipelineStageId =
  | 'discover'
  | 'link'
  | 'send'
  | 'analyze'
  | 'handle_refusal'
  | 'finalize'
  | 'free_balance';

export interface PipelineStage {
  id: PipelineStageId;
  order: number;
  short: string;
  title: string;
  when: string;
  want: string;
  outcome: string;
  success: string;
  count: number;
  icon: React.ReactNode;
  accent: string;
  accentBg: string;
  accentSoft: string;
  persona: 'gestor' | 'fornecedor' | 'ambos';
  actionLabel: string;
  agreements: Agreement[];
}

interface WorkflowPipelineProps {
  agreements: Agreement[];
  creditsAvailableCount: number;
  freeBalanceCount: number;
  activeStageId: PipelineStageId | null;
  onStageSelect: (stageId: PipelineStageId) => void;
  onPrimaryAction: (stageId: PipelineStageId) => void;
}

export function buildStages(
  agreements: Agreement[],
  creditsAvailableCount: number,
  freeBalanceCount: number,
): PipelineStage[] {
  const byStatus = (statuses: Agreement['status'][]) =>
    agreements.filter((a) => statuses.includes(a.status));

  const linkItems = byStatus(['draft', 'sap_syncing', 'pending_linkage', 'inconsistency']);
  const sendItems = byStatus(['pending_supplier_aceite']);
  const analyzeItems = sendItems;
  const refusalItems = byStatus(['rejected']);
  const finalizeItems = byStatus(['signature_pending', 'signed']);

  return [
    {
      id: 'discover',
      order: 1,
      short: 'Visualizar',
      title: 'Visualizar créditos e NFs elegíveis',
      when: 'Entro no sistema e seleciono um fornecedor',
      want: 'Visualizar os créditos pendentes e as faturas compatíveis',
      outcome: 'Identificar oportunidades de abatimento',
      success: 'Filtro que agrupa o crédito com as notas da mesma empresa',
      count: creditsAvailableCount,
      icon: <Search className="w-4 h-4" />,
      accent: 'text-[#0070f2]',
      accentBg: 'bg-[#0070f2]',
      accentSoft: 'bg-[#0070f2]/10',
      persona: 'gestor',
      actionLabel: 'Explorar créditos',
      agreements: [],
    },
    {
      id: 'link',
      order: 2,
      short: 'Vincular',
      title: 'Selecionar NFs e Vincular crédito',
      when: 'Seleciono um crédito e distribuo o valor pelas faturas',
      want: 'Acompanhar a atualização do saldo em tempo real',
      outcome: 'Garantir que a conta feche sem diferença',
      success: 'A tela distribui o crédito entre as faturas e bloqueia a operação se os valores não baterem',
      count: linkItems.length,
      icon: <Link2 className="w-4 h-4" />,
      accent: 'text-amber-600',
      accentBg: 'bg-amber-500',
      accentSoft: 'bg-amber-100',
      persona: 'gestor',
      actionLabel: 'Vincular agora',
      agreements: linkItems,
    },
    {
      id: 'send',
      order: 3,
      short: 'Enviar',
      title: 'Enviar ao fornecedor',
      when: 'Envio a proposta finalizada',
      want: 'Que o fornecedor seja notificado para entrar no portal',
      outcome: 'Garantir que ele analise a proposta no prazo',
      success: 'Comprova que a proposta foi enviada e lida, e cobra o fornecedor automaticamente antes do prazo acabar',
      count: sendItems.length,
      icon: <Send className="w-4 h-4" />,
      accent: 'text-cyan-600',
      accentBg: 'bg-cyan-500',
      accentSoft: 'bg-cyan-100',
      persona: 'gestor',
      actionLabel: 'Reenviar lembrete',
      agreements: sendItems,
    },
    {
      id: 'analyze',
      order: 4,
      short: 'Analisar',
      title: 'Analisar proposta',
      when: 'O fornecedor acessa o sistema para conferir a proposta',
      want: 'Registrar se aprovo ou recuso o acordo',
      outcome: 'Fechar o acordo ou pedir para ajustar os valores',
      success: 'Registro de quem tomou a decisão de aceitar ou recusar',
      count: analyzeItems.length,
      icon: <Eye className="w-4 h-4" />,
      accent: 'text-orange-600',
      accentBg: 'bg-orange-500',
      accentSoft: 'bg-orange-100',
      persona: 'fornecedor',
      actionLabel: 'Ver pendências',
      agreements: analyzeItems,
    },
    {
      id: 'handle_refusal',
      order: 5,
      short: 'Recusa',
      title: 'Tratamento de recusa',
      when: 'O fornecedor recusa a proposta inicial',
      want: 'Visualizar o comentário dele e alterar os vínculos',
      outcome: 'Gerar uma nova versão sem perder o histórico',
      success: 'Possibilidade de corrigir a proposta recusada sem perder o histórico do que já foi negociado',
      count: refusalItems.length,
      icon: <RefreshCw className="w-4 h-4" />,
      accent: 'text-rose-600',
      accentBg: 'bg-rose-500',
      accentSoft: 'bg-rose-100',
      persona: 'gestor',
      actionLabel: 'Revisar e refazer',
      agreements: refusalItems,
    },
    {
      id: 'finalize',
      order: 6,
      short: 'Efetivar',
      title: 'Ação de aceite e efetivação',
      when: 'Acordo aprovado pelo fornecedor',
      want: 'Que os dados sejam enviados para o sistema',
      outcome: 'Efetivar a baixa financeira e quitar a dívida',
      success: 'Integração com o ERP que realiza a compensação',
      count: finalizeItems.length,
      icon: <CheckCircle2 className="w-4 h-4" />,
      accent: 'text-emerald-600',
      accentBg: 'bg-emerald-500',
      accentSoft: 'bg-emerald-100',
      persona: 'gestor',
      actionLabel: 'Ver efetivações',
      agreements: finalizeItems,
    },
    {
      id: 'free_balance',
      order: 7,
      short: 'Saldo livre',
      title: 'Saldo livre para o fornecedor',
      when: 'O cliente libera um saldo livre para o fornecedor usar onde quiser',
      want: 'O fornecedor precisa poder determinar em qual NF o crédito será lançado',
      outcome: 'Ter total controle sobre os recebimentos',
      success: 'O fornecedor resolve o abatimento por conta própria, e o sistema já entende isso como concluído',
      count: freeBalanceCount,
      icon: <Wallet className="w-4 h-4" />,
      accent: 'text-teal-600',
      accentBg: 'bg-teal-500',
      accentSoft: 'bg-teal-100',
      persona: 'fornecedor',
      actionLabel: 'Abrir portal do fornecedor',
      agreements: [],
    },
  ];
}

export function WorkflowPipeline({
  agreements,
  creditsAvailableCount,
  freeBalanceCount,
  activeStageId,
  onStageSelect,
  onPrimaryAction,
}: WorkflowPipelineProps) {
  const stages = buildStages(agreements, creditsAvailableCount, freeBalanceCount);
  const activeStage = stages.find((s) => s.id === activeStageId) || stages[0];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gradient-to-r from-[#0070f2]/5 via-white to-white">
        <div>
          <p className="text-[10px] font-bold text-[#0070f2] uppercase tracking-widest">Jornada do Acordo</p>
          <h2 className="text-sm font-bold text-gray-900 mt-0.5">Pipeline end-to-end do abatimento</h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f2]" />
            Gestor
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Fornecedor
          </span>
        </div>
      </div>

      <div className="px-5 pt-5 pb-3 overflow-x-auto">
        <div className="flex items-stretch gap-0 min-w-max">
          {stages.map((stage, idx) => {
            const isActive = stage.id === activeStage.id;
            const isLast = idx === stages.length - 1;
            const isPersonaSupplier = stage.persona === 'fornecedor';

            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => onStageSelect(stage.id)}
                  className={`group relative flex flex-col min-w-[170px] p-3 rounded-xl border transition-all text-left ${
                    isActive
                      ? 'border-transparent shadow-md ring-2 ring-offset-2 ' +
                        (isPersonaSupplier ? 'ring-teal-400' : 'ring-[#0070f2]')
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${stage.accentBg}`}
                    >
                      {stage.icon}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {String(stage.order).padStart(2, '0')}
                    </span>
                    <span
                      className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        isPersonaSupplier
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-[#0070f2]/10 text-[#0070f2]'
                      }`}
                    >
                      {isPersonaSupplier ? 'Fornecedor' : 'Gestor'}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-gray-800 leading-tight">{stage.short}</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">{stage.when}</p>

                  <div className="flex items-end justify-between mt-2 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase font-semibold">Na etapa</p>
                      <p className={`text-lg font-bold tabular-nums ${stage.accent}`}>{stage.count}</p>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? `${stage.accent} translate-x-0.5` : 'text-gray-300'
                      }`}
                    />
                  </div>

                  {isActive && (
                    <div
                      className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${stage.accentBg}`}
                    />
                  )}
                </button>

                {!isLast && (
                  <div className="flex items-center px-1.5">
                    <div className="h-0.5 w-4 bg-gray-200" />
                    <ArrowRight className="w-3 h-3 text-gray-300 -ml-1" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
        <div className="grid grid-cols-4 gap-4">
          <StageDetail label="Quando eu…" value={activeStage.when} tone="muted" />
          <StageDetail label="Preciso / quero…" value={activeStage.want} tone="muted" />
          <StageDetail label="Para que eu possa…" value={activeStage.outcome} tone="muted" />
          <StageDetail label="Premissa de sucesso" value={activeStage.success} tone="accent" />
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center text-white ${activeStage.accentBg}`}
            >
              {activeStage.icon}
            </div>
            <p className="text-xs font-bold text-gray-800">{activeStage.title}</p>
            <span className="text-[10px] text-gray-400">· etapa {activeStage.order} de 7</span>
          </div>
          <button
            onClick={() => onPrimaryAction(activeStage.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${activeStage.accentBg} hover:brightness-110`}
          >
            {activeStage.actionLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function StageDetail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'muted' | 'accent';
}) {
  return (
    <div>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p
        className={`text-[11px] leading-relaxed ${
          tone === 'accent' ? 'text-gray-800 font-semibold' : 'text-gray-600'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
