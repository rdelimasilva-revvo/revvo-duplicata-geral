import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type {
  NotaFiscal,
  PagamentoCredito,
  HistoricoMovimentacao,
  FilterConfig,
  SortConfig,
  UserRole,
} from './types';

interface TransactionSyncState {
  role: UserRole;
  setRole: (role: UserRole) => void;

  notasFiscais: NotaFiscal[];
  pagamentos: PagamentoCredito[];
  historico: HistoricoMovimentacao[];

  loading: boolean;
  error: string | null;

  filters: FilterConfig;
  sort: SortConfig | null;

  selectedTransactionId: string | null;

  setFilter: <K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) => void;
  resetFilters: () => void;
  setSort: (sort: SortConfig | null) => void;
  setSelectedTransaction: (id: string | null) => void;

  loadNotasFiscais: () => Promise<void>;
  loadPagamentos: () => Promise<void>;
  loadHistorico: (transactionId: string) => Promise<void>;

  updateNFStatus: (id: string, status: string, motivo: string) => Promise<void>;
  updatePagamentoStatus: (id: string, status: string, motivo: string) => Promise<void>;
}

const DEFAULT_FILTERS: FilterConfig = {
  search: '',
  status: 'all',
  dateFrom: '',
  dateTo: '',
  valorMin: '',
  valorMax: '',
};

function mapNF(row: Record<string, unknown>): NotaFiscal {
  return {
    id: row.id as string,
    transactionId: row.transaction_id as string,
    empresaId: row.empresa_id as string,
    fornecedorId: row.fornecedor_id as string,
    fornecedorNome: row.fornecedor_nome as string,
    fornecedorCnpj: row.fornecedor_cnpj as string,
    numeroNf: row.numero_nf as string,
    valor: Number(row.valor),
    status: row.status as NotaFiscal['status'],
    dataEmissao: row.data_emissao as string,
    dataVencimento: row.data_vencimento as string,
    dataLiquidacao: (row.data_liquidacao as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapPagamento(row: Record<string, unknown>): PagamentoCredito {
  return {
    id: row.id as string,
    transactionId: row.transaction_id as string,
    empresaId: row.empresa_id as string,
    fornecedorId: row.fornecedor_id as string,
    empresaNome: row.empresa_nome as string,
    tipo: row.tipo as PagamentoCredito['tipo'],
    valor: Number(row.valor),
    status: row.status as PagamentoCredito['status'],
    referenciaNf: row.referencia_nf as string,
    dataOperacao: row.data_operacao as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapHistorico(row: Record<string, unknown>): HistoricoMovimentacao {
  return {
    id: row.id as string,
    transactionId: row.transaction_id as string,
    tabelaOrigem: row.tabela_origem as string,
    acao: row.acao as string,
    valorAnterior: (row.valor_anterior as string) ?? null,
    valorNovo: (row.valor_novo as string) ?? null,
    usuarioId: row.usuario_id as string,
    usuarioNome: row.usuario_nome as string,
    motivo: (row.motivo as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export const useTransactionSyncStore = create<TransactionSyncState>((set, get) => ({
  role: 'empresa',
  setRole: (role) => set({ role }),

  notasFiscais: [],
  pagamentos: [],
  historico: [],

  loading: false,
  error: null,

  filters: { ...DEFAULT_FILTERS },
  sort: null,

  selectedTransactionId: null,

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  setSort: (sort) => set({ sort }),
  setSelectedTransaction: (id) => set({ selectedTransactionId: id }),

  loadNotasFiscais: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('notas_fiscais')
      .select('*')
      .order('data_vencimento', { ascending: true });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ notasFiscais: (data ?? []).map(mapNF), loading: false });
  },

  loadPagamentos: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('pagamentos_creditos')
      .select('*')
      .order('data_operacao', { ascending: false });
    if (error) {
      set({ loading: false, error: error.message });
      return;
    }
    set({ pagamentos: (data ?? []).map(mapPagamento), loading: false });
  },

  loadHistorico: async (transactionId: string) => {
    const { data } = await supabase
      .from('historico_movimentacoes')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('created_at', { ascending: false });
    set({ historico: (data ?? []).map(mapHistorico) });
  },

  updateNFStatus: async (id, status, motivo) => {
    const nf = get().notasFiscais.find((n) => n.id === id);
    if (!nf) return;

    await supabase
      .from('historico_movimentacoes')
      .insert({
        transaction_id: nf.transactionId,
        tabela_origem: 'notas_fiscais',
        acao: 'status_alterado',
        valor_anterior: nf.status,
        valor_novo: status,
        usuario_id: 'current_user',
        usuario_nome: 'Usuário',
        motivo,
      });

    const { error } = await supabase
      .from('notas_fiscais')
      .update({ status, data_liquidacao: status === 'liquidado' ? new Date().toISOString() : null })
      .eq('id', id);

    if (!error) {
      await get().loadNotasFiscais();
      await get().loadPagamentos();
    }
  },

  updatePagamentoStatus: async (id, status, motivo) => {
    const pg = get().pagamentos.find((p) => p.id === id);
    if (!pg) return;

    await supabase
      .from('historico_movimentacoes')
      .insert({
        transaction_id: pg.transactionId,
        tabela_origem: 'pagamentos_creditos',
        acao: 'status_alterado',
        valor_anterior: pg.status,
        valor_novo: status,
        usuario_id: 'current_user',
        usuario_nome: 'Usuário',
        motivo,
      });

    const { error } = await supabase
      .from('pagamentos_creditos')
      .update({ status })
      .eq('id', id);

    if (!error) {
      await get().loadPagamentos();
      await get().loadNotasFiscais();
    }
  },
}));
