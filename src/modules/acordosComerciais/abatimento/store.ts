import { create } from 'zustand';
import {
  Credit, Invoice, LinkedInvoice, AbatimentoStep, Supplier,
  SettlementClassification, SettlementOutcome, SupplierAdjustment,
} from './types';
import { suppliers, credits, invoices } from './mockData';

interface AbatimentoStore {
  suppliers: Supplier[];
  credits: Credit[];
  invoices: Invoice[];

  selectedSupplierId: string | null;
  selectedCreditId: string | null;
  linkedInvoices: LinkedInvoice[];
  currentStep: AbatimentoStep;
  isSapSyncing: boolean;
  sapSyncComplete: boolean;

  bapiLoadingCredits: boolean;
  bapiLoadingInvoices: boolean;
  bapiNoCreditsFim: boolean;

  requiresSupplierApproval: boolean;
  supplierAdjustments: SupplierAdjustment[];
  supplierAdjustedCart: boolean;
  reprocessing: boolean;

  settlementOutcome: SettlementOutcome | null;

  filters: {
    period: { from: string; to: string };
    duplicateStatus: string;
    creditType: string;
    futureOffsetting: boolean;
    supplierFilter: string;
    offsetStatus: string;
  };

  setSelectedSupplier: (id: string | null) => void;
  setSelectedCredit: (id: string | null) => void;
  setCurrentStep: (step: AbatimentoStep) => void;
  setIsSapSyncing: (v: boolean) => void;
  setSapSyncComplete: (v: boolean) => void;
  setRequiresSupplierApproval: (v: boolean) => void;
  setSupplierAdjustedCart: (v: boolean) => void;
  setReprocessing: (v: boolean) => void;
  setSettlementOutcome: (o: SettlementOutcome | null) => void;
  updateFilter: (key: string, value: unknown) => void;

  simulateBapiLoadCredits: () => void;
  simulateBapiLoadInvoices: () => void;

  addInvoiceToCart: (invoice: Invoice) => void;
  removeInvoiceFromCart: (invoiceId: string) => void;
  updateOffsetAmount: (invoiceId: string, amount: number) => void;
  clearCart: () => void;
  applySupplierAdjustments: (adjustments: SupplierAdjustment[]) => void;

  getSelectedCredit: () => Credit | undefined;
  getSupplierCredits: () => Credit[];
  getSupplierInvoices: () => Invoice[];
  getTotalLinked: () => number;
  getRemainingBalance: () => number;
  getResidualBalance: () => number;
  getClassification: () => SettlementClassification;
  getOperationType: () => string;
  hasPartialLiquidations: () => boolean;
  canFinalize: () => boolean;
}

