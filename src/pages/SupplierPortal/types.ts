export type PaymentStatus =
  | 'pending'
  | 'scheduled'
  | 'settled'
  | 'failed'
  | 'action_required';

export interface TimelineEntry {
  ts: string;
  label: string;
}

export interface RegistrarEntry {
  ts: string;
  event: string;
  ref: string;
}

export interface SupplierPayment {
  id: string;
  supplierCnpj: string;
  supplierName: string;
  companyName: string;
  companyCnpj: string;
  invoiceNumber: string;
  netValue: number;
  status: PaymentStatus;
  destinationBank: string;
  destinationBankCode: string;
  destinationAgency: string;
  destinationAccount: string;
  issueDate: string | null;
  dueDate: string | null;
  settlementDate: string | null;
  cercLog: RegistrarEntry[];
  tagLog: RegistrarEntry[];
  timeline: TimelineEntry[];
  notes: string;
}

export interface PaymentFilters {
  search: string;
  status: PaymentStatus | 'all';
}
