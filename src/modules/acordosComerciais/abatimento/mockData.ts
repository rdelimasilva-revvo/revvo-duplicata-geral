import { Supplier, Credit, Invoice } from './types';

export const suppliers: Supplier[] = [
  { id: 'sup1', name: 'Fornecedor Delta S.A.', cnpj: '98.765.432/0001-10', company: 'Revvo Indústria Ltda' },
  { id: 'sup2', name: 'Distribuidora Nacional Ltda', cnpj: '77.888.999/0001-22', company: 'Revvo Indústria Ltda' },
  { id: 'sup3', name: 'Fornecedor Beta Comércio', cnpj: '55.666.777/0001-88', company: 'Revvo Indústria Ltda' },
  { id: 'sup4', name: 'Agropecuária Vale Verde', cnpj: '66.555.444/0001-77', company: 'Revvo Agro S.A.' },
];

export const credits: Credit[] = [
  {
    id: 'cr1', code: 'CR-2026-0011', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', type: 'devolucao', description: 'Devolução lote 45 - Peças com defeito',
    totalValue: 185000, usedValue: 42000, availableValue: 143000, currency: 'BRL',
    issueDate: '2026-03-10', expirationDate: '2026-09-10', status: 'parcialmente_utilizado',
    contraparte: 'Fornecedor Delta S.A.',
  },
  {
    id: 'cr2', code: 'CR-2026-0018', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', type: 'bonificacao', description: 'Bonificação meta Q1 2026',
    totalValue: 320000, usedValue: 0, availableValue: 320000, currency: 'BRL',
    issueDate: '2026-04-01', expirationDate: '2026-10-01', status: 'disponivel',
    contraparte: 'Fornecedor Delta S.A.',
  },
  {
    id: 'cr3', code: 'CR-2026-0025', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', type: 'acordo_comercial', description: 'Acordo rebate volume anual',
    totalValue: 75000, usedValue: 75000, availableValue: 0, currency: 'BRL',
    issueDate: '2026-01-15', expirationDate: '2026-07-15', status: 'utilizado',
    contraparte: 'Fornecedor Delta S.A.',
  },
  {
    id: 'cr4', code: 'CR-2026-0032', supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda',
    company: 'Revvo Indústria Ltda', type: 'nota_debito', description: 'ND ref. frete indevido embarque 112',
    totalValue: 48500, usedValue: 0, availableValue: 48500, currency: 'BRL',
    issueDate: '2026-03-22', expirationDate: '2026-09-22', status: 'disponivel',
    contraparte: 'Distribuidora Nacional Ltda',
  },
  {
    id: 'cr5', code: 'CR-2026-0041', supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda',
    company: 'Revvo Indústria Ltda', type: 'devolucao', description: 'Devolução parcial pedido #8890',
    totalValue: 210000, usedValue: 95000, availableValue: 115000, currency: 'BRL',
    issueDate: '2026-02-18', expirationDate: '2026-08-18', status: 'parcialmente_utilizado',
    contraparte: 'Distribuidora Nacional Ltda',
  },
  {
    id: 'cr6', code: 'CR-2026-0055', supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio',
    company: 'Revvo Indústria Ltda', type: 'bonificacao', description: 'Bonificação campanha verão 2026',
    totalValue: 530000, usedValue: 180000, availableValue: 350000, currency: 'BRL',
    issueDate: '2026-01-05', expirationDate: '2026-07-05', status: 'parcialmente_utilizado',
    contraparte: 'Fornecedor Beta Comércio',
  },
  {
    id: 'cr7', code: 'CR-2025-0198', supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio',
    company: 'Revvo Indústria Ltda', type: 'acordo_comercial', description: 'Acordo comercial expirado Q4/25',
    totalValue: 120000, usedValue: 45000, availableValue: 75000, currency: 'BRL',
    issueDate: '2025-10-01', expirationDate: '2026-01-01', status: 'expirado',
    contraparte: 'Fornecedor Beta Comércio',
  },
];

