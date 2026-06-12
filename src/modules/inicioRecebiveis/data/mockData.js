// Dados de exemplo da tela "Início".
// Tudo em linguagem simples — sem termos técnicos.

// Estado da conexão e da janela de envio.
export const status = {
  // true = "Conectado" (verde) | false = "Indisponível" (vermelho)
  conectado: true,
  // true = "Envios abertos até 20h" | false = "Envios fechados..."
  enviosAbertos: true,
};

// Números do dia mostrados nos cards.
export const resumo = {
  registradasHoje: 128,
  aguardando: 14,
};

// Lista de pendências. Cada item vira uma linha com botão de ação.
// `quantidade` alimenta o card "Precisam de você".
export const pendenciasIniciais = [
  {
    id: 'sem-email',
    tipo: 'clientes-sem-email',
    quantidade: 2,
    titulo: '2 clientes sem e-mail',
    descricao: 'Sem o e-mail, o cliente não recebe o aviso da nota.',
    clientes: [
      { id: 'cli-1', nome: 'Padaria Pão Quente Ltda', email: '' },
      { id: 'cli-2', nome: 'Auto Peças Silva ME', email: '' },
    ],
  },
  {
    id: 'valor-acima',
    tipo: 'valor-acima',
    quantidade: 1,
    titulo: '1 nota com valor acima da fatura',
    descricao:
      'A nota 4582, do cliente Mercado União, foi enviada com valor maior do que a fatura original. ' +
      'Confira com quem emitiu a nota antes de seguir. Se estiver tudo certo, é só confirmar.',
    botao: 'Ver detalhe',
    acaoConfirmar: 'Está correto, pode seguir',
  },
  {
    id: 'recusada',
    tipo: 'recusada',
    quantidade: 1,
    titulo: '1 nota recusada no registro',
    // Mensagem original traduzida para linguagem simples + o que fazer.
    motivo: 'A nota 4790 não foi aceita porque o CNPJ do cliente está desatualizado.',
    oQueFazer: 'Atualize o cadastro do cliente e envie a nota de novo.',
    botao: 'Ver motivo',
    acaoConfirmar: 'Enviar de novo',
  },
];
