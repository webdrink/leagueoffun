import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { GameSettings } from '../types';
import { initialGameSettings } from '../constants';

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