export interface Bill {
  id: string;
  parcelNumber: string;
  supplier: string;
  dueDate: string;
  amount: number;
  status: string;
  manifestation: string;
}