export const invoices: Invoice[] = [
  // Fornecedor Delta S.A.
  {
    id: 'inv1', nfNumber: 'NF-2026-004521', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Delta S.A.',
    grossValue: 78000, alreadyOffset: 0, openBalance: 78000,
    dueDate: '2026-04-25', duplicateCode: 'DUP-78001', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: null,
  },
  {
    id: 'inv2', nfNumber: 'NF-2026-004522', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Delta S.A.',
    grossValue: 125000, alreadyOffset: 42000, openBalance: 83000,
    dueDate: '2026-05-10', duplicateCode: 'DUP-78002', duplicateStatus: 'ativa',
    offsetStatus: 'parcialmente_compensada', disputeStatus: 'credito_aplicado',
  },
  {
    id: 'inv3', nfNumber: 'NF-2026-004523', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Delta S.A.',
    grossValue: 45500, alreadyOffset: 0, openBalance: 45500,
    dueDate: '2026-04-30', duplicateCode: 'DUP-78003', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: null,
  },
  {
    id: 'inv4', nfNumber: 'NF-2026-004524', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Delta S.A.',
    grossValue: 92000, alreadyOffset: 0, openBalance: 92000,
    dueDate: '2026-05-20', duplicateCode: 'DUP-78004', duplicateStatus: 'ativa',
    offsetStatus: 'pendente', disputeStatus: 'acordo_pendente',
  },
  {
    id: 'inv5', nfNumber: 'NF-2026-004525', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Delta S.A.',
    grossValue: 33200, alreadyOffset: 33200, openBalance: 0,
    dueDate: '2026-03-15', duplicateCode: 'DUP-78005', duplicateStatus: 'liquidada',
    offsetStatus: 'liquidada', disputeStatus: 'credito_aplicado',
  },
  {
    id: 'inv6', nfNumber: 'NF-2026-004526', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Delta S.A.',
    grossValue: 156000, alreadyOffset: 0, openBalance: 156000,
    dueDate: '2026-06-01', duplicateCode: 'DUP-78006', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: null,
  },
  {
    id: 'inv7', nfNumber: 'NF-2026-004560', supplierId: 'sup1', supplierName: 'Fornecedor Delta S.A.',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Delta S.A.',
    grossValue: 67800, alreadyOffset: 0, openBalance: 67800,
    dueDate: '2026-06-15', duplicateCode: 'DUP-78007', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: 'em_disputa',
  },
  // Distribuidora Nacional Ltda
  {
    id: 'inv8', nfNumber: 'NF-2026-008901', supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda',
    company: 'Revvo Indústria Ltda', contraparte: 'Distribuidora Nacional Ltda',
    grossValue: 89000, alreadyOffset: 0, openBalance: 89000,
    dueDate: '2026-04-28', duplicateCode: 'DUP-89001', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: null,
  },
  {
    id: 'inv9', nfNumber: 'NF-2026-008902', supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda',
    company: 'Revvo Indústria Ltda', contraparte: 'Distribuidora Nacional Ltda',
    grossValue: 145000, alreadyOffset: 60000, openBalance: 85000,
    dueDate: '2026-05-05', duplicateCode: 'DUP-89002', duplicateStatus: 'ativa',
    offsetStatus: 'parcialmente_compensada', disputeStatus: 'credito_aplicado',
  },
  {
    id: 'inv10', nfNumber: 'NF-2026-008903', supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda',
    company: 'Revvo Indústria Ltda', contraparte: 'Distribuidora Nacional Ltda',
    grossValue: 52300, alreadyOffset: 0, openBalance: 52300,
    dueDate: '2026-05-18', duplicateCode: 'DUP-89003', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: null,
  },
  {
    id: 'inv11', nfNumber: 'NF-2026-008904', supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda',
    company: 'Revvo Indústria Ltda', contraparte: 'Distribuidora Nacional Ltda',
    grossValue: 38700, alreadyOffset: 0, openBalance: 38700,
    dueDate: '2026-06-10', duplicateCode: 'DUP-89004', duplicateStatus: 'ativa',
    offsetStatus: 'pendente', disputeStatus: 'bloqueada',
  },
  {
    id: 'inv12', nfNumber: 'NF-2026-008905', supplierId: 'sup2', supplierName: 'Distribuidora Nacional Ltda',
    company: 'Revvo Indústria Ltda', contraparte: 'Distribuidora Nacional Ltda',
    grossValue: 71200, alreadyOffset: 35000, openBalance: 36200,
    dueDate: '2026-04-20', duplicateCode: 'DUP-89005', duplicateStatus: 'ativa',
    offsetStatus: 'parcialmente_compensada', disputeStatus: 'credito_aplicado',
  },
  // Fornecedor Beta Comércio
  {
    id: 'inv13', nfNumber: 'NF-2026-012301', supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Beta Comércio',
    grossValue: 198000, alreadyOffset: 80000, openBalance: 118000,
    dueDate: '2026-04-22', duplicateCode: 'DUP-12301', duplicateStatus: 'ativa',
    offsetStatus: 'parcialmente_compensada', disputeStatus: 'credito_aplicado',
  },
  {
    id: 'inv14', nfNumber: 'NF-2026-012302', supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Beta Comércio',
    grossValue: 67000, alreadyOffset: 0, openBalance: 67000,
    dueDate: '2026-05-12', duplicateCode: 'DUP-12302', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: null,
  },
  {
    id: 'inv15', nfNumber: 'NF-2026-012303', supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Beta Comércio',
    grossValue: 234000, alreadyOffset: 100000, openBalance: 134000,
    dueDate: '2026-05-28', duplicateCode: 'DUP-12303', duplicateStatus: 'ativa',
    offsetStatus: 'parcialmente_compensada', disputeStatus: 'acordo_pendente',
  },
  {
    id: 'inv16', nfNumber: 'NF-2026-012304', supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Beta Comércio',
    grossValue: 41500, alreadyOffset: 0, openBalance: 41500,
    dueDate: '2026-06-05', duplicateCode: 'DUP-12304', duplicateStatus: 'vencida',
    offsetStatus: 'livre', disputeStatus: 'em_disputa',
  },
  {
    id: 'inv17', nfNumber: 'NF-2026-012305', supplierId: 'sup3', supplierName: 'Fornecedor Beta Comércio',
    company: 'Revvo Indústria Ltda', contraparte: 'Fornecedor Beta Comércio',
    grossValue: 89500, alreadyOffset: 0, openBalance: 89500,
    dueDate: '2026-06-20', duplicateCode: 'DUP-12305', duplicateStatus: 'ativa',
    offsetStatus: 'livre', disputeStatus: null,
  },
];
