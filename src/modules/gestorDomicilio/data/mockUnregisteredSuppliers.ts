import { UnregisteredSupplier, SupplierRegistrationRequest } from '@/modules/gestorDomicilio/types/supplier';

export const mockUnregisteredSuppliers: UnregisteredSupplier[] = [
  {
    id: 'UNR-001',
    name: 'Empresa Nova Tecnologia LTDA',
    cnpj: '12.345.678/0001-90',
    email: 'contato@novatecnologia.com.br',
    phone: '(11) 99999-9999',
    address: 'Rua das Inovações, 123 - São Paulo/SP',
    billsCount: 5,
    totalAmount: 125000.00,
    firstBillDate: '2024-01-15',
    lastBillDate: '2024-01-20',
    status: 'pending_registration',
    riskLevel: 'medium',
    registrationAttempts: 1,
    assignedAnalyst: 'Ana Silva',
    notes: [
      'Empresa recém constituída',
      'Necessário validar documentação completa',
      'Primeiro contato realizado em 15/01/2024'
    ],
    requiredDocuments: {
      cnpjCertificate: false,
      bankStatement: false,
      signatureCard: false,
      contractualDocument: false,
      additionalDocs: ['Inscrição Estadual', 'Referências Comerciais']
    },
    lastContactDate: '2024-01-15'
  },
  {
    id: 'UNR-002',
    name: 'Distribuidora Regional Sul S.A.',
    cnpj: '98.765.432/0001-10',
    email: 'financeiro@regionalsul.com.br',
    phone: '(51) 88888-8888',
    address: 'Av. Regional, 456 - Porto Alegre/RS',
    billsCount: 12,
    totalAmount: 340000.00,
    firstBillDate: '2024-01-10',
    lastBillDate: '2024-01-25',
    status: 'in_registration',
    riskLevel: 'low',
    registrationAttempts: 2,
    assignedAnalyst: 'Carlos Mendes',
    notes: [
      'Empresa com bom histórico no mercado',
      'Documentação parcialmente enviada',
      'Aguardando cartão de assinatura atualizado'
    ],
    requiredDocuments: {
      cnpjCertificate: true,
      bankStatement: true,
      signatureCard: false,
      contractualDocument: true,
      additionalDocs: []
    },
    submittedAt: '2024-01-12',
    lastContactDate: '2024-01-22'
  },
  {
    id: 'UNR-003',
    name: 'Indústria Metalúrgica ABC EIRELI',
    cnpj: '11.222.333/0001-44',
    email: 'admin@metalurgicaabc.com.br',
    phone: '(19) 77777-7777',
    address: 'Distrito Industrial, 789 - Campinas/SP',
    billsCount: 8,
    totalAmount: 280000.00,
    firstBillDate: '2024-01-08',
    lastBillDate: '2024-01-18',
    status: 'documents_pending',
    riskLevel: 'high',
    registrationAttempts: 3,
    assignedAnalyst: 'Maria Santos',
    notes: [
      'Empresa com pendências fiscais identificadas',
      'Necessária análise de crédito detalhada',
      'Documentos enviados com inconsistências',
      'Solicitada regularização fiscal'
    ],
    requiredDocuments: {
      cnpjCertificate: true,
      bankStatement: false,
      signatureCard: true,
      contractualDocument: true,
      additionalDocs: ['Certidão Negativa de Débitos', 'Balanço Patrimonial']
    },
    submittedAt: '2024-01-10',
    lastContactDate: '2024-01-20'
  }
];

export const mockRegistrationRequests: SupplierRegistrationRequest[] = [
  {
    id: 'REG-001',
    supplierId: 'UNR-002',
    requestType: 'new_registration',
    submittedBy: 'Carlos Mendes',
    submittedAt: '2024-01-12T10:30:00Z',
    status: 'under_review',
    approvalLevel: 'analyst',
    documents: {
      cnpjCertificate: { uploaded: true, validated: true, expiryDate: '2024-12-31' },
      bankStatement: { uploaded: true, validated: true, months: 3 },
      signatureCard: { uploaded: false, validated: false },
      contractualDocument: { uploaded: true, validated: true, type: 'Contrato Social' },
      additionalDocs: []
    },
    validationResults: {
      cnpjValid: true,
      bankDataValid: true,
      creditCheckPassed: true,
      complianceCheckPassed: true,
      riskScore: 25
    },
    comments: [
      {
        id: 'c1',
        author: 'Carlos Mendes',
        role: 'Analista',
        message: 'Documentação inicial aprovada. Aguardando cartão de assinatura.',
        timestamp: '2024-01-15T14:20:00Z',
        type: 'comment'
      }
    ],
    reviewedBy: 'Carlos Mendes',
    reviewedAt: '2024-01-15T14:20:00Z'
  }
];