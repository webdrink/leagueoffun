/**
 * Utility functions for array operations
 */

import { Question } from '../../types';

/**
 * Shuffle an array randomly using the Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Selects random categories from the list of all available categories
 * @param allCategories Array of all available category names
 * @param count Number of categories to select
 * @returns Array of randomly selected categories
 */
export function getRandomCategories(allCategories: string[], count: number): string[] {
  const unique = [...new Set(allCategories)];
  const numToSelect = Math.min(count, unique.length);
  return shuffleArray(unique).slice(0, numToSelect);
}

/**
 * Filter available questions that haven't been played recently
 * @param allQuestions All available questions
 * @param playedQuestions Array of played question text strings
 * @returns Array of available questions not in the played list
 */
export function getAvailableQuestions(allQuestions: Question[], playedQuestions: string[]): Question[] {
  return allQuestions.filter(q => !playedQuestions.includes(q.text));
}
