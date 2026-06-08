import { useState } from 'react';
import { Building2, Upload, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Modal } from '@/modules/gestorDomicilio/components/ui/Modal';
import { Button } from '@/modules/gestorDomicilio/components/ui/Button';
import { DomicileChangeRequest } from '@/modules/gestorDomicilio/types/domicile';

interface NewDomicileRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: DomicileChangeRequest) => void;
}

export function NewDomicileRequestForm({ isOpen, onClose, onSubmit }: NewDomicileRequestFormProps) {
  const [formData, setFormData] = useState({
    billIud: '',
    sacadorName: '',
    sacadorCnpj: '',
    sacadorAddress: '',
    requestType: 'change_domicile' as 'change_domicile' | 'new_supplier_registration',
    currentBank: '',
    currentAgency: '',
    currentAccount: '',
    currentType: 'checking' as 'checking' | 'savings',
    newBank: '',
    newAgency: '',
    newAccount: '',
    newType: 'checking' as 'checking' | 'savings',
    pixKey: '',
    reason: '',
    bankStatement: false,
    signatureCard: false,
    cnpjCertificate: false,
    additionalDocs: [] as string[]
  });

  const [newDoc, setNewDoc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.billIud || !formData.sacadorName || !formData.sacadorCnpj) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    // Calcular nível de risco
    const isNewSupplier = formData.requestType === 'new_supplier_registration';
    const hasAllDocs = formData.bankStatement && formData.signatureCard && formData.cnpjCertificate;
    
    let riskScore: 'low' | 'medium' | 'high' = 'low';
    let approvalLevel: 'automatic' | 'manager' | 'director' | 'exception' = 'automatic';
    let status: 'pending' | 'under_review' | 'requires_exception' = 'pending';

    if (isNewSupplier) {
      riskScore = 'high';
      approvalLevel = 'exception';
      status = 'requires_exception';
    } else if (!hasAllDocs) {
      riskScore = 'medium';
      approvalLevel = 'manager';
      status = 'under_review';
    }

    const newRequest: DomicileChangeRequest = {
      id: `DOM-2024-${String(Date.now()).slice(-3)}`,
      billId: formData.billIud.split('BR')[0],
      billIud: formData.billIud,
      sacador: {
        name: formData.sacadorName,
        cnpj: formData.sacadorCnpj,
        currentAddress: formData.sacadorAddress
      },
      requestType: formData.requestType,
      currentDomicile: {
        bank: formData.currentBank || 'N/A',
        agency: formData.currentAgency || 'N/A',
        account: formData.currentAccount || 'N/A',
        type: formData.currentType
      },
      newDomicile: {
        bank: formData.newBank,
        agency: formData.newAgency,
        account: formData.newAccount,
        type: formData.newType,
        pixKey: formData.pixKey || undefined
      },
      reason: formData.reason,
      documentation: {
        bankStatement: formData.bankStatement,
        signatureCard: formData.signatureCard,
        cnpjCertificate: formData.cnpjCertificate,
        additionalDocs: formData.additionalDocs
      },
      status,
      submittedAt: new Date().toISOString(),
      approvalLevel,
      exceptionReason: isNewSupplier ? 'Novo fornecedor requer aprovação excepcional' : undefined,
      comments: [],
      riskScore,
      isNewSupplier
    };

    onSubmit(newRequest);
  };

  const addDocument = () => {
    if (newDoc.trim()) {
      setFormData(prev => ({
        ...prev,
        additionalDocs: [...prev.additionalDocs, newDoc.trim()]
      }));
      setNewDoc('');
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalDocs: prev.additionalDocs.filter((_, i) => i !== index)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[800px]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="secondary" size="sm" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Nova Solicitação de Troca de Domicílio</h2>
              <p className="text-sm text-gray-600">Preencha os dados para solicitar mudança de dados bancários</p>
            </div>
          </div>
        </div>

        {/* Alerta sobre Documentação */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Documentação Obrigatória</p>
              <p className="text-amber-700">
                Para aprovação automática, anexe: Extrato bancário, Cartão de assinatura e Certidão CNPJ atualizados.
                Novos fornecedores passam por análise excepcional.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Solicitação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Solicitação *
            </label>
            <select
              value={formData.requestType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                requestType: e.target.value as 'change_domicile' | 'new_supplier_registration'
              }))}
              className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="change_domicile">Troca de Domicílio</option>
              <option value="new_supplier_registration">Cadastro de Novo Fornecedor</option>
            </select>
          </div>

          {/* Informações da Duplicata */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                IUD da Duplicata *
              </label>
              <input
                type="text"
                value={formData.billIud}
                onChange={(e) => setFormData(prev => ({ ...prev, billIud: e.target.value }))}
                placeholder="Ex: DM240907001BR2024"
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Informações do Sacador */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-4">Informações do Sacador</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome/Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.sacadorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, sacadorName: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.sacadorCnpj}
                  onChange={(e) => setFormData(prev => ({ ...prev, sacadorCnpj: e.target.value }))}
                  placeholder="00.000.000/0000-00"
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço Completo
              </label>
              <input
                type="text"
                value={formData.sacadorAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, sacadorAddress: e.target.value }))}
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Domicílio Atual */}
          {formData.requestType === 'change_domicile' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-4">Domicílio Atual</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <input
                    type="text"
                    value={formData.currentBank}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentBank: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
                  <input
                    type="text"
                    value={formData.currentAgency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAgency: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                  <input
                    type="text"
                    value={formData.currentAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentAccount: e.target.value }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formData.currentType}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentType: e.target.value as 'checking' | 'savings' }))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Novo Domicílio */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium mb-4 text-blue-800">Novo Domicílio</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Banco *</label>
                <input
                  type="text"
                  value={formData.newBank}
                  onChange={(e) => setFormData(prev => ({ ...prev, newBank: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agência *</label>
                <input
                  type="text"
                  value={formData.newAgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, newAgency: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conta *</label>
                <input
                  type="text"
                  value={formData.newAccount}
                  onChange={(e) => setFormData(prev => ({ ...prev, newAccount: e.target.value }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select
                  value={formData.newType}
                  onChange={(e) => setFormData(prev => ({ ...prev, newType: e.target.value as 'checking' | 'savings' }))}
                  className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX (opcional)</label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                placeholder="CNPJ, e-mail ou chave aleatória"
                className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo da Solicitação *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Descreva o motivo da mudança de domicílio..."
              className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* Documentação */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-4">Documentação</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.bankStatement}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankStatement: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Extrato Bancário (últimos 3 meses)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.signatureCard}
                  onChange={(e) => setFormData(prev => ({ ...prev, signatureCard: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Cartão de Assinatura</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.cnpjCertificate}
                  onChange={(e) => setFormData(prev => ({ ...prev, cnpjCertificate: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Certidão CNPJ Atualizada</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documentos Adicionais
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newDoc}
                  onChange={(e) => setNewDoc(e.target.value)}
                  placeholder="Nome do documento"
                  className="flex-1 h-8 px-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <Button type="button" variant="secondary" size="sm" onClick={addDocument}>
                  Adicionar
                </Button>
              </div>
              {formData.additionalDocs.length > 0 && (
                <div className="space-y-1">
                  {formData.additionalDocs.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-sm">{doc}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}