/**
 * Exports all translations and utilities for localization
 */
import deTranslation from './de';
import enTranslation from './en';
import esTranslation from './es';
import frTranslation from './fr';

// Export translations in the format expected by i18next
export const translations = {
  de: {
    translation: deTranslation,
  },
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
  fr: {
    translation: frTranslation,
  },
};

// Export types
export type SupportedLanguages = 'de' | 'en' | 'es' | 'fr';

// Export language display names
export const LANGUAGE_NAMES: Record<SupportedLanguages, string> = {
  'de': 'Deutsch',
  'en': 'English',
  'es': 'Español',
  'fr': 'Français',
};

// For use in contexts where we need the list of supported languages
export const SUPPORTED_LANGUAGE_CODES: SupportedLanguages[] = ['de', 'en', 'es', 'fr'];

/**
 * Format a translation string with variables
 * 
 * @example formatString("Question {current} of {total}", { current: 3, total: 10 }) 
 * // "Question 3 of 10"
 */
import { FormatOptions } from './types';

export function formatString(str: string, options?: FormatOptions): string {
  if (!options) return str;
  
  return Object.entries(options).reduce(
    (result, [key, value]) => result.replace(new RegExp(`{${key}}`, 'g'), String(value)),
    str
  );
}

export * from './types';
