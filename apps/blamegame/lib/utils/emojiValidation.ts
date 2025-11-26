/**
 * Emoji validation utilities
 * Handles validation and detection of emoji characters
 */

// Type definition for Intl.Segmenter (not in all TypeScript versions)
interface SegmentData {
  segment: string;
  index: number;
  input: string;
}

interface Segmenter {
  segment(input: string): Iterable<SegmentData>;
}

/**
 * Checks if a string contains only a single emoji character
 * Handles complex emojis with ZWJ sequences, skin tones, etc.
 * 
 * @param text - The text to validate
 * @returns true if the text is a single emoji, false otherwise
 */
export function isSingleEmoji(text: string): boolean {
  if (!text || text.length === 0) {
    return false;
  }

  // Remove variation selectors and zero-width joiners for length check
  const normalized = text.trim();
  
  // Use Intl.Segmenter if available (modern browsers)
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' }) as Segmenter;
    const segments = Array.from(segmenter.segment(normalized));
    
    if (segments.length !== 1) {
      return false;
    }
    
    // Check if it's actually an emoji using regex
    return isEmoji(segments[0].segment);
  }
  
  // Fallback for older browsers
  // This is a simplified check
  const emojiRegex = /^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)$/u;
  return emojiRegex.test(normalized);
}

/**
 * Checks if a string contains an emoji
 * 
 * @param text - The text to check
 * @returns true if the text contains an emoji
 */
export function isEmoji(text: string): boolean {
  // Comprehensive emoji regex pattern
  // Matches emojis including those with skin tones, ZWJ sequences, etc.
  const emojiRegex = /[\p{Emoji_Presentation}\p{Emoji}\uFE0F]/u;
  return emojiRegex.test(text);
}

/**
 * Extracts the first emoji from a string
 * 
 * @param text - The text to extract from
 * @returns the first emoji found, or empty string if none
 */
export function extractFirstEmoji(text: string): string {
  if (!text) return '';
  
  // Use Intl.Segmenter if available
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' }) as Segmenter;
    const segments = Array.from(segmenter.segment(text));
    
    for (const segment of segments) {
      if (isEmoji(segment.segment)) {
        return segment.segment;
      }
    }
  }
  
  return '';
}

/**
 * Validates and sanitizes emoji input
 * Returns the first valid emoji found, or empty string
 * 
 * @param input - The user input to validate
 * @returns sanitized emoji or empty string
 */
export function sanitizeEmojiInput(input: string): string {
  const trimmed = input.trim();
  
  if (isSingleEmoji(trimmed)) {
    return trimmed;
  }
  
  // Try to extract first emoji if multiple characters
  const firstEmoji = extractFirstEmoji(trimmed);
  return firstEmoji;
}
