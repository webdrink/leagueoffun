/**
 * Type definitions for fuzzyset.js
 */

declare module 'fuzzyset.js' {
  interface FuzzySetOptions {
    gramSizeLower?: number;
    gramSizeUpper?: number;
    useLevenshtein?: boolean;
  }

  interface FuzzySetResult {
    0: number; // confidence score
    1: string; // matched string
  }

  interface FuzzySet {
    get(input: string): FuzzySetResult[] | null;
    add(value: string): boolean;
    isEmpty(): boolean;
    values(): string[];
  }

  interface FuzzySetConstructor {
    (items?: string[], options?: FuzzySetOptions): FuzzySet;
    new (items?: string[], options?: FuzzySetOptions): FuzzySet;
  }

  const FuzzySet: FuzzySetConstructor;
  export = FuzzySet;
}