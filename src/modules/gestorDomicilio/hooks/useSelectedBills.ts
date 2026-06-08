import { useState, useCallback, useMemo } from 'react';
import { Bill } from '@/modules/gestorDomicilio/types/bill';

export function useSelectedBills(bills: Bill[]) {
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());

  const selectableBills = useMemo(() => {
    return bills.filter(bill => bill.manifestation === 'Aceito');
  }, [bills]);

  const selectableBillIds = useMemo(() => {
    return new Set(selectableBills.map(bill => bill.id));
  }, [selectableBills]);

  const isSelectable = useCallback((billId: string) => {
    return selectableBillIds.has(billId);
  }, [selectableBillIds]);

  const isSelected = useCallback((billId: string) => {
    return selectedBills.has(billId);
  }, [selectedBills]);

  const toggleBill = useCallback((billId: string) => {
    if (!isSelectable(billId)) return;

    setSelectedBills(prev => {
      const next = new Set(prev);
      if (next.has(billId)) {
        next.delete(billId);
      } else {
        next.add(billId);
      }
      return next;
    });
  }, [isSelectable]);

  const toggleAll = useCallback(() => {
    setSelectedBills(prev => {
      if (prev.size === selectableBills.length) {
        return new Set();
      }
      return selectableBillIds;
    });
  }, [selectableBills.length, selectableBillIds]);

  const selectedCount = selectedBills.size;
  const hasSelections = selectedCount > 0;
  const allSelected = selectedCount === selectableBills.length;

  return {
    selectedBills,
    isSelected,
    isSelectable,
    toggleBill,
    toggleAll,
    hasSelections,
    allSelected,
    selectedCount
  };
}