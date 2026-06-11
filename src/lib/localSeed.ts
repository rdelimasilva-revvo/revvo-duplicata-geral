// Dados iniciais do banco local, portados dos seeds em supabase/migrations.
// Datas relativas (now() - interval) são recalculadas a cada carga para a demo
// permanecer com prazos plausíveis.

type Row = Record<string, unknown>;

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY).toISOString();
}

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString();
}

let uuidCounter = 0;
function seedId(): string {
  uuidCounter += 1;
  return `seed-${uuidCounter.toString(16).padStart(8, '0')}-0000-4000-8000-000000000000`;
}

// 20260420190045_create_commercial_agreements_table.sql
function commercialAgreements(): Row[] {
  const rows = [
    ['AC-2026-001', 'Acordo Delta S.A. - Cessão Recebíveis', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'Banco Alpha', '11.222.333/0001-44', 'draft', 'cessao', 450000, '2026-05-01', '2026-11-30', 10, 'low', 2],
    ['AC-2026-002', 'Acordo Distribuidora Nacional', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'Financeira Beta', '22.333.444/0001-55', 'in_negotiation', 'venda', 280000, '2026-04-15', '2026-10-15', 35, 'medium', 5],
    ['AC-2026-003', 'Acordo Sigma Industria', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'Banco Alpha', '11.222.333/0001-44', 'pending_approval', 'venda', 620000, '2026-03-20', '2026-12-20', 65, 'medium', 8],
    ['AC-2026-004', 'Acordo Beta Comércio Anual', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'Financeira Beta', '22.333.444/0001-55', 'active', 'venda', 890000, '2026-01-10', '2026-12-31', 100, 'low', 40],
    ['AC-2026-005', 'Acordo Delta Fiança Bancária', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'Banco Alpha', '11.222.333/0001-44', 'active', 'fianca', 320000, '2026-02-01', '2026-08-31', 100, 'low', 30],
    ['AC-2026-006', 'Acordo Sigma Cessão Trimestral', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'Banco Alpha', '11.222.333/0001-44', 'completed', 'cessao', 180000, '2025-10-01', '2026-01-31', 100, 'low', 120],
    ['AC-2026-007', 'Acordo Distribuidora Premium', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'Financeira Beta', '22.333.444/0001-55', 'in_negotiation', 'cessao', 1250000, '2026-05-10', '2027-05-10', 45, 'high', 3],
    ['AC-2026-008', 'Acordo Beta Fiança Reforço', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'Banco Alpha', '11.222.333/0001-44', 'rejected', 'fianca', 95000, '2026-03-05', '2026-09-05', 20, 'high', 15],
    ['AC-2026-009', 'Acordo Delta Supply Chain', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'Financeira Beta', '22.333.444/0001-55', 'pending_approval', 'cessao', 540000, '2026-04-20', '2026-10-20', 75, 'medium', 11],
    ['AC-2026-010', 'Acordo Sigma Expansão', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'Banco Alpha', '11.222.333/0001-44', 'active', 'venda', 780000, '2026-03-01', '2026-12-31', 100, 'low', 25],
    ['AC-2026-011', 'Acordo Beta Projeto Alfa', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'Financeira Beta', '22.333.444/0001-55', 'draft', 'venda', 150000, '2026-05-15', '2026-11-15', 5, 'medium', 1],
    ['AC-2026-012', 'Acordo Distribuidora Consolidado', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'Banco Alpha', '11.222.333/0001-44', 'completed', 'venda', 410000, '2025-09-01', '2026-02-28', 100, 'low', 90],
  ] as const;

  return rows.map(([code, title, supplier_name, supplier_cnpj, sacado_name, sacado_cnpj, status, contract_type, total_value, start_date, end_date, progress_percent, risk_level, createdDaysAgo]) => ({
    id: seedId(),
    code,
    title,
    supplier_name,
    supplier_cnpj,
    sacado_name,
    sacado_cnpj,
    status,
    contract_type,
    total_value,
    currency: 'BRL',
    start_date,
    end_date,
    owner_id: null,
    progress_percent,
    risk_level,
    created_at: daysAgo(createdDaysAgo),
    updated_at: daysAgo(createdDaysAgo),
  }));
}