export const useAbatimentoStore = create<AbatimentoStore>((set, get) => ({
  suppliers,
  credits,
  invoices,

  selectedSupplierId: null,
  selectedCreditId: null,
  linkedInvoices: [],
  currentStep: 'formalizacao',
  isSapSyncing: false,
  sapSyncComplete: false,

  bapiLoadingCredits: false,
  bapiLoadingInvoices: false,
  bapiNoCreditsFim: false,

  requiresSupplierApproval: true,
  supplierAdjustments: [],
  supplierAdjustedCart: false,
  reprocessing: false,

  settlementOutcome: null,

  filters: {
    period: { from: '', to: '' },
    duplicateStatus: 'all',
    creditType: 'all',
    futureOffsetting: false,
    supplierFilter: '',
    offsetStatus: 'all',
  },

  setSelectedSupplier: (id) => {
    set({
      selectedSupplierId: id,
      selectedCreditId: null,
      linkedInvoices: [],
      bapiNoCreditsFim: false,
      supplierAdjustments: [],
      supplierAdjustedCart: false,
    });
    if (id) get().simulateBapiLoadCredits();
  },

  setSelectedCredit: (id) => {
    set({ selectedCreditId: id, linkedInvoices: [], supplierAdjustments: [], supplierAdjustedCart: false });
    if (id) get().simulateBapiLoadInvoices();
  },

  setCurrentStep: (step) => set({ currentStep: step }),
  setIsSapSyncing: (v) => set({ isSapSyncing: v }),
  setSapSyncComplete: (v) => set({ sapSyncComplete: v }),
  setRequiresSupplierApproval: (v) => set({ requiresSupplierApproval: v }),
  setSupplierAdjustedCart: (v) => set({ supplierAdjustedCart: v }),
  setReprocessing: (v) => set({ reprocessing: v }),
  setSettlementOutcome: (o) => set({ settlementOutcome: o }),

  updateFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  simulateBapiLoadCredits: () => {
    set({ bapiLoadingCredits: true, bapiNoCreditsFim: false });
    setTimeout(() => {
      const { selectedSupplierId, credits: allCredits } = get();
      const hasCredits = allCredits.some(
        (c) => c.supplierId === selectedSupplierId && c.availableValue > 0
      );
      set({ bapiLoadingCredits: false, bapiNoCreditsFim: !hasCredits });
    }, 1200);
  },

  simulateBapiLoadInvoices: () => {
    set({ bapiLoadingInvoices: true });
    setTimeout(() => set({ bapiLoadingInvoices: false }), 900);
  },

  addInvoiceToCart: (invoice) => {
    const { linkedInvoices, getSelectedCredit } = get();
    const credit = getSelectedCredit();
    if (!credit) return;
    if (linkedInvoices.find((l) => l.invoiceId === invoice.id)) return;
    if (invoice.contraparte !== credit.contraparte) return;
    if (invoice.company !== credit.company) return;

    const remaining = get().getRemainingBalance();
    const offsetAmount = Math.min(invoice.openBalance, Math.max(remaining, 0));
    const isPartialLiquidation = offsetAmount > 0 && offsetAmount < invoice.openBalance;

    set({
      linkedInvoices: [
        ...linkedInvoices,
        {
          invoiceId: invoice.id,
          nfNumber: invoice.nfNumber,
          supplierName: invoice.supplierName,
          grossValue: invoice.grossValue,
          openBalance: invoice.openBalance,
          offsetAmount,
          isPartialLiquidation,
        },
      ],
    });
  },

  removeInvoiceFromCart: (invoiceId) =>
    set((state) => ({
      linkedInvoices: state.linkedInvoices.filter((l) => l.invoiceId !== invoiceId),
    })),

  updateOffsetAmount: (invoiceId, amount) =>
    set((state) => ({
      linkedInvoices: state.linkedInvoices.map((l) => {
        if (l.invoiceId !== invoiceId) return l;
        const clamped = Math.min(amount, l.openBalance);
        return {
          ...l,
          offsetAmount: clamped,
          isPartialLiquidation: clamped > 0 && clamped < l.openBalance,
        };
      }),
    })),

  clearCart: () => set({ linkedInvoices: [], supplierAdjustments: [], supplierAdjustedCart: false }),

  applySupplierAdjustments: (adjustments) => {
    const { linkedInvoices } = get();
    const updated = linkedInvoices.map((l) => {
      const adj = adjustments.find((a) => a.invoiceId === l.invoiceId);
      if (!adj) return l;
      const clamped = Math.min(adj.suggestedAmount, l.openBalance);
      return { ...l, offsetAmount: clamped, isPartialLiquidation: clamped > 0 && clamped < l.openBalance };
    });
    set({ linkedInvoices: updated, supplierAdjustments: adjustments, supplierAdjustedCart: true });
  },

  getSelectedCredit: () => {
    const { credits: allCredits, selectedCreditId } = get();
    return allCredits.find((c) => c.id === selectedCreditId);
  },

  getSupplierCredits: () => {
    const { credits: allCredits, selectedSupplierId, filters } = get();
    if (!selectedSupplierId) return [];
    let result = allCredits.filter((c) => c.supplierId === selectedSupplierId);
    if (filters.creditType !== 'all') {
      result = result.filter((c) => c.type === filters.creditType);
    }
    return result;
  },

  getSupplierInvoices: () => {
    const { invoices: allInvoices, selectedSupplierId, filters } = get();
    if (!selectedSupplierId) return [];
    let result = allInvoices.filter((i) => i.supplierId === selectedSupplierId);
    if (filters.duplicateStatus !== 'all') {
      result = result.filter((i) => i.duplicateStatus === filters.duplicateStatus);
    }
    if (filters.offsetStatus !== 'all') {
      result = result.filter((i) => i.offsetStatus === filters.offsetStatus);
    }
    if (filters.period.from) result = result.filter((i) => i.dueDate >= filters.period.from);
    if (filters.period.to) result = result.filter((i) => i.dueDate <= filters.period.to);
    if (!filters.futureOffsetting) result = result.filter((i) => i.offsetStatus !== 'liquidada');
    return result;
  },

  getTotalLinked: () => get().linkedInvoices.reduce((sum, l) => sum + l.offsetAmount, 0),

  getRemainingBalance: () => {
    const credit = get().getSelectedCredit();
    if (!credit) return 0;
    return credit.availableValue - get().getTotalLinked();
  },

  getResidualBalance: () => Math.max(get().getRemainingBalance(), 0),

  getClassification: () => {
    const remaining = get().getRemainingBalance();
    const { linkedInvoices } = get();
    const allFullyOffset = linkedInvoices.every((l) => l.offsetAmount >= l.openBalance);
    if (remaining >= 0 && allFullyOffset) return 'compensacao_integral';
    return 'compensacao_parcial';
  },

  getOperationType: () => {
    const remaining = get().getRemainingBalance();
    const { linkedInvoices } = get();
    if (linkedInvoices.length === 0) return '-';
    if (remaining > 0) return 'Baixa Total + Credito Residual';
    if (remaining === 0) return 'Baixa Total';
    return 'Baixa Parcial';
  },

  hasPartialLiquidations: () => get().linkedInvoices.some((l) => l.isPartialLiquidation),

  canFinalize: () => {
    const { linkedInvoices } = get();
    const totalLinked = get().getTotalLinked();
    const credit = get().getSelectedCredit();
    if (!credit) return false;
    return linkedInvoices.length > 0 && totalLinked > 0 && totalLinked <= credit.availableValue;
  },
}));
