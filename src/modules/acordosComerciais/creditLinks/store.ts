import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type CreditLinkStatus = 'linked' | 'pending_review' | 'contested' | 'resolved';

export interface CreditLink {
  id: string;
  proposalCode: string;
  invoiceId: string;
  creditId: string;
  creditLabel: string;
  amount: number;
  status: CreditLinkStatus;
}

export interface AvailableCredit {
  id: string;
  label: string;
  origin: string;
  balance: number;
  issuedAt: string;
}

interface CreditLinksState {
  links: CreditLink[];
  credits: AvailableCredit[];
  loadingByCode: Record<string, boolean>;
  errorByCode: Record<string, string | null>;

  loadForProposal: (proposalCode: string) => Promise<void>;
  addLink: (
    proposalCode: string,
    invoiceId: string,
    credit: AvailableCredit,
    amount: number,
  ) => Promise<void>;
  removeLink: (linkId: string) => Promise<void>;
  contestLink: (
    linkId: string,
    payload: { reasonCode: string; observations: string },
  ) => Promise<void>;

  getLinksForInvoice: (proposalCode: string, invoiceId: string) => CreditLink[];
  getLinksForProposal: (proposalCode: string) => CreditLink[];
  getCreditUsage: (proposalCode: string) => Map<string, number>;
}

const DEMO_CREDITS: AvailableCredit[] = [
  { id: 'CRD-7721', label: 'Nota de Crédito #7721', origin: 'Devolução lote 334', balance: 38_500, issuedAt: '2026-02-18' },
  { id: 'CRD-7802', label: 'Nota de Crédito #7802', origin: 'Bonificação Q1', balance: 25_000, issuedAt: '2026-03-02' },
  { id: 'CRD-7845', label: 'Nota de Crédito #7845', origin: 'Ajuste preço tabela', balance: 17_400, issuedAt: '2026-03-15' },
  { id: 'CRD-7891', label: 'Nota de Crédito #7891', origin: 'Devolução NF 81200', balance: 9_800, issuedAt: '2026-04-01' },
  { id: 'CRD-7904', label: 'Nota de Crédito #7904', origin: 'Acordo comercial 2025', balance: 54_200, issuedAt: '2026-04-10' },
];

export const useCreditLinksStore = create<CreditLinksState>((set, get) => ({
  links: [],
  credits: DEMO_CREDITS,
  loadingByCode: {},
  errorByCode: {},

  loadForProposal: async (proposalCode) => {
    set((s) => ({ loadingByCode: { ...s.loadingByCode, [proposalCode]: true } }));
    const { data, error } = await supabase
      .from('proposal_credit_links')
      .select('id, proposal_code, invoice_id, credit_id, credit_label, amount, status')
      .eq('proposal_code', proposalCode);
    if (error) {
      set((s) => ({
        loadingByCode: { ...s.loadingByCode, [proposalCode]: false },
        errorByCode: { ...s.errorByCode, [proposalCode]: error.message },
      }));
      return;
    }
    const fetched: CreditLink[] = (data ?? []).map((row) => ({
      id: row.id,
      proposalCode: row.proposal_code,
      invoiceId: row.invoice_id,
      creditId: row.credit_id,
      creditLabel: row.credit_label ?? '',
      amount: Number(row.amount ?? 0),
      status: (row.status ?? 'linked') as CreditLinkStatus,
    }));
    set((s) => ({
      links: [...s.links.filter((l) => l.proposalCode !== proposalCode), ...fetched],
      loadingByCode: { ...s.loadingByCode, [proposalCode]: false },
      errorByCode: { ...s.errorByCode, [proposalCode]: null },
    }));
  },

  addLink: async (proposalCode, invoiceId, credit, amount) => {
    if (amount <= 0) return;
    const optimisticId = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const optimistic: CreditLink = {
      id: optimisticId,
      proposalCode,
      invoiceId,
      creditId: credit.id,
      creditLabel: credit.label,
      amount,
      status: 'linked',
    };
    set((s) => ({ links: [...s.links, optimistic] }));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('proposal_credit_links')
      .insert({
        proposal_code: proposalCode,
        invoice_id: invoiceId,
        credit_id: credit.id,
        credit_label: credit.label,
        amount,
        created_by: user?.id ?? null,
      })
      .select('id')
      .maybeSingle();

    if (error) {
      set((s) => ({
        errorByCode: { ...s.errorByCode, [proposalCode]: error.message },
      }));
      return;
    }
    if (data) {
      set((s) => ({
        links: s.links.map((l) => (l.id === optimisticId ? { ...l, id: data.id } : l)),
      }));
    }
  },

  removeLink: async (linkId) => {
    set((s) => ({ links: s.links.filter((l) => l.id !== linkId) }));
    if (!linkId.startsWith('tmp-')) {
      await supabase.from('proposal_credit_links').delete().eq('id', linkId);
    }
  },

  contestLink: async (linkId, { reasonCode, observations }) => {
    const existing = get().links.find((l) => l.id === linkId);
    if (!existing) return;

    set((s) => ({
      links: s.links.map((l) => (l.id === linkId ? { ...l, status: 'contested' } : l)),
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const responderName =
      (user?.user_metadata?.full_name as string | undefined) ??
      (user?.user_metadata?.name as string | undefined) ??
      user?.email ??
      'Fornecedor';
    const responderEmail = user?.email ?? '';

    await supabase.from('proposal_credit_link_contestations').insert({
      credit_link_id: linkId,
      proposal_code: existing.proposalCode,
      reason_code: reasonCode,
      observations,
      responder_id: user?.id ?? null,
      responder_name: responderName,
      responder_email: responderEmail,
    });

    if (!linkId.startsWith('tmp-')) {
      await supabase
        .from('proposal_credit_links')
        .update({ status: 'contested' })
        .eq('id', linkId);
    }
  },

  getLinksForInvoice: (proposalCode, invoiceId) =>
    get().links.filter((l) => l.proposalCode === proposalCode && l.invoiceId === invoiceId),

  getLinksForProposal: (proposalCode) =>
    get().links.filter((l) => l.proposalCode === proposalCode),

  getCreditUsage: (proposalCode) => {
    const usage = new Map<string, number>();
    for (const l of get().links) {
      if (l.proposalCode !== proposalCode) continue;
      usage.set(l.creditId, (usage.get(l.creditId) ?? 0) + l.amount);
    }
    return usage;
  },
}));
