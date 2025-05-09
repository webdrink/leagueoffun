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
export const QUESTION_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  MULTIMEDIA: 'multimedia'
} as const;