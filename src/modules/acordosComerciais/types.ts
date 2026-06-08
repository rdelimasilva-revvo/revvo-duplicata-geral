export type AgreementStatus =
  | 'draft'
  | 'sap_syncing'
  | 'pending_linkage'
  | 'pending_supplier_aceite'
  | 'signature_pending'
  | 'signed'
  | 'rejected'
  | 'inconsistency';

export type UserRole = 'internal' | 'supplier';

export interface Agreement {
  id: string;
  code: string;
  title: string;
  sacadoName: string;
  sacadoCnpj: string;
  supplierName: string;
  supplierCnpj: string;
  status: AgreementStatus;
  contractType: 'venda' | 'cessao' | 'fianca';
  totalValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  linkedClients: LinkedClient[];
  linkedContract: string | null;
  documents: UploadedDocument[];
  supplierResponse: SupplierResponse | null;
  signatures: SignatureRecord[];
  sapValidation: SapValidation | null;
  formalizationData: FormalizationData | null;
}

export interface LinkedClient {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  linkedAt: string;
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface SupplierResponse {
  type: 'aceite' | 'recusa';
  date: string;
  reason?: string;
}

export interface SignatureRecord {
  id: string;
  signerName: string;
  signerRole: string;
  signedAt: string;
  certificateId: string;
  status: 'pending' | 'valid' | 'invalid';
}

export interface SapValidation {
  status: 'pending' | 'syncing' | 'completed' | 'error';
  steps: SapValidationStep[];
  startedAt: string;
  completedAt: string | null;
}

export interface SapValidationStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  description: string;
}

export interface FormalizationData {
  agreementNumber: string;
  internalNotes: string;
  paymentTerms: string;
  interestRate: number;
  penaltyRate: number;
  gracePeriod: number;
}

export interface AvailableClient {
  id: string;
  name: string;
  cnpj: string;
  segment: string;
  city: string;
  state: string;
}

export interface AvailableContract {
  id: string;
  code: string;
  description: string;
  type: string;
  value: number;
  status: string;
}

export const STATUS_CONFIG: Record<AgreementStatus, { label: string; color: string; bg: string; border: string }> = {
  draft: { label: 'Rascunho', color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-300' },
  sap_syncing: { label: 'Sincronizando SAP', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  pending_linkage: { label: 'Pendente Vinculação', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-300' },
  pending_supplier_aceite: { label: 'Pendente Aceite Fornecedor', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  signature_pending: { label: 'Pendente Assinatura', color: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-300' },
  signed: { label: 'Assinado', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
  rejected: { label: 'Recusado', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
  inconsistency: { label: 'Inconsistência', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-300' },
};
