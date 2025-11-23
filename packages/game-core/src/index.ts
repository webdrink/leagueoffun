// Game Core - Shared game logic and utilities
export * from './events/eventBus';
export * from './persistence/storage';
export * from './config/game.schema';
export * from './modules';
export * from './phases';
export * from './dispatcher';
export * from './actions';

// Player ID helper types
export type PlayerId = string;
export type GameId = string;

export interface GameSession {
  gameId: GameId;
  playerId: PlayerId;
  startedAt: string;
  endedAt?: string;
  stats?: Record<string, unknown>;
}

export interface GameScore {
  gameId: GameId;
  score: number;
  meta?: Record<string, unknown>;
}

// Helper to generate a PlayerId using UUID
export function generatePlayerId(): PlayerId {
  return crypto.randomUUID();
}
