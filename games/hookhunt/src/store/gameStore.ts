/**
 * Game Store (compatibility layer)
 *
 * Provides minimal fields/actions required by legacy hooks/components:
 * - useGameSettings expects gameSettings, setGameSettings, updateGameSettings
 * - GameInfoLoader expects setGameInfo and GameInfo type
 */

import { create } from 'zustand';
import type { GameSettings } from '../types';

// Minimal GameInfo type compatible with GameInfoLoader expectations
export interface GameInfo {
  id: string;
  title: string;
  description?: string;
  version?: string;
}

interface GameStoreState {
  dummyState: boolean;
  gameSettings: GameSettings;
  gameInfo: GameInfo | null;
}

interface GameStoreActions {
  dummyAction: () => void;
  setGameSettings: (settings: GameSettings) => void;
  updateGameSettings: (partial: Partial<GameSettings>) => void;
  setGameInfo: (info: GameInfo) => void;
}

type GameStore = GameStoreState & GameStoreActions;

export const useGameStore = create<GameStore>((set, get) => ({
  dummyState: false,
  dummyAction: () => set({ dummyState: true }),

  // Initialize with sensible defaults (duplicated from constants for isolation)
  gameSettings: {
    categoryCount: 10,
    questionsPerCategory: 10,
    rouletteDurationMs: 2000,
    loadingQuoteIntervalMs: 800,
    introSpringStiffness: 260,
    introSpringDamping: 20,
    introSpringDurationSec: 0.3,
    questionCardTransitionSec: 0.15,
    questionCardSpringStiffness: 120,
    questionCardSpringDamping: 20,
    rouletteCardBaseDurationSec: 0.5,
    rouletteCardStaggerDelaySec: 0.1,
    rouletteCardStaggerDurationIncrementSec: 0.05,
    rouletteCardSpringStiffness: 80,
    rouletteCardSpringDamping: 12,
    rouletteCardSpreadFactor: 60,
    rouletteCardRotationAngle: 10,
    loadingQuoteSpringStiffness: 120,
    loadingQuoteSpringDamping: 10,
    loadingQuoteTransitionDurationSec: 0.5,
    cardFallDistance: 800,
    cardFallStaggerDelaySec: 0.1,
    cardStackOffsetY: 10,
    numberOfRounds: 3,
    timePerQuestion: 30,
    showScore: true,
    allowSkip: true,
    showIntroAnimation: true,
    introAnimationDuration: 1500,
    questionFontSize: 1.5,
    dynamicThemeEnabled: true,
    questionCardAnimation: 'roulette',
    language: 'en',
    gameMode: 'classic',
    selectCategories: false,
    selectedCategoryIds: [],
  },
  gameInfo: null,

  setGameSettings: (settings) => set({ gameSettings: settings }),
  updateGameSettings: (partial) => set({ gameSettings: { ...get().gameSettings, ...partial } }),
  setGameInfo: (info) => set({ gameInfo: info }),
}));