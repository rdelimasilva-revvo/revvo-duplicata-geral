export interface Pendency {
  id: string;
  supplierName: string;
  supplierDocument: string;
  totalBills: number;
  pendingBills: number;
  totalAmount: number;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'partial' | 'urgent';
  lastUpdate: Date;
}

export type PendencyStatus = 'pending' | 'partial' | 'urgent';
export type PendencyPriority = 'high' | 'medium' | 'low';
