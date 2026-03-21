import React from 'react';
import { DataLoader } from './DataLoader';

/**
 * GameInfoLoader Component
 *
 * Purpose: Fetches game metadata and exposes it to the caller.
 * The default fetcher loads `game.json` from the current app root.
 *
 * Props:
 *  - children: React.ReactNode - React children to render once the data is
 *    loaded.
 *
 * Expected Behavior: On mount, this component retrieves `game.json`, calls
 * `onGameInfo`, and then renders its children.
 */
export interface GameInfoLoaderProps<TGameInfo = Record<string, unknown>> {
  children: React.ReactNode;
  fetchGameInfo?: () => Promise<TGameInfo>;
  onGameInfo?: (info: TGameInfo) => void;
}

export const GameInfoLoader = <TGameInfo extends Record<string, unknown> = Record<string, unknown>>({
  children,
  fetchGameInfo,
  onGameInfo
}: GameInfoLoaderProps<TGameInfo>) => {
  const defaultFetcher = React.useCallback(async () => {
    const response = await fetch('game.json');
    if (!response.ok) {
      throw new Error(`Failed to load game info (${response.status})`);
    }
    return response.json() as Promise<TGameInfo>;
  }, []);

  const fetcher = fetchGameInfo ?? defaultFetcher;

  return (
    <DataLoader<TGameInfo>
      fetchData={fetcher}
      onData={(info) => {
        onGameInfo?.(info);
      }}
    >
      {() => <>{children}</>}
    </DataLoader>
  );
};
