import { AlteracaoDomicilio } from '../types/novosRecebedores';

export const mockAlteracoesDomicilio: AlteracaoDomicilio[] = [
  {
    id: '1',
    fornecedor: {
      razaoSocial: 'Tech Solutions Brasil Ltda',
      cnpj: '12.345.678/0001-90'
    },
    recebedorOriginal: {
      titular: 'Tech Solutions Brasil Ltda',
      banco: '001 - Banco do Brasil',
      agencia: '1234-5',
      conta: '12345-6',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Tech Solutions Brasil Ltda',
      banco: '237 - Bradesco',
      agencia: '5678-9',
      conta: '98765-4',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-29T10:30:00',
    status: 'pendente',
    observacoes: 'Mudança de banco principal da empresa'
  },
  {
    id: '2',
    fornecedor: {
      razaoSocial: 'Distribuidora Nacional S.A.',
      cnpj: '98.765.432/0001-10'
    },
    recebedorOriginal: {
      titular: 'Distribuidora Nacional S.A.',
      banco: '341 - Itaú',
      agencia: '0123-4',
      conta: '45678-9',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Distribuidora Nacional S.A.',
      banco: '104 - Caixa Econômica',
      agencia: '9876-5',
      conta: '11111-2',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-30T14:15:00',
    status: 'alterado_sap'
  },
  {
    id: '3',
    fornecedor: {
      razaoSocial: 'Indústria Metalúrgica XYZ',
      cnpj: '11.222.333/0001-44'
    },
    recebedorOriginal: {
      titular: 'Indústria Metalúrgica XYZ',
      banco: '033 - Santander',
      agencia: '3333-3',
      conta: '33333-3',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Indústria Metalúrgica XYZ',
      banco: '077 - Banco Inter',
      agencia: '0001-0',
      conta: '77777-7',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-28T09:45:00',
    status: 'em_analise',
    observacoes: 'Verificar documentação cadastral'
  },
  {
    id: '4',
    fornecedor: {
      razaoSocial: 'Comércio ABC Ltda ME',
      cnpj: '55.666.777/0001-88'
    },
    recebedorOriginal: {
      titular: 'Comércio ABC Ltda ME',
      banco: '237 - Bradesco',
      agencia: '2222-2',
      conta: '22222-2',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'João Silva (Sócio)',
      banco: '341 - Itaú',
      agencia: '4444-4',
      conta: '44444-4',
      tipoConta: 'Poupança'
    },
    dataSolicitacao: '2026-01-27T16:20:00',
    status: 'rejeitado',
    observacoes: 'Conta não pertence à pessoa jurídica'
  },
  {
    id: '5',
    fornecedor: {
      razaoSocial: 'Logística Express Corp',
      cnpj: '33.444.555/0001-22'
    },
    recebedorOriginal: {
      titular: 'Logística Express Corp',
      banco: '104 - Caixa Econômica',
      agencia: '5555-5',
      conta: '55555-5',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Logística Express Corp',
      banco: '260 - Nu Pagamentos',
      agencia: '0001-0',
      conta: '66666666-6',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-30T11:00:00',
    status: 'alterado_sap'
  },
  {
    id: '6',
    fornecedor: {
      razaoSocial: 'Serviços Integrados Ltda',
      cnpj: '77.888.999/0001-66'
    },
    recebedorOriginal: {
      titular: 'Serviços Integrados Ltda',
      banco: '001 - Banco do Brasil',
      agencia: '6666-6',
      conta: '66666-6',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Serviços Integrados Ltda',
      banco: '033 - Santander',
      agencia: '7777-7',
      conta: '77777-7',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-29T13:30:00',
    status: 'pendente'
  },
  {
    id: '7',
    fornecedor: {
      razaoSocial: 'Construtora Obras & Cia',
      cnpj: '22.333.444/0001-55'
    },
    recebedorOriginal: {
      titular: 'Construtora Obras & Cia',
      banco: '341 - Itaú',
      agencia: '8888-8',
      conta: '88888-8',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Construtora Obras & Cia',
      banco: '237 - Bradesco',
      agencia: '9999-9',
      conta: '99999-9',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-30T08:45:00',
    status: 'alterado_sap'
  },
  {
    id: '8',
    fornecedor: {
      razaoSocial: 'Farmacêutica Med Plus S.A.',
      cnpj: '44.555.666/0001-77'
    },
    recebedorOriginal: {
      titular: 'Farmacêutica Med Plus S.A.',
      banco: '077 - Banco Inter',
      agencia: '0001-0',
      conta: '10101-0',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Farmacêutica Med Plus S.A.',
      banco: '341 - Itaú',
      agencia: '1111-1',
      conta: '11111-1',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-29T15:10:00',
    status: 'em_analise'
  },
  {
    id: '9',
    fornecedor: {
      razaoSocial: 'Alimentos Naturais Ltda',
      cnpj: '66.777.888/0001-99'
    },
    recebedorOriginal: {
      titular: 'Alimentos Naturais Ltda',
      banco: '237 - Bradesco',
      agencia: '2121-2',
      conta: '21212-1',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Alimentos Naturais Ltda',
      banco: '001 - Banco do Brasil',
      agencia: '3131-3',
      conta: '31313-1',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-28T17:25:00',
    status: 'pendente'
  },
  {
    id: '10',
    fornecedor: {
      razaoSocial: 'Transportadora Rápida ME',
      cnpj: '88.999.000/0001-11'
    },
    recebedorOriginal: {
      titular: 'Transportadora Rápida ME',
      banco: '104 - Caixa Econômica',
      agencia: '4141-4',
      conta: '41414-1',
      tipoConta: 'Corrente'
    },
    novoRecebedor: {
      titular: 'Transportadora Rápida ME',
      banco: '260 - Nu Pagamentos',
      agencia: '0001-0',
      conta: '51515151-5',
      tipoConta: 'Corrente'
    },
    dataSolicitacao: '2026-01-29T12:40:00',
    status: 'pendente'
  }
];
