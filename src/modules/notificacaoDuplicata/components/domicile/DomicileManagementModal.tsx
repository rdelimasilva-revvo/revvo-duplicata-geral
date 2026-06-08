import { useState } from 'react';
import { Building2, AlertTriangle, CheckCircle2, Clock, FileText, User, Shield } from 'lucide-react';
import { Modal } from '@/modules/notificacaoDuplicata/components/ui/Modal';
import { Button } from '@/modules/notificacaoDuplicata/components/ui/Button';
import { DomicileChangeRequest } from '@/modules/notificacaoDuplicata/types/domicile';
import { mockDomicileRequests } from '@/modules/notificacaoDuplicata/data/mockDomicileRequests';
import { DomicileRequestDetails } from '@/modules/notificacaoDuplicata/components/domicile/DomicileRequestDetails';
import { NewDomicileRequestForm } from '@/modules/notificacaoDuplicata/components/domicile/NewDomicileRequestForm';

interface DomicileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DomicileManagementModal({ isOpen, onClose }: DomicileManagementModalProps) {
  const [selectedRequest, setSelectedRequest] = useState<DomicileChangeRequest | null>(null);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [requests, setRequests] = useState<DomicileChangeRequest[]>(mockDomicileRequests);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'requires_exception':
        return <Shield className="w-4 h-4 text-orange-600" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'under_review':
        return 'Em Análise';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'requires_exception':
        return 'Requer Exceção';
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

  const getApprovalLevelLabel = (level: string) => {
    const labels: Record<string, string> = { manager: 'Gerente', automatic: 'Automático', exception: 'Exceção', director: 'Diretor', analyst: 'Analista' };
    return labels[level] ?? level;
  };

  const handleNewRequest = (request: DomicileChangeRequest) => {
    setRequests(prev => [request, ...prev]);
    setShowNewRequestForm(false);
  };

  if (selectedRequest) {
    return (
      <DomicileRequestDetails
        isOpen={isOpen}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onUpdate={(updatedRequest) => {
          setRequests(prev => prev.map(r => r.id === updatedRequest.id ? updatedRequest : r));
          setSelectedRequest(updatedRequest);
        }}
      />
    );
  }

  if (showNewRequestForm) {
    return (
      <NewDomicileRequestForm
        isOpen={isOpen}
        onClose={() => setShowNewRequestForm(false)}
        onSubmit={handleNewRequest}
      />
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1200px]">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Gestão de Trocas de Domicílio</h2>
              <p className="text-sm text-gray-600 mt-1">
                Workflow de aprovação para mudanças de dados bancários e novos fornecedores
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowNewRequestForm(true)}>
            Nova Solicitação
          </Button>
        </div>

        {/* Alertas de Compliance */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-2">Controles de Compliance e Segurança</p>
              <ul className="text-amber-700 space-y-1">
                <li>• <strong>Validação obrigatória</strong> de documentos bancários e empresariais</li>
                <li>• <strong>Análise de risco</strong> automática para novos fornecedores</li>
                <li>• <strong>Workflow de aprovação</strong> baseado no nível de risco</li>
                <li>• <strong>Auditoria completa</strong> de todas as alterações</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">Pendentes</span>
            </div>
            <p className="text-2xl font-semibold">
              {requests.filter(r => r.status === 'pending' || r.status === 'under_review').length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-600">Exceções</span>
            </div>
            <p className="text-2xl font-semibold">
              {requests.filter(r => r.status === 'requires_exception').length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Novos Fornecedores</span>
            </div>
            <p className="text-2xl font-semibold">
              {requests.filter(r => r.isNewSupplier).length}
            </p>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Aprovados</span>
            </div>
            <p className="text-2xl font-semibold">
              {requests.filter(r => r.status === 'approved').length}
            </p>
          </div>
        </div>

        {/* Lista de Solicitações */}
        <div className="bg-white border rounded-lg">
          <div className="p-4 border-b">
            <h3 className="font-medium">Solicitações de Troca de Domicílio</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Sacador</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Risco</th>
                  <th className="px-4 py-3 text-left">Nível Aprovação</th>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-blue-600">{request.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{request.sacador.name}</p>
                        <p className="text-gray-500 text-xs">{request.sacador.cnpj}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {request.requestType === 'new_supplier_registration' ? (
                          <User className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Building2 className="w-4 h-4 text-blue-600" />
                        )}
                        <span>
                          {request.requestType === 'new_supplier_registration' 
                            ? 'Novo Fornecedor' 
                            : 'Troca Domicílio'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        <span>{getStatusText(request.status)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(request.riskScore)}`}>
                        {getRiskLabel(request.riskScore)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span>{getApprovalLevelLabel(request.approvalLevel)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(request.submittedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <Button 
                        variant="link" 
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
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