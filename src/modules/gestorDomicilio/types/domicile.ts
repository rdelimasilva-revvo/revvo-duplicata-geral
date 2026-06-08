export interface DomicileChangeRequest {
  id: string;
  billId: string;
  billIud: string;
  sacador: {
    name: string;
    cnpj: string;
    address?: string;
  };
  requestType: 'change_domicile' | 'new_supplier_registration';
  currentDomicile: {
    bank: string;
    agency: string;
    account: string;
    type: 'checking' | 'savings';
  };
  newDomicile: {
    bank: string;
    agency: string;
    account: string;
    type: 'checking' | 'savings';
    pixKey?: string;
  };
  reason: string;
  documentation: {
    bankStatement: boolean;
    signatureCard: boolean;
    cnpjCertificate: boolean;
    additionalDocs: string[];
  };
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'requires_exception';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvalLevel: 'automatic' | 'manager' | 'director' | 'exception';
  exceptionReason?: string;
  comments: Comment[];
  riskScore: 'low' | 'medium' | 'high';
  isNewSupplier: boolean;
}

export interface Comment {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
  type: 'comment' | 'approval' | 'rejection' | 'exception';
}

export interface ApprovalWorkflow {
  id: string;
  requestId: string;
  currentStep: number;
  totalSteps: number;
  steps: ApprovalStep[];
  status: 'in_progress' | 'completed' | 'rejected';
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  approverRole: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp?: string;
  comments?: string;
  requiredDocuments: string[];
}