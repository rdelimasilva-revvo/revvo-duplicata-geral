import React, { useEffect, useMemo, useState } from 'react';
import { X, Scales, PencilSimple, Trash, ShieldCheck, ClockCounterClockwise, FileText, Buildings, Warning } from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatDate } from '../utils';
import { useCreditLinksStore } from '../creditLinks/store';

const CONTEST_REASON_LABEL: Record<string, string> = {
  valor_divergente: 'Valor divergente',
  nf_incorreta: 'NF incorreta',
  prazo_invalido: 'Prazo inválido',
  credito_indevido: 'Crédito indevido',
  outro: 'Outro motivo',
};

export interface ConflictTarget {
  linkId: string;
  proposalCode: string;
  invoiceId: string;
  invoiceNumber: string;
  creditLabel: string;
  originalAmount: number;
  supplierName: string;
  supplierCnpj?: string;
  createdAt: string;
}

interface ContestationDetails {
  id: string;
  reason_code: string;
  observations: string;
  responder_name: string;
  responder_email: string;
  created_at: string;
}

interface ResolutionEvent {
  id: string;
  action: 'adjust_value' | 'remove_from_agreement' | 'keep_original';
  new_amount: number | null;
  justification: string;
  actor_name: string;
  created_at: string;
}

type Mode = 'idle' | 'adjust' | 'keep';

interface ConflictResolutionDrawerProps {
  target: ConflictTarget | null;
  onClose: () => void;
  onResolved?: () => void;
}

