/**
 * BlameGameStore
 * 
 * Purpose: Game-specific state management for NameBlame mode using Zustand.
 * Extends the core framework with blame-specific functionality including
 * blame phases, blame logging, and blame acknowledgement workflow.
 * 
 * State Management:
 * - Blame phases (selecting, blamed)
 * - Current blame context (blamer, blamed, question)
 * - Blame log history
 * - Blame acknowledgement workflow
 * 
 * Dependencies:
 * - zustand (state management)
 * - ../types (TypeScript interfaces)
 */

import { create } from 'zustand';
import { NameBlameEntry, NameBlamePhase, NameBlameState } from '../types';

export interface BlameState {
  // Blame flow state
  blamePhase: NameBlamePhase;
  
  // Current blame context
  currentBlamer: string | null;
  currentBlamed: string | null;
  currentQuestion: string | null;
  
  // Blame history
  blameLog: NameBlameEntry[];
  
  // Blame statistics
  blameStats: Record<string, number>; // player name -> blame count
  
  // Blame round progression state
  currentQuestionId: string;
  playersWhoBlamedThisQuestion: string[];
  isBlameRoundComplete: boolean;
}

export interface BlameActions {
  // Blame flow actions
  setBlamePhase: (phase: NameBlamePhase) => void;
  updateBlameState: (updates: Partial<NameBlameState>) => void;
  resetBlameState: () => void;
  
  // Blame recording actions
  recordBlame: (from: string, to: string, question: string) => void;
  clearBlameLog: () => void;
  
  // Blame statistics
  calculateBlameStats: () => void;
  getMostBlamedPlayer: () => { name: string; count: number } | null;
  getBlameCountForPlayer: (playerName: string) => number;
  
  // Blame round progression actions
  startBlameRound: (questionId: string, activePlayers: string[]) => void;
  markPlayerBlamedInRound: (playerName: string) => void;
  isPlayerAllowedToBlame: (playerName: string) => boolean;
  getRemainingPlayersToBlame: (activePlayers: string[]) => string[];
  completeBlameRound: () => void;
  
  // Utility actions
  resetBlameGameState: () => void;
}

export type BlameGameStore = BlameState & BlameActions;

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

export const useBlameGameStore = create<BlameGameStore>((set, get) => ({
  ...initialBlameState,
  
  // Blame flow actions
  setBlamePhase: (phase: NameBlamePhase) => {
    set({ blamePhase: phase });
    console.log(`🎯 Blame phase changed to: ${phase}`);
  },
  
  updateBlameState: (updates: Partial<NameBlameState>) => {
    // Map NameBlameState to BlameState properties
    const stateUpdate: Partial<BlameState> = {};
    
    if (updates.phase !== undefined) {
      stateUpdate.blamePhase = updates.phase;
    }
    if (updates.currentBlamer !== undefined) {
      stateUpdate.currentBlamer = updates.currentBlamer;
    }
    if (updates.currentBlamed !== undefined) {
      stateUpdate.currentBlamed = updates.currentBlamed;
    }
    if (updates.currentQuestion !== undefined) {
      stateUpdate.currentQuestion = updates.currentQuestion;
    }
    
    set(stateUpdate);
    console.log(`🎯 Blame state updated:`, stateUpdate);
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
  
  // Blame recording actions
  recordBlame: (from: string, to: string, question: string) => {
    const state = get();
    const entry: NameBlameEntry = {
      from,
      to,
      question,
      timestamp: new Date().toISOString()
    };
    
    const updatedLog = [...state.blameLog, entry];
    const updatedStats = { ...state.blameStats };
    updatedStats[to] = (updatedStats[to] || 0) + 1;
    
    set({
      blameLog: updatedLog,
      blameStats: updatedStats,
    });
    
    console.log(`📝 Blame recorded: ${from} → ${to} for "${question}"`);
    console.log(`🎯 NAMEBLAME CHAIN: ${from} blamed ${to}, next active player will be ${to}`);
    console.log(`📊 Updated blame stats:`, updatedStats);
  },
  
  clearBlameLog: () => {
    set({
      blameLog: [],
      blameStats: {},
    });
    console.log('🗑️ Blame log and stats cleared');
  },
  
  // Blame statistics
  calculateBlameStats: () => {
    const state = get();
    const stats: Record<string, number> = {};
    
    state.blameLog.forEach(entry => {
      stats[entry.to] = (stats[entry.to] || 0) + 1;
    });
    
    set({ blameStats: stats });
    console.log('📊 Blame stats recalculated:', stats);
  },
  
  getMostBlamedPlayer: (): { name: string; count: number } | null => {
    const state = get();
    const entries = Object.entries(state.blameStats);
    
    if (entries.length === 0) {
      return null;
    }
    
    const [name, count] = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    return { name, count };
  },
  
  getBlameCountForPlayer: (playerName: string): number => {
    const state = get();
    return state.blameStats[playerName] || 0;
  },
  
  // Utility actions
  resetBlameGameState: () => {
    set(initialBlameState);
    console.log('🔄 Blame game state reset to initial state');
  },
  
  // Blame round progression actions
  startBlameRound: (questionId: string, activePlayers: string[]) => {
    set({
      currentQuestionId: questionId,
      playersWhoBlamedThisQuestion: [],
      isBlameRoundComplete: false,
      blamePhase: 'selecting',
    });
    console.log(`🎯 Started new blame round for question: ${questionId} with ${activePlayers.length} players`);
  },
  
  markPlayerBlamedInRound: (playerName: string) => {
    const state = get();
    if (!state.playersWhoBlamedThisQuestion.includes(playerName)) {
      const updatedPlayers = [...state.playersWhoBlamedThisQuestion, playerName];
      set({ playersWhoBlamedThisQuestion: updatedPlayers });
      console.log(`✅ Marked ${playerName} as having blamed in current round. Total: ${updatedPlayers.length}`);
    }
  },
  
  isPlayerAllowedToBlame: (playerName: string): boolean => {
    // In simplified chain progression, each player can always blame once per question
    // The duplicate prevention is handled by immediate progression to next question
    console.log(`🔍 Player ${playerName} allowed to blame: true (simplified chain mode)`);
    return true;
  },
  
  getRemainingPlayersToBlame: (activePlayers: string[]): string[] => {
    const state = get();
    const remaining = activePlayers.filter(player => 
      !state.playersWhoBlamedThisQuestion.includes(player)
    );
    console.log(`📊 Remaining players to blame: ${remaining.length}/${activePlayers.length}`);
    return remaining;
  },
  
  completeBlameRound: () => {
    set({
      isBlameRoundComplete: true,
    });
    console.log('🏁 Blame sequence mark (unused in simplified flow)');
  },
}));

// Expose the store on window for Playwright/unit tests and debugging
// This allows tests (e.g. nameblame-components.test.tsx) to access the Zustand store directly
// without needing to thread it through React props. Safe no-op in non-browser environments.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).blameGameStore = useBlameGameStore;
}

// Selectors for common blame state access patterns
export const selectBlamePhase = (state: BlameGameStore) => state.blamePhase;
export const selectCurrentBlameContext = (state: BlameGameStore) => ({
  blamer: state.currentBlamer,
  blamed: state.currentBlamed,
  question: state.currentQuestion,
});
export const selectBlameLog = (state: BlameGameStore) => state.blameLog;
export const selectBlameStats = (state: BlameGameStore) => state.blameStats;
export const selectIsInBlamedPhase = (state: BlameGameStore) => state.blamePhase === 'reveal';
export const selectIsInSelectingPhase = (state: BlameGameStore) => state.blamePhase === 'selecting';