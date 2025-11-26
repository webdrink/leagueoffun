/**
 * Global constants for the application
 */

// Import language-related constants
import { DEFAULT_LANGUAGE } from '../../hooks/utils/languageSupport';

// Game constants
export const MAX_QUESTIONS = 10;
export const DEFAULT_VOLUME = 0.5;

// App settings
/**
 * Application-wide default settings.
 *
 * @property {string} defaultLanguage - The default language for the application, defined by `DEFAULT_LANGUAGE`.
 * @property {boolean} defaultSoundEnabled - Indicates if sound is enabled by default.
 * @property {number} defaultVolume - The default volume level, defined by `DEFAULT_VOLUME`.
 * @property {number} minPlayers - The minimum number of players allowed in the game.
 * @property {number} maxPlayers - The maximum number of players allowed in the game.
 */
export const APP_SETTINGS = {
  defaultLanguage: DEFAULT_LANGUAGE,
  defaultSoundEnabled: true,
  defaultVolume: DEFAULT_VOLUME,
  minPlayers: 2,
  maxPlayers: 10
};

// Game steps
export const GAME_STEPS = {
  INTRO: 'intro',
  PLAYER_SETUP: 'player_setup',
  GAME: 'game',
  SUMMARY: 'summary'
} as const;

// Export all constants
export * from './categories';
export * from './fallbackQuestions';
export * from './gameSettings';
export * from './loadingQuotes';
export * from './sounds';
export * from './gameTypes';
export * from './uiConstants';
