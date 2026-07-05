import { create } from 'zustand';

interface CommandPaletteState {
  isOpen: boolean;
  searchQuery: string;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  setSearchQuery: (query: string) => void;
}

export const useCommandPaletteStore = create<CommandPaletteState>((set) => ({
  isOpen: false,
  searchQuery: '',
  openPalette: () => set({ isOpen: true }),
  closePalette: () => set({ isOpen: false, searchQuery: '' }),
  togglePalette: () => set((state) => ({ isOpen: !state.isOpen, searchQuery: state.isOpen ? '' : state.searchQuery })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
