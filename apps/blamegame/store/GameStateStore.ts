/**
 * GameStateStore
 * 
 * Purpose: Core framework state management for any game type using Zustand.
 * Provides centralized state for game flow, player management, and progress tracking.
 * This store is designed to be reusable across different game modes and types.
 * 
 * State Management:
 * - Game flow (intro, setup, game, summary)
 * - Player management (list, current player, rotation)
 * - Progress tracking (current question, round status)
 * - UI state (loading, error handling)
 * 
 * Dependencies:
 * - zustand (state management)
 * - ../types (TypeScript interfaces)
 */

import { create } from 'zustand';
import { GameStep, Player } from '../types';

export interface GameState {
  // Core game flow
  gameStep: GameStep;
  gameMode: 'classic' | 'nameBlame';
  
  // Player management
  players: Player[];
  currentPlayerIndex: number;
  stablePlayerOrder: Player[]; // For consistent turn order during rounds
  
  // Progress tracking
  currentQuestionIndex: number;
  totalQuestions: number;
  roundInProgress: boolean;
  
  // UI state
  isLoading: boolean;
  errorMessage: string | null;
  
  // Custom game data (extensible for different game types)
  customGameData: Record<string, unknown>;
}

export interface GameActions {
  // Game flow actions
  setGameStep: (step: GameStep) => void;
  setGameMode: (mode: 'classic' | 'nameBlame') => void;
  startNewGame: () => void;
  endGame: () => void;
  
  // Player management actions
  setPlayers: (players: Player[]) => void;
  setCurrentPlayerIndex: (index: number) => void;
  advanceToNextPlayer: () => void;
  setStablePlayerOrder: (players: Player[]) => void;
  
  // Progress tracking actions
  setCurrentQuestionIndex: (index: number) => void;
  setTotalQuestions: (total: number) => void;
  advanceQuestion: () => void;
  goToPreviousQuestion: () => void;
  setRoundInProgress: (inProgress: boolean) => void;
  
  // UI state actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Custom data actions
  setCustomGameData: (key: string, value: unknown) => void;
  getCustomGameData: <T = unknown>(key: string) => T | undefined;
  clearCustomGameData: () => void;
  
  // Utility actions
  resetGameState: () => void;
  getActivePlayers: () => Player[];
}

export type GameStateStore = GameState & GameActions;

const initialState: GameState = {
  gameStep: 'intro',
  gameMode: 'classic',
  players: [],
  currentPlayerIndex: 0,
  stablePlayerOrder: [],
  currentQuestionIndex: 0,
  totalQuestions: 0,
  roundInProgress: false,
  isLoading: false,
  errorMessage: null,
  customGameData: {},
};

