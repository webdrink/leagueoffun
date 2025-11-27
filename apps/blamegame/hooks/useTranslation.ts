import { useTranslation as useReactI18nTranslation } from 'react-i18next';
import { SupportedLanguage } from '../types';
import { formatString } from '../lib/localization';
import { useGameSettings } from './useGameSettings';

/**
 * Hook to access translations based on the current language
 * 
 * @returns Translation function and current language
 */
/**
 * Custom React hook for handling translations within the application.
 *
 * This hook provides a translation function `t` that retrieves localized strings
 * based on a given key and optional interpolation parameters. It also exposes the
 * current language and the underlying i18n instance for advanced usage.
 *
 * @returns An object containing:
 * - `t`: A function to translate keys with optional parameters.
 * - `currentLanguage`: The currently selected language code.
 * - `i18n`: The i18n instance for advanced internationalization operations.
 *
 * @example
 * const { t, currentLanguage } = useTranslation();
 * const title = t('app.title');
 */
const useTranslation = () => {
  const { gameSettings } = useGameSettings();
  const { t: i18nT, i18n } = useReactI18nTranslation();
  const currentLanguage = gameSettings?.language || 'de' as SupportedLanguage;
  
  /**
   * Translation function
   * @param key The flat key to the translation (e.g., 'app.title')
   * @param paramsOrDefault Optional parameters for interpolation or a default string value
   */
  const t = (key: string, paramsOrDefault?: Record<string, string | number> | string): string => {
    // Handle string as default value
    if (typeof paramsOrDefault === 'string') {
      const value = i18nT(key);
      if (!value || value === key) {
        return paramsOrDefault;
      }
      return value;
    }
    
    // Use the built-in i18next translation function
    const value = i18nT(key, paramsOrDefault);

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
