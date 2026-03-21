import React, { createContext, useContext, useEffect, useState } from 'react';
import { PlayerId, resolvePlayerSession, stripSessionParamsFromUrl } from '@game-core';

interface PlayerContextValue {
  playerId: PlayerId;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

const legacyStatsKey = 'leagueoffun.playerStats';
const legacyLastGameKey = 'leagueoffun.lastGameId';
const legacyLastPlayedAtKey = 'leagueoffun.lastPlayedAt';

function scopedStatsKey(playerId: string) {
  return `${legacyStatsKey}.${playerId}`;
}

function scopedLastGameKey(playerId: string) {
  return `${legacyLastGameKey}.${playerId}`;
}

function scopedLastPlayedAtKey(playerId: string) {
  return `${legacyLastPlayedAtKey}.${playerId}`;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playerId] = useState<PlayerId>(() => {
    const session = resolvePlayerSession('gamepicker');
    return session.playerId;
  });

  // Check for returning game data in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('gameId')?.trim();
    const score = params.get('score');
    const playedAt = params.get('playedAt')?.trim();

    if (gameId && score && playedAt) {
      const numericScore = Number.parseInt(score, 10);
      if (Number.isNaN(numericScore)) {
        stripSessionParamsFromUrl();
        return;
      }

      // Store game stats
      try {
        const rawStats = localStorage.getItem(scopedStatsKey(playerId))
          || localStorage.getItem(legacyStatsKey)
          || '[]';
        const stats = JSON.parse(rawStats) as Array<{
          gameId: string;
          score: number;
          playedAt: string;
        }>;
        const alreadyExists = stats.some(
          (entry) =>
            entry.gameId === gameId &&
            entry.playedAt === playedAt &&
            entry.score === numericScore
        );
        if (!alreadyExists) {
          stats.push({
            gameId,
            score: numericScore,
            playedAt,
          });
        }
        // Keep only the latest 100 items.
        const trimmed = stats.slice(-100);
        localStorage.setItem(scopedStatsKey(playerId), JSON.stringify(trimmed));
        localStorage.setItem(scopedLastGameKey(playerId), gameId);
        localStorage.setItem(scopedLastPlayedAtKey(playerId), playedAt);
        // Keep legacy keys for compatibility with older builds.
        localStorage.setItem(legacyStatsKey, JSON.stringify(trimmed));
        localStorage.setItem(legacyLastGameKey, gameId);
        localStorage.setItem(legacyLastPlayedAtKey, playedAt);
      } catch (error) {
        console.error('Failed to store player stats:', error);
      }
    }

    stripSessionParamsFromUrl();
  }, [playerId]);

  useEffect(() => {
    try {
      localStorage.setItem('leagueoffun.playerId', playerId);
    } catch {
      // Ignore storage access issues.
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
