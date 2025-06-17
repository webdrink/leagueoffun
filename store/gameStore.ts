import { create } from "zustand";
import { GameSettings } from "../types";
import { initialGameSettings } from "../constants";

export type GameState = "not_started" | "in_progress" | "finished";

export interface GameInfo {
  name: string;
  title: string;
  description: string;
  domain: string;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  playMode: string;
  deviceRequirement: string;
  tags: string[];
}

interface Store {
  state: GameState;
  setState: (state: GameState) => void;

  gameInfo?: GameInfo;
  setGameInfo: (info: GameInfo) => void;

  gameSettings: GameSettings;
  setGameSettings: (settings: GameSettings) => void;
  updateGameSettings: (settings: Partial<GameSettings>) => void;

  settings: Record<string, unknown>;
  setSetting: (key: string, value: unknown) => void;
  stats: Record<string, number>;
  updateStat: (key: string, value: number) => void;
}

/**
 * Global game store managed with zustand.
 * Components can subscribe to this store to share state across the app.
 */
export const useGameStore = create<Store>((set) => ({
  state: "not_started",
  setState: (state) => set({ state }),
  gameInfo: undefined,
  setGameInfo: (info) => set({ gameInfo: info }),

  gameSettings: initialGameSettings,
  setGameSettings: (settings) => set({ gameSettings: settings }),
  updateGameSettings: (settings) =>
    set((s) => ({ gameSettings: { ...s.gameSettings, ...settings } })),
  settings: {},
  setSetting: (key, value) =>
    set((s) => ({ settings: { ...s.settings, [key]: value } })),
  stats: {},
  updateStat: (key, value) =>
    set((s) => ({ stats: { ...s.stats, [key]: value } })),
}));
