/**
 * Store Index
 * 
 * Purpose: Central exports for all Zustand stores in the game framework.
 * Provides convenient access to both core framework stores and game-specific stores.
 * 
 * Exports:
 * - GameStateStore: Core game state management
 * - BlameGameStore: NameBlame-specific state management
 * - All selectors and utility functions
 */

// Core framework store
export {
  useGameStateStore,
  selectGameStep,
  selectGameMode,
  selectCurrentPlayer,
  selectActivePlayers,
  selectGameProgress,
  selectIsLoading,
  selectErrorMessage,
  type GameState,
  type GameActions,
  type GameStateStore,
} from './GameStateStore';

// Blame game store
export {
  useBlameGameStore,
  selectBlamePhase,
  selectCurrentBlameContext,
  selectBlameLog,
  selectBlameStats,
  selectIsInBlamedPhase,
  selectIsInSelectingPhase,
} from './BlameGameStore';

// Backward compatibility stub types (will be deprecated):
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlameState {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BlameActions {}
export type BlameGameStore = unknown;