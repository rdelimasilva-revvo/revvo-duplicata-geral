import React, { useState, useCallback } from 'react';
import { X, ArrowRight, Save, Send, ToggleLeft, ToggleRight } from 'lucide-react';
import { Stepper } from '../components/Stepper';
import { FileUpload } from '../components/FileUpload';
import { SapSyncAnimation } from '../components/SapSyncAnimation';
import { DualList } from '../components/DualList';
import { useAgreementStore } from '../store';
import { useToast } from '@/context/ToastContext';
import { UploadedDocument, FormalizationData, AvailableClient, LinkedClient } from '../types';
import { availableClients, availableContracts } from '../mockData';
import { formatCurrency, generateId } from '../utils';

interface FormalizationWizardProps {
  agreementId?: string;
  onBack: () => void;
  onComplete: () => void;
}

const WIZARD_STEPS = [
  { label: 'Documentação', description: 'Upload de docs' },
  { label: 'Validação SAP', description: 'Sincronização' },
  { label: 'Formalização', description: 'Dados e vínculos' },
  { label: 'Revisão', description: 'Enviar ao fornecedor' },
];

export function FormalizationWizard({ agreementId, onBack, onComplete }: FormalizationWizardProps) {
  const { showToast } = useToast();
  const {
    getAgreement,
    addDocument,
    startSapSync,
    completeSapSync,
    setFormalizationData,
    linkContract,
    addLinkedClients,
    updateStatus,
    simulateInconsistency,
    setSimulateInconsistency,
  } = useAgreementStore();

  const agreement = agreementId ? getAgreement(agreementId) : undefined;

  const [step, setStep] = useState(0);
  const [documents, setDocuments] = useState<UploadedDocument[]>(agreement?.documents || []);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(
    agreement?.sapValidation?.status === 'completed'
  );
  const [syncError, setSyncError] = useState(
    agreement?.sapValidation?.status === 'error'
  );

  const [formData, setFormData] = useState<FormalizationData>(
    agreement?.formalizationData || {
      agreementNumber: agreement?.code || `FRM-${Date.now()}`,
      internalNotes: '',
      paymentTerms: '30/60/90 dias',
      interestRate: 1.5,
      penaltyRate: 2.0,
      gracePeriod: 5,
    }
  );

  const [selectedContract, setSelectedContract] = useState(agreement?.linkedContract || '');
  const [contractSearch, setContractSearch] = useState('');
  const [selectedClients, setSelectedClients] = useState<AvailableClient[]>(
    (agreement?.linkedClients || []).map((c) => ({
      id: c.id,
      name: c.name,
      cnpj: c.cnpj,
      segment: c.segment,
      city: '',
      state: '',
    }))
  );

  const [activeTab, setActiveTab] = useState<'formalize' | 'contract' | 'link' | 'clients'>('formalize');

  const handleDocUpload = useCallback(
    (doc: UploadedDocument) => {
      setDocuments((prev) => [...prev, doc]);
      if (agreementId) addDocument(agreementId, doc);
      showToast('success', 'Documento enviado', doc.name);
    },
    [agreementId, addDocument, showToast]
  );

  const handleStartSync = () => {
    setIsSyncing(true);
    if (agreementId) startSapSync(agreementId);
  };

  const handleSyncComplete = () => {
    if (agreementId) completeSapSync(agreementId);
    const updated = agreementId ? getAgreement(agreementId) : undefined;
    if (updated?.status === 'inconsistency') {
      setSyncError(true);
      setSyncComplete(false);
      showToast('error', 'Inconsistência detectada', 'Verifique os dados e tente novamente');
    } else {
      setSyncComplete(true);
      setSyncError(false);
      showToast('success', 'Sincronização concluída', 'Todos os dados foram validados');
    }
    setIsSyncing(false);
  };

  const handleSaveFormalization = () => {
    if (agreementId) {
      setFormalizationData(agreementId, formData);
      if (selectedContract) linkContract(agreementId, selectedContract);
      if (selectedClients.length > 0) {
        const linked: LinkedClient[] = selectedClients.map((c) => ({
          id: c.id,
          name: c.name,
          cnpj: c.cnpj,
          segment: c.segment,
          linkedAt: new Date().toISOString(),
        }));
        addLinkedClients(agreementId, linked);
      }
    }
    showToast('success', 'Dados salvos', 'Formalização atualizada com sucesso');
  };

  const handleSubmitToSupplier = () => {
    if (agreementId) {
      updateStatus(agreementId, 'pending_supplier_aceite');
    }
    showToast('success', 'Acordo enviado', 'Aguardando aceite do fornecedor');
    onComplete();
  };

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 0:
        return documents.length > 0;
      case 1:
        return syncComplete;
      case 2:
        return formData.agreementNumber && selectedContract && selectedClients.length > 0;
      default:
        return true;
    }
  };

  const filteredContracts = availableContracts.filter(
    (c) =>
      c.code.toLowerCase().includes(contractSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(contractSearch.toLowerCase())
  );

  const sapSteps = agreement?.sapValidation?.steps || [
    { id: 's1', label: 'Validar Dados Cadastrais', status: 'pending' as const, description: 'Verificação de CNPJ e dados do sacado' },
    { id: 's2', label: 'Validar Contrato', status: 'pending' as const, description: 'Análise de condições contratuais no SAP' },
    { id: 's3', label: 'Verificar Limites de Crédito', status: 'pending' as const, description: 'Consulta de limites disponíveis' },
    { id: 's4', label: 'Sincronizar Dados Financeiros', status: 'pending' as const, description: 'Integração de valores e prazos' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-gray-900">
            {agreementId ? `Formalização - ${agreement?.code}` : 'Novo Acordo Comercial'}
          </h1>
          <p className="text-sm text-gray-500">Siga as etapas para formalizar o acordo</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <Stepper steps={WIZARD_STEPS} currentStep={step} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 min-h-[400px]">
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Documentação do Sacado</h2>
              <p className="text-sm text-gray-500">
                Envie os documentos necessários para a formalização do acordo comercial
              </p>
            </div>
            <FileUpload documents={documents} onUpload={handleDocUpload} />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">
                  Integração SAP / Sankhya
                </h2>
                <p className="text-sm text-gray-500">
                  Validação automática dos dados contratuais no sistema de gestão
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                  <button
                    onClick={() => setSimulateInconsistency(!simulateInconsistency)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      simulateInconsistency ? 'bg-rose-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                        simulateInconsistency ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  Simular Inconsistência
                </label>
              </div>
            </div>

            {!isSyncing && !syncComplete && !syncError && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Send className="w-7 h-7 text-[#0070f2]" />
                </div>
                <p className="text-gray-600 mb-4">
                  Clique para iniciar a sincronização com SAP/Sankhya
                </p>
                <button
                  onClick={handleStartSync}
                  className="px-6 py-2.5 bg-[#0070f2] text-white text-sm font-medium rounded-lg hover:bg-[#005bc4] transition-colors"
                >
                  Iniciar Sincronização
                </button>
              </div>
            )}

            {isSyncing && (
              <SapSyncAnimation
                steps={sapSteps}
                onComplete={handleSyncComplete}
                isSimulating={true}
              />
            )}

            {syncComplete && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-emerald-700">Validação Concluída</p>
                <p className="text-sm text-gray-500 mt-1">Todos os dados foram validados com sucesso</p>
              </div>
            )}

            {syncError && (
              <div className="space-y-4">
                <SapSyncAnimation steps={sapSteps} onComplete={() => {}} />
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-rose-700">
                    Inconsistência detectada durante a validação
                  </p>
                  <p className="text-xs text-rose-600 mt-1">
                    Corrija os dados e reinicie o processo de sincronização
                  </p>
                  <button
                    onClick={() => {
                      setSyncError(false);
                      setIsSyncing(false);
                      setStep(0);
                    }}
                    className="mt-3 px-4 py-1.5 text-sm font-medium text-rose-700 border border-rose-300 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Voltar para Documentação
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Dados de Formalização e Vinculação
              </h2>
              <p className="text-sm text-gray-500">
                Preencha os dados do acordo, vincule contratos e clientes
              </p>
            </div>

            <div className="flex border-b border-gray-200">
              {[
                { key: 'formalize', label: 'Formalizar Acordo' },
                { key: 'contract', label: 'Cadastrar Contrato de Venda' },
                { key: 'link', label: 'Vincular Contrato' },
                { key: 'clients', label: 'Vincular Clientes' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
                    activeTab === tab.key
                      ? 'border-[#0070f2] text-[#0070f2]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'formalize' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Acordo
                  </label>
                  <input
                    type="text"
                    value={formData.agreementNumber}
                    onChange={(e) => setFormData({ ...formData, agreementNumber: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condições de Pagamento
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxa de Juros (% a.m.)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taxa de Multa (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.penaltyRate}
                    onChange={(e) => setFormData({ ...formData, penaltyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período de Carência (dias)
                  </label>
                  <input
                    type="number"
                    value={formData.gracePeriod}
                    onChange={(e) => setFormData({ ...formData, gracePeriod: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas
                  </label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Cadastre um novo contrato de venda para este acordo
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código do Contrato</label>
                    <input
                      type="text"
                      placeholder="Ex: CV-2026-0200"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]">
                      <option>Venda</option>
                      <option>Cessão</option>
                      <option>Fiança</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vigência</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                      rows={2}
                      placeholder="Descrição do contrato de venda..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2] resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => showToast('success', 'Contrato cadastrado', 'O contrato foi criado com sucesso')}
                  className="px-4 py-2 bg-[#0070f2] text-white text-sm font-medium rounded-lg hover:bg-[#005bc4] transition-colors"
                >
                  Cadastrar Contrato
                </button>
              </div>
            )}

            {activeTab === 'link' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Vincule um contrato existente ao acordo comercial
                </p>
                <div className="relative max-w-md">
                  <input
                    type="text"
                    placeholder="Buscar contrato por código ou descrição..."
                    value={contractSearch}
                    onChange={(e) => setContractSearch(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070f2]/20 focus:border-[#0070f2]"
                  />
                </div>
                <div className="space-y-2">
                  {filteredContracts.map((contract) => (
                    <div
                      key={contract.id}
                      onClick={() => setSelectedContract(contract.code)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedContract === contract.code
                          ? 'border-[#0070f2] bg-blue-50/50 ring-1 ring-[#0070f2]/30'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          <span className="font-mono text-[#0070f2]">{contract.code}</span>
                          {' - '}
                          {contract.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {contract.type} &middot; {formatCurrency(contract.value)} &middot; {contract.status}
                        </p>
                      </div>
                      {selectedContract === contract.code && (
                        <div className="w-5 h-5 rounded-full bg-[#0070f2] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'clients' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Selecione os clientes que serão vinculados a este acordo
                </p>
                <DualList
                  available={availableClients}
                  selected={selectedClients}
                  onSelectionChange={setSelectedClients}
                />
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleSaveFormalization}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Salvar Dados
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Revisão Final</h2>
              <p className="text-sm text-gray-500">
                Revise os dados antes de enviar ao fornecedor para aceite
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Dados do Acordo
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Número:</span>
                      <span className="font-medium text-gray-800">{formData.agreementNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Pagamento:</span>
                      <span className="font-medium text-gray-800">{formData.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Juros:</span>
                      <span className="font-medium text-gray-800">{formData.interestRate}% a.m.</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Multa:</span>
                      <span className="font-medium text-gray-800">{formData.penaltyRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Carência:</span>
                      <span className="font-medium text-gray-800">{formData.gracePeriod} dias</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Documentos ({documents.length})
                  </p>
                  {documents.map((d) => (
                    <p key={d.id} className="text-sm text-gray-700 truncate">
                      {d.name}
                    </p>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Contrato Vinculado
                  </p>
                  <p className="text-sm font-mono text-[#0070f2] font-medium">
                    {selectedContract || 'Nenhum contrato vinculado'}
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Clientes Vinculados ({selectedClients.length})
                  </p>
                  {selectedClients.length === 0 ? (
                    <p className="text-sm text-gray-400">Nenhum cliente vinculado</p>
                  ) : (
                    <div className="space-y-1.5">
                      {selectedClients.map((c) => (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{c.name}</span>
                          <span className="text-gray-400 text-xs">{c.cnpj}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => (step === 0 ? onBack() : setStep(step - 1))}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" />
          {step === 0 ? 'Cancelar' : 'Voltar'}
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed(step)}
            className="flex items-center gap-2 px-5 py-2 bg-[#0070f2] text-white text-sm font-medium rounded-lg hover:bg-[#005bc4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmitToSupplier}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar ao Fornecedor
          </button>
        )}
      </div>
    </div>
  );
}
