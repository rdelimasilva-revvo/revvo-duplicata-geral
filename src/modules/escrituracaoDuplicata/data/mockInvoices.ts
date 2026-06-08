import { Invoice } from '../types/invoice';

export const mockInvoices: Invoice[] = [
  {
    id: 'FAT-54858',
    company: 'Corretora de Câmbio Ltda',
    issueDate: '01/01/2024',
    dueDate: '01/01/2024',
    total: 16000.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Razão Social do Sacado',
      document: '22.333.444/0001-22',
      code: '627452324565'
    },
    bank: {
      name: '117 - Corretora de Câmbio Ltda',
      agency: '0001-0',
      account: '123456-6'
    },
    payment: 'C030 - 30 dias',
    fiscalKey: '12348975691029384379093800039739174803817',
    numeroNota: '000123',
    serie: '001',
    installments: [
      { number: '001', value: 2000.00, dueDate: '18/08/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '002', value: 2000.00, dueDate: '18/09/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '003', value: 2000.00, dueDate: '18/10/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '004', value: 2000.00, dueDate: '18/11/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '005', value: 2000.00, dueDate: '18/12/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '006', value: 2000.00, dueDate: '18/01/2025', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '007', value: 2000.00, dueDate: '18/02/2025', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '008', value: 2000.00, dueDate: '18/03/2025', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  },
  {
    id: 'FAT-54859',
    company: 'Tech Solutions SA',
    issueDate: '02/01/2024',
    dueDate: '02/02/2024',
    total: 25000.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Tech Solutions SA',
      document: '33.444.555/0001-33',
      code: '627452324566'
    },
    bank: {
      name: '341 - Banco Itaú SA',
      agency: '1234-5',
      account: '98765-4'
    },
    payment: 'C030 - 30 dias',
    fiscalKey: '98765432109876543210987654321098765432109',
    numeroNota: '000456',
    serie: '001',
    installments: [
      { number: '001', value: 12500.00, dueDate: '02/02/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '002', value: 12500.00, dueDate: '02/03/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  },
  {
    id: 'FAT-54860',
    company: 'Indústria Metalúrgica Ltda',
    issueDate: '03/01/2024',
    dueDate: '03/03/2024',
    total: 75000.00,
    duplicate: false,
    currency: 'BRL',
    drawee: {
      name: 'Indústria Metalúrgica Ltda',
      document: '44.555.666/0001-44',
      code: '627452324567'
    },
    bank: {
      name: '001 - Banco do Brasil SA',
      agency: '5678-9',
      account: '12345-6'
    },
    payment: 'C060 - 60 dias',
    fiscalKey: '11122233344455566677788899900011122233344',
    numeroNota: '000789',
    serie: '002',
    installments: [
      { number: '001', value: 25000.00, dueDate: '03/03/2024', vt: '2077', cpgt: 'A', mp: 'Não', duplicate: 'Não' },
      { number: '002', value: 25000.00, dueDate: '03/04/2024', vt: '2077', cpgt: 'A', mp: 'Não', duplicate: 'Não' },
      { number: '003', value: 25000.00, dueDate: '03/05/2024', vt: '2077', cpgt: 'A', mp: 'Não', duplicate: 'Não' }
    ]
  },
  {
    id: 'FAT-54861',
    company: 'Distribuidora ABC',
    issueDate: '04/01/2024',
    dueDate: '04/02/2024',
    total: 45000.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Distribuidora ABC',
      document: '55.666.777/0001-55',
      code: '627452324568'
    },
    bank: {
      name: '033 - Banco Santander SA',
      agency: '9876-5',
      account: '54321-0'
    },
    payment: 'C030 - 30 dias',
    fiscalKey: '22233344455566677788899900011122233344455',
    numeroNota: '001012',
    serie: '001',
    installments: [
      { number: '001', value: 45000.00, dueDate: '04/02/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  },
  {
    id: 'FAT-54862',
    company: 'Comércio XYZ',
    issueDate: '05/01/2024',
    dueDate: '05/04/2024',
    total: 32000.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Comércio XYZ',
      document: '66.777.888/0001-66',
      code: '627452324569'
    },
    bank: {
      name: '104 - Caixa Econômica Federal',
      agency: '4321-0',
      account: '87654-3'
    },
    payment: 'C090 - 90 dias',
    fiscalKey: '33344455566677788899900011122233344455566',
    numeroNota: '001345',
    serie: '003',
    installments: [
      { number: '001', value: 8000.00, dueDate: '05/02/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '002', value: 8000.00, dueDate: '05/03/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '003', value: 8000.00, dueDate: '05/04/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '004', value: 8000.00, dueDate: '05/05/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  },
  {
    id: 'FAT-54863',
    company: 'Transportadora Express',
    issueDate: '06/01/2024',
    dueDate: '06/02/2024',
    total: 18500.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Transportadora Express',
      document: '77.888.999/0001-77',
      code: '627452324570'
    },
    bank: {
      name: '237 - Banco Bradesco SA',
      agency: '6543-2',
      account: '34567-8'
    },
    payment: 'C030 - 30 dias',
    fiscalKey: '44455566677788899900011122233344455566677',
    numeroNota: '001678',
    serie: '001',
    installments: [
      { number: '001', value: 18500.00, dueDate: '06/02/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  },
  {
    id: 'FAT-54864',
    company: 'Construtora Silva',
    issueDate: '07/01/2024',
    dueDate: '07/03/2024',
    total: 120000.00,
    duplicate: false,
    currency: 'BRL',
    drawee: {
      name: 'Construtora Silva',
      document: '88.999.000/0001-88',
      code: '627452324571'
    },
    bank: {
      name: '341 - Banco Itaú SA',
      agency: '7654-3',
      account: '23456-7'
    },
    payment: 'C060 - 60 dias',
    fiscalKey: '55566677788899900011122233344455566677788',
    numeroNota: '001901',
    serie: '002',
    installments: [
      { number: '001', value: 40000.00, dueDate: '07/03/2024', vt: '2077', cpgt: 'A', mp: 'Não', duplicate: 'Não' },
      { number: '002', value: 40000.00, dueDate: '07/04/2024', vt: '2077', cpgt: 'A', mp: 'Não', duplicate: 'Não' },
      { number: '003', value: 40000.00, dueDate: '07/05/2024', vt: '2077', cpgt: 'A', mp: 'Não', duplicate: 'Não' }
    ]
  },
  {
    id: 'FAT-54865',
    company: 'Farmácia Saúde',
    issueDate: '08/01/2024',
    dueDate: '08/02/2024',
    total: 28750.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Farmácia Saúde',
      document: '99.000.111/0001-99',
      code: '627452324572'
    },
    bank: {
      name: '033 - Banco Santander SA',
      agency: '8765-4',
      account: '45678-9'
    },
    payment: 'C030 - 30 dias',
    fiscalKey: '66677788899900011122233344455566677788899',
    numeroNota: '002134',
    serie: '001',
    installments: [
      { number: '001', value: 14375.00, dueDate: '08/02/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '002', value: 14375.00, dueDate: '08/03/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  },
  {
    id: 'FAT-54866',
    company: 'Supermercado Bom Preço',
    issueDate: '09/01/2024',
    dueDate: '09/03/2024',
    total: 52000.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Supermercado Bom Preço',
      document: '00.111.222/0001-00',
      code: '627452324573'
    },
    bank: {
      name: '001 - Banco do Brasil SA',
      agency: '9876-5',
      account: '56789-0'
    },
    payment: 'C060 - 60 dias',
    fiscalKey: '77788899900011122233344455566677788899900',
    numeroNota: '002367',
    serie: '003',
    installments: [
      { number: '001', value: 26000.00, dueDate: '09/02/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' },
      { number: '002', value: 26000.00, dueDate: '09/03/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  },
  {
    id: 'FAT-54867',
    company: 'Auto Peças Nacional',
    issueDate: '10/01/2024',
    dueDate: '10/02/2024',
    total: 15800.00,
    duplicate: true,
    currency: 'BRL',
    drawee: {
      name: 'Auto Peças Nacional',
      document: '11.222.333/0001-11',
      code: '627452324574'
    },
    bank: {
      name: '237 - Banco Bradesco SA',
      agency: '0987-6',
      account: '67890-1'
    },
    payment: 'C030 - 30 dias',
    fiscalKey: '88899900011122233344455566677788899900011',
    numeroNota: '002590',
    serie: '001',
    installments: [
      { number: '001', value: 15800.00, dueDate: '10/02/2024', vt: '2077', cpgt: 'A', mp: 'Sim', duplicate: 'Sim' }
    ]
  }
];