// 20260420192020_create_supplier_credits_and_invoices.sql
function supplierCredits(): Row[] {
  const rows = [
    ['CR-2026-0101', 'f1', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'acordo_comercial', 50000, 50000, '2026-03-15', '2026-09-15', 'available'],
    ['CR-2026-0102', 'f1', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'devolucao', 18500, 18500, '2026-04-05', '2026-10-05', 'available'],
    ['CR-2026-0203', 'f2', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'bonificacao', 32500, 20000, '2026-02-20', '2026-08-20', 'partial'],
    ['CR-2026-0304', 'f3', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'acordo_comercial', 18000, 18000, '2026-03-28', '2026-09-28', 'available'],
    ['CR-2026-0405', 'f4', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'acordo_comercial', 74500, 74500, '2026-04-01', '2026-10-01', 'available'],
  ] as const;

  return rows.map(([code, supplier_id, supplier_name, supplier_cnpj, origin, total_value, remaining_value, issue_date, expires_at, status]) => ({
    id: seedId(),
    code,
    supplier_id,
    supplier_name,
    supplier_cnpj,
    origin,
    total_value,
    remaining_value,
    issue_date,
    expires_at,
    status,
    owner_id: null,
    created_at: daysAgo(30),
  }));
}

// 20260420192020_create_supplier_credits_and_invoices.sql
function eligibleInvoices(): Row[] {
  const rows = [
    ['f1', 'NF-00012345', '2026-03-10', '2026-05-10', 32000, 32000, 'livre'],
    ['f1', 'NF-00012401', '2026-03-18', '2026-05-18', 48500, 48500, 'livre'],
    ['f1', 'NF-00012478', '2026-03-25', '2026-05-25', 18700, 18700, 'em_disputa'],
    ['f1', 'NF-00012502', '2026-04-05', '2026-06-05', 15300, 15300, 'pendente'],
    ['f2', 'NF-00021120', '2026-04-05', '2026-06-05', 15300, 15300, 'pendente'],
    ['f2', 'NF-00021188', '2026-04-12', '2026-06-12', 22400, 22400, 'livre'],
    ['f2', 'NF-00021221', '2026-04-20', '2026-06-20', 14800, 14800, 'livre'],
    ['f3', 'NF-00033401', '2026-03-28', '2026-05-28', 9800, 9800, 'livre'],
    ['f3', 'NF-00033477', '2026-04-20', '2026-06-20', 5500, 5500, 'bloqueada'],
    ['f4', 'NF-00044802', '2026-03-30', '2026-05-30', 64000, 64000, 'livre'],
    ['f4', 'NF-00044910', '2026-04-15', '2026-06-15', 38200, 38200, 'pendente'],
    ['f4', 'NF-00044988', '2026-04-25', '2026-06-25', 25100, 25100, 'livre'],
  ] as const;

  return rows.map(([supplier_id, number, issue_date, due_date, original_value, open_balance, status]) => ({
    id: seedId(),
    supplier_id,
    number,
    issue_date,
    due_date,
    original_value,
    open_balance,
    status,
    owner_id: null,
    created_at: daysAgo(30),
  }));
}

