/**
 * Game type constants
 */

// Game modes
export const GAME_MODES = {
  CLASSIC: 'classic',
  NAME_BLAME: 'name_blame'
} as const;

// Game difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
} as const;

// Question type constants
/**
 * Defines the available types of questions in the game.
 * 
 * @property TEXT - Represents a text-based question.
 * @property IMAGE - Represents an image-based question.
 * @property MULTIMEDIA - Represents a multimedia (e.g., audio or video) question.
 */
export const QUESTION_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  MULTIMEDIA: 'multimedia'
} as const;