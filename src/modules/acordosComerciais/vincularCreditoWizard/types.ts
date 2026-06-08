export interface SupplierCredit {
  id: string;
  code: string;
  supplierId: string;
  supplierName: string;
  supplierCnpj: string;
  origin: string;
  totalValue: number;
  remainingValue: number;
  issueDate: string | null;
  expiresAt: string | null;
  status: string;
}

export interface EligibleInvoice {
  id: string;
  supplierId: string;
  number: string;
  issueDate: string | null;
  dueDate: string | null;
  originalValue: number;
  openBalance: number;
  status: 'livre' | 'em_disputa' | 'bloqueada' | 'pendente';
}

export type WizardStepId = 'select-credit' | 'distribute' | 'confirm';

export interface WizardStepDescriptor {
  id: WizardStepId;
  index: number;
  title: string;
  description: string;
}

export const WIZARD_STEPS: WizardStepDescriptor[] = [
  {
    id: 'select-credit',
    index: 0,
    title: 'Escolha o crédito',
    description: 'Selecione qual crédito do fornecedor será vinculado',
  },
  {
    id: 'distribute',
    index: 1,
    title: 'Distribuir valores',
    description: 'Marque as NFs e distribua o saldo entre elas',
  },
  {
    id: 'confirm',
    index: 2,
    title: 'Revisar e confirmar',
    description: 'Confira os dados antes de gravar a vinculação',
  },
];

export interface WizardSubmissionResult {
  proposalId: string;
  creditId: string;
  totalAllocated: number;
  invoicesCount: number;
}