// 20260428181211_create_agreement_proposals_table.sql, com os remapeamentos de
// 20260513203613_align_proposal_companies_with_supplier_credits.sql aplicados e
// as propostas PRP geradas por 20260504175520_link_proposals_to_agreements_by_cnpj.sql.
function agreementProposals(): Row[] {
  const rows: Array<[string, string, string, string, string, number, number, number, string, number, number]> = [
    // [code, origin_company, origin_cnpj, title, message, total_original, total_discount, invoices_count, status, sentDaysAgo, deadlineOffsetDays]
    ['REV-428', 'Tecidos & Confecções ABC', '12.131.415/0001-66', 'Bônus de volume Q1',
      'Acordo referente ao bônus de volume do último trimestre. Por favor, revisar e aprovar.',
      100000, 35000, 3, 'pending', 2, 5],
    ['REV-429', 'Construtora Horizonte Ltda', '20.212.223/0001-44', 'Renegociação NF em atraso',
      'Proposta de abatimento para regularização de notas em aberto há mais de 60 dias.',
      84500, 18000, 4, 'pending', 4, 3],
    ['REV-430', 'Transportes Zeta Ltda', '33.444.555/0001-66', 'Ajuste por avaria parcial',
      'Abatimento referente a avarias identificadas no recebimento das mercadorias.',
      42300, 6800, 2, 'pending', 1, 6],
    ['REV-425', 'Alimentos Primavera Ltda', '44.555.666/0001-77', 'Reembolso campanha sazonal',
      'Acordo de devolução parcial referente à campanha sazonal de inverno.',
      58000, 9500, 3, 'approved', 12, -4],
    ['REV-422', 'Papelaria Central Ltda', '88.999.000/0001-11', 'Desconto fora de política',
      'Desconto sugerido que excede a política comercial vigente — ajuste solicitado.',
      71000, 28000, 5, 'refused', 18, -10],
    ['REV-418', 'Metalúrgica Órion S.A.', '66.777.888/0001-99', 'Bonificação trimestral',
      'Bonificação trimestral conforme contrato vigente.',
      33000, 4200, 2, 'expired', 32, -20],
    ['PRP-01EB93', 'Distribuidora Nacional Ltda', '77.888.999/0001-22', 'Proposta de abatimento - AC-2026-002',
      'Proposta gerada automaticamente a partir do acordo AC-2026-002. Revise os abatimentos sugeridos.',
      280000, 33600, 3, 'pending', 2, 12],
    ['PRP-7D4307', 'Indústria Sigma Ltda', '22.333.444/0001-55', 'Proposta de abatimento - AC-2026-003',
      'Proposta gerada automaticamente a partir do acordo AC-2026-003. Revise os abatimentos sugeridos.',
      620000, 74400, 3, 'pending', 2, 12],
    ['PRP-D19FD2', 'Fornecedor Beta Comércio', '55.666.777/0001-88', 'Proposta de abatimento - AC-2026-004',
      'Proposta gerada automaticamente a partir do acordo AC-2026-004. Revise os abatimentos sugeridos.',
      890000, 106800, 3, 'pending', 2, 12],
    ['PRP-63F7F3', 'Fornecedor Delta S.A.', '98.765.432/0001-10', 'Proposta de abatimento - AC-2026-005',
      'Proposta gerada automaticamente a partir do acordo AC-2026-005. Revise os abatimentos sugeridos.',
      320000, 38400, 3, 'pending', 2, 12],
  ];

  return rows.map(([code, origin_company, origin_cnpj, title, message, total_original, total_discount, invoices_count, status, sentDaysAgo, deadlineOffset]) => ({
    id: seedId(),
    code,
    origin_company,
    origin_cnpj,
    title,
    message,
    total_original,
    total_discount,
    invoices_count,
    status,
    sent_at: daysAgo(sentDaysAgo),
    deadline: deadlineOffset >= 0 ? daysFromNow(deadlineOffset) : daysAgo(-deadlineOffset),
    created_at: daysAgo(sentDaysAgo),
  }));
}

