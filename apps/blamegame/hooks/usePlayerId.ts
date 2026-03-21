import { useState, useEffect } from 'react';
import { PlayerId, resolvePlayerSession, stripSessionParamsFromUrl } from '@game-core';

interface UsePlayerIdReturn {
  playerId: PlayerId;
  returnUrl: string | null;
}

export function usePlayerId(): UsePlayerIdReturn {
  const [session] = useState(() => resolvePlayerSession('blamegame'));
  const playerId: PlayerId = session.playerId;
  const returnUrl: string | null = session.returnUrl;

  useEffect(() => {
    // Clean URL on mount
    stripSessionParamsFromUrl();
  }, []);

  return { playerId, returnUrl };
}

export function returnToHub(returnUrl: string, playerId: PlayerId, score: number = 0) {
  const url = new URL(decodeURIComponent(returnUrl));
  url.searchParams.set('playerId', playerId);
  url.searchParams.set('gameId', 'blamegame');
  url.searchParams.set('score', score.toString());
  url.searchParams.set('playedAt', new Date().toISOString());
  window.location.href = url.toString();
}
