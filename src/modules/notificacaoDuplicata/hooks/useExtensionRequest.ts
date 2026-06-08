import { useState, useCallback } from 'react';
import { Bill } from '@/modules/notificacaoDuplicata/types/bill';

export function useExtensionRequest(selectedBills: Set<string>, bills: Bill[]) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const selectedBillsData = Array.from(selectedBills).map(id => {
    return bills.find(bill => bill.id === id);
  }).filter((bill): bill is Bill => bill !== undefined);

  const totalAmount = selectedBillsData.reduce((sum, bill) => sum + bill.amount, 0);

  const handleRequestExtension = useCallback(() => {
    setIsConfirmModalOpen(true);
  }, []);

  const handleConfirmExtension = useCallback(() => {
    setIsConfirmModalOpen(false);
    setIsSuccessModalOpen(true);
  }, []);

  return {
    isConfirmModalOpen,
    isSuccessModalOpen,
    totalAmount,
    handleRequestExtension,
    handleConfirmExtension,
    closeConfirmModal: () => setIsConfirmModalOpen(false),
    closeSuccessModal: () => setIsSuccessModalOpen(false)
  };
}