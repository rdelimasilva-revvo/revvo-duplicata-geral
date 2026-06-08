import { DomicileChangeRequest } from '@/modules/notificacaoDuplicata/types/domicile';

export const mockDomicileRequests: DomicileChangeRequest[] = [
  {
    id: 'DOM-2024-001',
    billId: '24907001',
    billIud: 'DM240907001BR2024',
    sacador: {
      name: 'Fornecedor ABC LTDA',
      cnpj: '12.345.678/0001-90',
      currentAddress: 'Rua das Flores, 123 - São Paulo/SP'
    },
    requestType: 'change_domicile',
    currentDomicile: {
      bank: 'Banco do Brasil',
      agency: '1234-5',
      account: '67890-1',
      type: 'checking'
    },
    newDomicile: {
      bank: 'Itaú Unibanco',
      agency: '0001',
      account: '12345-6',
      type: 'checking',
      pixKey: '12.345.678/0001-90'
    },
    reason: 'Mudança de instituição financeira principal da empresa',
    documentation: {
      bankStatement: true,
      signatureCard: true,
      cnpjCertificate: true,
      additionalDocs: ['Contrato Social Atualizado']
    },
    status: 'under_review',
    submittedAt: '2024-01-15T10:30:00Z',
    reviewedAt: '2024-01-16T14:20:00Z',
    reviewedBy: 'Maria Silva - Gerente',
    approvalLevel: 'manager',
    comments: [
      {
        id: 'c1',
        author: 'João Santos',
        role: 'Analista',
        message: 'Documentação completa. Fornecedor com histórico positivo.',
        timestamp: '2024-01-16T09:15:00Z',
        type: 'comment'
      }
    ],
    riskScore: 'low',
    isNewSupplier: false
  },
  {
    id: 'DOM-2024-002',
    billId: '22860009',
    billIud: 'DS228609BR2024',
    sacador: {
      name: 'Nova Empresa XYZ LTDA',
      cnpj: '98.765.432/0001-10',
      currentAddress: 'Av. Paulista, 1000 - São Paulo/SP'
    },
    requestType: 'new_supplier_registration',
    currentDomicile: {
      bank: 'N/A',
      agency: 'N/A',
      account: 'N/A',
      type: 'checking'
    },
    newDomicile: {
      bank: 'Bradesco',
      agency: '7890',
      account: '12345-7',
      type: 'checking',
      pixKey: 'contato@novaxyz.com.br'
    },
    reason: 'Primeiro cadastro de fornecedor - empresa recém constituída',
    documentation: {
      bankStatement: true,
      signatureCard: false,
      cnpjCertificate: true,
      additionalDocs: ['Contrato Social', 'Inscrição Estadual', 'Referências Comerciais']
    },
    status: 'requires_exception',
    submittedAt: '2024-01-14T16:45:00Z',
    approvalLevel: 'exception',
    exceptionReason: 'Fornecedor não cadastrado + documentação incompleta',
    comments: [
      {
        id: 'c2',
        author: 'Ana Costa',
        role: 'Analista Senior',
        message: 'Empresa nova, sem histórico. Necessária aprovação excepcional.',
        timestamp: '2024-01-15T11:30:00Z',
        type: 'exception'
      }
    ],
    riskScore: 'high',
    isNewSupplier: true
  },
  {
    id: 'DOM-2024-003',
    billId: '11383001',
    billIud: 'DM113831BR2024',
    sacador: {
      name: 'Indústria 123 LTDA',
      cnpj: '11.222.333/0001-44',
      currentAddress: 'Rua Industrial, 456 - Guarulhos/SP'
    },
    requestType: 'change_domicile',
    currentDomicile: {
      bank: 'Itaú',
      agency: '0001',
      account: '12345-6',
      type: 'checking'
    },
    newDomicile: {
      bank: 'Santander',
      agency: '3456',
      account: '78901-2',
      type: 'checking'
    },
    reason: 'Melhores condições bancárias oferecidas',
    documentation: {
      bankStatement: true,
      signatureCard: true,
      cnpjCertificate: true,
      additionalDocs: []
    },
    status: 'approved',
    submittedAt: '2024-01-10T08:20:00Z',
    reviewedAt: '2024-01-12T16:45:00Z',
    reviewedBy: 'Carlos Mendes - Diretor',
    approvalLevel: 'automatic',
    comments: [
      {
        id: 'c3',
        author: 'Sistema',
        role: 'Automático',
        message: 'Aprovação automática - fornecedor categoria A, documentação completa.',
        timestamp: '2024-01-12T16:45:00Z',
        type: 'approval'
      }
    ],
    riskScore: 'low',
    isNewSupplier: false
  }
];