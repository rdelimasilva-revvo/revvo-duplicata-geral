import React, { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  X, Building2, Calendar, FileText, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, FileCheck, Loader2,
  XCircle,
} from 'lucide-react';
import {
  CONTRACT_TYPE_LABEL,
  PIPELINE_CONFIG,
  PIPELINE_ORDER,
  RISK_CONFIG,
  type AgreementRecord,
  type PipelineStatus,
} from '../types';
import { useSharedCompanies } from '../../context/SharedCompaniesContext';
import { DocumentsCard } from '../../components/DocumentsCard';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { useAgreementsDashboardStore } from '../store';

interface AgreementDrawerProps {
  agreement: AgreementRecord | null;
  onClose: () => void;
  onChangeStatus: (id: string, status: PipelineStatus) => void;
  onOpenReview?: (proposalCode: string) => void;
}

const CONTEST_REASONS: { code: string; label: string }[] = [
  { code: 'valor_divergente', label: 'Valor divergente' },
  { code: 'nf_incorreta', label: 'NF incorreta' },
  { code: 'prazo_invalido', label: 'Prazo inválido' },
  { code: 'credito_indevido', label: 'Crédito indevido' },
  { code: 'outro', label: 'Outro motivo' },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

export function AgreementDrawer({ agreement, onClose, onChangeStatus, onOpenReview }: AgreementDrawerProps) {
  const { byCnpj, reload: reloadCompanies } = useSharedCompanies();
  const { showToast } = useToast();
  const [showContestModal, setShowContestModal] = useState(false);
  const [submittingContest, setSubmittingContest] = useState(false);

  if (!agreement) return null;

  const cfg = PIPELINE_CONFIG[agreement.status];
  const risk = RISK_CONFIG[agreement.riskLevel];
  const currentIndex = PIPELINE_ORDER.indexOf(agreement.status);
  const company = byCnpj.get(agreement.supplierCnpj);
  const approvedCode = company?.approvedProposalCodes?.[0];
  const refusedCode = company?.refusedProposalCodes?.[0];
  const contestedCode = company?.contestedProposalCodes?.[0];
  const pendingCode = company?.pendingProposalCodes?.[0];
  const proposalCode =
    approvedCode ?? refusedCode ?? contestedCode ?? pendingCode;
  const respondedCode = approvedCode ?? refusedCode;
  const hasContested = !!contestedCode;
  const isPendingNf = !respondedCode && !!pendingCode && !contestedCode;
  const canContest = !!respondedCode && !hasContested;
  const contestTooltip = hasContested
    ? 'Este acordo já possui uma contestação em análise'
    : isPendingNf
      ? 'Aguardando aceite ou recusa da NF antes de contestar'
      : !respondedCode
        ? 'Nenhuma NF aceita/recusada para contestar'
        : 'Abrir disputa sobre este acordo';

  const handleOpenDetails = () => {
    if (proposalCode && onOpenReview) {
      onOpenReview(proposalCode);
      onClose();
    } else {
      showToast(
        'info',
        'Sem proposta vinculada',
        'Este acordo ainda não possui uma proposta para abrir os detalhes completos.',
      );
    }
  };

  const handleConfirmContest = async (reasonCode: string, observations: string) => {
    if (!proposalCode) return;
    setSubmittingContest(true);
    try {
      const { data: userResp } = await supabase.auth.getUser();
      const user = userResp.user;
      const responderName =
        (user?.user_metadata?.full_name as string | undefined) ??
        (user?.user_metadata?.name as string | undefined) ??
        user?.email ??
        'Usuário Revvo';
      const responderEmail = user?.email ?? '';

      const { error: insertError } = await supabase
        .from('agreement_proposal_contestations')
        .insert({
          proposal_code: proposalCode,
          reason_code: reasonCode,
          observations,
          responder_id: user?.id ?? null,
          responder_name: responderName,
          responder_email: responderEmail,
        });
      if (insertError) throw insertError;

      const { error: statusError } = await supabase
        .from('agreement_proposals')
        .update({ status: 'contested' })
        .eq('code', proposalCode);
      if (statusError) throw statusError;

      await supabase
        .from('commercial_agreements')
        .update({ status: 'in_negotiation', updated_at: new Date().toISOString() })
        .eq('id', agreement.id);

      await reloadCompanies();
      await useAgreementsDashboardStore.getState().loadAgreements();

      setShowContestModal(false);
      showToast(
        'warning',
        'Contestação registrada',
        'O acordo foi marcado como Em Conflito para nova revisão.',
      );
      onClose();
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        'Não foi possível registrar a contestação',
        err instanceof Error ? err.message : 'Tente novamente em instantes.',
      );
    } finally {
      setSubmittingContest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className={`sticky top-0 z-10 px-6 py-4 border-b border-gray-100 bg-white`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${risk.bg} ${risk.color}`}>
                  Risco {risk.label}
                </span>
              </div>
              <p className="text-[11px] font-mono text-gray-500">{agreement.code}</p>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5 leading-snug">
                {agreement.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <InfoItem icon={<Building2 className="w-3.5 h-3.5" />} label="Fornecedor" value={agreement.supplierName} hint={agreement.supplierCnpj} />
            <InfoItem icon={<Building2 className="w-3.5 h-3.5" />} label="Sacado" value={agreement.sacadoName} hint={agreement.sacadoCnpj} />
            <InfoItem icon={<FileText className="w-3.5 h-3.5" />} label="Modalidade" value={CONTRACT_TYPE_LABEL[agreement.contractType]} />
            <InfoItem icon={<TrendingUp className="w-3.5 h-3.5" />} label="Valor Total" value={formatCurrency(agreement.totalValue)} />
            <InfoItem icon={<Calendar className="w-3.5 h-3.5" />} label="Vigência" value={
              agreement.startDate && agreement.endDate
                ? `${format(parseISO(agreement.startDate), 'dd/MM/yy')} - ${format(parseISO(agreement.endDate), 'dd/MM/yy')}`
                : 'Não definida'
            } />
            <InfoItem icon={<Clock className="w-3.5 h-3.5" />} label="Atualizado" value={
              format(parseISO(agreement.updatedAt), "dd 'de' MMMM, HH:mm", { locale: ptBR })
            } />
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-3">Progresso da Jornada</h3>
            <div className="relative bg-gray-50 rounded-xl p-4">
              <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-gray-200" />
              <div className="space-y-4 relative">
                {PIPELINE_ORDER.map((status, idx) => {
                  const stageCfg = PIPELINE_CONFIG[status];
                  const isActive = status === agreement.status;
                  const isPast = idx < currentIndex && !['rejected'].includes(agreement.status);
                  const isRejected = agreement.status === 'rejected' && status === 'rejected';

                  return (
                    <div key={status} className="relative flex items-start gap-3 z-10">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                          isActive
                            ? `${stageCfg.bg} ${stageCfg.border}`
                            : isPast
                              ? 'bg-emerald-50 border-emerald-500'
                              : isRejected
                                ? 'bg-rose-50 border-rose-500'
                                : 'bg-white border-gray-200'
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : isActive ? (
                          <span className={`w-2 h-2 rounded-full ${stageCfg.dot}`} />
                        ) : isRejected ? (
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`text-xs font-semibold ${isActive ? stageCfg.color : 'text-gray-700'}`}>
                          {stageCfg.label}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{stageCfg.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-gray-800 mb-2">Mover para outro estado</h3>
            <div className="grid grid-cols-2 gap-2">
              {PIPELINE_ORDER.filter((s) => s !== agreement.status).map((status) => {
                const stageCfg = PIPELINE_CONFIG[status];
                return (
                  <button
                    key={status}
                    onClick={() => onChangeStatus(agreement.id, status)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:${stageCfg.bg} hover:${stageCfg.border} transition-colors text-left`}
                  >
                    <span className={`w-2 h-2 rounded-full ${stageCfg.dot}`} />
                    <span className="text-xs font-medium text-gray-700">{stageCfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {proposalCode && (
            <DocumentsCard proposalCode={proposalCode} />
          )}

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <button
              type="button"
              onClick={handleOpenDetails}
              disabled={!proposalCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0070f2] text-white text-sm font-semibold rounded-lg hover:bg-[#005bc4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileCheck className="w-4 h-4" />
              Abrir detalhes completos
            </button>
            <button
              type="button"
              onClick={() => setShowContestModal(true)}
              disabled={!canContest}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-orange-300 text-orange-700 text-sm font-semibold rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={contestTooltip}
            >
              <AlertTriangle size={16} />
              {hasContested
                ? 'Em conflito'
                : isPendingNf
                  ? 'Aguardando manifestação da NF'
                  : 'Contestar'}
            </button>
          </div>
        </div>
      </div>

      {showContestModal && (
        <ContestModal
          onClose={() => !submittingContest && setShowContestModal(false)}
          onConfirm={handleConfirmContest}
          submitting={submittingContest}
        />
      )}
    </div>
  );
}

interface ContestModalProps {
  onClose: () => void;
  onConfirm: (reasonCode: string, observations: string) => void;
  submitting: boolean;
}

function ContestModal({ onClose, onConfirm, submitting }: ContestModalProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const canConfirm = !!reason && notes.trim().length >= 10 && !submitting;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Contestar acordo</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Abra uma disputa. O acordo passará para{' '}
                <span className="font-semibold text-orange-700">Em Conflito</span> e o gestor revisará os termos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Fechar"
            disabled={submitting}
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <label htmlFor="drawer-contest-reason" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Motivo <span className="text-red-600">*</span>
            </label>
            <select
              id="drawer-contest-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              className="w-full text-sm border border-gray-300 rounded-md px-3 h-10 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            >
              <option value="">Selecione um motivo...</option>
              {CONTEST_REASONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="drawer-contest-notes" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Observações detalhadas <span className="text-red-600">*</span>
            </label>
            <textarea
              id="drawer-contest-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Descreva os pontos divergentes (valores, NFs envolvidas, prazos, etc.)."
              disabled={submitting}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 resize-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">
              Mínimo de 10 caracteres. Essa justificativa será exibida ao gestor no ERP.
            </p>
          </div>
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={() => onConfirm(reason, notes.trim())}
            disabled={!canConfirm}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-md text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <AlertTriangle size={16} />
                Registrar contestação
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-1.5 text-gray-400 mb-1">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
      {hint && <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{hint}</p>}
    </div>
  );
}
