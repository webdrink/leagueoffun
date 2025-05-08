/**
 * Translation service to handle dynamic text translation
 * This service provides functions for advanced formatting
 * and dynamic translation based on complex conditions
 */

import translations from '../localization';
import { SupportedLanguage } from '../types';

// Type for string format replacement parameters
type FormatParams = Record<string, string | number | boolean>;

// Type for plural form options
interface PluralOptions {
  zero?: string;
  one: string;
  other: string;
}

/**
 * Main translation function that gets text based on language and key
 */
export const translate = (
  language: SupportedLanguage, 
  key: string, 
  params?: FormatParams
): string => {
  try {
    // Get the translations for the specified language, fallback to English
    const currentTranslations = translations[language] || translations.en;
    
    // Split the key by dots to navigate through the nested translation object
    const keys = key.split('.');
    
    // Retrieve the translation by traversing the object
    let value: any = currentTranslations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} in language ${language}`);
        return key; // Return the key itself as fallback
      }
    }
    
    if (typeof value !== 'string') {
      console.warn(`Translation key does not resolve to a string: ${key}`);
      return key;
    }
    
    // If parameters are provided, replace placeholders in the string
    if (params) {
      return formatString(value, params);
    }
    
    return value;
  } catch (error) {
    console.error('Error in translation service:', error);
    return key; // Return the key as fallback in case of error
  }
};

/**
 * Function to format a string by replacing placeholders with values
 * Supports both {{param}} and %param% syntax
 */
export const formatString = (text: string, params: FormatParams): string => {
  let result = text;
  
  // Replace {{param}} syntax
  result = result.replace(/\{\{(.*?)\}\}/g, (match, paramKey) => {
    const trimmedKey = paramKey.trim();
    if (trimmedKey in params) {
      return String(params[trimmedKey]);
    }
    return match; // Keep the original if param not found
  });
  
  // Replace %param% syntax (alternative)
  result = result.replace(/%(\w+)%/g, (match, paramKey) => {
    if (paramKey in params) {
      return String(params[paramKey]);
    }
    return match; // Keep the original if param not found
  });
  
  return result;
};

/**
 * Function to get the appropriate form based on count
 * Supports zero, one, and other (plural) forms
 */
export const getCountForm = (
  count: number,
  options: PluralOptions,
  language: SupportedLanguage = 'en'
): string => {
  if (count === 0 && options.zero) {
    return options.zero;
  }
  
  if (count === 1) {
    return options.one;
  }
  
  return options.other;
};

/**
 * Helper function to get a translated plural form with count
 */
export const translatePlural = (
  language: SupportedLanguage,
  keyBase: string,
  count: number,
  params?: FormatParams
): string => {
  const suffix = count === 1 ? 'singular' : 'plural';
  const key = `${keyBase}_${suffix}`;
  
  return translate(language, key, { ...params, count });
};

export default {
  translate,
  formatString,
  getCountForm,
  translatePlural
};