/**
 * Utility functions for formatting and handling categories
 */

import { CATEGORY_EMOJIS } from '../constants';

/**
 * Gets the emoji for a category, with fallback handling
 * Uses the categories from public/questions/categories.json if available
 * Falls back to hardcoded CATEGORY_EMOJIS if needed
 *
 * @param category The category name to find an emoji for
 * @returns The emoji string for the category or a fallback emoji
 */
/**
 * Retrieves the emoji associated with a given category.
 * 
 * This function first attempts to fetch the emoji from a remote `categories.json` file.
 * It tries to find a direct match for the category ID, and if not found, attempts a partial match.
 * If the fetch fails or no match is found, it falls back to a hardcoded emoji lookup.
 * 
 * @param category - The category identifier to look up.
 * @returns A promise that resolves to the emoji string for the given category.
 */
export async function getEmojiFromIndex(category: string): Promise<string> {  try {
    // Try to load from the categories file first
    const response = await fetch('questions/categories.json');
    
    if (response.ok) {
      const categories = await response.json();
      
      // Direct match
      const match = categories.find((cat: any) => cat.id === category);
      if (match && match.emoji) {
        return match.emoji;
      }
      
      // Partial match
      const partialMatch = categories.find((cat: any) => 
        category.includes(cat.id) || cat.id.includes(category));
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
