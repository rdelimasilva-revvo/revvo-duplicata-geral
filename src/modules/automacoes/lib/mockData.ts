export const mockRuleTypes = [
  { id: 1, name: 'Risco Sacado', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras relacionadas ao programa Risco Sacado' },
  { id: 2, name: 'Escrituração de duplicatas', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras para escrituração automática de duplicatas' },
  { id: 3, name: 'Manifestação', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras para manifestação automática de duplicatas' },
  { id: 4, name: 'Conciliação Bancária', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras para conciliação automática de extratos bancários' },
  { id: 5, name: 'Gestão de Domicílio', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras para gestão automática de domicílio bancário' },
  { id: 6, name: 'Notificação de Vencimento', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras para envio automático de notificações de vencimento' },
  { id: 7, name: 'Aprovação Automática', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras para aprovação automática de documentos e transações' },
  { id: 8, name: 'Classificação Contábil', created_at: '2024-01-01', updated_at: '2024-01-01', description: 'Regras para classificação contábil automática de lançamentos' },
];

export const mockRules = [
  {
    id: 1001,
    name: 'Risco Sacado II',
    company_id: 1,
    rule_type: 1,
    status: 'active',
    created_at: '2025-12-08',
    updated_at: '2025-12-08',
    amount_min: 100000,
    amount_max: 9999999999,
    days_since_creation: 1,
    description: 'Distribuição de fornecedores programa Risco Sacado Pedrã/ Alfa',
  },
  {
    id: 6,
    name: 'Manifestação de Recusa Automática - Sem Pedido de Compra',
    company_id: 1,
    rule_type: 2,
    status: 'active',
    created_at: '2025-08-21',
    updated_at: '2025-08-21',
    amount_min: 1000000,
    amount_max: 1500000,
    days_since_creation: 5,
    description: 'Manifestação de Recusa Automática - Sem Pedido de Compra',
  },
  {
    id: 1003,
    name: 'Escrituração I',
    company_id: 1,
    rule_type: 2,
    status: 'inactive',
    created_at: '2025-07-29',
    updated_at: '2025-07-29',
    amount_min: 1000001,
    amount_max: 999999999,
    days_since_creation: 5,
    description: 'Escrituração dos ativos próprios, com fatura de valor superior a 10k.',
  },
  {
    id: 1004,
    name: 'CERC Fornecedor',
    company_id: 1,
    rule_type: 2,
    status: 'active',
    created_at: '2025-02-10',
    updated_at: '2025-02-10',
    amount_min: 100000,
    amount_max: 999999999,
    days_since_creation: 2,
    description: 'Escrituração para Fornecedores a partir do Ctas a Pagar',
  },
  {
    id: 1005,
    name: 'Escrituração PETRO',
    company_id: 1,
    rule_type: 2,
    status: 'active',
    created_at: '2025-02-10',
    updated_at: '2025-02-10',
    amount_min: 500000,
    amount_max: 999999999,
    days_since_creation: 1,
    description: 'Escrituração de recebíveis da Petrobras',
  },
];

export const mockCompanies = [
  { id: 1, name: 'Silimed - Matriz', company_code: 'MAT', created_at: '', updated_at: '' },
  { id: 2, name: 'Silimed - Filial 2', company_code: 'FIL2', created_at: '', updated_at: '' },
  { id: 3, name: 'Silimed - Filial 3', company_code: 'FIL3', created_at: '', updated_at: '' },
  { id: 4, name: 'Silimed - Filial 4', company_code: 'FIL4', created_at: '', updated_at: '' },
  { id: 7, name: 'Silimed - Filial 7', company_code: 'FIL7', created_at: '', updated_at: '' },
];

export const mockAssetOrigins = [
  { id: 1, name: 'Ativo próprio', created_at: '', updated_at: '' },
  { id: 2, name: 'Fornecedor', created_at: '', updated_at: '' },
];

export const mockBkpgChannels = [
  { id: 1, name: 'ERP', created_at: '', updated_at: '' },
  { id: 2, name: 'API', created_at: '', updated_at: '' },
];

export const mockOutputChannels = [
  { id: 1, name: 'Canal padrão', created_at: '', updated_at: '' },
];

export const mockBanks = [
  { id: 1, name: 'Banco A', bank_code: '001', created_at: '', updated_at: '' },
  { id: 2, name: 'Banco B', bank_code: '237', created_at: '', updated_at: '' },
];

export const mockCustomers = [
  { id: 'CUST1', name: 'Cliente 1', company_id: 1, created_at: '', updated_at: '' },
  { id: 'CUST2', name: 'Cliente 2', company_id: 2, created_at: '', updated_at: '' },
];

export const mockSuppliers = [
  { id: '1', name: 'ELO Tecnologia', company_id: 1, created_at: '', updated_at: '' },
  { id: '2', name: 'Fornecedor ABC', company_id: 1, created_at: '', updated_at: '' },
  { id: '3', name: 'SOW', company_id: 1, created_at: '', updated_at: '' },
];

export function createDefaultRule(
  companyId: number | string,
  companies: any[],
  bkpgChannels: any[],
  outputChannels: any[],
  banks: any[],
) {
  return {
    id: 0,
    created_at: new Date().toISOString(),
    name: '',
    description: '',
    rule_type_id: 2,
    company_code: companies.map((c: any) => c.company_code || '').filter(Boolean),
    days_since_creation: 1,
    value_ini: 1000,
    value_end: 99999999.99,
    days_until_due_date_ini: null,
    days_until_due_date_end: null,
    active: true,
    asset_type_id: 1,
    company_id: Number(companyId),
    bkpg_channel_id: bkpgChannels[0]?.id || null,
    creator: null,
    updated_at: null,
    asset_origin_id: 1,
    supplier: [] as string[],
    customer: [] as string[],
    certf_digital: null,
    output_channel_id: outputChannels[0]?.id || null,
    bank_id: [banks[0]?.id || 0],
    partner_type: null,
  };
}
