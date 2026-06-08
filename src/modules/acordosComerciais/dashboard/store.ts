import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { AgreementRecord, PipelineStatus, SupabaseAgreementRow } from './types';

const mapRow = (row: SupabaseAgreementRow): AgreementRecord => ({
  id: row.id,
  code: row.code,
  title: row.title,
  supplierName: row.supplier_name,
  supplierCnpj: row.supplier_cnpj,
  sacadoName: row.sacado_name,
  sacadoCnpj: row.sacado_cnpj,
  status: row.status,
  contractType: row.contract_type,
  totalValue: Number(row.total_value),
  currency: row.currency,
  startDate: row.start_date,
  endDate: row.end_date,
  progressPercent: row.progress_percent,
  riskLevel: row.risk_level,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

interface DashboardFilters {
  search: string;
  status: PipelineStatus | 'all';
  supplier: string | 'all';
  riskLevel: 'low' | 'medium' | 'high' | 'all';
}

interface AgreementsDashboardStore {
  agreements: AgreementRecord[];
  loading: boolean;
  error: string | null;
  filters: DashboardFilters;
  selectedId: string | null;

  loadAgreements: () => Promise<void>;
  setFilter: <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => void;
  resetFilters: () => void;
  selectAgreement: (id: string | null) => void;
  updateStatus: (id: string, status: PipelineStatus) => Promise<void>;
}

const DEFAULT_FILTERS: DashboardFilters = {
  search: '',
  status: 'all',
  supplier: 'all',
  riskLevel: 'all',
};

export const useAgreementsDashboardStore = create<AgreementsDashboardStore>((set, get) => ({
  agreements: [],
  loading: false,
  error: null,
  filters: DEFAULT_FILTERS,
  selectedId: null,

  loadAgreements: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('commercial_agreements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({
        agreements: (data || []).map((row) => mapRow(row as SupabaseAgreementRow)),
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Erro ao carregar acordos',
        loading: false,
      });
    }
  },

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  selectAgreement: (id) => set({ selectedId: id }),

  updateStatus: async (id, status) => {
    const previous = get().agreements;
    set({
      agreements: previous.map((a) =>
        a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a,
      ),
    });
    const { error } = await supabase
      .from('commercial_agreements')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      set({ agreements: previous, error: error.message });
    }
  },
}));
