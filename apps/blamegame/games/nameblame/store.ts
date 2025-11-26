/**
 * NameBlame Module Store (migrated from legacy BlameGameStore)
 *
 * Purpose: Encapsulates NameBlame-specific state & actions as a module slice.
 * This file was migrated from `store/BlameGameStore.ts` as part of the
 * modular architecture transition. The legacy file now re-exports from here.
 *
 * Exposed State:
 *  - blamePhase, currentBlamer, currentBlamed, currentQuestion
 *  - blameLog, blameStats, round progression metadata
 *
 * Actions:
 *  - setBlamePhase, updateBlameState, resetBlameState
 *  - recordBlame, clearBlameLog
 *  - calculateBlameStats, getMostBlamedPlayer, getBlameCountForPlayer
 *  - startBlameRound, markPlayerBlamedInRound, isPlayerAllowedToBlame,
 *    getRemainingPlayersToBlame, completeBlameRound
 *  - resetBlameGameState (full reset)
 *
 * Notes:
 *  - Console logging remains for now; will be redirected to EventBus sink in later phase.
 *  - Future: Register this slice dynamically via ModuleStore API.
 */
import { create } from 'zustand';
import { NameBlameEntry, NameBlamePhase, NameBlameState } from '../../types';

export interface BlameState {
  blamePhase: NameBlamePhase;
  currentBlamer: string | null;
  currentBlamed: string | null;
  currentQuestion: string | null;
  blameLog: NameBlameEntry[];
  blameStats: Record<string, number>;
  currentQuestionId: string;
  playersWhoBlamedThisQuestion: string[];
  isBlameRoundComplete: boolean;
}

export interface BlameActions {
  setBlamePhase: (phase: NameBlamePhase) => void;
  updateBlameState: (updates: Partial<NameBlameState>) => void;
  resetBlameState: () => void;
  recordBlame: (from: string, to: string, question: string) => void;
  clearBlameLog: () => void;
  calculateBlameStats: () => void;
  getMostBlamedPlayer: () => { name: string; count: number } | null;
  getBlameCountForPlayer: (playerName: string) => number;
  startBlameRound: (questionId: string, activePlayers: string[]) => void;
  markPlayerBlamedInRound: (playerName: string) => void;
  isPlayerAllowedToBlame: (playerName: string) => boolean;
  getRemainingPlayersToBlame: (activePlayers: string[]) => string[];
  completeBlameRound: () => void;
  resetBlameGameState: () => void;
}

export type NameBlameModuleStore = BlameState & BlameActions;

const initialBlameState: BlameState = {
  blamePhase: 'selecting',
  currentBlamer: null,
  currentBlamed: null,
  currentQuestion: null,
  blameLog: [],
  blameStats: {},
  currentQuestionId: '',
  playersWhoBlamedThisQuestion: [],
  isBlameRoundComplete: false,
};

export const useNameBlameModuleStore = create<NameBlameModuleStore>((set, get) => ({
  ...initialBlameState,
  setBlamePhase: (phase: NameBlamePhase) => {
    set({ blamePhase: phase });
    console.log(`🎯 Blame phase changed to: ${phase}`);
  },
  updateBlameState: (updates: Partial<NameBlameState>) => {
    const stateUpdate: Partial<BlameState> = {};
    if (updates.phase !== undefined) stateUpdate.blamePhase = updates.phase;
    if (updates.currentBlamer !== undefined) stateUpdate.currentBlamer = updates.currentBlamer;
    if (updates.currentBlamed !== undefined) stateUpdate.currentBlamed = updates.currentBlamed;
    if (updates.currentQuestion !== undefined) stateUpdate.currentQuestion = updates.currentQuestion;
    set(stateUpdate);
    console.log('🎯 Blame state updated:', stateUpdate);
  },
  resetBlameState: () => {
    set({
      blamePhase: 'selecting',
      currentBlamer: null,
      currentBlamed: null,
      currentQuestion: null,
    });
    console.log('🔄 Blame state reset for next turn');
  },
  recordBlame: (from: string, to: string, question: string) => {
    const state = get();
    const entry: NameBlameEntry = { from, to, question, timestamp: new Date().toISOString() };
    const updatedLog = [...state.blameLog, entry];
    const updatedStats = { ...state.blameStats };
    updatedStats[to] = (updatedStats[to] || 0) + 1;
    set({ blameLog: updatedLog, blameStats: updatedStats });
    console.log(`📝 Blame recorded: ${from} → ${to} for "${question}"`);
  },
  clearBlameLog: () => {
    set({ blameLog: [], blameStats: {} });
    console.log('🗑️ Blame log and stats cleared');
  },
  calculateBlameStats: () => {
    const state = get();
    const stats: Record<string, number> = {};
    state.blameLog.forEach(entry => { stats[entry.to] = (stats[entry.to] || 0) + 1; });
    set({ blameStats: stats });
    console.log('📊 Blame stats recalculated:', stats);
  },
  getMostBlamedPlayer: () => {
    const entries = Object.entries(get().blameStats);
    if (!entries.length) return null;
    const [name, count] = entries.reduce((max, cur) => (cur[1] > max[1] ? cur : max));
    return { name, count };
  },
  getBlameCountForPlayer: (playerName: string) => get().blameStats[playerName] || 0,
  startBlameRound: (questionId: string) => {
    set({
      currentQuestionId: questionId,
      playersWhoBlamedThisQuestion: [],
      isBlameRoundComplete: false,
      blamePhase: 'selecting'
    });
    console.log(`🎯 Started new blame round for question: ${questionId}`);
  },
  markPlayerBlamedInRound: (playerName: string) => {
    const s = get();
    if (!s.playersWhoBlamedThisQuestion.includes(playerName)) {
      set({ playersWhoBlamedThisQuestion: [...s.playersWhoBlamedThisQuestion, playerName] });
    }
  },
  isPlayerAllowedToBlame: () => true,
  getRemainingPlayersToBlame: (activePlayers: string[]) => {
    const s = get();
    return activePlayers.filter(p => !s.playersWhoBlamedThisQuestion.includes(p));
  },
  completeBlameRound: () => set({ isBlameRoundComplete: true }),
  resetBlameGameState: () => {
    set(initialBlameState);
    console.log('🔄 Blame game state reset to initial state');
  }
}));

// Expose for debugging
if (typeof window !== 'undefined') {
  (window as unknown as { nameBlameModuleStore?: typeof useNameBlameModuleStore }).nameBlameModuleStore = useNameBlameModuleStore;
}

// Legacy selectors parity
export const selectBlamePhase = (s: NameBlameModuleStore) => s.blamePhase;
export const selectCurrentBlameContext = (s: NameBlameModuleStore) => ({
  blamer: s.currentBlamer,
  blamed: s.currentBlamed,
  question: s.currentQuestion,
});
export const selectBlameLog = (s: NameBlameModuleStore) => s.blameLog;
export const selectBlameStats = (s: NameBlameModuleStore) => s.blameStats;
export const selectIsInBlamedPhase = (s: NameBlameModuleStore) => s.blamePhase === 'reveal';
export const selectIsInSelectingPhase = (s: NameBlameModuleStore) => s.blamePhase === 'selecting';
