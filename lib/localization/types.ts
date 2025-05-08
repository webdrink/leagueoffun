/**
 * Main types and interfaces for the localization system
 */

import { SUPPORTED_LANGUAGES } from '../../hooks/utils/languageSupport';

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES; // Changed to keyof typeof

/**
 * All available translation keys in the application
 * Organized by feature/component for easier maintenance
 */
export type TranslationKey =
  // General app keys
  | 'app.title'
  | 'app.footer'
  | 'app.back'
  | 'app.next'
  | 'app.save'
  | 'app.cancel'
  | 'app.loading'
  
  // Intro screen
  | 'intro.start_game'
  | 'intro.player_setup'
  | 'intro.settings'
  | 'intro.info'
  | 'intro.sound_toggle'
  | 'intro.name_blame_toggle'
  | 'intro.enable_debug'
  | 'intro.heading'
  | 'intro.subheading'
  | 'intro.error_loading_questions'
  | 'intro.error_check_files'
  | 'intro.loading_questions'
  
  // Settings
  | 'settings.title'
  | 'settings.language'
  | 'settings.sound'
  | 'settings.volume'
  | 'settings.animations'
  | 'settings.reset_data'
  
  // Player setup
  | 'players.setup_title'
  | 'players.add_player'
  | 'players.player_name'
  | 'players.player_name_input'
  | 'players.start_game'
  | 'players.back'
  | 'players.max_players'
  | 'players.min_players'
  | 'players.name_required'
  | 'players.name_exists'
  | 'players.remove'
  | 'players.remove_player'
  | 'players.add_players_to_start'
  | 'players.minimum_players_needed'
  
  // Game
  | 'game.question'
  | 'game.select_player'
  | 'game.next_question'
  | 'game.previous_question'
  | 'game.progress'
  | 'game.blame'
  
  // Questions
  | 'questions.player_turn'
  | 'questions.counter'
  | 'questions.who_blame'
  | 'questions.cannot_blame_self'
  | 'questions.blame_player'
  | 'questions.previous_question'
  | 'questions.next_question'
  | 'questions.summary'
  | 'questions.next'
  | 'questions.show_summary'
  
  // Summary
  | 'summary.title'
  | 'summary.questions_answered'
  | 'summary.most_blamed'
  | 'summary.play_again'
  | 'summary.back_to_start'
  | 'summary.blame_stats'
  | 'summary.no_stats'
  
  // Modal
  | 'modal.info_title'
  | 'modal.info_description'
  | 'modal.reset_data_description'
  | 'modal.close'
  | 'modal.reset_app_data'

  // Info section/modal
  | 'info.title'
  | 'info.how_to_play'
  | 'info.name_blame_explanation'
  | 'info.confirm_reset'
  
  // Debug panel
  | 'debug.panel_title'
  | 'debug.title'
  | 'debug.question_stats'
  | 'debug.total'
  | 'debug.played'
  | 'debug.available'
  | 'debug.categories'
  | 'debug.reset'
  | 'debug.reset_all_settings'
  | 'debug.reset_app_data'
  | 'debug.confirm_reset_data'
  | 'debug.settings'
  | 'debug.questions'
  | 'debug.animations'
  | 'debug.language'
  | 'debug.reset_data';

/**
 * Type for a complete set of translations for a language
 */
export type Translations = Record<TranslationKey, string>;

/**
 * Format options for translation strings with variables
 */
export interface FormatOptions {
  [key: string]: string | number;
}

/**
 * Interface for the translation hook return value
 */
export interface UseTranslationReturn {
  /**
   * Translate a key to the current language
   * Optionally format with variables
   * 
   * @example t('game.progress', { current: 3, total: 10 })
   */
  t: (key: TranslationKey, options?: FormatOptions) => string;
  
  /**
   * Current language code
   */
  currentLanguage: SupportedLanguage;
  
  /**
   * Change the current language
   */
  changeLanguage: (language: SupportedLanguage) => void;
}
