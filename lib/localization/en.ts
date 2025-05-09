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
  'intro.player_setup': 'Set Up Players',
  'intro.settings': 'Settings',
  'intro.info': 'Info',
  'intro.sound_toggle': 'Sound',
  'intro.name_blame_toggle': 'NameBlame Mode',
  'intro.enable_debug': 'Enable Debug Mode',
  'intro.heading': 'Guess who would do what?',
  'intro.subheading': 'What do you think? Do you know your friends?',
  'intro.error_loading_questions': 'Error loading questions:',
  'intro.error_check_files': 'Please check the questions file and try again.',
  'intro.loading_questions': 'Loading questions...',
  'intro.mainTitle': 'Who would do what?',
  'intro.subTitle': 'What do you think? Who would most likely...',
  'intro.who_would': 'Who would most likely...',

  // Settings
  'settings.title': 'Settings',
  'settings.language': 'Language',
  'settings.sound': 'Sound',
  'settings.volume': 'Volume',
  'settings.animations': 'Animations',
  'settings.reset_data': 'Reset App Data',

  // Player setup
  'players.setup_title': 'Set Up Players',
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
  'players.add_players_to_start': 'Add players to start',
  'players.minimum_players_needed': 'You need at least 2 players to start',

  // Game
  'game.question': 'Question',
  'game.select_player': 'Select a player',
  'game.next_question': 'Next Question',
  'game.previous_question': 'Previous Question',
  'game.progress': 'Question {current} of {total}',
  'game.blame': 'Blame',
  'game.summary': 'Summary',
  'game.play_again': 'Play Again',

  // Questions
  'questions.player_turn': 'Your turn',
  'questions.counter': 'Question {{current}} of {{total}}',
  'questions.who_blame': 'Who do you blame?',
  'questions.cannot_blame_self': 'You cannot blame yourself',
  'questions.blame_player': 'Blame {name}',
  'questions.previous_question': 'Previous Question',
  'questions.next_question': 'Next Question',
  'questions.summary': 'Summary',
  'questions.next': 'Next',
  'questions.show_summary': 'Show Summary',

  // Summary
  'summary.title': 'Game Over!',
  'summary.questions_answered': 'You answered {count} questions!',
  'summary.most_blamed': 'Most Blamed',
  'summary.play_again': 'Start New Game',
  'summary.back_to_start': 'Back to Start',
  'summary.blame_stats': 'Blame Statistics',
  'summary.no_stats': 'No blames given!',

  // Modal
  'modal.info_title': 'Information',
  'modal.info_description': 'Game instructions, privacy information, or other notes could be shown here.',
  'modal.reset_data_description': 'This modal is mainly for resetting app data.',
  'modal.close': 'Close',
  'modal.reset_app_data': 'Reset App Data',

  // Info section/modal
  'info.title': 'Game Instructions',
  'info.how_to_play': 'How to play Blame Game',
  'info.name_blame_explanation': 'In NameBlame mode, you can blame other players',
  'info.confirm_reset': 'Are you sure you want to reset all app data?',

  // Debug panel
  'debug.panel_title': 'Debug Panel',
  'debug.title': 'Debug Panel Title',
  'debug.question_stats': 'Question Statistics',
  'debug.total': 'Total',
  'debug.played': 'Played',
  'debug.available': 'Available',
  'debug.categories': 'Categories',
  'debug.reset': 'Reset',
  'debug.reset_all_settings': 'Reset All Settings',
  'debug.reset_app_data': 'Reset App Data',
  'debug.confirm_reset_data': 'Are you sure you want to reset ALL app data? This includes settings and played questions.',
  'debug.settings': 'Settings (Debug)',
  'debug.questions': 'Questions (Debug)',
  'debug.animations': 'Animations (Debug)',
  'debug.language': 'Language (Debug)',
  'debug.reset_data': 'Reset Data (Debug)',

  // Additional keys
  'startGame': 'Start Game',
  'error.loadQuestions': 'Error loading questions. Please check the question files and try again.',
  'loadingQuestions': 'Loading questions...',
  'error.noQuestionsLoaded': 'No questions loaded. Please check the question files and try again.'
};

export default en;