export const useGameStateStore = create<GameStateStore>((set, get) => ({
  ...initialState,
  
  // Game flow actions
  setGameStep: (step: GameStep) => {
    set({ gameStep: step });
    console.log(`🎮 Game step changed to: ${step}`);
  },
  
  setGameMode: (mode: 'classic' | 'nameBlame') => {
    set({ gameMode: mode });
    console.log(`🎮 Game mode changed to: ${mode}`);
  },
  
  startNewGame: () => {
    const state = get();
    set({
      gameStep: 'game',
      currentQuestionIndex: 0,
      currentPlayerIndex: 0,
      roundInProgress: true,
      isLoading: false,
      errorMessage: null,
      stablePlayerOrder: state.players.filter((p: Player) => p.name.trim() !== ''),
    });
    console.log(`🎮 New game started with ${state.players.length} players`);
  },
  
  endGame: () => {
    set({
      gameStep: 'summary',
      roundInProgress: false,
    });
    console.log('🎮 Game ended');
  },
  
  // Player management actions
  setPlayers: (players: Player[]) => {
    set({ players });
    console.log(`👥 Players updated: ${players.map(p => p.name).join(', ')}`);
  },
  
  setCurrentPlayerIndex: (index: number) => {
    const state = get();
    const validIndex = Math.max(0, Math.min(index, state.stablePlayerOrder.length - 1));
    set({ currentPlayerIndex: validIndex });
    console.log(`👤 Current player index set to: ${validIndex}`);
  },
  
  advanceToNextPlayer: () => {
    const state = get();
    if (state.stablePlayerOrder.length === 0) {
      console.warn('⚠️ Cannot advance player: no stable player order set');
      return;
    }
    
    const nextIndex = (state.currentPlayerIndex + 1) % state.stablePlayerOrder.length;
    set({ currentPlayerIndex: nextIndex });
    
    const currentPlayer = state.stablePlayerOrder[state.currentPlayerIndex];
    const nextPlayer = state.stablePlayerOrder[nextIndex];
    console.log(`🔄 Player advanced: ${currentPlayer?.name} → ${nextPlayer?.name} (${state.currentPlayerIndex} → ${nextIndex})`);
  },
  
  setStablePlayerOrder: (players: Player[]) => {
    set({ stablePlayerOrder: players });
    console.log(`📋 Stable player order set: ${players.map(p => p.name).join(', ')}`);
  },
  
  // Progress tracking actions
  setCurrentQuestionIndex: (index: number) => {
    set({ currentQuestionIndex: index });
    console.log(`❓ Question index set to: ${index}`);
  },
  
  setTotalQuestions: (total: number) => {
    set({ totalQuestions: total });
    console.log(`📊 Total questions set to: ${total}`);
  },
  
  advanceQuestion: () => {
    const state = get();
    const nextIndex = state.currentQuestionIndex + 1;
    
    if (nextIndex >= state.totalQuestions) {
      // End game if no more questions
      set({
        currentQuestionIndex: nextIndex,
        gameStep: 'summary',
        roundInProgress: false,
      });
      console.log('🏁 Game completed - no more questions');
    } else {
      set({ currentQuestionIndex: nextIndex });
      console.log(`➡️ Advanced to question ${nextIndex + 1}/${state.totalQuestions}`);
    }
  },
  
  goToPreviousQuestion: () => {
    const state = get();
    const prevIndex = Math.max(0, state.currentQuestionIndex - 1);
    set({ currentQuestionIndex: prevIndex });
    console.log(`⬅️ Went back to question ${prevIndex + 1}/${state.totalQuestions}`);
  },
  
  setRoundInProgress: (inProgress: boolean) => {
    set({ roundInProgress: inProgress });
    console.log(`🎮 Round in progress: ${inProgress}`);
  },
  
  // UI state actions
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
    console.log(`⏳ Loading state: ${loading}`);
  },
  
  setError: (error: string | null) => {
    set({ errorMessage: error });
    if (error) {
      console.error(`❌ Error set: ${error}`);
    } else {
      console.log('✅ Error cleared');
    }
  },
  
  // Custom data actions
  setCustomGameData: (key: string, value: unknown) => {
    const state = get();
    set({
      customGameData: {
        ...state.customGameData,
        [key]: value,
      },
    });
    console.log(`📝 Custom game data set: ${key} = ${JSON.stringify(value)}`);
  },
  
  getCustomGameData: <T = unknown>(key: string): T | undefined => {
    const state = get();
    return state.customGameData[key] as T;
  },
  
  clearCustomGameData: () => {
    set({ customGameData: {} });
    console.log('🗑️ Custom game data cleared');
  },
  
  // Utility actions
  resetGameState: () => {
    set(initialState);
    console.log('🔄 Game state reset to initial state');
  },
  
  getActivePlayers: (): Player[] => {
    const state = get();
    return state.players.filter((p: Player) => p.name.trim() !== '');
  },
}));

// Selectors for common state access patterns
export const selectGameStep = (state: GameStateStore) => state.gameStep;
export const selectGameMode = (state: GameStateStore) => state.gameMode;
export const selectCurrentPlayer = (state: GameStateStore) => 
  state.stablePlayerOrder[state.currentPlayerIndex] || null;
export const selectActivePlayers = (state: GameStateStore) => 
  state.players.filter(p => p.name.trim() !== '');
export const selectGameProgress = (state: GameStateStore) => ({
  current: state.currentQuestionIndex + 1,
  total: state.totalQuestions,
  percentage: state.totalQuestions > 0 ? (state.currentQuestionIndex / state.totalQuestions) * 100 : 0,
});
export const selectIsLoading = (state: GameStateStore) => state.isLoading;
export const selectErrorMessage = (state: GameStateStore) => state.errorMessage;