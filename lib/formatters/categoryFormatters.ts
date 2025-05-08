/**
 * Utility functions for formatting and handling categories
 */

import { CATEGORY_EMOJIS } from '../constants';

/**
 * Gets the emoji for a category, with fallback handling
 * Uses the categories index from public/categories/index.json if available
 * Falls back to hardcoded CATEGORY_EMOJIS if needed
 * 
 * @param category The category name to find an emoji for
 * @returns The emoji string for the category or a fallback emoji
 */
export async function getEmojiFromIndex(category: string): Promise<string> {
  try {
    // Try to load from the categories index first
    const response = await fetch('/categories/index.json');
    
    if (response.ok) {
      const categories = await response.json();
      
      // Direct match
      const match = categories.find((cat: any) => cat.name === category);
      if (match && match.emoji) {
        return match.emoji;
      }
      
      // Partial match
      const partialMatch = categories.find((cat: any) => category.includes(cat.name) || cat.name.includes(category));
      if (partialMatch && partialMatch.emoji) {
        return partialMatch.emoji;
      }
    }
  } catch (error) {
    console.warn("Error loading category emojis from index:", error);
  }
  
  // Fall back to the hardcoded emojis if we couldn't load from index
  return getEmoji(category);
}

/**
 * Gets the emoji for a category, with fallback handling
 * Uses hardcoded CATEGORY_EMOJIS
 * 
 * @param category The category name to find an emoji for
 * @returns The emoji string for the category or a fallback emoji
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
