export type StatusManifestacao =
  | 'recebida'
  | 'em_fila_processamento'
  | 'em_analise_automatica'
  | 'em_fila_analise_manual'
  | 'aceite_automatico'
  | 'recusa_automatica'
  | 'reprocessamento'
  | 'aceite_manual'
  | 'recusa_manual'
  | 'contestada';

export interface BillFilters {
  dueDate: string;
  sacador: string;
  status: string;
  urgentOnly: boolean;
}

export interface InvoiceInfo {
  numero: string;
  serie: string;
  dataEmissao: string;
  chave: string;
}

export interface Parcela {
  numero: number;
  valor: number;
  vencimento: string;
}

export interface Duplicata {
  item: string;
  numero: number;
  dataEmissao: string;
  dataVencimento: string;
  valor: number;
  iud: string;
}

export interface ErpInfo {
  documentoContabil: string;
  empresa: string;
  ano: string;
}

export interface CommercialAnnotation {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
}

export interface BoletoPayment {
  type: 'Boleto';
  codigoBarras: string;
  tipoBoleto: string;
  identificadorBoleto: string;
}

export interface TransferenciaPayment {
  type: 'Transferência';
  tipoConta: string;
  ispbCompe: string;
  agencia: string;
  conta: string;
  digitoConta: string;
}

export interface PixPayment {
  type: 'PIX';
  tipoChavePix: 'CPF' | 'CNPJ' | 'Email' | 'Telefone' | 'Aleatoria';
  chavePix: string;
}

export type PaymentInstrument = BoletoPayment | TransferenciaPayment | PixPayment;

export interface Sacado {
  name: string;
  cnpj: string;
  address?: string;
}

export interface Bill {
  id: string;
  type: string;
  iud: string;
  issueDate: string;
  dueDate: string;
  currentDueDate?: string;
  dueDateUpdateDate?: string;
  amount: number;
  sacador: {
    name: string;
    cnpj: string;
    address?: string;
  };
  sacado?: Sacado;
  discountValue: number;
  discountReason?: string;
  updateValue: number;
  lastUpdateDate: string;
  valueUpdateDate?: string;
  paymentInstrument: PaymentInstrument | {
    type: 'Boleto' | 'Transferência' | 'PIX';
    details: string;
  };
  status: string;
  manifestation: string;
  statusManifestacao: StatusManifestacao;
  newReceiver?: {
    name: string;
    account: string;
  };
  settlementLocation?: string;
  diasPendente: number;
  diasParaManifestacao: number;
  notaFiscal?: InvoiceInfo;
  parcelas?: Parcela[];
  commercialAnnotations?: CommercialAnnotation[];
  ressalvaValor?: number;
  ressalvaMotivo?: string;
  ressalvaJustificativa?: string;
  ressalvaData?: string;
  numeroNota?: string;
  duplicatas?: Duplicata[];
  erp?: ErpInfo;
  manifestacaoData?: string;
  manifestacaoHora?: string;
  manifestacaoUsuario?: string;
}