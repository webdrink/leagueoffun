/**
 * BlameGameStore stub for compatibility
 * This is a minimal stub to prevent import errors when loading BlameGame
 */

import { create } from 'zustand';

// Minimal stub interface
interface BlameGameStoreState {
  dummyState: boolean;
}

interface BlameGameStoreActions {
  dummyAction: () => void;
}

type BlameGameStore = BlameGameStoreState & BlameGameStoreActions;

export const useBlameGameStore = create<BlameGameStore>((set) => ({
  dummyState: false,
  dummyAction: () => set({ dummyState: true }),
}));

// Export any other functions that might be imported
export const selectBlamePhase = () => 'selecting';
export const selectCurrentBlameContext = () => ({ blamer: null, blamed: null, question: null });
export const selectBlameLog = () => [];
export const selectBlameStats = () => ({});
export const selectIsInBlamedPhase = () => false;
export const selectIsInSelectingPhase = () => true;