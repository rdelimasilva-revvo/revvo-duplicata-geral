import React, { useEffect } from 'react';
import {
  Scales,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  PaperPlaneTilt,
  X,
} from '@phosphor-icons/react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import {
  WizardShell,
  WizardHeader,
  HeaderTopRow,
  HeaderTitleGroup,
  HeaderIconBadge,
  HeaderTitle,
  HeaderSubtitle,
  WizardBody,
  WizardFooter,
  FooterInner,
  FooterHint,
  WizardButton,
} from './styles';
import { Stepper } from './components/Stepper';
import { StepSelectCredit } from './steps/StepSelectCredit';
import { StepDistribute } from './steps/StepDistribute';
import { StepConfirm } from './steps/StepConfirm';
import {
  useVincularCreditoWizardStore,
  selectComputed,
  canAdvanceFrom,
} from './store';
import { WIZARD_STEPS } from './types';

interface VincularCreditoWizardProps {
  onBack: () => void;
  onSubmit?: (proposalId: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);

export function VincularCreditoWizard({ onBack, onSubmit }: VincularCreditoWizardProps) {
  const { showToast } = useToast();

  const currentStepIndex = useVincularCreditoWizardStore((s) => s.currentStepIndex);
  const loading = useVincularCreditoWizardStore((s) => s.loading);
  const error = useVincularCreditoWizardStore((s) => s.error);
  const submitting = useVincularCreditoWizardStore((s) => s.submitting);
  const notes = useVincularCreditoWizardStore((s) => s.notes);

  const setData = useVincularCreditoWizardStore((s) => s.setData);
  const setLoading = useVincularCreditoWizardStore((s) => s.setLoading);
  const setError = useVincularCreditoWizardStore((s) => s.setError);
  const goNext = useVincularCreditoWizardStore((s) => s.goNext);
  const goPrevious = useVincularCreditoWizardStore((s) => s.goPrevious);
  const goToStep = useVincularCreditoWizardStore((s) => s.goToStep);
  const reset = useVincularCreditoWizardStore((s) => s.reset);
  const setSubmitting = useVincularCreditoWizardStore((s) => s.setSubmitting);
  const setSubmissionError = useVincularCreditoWizardStore((s) => s.setSubmissionError);

  const validation = useVincularCreditoWizardStore((state) =>
    canAdvanceFrom(state.currentStepIndex, state),
  );
  const computed = useVincularCreditoWizardStore(selectComputed);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [creditsRes, invoicesRes] = await Promise.all([
          supabase
            .from('supplier_credits')
            .select('*')
            .order('created_at', { ascending: false }),
          supabase
            .from('eligible_invoices')
            .select('*')
            .order('due_date', { ascending: true }),
        ]);
        if (creditsRes.error) throw creditsRes.error;
        if (invoicesRes.error) throw invoicesRes.error;
        if (cancelled) return;
        setData({
          credits: (creditsRes.data || []).map((r: any) => ({
            id: r.id,
            code: r.code,
            supplierId: r.supplier_id,
            supplierName: r.supplier_name,
            supplierCnpj: r.supplier_cnpj,
            origin: r.origin,
            totalValue: Number(r.total_value),
            remainingValue: Number(r.remaining_value),
            issueDate: r.issue_date,
            expiresAt: r.expires_at,
            status: r.status,
          })),
          invoices: (invoicesRes.data || []).map((r: any) => ({
            id: r.id,
            supplierId: r.supplier_id,
            number: r.number,
            issueDate: r.issue_date,
            dueDate: r.due_date,
            originalValue: Number(r.original_value),
            openBalance: Number(r.open_balance),
            status: r.status,
          })),
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [setData, setLoading, setError]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const handleAdvance = () => {
    if (!validation.ok) {
      showToast('warning', 'Atenção', validation.reason || 'Verifique os campos obrigatórios.');
      return;
    }
    goNext();
  };

  const handleConfirm = async () => {
    if (!computed.credit || computed.selectedInvoices.length === 0) {
      showToast('error', 'Sem dados para gravar', 'Volte e revise as etapas anteriores.');
      return;
    }
    setSubmitting(true);
    setSubmissionError(null);

    const proposalId = `AC-${Date.now()}`;
    try {
      const { data: authData } = await supabase.auth.getUser();
      const ownerId = authData?.user?.id ?? null;

      const residualSuffix =
        computed.residual > 0
          ? `\n[residual_balance=${computed.residual.toFixed(2)} fully_distributed=${
              computed.balanced ? 'true' : 'false'
            }]`
          : '';
      const composedNotes = `${notes || ''}${residualSuffix}`.trim() || null;

      const rows = computed.selectedInvoices.map((invoice) => ({
        proposal_id: proposalId,
        credit_id: computed.credit!.id,
        invoice_id: invoice.id,
        supplier_id: computed.credit!.supplierId,
        allocated_value: Number(
          useVincularCreditoWizardStore.getState().allocations[invoice.id] || 0,
        ),
        notes: composedNotes,
        owner_id: ownerId,
      }));

      if (ownerId) {
        const { error: insertError } = await supabase
          .from('credit_invoice_allocations')
          .insert(rows);
        if (insertError) throw insertError;

        const newRemaining = Math.max(0, computed.residual);
        const newStatus = newRemaining < 0.01 ? 'consumed' : 'partial';
        await supabase
          .from('supplier_credits')
          .update({ remaining_value: newRemaining, status: newStatus })
          .eq('id', computed.credit!.id);
      }

      const successDetail = computed.balanced
        ? `${formatCurrency(computed.totalAllocated)} distribuídos em ${computed.selectedInvoices.length} NF(s).`
        : `${formatCurrency(computed.totalAllocated)} distribuídos em ${computed.selectedInvoices.length} NF(s). Saldo de ${formatCurrency(computed.residual)} preservado para uso futuro.`;

      showToast('success', 'Vinculação confirmada', successDetail);
      onSubmit?.(proposalId);
      reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gravar vinculação';
      setSubmissionError(message);
      showToast('error', 'Erro ao gravar', message);
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;
  const stepDescriptor = WIZARD_STEPS[currentStepIndex];

  if (loading) {
    return (
      <WizardShell>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
          <CircleNotch size={28} className="animate-spin text-[#0070f2]" />
          <p className="text-sm text-gray-500">Carregando créditos e notas…</p>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell>
      <WizardHeader>
        <HeaderTopRow>
          <HeaderTitleGroup>
            <HeaderIconBadge>
              <Scales size={20} className="text-white" weight="fill" />
            </HeaderIconBadge>
            <div>
              <HeaderTitle>Selecionar NFs e Vincular Crédito</HeaderTitle>
              <HeaderSubtitle>
                Etapa {currentStepIndex + 1} de {WIZARD_STEPS.length} — {stepDescriptor.title}
              </HeaderSubtitle>
            </div>
          </HeaderTitleGroup>
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            aria-label="Fechar e voltar para créditos"
            title="Fechar"
            className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={16} weight="bold" />
          </button>
        </HeaderTopRow>
        <Stepper currentIndex={currentStepIndex} onJumpTo={goToStep} />
      </WizardHeader>

      <WizardBody>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            <WarningCircle size={14} weight="fill" />
            {error}
          </div>
        )}

        {currentStepIndex === 0 && <StepSelectCredit />}
        {currentStepIndex === 1 && <StepDistribute />}
        {currentStepIndex === 2 && <StepConfirm />}
      </WizardBody>

      <WizardFooter>
        <FooterInner>
          <FooterHint>
            {validation.ok ? (
              computed.hasResidual && !computed.balanced ? (
                <>
                  <CheckCircle size={14} weight="fill" className="text-amber-500" />
                  Pronto — saldo de {formatCurrency(computed.residual)} será preservado
                </>
              ) : (
                <>
                  <CheckCircle size={14} weight="fill" className="text-emerald-500" />
                  Pronto para avançar
                </>
              )
            ) : (
              <>
                <WarningCircle size={14} weight="fill" className="text-amber-500" />
                {validation.reason}
              </>
            )}
          </FooterHint>
          <div className="flex items-center gap-2">
            <WizardButton
              type="button"
              $variant="secondary"
              onClick={currentStepIndex === 0 ? onBack : goPrevious}
              disabled={submitting}
            >
              {currentStepIndex === 0 ? <X size={14} /> : <ArrowLeft size={14} />}
              {currentStepIndex === 0 ? 'Sair' : 'Voltar'}
            </WizardButton>
            {isLastStep ? (
              <WizardButton
                type="button"
                $variant="success"
                onClick={handleConfirm}
                disabled={submitting || computed.overspent || computed.totalAllocated <= 0}
              >
                {submitting ? (
                  <>
                    <CircleNotch size={14} className="animate-spin" />
                    Gravando…
                  </>
                ) : (
                  <>
                    <PaperPlaneTilt size={14} weight="fill" />
                    Confirmar vinculação
                  </>
                )}
              </WizardButton>
            ) : (
              <WizardButton
                type="button"
                $variant="primary"
                onClick={handleAdvance}
                disabled={!validation.ok}
              >
                Continuar
                <ArrowRight size={14} />
              </WizardButton>
            )}
          </div>
        </FooterInner>
      </WizardFooter>
    </WizardShell>
  );
}
