import React, { createContext, useContext, useEffect, useState } from 'react';
import { generatePlayerId, PlayerId } from '@game-core';

interface PlayerContextValue {
  playerId: PlayerId;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const PLAYER_ID_KEY = 'leagueoffun.playerId';

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerId, setPlayerId] = useState<PlayerId>(() => {
    const stored = localStorage.getItem(PLAYER_ID_KEY);
    if (stored) {
      return stored;
    }
    const newId = generatePlayerId();
    localStorage.setItem(PLAYER_ID_KEY, newId);
    return newId;
  });

  // Check for returning game data in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnedPlayerId = params.get('playerId');
    const gameId = params.get('gameId');
    const score = params.get('score');
    const playedAt = params.get('playedAt');

    if (returnedPlayerId && gameId) {
      // Reconcile player ID if different
      if (returnedPlayerId !== playerId) {
        console.warn('Player ID mismatch - using existing:', playerId);
      }

      // Store game stats
      if (score && playedAt) {
        const stats = JSON.parse(localStorage.getItem('leagueoffun.playerStats') || '[]');
        stats.push({
          gameId,
          score: parseInt(score, 10),
          playedAt
        });
        localStorage.setItem('leagueoffun.playerStats', JSON.stringify(stats));
        console.log('Stored game stat:', { gameId, score, playedAt });
      }

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [playerId]);

  return (
    <PlayerContext.Provider value={{ playerId }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
