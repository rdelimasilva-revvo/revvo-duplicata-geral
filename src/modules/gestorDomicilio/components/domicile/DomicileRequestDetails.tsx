import { useState } from 'react';
import { 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User, 
  Shield,
  ArrowLeft,
  MessageSquare,
  Download,
  Upload
} from 'lucide-react';
import { Modal } from '@/modules/gestorDomicilio/components/ui/Modal';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';
import { DomicileChangeRequest, Comment } from '@/modules/gestorDomicilio/types/domicile';

interface DomicileRequestDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  request: DomicileChangeRequest;
  onUpdate: (request: DomicileChangeRequest) => void;
}

export function DomicileRequestDetails({ 
  isOpen, 
  onClose, 
  request, 
  onUpdate 
}: DomicileRequestDetailsProps) {
  const [newComment, setNewComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedRequest: DomicileChangeRequest = {
      ...request,
      status: 'approved',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Sistema - Aprovação Automática',
      comments: [
        ...request.comments,
        {
          id: `c${Date.now()}`,
          author: 'Sistema',
          role: 'Automático',
          message: 'Solicitação aprovada automaticamente após validação de documentos.',
          timestamp: new Date().toISOString(),
          type: 'approval'
        }
      ]
    };
    
    onUpdate(updatedRequest);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!newComment.trim()) {
      alert('Motivo da rejeição é obrigatório');
      return;
    }
    
    setIsProcessing(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const updatedRequest: DomicileChangeRequest = {
      ...request,
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Analista - Revisão Manual',
      comments: [
        ...request.comments,
        {
          id: `c${Date.now()}`,
          author: 'Analista',
          role: 'Revisor',
          message: newComment,
          timestamp: new Date().toISOString(),
          type: 'rejection'
        }
      ]
    };
    
    onUpdate(updatedRequest);
    setNewComment('');
    setIsProcessing(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const updatedRequest: DomicileChangeRequest = {
      ...request,
      comments: [
        ...request.comments,
        {
          id: `c${Date.now()}`,
          author: 'Usuário Atual',
          role: 'Analista',
          message: newComment,
          timestamp: new Date().toISOString(),
          type: 'comment'
        }
      ]
    };
    
    onUpdate(updatedRequest);
    setNewComment('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'requires_exception':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'under_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[1000px]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="secondary" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Detalhes da Solicitação</h2>
              <p className="text-sm text-gray-600">{request.id}</p>
            </div>
          </div>
        </div>

        {/* Status e Alertas */}
        <div className={`border rounded-lg p-4 mb-6 ${getStatusColor(request.status)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {request.status === 'approved' && <CheckCircle2 className="w-5 h-5" />}
              {request.status === 'rejected' && <AlertTriangle className="w-5 h-5" />}
              {request.status === 'requires_exception' && <Shield className="w-5 h-5" />}
              {(request.status === 'pending' || request.status === 'under_review') && <Clock className="w-5 h-5" />}
              <span className="font-medium">
                Status: {request.status === 'approved' ? 'Aprovado' : 
                        request.status === 'rejected' ? 'Rejeitado' :
                        request.status === 'requires_exception' ? 'Requer Exceção' :
                        request.status === 'under_review' ? 'Em Análise' : 'Pendente'}
              </span>
            </div>
            <div className="text-sm">
              <span>Nível: {request.approvalLevel}</span>
              <span className="ml-4">Risco: {request.riskScore.toUpperCase()}</span>
            </div>
          </div>
          {request.exceptionReason && (
            <p className="mt-2 text-sm">
              <strong>Motivo da Exceção:</strong> {request.exceptionReason}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Informações do Sacador */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Informações do Sacador
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{request.sacador.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{request.sacador.cnpj}</p>
                </div>
                <div>
                  <span className="text-gray-600">Endereço:</span>
                  <p className="font-medium">{request.sacador.currentAddress}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-medium">
                    {request.isNewSupplier ? 'Novo Fornecedor' : 'Fornecedor Existente'}
                  </p>
                </div>
              </div>
            </div>

            {/* Domicílio Atual */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3">Domicílio Atual</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Banco:</span>
                  <p className="font-medium">{request.currentDomicile.bank}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agência:</span>
                  <p className="font-medium">{request.currentDomicile.agency}</p>
                </div>
                <div>
                  <span className="text-gray-600">Conta:</span>
                  <p className="font-medium">{request.currentDomicile.account}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-medium">
                    {request.currentDomicile.type === 'checking' ? 'Conta Corrente' : 'Poupança'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Novo Domicílio e Documentação */}
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium mb-3 text-blue-800">Novo Domicílio Solicitado</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Banco:</span>
                  <p className="font-medium">{request.newDomicile.bank}</p>
                </div>
                <div>
                  <span className="text-gray-600">Agência:</span>
                  <p className="font-medium">{request.newDomicile.agency}</p>
                </div>
                <div>
                  <span className="text-gray-600">Conta:</span>
                  <p className="font-medium">{request.newDomicile.account}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-medium">
                    {request.newDomicile.type === 'checking' ? 'Conta Corrente' : 'Poupança'}
                  </p>
                </div>
                {request.newDomicile.pixKey && (
                  <div>
                    <span className="text-gray-600">Chave PIX:</span>
                    <p className="font-medium">{request.newDomicile.pixKey}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Documentação */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documentação
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {request.documentation.bankStatement ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>Extrato Bancário</span>
                </div>
                <div className="flex items-center gap-2">
                  {request.documentation.signatureCard ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>Cartão de Assinatura</span>
                </div>
                <div className="flex items-center gap-2">
                  {request.documentation.cnpjCertificate ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  )}
                  <span>Certidão CNPJ</span>
                </div>
                {request.documentation.additionalDocs.length > 0 && (
                  <div>
                    <span className="text-gray-600">Documentos Adicionais:</span>
                    <ul className="mt-1 ml-4">
                      {request.documentation.additionalDocs.map((doc, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Motivo */}
        <div className="bg-gray-50 rounded-lg p-4 my-6">
          <h3 className="font-medium mb-2">Motivo da Solicitação</h3>
          <p className="text-sm text-gray-700">{request.reason}</p>
        </div>

        {/* Histórico de Comentários */}
        <div className="bg-white border rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Histórico de Comentários
          </h3>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {request.comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.author}</span>
                  <span className="text-xs text-gray-500">({comment.role})</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString('pt-BR')}
                  </span>
                  {comment.type === 'approval' && (
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                  )}
                  {comment.type === 'rejection' && (
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  )}
                  {comment.type === 'exception' && (
                    <Shield className="w-3 h-3 text-orange-600" />
                  )}
                </div>
                <p className="text-sm text-gray-700">{comment.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Adicionar Comentário */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Adicionar Comentário</h3>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Digite seu comentário..."
            className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button variant="secondary" size="sm" onClick={handleAddComment}>
              Adicionar Comentário
            </Button>
          </div>
        </div>

        {/* Ações */}
        {(request.status === 'pending' || request.status === 'under_review' || request.status === 'requires_exception') && (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button
              variant="secondary"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Rejeitar'}
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Aprovar'}
            </Button>
          </div>
        )}

        {request.status === 'approved' && (
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}