/**
 * URL utilities for parsing initial params.
 */
export interface InitialUrlParams {
  game?: string | null;
  playerId?: string | null;
  roomId?: string | null;
  role?: 'host' | 'controller' | null;
  offerToken?: string | null;
}

export function parseInitialParams(loc: Location = window.location): InitialUrlParams {
  try {
    const usp = new URLSearchParams(loc.search);
    return {
      game: usp.get('game'),
      playerId: usp.get('playerId'),
      roomId: usp.get('room') ?? usp.get('roomId'),
      role: ((usp.get('role') === 'host' || usp.get('role') === 'controller')
        ? usp.get('role')
        : null) as 'host' | 'controller' | null,
      offerToken: usp.get('offer')
    };
  } catch {
    return {};
  }
}
