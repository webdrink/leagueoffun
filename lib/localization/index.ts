/**
 * Exports all translations and utilities for localization
 */
import { FormatOptions, TranslationKey, Translations } from './types';

// Import all language translations
import de from './de';
import en from './en';
import fr from './fr';
import es from './es';

// Map of all available translations
export const translations: Record<string, Translations> = {
  de,
  en,
  fr,
  es
};

/**
 * Format a translation string with variables
 * 
 * @example formatString("Question {current} of {total}", { current: 3, total: 10 }) 
 * // "Question 3 of 10"
 */
export function formatString(str: string, options?: FormatOptions): string {
  if (!options) return str;
  
  return Object.entries(options).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{${key}}`, 'g'), String(value)),
    str
  );
}

export type { TranslationKey, Translations, FormatOptions };
export * from './types';
