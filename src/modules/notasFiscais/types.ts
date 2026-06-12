export type FormaPagamento = 'Boleto' | 'PIX' | 'Transferência';

export interface ParcelaNota {
  numero: number;
  valor: number;
  vencimento: string; // dd/mm/aaaa
}

export interface NotaFiscal {
  id: string;
  sacadorId: string; // CNPJ emitente (grupo) ao qual a nota pertence — ver SacadorContext
  numero: string; // ex.: "NF 000412"
  cliente: string;
  clienteEmail: string | null;
  valor: number;
  emissao: string; // dd/mm/aaaa
  vencimento: string | null; // dd/mm/aaaa
  parcelas: ParcelaNota[];
  formaPagamento: FormaPagamento;
  enviada: boolean;
}

// Tipo da pendência que impede o envio. Um por vez (a primeira encontrada).
export type PendenciaTipo = 'email' | 'vencimento' | 'parcelas';

export interface Pendencia {
  tipo: PendenciaTipo;
  aviso: string; // texto curto exibido na linha, ex.: "falta e-mail"
}
