import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { PaymentFilters, SupplierPayment } from './types';

interface SupplierPortalState {
  payments: SupplierPayment[];
  loading: boolean;
  error: string | null;
  filters: PaymentFilters;
  selectedId: string | null;
  fetchPayments: () => Promise<void>;
  setFilters: (patch: Partial<PaymentFilters>) => void;
  selectPayment: (id: string | null) => void;
}

function mapRow(row: Record<string, unknown>): SupplierPayment {
  return {
    id: String(row.id),
    supplierCnpj: String(row.supplier_cnpj ?? ''),
    supplierName: String(row.supplier_name ?? ''),
    companyName: String(row.company_name ?? ''),
    companyCnpj: String(row.company_cnpj ?? ''),
    invoiceNumber: String(row.invoice_number ?? ''),
    netValue: Number(row.net_value ?? 0),
    status: (row.status as SupplierPayment['status']) ?? 'pending',
    destinationBank: String(row.destination_bank ?? ''),
    destinationBankCode: String(row.destination_bank_code ?? ''),
    destinationAgency: String(row.destination_agency ?? ''),
    destinationAccount: String(row.destination_account ?? ''),
    issueDate: (row.issue_date as string | null) ?? null,
    dueDate: (row.due_date as string | null) ?? null,
    settlementDate: (row.settlement_date as string | null) ?? null,
    cercLog: (row.cerc_log as SupplierPayment['cercLog']) ?? [],
    tagLog: (row.tag_log as SupplierPayment['tagLog']) ?? [],
    timeline: (row.timeline as SupplierPayment['timeline']) ?? [],
    notes: String(row.notes ?? ''),
  };
}

export const useSupplierPortalStore = create<SupplierPortalState>((set, get) => ({
  payments: [],
  loading: false,
  error: null,
  filters: { search: '', status: 'all' },
  selectedId: null,

  fetchPayments: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('supplier_portal_payments')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) {
      set({ loading: false, error: error.message, payments: [] });
      return;
    }
    set({ loading: false, payments: (data ?? []).map(mapRow) });
  },

  setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),
  selectPayment: (id) => set({ selectedId: id }),
}));
