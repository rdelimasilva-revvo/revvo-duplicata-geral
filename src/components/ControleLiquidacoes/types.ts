// Domínio de "Controle de Liquidações".
//
// Uma duplicata pode ser negociada com um financiador, via **cessão** (o
// financiador comprou o título) ou **ônus** (o título foi dado em garantia).
// Quando isso acontece, o financiador passa a ser o **liquidante** — quem deve
// receber o pagamento. O cliente (sacado) deixa de pagar o emissor e passa a
// pagar o liquidante. Esta tela acompanha (faz o "tracking") se o cliente
// efetivamente pagou o liquidante.

/** Como a duplicata foi negociada com o financiador (efeito registrado na CERC). */
export type NegociacaoTipo = 'cessao' | 'onus';

/** Forma combinada de pagamento da duplicata. */
export type FormaPagamento = 'Boleto' | 'Pix' | 'Transferência';

/**
 * Status da liquidação — reflete se o cliente já pagou o liquidante.
 * - `a_liquidar`: cessão/ônus registrado, aguardando o pagamento do cliente.
 * - `parcial`:    o liquidante recebeu parte do valor.
 * - `liquidada`:  o cliente pagou o liquidante integralmente.
 * - `em_atraso`:  passou do vencimento sem liquidação.
 */
export type LiquidacaoStatus = 'a_liquidar' | 'parcial' | 'liquidada' | 'em_atraso';

/**
 * Situação da baixa do efeito na registradora, após a liquidação.
 * Quando o cliente paga o liquidante, a baixa precisa ser reportada à
 * registradora (CERC) para encerrar a cessão/ônus.
 * - `pendente`:   liquidada, mas a baixa ainda não foi reportada.
 * - `reportada`:  baixa enviada à registradora, aguardando confirmação.
 * - `confirmada`: baixa confirmada pela registradora — efeito encerrado.
 */
export type BaixaStatus = 'pendente' | 'reportada' | 'confirmada';

/**
 * Como a baixa foi (ou será) reportada à registradora.
 * O padrão do sistema é `automatico`: assim que a liquidação é confirmada, a
 * baixa é reportada sem intervenção. O modo `manual` permite que um operador
 * faça o report — usado como double check.
 */
export type BaixaModo = 'automatico' | 'manual';

export interface Liquidacao {
  id: string;

  /** Emissor (sacador) dono do título — vincula a liquidação ao CNPJ do grupo
   * selecionado em Início (ver SacadorContext). */
  sacadorId: string;

  // ---- Duplicata de origem ----
  duplicataNumero: string;
  tipoDuplicata: 'Duplicata Mercantil' | 'Duplicata de Serviço';
  notaOrigem: string;
  parcela: string;
  /** Valor de face da duplicata. */
  valor: number;
  /** Vencimento / data prevista de liquidação (dd/mm/aaaa). */
  vencimento: string;
  formaPagamento: FormaPagamento;

  // ---- Sacado (cliente que paga) ----
  cliente: string;
  clienteCnpj: string;

  // ---- Negociação / efeito registrado ----
  negociacao: NegociacaoTipo;
  registradora: string;
  contrato: string;
  protocoloCerc: string;
  /** Data em que a cessão/ônus foi registrada (dd/mm/aaaa). */
  registradoEm: string;

  // ---- Liquidante (financiador que recebe) ----
  liquidante: string;
  liquidanteCnpj: string;
  /** Valor devido ao liquidante (valor cedido/onerado). */
  valorCedido: number;

  // ---- Tracking da liquidação ----
  status: LiquidacaoStatus;
  /** Quanto o cliente já pagou ao liquidante. */
  valorLiquidado: number;
  /** Data da liquidação integral (dd/mm/aaaa). */
  liquidadaEm?: string;
  /** Situação da baixa do efeito na registradora — só se aplica quando liquidada. */
  baixaRegistradora?: BaixaStatus;
  /** Como a baixa foi reportada (automática pelo sistema ou manual por operador). */
  baixaModo?: BaixaModo;
  /** Data em que a baixa foi reportada à registradora (dd/mm/aaaa). */
  baixaReportadaEm?: string;
  /** Data do último pagamento recebido (parcial) (dd/mm/aaaa). */
  ultimoPagamentoEm?: string;
  /** Dias em atraso, quando `status = em_atraso`. */
  diasAtraso?: number;

  // ---- Notificação ao cliente ----
  /** O cliente foi avisado de que deve pagar ao liquidante. */
  clienteNotificado: boolean;
  notificadoEm?: string;
}
