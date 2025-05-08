/**
 * Utilities for language support and localization in the app
 */

import useLocalStorage from '../useLocalStorage';
import { useCallback, useEffect } from 'react';
import { GameSettings } from '../../types';

export type SupportedLanguage = 'de' | 'en' | 'fr' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  displayName: string; // Name in the language itself
}

// List of supported languages
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'de', name: 'German', displayName: 'Deutsch' },
  { code: 'en', name: 'English', displayName: 'English' },
  { code: 'fr', name: 'French', displayName: 'Français' },
  { code: 'es', name: 'Spanish', displayName: 'Español' }
];

// Default language
export const DEFAULT_LANGUAGE: SupportedLanguage = 'de';

/**
 * Hook for managing language selection in the app
 * @returns Object with language state and methods
 */
export function useLanguage() {
  // Get the game settings from localStorage
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>(
    'blamegame-settings',
    { language: DEFAULT_LANGUAGE } as any
  );

  // Get the current language from game settings, or use default
  const currentLanguage = (gameSettings.language || DEFAULT_LANGUAGE) as SupportedLanguage;

  // Check if a language is supported
  const isLanguageSupported = useCallback((langCode: string): boolean => {
    return SUPPORTED_LANGUAGES.some(lang => lang.code === langCode);
  }, []);
  // Change the active language by updating game settings
  const changeLanguage = useCallback((langCode: string): void => {
    if (isLanguageSupported(langCode)) {
      setGameSettings((prev: GameSettings) => ({
        ...prev,
        language: langCode as SupportedLanguage
      }));
    } else {
      console.warn(`Language ${langCode} is not supported, defaulting to ${DEFAULT_LANGUAGE}`);
      setGameSettings((prev: GameSettings) => ({
        ...prev,
        language: DEFAULT_LANGUAGE
      }));
    }
  }, [isLanguageSupported, setGameSettings]);

  // Detect browser language on first load (only if current language is default)
  useEffect(() => {
    if (currentLanguage === DEFAULT_LANGUAGE) {
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
      if (isLanguageSupported(browserLang) && browserLang !== DEFAULT_LANGUAGE) {
        changeLanguage(browserLang);
      }
    }
  }, []);

  return {
    currentLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    isLanguageSupported
  };
}
