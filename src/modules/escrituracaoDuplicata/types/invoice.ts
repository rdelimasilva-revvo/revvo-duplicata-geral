export interface Invoice {
  id: string;
  company: string;
  issueDate: string;
  dueDate: string;
  total: number;
  duplicate: boolean;
  currency: string;
  drawee: {
    name: string;
    document: string;
    code: string;
  };
  bank: {
    name: string;
    agency: string;
    account: string;
  };
  payment: string;
  fiscalKey: string;
  numeroNota: string;
  serie: string;
  installments: Installment[];
}

export interface Installment {
  number: string;
  value: number;
  dueDate: string;
  vt: string;
  cpgt: string;
  mp: string;
  duplicate: string;
}

export interface ExtendedInstallment extends Installment {
  company: string;
  bank: {
    name: string;
    agency: string;
    account: string;
  };
  updateDate: string;
  status: string;
  itemId: string;
  transactionId: string;
  businessAssetId: string;
  reference: string;
  error: string;
}
