/**
 * Legacy BlameGameStore shim
 * This file now re-exports the NameBlame module store to maintain backward compatibility
 * while the migration to modular architecture proceeds.
 */
export { 
  useNameBlameModuleStore as useBlameGameStore,
  selectBlamePhase,
  selectCurrentBlameContext,
  selectBlameLog,
  selectBlameStats,
  selectIsInBlamedPhase,
  selectIsInSelectingPhase
} from '../games/nameblame/store';