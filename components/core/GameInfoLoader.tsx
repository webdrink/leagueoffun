import React from 'react';
import { DataLoader } from './DataLoader';
import { useGameStore, GameInfo } from '../../store/gameStore';

/**
 * Loads game configuration from `game.json` and stores it in the global store.
 */
export const GameInfoLoader: React.FC<React.PropsWithChildren> = ({ children }) => {
  const setGameInfo = useGameStore(state => state.setGameInfo);
  return (
    <DataLoader<GameInfo>
      fetchData={() => fetch('/game.json').then(res => res.json())}
      onData={setGameInfo}
    >
      {() => <>{children}</>}
    </DataLoader>
  );
};

