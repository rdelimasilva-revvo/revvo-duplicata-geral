import { create } from 'zustand';

export type SortKey =
  | 'supplierName'
  | 'code'
  | 'origin'
  | 'status'
  | 'totalValue'
  | 'remainingValue';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export interface CreditFilters {
  search: string;
  origin: string;
  status: string;
  minRemaining: string;
  maxRemaining: string;
}

export const INITIAL_FILTERS: CreditFilters = {
  search: '',
  origin: 'all',
  status: 'all',
  minRemaining: '',
  maxRemaining: '',
};

interface CreditsTableStore {
  sort: SortState | null;
  filters: CreditFilters;
  cycleSort: (key: SortKey) => void;
  setFilter: <K extends keyof CreditFilters>(key: K, value: CreditFilters[K]) => void;
  resetFilters: () => void;
  resetSort: () => void;
  hasActiveFilters: () => boolean;
}

export const useCreditsTableStore = create<CreditsTableStore>((set, get) => ({
  sort: null,
  filters: INITIAL_FILTERS,
  cycleSort: (key) =>
    set((state) => {
      const current = state.sort;
      if (!current || current.key !== key) {
        return { sort: { key, direction: 'asc' } };
      }
      if (current.direction === 'asc') {
        return { sort: { key, direction: 'desc' } };
      }
      return { sort: null };
    }),
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: INITIAL_FILTERS }),
  resetSort: () => set({ sort: null }),
  hasActiveFilters: () => {
    const f = get().filters;
    return (
      f.search.trim() !== '' ||
      f.origin !== 'all' ||
      f.status !== 'all' ||
      f.minRemaining !== '' ||
      f.maxRemaining !== ''
    );
  },
}));
