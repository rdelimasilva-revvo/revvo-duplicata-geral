import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  FileText,
  AlertCircle,
  AlertTriangle,
  X,
  Check,
  Building2,
  MessageSquare,
  CalendarDays,
  Loader2,
  CheckCircle2,
  Download,
  Info,
  Send,
  Hourglass,
  Clock,
  User as UserIcon,
  Ticket,
  CircleDollarSign,
  Trash2,
  ChevronDown,
  Flag,
  FileUp,
  Link,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDate } from '../utils';
import { useCreditLinksStore } from '../creditLinks/store';
import { CreditLinkDrawer } from '../creditLinks/CreditLinkDrawer';
import { DocumentCenter } from '../components/DocumentCenter';
import { ConflictResolutionDrawer, type ConflictTarget } from '../components/ConflictResolutionDrawer';
import { useSharedCompanies } from '../context/SharedCompaniesContext';
import { useAgreementsDashboardStore } from '../dashboard/store';
import {
  publishProposalEvent,
  useProposalChannel,
  useProposalEvent,
} from '../communication';

interface RevisaoAcordoComercialProps {
  proposalCode?: string;
  onBack?: () => void;
  onSubmitted?: (decision: 'approved' | 'refused') => void;
}

interface ProposalRow {
  id: string;
  invoiceNumber: string;
  emissionDate: string;
  originalValue: number;
  discount: number;
}

interface Proposal {
  code: string;
  origin_company: string;
  origin_cnpj?: string;
  title: string;
  message: string;
  total_original: number;
  total_discount: number;
  invoices_count: number;
  status: 'pending' | 'approved' | 'refused' | 'expired' | 'contested';
  sent_at: string;
}

const FALLBACK_CODE = 'IDT428';
const SAP_SIMULATED_DELAY_MS = 2000;
const refuseDraftKey = (code: string) => `revvo:refuse-draft:${code}`;

const FIXED_ROWS_BY_CODE: Record<string, ProposalRow[]> = {
  IDT428: [
    { id: 'nf-1', invoiceNumber: 'NF 001234', emissionDate: '2024-01-15', originalValue: 45_000, discount: 15_000 },
    { id: 'nf-2', invoiceNumber: 'NF 001235', emissionDate: '2024-01-20', originalValue: 35_000, discount: 12_000 },
    { id: 'nf-3', invoiceNumber: 'NF 001236', emissionDate: '2024-01-25', originalValue: 20_000, discount: 8_000 },
  ],
};

function generateRows(proposal: Proposal): ProposalRow[] {
  if (FIXED_ROWS_BY_CODE[proposal.code]) return FIXED_ROWS_BY_CODE[proposal.code];
  const n = Math.max(0, proposal.invoices_count);
  if (n === 0) return [];
  const originalEach = Math.floor(proposal.total_original / n / 100) * 100;
  const discountEach = Math.floor(proposal.total_discount / n / 100) * 100;
  const sentAt = new Date(proposal.sent_at);
  const rows: ProposalRow[] = [];
  let originalLeft = proposal.total_original;
  let discountLeft = proposal.total_discount;
  for (let i = 0; i < n; i++) {
    const isLast = i === n - 1;
    const original = isLast ? originalLeft : originalEach;
    const discount = isLast ? discountLeft : discountEach;
    originalLeft -= original;
    discountLeft -= discount;
    const date = new Date(sentAt);
    date.setDate(date.getDate() - (n - i) * 4);
    rows.push({
      id: `nf-${i + 1}`,
      invoiceNumber: `NF ${(12000 + i * 23 + proposal.code.length * 7).toLocaleString('pt-BR')}`,
      emissionDate: date.toISOString(),
      originalValue: original,
      discount,
    });
  }
  return rows;
}

const STATUS_META: Record<
  Proposal['status'],
  { label: string; cls: string; dot: string }