// 20260506182322_create_payment_reconciliation_report.sql + extensões
// (20260507135929 e 20260507143022), com os UPDATEs enterprise pré-aplicados.
function paymentReconciliation(): Row[] {
  interface Base {
    nf: string; dup: string; oName: string; oCnpj: string; nName: string; nCnpj: string;
    reg: string | null; amount: number; due: string; settle: string | null; status: string;
    errorReason?: string | null; errorCode?: string | null; errorSuggestion?: string | null;
    oBank?: string; oAg?: string; oAcc?: string; nBank?: string; nAg?: string; nAcc?: string;
    regId?: string | null; issue?: string;
  }

  const base: Base[] = [
    { nf: '000124578', dup: 'DUP-24578-01', oName: 'Banco Itaú S.A.', oCnpj: '60.701.190/0001-04', nName: 'Banco Bradesco S.A.', nCnpj: '60.746.948/0001-12', reg: 'CERC', amount: 18450.0, due: '2026-05-20', settle: '2026-05-20', status: 'liquidado' },
    { nf: '000124578', dup: 'DUP-24578-02', oName: 'Banco Itaú S.A.', oCnpj: '60.701.190/0001-04', nName: 'Banco Bradesco S.A.', nCnpj: '60.746.948/0001-12', reg: 'CERC', amount: 18450.0, due: '2026-06-20', settle: null, status: 'pendente' },
    { nf: '000125004', dup: 'DUP-25004-01', oName: 'Banco Santander Brasil', oCnpj: '90.400.888/0001-42', nName: 'Banco Safra S.A.', nCnpj: '58.160.789/0001-28', reg: 'TAG', amount: 42800.0, due: '2026-05-15', settle: '2026-05-15', status: 'liquidado' },
    { nf: '000125130', dup: 'DUP-25130-01', oName: 'Banco do Brasil S.A.', oCnpj: '00.000.000/0001-91', nName: 'Banco BTG Pactual', nCnpj: '30.306.294/0001-45', reg: null, amount: 9720.5, due: '2026-05-12', settle: '2026-05-12', status: 'liquidado' },
    { nf: '000125300', dup: 'DUP-25300-01', oName: 'Banco Bradesco S.A.', oCnpj: '60.746.948/0001-12', nName: 'Banco Itaú S.A.', nCnpj: '60.701.190/0001-04', reg: 'CERC', amount: 31250.0, due: '2026-05-28', settle: null, status: 'em_transito' },
    { nf: '000125412', dup: 'DUP-25412-01', oName: 'Caixa Econômica Federal', oCnpj: '00.360.305/0001-04', nName: 'Banco Inter S.A.', nCnpj: '00.416.968/0001-01', reg: null, amount: 5480.75, due: '2026-05-10', settle: '2026-05-10', status: 'liquidado' },
    { nf: '000125580', dup: 'DUP-25580-01', oName: 'Banco Safra S.A.', oCnpj: '58.160.789/0001-28', nName: 'Banco Santander Brasil', nCnpj: '90.400.888/0001-42', reg: 'TAG', amount: 67320.0, due: '2026-06-05', settle: null, status: 'pendente' },
    { nf: '000125631', dup: 'DUP-25631-01', oName: 'Banco BTG Pactual', oCnpj: '30.306.294/0001-45', nName: 'Banco Bradesco S.A.', nCnpj: '60.746.948/0001-12', reg: 'CERC', amount: 22100.0, due: '2026-05-25', settle: '2026-05-25', status: 'liquidado' },
    { nf: '000125700', dup: 'DUP-25700-01', oName: 'Banco Itaú S.A.', oCnpj: '60.701.190/0001-04', nName: 'Banco do Brasil S.A.', nCnpj: '00.000.000/0001-91', reg: null, amount: 14870.0, due: '2026-05-18', settle: '2026-05-18', status: 'liquidado' },
    { nf: '000125812', dup: 'DUP-25812-01', oName: 'Banco Inter S.A.', oCnpj: '00.416.968/0001-01', nName: 'Banco Safra S.A.', nCnpj: '58.160.789/0001-28', reg: 'TAG', amount: 8995.3, due: '2026-06-10', settle: null, status: 'em_transito' },
    { nf: '000126010', dup: 'DUP-26010-01', oName: 'Banco Itaú S.A.', oCnpj: '60.701.190/0001-04', nName: 'Banco Safra S.A.', nCnpj: '58.160.789/0001-28', reg: 'CERC', amount: 54210.0, due: '2026-05-22', settle: null, status: 'erro', errorReason: 'Divergência de CNPJ do recebedor na registradora CERC. O domicílio informado não está ativo para recebimento de duplicatas escriturais.', errorCode: 'REG-4281', errorSuggestion: 'Confirmar com o fornecedor o CNPJ ativo do novo domicílio bancário e reenviar o aditivo à CERC.' },
    { nf: '000126112', dup: 'DUP-26112-01', oName: 'Banco Bradesco S.A.', oCnpj: '60.746.948/0001-12', nName: 'Banco BTG Pactual', nCnpj: '30.306.294/0001-45', reg: 'TAG', amount: 12300.0, due: '2026-05-24', settle: null, status: 'erro', errorReason: 'Falha de comunicação com a TAG: timeout ao confirmar a vinculação do novo domicílio. Nova tentativa agendada.', errorCode: 'REG-4281', errorSuggestion: 'Confirmar com o fornecedor o CNPJ ativo do novo domicílio bancário e reenviar o aditivo à CERC.' },
    { nf: '000126230', dup: 'DUP-26230-01', oName: 'Banco do Brasil S.A.', oCnpj: '00.000.000/0001-91', nName: 'Banco Inter S.A.', nCnpj: '00.416.968/0001-01', reg: null, amount: 7890.5, due: '2026-05-26', settle: '2026-05-26', status: 'liquidado' },
    { nf: '000127001', dup: 'DUP-27001-01', oName: 'Banco Itaú S.A.', oCnpj: '60.701.190/0001-04', nName: 'Banco Bradesco S.A.', nCnpj: '60.746.948/0001-12', reg: 'CERC', amount: 22400.0, due: '2026-05-30', settle: null, status: 'falha_registradora', errorReason: 'Registro rejeitado pela CERC por inconsistência de lastro.', errorCode: 'CERC-9001', errorSuggestion: 'Ajustar o lastro na CERC informando a chave correta da nota fiscal e reenviar o registro em até 48h.', oBank: 'Banco Itaú', oAg: '0341', oAcc: '45678-9', nBank: 'Banco Bradesco', nAg: '0237', nAcc: '11223-4', regId: 'CERC-8A91F203', issue: '2026-04-10' },
    { nf: '000127118', dup: 'DUP-27118-01', oName: 'Banco Santander', oCnpj: '90.400.888/0001-42', nName: 'Banco Safra', nCnpj: '58.160.789/0001-28', reg: 'TAG', amount: 15750.5, due: '2026-06-02', settle: null, status: 'pendente', oBank: 'Santander', oAg: '0033', oAcc: '55401-2', nBank: 'Safra', nAg: '0422', nAcc: '77123-8', regId: 'TAG-5C4E1F08', issue: '2026-04-22' },
    { nf: '000127204', dup: 'DUP-27204-01', oName: 'Caixa Econômica Federal', oCnpj: '00.360.305/0001-04', nName: 'Banco Inter', nCnpj: '00.416.968/0001-01', reg: 'B3', amount: 48900.0, due: '2026-05-18', settle: null, status: 'erro', errorReason: 'Liquidação rejeitada pelo banco destino: conta encerrada.', errorCode: 'BCO-422-CONTA-ENC', errorSuggestion: 'Solicitar ao fornecedor atualização do domicílio bancário com conta ativa e iniciar novo fluxo de troca.', oBank: 'CEF', oAg: '0104', oAcc: '00321-7', nBank: 'Inter', nAg: '0001', nAcc: '99001-5', regId: 'B3-7F120983', issue: '2026-04-15' },
  ];

  function twoWords(name: string): string {
    const parts = name.split(' ');
    return `${parts[0]} ${parts[1] ?? ''}`.trim();
  }

  function issueFromDue(due: string): string {
    return new Date(new Date(`${due}T00:00:00Z`).getTime() - 30 * DAY).toISOString().slice(0, 10);
  }

  return base.map((r, index) => ({
    id: seedId(),
    nf_number: r.nf,
    duplicata_id: r.dup,
    original_recipient_name: r.oName,
    original_recipient_cnpj: r.oCnpj,
    new_recipient_name: r.nName,
    new_recipient_cnpj: r.nCnpj,
    registradora: r.reg,
    amount: r.amount,
    due_date: r.due,
    settlement_date: r.settle,
    status: r.status,
    error_reason: r.errorReason ?? null,
    error_code: r.errorCode ?? null,
    error_suggestion: r.errorSuggestion ?? null,
    original_bank_name: r.oBank ?? twoWords(r.oName),
    original_agency: r.oAg ?? '0001',
    original_account: r.oAcc ?? '12345-6',
    new_bank_name: r.nBank ?? twoWords(r.nName),
    new_agency: r.nAg ?? '0042',
    new_account: r.nAcc ?? '98765-4',
    gross_value: r.amount,
    net_value: Math.round(r.amount * 0.97 * 100) / 100,
    issue_date: r.issue ?? issueFromDue(r.due),
    registradora_id: r.regId ?? (r.reg ? `${r.reg.toUpperCase()}-SEED${index.toString(16).padStart(4, '0')}` : null),
    created_at: daysAgo(20),
  }));
}

export function buildSeedTables(): Record<string, Row[]> {
  uuidCounter = 0;
  return {
    commercial_agreements: commercialAgreements(),
    supplier_credits: supplierCredits(),
    eligible_invoices: eligibleInvoices(),
    agreement_proposals: agreementProposals(),
    payment_reconciliation: paymentReconciliation(),
    // Tabelas transacionais: começam vazias e são preenchidas pelo uso.
    agreement_proposal_responses: [],
    agreement_proposal_contestations: [],
    agreement_documents: [],
    credit_invoice_allocations: [],
    proposal_credit_links: [],
    proposal_credit_link_contestations: [],
    credit_link_resolutions: [],
    proposal_channel_events: [],
    supplier_portal_credit_allocations: [],
    supplier_portal_payments: [],
    notas_fiscais: [],
    pagamentos_creditos: [],
    historico_movimentacoes: [],
    duplicata_acceptance_log: [],
    user_profile: [],
    company: [],
    company_settings: [],
  };
}
