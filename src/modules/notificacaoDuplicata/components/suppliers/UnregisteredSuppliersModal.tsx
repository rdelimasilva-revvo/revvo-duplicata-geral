import { useState } from 'react';
import { 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  ArrowLeft,
  MessageSquare,
  Upload,
  Eye,
  UserCheck
} from 'lucide-react';
import { Modal } from '@/modules/notificacaoDuplicata/components/ui/Modal';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';
import { UnregisteredSupplier, SupplierRegistrationRequest } from '@/modules/notificacaoDuplicata/types/supplier';
import { mockUnregisteredSuppliers, mockRegistrationRequests } from '@/modules/notificacaoDuplicata/data/mockUnregisteredSuppliers';
import { formatCurrency } from '@/modules/notificacaoDuplicata/utils/format';

interface UnregisteredSuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UnregisteredSuppliersModal({ isOpen, onClose }: UnregisteredSuppliersModalProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<UnregisteredSupplier | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [suppliers, setSuppliers] = useState<UnregisteredSupplier[]>(mockUnregisteredSuppliers);
  const [registrationRequests, setRegistrationRequests] = useState<SupplierRegistrationRequest[]>(mockRegistrationRequests);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_registration':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'in_registration':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'documents_pending':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_registration':
        return 'Pendente de Cadastro';
      case 'in_registration':
        return 'Em Cadastramento';
      case 'documents_pending':
        return 'Documentos Pendentes';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskLabel = (risk: string) => {
    const labels: Record<string, string> = { low: 'BAIXO', medium: 'MÉDIO', high: 'ALTO' };
    return labels[risk] ?? risk.toUpperCase();
  };

  const handleStartRegistration = (supplier: UnregisteredSupplier) => {
    // Atualizar status do fornecedor
    setSuppliers(prev => prev.map(s => 
      s.id === supplier.id 
        ? { ...s, status: 'in_registration', submittedAt: new Date().toISOString() }
        : s
    ));
    
    // Criar nova solicitação de cadastro
    const newRequest: SupplierRegistrationRequest = {
      id: `REG-${Date.now()}`,
      supplierId: supplier.id,
      requestType: 'new_registration',
      submittedBy: 'Usuário Atual',
      submittedAt: new Date().toISOString(),
      status: 'pending',
      approvalLevel: supplier.riskLevel === 'high' ? 'manager' : 'analyst',
      documents: {
        cnpjCertificate: { uploaded: false, validated: false },
        bankStatement: { uploaded: false, validated: false, months: 0 },
        signatureCard: { uploaded: false, validated: false },
        contractualDocument: { uploaded: false, validated: false, type: '' },
        additionalDocs: supplier.requiredDocuments.additionalDocs.map(doc => ({
          name: doc,
          uploaded: false,
          validated: false
        }))
      },
      validationResults: {
        cnpjValid: false,
        bankDataValid: false,
        creditCheckPassed: false,
        complianceCheckPassed: false,
        riskScore: 0
      },
      comments: [
        {
          id: `c${Date.now()}`,
          author: 'Sistema',
          role: 'Automático',
          message: 'Processo de cadastramento iniciado.',
          timestamp: new Date().toISOString(),
          type: 'comment'
        }
      ]
    };
    
    setRegistrationRequests(prev => [newRequest, ...prev]);
    setSelectedSupplier({ ...supplier, status: 'in_registration' });
  };

  if (selectedSupplier) {
    return (
      <Modal isOpen={isOpen} onClose={() => setSelectedSupplier(null)} maxWidth="max-w-[1000px]">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="secondary" size="sm" onClick={() => setSelectedSupplier(null)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold">Detalhes do Fornecedor</h2>
                <p className="text-sm text-gray-600">{selectedSupplier.id}</p>
              </div>
            </div>
          </div>

          {/* Status e Alertas */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(selectedSupplier.status)}
                <span className="font-medium">{getStatusText(selectedSupplier.status)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedSupplier.riskLevel)}`}>
                  Risco: {getRiskLabel(selectedSupplier.riskLevel)}
                </span>
                <span className="text-sm text-gray-600">
                  Tentativas: {selectedSupplier.registrationAttempts}
                </span>
              </div>
            </div>
            
            {selectedSupplier.riskLevel === 'high' && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Alto Risco Identificado</p>
                    <p>Este fornecedor requer aprovação gerencial e análise detalhada.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Informações do Fornecedor */}
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-4">Informações Básicas</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{selectedSupplier.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedSupplier.cnpj}</p>
                  </div>
                  {selectedSupplier.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{selectedSupplier.email}</span>
                    </div>
                  )}
                  {selectedSupplier.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{selectedSupplier.phone}</span>
                    </div>
                  )}
                  {selectedSupplier.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span>{selectedSupplier.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estatísticas de Duplicatas */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Histórico de Duplicatas
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Quantidade:</span>
                    <p className="font-medium text-lg">{selectedSupplier.billsCount}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Valor Total:</span>
                    <p className="font-medium text-lg text-green-600">
                      {formatCurrency(selectedSupplier.totalAmount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Primeira Duplicata:</span>
                    <p className="font-medium">
                      {new Date(selectedSupplier.firstBillDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Última Duplicata:</span>
                    <p className="font-medium">
                      {new Date(selectedSupplier.lastBillDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentação e Processo */}
            <div className="space-y-6">
              {/* Status da Documentação */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Status da Documentação
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Certidão CNPJ</span>
                    {selectedSupplier.requiredDocuments.cnpjCertificate ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Extrato Bancário</span>
                    {selectedSupplier.requiredDocuments.bankStatement ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cartão de Assinatura</span>
                    {selectedSupplier.requiredDocuments.signatureCard ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Documento Contratual</span>
                    {selectedSupplier.requiredDocuments.contractualDocument ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-orange-600" />
                    )}
                  </div>
                  
                  {selectedSupplier.requiredDocuments.additionalDocs.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <span className="text-gray-600 text-xs">Documentos Adicionais:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedSupplier.requiredDocuments.additionalDocs.map((doc, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-orange-600" />
                            <span className="text-xs">{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Analista Responsável */}
              {selectedSupplier.assignedAnalyst && (
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Analista Responsável</h3>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{selectedSupplier.assignedAnalyst}</span>
                  </div>
                  {selectedSupplier.lastContactDate && (
                    <p className="text-sm text-gray-600 mt-2">
                      Último contato: {new Date(selectedSupplier.lastContactDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              )}

              {/* Notas e Observações */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Notas e Observações
                </h3>
                <div className="space-y-2">
                  {selectedSupplier.notes.map((note, index) => (
                    <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setSelectedSupplier(null)}>
              Voltar
            </Button>
            {selectedSupplier.status === 'pending_registration' && (
              <Button 
                variant="primary" 
                onClick={() => handleStartRegistration(selectedSupplier)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Iniciar Cadastramento
              </Button>
            )}
            {selectedSupplier.status === 'in_registration' && (
              <Button variant="primary" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Enviar Documentos
              </Button>
            )}
            {selectedSupplier.status === 'documents_pending' && (
              <Button variant="primary" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Revisar Documentos
              </Button>
            )}
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1200px]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <UserPlus className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Gestão de Fornecedores Não Cadastrados</h2>
              <p className="text-sm text-gray-600 mt-1">
                Fornecedores que enviaram duplicatas mas não possuem cadastro ativo
              </p>
            </div>
          </div>
        </div>

        {/* Alertas de Processo */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-2">Processo de Cadastramento</p>
              <ul className="text-amber-700 space-y-1">
                <li>• <strong>Validação obrigatória</strong> de documentos e dados bancários</li>
                <li>• <strong>Análise de risco</strong> automática baseada em histórico</li>
                <li>• <strong>Aprovação gerencial</strong> para fornecedores de alto risco</li>
                <li>• <strong>Prazo máximo</strong> de 5 dias úteis para conclusão</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">Pendentes</span>
            </div>
            <p className="text-2xl font-semibold">
              {suppliers.filter(s => s.status === 'pending_registration').length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Em Cadastramento</span>
            </div>
            <p className="text-2xl font-semibold">
              {suppliers.filter(s => s.status === 'in_registration').length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-600">Alto Risco</span>
            </div>
            <p className="text-2xl font-semibold">
              {suppliers.filter(s => s.riskLevel === 'high').length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Valor Total</span>
            </div>
            <p className="text-lg font-semibold">
              {formatCurrency(suppliers.reduce((sum, s) => sum + s.totalAmount, 0))}
            </p>
          </div>
        </div>

        {/* Lista de Fornecedores */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-medium">Fornecedores Não Cadastrados ({suppliers.length})</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Fornecedor</th>
                  <th className="px-4 py-3 text-left">CNPJ</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Risco</th>
                  <th className="px-4 py-3 text-left">Duplicatas</th>
                  <th className="px-4 py-3 text-left">Valor Total</th>
                  <th className="px-4 py-3 text-left">Analista</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-gray-500 text-xs">ID: {supplier.id}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm">{supplier.cnpj}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(supplier.status)}
                        <span>{getStatusText(supplier.status)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(supplier.riskLevel)}`}>
                        {getRiskLabel(supplier.riskLevel)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{supplier.billsCount}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(supplier.totalAmount)}</td>
                    <td className="px-4 py-3">{supplier.assignedAnalyst || '-'}</td>
                    <td className="px-4 py-3">
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => setSelectedSupplier(supplier)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Ver Detalhes
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  );
}