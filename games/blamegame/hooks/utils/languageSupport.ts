/**
 * Language support utilities
 * 
 * This file provides helpers and constants for language support in the application.
 */

import { useState, useEffect } from 'react';
import useLocalStorage from '../useLocalStorage';
import { GameSettings } from '../../types';

/**
 * Map of supported languages with their display names
 */
export const SUPPORTED_LANGUAGES = {
  'de': 'Deutsch',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
} as const;

/**
 * Default language used if no language preference is found
 */
export const DEFAULT_LANGUAGE = 'de';

/**
 * Type for supported language codes
 */
export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Array of supported language codes
 */
export const SUPPORTED_LANGUAGE_CODES = Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[];

/**
 * Detects the browser language and returns a supported language code
 * Falls back to 'de' if no match is found
 */
export function detectBrowserLanguage(): SupportedLanguage {
  // Get browser language
  const browserLang = navigator.language.split('-')[0];
  
  // Check if it's a supported language
  if (SUPPORTED_LANGUAGE_CODES.includes(browserLang as SupportedLanguage)) {
    return browserLang as SupportedLanguage;
  }
  
  // Fall back to German
  return DEFAULT_LANGUAGE;
}

/**
 * Validates if a language code is supported
 */
export function isValidLanguage(language: string): boolean {
  return SUPPORTED_LANGUAGE_CODES.includes(language as SupportedLanguage);
}

/**
 * Hook to manage language throughout the application
 */
/**
 * Custom React hook to manage and persist the application's language setting.
 *
 * This hook provides the current language, a function to change the language,
 * and a list of supported languages. It synchronizes the language setting with
 * local storage and updates the state when the game settings change.
 *
 * @returns An object containing:
 * - `currentLanguage`: The currently selected language.
 * - `changeLanguage`: Function to update the language and persist it in settings.
 * - `supportedLanguages`: Array of all supported language codes.
 */
export const useLanguage = () => {
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>(
    'blamegame-settings',
    { language: DEFAULT_LANGUAGE } as any
  );

  // Use the language from game settings
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(
    gameSettings.language || detectBrowserLanguage()
  );

  // Update language whenever game settings change
  useEffect(() => {
    if (gameSettings.language !== currentLanguage) {
      setCurrentLanguage(gameSettings.language || DEFAULT_LANGUAGE);
    }
  }, [gameSettings.language]);

  // Change language and save to game settings
  const changeLanguage = (lang: SupportedLanguage) => {
    setGameSettings({
      ...gameSettings,
      language: lang
    });
  };

  return {
    currentLanguage,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES
  };
};
