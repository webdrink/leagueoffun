/**
 * GameAction enum and related types.
 */
export enum GameAction {
  ADVANCE = 'ADVANCE',
  BACK = 'BACK',
  SELECT_TARGET = 'SELECT_TARGET',
  REVEAL = 'REVEAL',
  RESTART = 'RESTART',
  CUSTOM = 'CUSTOM'
}

export interface PhaseTransitionStay { type: 'STAY' }
export interface PhaseTransitionGoto { type: 'GOTO'; phaseId: string }
export interface PhaseTransitionComplete { type: 'COMPLETE' }
export type PhaseTransitionResult = PhaseTransitionStay | PhaseTransitionGoto | PhaseTransitionComplete;
