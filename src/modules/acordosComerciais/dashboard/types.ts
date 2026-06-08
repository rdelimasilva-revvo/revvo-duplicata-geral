export type PipelineStatus =
  | 'draft'
  | 'in_negotiation'
  | 'pending_approval'
  | 'active'
  | 'completed'
  | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ContractType = 'venda' | 'cessao' | 'fianca';

export interface AgreementRecord {
  id: string;
  code: string;
  title: string;
  supplierName: string;
  supplierCnpj: string;
  sacadoName: string;
  sacadoCnpj: string;
  status: PipelineStatus;
  contractType: ContractType;
  totalValue: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  progressPercent: number;
  riskLevel: RiskLevel;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseAgreementRow {
  id: string;
  code: string;
  title: string;
  supplier_name: string;
  supplier_cnpj: string;
  sacado_name: string;
  sacado_cnpj: string;
  status: PipelineStatus;
  contract_type: ContractType;
  total_value: number | string;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  progress_percent: number;
  risk_level: RiskLevel;
  created_at: string;
  updated_at: string;
}

export const PIPELINE_ORDER: PipelineStatus[] = [
  'draft',
  'in_negotiation',
  'pending_approval',
  'active',
  'completed',
  'rejected',
];

export interface PipelineStageConfig {
  id: PipelineStatus;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
  fill: string;
}

export const PIPELINE_CONFIG: Record<PipelineStatus, PipelineStageConfig> = {
  draft: {
    id: 'draft',
    label: 'Rascunho',
    description: 'Propostas iniciais ainda em elaboração',
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
    fill: '#94a3b8',
  },
  in_negotiation: {
    id: 'in_negotiation',
    label: 'Em Negociação',
    description: 'Aguardando alinhamento com o fornecedor',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
    fill: '#0ea5e9',
  },
  pending_approval: {
    id: 'pending_approval',
    label: 'Em Aprovação',
    description: 'Aguardando aprovações internas',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    fill: '#f59e0b',
  },
  active: {
    id: 'active',
    label: 'Ativo',
    description: 'Acordo em vigor e operacional',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    fill: '#10b981',
  },
  completed: {
    id: 'completed',
    label: 'Finalizado',
    description: 'Acordos concluídos com sucesso',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    dot: 'bg-teal-500',
    fill: '#14b8a6',
  },
  rejected: {
    id: 'rejected',
    label: 'Recusado',
    description: 'Acordos recusados ou cancelados',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    fill: '#f43f5e',
  },
};

export const CONTRACT_TYPE_LABEL: Record<ContractType, string> = {
  venda: 'Venda',
  cessao: 'Cessão',
  fianca: 'Fiança',
};

export const RISK_CONFIG: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  low: { label: 'Baixo', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  medium: { label: 'Médio', color: 'text-amber-700', bg: 'bg-amber-50' },
  high: { label: 'Alto', color: 'text-rose-700', bg: 'bg-rose-50' },
};
