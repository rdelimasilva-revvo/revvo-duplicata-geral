export type CreditStatus = 'disponivel' | 'parcialmente_utilizado' | 'utilizado' | 'expirado';
export type InvoiceOffsetStatus = 'livre' | 'pendente' | 'parcialmente_compensada' | 'liquidada';
export type InvoiceDisputeStatus = 'acordo_pendente' | 'credito_aplicado' | 'em_disputa' | 'bloqueada' | null;
export type DuplicateStatus = 'ativa' | 'vencida' | 'liquidada' | 'protestada';
export type SettlementClassification = 'compensacao_integral' | 'compensacao_parcial';
export type SettlementOutcome = 'liquidada' | 'paga_parcialmente';

export type AbatimentoStep =
  | 'formalizacao'
  | 'sincronizacao_sap'
  | 'aceite_fornecedor'
  | 'escrita_sap'
  | 'validacao_assinatura';

export type BapiReference =
  | 'BAPI_FI_DOCUMENT_READ'
  | 'ZREVVO_AP_ACC_GETOPENITEMS'
  | 'ZREVVO_BAPI_PAYMENT_UPDATE';

export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  company: string;
}

export interface Credit {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  company: string;
  type: 'devolucao' | 'bonificacao' | 'acordo_comercial' | 'nota_debito';
  description: string;
  totalValue: number;
  usedValue: number;
  availableValue: number;
  currency: string;
  issueDate: string;
  expirationDate: string;
  status: CreditStatus;
  contraparte: string;
}

export interface Invoice {
  id: string;
  nfNumber: string;
  supplierId: string;
  supplierName: string;
  company: string;
  contraparte: string;
  grossValue: number;
  alreadyOffset: number;
  openBalance: number;
  dueDate: string;
  duplicateCode: string;
  duplicateStatus: DuplicateStatus;
  offsetStatus: InvoiceOffsetStatus;
  disputeStatus: InvoiceDisputeStatus;
}

export interface LinkedInvoice {
  invoiceId: string;
  nfNumber: string;
  supplierName: string;
  grossValue: number;
  openBalance: number;
  offsetAmount: number;
  isPartialLiquidation: boolean;
}

export interface SupplierAdjustment {
  invoiceId: string;
  suggestedAmount: number;
  reason: string;
}

export const CREDIT_TYPE_LABELS: Record<Credit['type'], string> = {
  devolucao: 'Devolucao',
  bonificacao: 'Bonificacao',
  acordo_comercial: 'Acordo Comercial',
  nota_debito: 'Nota de Debito',
};

export const OFFSET_STATUS_CONFIG: Record<InvoiceOffsetStatus, { label: string; color: string; bg: string }> = {
  livre: { label: 'Livre', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  pendente: { label: 'Pendente', color: 'text-amber-700', bg: 'bg-amber-50' },
  parcialmente_compensada: { label: 'Parc. Compensada', color: 'text-blue-700', bg: 'bg-blue-50' },
  liquidada: { label: 'Liquidada', color: 'text-gray-500', bg: 'bg-gray-100' },
};

export const DISPUTE_STATUS_CONFIG: Record<NonNullable<InvoiceDisputeStatus>, { label: string; icon: string; color: string }> = {
  acordo_pendente: { label: 'Acordo Pendente', icon: 'clock', color: 'text-amber-600' },
  credito_aplicado: { label: 'Credito Aplicado', icon: 'check-circle', color: 'text-emerald-600' },
  em_disputa: { label: 'Em Disputa', icon: 'alert-triangle', color: 'text-red-600' },
  bloqueada: { label: 'Bloqueada', icon: 'lock', color: 'text-gray-600' },
};

export const CLASSIFICATION_CONFIG: Record<SettlementClassification, { label: string; color: string; bg: string }> = {
  compensacao_integral: { label: 'Compensacao Integral', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  compensacao_parcial: { label: 'Compensacao Parcial', color: 'text-amber-700', bg: 'bg-amber-50' },
};

export const OUTCOME_CONFIG: Record<SettlementOutcome, { label: string; color: string; bg: string; border: string }> = {
  liquidada: { label: 'Liquidada', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  paga_parcialmente: { label: 'Paga Parcialmente', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
};
