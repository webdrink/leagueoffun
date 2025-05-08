/**
 * Utilities for language support and localization in the app
 */

import { useState, useEffect } from 'react';
import useLocalStorage from '../useLocalStorage';
import { SupportedLanguage, GameSettings } from '../../types';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français'
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'de';

/**
 * Detects the browser language and returns a supported language or the default
 */
export const detectBrowserLanguage = (): SupportedLanguage => {
  try {
    const browserLang = navigator.language.split('-')[0];
    return (browserLang in SUPPORTED_LANGUAGES) 
      ? browserLang as SupportedLanguage 
      : DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Error detecting browser language:', error);
    return DEFAULT_LANGUAGE;
  }
};

/**
 * Hook to manage language throughout the application
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