> = {
  pending: {
    label: 'Aguardando sua revisão',
    cls: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  approved: {
    label: 'Aprovado',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  refused: {
    label: 'Recusado',
    cls: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
  },
  expired: {
    label: 'Expirado',
    cls: 'bg-gray-100 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
  contested: {
    label: 'Em Conflito',
    cls: 'bg-orange-50 text-orange-800 border-orange-200',
    dot: 'bg-orange-500',
  },
};

const CONTEST_REASONS: { code: string; label: string }[] = [
  { code: 'valor_divergente', label: 'Valor divergente' },
  { code: 'nf_incorreta', label: 'NF incorreta' },
  { code: 'prazo_invalido', label: 'Prazo inválido' },
  { code: 'credito_indevido', label: 'Crédito indevido' },
  { code: 'outro', label: 'Outro motivo' },
];

const focusRing =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';

export function RevisaoAcordoComercial({
  proposalCode,
  onBack,
  onSubmitted,
}: RevisaoAcordoComercialProps) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const code = proposalCode ?? FALLBACK_CODE;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showContestModal, setShowContestModal] = useState(false);
  const [contestation, setContestation] = useState<{
    reason_code: string;
    observations: string;
    responder_name: string;
    responder_email: string;
    created_at: string;
  } | null>(null);
  const [refuseReason, setRefuseReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<'approved' | 'refused' | null>(null);
  const [decisionMeta, setDecisionMeta] = useState<{
    at: string;
    responderName: string;
    responderEmail: string;
  } | null>(null);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [drawerInvoiceId, setDrawerInvoiceId] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [contestedRows, setContestedRows] = useState<Record<string, boolean>>({});
  const [creditContestTarget, setCreditContestTarget] = useState<{
    invoiceNumber: string;
    links: { id: string; creditLabel: string; amount: number }[];
  } | null>(null);
  const [submittingCreditContest, setSubmittingCreditContest] = useState(false);
  const [conflictTarget, setConflictTarget] = useState<ConflictTarget | null>(null);

  const loadCreditLinks = useCreditLinksStore((s) => s.loadForProposal);
  const getLinksForProposal = useCreditLinksStore((s) => s.getLinksForProposal);
  const getLinksForInvoice = useCreditLinksStore((s) => s.getLinksForInvoice);
  const removeCreditLink = useCreditLinksStore((s) => s.removeLink);
  const addCreditLink = useCreditLinksStore((s) => s.addLink);
  const contestCreditLinkApi = useCreditLinksStore((s) => s.contestLink);
  const reloadCompanies = useSharedCompanies().reload;
  const availableCredits = useCreditLinksStore((s) => s.credits);
  const creditUsageById = useCreditLinksStore((s) => s.getCreditUsage(code));
  const proposalLinks = useCreditLinksStore((s) =>
    s.links.filter((l) => l.proposalCode === code),
  );

  useEffect(() => {
    loadCreditLinks(code);
  }, [code, loadCreditLinks]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('agreement_proposal_responses')
        .select('decision, created_at, responder_name, responder_email')
        .eq('proposal_code', code)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !data) return;
      if (data.decision === 'approved' || data.decision === 'refused') {
        setDecision(data.decision);
        setDecisionMeta({
          at: data.created_at,
          responderName: data.responder_name ?? '',
          responderEmail: data.responder_email ?? '',
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('agreement_proposals')
        .select('*')
        .eq('code', code)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setLoadError(error.message);
      } else if (!data) {
        setLoadError('Proposta não encontrada.');
      } else {
        setProposal(data as Proposal);
        setLoadError(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('agreement_proposal_contestations')
        .select('reason_code, observations, responder_name, responder_email, created_at')
        .eq('proposal_code', code)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data) setContestation(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [code, proposal?.status]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(refuseDraftKey(code));
      if (saved) setRefuseReason(saved);
    } catch {
      /* storage unavailable */
    }
  }, [code]);

  useProposalChannel(code);

  useEffect(() => {
    if (!proposal) return;
    publishProposalEvent(
      'proposal:viewed',
      proposal.code,
      { code: proposal.code, viewer_role: 'supplier' },
      'revisao',
    );
  }, [proposal]);

  useProposalEvent('proposal:created', code, (event) => {
    setProposal((current) =>
      current
        ? {
            ...current,
            origin_company: event.payload.origin_company,
            total_original: event.payload.total_original,
            total_discount: event.payload.total_discount,
            invoices_count: event.payload.invoices_count,
            sent_at: event.payload.sent_at,
          }
        : current,
    );
  });

  const rows = useMemo(() => (proposal ? generateRows(proposal) : []), [proposal]);

  const totals = useMemo(() => {
    const originalTotal = rows.reduce((s, r) => s + r.originalValue, 0);
    const discountTotal = rows.reduce((s, r) => s + r.discount, 0);
    const creditsTotal = proposalLinks.reduce((s, l) => s + l.amount, 0);
    return {
      original: originalTotal,
      discount: discountTotal,
      credits: creditsTotal,
      final: originalTotal - discountTotal - creditsTotal,
    };
  }, [rows, proposalLinks]);

  const isExpired = proposal?.status === 'expired';

  const persistResponse = async (
    chosen: 'approved' | 'refused',
    reason: string | null,
  ): Promise<void> => {
    if (!proposal) return;
    const { data: userResp } = await supabase.auth.getUser();
    const user = userResp.user;
    const ownerId = user?.id ?? null;
    if (!ownerId) {
      throw new Error(
        'Sessão expirada. Faça login novamente para registrar sua decisão.',
      );
    }
    const responderName =
      (user?.user_metadata?.full_name as string | undefined) ??
      (user?.user_metadata?.name as string | undefined) ??
      user?.email ??
      'Usuário Revvo';
    const responderEmail = user?.email ?? '';
    const { error } = await supabase.from('agreement_proposal_responses').insert({
      proposal_code: proposal.code,
      proposal_origin: proposal.origin_company,
      decision: chosen,
      refusal_reason: reason,
      total_discount: totals.discount,
      affected_invoices_count: rows.length,
      responded_by: ownerId,
      responder_name: responderName,
      responder_email: responderEmail,
    });
    if (error) throw error;

    const { error: statusError } = await supabase
      .from('agreement_proposals')
      .update({ status: chosen })
      .eq('code', proposal.code);
    if (statusError) throw statusError;

    const originCnpj = (proposal as Proposal & { origin_cnpj?: string }).origin_cnpj ?? '';
    if (originCnpj) {
      const mappedStatus = chosen === 'approved' ? 'active' : 'rejected';
      await supabase
        .from('commercial_agreements')
        .update({ status: mappedStatus, updated_at: new Date().toISOString() })
        .eq('supplier_cnpj', originCnpj)
        .in('status', ['pending_approval', 'in_negotiation', 'draft']);
      reloadCompanies();
      useAgreementsDashboardStore.getState().loadAgreements();
    }

    setProposal((current) => (current ? { ...current, status: chosen } : current));
    setDecisionMeta({
      at: new Date().toISOString(),
      responderName,
      responderEmail,
    });
  };

  const handleConfirmApprove = async () => {
    if (submitting || !proposal || isExpired) return;
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, SAP_SIMULATED_DELAY_MS));
      await persistResponse('approved', null);
      const published = await publishProposalEvent(
        'proposal:decided',
        proposal.code,
        {
          code: proposal.code,
          decision: 'approved',
          total_discount: totals.discount,
          affected_invoices_count: rows.length,
        },
        'revisao',
      );
      if (!published) {
        throw new Error('Falha ao publicar o evento de aprovação.');
      }
      setApproveSuccess(true);
      setDecision('approved');
      showToast(
        'success',
        'Acordo aprovado com sucesso!',
        'A liquidação financeira foi enviada ao ERP.',
        {
          label: 'Ver no ERP',
          onClick: () => navigate('/app/acordos-comerciais/revisao-proposta'),
        },
      );
      onSubmitted?.('approved');
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível registrar o aceite. Tente novamente em instantes.';
      showToast('error', 'Não foi possível registrar o aceite', message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseApproveModal = () => {
    if (submitting) return;
    setShowApproveModal(false);
    setApproveSuccess(false);
  };

  const handleConfirmRefuse = async () => {
    const reason = refuseReason.trim();
    if (!reason || submitting || !proposal || isExpired) return;
    setSubmitting(true);
    try {
      await persistResponse('refused', reason);
      const published = await publishProposalEvent(
        'proposal:decided',
        proposal.code,
        {
          code: proposal.code,
          decision: 'refused',
          refusal_reason: reason,
          total_discount: totals.discount,
          affected_invoices_count: rows.length,
        },
        'revisao',
      );
      if (!published) {
        throw new Error('Falha ao publicar o evento de recusa.');
      }
      setDecision('refused');
      setShowRefuseModal(false);
      setRefuseReason('');
      try {
        localStorage.removeItem(refuseDraftKey(code));
      } catch {
        /* ignore */
      }
      showToast(
        'info',
        'Recusa registrada',
        'O gestor foi notificado e poderá enviar uma nova proposta.',
        {
          label: 'Ver propostas recebidas',
          onClick: () => navigate('/app/acordos-comerciais/revisao-proposta'),
        },
      );
      onSubmitted?.('refused');
    } catch (err) {
      console.error(err);
      showToast('error', 'Não foi possível registrar a recusa', 'Tente novamente em instantes.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmContest = async (reasonCode: string, observations: string) => {
    if (!proposal || submitting) return;
    setSubmitting(true);
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
          proposal_code: proposal.code,
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
        .eq('code', proposal.code);
      if (statusError) throw statusError;

      const originCnpj = proposal.origin_cnpj ?? '';
      if (originCnpj) {
        await supabase
          .from('commercial_agreements')
          .update({ status: 'in_negotiation', updated_at: new Date().toISOString() })
          .eq('supplier_cnpj', originCnpj)
          .in('status', ['pending_approval', 'in_negotiation', 'draft']);
        reloadCompanies();
        useAgreementsDashboardStore.getState().loadAgreements();
      }

      setProposal((current) => (current ? { ...current, status: 'contested' } : current));
      setShowContestModal(false);
      showToast(
        'warning',
        'Contestação registrada',
        'O gestor foi notificado e a liquidação está pausada para revisão.',
      );
    } catch (err) {
      console.error(err);
      showToast(
        'error',
        'Não foi possível registrar a contestação',
        err instanceof Error ? err.message : 'Tente novamente em instantes.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAutoAbater = async (row: ProposalRow) => {
    if (!canDecide) return;
    const invoiceLinks = getLinksForInvoice(code, row.id);
    const hasAutoLink = invoiceLinks.some((l) => l.creditLabel.startsWith('Auto:'));
    if (hasAutoLink) {
      const autoLink = invoiceLinks.find((l) => l.creditLabel.startsWith('Auto:'));
      if (autoLink) await removeCreditLink(autoLink.id);
      return;
    }
    const alreadyLinked = invoiceLinks.reduce((s, l) => s + l.amount, 0);
    const remainingOnInvoice = row.originalValue - row.discount - alreadyLinked;
    if (remainingOnInvoice <= 0) {
      showToast('info', 'Saldo zerado', 'Esta NF já está totalmente abatida.');
      return;
    }
    const creditWithBalance = availableCredits.find((c) => {
      const used = creditUsageById.get(c.id) ?? 0;
      return c.balance - used > 0;
    });
    if (!creditWithBalance) {
      showToast('warning', 'Sem saldo distribuível', 'Não há créditos disponíveis para vincular automaticamente.');
      return;
    }
    const creditRemaining =
      creditWithBalance.balance - (creditUsageById.get(creditWithBalance.id) ?? 0);
    const amount = Math.min(remainingOnInvoice, creditRemaining);
    await addCreditLink(
      code,
      row.id,
      { ...creditWithBalance, label: `Auto: ${creditWithBalance.label}` },
      amount,
    );
    showToast(
      'success',
      'Valor a Abater preenchido automaticamente',
      `${formatCurrency(amount)} aplicados a ${row.invoiceNumber} a partir de ${creditWithBalance.label}.`,
    );
  };

  const handleChangeRefuseReason = (value: string) => {
    setRefuseReason(value);
    try {
      if (value.trim().length > 0) {
        localStorage.setItem(refuseDraftKey(code), value);
      } else {
        localStorage.removeItem(refuseDraftKey(code));
      }
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return <RevisaoSkeleton />;
  }

  if (loadError || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">Proposta indisponível</h2>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          {loadError ?? 'Não foi possível carregar os dados desta proposta.'}
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={`mt-4 px-4 h-9 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors ${focusRing}`}
          >
            Voltar
          </button>
        )}
      </div>
    );
  }

  const decided = decision !== null;
  const statusKey: Proposal['status'] = decided
    ? decision === 'approved'
      ? 'approved'
      : 'refused'
    : proposal.status;
  const status = STATUS_META[statusKey];
  const canDecide = !decided && proposal.status === 'pending' && !isExpired;
  const canContest =
    !isExpired &&
    proposal.status !== 'approved' &&
    proposal.status !== 'refused' &&
    proposal.status !== 'contested' &&
    (proposal.status === 'pending' || proposalLinks.length > 0);

  return (
    <div
      className="min-h-screen bg-[#F5F6F7] pb-28"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, sans-serif' }}
    >
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-8 lg:px-12 py-6">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs text-gray-500">
            <button
              type="button"
              onClick={onBack}
              className={`hover:text-gray-700 transition-colors rounded ${focusRing}`}
            >
              Portal
            </button>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400" />
            <button
              type="button"
              onClick={onBack}
              className={`hover:text-gray-700 transition-colors rounded ${focusRing}`}
            >
              Acordos
            </button>
            <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-gray-400" />
            <span className="text-gray-700 font-medium">Proposta #{proposal.code}</span>
          </nav>

          <div className="mt-3 flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              Proposta de Acordo Comercial #{proposal.code}
            </h1>
            <p className="text-sm text-gray-600 max-w-3xl">
              A empresa{' '}
              <span className="font-semibold text-gray-900">{proposal.origin_company}</span> propôs
              um abatimento de créditos em suas faturas em aberto. Confira os detalhes abaixo.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span
                className={`inline-flex items-center gap-1.5 border rounded-full px-2.5 py-1 text-xs font-semibold ${status.cls}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Enviado por:{' '}
                <span className="font-semibold text-gray-800">{proposal.origin_company}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                Recebida em {formatDate(proposal.sent_at)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full px-8 lg:px-12 py-8 space-y-8">
        <ProposalTimeline sentAt={proposal.sent_at} status={statusKey} />

        <section className="bg-white border border-gray-200 rounded-lg shadow-sm px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8 items-start">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 mb-1.5">
                Empresa de Origem
              </p>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                {proposal.origin_company}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                  Recebida em {formatDate(proposal.sent_at)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono font-semibold text-gray-700">#{proposal.code}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Notas afetadas:{' '}
                  <span className="font-semibold text-gray-700">{rows.length} documentos</span>
                </span>
              </div>
            </div>
            <div className="min-w-0 lg:border-l lg:border-gray-100 lg:pl-8">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[#0A6ED1]" />
                <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                  Justificativa da Empresa
                </p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {proposal.message}
              </p>
            </div>
          </div>
        </section>

        {proposal.status === 'contested' && contestation && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-orange-300 bg-orange-50 px-4 py-3.5 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-orange-900">
                  Proposta contestada pelo fornecedor
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Em Conflito
                </span>
              </div>
              <p className="text-xs text-orange-900/90 mt-1">
                <span className="font-semibold">Motivo: </span>
                {CONTEST_REASONS.find((r) => r.code === contestation.reason_code)?.label ?? contestation.reason_code}
              </p>
              <p className="text-xs text-orange-900/90 mt-1 whitespace-pre-wrap leading-relaxed">
                {contestation.observations}
              </p>
              <p className="text-[11px] text-orange-800/70 mt-2">
                Por {contestation.responder_name}
                {contestation.responder_email && ` · ${contestation.responder_email}`} ·{' '}
                {formatDate(contestation.created_at)}
              </p>
            </div>
          </div>
        )}

        {isExpired && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold">Atenção: saldos desatualizados</p>
              <p className="mt-0.5">
                Esta proposta possui notas que sofreram alteração de saldo recentemente. Por favor,
                solicite uma nova versão ao analista.
              </p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <ImpactCard
            label="Valor Total das Notas"
            value={formatCurrency(totals.original)}
            tone="neutral"
            footnote={`${rows.length} ${rows.length === 1 ? 'nota fiscal' : 'notas fiscais'}`}
          />
          <ImpactCard
            label="Créditos Vinculados"
            value={totals.credits > 0 ? `- ${formatCurrency(totals.credits)}` : formatCurrency(0)}
            tone="positive"
            footnote={
              proposalLinks.length > 0
                ? `${proposalLinks.length} crédito${proposalLinks.length === 1 ? '' : 's'} aplicado${proposalLinks.length === 1 ? '' : 's'}`
                : 'Vincule créditos por NF na tabela abaixo'
            }
            hint="Créditos disponíveis da sua empresa que abatem o saldo das notas selecionadas em tempo real."
          />
          <ImpactCard
            label="Desconto Proposto"
            value={`- ${formatCurrency(totals.discount)}`}
            tone="positive"
            footnote={
              totals.original > 0
                ? `${Math.round((totals.discount / totals.original) * 100)}% sobre o total original`
                : undefined
            }
            hint="Abatimento: valor de crédito (devoluções, bônus ou ajustes) que será descontado do saldo das notas selecionadas."
          />
          <ImpactCard
            label="Valor Líquido a Receber"
            value={formatCurrency(totals.final)}
            tone="emphasis"
            footnote="Valor final após abatimento"
            hint="Compensação SAP: ao aprovar o acordo, esse valor será baixado automaticamente no ERP via integração com o SAP."
          />
        </section>

        <section className="grid grid-cols-1 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden min-w-0">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Notas fiscais incluídas no acordo
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Visualização somente leitura — confira os descontos aplicados.
                </p>
              </div>
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                {rows.length} itens
              </span>
            </div>

            {rows.length === 0 ? (
              <EmptyTableState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm table-auto">
                  <thead>
                    <tr className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                      <Th align="center">
                        <span className="sr-only">Selecionar</span>
                      </Th>
                      <Th>NF / Emissão</Th>
                      <Th align="right">Valor Original</Th>
                      <Th align="right">Desconto</Th>
                      <Th align="right" className="hidden md:table-cell">Créditos</Th>
                      <Th align="right">Saldo Final</Th>
                      <Th align="center">Ações</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const invoiceLinks = getLinksForInvoice(code, row.id);
                      const creditsApplied = invoiceLinks.reduce((s, l) => s + l.amount, 0);
                      const finalBalance = row.originalValue - row.discount - creditsApplied;
                      const isExpanded = expandedRow === row.id;
                      const isContested = !!contestedRows[row.id];
                      const hasAbatement = row.discount > 0 || invoiceLinks.length > 0;
                      return (
                        <React.Fragment key={row.id}>
                        <tr
                          className={`border-t border-gray-100 transition-colors ${
                            isContested
                              ? 'bg-orange-50/60 hover:bg-orange-50'
                              : 'hover:bg-gray-50/60'
                          }`}
                        >
                          <Td align="center">
                            <label
                              className="inline-flex items-center justify-center cursor-pointer"
                              title={
                                canDecide
                                  ? 'Marcar para preencher o Valor a Abater automaticamente'
                                  : 'Indisponível nesta fase'
                              }
                            >
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={invoiceLinks.some((l) => l.creditLabel.startsWith('Auto:'))}
                                onChange={() => handleToggleAutoAbater(row)}
                                disabled={!canDecide}
                                aria-label={`Abater ${row.invoiceNumber} automaticamente`}
                              />
                              <span
                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  invoiceLinks.some((l) => l.creditLabel.startsWith('Auto:'))
                                    ? 'bg-[#0070f2] border-[#0070f2]'
                                    : 'bg-white border-gray-300 peer-hover:border-[#0070f2]'
                                } ${!canDecide ? 'opacity-40' : ''}`}
                              >
                                {invoiceLinks.some((l) => l.creditLabel.startsWith('Auto:')) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </span>
                            </label>
                          </Td>
                          <Td>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedRow(isExpanded ? null : row.id)}
                                aria-label={isExpanded ? 'Recolher detalhamento' : 'Expandir detalhamento'}
                                aria-expanded={isExpanded}
                                className="w-6 h-6 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                                title="Ver extrato de abatimento"
                              >
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                              <div className="flex flex-col min-w-0">
                                <span className="font-mono text-gray-900 text-[13px] leading-tight">{row.invoiceNumber}</span>
                                <span className="text-[11px] text-gray-500">{formatDate(row.emissionDate)}</span>
                              </div>
                              {(() => {
                                const firstContested = invoiceLinks.find((l) => l.status === 'contested');
                                if (!firstContested) return null;
                                return (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConflictTarget({
                                        linkId: firstContested.id,
                                        proposalCode: proposal.code,
                                        invoiceId: row.id,
                                        invoiceNumber: row.invoiceNumber,
                                        creditLabel: firstContested.creditLabel,
                                        originalAmount: firstContested.amount,
                                        supplierName: proposal.origin_company,
                                        supplierCnpj: proposal.origin_cnpj,
                                        createdAt: proposal.sent_at,
                                      })
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-orange-700 bg-orange-100 border border-orange-200 rounded-full hover:bg-orange-200 transition-colors"
                                    title="Abrir painel de resolução de conflito"
                                  >
                                    <Flag size={10} />
                                    Em conflito
                                  </button>
                                );
                              })()}
                            </div>
                          </Td>
                          <Td align="right">
                            <span className="tabular-nums text-gray-700">
                              {formatCurrency(row.originalValue)}
                            </span>
                          </Td>
                          <Td align="right">
                            <span className="tabular-nums font-semibold text-emerald-700">
                              - {formatCurrency(row.discount)}
                            </span>
                          </Td>
                          <Td align="right" className="hidden md:table-cell">
                            {invoiceLinks.length === 0 ? (
                              <span className="text-xs text-gray-400">—</span>
                            ) : (
                              <div className="flex flex-col items-end gap-1">
                                <span className="tabular-nums font-semibold text-[#0070f2]">
                                  - {formatCurrency(creditsApplied)}
                                </span>
                                <div className="flex flex-wrap justify-end gap-1 max-w-[220px]">
                                  {invoiceLinks.map((l) => (
                                    <span
                                      key={l.id}
                                      className="inline-flex items-center gap-1 pl-1.5 pr-1 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-[10px] text-blue-800"
                                    >
                                      <CircleDollarSign size={10} />
                                      <span className="truncate max-w-[90px]" title={l.creditLabel}>
                                        {l.creditLabel}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => removeCreditLink(l.id)}
                                        aria-label="Remover vínculo"
                                        className="w-3.5 h-3.5 rounded-full hover:bg-blue-100 text-blue-600 hover:text-rose-600 flex items-center justify-center"
                                      >
                                        <Trash2 size={9} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </Td>
                          <Td align="right">
                            <span className="tabular-nums font-semibold text-gray-900">
                              {formatCurrency(finalBalance)}
                            </span>
                          </Td>
                          <Td align="center">
                            <div className="inline-flex items-center gap-1 justify-center">
                              <button
                                type="button"
                                onClick={() =>
                                  canDecide && setDrawerInvoiceId(row.id)
                                }
                                disabled={!canDecide || finalBalance <= 0}
                                className={`inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-semibold text-[#0070f2] bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${focusRing}`}
                                title="Vincular crédito a esta NF"
                              >
                                <Ticket size={12} />
                                <span className="hidden lg:inline">Vincular</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const contestableLinks = invoiceLinks.filter(
                                    (l) => l.status !== 'contested',
                                  );
                                  if (contestableLinks.length === 0) return;
                                  setCreditContestTarget({
                                    invoiceNumber: row.invoiceNumber,
                                    links: contestableLinks.map((l) => ({
                                      id: l.id,
                                      creditLabel: l.creditLabel,
                                      amount: l.amount,
                                    })),
                                  });
                                }}
                                disabled={
                                  invoiceLinks.length === 0 ||
                                  invoiceLinks.every((l) => l.status === 'contested')
                                }
                                aria-label="Contestar créditos vinculados"
                                title={
                                  invoiceLinks.length === 0
                                    ? 'Esta NF não possui créditos vinculados para contestar'
                                    : invoiceLinks.every((l) => l.status === 'contested')
                                      ? 'Todos os créditos desta NF já estão em conflito'
                                      : 'Contestar os créditos vinculados a esta NF'
                                }
                                className={`inline-flex items-center gap-1 h-8 px-2 rounded-md text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                  isContested
                                    ? 'text-orange-700 bg-orange-100 hover:bg-orange-200'
                                    : 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                                } ${focusRing}`}
                              >
                                <Flag size={12} />
                                <span className="hidden lg:inline">Contestar</span>
                              </button>
                              <a
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors ${focusRing}`}
                                aria-label={`Visualizar PDF da ${row.invoiceNumber}`}
                                title="Visualizar documento"
                              >
                                <FileText className="w-4 h-4" />
                              </a>
                            </div>
                          </Td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-slate-50 border-t border-gray-100">
                            <td colSpan={7} className="px-4 sm:px-6 py-4">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                  <Link size={13} className="text-[#0070f2]" />
                                  Extrato de abatimento
                                </div>
                                {!hasAbatement ? (
                                  <p className="text-xs text-gray-500">
                                    Nenhum abatimento aplicado a esta NF.
                                  </p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {row.discount > 0 && (
                                      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-2.5">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-md bg-emerald-50 flex items-center justify-center">
                                            <CircleDollarSign size={14} className="text-emerald-600" />
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-xs font-semibold text-gray-800">
                                              Desconto comercial
                                            </span>
                                            <span className="text-[11px] text-gray-500">
                                              Crédito Origem: Acordo #{proposal.code}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="text-sm font-bold text-emerald-700 tabular-nums">
                                          - {formatCurrency(row.discount)}
                                        </span>
                                      </div>
                                    )}
                                    {invoiceLinks.map((l) => (
                                      <CreditLinkRow
                                        key={l.id}
                                        link={l}
                                        proposalCode={proposal.code}
                                        canContest={true}
                                        onOpenContest={() =>
                                          setCreditContestTarget({
                                            invoiceNumber: row.invoiceNumber,
                                            links: [
                                              {
                                                id: l.id,
                                                creditLabel: l.creditLabel,
                                                amount: l.amount,
                                              },
                                            ],
                                          })
                                        }
                                        onOpenConflict={() =>
                                          setConflictTarget({
                                            linkId: l.id,
                                            proposalCode: proposal.code,
                                            invoiceId: row.id,
                                            invoiceNumber: row.invoiceNumber,
                                            creditLabel: l.creditLabel,
                                            originalAmount: l.amount,
                                            supplierName: proposal.origin_company,
                                            supplierCnpj: proposal.origin_cnpj,
                                            createdAt: proposal.sent_at,
                                          })
                                        }
                                      />
                                    ))}
                                    <div className="flex items-center justify-between px-4 pt-2">
                                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                        Saldo final
                                      </span>
                                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                                        {formatCurrency(finalBalance)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <Td colSpan={2}>
                        <span className="text-xs font-semibold text-gray-700">Totais</span>
                      </Td>
                      <Td align="right">
                        <span className="tabular-nums font-semibold text-gray-900">
                          {formatCurrency(totals.original)}
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="tabular-nums font-bold text-emerald-700">
                          - {formatCurrency(totals.discount)}
                        </span>
                      </Td>
                      <Td align="right" className="hidden md:table-cell">
                        <span className="tabular-nums font-bold text-[#0070f2]">
                          {totals.credits > 0 ? `- ${formatCurrency(totals.credits)}` : '—'}
                        </span>
                      </Td>
                      <Td align="right">
                        <span className="tabular-nums font-bold text-gray-900">
                          {formatCurrency(totals.final)}
                        </span>
                      </Td>
                      <Td align="center">{null}</Td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

        </section>

        <DocumentCenter
          proposalCode={proposal.code}
          totals={totals}
          supplierName={decisionMeta?.responderName || 'Fornecedor'}
          originCompany={proposal.origin_company}
        />

        {decided && (
          <div
            className={`rounded-lg border px-4 py-3 shadow-sm ${
              decision === 'approved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {decision === 'approved' ? (
                <Check className="w-5 h-5 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">
                  {decision === 'approved'
                    ? 'Sua aprovação foi registrada. O gestor já pode formalizar o acordo.'
                    : 'Sua recusa foi registrada. Aguarde uma nova proposta com os ajustes solicitados.'}
                </p>
                {decisionMeta && (
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium opacity-90">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" />
                      {new Date(decisionMeta.at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(decisionMeta.at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5" />
                      {decisionMeta.responderName}
                      {decisionMeta.responderEmail && (
                        <span className="opacity-70">· {decisionMeta.responderEmail}</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] animate-sticky-up">
        <div className="w-full px-8 lg:px-12 py-3 flex items-center justify-between gap-4">
          <p className="hidden md:block text-xs text-gray-500">
            {isExpired
              ? 'Aprovação bloqueada: aguarde uma nova versão da proposta com saldos atualizados.'
              : canDecide
                ? 'Sua decisão será enviada ao gestor que originou esta proposta.'
                : 'Esta proposta não está mais disponível para decisão.'}
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={() => downloadProposalPdf(proposal, rows, totals)}
              className={`inline-flex items-center gap-2 px-3.5 h-10 rounded-md text-gray-700 text-sm font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors ${focusRing}`}
              title="Baixar resumo em PDF com totalizadores e notas"
            >
              <Download className="w-4 h-4" />
              Baixar Resumo
            </button>
            <button
              type="button"
              onClick={() => setShowRefuseModal(true)}
              disabled={submitting || !canDecide}
              className={`inline-flex items-center gap-2 px-4 h-10 rounded-md border border-red-400 text-red-600 text-sm font-semibold hover:bg-red-50 active:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
            >
              <X className="w-4 h-4" />
              Recusar
            </button>
            <button
              type="button"
              onClick={() => setShowApproveModal(true)}
              disabled={submitting || !canDecide}
              className={`inline-flex items-center gap-2 px-5 h-10 rounded-md bg-[#118D4D] hover:bg-[#0E7A42] active:bg-[#0B6535] text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#118D4D] focus-visible:ring-offset-2`}
            >
              <Check className="w-4 h-4" />
              Aprovar Acordo
            </button>
          </div>
        </div>
      </div>

      {drawerInvoiceId && (() => {
        const invoice = rows.find((r) => r.id === drawerInvoiceId);
        if (!invoice) return null;
        const used = getLinksForInvoice(code, invoice.id).reduce((s, l) => s + l.amount, 0);
        const remaining = Math.max(invoice.originalValue - invoice.discount - used, 0);
        return (
          <CreditLinkDrawer
            proposalCode={code}
            invoice={{
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              remainingBalance: remaining,
            }}
            onClose={() => setDrawerInvoiceId(null)}
          />
        );
      })()}

      {showRefuseModal && (
        <RefuseModal
          reason={refuseReason}
          onChangeReason={handleChangeRefuseReason}
          onCancel={() => {
            if (submitting) return;
            setShowRefuseModal(false);
          }}
          onConfirm={handleConfirmRefuse}
          submitting={submitting}
        />
      )}

      {showContestModal && (
        <ContestModal
          onClose={() => !submitting && setShowContestModal(false)}
          onConfirm={handleConfirmContest}
          submitting={submitting}
        />
      )}

      {showApproveModal && (
        <ApproveModal
          onCancel={handleCloseApproveModal}
          onConfirm={handleConfirmApprove}
          submitting={submitting}
          success={approveSuccess}
          discount={totals.discount}
        />
      )}

      {creditContestTarget && (
        <CreditContestModal
          invoiceNumber={creditContestTarget.invoiceNumber}
          links={creditContestTarget.links}
          onClose={() => {
            if (!submittingCreditContest) setCreditContestTarget(null);
          }}
          onConfirm={async (reasonCode, observations) => {
            setSubmittingCreditContest(true);
            try {
              for (const link of creditContestTarget.links) {
                await contestCreditLinkApi(link.id, { reasonCode, observations });
              }
              const count = creditContestTarget.links.length;
              showToast(
                'warning',
                'Crédito enviado para análise de conflito',
                count === 1
                  ? `${creditContestTarget.links[0].creditLabel} foi marcado como Em Conflito. A liquidação da proposta está pausada até a resolução.`
                  : `${count} créditos vinculados à ${creditContestTarget.invoiceNumber} foram marcados como Em Conflito. A liquidação está pausada.`,
                {
                  label: 'Ver propostas recebidas',
                  onClick: () => navigate('/app/acordos-comerciais/revisao-proposta'),
                },
              );
              setCreditContestTarget(null);
            } catch (err) {
              showToast(
                'error',
                'Não foi possível registrar a contestação',
                err instanceof Error ? err.message : 'Tente novamente em instantes.',
              );
            } finally {
              setSubmittingCreditContest(false);
            }
          }}
          submitting={submittingCreditContest}
        />
      )}

      <ConflictResolutionDrawer
        target={conflictTarget}
        onClose={() => setConflictTarget(null)}
        onResolved={() => {
          loadCreditLinks(code);
        }}
      />
    </div>
  );
}

const CREDIT_CONTEST_REASONS: { code: string; label: string }[] = [
  { code: 'valor_devolucao_divergente', label: 'Valor de devolução divergente' },
  { code: 'verba_ja_utilizada', label: 'Verba já utilizada' },
  { code: 'credito_nao_reconhecido', label: 'Crédito não reconhecido' },
  { code: 'documento_divergente', label: 'Documento de origem divergente' },
  { code: 'outro', label: 'Outro motivo' },
];

interface CreditContestModalProps {
  invoiceNumber: string;
  links: { id: string; creditLabel: string; amount: number }[];
  onClose: () => void;
  onConfirm: (reasonCode: string, observations: string) => void | Promise<void>;
  submitting: boolean;
}

function CreditContestModal({
  invoiceNumber,
  links,
  onClose,
  onConfirm,
  submitting,
}: CreditContestModalProps) {
  const totalAmount = links.reduce((sum, l) => sum + l.amount, 0);
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
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-slate-900">Contestar crédito</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Abra uma disputa sobre {links.length > 1 ? 'os créditos vinculados' : 'este crédito vinculado'} à{' '}
                <span className="font-semibold text-slate-800">{invoiceNumber}</span>. Ele passará para{' '}
                <span className="font-semibold text-orange-700">Em Conflito</span> e a liquidação
                da proposta vinculada será pausada.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Fechar"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-3 space-y-2">
            {links.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <CircleDollarSign size={14} className="text-[#0070f2]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{l.creditLabel}</p>
                    <p className="text-[11px] text-slate-500">Vinculado a {invoiceNumber}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900 tabular-nums flex-shrink-0">
                  {formatCurrency(l.amount)}
                </span>
              </div>
            ))}
            {links.length > 1 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Total a contestar
                </span>
                <span className="text-sm font-bold text-orange-700 tabular-nums">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="credit-contest-reason" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Motivo <span className="text-red-600">*</span>
            </label>
            <select
              id="credit-contest-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              className="w-full text-sm border border-slate-300 rounded-md px-3 h-10 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            >
              <option value="">Selecione um motivo...</option>
              {CREDIT_CONTEST_REASONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="credit-contest-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Observações detalhadas <span className="text-red-600">*</span>
            </label>
            <textarea
              id="credit-contest-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Descreva os pontos divergentes (valores, NFs envolvidas, prazos, etc.)."
              disabled={submitting}
              className="w-full text-sm border border-slate-300 rounded-md px-3 py-2 resize-none placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Mínimo de 10 caracteres. Essa justificativa será enviada ao gestor comercial.
            </p>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
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

interface CreditLinkRowProps {
  link: {
    id: string;
    creditLabel: string;
    amount: number;
    status: 'linked' | 'pending_review' | 'contested' | 'resolved';
  };
  proposalCode: string;
  canContest: boolean;
  onOpenContest: () => void;
  onOpenConflict?: () => void;
}

function CreditLinkRow({ link, canContest, onOpenContest, onOpenConflict }: CreditLinkRowProps) {
  const statusMeta = CREDIT_STATUS_META[link.status];
  const allowContest =
    canContest && (link.status === 'linked' || link.status === 'pending_review');

  return (
    <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Ticket size={14} className="text-[#0070f2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-slate-800 truncate">
              {link.creditLabel}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border flex-shrink-0 ${statusMeta.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            Crédito Origem: {link.creditLabel} · Valor Abatido
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="text-sm font-bold text-[#0070f2] tabular-nums">
          - {formatCurrency(link.amount)}
        </span>
        {link.status === 'contested' ? (
          <button
            type="button"
            onClick={onOpenConflict}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11px] font-bold text-orange-800 bg-orange-100 border border-orange-300 hover:bg-orange-200 transition-colors"
            title="Abrir painel de resolução de conflito"
          >
            <AlertTriangle size={12} />
            Resolver conflito
          </button>
        ) : allowContest ? (
          <button
            type="button"
            onClick={onOpenContest}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-semibold text-orange-700 border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
            title="Contestar este crédito"
          >
            <AlertTriangle size={13} />
            Contestar
          </button>
        ) : null}
      </div>
    </div>
  );
}

const CREDIT_STATUS_META: Record<
  'linked' | 'pending_review' | 'contested' | 'resolved',
  { label: string; className: string; dot: string }
> = {
  linked: {
    label: 'Vinculado',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  pending_review: {
    label: 'Pendente de Revisão',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  contested: {
    label: 'Em Conflito',
    className: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  resolved: {
    label: 'Resolvido',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

interface ImpactCardProps {
  label: string;
  value: string;
  footnote?: string;
  tone: 'neutral' | 'positive' | 'emphasis';
  hint?: string;
}

function ImpactCard({ label, value, footnote, tone, hint }: ImpactCardProps) {
  const valueClasses =
    tone === 'positive'
      ? 'text-[#118D4D] text-2xl font-bold'
      : tone === 'emphasis'
        ? 'text-gray-900 text-2xl font-bold'
        : 'text-gray-900 text-2xl font-semibold';
  return (
    <div
      className={`bg-white border rounded-lg shadow-sm p-5 ${
        tone === 'emphasis' ? 'border-[#0A6ED1]/30 ring-1 ring-[#0A6ED1]/15' : 'border-gray-200'
      }`}
    >
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 flex items-center gap-1.5">
        {label}
        {hint && <InfoHint label={label} lines={[hint]} />}
      </p>
      <p className={`mt-2 tabular-nums leading-tight ${valueClasses}`}>{value}</p>
      {footnote && <p className="text-xs text-gray-500 mt-2">{footnote}</p>}
    </div>
  );
}

interface InfoHintProps {
  label: string;
  lines: string[];
}

function InfoHint({ label, lines }: InfoHintProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={`inline-flex items-center justify-center w-3.5 h-3.5 text-gray-400 hover:text-blue-600 rounded-full transition-colors ${focusRing}`}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={`Detalhes sobre ${label}`}
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-w-[16rem] bg-gray-900 text-white text-[11px] rounded-md shadow-xl px-3 py-2 leading-relaxed normal-case tracking-normal font-normal"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-300 mb-1">
            {label}
          </span>
          {lines.map((line, idx) => (
            <span key={idx} className="block">
              {line}
            </span>
          ))}
          <span className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45 bg-gray-900" />
        </span>
      )}
    </span>
  );
}

function EmptyTableState() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleUploadClick = () => fileInputRef.current?.click();
  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    showToast(
      'success',
      'XML recebido',
      `${files.length} arquivo${files.length > 1 ? 's' : ''} enviado${files.length > 1 ? 's' : ''} para processamento.`,
    );
    e.target.value = '';
  };
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
    >
      <div className="mx-auto w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
        <FileUp size={40} className="text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-gray-800">
        Nenhuma nota fiscal encontrada
      </p>
      <p className="text-xs text-gray-500 mt-1 max-w-sm">
        Você pode enviar os XMLs das notas em aberto diretamente. Elas ficarão disponíveis para vinculação assim que forem processadas.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,text/xml"
        multiple
        hidden
        onChange={handleFilesChosen}
      />
      <button
        type="button"
        onClick={handleUploadClick}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-[#0070f2] text-white text-xs font-semibold rounded-lg hover:bg-[#005bc4] shadow-sm hover:shadow-md transition-all"
      >
        <FileUp size={16} />
        Subir XML de NF em Aberto
      </button>
    </div>
  );
}

function ProposalTimeline({
  sentAt,
  status,
}: {
  sentAt: string;
  status: Proposal['status'];
}) {
  const createdAt = new Date(sentAt);
  createdAt.setDate(createdAt.getDate() - 1);
  const decisionLabel =
    status === 'approved'
      ? 'Aprovado pelo fornecedor'
      : status === 'refused'
        ? 'Recusado pelo fornecedor'
        : status === 'expired'
          ? 'Proposta expirada'
          : 'Aguardando sua resposta';
  const decisionTone =
    status === 'approved'
      ? { dot: 'bg-emerald-500', icon: <Check className="w-3 h-3 text-white" /> }
      : status === 'refused'
        ? { dot: 'bg-rose-500', icon: <X className="w-3 h-3 text-white" /> }
        : status === 'expired'
          ? { dot: 'bg-gray-400', icon: <AlertTriangle className="w-3 h-3 text-white" /> }
          : { dot: 'bg-amber-500', icon: <Hourglass className="w-3 h-3 text-white" /> };

  const steps = [
    {
      label: 'Acordo criado',
      date: formatDate(createdAt.toISOString()),
      done: true,
      dot: 'bg-blue-600',
      icon: <FileText className="w-3 h-3 text-white" />,
    },
    {
      label: 'Enviado ao fornecedor',
      date: formatDate(sentAt),
      done: true,
      dot: 'bg-blue-600',
      icon: <Send className="w-3 h-3 text-white" />,
    },
    {
      label: decisionLabel,
      date: status === 'pending' ? 'em andamento' : formatDate(new Date().toISOString()),
      done: status !== 'pending',
      dot: decisionTone.dot,
      icon: decisionTone.icon,
      pulse: status === 'pending',
    },
  ];

  return (
    <section
      aria-label="Linha do tempo da proposta"
      className="bg-white border border-gray-200 rounded-lg shadow-sm px-5 py-4"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 flex-1 min-w-[200px]">
            <span
              className={`relative w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${step.dot}`}
            >
              {step.icon}
              {step.pulse && (
                <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-60" />
              )}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{step.label}</p>
              <p className="text-[11px] text-gray-500">{step.date}</p>
            </div>
            {idx < steps.length - 1 && (
              <span className="hidden md:block flex-1 h-px bg-gradient-to-r from-blue-200 to-gray-200" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function RevisaoSkeleton() {
  const block = 'bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:800px_100%] animate-shimmer rounded';
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-3">
          <div className={`h-3 w-40 ${block}`} />
          <div className={`h-6 w-80 ${block}`} />
          <div className={`h-3 w-3/4 max-w-md ${block}`} />
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 space-y-6">
        <div className={`h-16 w-full ${block}`} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`h-28 ${block}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-10 ${block}`} />
            ))}
          </div>
          <div className={`h-64 ${block}`} />
        </div>
      </main>
    </div>
  );
}

function downloadProposalPdf(
  proposal: Proposal,
  rows: ProposalRow[],
  totals: { original: number; discount: number; final: number },
) {
  const lines = [
    `RESUMO DA PROPOSTA #${proposal.code}`,
    '',
    `Empresa de origem: ${proposal.origin_company}`,
    `Recebida em: ${formatDate(proposal.sent_at)}`,
    `Status: ${proposal.status}`,
    '',
    'Notas fiscais incluídas:',
    ...rows.map(
      (r) =>
        `  - ${r.invoiceNumber} | ${formatDate(r.emissionDate)} | Original ${formatCurrency(r.originalValue)} | Desconto ${formatCurrency(r.discount)} | Saldo ${formatCurrency(r.originalValue - r.discount)}`,
    ),
    '',
    'TOTALIZADORES',
    `Valor original: ${formatCurrency(totals.original)}`,
    `Desconto:       ${formatCurrency(totals.discount)}`,
    `Líquido:        ${formatCurrency(totals.final)}`,
  ];
  const blob = new Blob([lines.join('\n')], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `resumo-proposta-${proposal.code}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Th({
  children,
  align = 'left',
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return <th className={`px-2 sm:px-3 py-2.5 font-semibold ${alignClass} ${className}`}>{children}</th>;
}

function Td({
  children,
  align = 'left',
  colSpan,
  className = '',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  colSpan?: number;
  className?: string;
}) {
  const alignClass =
    align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <td colSpan={colSpan} className={`px-2 sm:px-3 py-2.5 text-sm text-gray-700 ${alignClass} ${className}`}>
      {children}
    </td>
  );
}

interface RefuseModalProps {
  reason: string;
  onChangeReason: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}

function RefuseModal({
  reason,
  onChangeReason,
  onCancel,
  onConfirm,
  submitting,
}: RefuseModalProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [agreed, setAgreed] = useState(false);
  const canConfirm = reason.trim().length > 0 && agreed && !submitting;
  const hasDraft = reason.trim().length > 0;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 animate-overlay-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="refuse-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-modal-in">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div>
            <h3 id="refuse-modal-title" className="text-base font-semibold text-gray-900">
              Motivo da Recusa
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Explique o que precisa ser ajustado para que um novo acordo seja gerado.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className={`p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-500 ${focusRing}`}
            aria-label="Fechar"
            disabled={submitting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          <label
            htmlFor="refuse-reason"
            className="block text-xs font-semibold text-gray-700 mb-1.5"
          >
            Justificativa <span className="text-red-600">*</span>
          </label>
          <textarea
            id="refuse-reason"
            ref={textareaRef}
            value={reason}
            onChange={(e) => onChangeReason(e.target.value)}
            rows={5}
            placeholder="Descreva os pontos que precisam ser ajustados nesta proposta."
            className={`w-full text-sm border border-gray-300 rounded-md px-3 py-2 resize-none placeholder:text-gray-400 ${focusRing} focus-visible:border-blue-500`}
            disabled={submitting}
          />
          <p className="text-[11px] text-gray-500 mt-1.5 flex items-center justify-between">
            <span>Esta justificativa será encaminhada ao gestor responsável.</span>
            {hasDraft && (
              <span className="text-blue-600 font-medium">Rascunho salvo automaticamente</span>
            )}
          </p>

          <TermsAgreement
            id="refuse-terms"
            checked={agreed}
            onChange={setAgreed}
            disabled={submitting}
            tone="danger"
            label={
              <>
                Declaro que li e <span className="font-semibold">concordo com os termos</span>{' '}
                desta recusa e entendo que esta ação será registrada e encaminhada ao gestor
                responsável.
              </>
            }
          />
        </div>

        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm}
            title={!agreed ? 'Confirme a concordância com os termos para prosseguir' : undefined}
            className={`inline-flex items-center gap-2 px-4 h-9 rounded-md text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
          >
            {submitting ? 'Enviando...' : 'Confirmar Recusa'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ApproveModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
  success: boolean;
  discount: number;
}

function ApproveModal({ onCancel, onConfirm, submitting, success, discount }: ApproveModalProps) {
  const [agreed, setAgreed] = useState(false);
  const canConfirm = agreed && !submitting;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel, submitting]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 animate-overlay-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-modal-title"
    >
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-modal-in">
        {success ? (
          <div className="px-6 py-8 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Acordo aprovado com sucesso!
            </h3>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              A liquidação financeira foi enviada ao ERP. O desconto de{' '}
              <span className="font-semibold text-emerald-700">{formatCurrency(discount)}</span>{' '}
              será aplicado às notas selecionadas.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className={`mt-6 px-5 h-10 rounded-md bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors ${focusRing}`}
              autoFocus
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
              <div>
                <h3 id="approve-modal-title" className="text-base font-semibold text-gray-900">
                  Confirmar aprovação
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Esta ação registrará seu aceite e enviará a liquidação ao ERP.
                </p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className={`p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-500 ${focusRing}`}
                aria-label="Fechar"
                disabled={submitting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-5 text-sm text-gray-700 leading-relaxed">
              Deseja aceitar os termos deste acordo? O desconto total de{' '}
              <span className="font-semibold text-gray-900">{formatCurrency(discount)}</span> será
              encaminhado ao ERP para liquidação.
              <TermsAgreement
                id="approve-terms"
                checked={agreed}
                onChange={setAgreed}
                disabled={submitting}
                tone="primary"
                label={
                  <>
                    Li e <span className="font-semibold">concordo com os termos</span> deste
                    acordo comercial e autorizo o envio da liquidação ao ERP.
                  </>
                }
              />
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={onConfirm}
                disabled={!canConfirm}
                title={!agreed ? 'Confirme a concordância com os termos para prosseguir' : undefined}
                className={`inline-flex items-center gap-2 px-4 h-9 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] justify-center ${focusRing}`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando ao ERP...
                  </>
                ) : (
                  'Sim, confirmar'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


interface ContestModalProps {
  onClose: () => void;
  onConfirm: (reasonCode: string, observations: string) => void;
  submitting: boolean;
}

function ContestModal({ onClose, onConfirm, submitting }: ContestModalProps) {
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] px-4 animate-overlay-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contest-modal-title"
    >
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-modal-in">
        <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 id="contest-modal-title" className="text-base font-semibold text-gray-900">
                Contestar proposta
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Abra uma disputa. O acordo passará para <span className="font-semibold text-orange-700">Em Conflito</span> e o gestor revisará os termos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0 ${focusRing}`}
            aria-label="Fechar"
            disabled={submitting}
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <label htmlFor="contest-reason" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Motivo <span className="text-red-600">*</span>
            </label>
            <select
              id="contest-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              className={`w-full text-sm border border-gray-300 rounded-md px-3 h-10 bg-white ${focusRing} focus-visible:border-orange-500`}
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
            <label htmlFor="contest-notes" className="block text-xs font-semibold text-gray-700 mb-1.5">
              Observações detalhadas <span className="text-red-600">*</span>
            </label>
            <textarea
              id="contest-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Descreva os pontos divergentes (valores, NFs envolvidas, prazos, etc.)."
              disabled={submitting}
              className={`w-full text-sm border border-gray-300 rounded-md px-3 py-2 resize-none placeholder:text-gray-400 ${focusRing} focus-visible:border-orange-500`}
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
            className={`inline-flex items-center gap-2 px-4 h-9 rounded-md text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${focusRing}`}
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

interface TermsAgreementProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label: React.ReactNode;
  tone?: "primary" | "danger";
}

function TermsAgreement({ id, checked, onChange, disabled, label, tone = "primary" }: TermsAgreementProps) {
  const palette =
    tone === "danger"
      ? {
          box: checked ? "bg-red-600 border-red-600" : "bg-white border-gray-300 hover:border-red-400",
          ring: "focus-visible:ring-red-500",
          highlight: checked ? "border-red-200 bg-red-50/60" : "border-gray-200",
        }
      : {
          box: checked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-blue-400",
          ring: "focus-visible:ring-blue-500",
          highlight: checked ? "border-blue-200 bg-blue-50/60" : "border-gray-200",
        };
  return (
    <label
      htmlFor={id}
      className={`mt-4 flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-xs text-gray-700 leading-relaxed cursor-pointer select-none transition-colors ${palette.highlight} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        required
        aria-required="true"
      />
      <span
        aria-hidden="true"
        className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${palette.box} ${palette.ring}`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </span>
      <span>
        {label}{" "}
        <span className="text-red-600">*</span>
      </span>
    </label>
  );
}
