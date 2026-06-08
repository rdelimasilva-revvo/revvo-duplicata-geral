import { create } from 'zustand';
import { Agreement, AgreementStatus, UserRole, LinkedClient, UploadedDocument, FormalizationData, SupplierResponse } from './types';
import { mockAgreements } from './mockData';

interface AgreementStore {
  agreements: Agreement[];
  currentRole: UserRole;
  selectedAgreementId: string | null;
  wizardStep: number;
  simulateInconsistency: boolean;

  setRole: (role: UserRole) => void;
  selectAgreement: (id: string | null) => void;
  setWizardStep: (step: number) => void;
  setSimulateInconsistency: (value: boolean) => void;

  updateStatus: (id: string, status: AgreementStatus) => void;
  addDocument: (id: string, doc: UploadedDocument) => void;
  setFormalizationData: (id: string, data: FormalizationData) => void;
  linkContract: (id: string, contractCode: string) => void;
  addLinkedClients: (id: string, clients: LinkedClient[]) => void;
  removeLinkedClient: (agreementId: string, clientId: string) => void;
  setSupplierResponse: (id: string, response: SupplierResponse) => void;
  completeSignature: (agreementId: string, signatureId: string) => void;
  startSapSync: (id: string) => void;
  completeSapSync: (id: string) => void;

  getAgreement: (id: string) => Agreement | undefined;
  getSupplierAgreements: (supplierCnpj: string) => Agreement[];
}

export const useAgreementStore = create<AgreementStore>((set, get) => ({
  agreements: mockAgreements,
  currentRole: 'internal',
  selectedAgreementId: null,
  wizardStep: 0,
  simulateInconsistency: false,

  setRole: (role) => set({ currentRole: role }),
  selectAgreement: (id) => set({ selectedAgreementId: id }),
  setWizardStep: (step) => set({ wizardStep: step }),
  setSimulateInconsistency: (value) => set({ simulateInconsistency: value }),

  updateStatus: (id, status) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
      ),
    })),

  addDocument: (id, doc) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === id ? { ...a, documents: [...a.documents, doc], updatedAt: new Date().toISOString() } : a
      ),
    })),

  setFormalizationData: (id, data) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === id ? { ...a, formalizationData: data, updatedAt: new Date().toISOString() } : a
      ),
    })),

  linkContract: (id, contractCode) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === id ? { ...a, linkedContract: contractCode, updatedAt: new Date().toISOString() } : a
      ),
    })),

  addLinkedClients: (id, clients) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === id
          ? { ...a, linkedClients: [...a.linkedClients, ...clients], updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  removeLinkedClient: (agreementId, clientId) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === agreementId
          ? { ...a, linkedClients: a.linkedClients.filter((c) => c.id !== clientId), updatedAt: new Date().toISOString() }
          : a
      ),
    })),

  setSupplierResponse: (id, response) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === id
          ? {
              ...a,
              supplierResponse: response,
              status: response.type === 'aceite' ? 'signature_pending' : 'rejected',
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  completeSignature: (agreementId, signatureId) =>
    set((state) => ({
      agreements: state.agreements.map((a) => {
        if (a.id !== agreementId) return a;
        const updatedSigs = a.signatures.map((s) =>
          s.id === signatureId
            ? { ...s, status: 'valid' as const, signedAt: new Date().toISOString(), certificateId: `CERT-A1-${Date.now()}` }
            : s
        );
        const allSigned = updatedSigs.every((s) => s.status === 'valid');
        return {
          ...a,
          signatures: updatedSigs,
          status: allSigned ? 'signed' : a.status,
          updatedAt: new Date().toISOString(),
        };
      }),
    })),

  startSapSync: (id) =>
    set((state) => ({
      agreements: state.agreements.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'sap_syncing',
              sapValidation: {
                status: 'syncing',
                startedAt: new Date().toISOString(),
                completedAt: null,
                steps: [
                  { id: 's1', label: 'Validar Dados Cadastrais', status: 'pending', description: 'Verificação de CNPJ e dados do sacado' },
                  { id: 's2', label: 'Validar Contrato', status: 'pending', description: 'Análise de condições contratuais no SAP' },
                  { id: 's3', label: 'Verificar Limites de Crédito', status: 'pending', description: 'Consulta de limites disponíveis' },
                  { id: 's4', label: 'Sincronizar Dados Financeiros', status: 'pending', description: 'Integração de valores e prazos' },
                ],
              },
              updatedAt: new Date().toISOString(),
            }
          : a
      ),
    })),

  completeSapSync: (id) => {
    const { simulateInconsistency } = get();
    set((state) => ({
      agreements: state.agreements.map((a) => {
        if (a.id !== id) return a;
        if (simulateInconsistency) {
          return {
            ...a,
            status: 'inconsistency' as AgreementStatus,
            sapValidation: {
              ...a.sapValidation!,
              status: 'error',
              completedAt: new Date().toISOString(),
              steps: a.sapValidation!.steps.map((s, i) =>
                i < 2
                  ? { ...s, status: 'completed' as const }
                  : i === 2
                  ? { ...s, status: 'error' as const, description: 'Inconsistência detectada nos limites de crédito' }
                  : s
              ),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return {
          ...a,
          status: 'pending_linkage' as AgreementStatus,
          sapValidation: {
            ...a.sapValidation!,
            status: 'completed',
            completedAt: new Date().toISOString(),
            steps: a.sapValidation!.steps.map((s) => ({ ...s, status: 'completed' as const })),
          },
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  getAgreement: (id) => get().agreements.find((a) => a.id === id),
  getSupplierAgreements: (supplierCnpj) =>
    get().agreements.filter(
      (a) => a.supplierCnpj === supplierCnpj && ['pending_supplier_aceite', 'signature_pending', 'signed'].includes(a.status)
    ),
}));
