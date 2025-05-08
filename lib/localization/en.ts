/**
 * English translations
 */
import { Translations } from './types';

const en: Translations = {
  // General app keys
  'app.title': 'Blame Game',
  'app.footer': '© 2025 Blame Game',
  'app.back': 'Back',
  'app.next': 'Next',
  'app.save': 'Save',
  'app.cancel': 'Cancel',
  'app.loading': 'Loading...',
  
  // Intro screen
  'intro.start_game': 'Start Game',
  'intro.player_setup': 'Player Setup',
  'intro.settings': 'Settings',
  'intro.info': 'Info',
  'intro.sound_toggle': 'Sound',
  'intro.name_blame_toggle': 'NameBlame Mode',
  'intro.enable_debug': 'Enable Debug Mode',
  'intro.heading': 'Who would do what?',
  'intro.subheading': 'What do you think? Who would be most likely to...',
  'intro.error_loading_questions': 'Error loading questions:',
  'intro.error_check_files': 'Please check the question files and try again.',
  'intro.loading_questions': 'Loading questions...',
  
  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.sound': 'Sound',
  'settings.volume': 'Volume',
  'settings.animations': 'Animations',
  'settings.reset_data': 'Reset App Data',
    // Player setup
  'players.setup_title': 'Player Setup',
  'players.add_player': 'Add Player',
  'players.player_name': 'Player Name',
  'players.player_name_input': 'Enter player name',
  'players.start_game': 'Start Game',
  'players.back': 'Back',
  'players.max_players': 'Maximum number of players reached!',
  'players.min_players': 'At least 3 players required',
  'players.name_required': 'Name required',
  'players.name_exists': 'Name already exists',
  'players.remove': 'Remove',
  'players.remove_player': 'Remove player {name}',
  'players.add_players_to_start': 'Add players to start the game',
  'players.minimum_players_needed': 'You need at least 2 players to start',
  
  // Game
  'game.question': 'Question',
  'game.select_player': 'Select Player',
  'game.next_question': 'Next Question',
  'game.previous_question': 'Previous Question',
  'game.progress': 'Question {current} of {total}',
  'game.blame': 'Blame',
  
  // Questions
  'questions.player_turn': 'Your Turn',
  'questions.counter': 'Question {current} of {total}',
  'questions.who_blame': 'Who would you blame?',
  'questions.cannot_blame_self': 'You cannot blame yourself',
  'questions.blame_player': 'Blame {name}',
  'questions.previous_question': 'Previous Question',
  'questions.next_question': 'Next Question',
  'questions.summary': 'Summary',
  'questions.next': 'Next',
  'questions.show_summary': 'Show Summary',
  
  // Summary
  'summary.title': 'Summary',
  'summary.questions_answered': '{count} questions answered',
  'summary.most_blamed': 'Most Blamed',
  'summary.play_again': 'Play Again',
  'summary.back_to_start': 'Back to Start',
  'summary.blame_stats': 'Blame Statistics',
  'summary.no_stats': 'No statistics available',
  
  // Info modal
  'info.title': 'Game Instructions',
  'info.how_to_play': 'How to play Blame Game',
  'info.name_blame_explanation': 'In NameBlame mode, you can blame other players',
  'info.confirm_reset': 'Are you sure you want to reset all app data?',
  
  // Modal
  'modal.info_title': 'Information',
  'modal.info_description': 'Here could be game instructions, privacy information, or other notes.',
  'modal.reset_data_description': 'Currently, this modal is mainly used to reset app data.',
  'modal.close': 'Close',
  'modal.reset_app_data': 'Reset App Data',
  
  // Debug panel
  'debug.title': 'Debug Panel',
  'debug.settings': 'Settings',
  'debug.categories': 'Categories',
  'debug.questions': 'Questions',
  'debug.animations': 'Animations',
  'debug.language': 'Language',
  'debug.reset_data': 'Reset Data',
  'debug.panel_title': 'Debug Panel',
  'debug.question_stats': 'Question Stats',
  'debug.total': 'Total',
  'debug.played': 'Played',
  'debug.available': 'Available',
  'debug.reset': 'Reset',
  'debug.reset_all_settings': 'Reset All Settings',
  'debug.reset_app_data': 'Reset App Data',
  'debug.confirm_reset_data': 'Are you sure you want to reset ALL app data? This includes settings and played questions.'
};

export default en;
