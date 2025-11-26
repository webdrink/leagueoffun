import { useState, useEffect } from 'react';
import { generatePlayerId, PlayerId } from '@game-core';

interface UsePlayerIdReturn {
  playerId: PlayerId;
  returnUrl: string | null;
}

export function usePlayerId(): UsePlayerIdReturn {
  const [playerId, setPlayerId] = useState<PlayerId>(() => {
    // Check URL first
    const params = new URLSearchParams(window.location.search);
    const urlPlayerId = params.get('playerId');
    
    if (urlPlayerId) {
      localStorage.setItem('blamegame.playerId', urlPlayerId);
      return urlPlayerId;
    }
    
    // Check localStorage
    const stored = localStorage.getItem('blamegame.playerId');
    if (stored) {
      return stored;
    }
    
    // Generate new
    const newId = generatePlayerId();
    localStorage.setItem('blamegame.playerId', newId);
    return newId;
  });

  const [returnUrl, setReturnUrl] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('returnUrl');
  });

  useEffect(() => {
    // Clean URL on mount
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
