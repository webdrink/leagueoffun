/**
 * Phase controller contracts.
 */
import { GameAction, PhaseTransitionResult } from './actions';
import { GameConfig } from './config/game.schema';
import { EventBus } from './events/eventBus';
import type { MultiplayerSessionManager, RoomRole } from './network';

export interface MultiplayerModuleContext {
  enabled: boolean;
  role: RoomRole | null;
  manager: MultiplayerSessionManager | null;
}

export interface GameModuleContext {
  config: GameConfig;
  dispatch: (action: GameAction, payload?: unknown) => void;
  eventBus: EventBus;
  playerId?: string | null;
  roomId?: string | null;
  role?: RoomRole | null;
  network?: MultiplayerModuleContext | null;
  // Future: access to stores & content provider
}

export interface PhaseController {
  onEnter?(ctx: GameModuleContext): void | Promise<void>;
  onExit?(ctx: GameModuleContext): void | Promise<void>;
  transition(action: GameAction, ctx: GameModuleContext, payload?: unknown): PhaseTransitionResult;
}

export type PhaseControllerMap = Record<string, PhaseController>;
