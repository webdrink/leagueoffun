import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { GameSettings } from '../types';
import { initialGameSettings } from '../constants';
import { useGameStore } from '../store/gameStore';

/**
 * Custom React hook for managing game settings using local storage.
 *
 * @returns An object containing:
 * - `gameSettings`: The current game settings.
 * - `setGameSettings`: Function to directly set the game settings.
 * - `updateGameSettings`: Function to update specific fields in the game settings.
 *
 * Uses the `useLocalStorage` hook to persist settings under the key `'blamegame-settings'`.
 */
export const useGameSettings = () => {
  const storeGameSettings = useGameStore(state => state.gameSettings);
  const setStoreGameSettings = useGameStore(state => state.setGameSettings);
  const updateStoreGameSettings = useGameStore(state => state.updateGameSettings);

  const [persistedSettings, setPersistedSettings] = useLocalStorage<GameSettings>(
    'blamegame-settings',
    initialGameSettings
  );

  // Initialize store from persisted settings on mount
  useEffect(() => {
    setStoreGameSettings(persistedSettings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage whenever store settings change
  useEffect(() => {
    setPersistedSettings(storeGameSettings);
  }, [storeGameSettings, setPersistedSettings]);

  return {
    gameSettings: storeGameSettings,
    setGameSettings: setStoreGameSettings,
    updateGameSettings: updateStoreGameSettings,
  };
};