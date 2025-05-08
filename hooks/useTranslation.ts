import { useContext } from 'react';
import { translations } from '../lib/localization';
import { formatString } from '../lib/localization';
import { SupportedLanguage } from '../types';

/**
 * Hook to access translations based on the current language
 * 
 * @returns Translation function and current language
 */
const useTranslation = () => {
  // For now, we'll use English as the default language
  // This will be replaced with actual language settings logic once useGameSettings is implemented
  const currentLanguage = 'en' as SupportedLanguage;
  
  // Get all translations for the current language
  const currentTranslations = translations[currentLanguage] || translations.en;

  /**
   * Translation function
   * @param key The flat key to the translation (e.g., 'app.title')
   * @param params Optional parameters for interpolation
   */
  const t = (key: string, params?: Record<string, string | number>): string => {
    const value = currentTranslations[key as keyof typeof currentTranslations];

    if (typeof value !== 'string') {
      console.warn(`Translation key not found or not a string: ${key}`);
      return key; // Return the key itself as fallback
    }

    // If we have parameters, replace the placeholders using formatString
    if (params) {
      return formatString(value, params);
    }

    return value;
  };

  return { t, currentLanguage };
};

export default useTranslation;
