import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Itens são identificados pelo caminho de labels (ex.: "Pagamentos / Automações")
// porque rotas podem se repetir em menus diferentes (ex.: 'automacoes').
export const menuItemId = (labelPath: string[]): string => labelPath.join(' / ');

interface MenuVisibilityState {
  hiddenMenuIds: string[];
  isHidden: (id: string) => boolean;
  toggleMenu: (id: string) => void;
  resetVisibility: () => void;
}

export const useMenuVisibilityStore = create<MenuVisibilityState>()(
  persist(
    (set, get) => ({
      hiddenMenuIds: [],
      isHidden: (id) => get().hiddenMenuIds.includes(id),
      toggleMenu: (id) =>
        set((state) => ({
          hiddenMenuIds: state.hiddenMenuIds.includes(id)
            ? state.hiddenMenuIds.filter((hidden) => hidden !== id)
            : [...state.hiddenMenuIds, id],
        })),
      resetVisibility: () => set({ hiddenMenuIds: [] }),
    }),
    { name: 'menu-visibility' }
  )
);
