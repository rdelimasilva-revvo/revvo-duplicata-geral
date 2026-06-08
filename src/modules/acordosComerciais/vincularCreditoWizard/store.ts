import { create } from 'zustand';
import {
  SupplierCredit,
  EligibleInvoice,
  WIZARD_STEPS,
  WizardStepId,
} from './types';

const roundCents = (value: number) => Math.round(value * 100) / 100;

interface VincularCreditoWizardState {
  currentStepIndex: number;
  credits: SupplierCredit[];
  invoices: EligibleInvoice[];
  loading: boolean;
  error: string | null;

  selectedCreditId: string | null;
  selectedInvoiceIds: Record<string, boolean>;
  allocations: Record<string, number>;
  notes: string;
  acceptResidual: boolean;

  proposalId: string | null;
  submitting: boolean;
  submissionError: string | null;

  setData: (data: { credits: SupplierCredit[]; invoices: EligibleInvoice[] }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  selectCredit: (creditId: string) => void;
  toggleInvoice: (invoiceId: string) => void;
  setAllocation: (invoiceId: string, value: number) => void;
  setNotes: (text: string) => void;
  setAcceptResidual: (accept: boolean) => void;
  autoDistribute: () => void;
  clearDistribution: () => void;

  goNext: () => void;
  goPrevious: () => void;
  goToStep: (stepId: WizardStepId) => void;
  reset: () => void;

  setSubmitting: (submitting: boolean) => void;
  setSubmissionError: (error: string | null) => void;
  setProposalId: (id: string | null) => void;
}

const INITIAL_STATE = {
  currentStepIndex: 0,
  credits: [],
  invoices: [],
  loading: true,
  error: null,
  selectedCreditId: null,
  selectedInvoiceIds: {},
  allocations: {},
  notes: '',
  acceptResidual: false,
  proposalId: null,
  submitting: false,
  submissionError: null,
};

export const useVincularCreditoWizardStore = create<VincularCreditoWizardState>((set, get) => ({
  ...INITIAL_STATE,

  setData: ({ credits, invoices }) => set({ credits, invoices }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  selectCredit: (creditId) => {
    const { selectedCreditId } = get();
    if (creditId === selectedCreditId) {
      set({ selectedCreditId: creditId });
      return;
    }
    set({
      selectedCreditId: creditId,
      selectedInvoiceIds: {},
      allocations: {},
    });
  },

  toggleInvoice: (invoiceId) => {
    const { selectedInvoiceIds, allocations } = get();
    const next = { ...selectedInvoiceIds };
    const nextAllocations = { ...allocations };
    if (next[invoiceId]) {
      delete next[invoiceId];
      delete nextAllocations[invoiceId];
    } else {
      next[invoiceId] = true;
    }
    set({ selectedInvoiceIds: next, allocations: nextAllocations });
  },

  setAllocation: (invoiceId, value) => {
    const { allocations } = get();
    set({ allocations: { ...allocations, [invoiceId]: roundCents(value) } });
  },

  setNotes: (text) => set({ notes: text }),

  setAcceptResidual: (accept) => set({ acceptResidual: accept }),

  autoDistribute: () => {
    const { credits, invoices, selectedCreditId, selectedInvoiceIds } = get();
    const credit = credits.find((c) => c.id === selectedCreditId);
    if (!credit) return;
    const targets = invoices.filter(
      (i) => i.supplierId === credit.supplierId && selectedInvoiceIds[i.id],
    );
    if (targets.length === 0) return;

    const creditValue = credit.remainingValue;
    const somaCap = targets.reduce((s, i) => s + i.openBalance, 0);
    const next: Record<string, number> = {};

    if (somaCap <= creditValue) {
      targets.forEach((i) => {
        next[i.id] = roundCents(i.openBalance);
      });
    } else {
      let restante = creditValue;
      targets.forEach((i, idx) => {
        if (idx === targets.length - 1) {
          next[i.id] = roundCents(Math.max(0, Math.min(i.openBalance, restante)));
        } else {
          const proporcao = i.openBalance / somaCap;
          const valor = Math.min(i.openBalance, roundCents(creditValue * proporcao));
          next[i.id] = valor;
          restante = roundCents(restante - valor);
        }
      });
    }

    set({ allocations: next });
  },

  clearDistribution: () => set({ selectedInvoiceIds: {}, allocations: {} }),

  goNext: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex < WIZARD_STEPS.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  goPrevious: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 });
    }
  },

  goToStep: (stepId) => {
    const target = WIZARD_STEPS.find((s) => s.id === stepId);
    if (!target) return;
    const { currentStepIndex } = get();
    if (target.index <= currentStepIndex) {
      set({ currentStepIndex: target.index });
    }
  },

  reset: () => set({ ...INITIAL_STATE }),

  setSubmitting: (submitting) => set({ submitting }),
  setSubmissionError: (error) => set({ submissionError: error }),
  setProposalId: (id) => set({ proposalId: id }),
}));

export const selectComputed = (state: VincularCreditoWizardState) => {
  const credit = state.credits.find((c) => c.id === state.selectedCreditId) || null;
  const invoicesForSupplier = credit
    ? state.invoices.filter((i) => i.supplierId === credit.supplierId)
    : [];
  const selectedInvoices = invoicesForSupplier.filter((i) => state.selectedInvoiceIds[i.id]);

  const totalAllocated = selectedInvoices.reduce(
    (s, i) => s + (Number(state.allocations[i.id]) || 0),
    0,
  );

  const creditValue = credit?.remainingValue ?? 0;
  const remaining = roundCents(creditValue - totalAllocated);
  const overspent = remaining < -0.009;
  const balanced = credit !== null && Math.abs(remaining) < 0.01 && totalAllocated > 0;

  // Total open balance available across all eligible invoices for this supplier
  const totalOpenBalance = invoicesForSupplier
    .filter((i) => i.status !== 'bloqueada')
    .reduce((s, i) => s + i.openBalance, 0);
  // True when there is no way to fully consume the credit because the supplier
  // simply doesn't have enough open NF balance.
  const insufficientInvoices = credit !== null && totalOpenBalance < creditValue - 0.01;

  // Residual that the user is preserving for future allocations.
  const residual = remaining > 0.009 ? remaining : 0;
  const hasResidual = residual > 0;

  return {
    credit,
    invoicesForSupplier,
    selectedInvoices,
    totalAllocated,
    creditValue,
    remaining,
    overspent,
    balanced,
    totalOpenBalance,
    insufficientInvoices,
    residual,
    hasResidual,
  };
};

export const canAdvanceFrom = (
  stepIndex: number,
  state: VincularCreditoWizardState,
): { ok: boolean; reason?: string } => {
  const computed = selectComputed(state);
  if (stepIndex === 0) {
    if (!computed.credit) return { ok: false, reason: 'Selecione um crédito para continuar.' };
    return { ok: true };
  }
  if (stepIndex === 1) {
    if (computed.selectedInvoices.length === 0) {
      return { ok: false, reason: 'Selecione ao menos uma nota fiscal.' };
    }
    if (computed.overspent) {
      return { ok: false, reason: 'O distribuído excede o crédito disponível.' };
    }
    if (computed.totalAllocated <= 0) {
      return { ok: false, reason: 'Informe um valor a abater nas NFs selecionadas.' };
    }
    if (!computed.balanced && !state.acceptResidual) {
      return {
        ok: false,
        reason:
          'A conta não fecha. Distribua todo o saldo ou marque "Manter saldo restante" para continuar.',
      };
    }
    return { ok: true };
  }
  return { ok: true };
};
