/**
 * URL utilities for parsing initial params.
 */
export interface InitialUrlParams {
  game?: string | null;
  playerId?: string | null;
  roomId?: string | null;
}

export function parseInitialParams(loc: Location = window.location): InitialUrlParams {
  try {
    const usp = new URLSearchParams(loc.search);
    return {
      game: usp.get('game'),
      playerId: usp.get('playerId'),
      roomId: usp.get('roomId')
    };
  } catch {
    return {};
  }
}
