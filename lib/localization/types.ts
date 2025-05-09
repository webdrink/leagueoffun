/**
 * Types for the translation system
 */

/**
 * Options for formatting translation strings with variables
 */
export interface FormatOptions {
  [key: string]: string | number | boolean | Date;
}

/**
 * Translation key type - can be extended with specific keys as needed
 */
export type TranslationKey = string;

/**
 * Record of translation keys to translated strings
 */
export type Translations = Record<TranslationKey, string>;
