import { create } from 'zustand';
import { DEFAULT_COMPANY_ID, DEFAULT_USER_ROLE_ID } from '@/modules/automacoes/constants';

interface AppState {
  companyId: string;
  userRoleId: number;
  setCompanyId: (id: string) => void;
  setUserRoleId: (id: number) => void;
}

export const useStore = create<AppState>((set) => ({
  companyId: DEFAULT_COMPANY_ID,
  userRoleId: DEFAULT_USER_ROLE_ID,
  setCompanyId: (id) => set({ companyId: id }),
  setUserRoleId: (id) => set({ userRoleId: id }),
}));