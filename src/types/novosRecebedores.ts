export interface DadosBancarios {
  titular: string;
  banco: string;
  agencia: string;
  conta: string;
  tipoConta: 'Corrente' | 'Poupança';
}

export interface AlteracaoDomicilio {
  id: string;
  fornecedor: {
    razaoSocial: string;
    cnpj: string;
  };
  recebedorOriginal: DadosBancarios;
  novoRecebedor: DadosBancarios;
  dataSolicitacao: string; // ISO format
  status: 'pendente' | 'alterado_sap' | 'rejeitado' | 'em_analise';
  observacoes?: string;
}
