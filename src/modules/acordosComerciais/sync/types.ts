export type NFStatus = 'pendente' | 'pago' | 'creditado' | 'liquidado';
export type PagamentoTipo = 'pagamento' | 'credito' | 'liquidacao';
export type PagamentoStatus = 'pendente' | 'confirmado' | 'cancelado';

export interface NotaFiscal {
  id: string;
  transactionId: string;
  empresaId: string;
  fornecedorId: string;
  fornecedorNome: string;
  fornecedorCnpj: string;
  numeroNf: string;
  valor: number;
  status: NFStatus;
  dataEmissao: string;
  dataVencimento: string;
  dataLiquidacao: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PagamentoCredito {
  id: string;
  transactionId: string;
  empresaId: string;
  fornecedorId: string;
  empresaNome: string;
  tipo: PagamentoTipo;
  valor: number;
  status: PagamentoStatus;
  referenciaNf: string;
  dataOperacao: string;
  createdAt: string;
  updatedAt: string;
}

export interface HistoricoMovimentacao {
  id: string;
  transactionId: string;
  tabelaOrigem: string;
  acao: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  usuarioId: string;
  usuarioNome: string;
  motivo: string | null;
  createdAt: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  valorMin: string;
  valorMax: string;
}

export type UserRole = 'empresa' | 'fornecedor';