export function ConflictResolutionDrawer({ target, onClose, onResolved }: ConflictResolutionDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [contestation, setContestation] = useState<ContestationDetails | null>(null);
  const [history, setHistory] = useState<ResolutionEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [mode, setMode] = useState<Mode>('idle');
  const [newAmount, setNewAmount] = useState<string>('');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();
  const removeLink = useCreditLinksStore((s) => s.removeLink);

  const isOpen = !!target;

  useEffect(() => {
    if (!isOpen) {
      setMode('idle');
      setNewAmount('');
      setJustification('');
      setContestation(null);
      setHistory([]);
      return;
    }
    setMounted(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [isOpen]);

  useEffect(() => {
    if (!target) return;
    setMode('idle');
    setNewAmount(String(target.originalAmount));
    setJustification('');
    setContestation(null);
    setHistory([]);
    setLoadingHistory(true);
    (async () => {
      const [{ data: contestData }, { data: resoData }] = await Promise.all([
        supabase
          .from('proposal_credit_link_contestations')
          .select('id, reason_code, observations, responder_name, responder_email, created_at')
          .eq('credit_link_id', target.linkId)
          .order('created_at', { ascending: false })
          .limit(1),
        supabase
          .from('credit_link_resolutions')
          .select('id, action, new_amount, justification, actor_name, created_at')
          .eq('credit_link_id', target.linkId)
          .order('created_at', { ascending: false }),
      ]);
      setContestation((contestData && contestData[0]) || null);
      setHistory((resoData as ResolutionEvent[]) ?? []);
      setLoadingHistory(false);
    })();
  }, [target]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const parsedAmount = useMemo(() => {
    const n = Number(String(newAmount).replace(/[^\d.,-]/g, '').replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }, [newAmount]);

  const handleClose = () => {
    if (submitting) return;
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  };

  const logResolution = async (
    action: 'adjust_value' | 'remove_from_agreement' | 'keep_original',
    payload: { new_amount?: number | null; justification?: string },
  ) => {
    if (!target) return;
    const { data: { user } } = await supabase.auth.getUser();
    const actorName =
      (user?.user_metadata?.full_name as string | undefined) ??
      (user?.user_metadata?.name as string | undefined) ??
      user?.email ??
      'Gestor';
    await supabase.from('credit_link_resolutions').insert({
      credit_link_id: target.linkId,
      proposal_code: target.proposalCode,
      action,
      new_amount: payload.new_amount ?? null,
      justification: payload.justification ?? '',
      actor_id: user?.id ?? null,
      actor_name: actorName,
    });
  };

  const handleConfirmAdjust = async () => {
    if (!target) return;
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    setSubmitting(true);
    try {
      await supabase
        .from('proposal_credit_links')
        .update({ amount: parsedAmount, status: 'resolved' })
        .eq('id', target.linkId);
      await logResolution('adjust_value', { new_amount: parsedAmount });
      showToast('success', 'Valor ajustado', `${target.creditLabel} foi atualizado para ${formatCurrency(parsedAmount)} e aprovado.`);
      onResolved?.();
      handleClose();
    } catch (err) {
      showToast('error', 'Não foi possível ajustar o valor', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!target) return;
    setSubmitting(true);
    try {
      await logResolution('remove_from_agreement', {});
      await removeLink(target.linkId);
      showToast('info', 'Item removido do acordo', `${target.creditLabel} foi retirado e a liquidação dos demais itens foi destravada.`);
      onResolved?.();
      handleClose();
    } catch (err) {
      showToast('error', 'Não foi possível remover', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeepOriginal = async () => {
    if (!target) return;
    const reason = justification.trim();
    if (reason.length < 10) return;
    setSubmitting(true);
    try {
      await supabase
        .from('proposal_credit_links')
        .update({ status: 'pending_review' })
        .eq('id', target.linkId);
      await logResolution('keep_original', { justification: reason });
      showToast('warning', 'Contestação rejeitada', 'A proposta voltou para o portal do fornecedor com sua justificativa.');
      onResolved?.();
      handleClose();
    } catch (err) {
      showToast('error', 'Não foi possível registrar', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen && !closing) return null;

  const scale = mounted && !closing ? 'opacity-100 scale-100' : 'opacity-0 scale-95';
  const overlayOpacity = mounted && !closing ? 'opacity-100' : 'opacity-0';

  const contestReasonLabel = contestation
    ? CONTEST_REASON_LABEL[contestation.reason_code] ?? contestation.reason_code
    : '—';

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fechar painel"
        onClick={handleClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity duration-200 ${overlayOpacity}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Resolução de conflito"
        className={`relative w-full max-w-[640px] max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col transform transition-all duration-200 ease-out ${scale}`}
      >
        <header className="relative px-6 pt-6 pb-5 border-b border-slate-200">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar"
            className="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X size={20} weight="regular" />
          </button>

          <div className="flex items-start gap-3 pr-12">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center flex-shrink-0">
              <Buildings size={22} weight="regular" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 leading-tight truncate">
                {target?.supplierName}
              </h2>
              {target?.supplierCnpj && (
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{target.supplierCnpj}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  <Warning size={12} weight="fill" />
                  Em Conflito
                </span>
                <span className="text-[11px] text-slate-500">
                  {target?.invoiceNumber} · {target?.creditLabel}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Scales size={16} weight="regular" className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Comparação da disputa</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Proposta da empresa</p>
                <p className="text-xs text-slate-600 mt-2">Valor original do crédito</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {formatCurrency(target?.originalAmount ?? 0)}
                </p>
                <p className="text-[11px] text-slate-500 mt-3">
                  Abatimento sugerido sobre {target?.invoiceNumber}.
                </p>
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-700">Contestação do fornecedor</p>
                <p className="text-xs text-orange-800 mt-2">Motivo</p>
                <p className="text-sm font-semibold text-orange-900">{contestReasonLabel}</p>
                <p className="text-xs text-orange-800 mt-3">Justificativa</p>
                <p className="text-sm text-orange-950 font-medium leading-relaxed whitespace-pre-wrap">
                  {contestation?.observations || '—'}
                </p>
                {contestation && (
                  <p className="text-[11px] text-orange-700/80 mt-3">
                    Por {contestation.responder_name} · {formatDate(contestation.created_at)}
                  </p>
                )}
              </div>
            </div>
          </section>

          {mode === 'adjust' && (
            <section className="relative rounded-xl border border-blue-200 bg-blue-50/60 p-4">
              <button
                type="button"
                onClick={() => setMode('idle')}
                disabled={submitting}
                aria-label="Fechar ajuste de valor"
                className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white transition-colors disabled:opacity-50"
              >
                <X size={14} weight="regular" />
              </button>
              <label className="block text-xs font-semibold text-slate-700 mb-2 pr-8">
                Novo valor acordado
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-600">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Ao confirmar, o crédito muda para o status Aprovado e a liquidação é liberada.
              </p>
              <div className="flex items-center justify-end mt-3">
                <button
                  type="button"
                  onClick={handleConfirmAdjust}
                  disabled={submitting || !Number.isFinite(parsedAmount) || parsedAmount <= 0}
                  className="h-9 px-4 rounded-md text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Confirmando...' : `Aprovar ${Number.isFinite(parsedAmount) ? formatCurrency(parsedAmount) : ''}`}
                </button>
              </div>
            </section>
          )}

          {mode === 'keep' && (
            <section className="relative rounded-xl border border-amber-200 bg-amber-50/60 p-4">
              <button
                type="button"
                onClick={() => setMode('idle')}
                disabled={submitting}
                aria-label="Fechar justificativa"
                className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-slate-900 hover:bg-white transition-colors disabled:opacity-50"
              >
                <X size={14} weight="regular" />
              </button>
              <label className="block text-xs font-semibold text-slate-700 mb-2 pr-8">
                Justificativa para manter o valor original
              </label>
              <textarea
                rows={4}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Explique ao fornecedor por que a contestação está sendo rejeitada (mínimo 10 caracteres)."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                {justification.trim().length}/10 caracteres mínimos. A proposta voltará ao portal do fornecedor.
              </p>
              <div className="flex items-center justify-end mt-3">
                <button
                  type="button"
                  onClick={handleKeepOriginal}
                  disabled={submitting || justification.trim().length < 10}
                  className="h-9 px-4 rounded-md text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Devolver ao fornecedor'}
                </button>
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ClockCounterClockwise size={16} weight="regular" className="text-slate-500" />
              <h3 className="text-sm font-bold text-slate-900">Histórico e auditoria</h3>
            </div>
            <ol className="relative border-l border-slate-200 pl-5 space-y-4">
              <TimelineItem
                title="Crédito criado"
                subtitle={`${target?.creditLabel} vinculado à ${target?.invoiceNumber}`}
                date={target?.createdAt}
                tone="neutral"
              />
              {contestation && (
                <TimelineItem
                  title="Contestação aberta pelo fornecedor"
                  subtitle={`${contestReasonLabel} — ${contestation.responder_name}`}
                  date={contestation.created_at}
                  detail={contestation.observations}
                  tone="warning"
                />
              )}
              {loadingHistory && (
                <li className="text-xs text-slate-400 italic pl-1">Carregando histórico...</li>
              )}
              {!loadingHistory && history.slice().reverse().map((ev) => (
                <TimelineItem
                  key={ev.id}
                  title={RESOLUTION_LABEL[ev.action]}
                  subtitle={
                    ev.action === 'adjust_value' && ev.new_amount != null
                      ? `Novo valor: ${formatCurrency(ev.new_amount)} · ${ev.actor_name}`
                      : `${ev.actor_name}`
                  }
                  detail={ev.justification || undefined}
                  date={ev.created_at}
                  tone={ev.action === 'adjust_value' ? 'success' : ev.action === 'keep_original' ? 'warning' : 'danger'}
                />
              ))}
            </ol>
          </section>
        </div>

        {mode === 'idle' && (
          <footer className="border-t border-slate-200 bg-white px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('adjust')}
                className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <PencilSimple size={14} weight="regular" />
                Ajustar Valor
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                <Trash size={14} weight="regular" />
                Remover do Acordo
              </button>
              <button
                type="button"
                onClick={() => setMode('keep')}
                className="inline-flex items-center justify-center gap-2 h-10 px-3 rounded-lg text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck size={14} weight="regular" />
                Manter Original
              </button>
            </div>
          </footer>
        )}
      </aside>
    </div>
  );
}

const RESOLUTION_LABEL: Record<ResolutionEvent['action'], string> = {
  adjust_value: 'Valor ajustado pelo gestor',
  remove_from_agreement: 'Item removido do acordo',
  keep_original: 'Contestação rejeitada (devolvida ao fornecedor)',
};

interface TimelineItemProps {
  title: string;
  subtitle?: string;
  detail?: string;
  date?: string;
  tone: 'neutral' | 'warning' | 'success' | 'danger';
}

function TimelineItem({ title, subtitle, detail, date, tone }: TimelineItemProps) {
  const dotClass =
    tone === 'warning'
      ? 'bg-orange-500 ring-orange-100'
      : tone === 'success'
        ? 'bg-emerald-500 ring-emerald-100'
        : tone === 'danger'
          ? 'bg-rose-500 ring-rose-100'
          : 'bg-slate-400 ring-slate-100';
  return (
    <li className="relative">
      <span className={`absolute -left-[27px] top-1 w-3 h-3 rounded-full ring-4 ${dotClass}`} />
      <div>
        <p className="text-xs font-semibold text-slate-900">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-600 mt-0.5">{subtitle}</p>}
        {detail && (
          <p className="text-[11px] text-slate-700 mt-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 leading-relaxed whitespace-pre-wrap">
            {detail}
          </p>
        )}
        {date && <p className="text-[10px] text-slate-400 mt-1">{formatDate(date)}</p>}
      </div>
    </li>
  );
}
