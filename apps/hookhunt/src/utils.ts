// Utility functions for the Blame Game

import { CATEGORY_EMOJIS } from './constants';
import { Question, Player } from './types';

/**
 * Selects random categories from the list of all available categories
 */
export function getRandomCategories(allCategories: string[], count: number): string[] {
  const unique = [...new Set(allCategories)];
  const numToSelect = Math.min(count, unique.length);
  return unique.sort(() => 0.5 - Math.random()).slice(0, numToSelect);
}

/**
 * Gets the emoji for a category, with fallback handling
 */
export function getEmoji(category: string): string {
  if (CATEGORY_EMOJIS[category]) {
    return CATEGORY_EMOJIS[category];
  }
  for (const key in CATEGORY_EMOJIS) {
    if (category.includes(key)) return CATEGORY_EMOJIS[key];
  }
  return "❓";
}

/**
 * Filter available questions that haven't been played recently
 */
export function getAvailableQuestions(allQuestions: Question[], playedQuestions: string[]): Question[] {
  return allQuestions.filter(q => !playedQuestions.includes(q.text));
}

/**
 * Generate a unique ID for a player
 */
export function generatePlayerId(): string {
  return `player${Date.now()}`;
}

/**
 * Check if a name is valid for player setup
 */
export function validatePlayerName(name: string, existingPlayers: Player[]): { valid: boolean; error: string | null } {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { valid: false, error: "Bitte gib einen Namen ein." };
  }
  
  if (trimmedName.length > 20) {
    return { valid: false, error: "Name darf maximal 20 Zeichen lang sein." };
  }
  
  const isDuplicate = existingPlayers.some(p => p.name.trim().toLowerCase() === trimmedName.toLowerCase());
  if (isDuplicate) {
    return { valid: false, error: "Dieser Name existiert bereits." };
  }
  
  return { valid: true, error: null };
}

/**
 * Shuffle an array randomly
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
