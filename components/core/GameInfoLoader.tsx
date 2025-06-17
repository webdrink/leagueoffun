import React from 'react';
import { DataLoader } from './DataLoader';
import { useGameStore, GameInfo } from '../../store/gameStore';
import { fetchAsset } from '../../lib/utils/fetchUtils';

/**
 * GameInfoLoader Component
 *
 * Purpose: Fetches the game's meta information from `game.json` and writes it
 *          into the global zustand store so any component can access it.
 *
 * Props:
 *  - children: React.ReactNode - React children to render once the data is
 *    loaded.
 *
 * Expected Behavior: On mount, this component retrieves `game.json` using
 * `fetchAsset`, stores the result via `useGameStore`, and then renders its
 * children. If the fetch fails, the underlying DataLoader handles the error
 * state.
 *
 * Dependencies:
 *  - React
 *  - DataLoader (for generic async handling)
 *  - zustand store from `useGameStore`
 *  - fetchAsset utility for path-safe fetches
 *
 * Integrated by: index.tsx wraps the entire <App /> with this loader.
 */
export const GameInfoLoader: React.FC<React.PropsWithChildren> = ({ children }) => {
  const setGameInfo = useGameStore(state => state.setGameInfo);
  return (
    <DataLoader<GameInfo>
      fetchData={() => fetchAsset('game.json').then(res => res.json())}
      onData={setGameInfo}
    >
      {() => <>{children}</>}
    </DataLoader>
  );
};

