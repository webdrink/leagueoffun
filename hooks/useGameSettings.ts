import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { GameSettings } from '../types';
import { initialGameSettings } from '../constants';

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
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>(
    'blamegame-settings', 
    initialGameSettings
  );

  const updateGameSettings = (newSettings: Partial<GameSettings>) => {
    setGameSettings({
      ...gameSettings,
      ...newSettings
    });
  };

  return {
    gameSettings,
    setGameSettings,
    updateGameSettings
  };
};