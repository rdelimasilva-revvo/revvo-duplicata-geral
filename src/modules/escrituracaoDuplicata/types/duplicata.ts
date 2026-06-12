export type DuplicataStatus =
  | 'ativa'
  | 'aguardando'
  | 'negociada'
  | 'paga'
  | 'cancelada';

export type DuplicataOrigem = 'automatica' | 'manual';

export type DuplicataTipo = 'Duplicata Mercantil' | 'Duplicata de Serviço';

/** Tipo de efeito registrado sobre a duplicata na registradora (CERC). */
export type EfeitoTipo = 'cessao' | 'onus';

/**
 * Crédito vinculado à duplicata — efeito de cessão ou ônus registrado na CERC.
 * Presente apenas quando um financiador adquiriu (cessão) ou onerou (ônus) a
 * duplicata. Os dados refletem o efeito retornado pela CERC.
 */
export interface CreditoVinculado {
  tipo: EfeitoTipo;
  /** Nome do financiador (cessionário, na cessão; credor, no ônus). */
  financiador: string;
  /** CNPJ do financiador, ex.: "00.000.000/0001-00". */
  financiadorCnpj?: string;
  /** Valor do efeito (valor cedido ou onerado). */
  valorEfeito: number;
  /** Registradora que registrou o efeito. */
  registradora?: string;
  /** Nº do contrato/operação informado à registradora. */
  contrato?: string;
  /** Protocolo do registro do efeito na CERC. */
  protocoloCerc?: string;
  /** Data de registro do efeito (dd/mm/aaaa). */
  registradoEm: string;
  /** Validade do efeito, quando aplicável — usual em ônus (dd/mm/aaaa). */
  validade?: string;
}

export interface Duplicata {
  id: string;
  sacadorId: string; // CNPJ emitente (grupo) ao qual a duplicata pertence — ver SacadorContext
  cliente: string;
  /** Tipo exibido na primeira coluna (acima do número) */
  tipo: DuplicataTipo;
  /** Número visível ao usuário (não é termo técnico) */
  numero: string;
  valor: number;
  /** Data no formato dd/mm/aaaa */
  vencimento: string;
  origem: DuplicataOrigem;
  status: DuplicataStatus;
  /** Ex.: "1 de 3" */
  parcela: string;
  /** Nota fiscal que originou a duplicata, ex.: "NF 000412" */
  notaOrigem: string;
  /** Boleto | Pix | Transferência */
  formaPagamento: string;

  /** Apenas quando status = aguardando */
  motivoPendencia?: string;
  /** Apenas quando status = cancelada */
  motivoCancelamento?: string;

  /** Presente quando há crédito vinculado (cessão ou ônus) registrado na CERC. */
  creditoVinculado?: CreditoVinculado;

  // Linha do tempo (datas dd/mm/aaaa). Ausência = etapa ainda não ocorreu.
  criadaEm?: string;
  registradaEm?: string;
  negociadaEm?: string;
  pagaEm?: string;
  canceladaEm?: string;
}
