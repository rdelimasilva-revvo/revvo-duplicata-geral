export interface UnregisteredSupplier {
  id: string;
  name: string;
  cnpj: string;
  email?: string;
  phone?: string;
  address?: string;
  billsCount: number;
  totalAmount: number;
  firstBillDate: string;
  lastBillDate: string;
  status: 'pending_registration' | 'in_registration' | 'documents_pending' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high';
  registrationAttempts: number;
  assignedAnalyst?: string;
  notes: string[];
  requiredDocuments: {
    cnpjCertificate: boolean;
    bankStatement: boolean;
    signatureCard: boolean;
    contractualDocument: boolean;
    additionalDocs: string[];
  };
  submittedAt?: string;
  lastContactDate?: string;
}

export interface SupplierRegistrationRequest {
  id: string;
  supplierId: string;
  requestType: 'new_registration' | 'reactivation';
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_documents';
  approvalLevel: 'automatic' | 'analyst' | 'manager' | 'director';
  documents: {
    cnpjCertificate: { uploaded: boolean; validated: boolean; expiryDate?: string };
    bankStatement: { uploaded: boolean; validated: boolean; months: number };
    signatureCard: { uploaded: boolean; validated: boolean };
    contractualDocument: { uploaded: boolean; validated: boolean; type: string };
    additionalDocs: Array<{ name: string; uploaded: boolean; validated: boolean }>;
  };
  validationResults: {
    cnpjValid: boolean;
    bankDataValid: boolean;
    creditCheckPassed: boolean;
    complianceCheckPassed: boolean;
    riskScore: number;
  };
  comments: Array<{
    id: string;
    author: string;
    role: string;
    message: string;
    timestamp: string;
    type: 'comment' | 'approval' | 'rejection' | 'document_request';
  }>;
  reviewedBy?: string;
  reviewedAt?: string;
}