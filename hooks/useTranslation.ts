import { useTranslation as useReactI18nTranslation } from 'react-i18next';
import { SupportedLanguage } from '../types';
import { formatString } from '../lib/localization';
import { useGameSettings } from './useGameSettings';

/**
 * Hook to access translations based on the current language
 * 
 * @returns Translation function and current language
 */
const useTranslation = () => {
  const { gameSettings } = useGameSettings();
  const { t: i18nT, i18n } = useReactI18nTranslation();
  const currentLanguage = gameSettings?.language || 'de' as SupportedLanguage;
  
  /**
   * Translation function
   * @param key The flat key to the translation (e.g., 'app.title')
   * @param params Optional parameters for interpolation
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    // Use the built-in i18next translation function
    const value = i18nT(key, params);

    // If there's no translation, provide a fallback
    if (!value || value === key) {
      console.warn(`Translation key not found: ${key}`);
      return key; // Return the key itself as fallback
    }

    return value;
  };

  return { t, currentLanguage, i18n };
};

export default useTranslation;
