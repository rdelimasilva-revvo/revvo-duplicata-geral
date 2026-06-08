export interface Bill {
  id: string;
  type: string;
  iud: string;
  issueDate: string;
  dueDate: string;
  notificationDate: string;
  amount: number;
  sacador: {
    name: string;
    cnpj: string;
    address?: string;
  };
  discountValue: number;
  updateValue: number;
  lastUpdateDate: string;
  paymentInstrument: {
    type: 'Boleto' | 'Transferência' | 'PIX';
    details: string;
  };
  newReceiver?: {
    name: string;
    cnpj: string;
  };
  newLiquidationAccount?: {
    instrument: string;
    details: string;
  };
  status: string;
  manifestation: string;
  requiredAction: 'Alteração de Domicílio de Pgto' | 'Alteração Pendente' | 'Acatado' | 'Recusado' | 'Manifestação Aceite/Recusa';
  manifestationDeadline?: string;
  manifestationStatus?: 'pending' | 'completed' | 'expired';
  manifestationDate?: string;
  domicileChangeId?: string;
  hasDomicileChange?: boolean;
  urgencyLevel?: 'critical' | 'high' | 'medium' | 'low';
  daysUntilDeadline?: number;
}

export interface SystemSettings {
  twoStepPayment: boolean;
}
