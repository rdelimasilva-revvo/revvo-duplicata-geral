import { StatusManifestacao } from '../types/bill';

interface StatusInfo {
  label: string;
  shortLabel: string;
  bgColor: string;
  textColor: string;
}

export const STATUS_CONFIG: Record<StatusManifestacao, StatusInfo> = {
  recebida: { label: 'Recebida', shortLabel: 'Recebida', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  em_fila_processamento: { label: 'Em Fila de Processamento', shortLabel: 'Fila Process.', bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
  em_analise_automatica: { label: 'Em Análise Automática', shortLabel: 'Análise Auto.', bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
  em_fila_analise_manual: { label: 'Em Fila de Análise Manual', shortLabel: 'Fila Análise', bgColor: 'bg-amber-100', textColor: 'text-amber-800' },
  aceite_automatico: { label: 'Aceite Automático', shortLabel: 'Aceite Auto.', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  recusa_automatica: { label: 'Recusa Automática', shortLabel: 'Recusa Auto.', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  reprocessamento: { label: 'Reprocessamento', shortLabel: 'Reprocess.', bgColor: 'bg-sky-100', textColor: 'text-sky-700' },
  aceite_manual: { label: 'Aceite Manual', shortLabel: 'Aceite Manual', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  recusa_manual: { label: 'Recusa Manual', shortLabel: 'Recusa Manual', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  contestada: { label: 'Contestada', shortLabel: 'Contestada', bgColor: 'bg-orange-100', textColor: 'text-orange-700' },
};

export const AUTO_ANALYSIS_STATUSES: StatusManifestacao[] = [
  'recebida', 'em_fila_processamento', 'em_analise_automatica', 'reprocessamento',
];

export const MANIFESTABLE_STATUSES: StatusManifestacao[] = [
  'em_fila_analise_manual',
];

export const PENDING_STATUSES: StatusManifestacao[] = [
  ...MANIFESTABLE_STATUSES, ...AUTO_ANALYSIS_STATUSES,
];

export const ACCEPTED_STATUSES: StatusManifestacao[] = [
  'aceite_automatico', 'aceite_manual',
];

export const REJECTED_STATUSES: string[] = [
  'recusa_automatica', 'recusa_manual',
];

export const STATUS_SORT_ORDER: Record<StatusManifestacao, number> = {
  recebida: 0,
  em_fila_processamento: 1,
  em_analise_automatica: 2,
  em_fila_analise_manual: 3,
  reprocessamento: 4,
  aceite_automatico: 5,
  aceite_manual: 6,
  recusa_automatica: 7,
  recusa_manual: 8,
  contestada: 9,
};

export const STATUS_FILTER_GROUPS = [
  {
    label: 'Em andamento',
    options: [
      { value: 'recebida', label: 'Recebida' },
      { value: 'em_fila_processamento', label: 'Em Fila de Processamento' },
      { value: 'em_analise_automatica', label: 'Em Análise Automática' },
      { value: 'em_fila_analise_manual', label: 'Em Fila de Análise Manual' },
      { value: 'reprocessamento', label: 'Reprocessamento' },
    ],
  },
  {
    label: 'Aceitas',
    options: [
      { value: 'aceite_automatico', label: 'Aceite Automático' },
      { value: 'aceite_manual', label: 'Aceite Manual' },
    ],
  },
  {
    label: 'Recusadas',
    options: [
      { value: 'recusa_automatica', label: 'Recusa Automática' },
      { value: 'recusa_manual', label: 'Recusa Manual' },
    ],
  },
  {
    label: 'Outros',
    options: [
      { value: 'contestada', label: 'Contestada' },
    ],
  },
];
