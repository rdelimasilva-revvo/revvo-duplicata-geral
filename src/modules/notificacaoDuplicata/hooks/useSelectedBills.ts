import { useState, useCallback, useMemo } from 'react';
import { Bill, StatusManifestacao } from '@/modules/notificacaoDuplicata/types/bill';
import { PENDING_STATUSES } from '@/modules/notificacaoDuplicata/utils/statusConfig';

export function useSelectedBills(bills: Bill[], selectableStatuses?: StatusManifestacao[]) {
  const [selectedBills, setSelectedBills] = useState<Set<string>>(new Set());

  const allowedStatuses = selectableStatuses ?? PENDING_STATUSES;

  const selectableBills = useMemo(() => {
    return bills.filter(bill => allowedStatuses.includes(bill.statusManifestacao));
  }, [bills, allowedStatuses]);

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