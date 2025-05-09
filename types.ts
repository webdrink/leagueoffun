// All shared types for the Blame Game application

export type SupportedLanguage = 'en' | 'de' | 'es' | 'fr';

export interface GameSettings {
  categoryCount: number;
  questionsPerCategory: number;
  rouletteDurationMs: number;
  loadingQuoteIntervalMs: number;

  introSpringStiffness: number;
  introSpringDamping: number;
  introSpringDurationSec: number;

  questionCardTransitionSec: number;
  questionCardSpringStiffness: number;
  questionCardSpringDamping: number;

  rouletteCardBaseDurationSec: number;
  rouletteCardStaggerDelaySec: number;
  rouletteCardStaggerDurationIncrementSec: number;
  rouletteCardSpringStiffness: number;
  rouletteCardSpringDamping: number;
  rouletteCardSpreadFactor: number;
  rouletteCardRotationAngle: number;

  loadingQuoteSpringStiffness: number;
  loadingQuoteSpringDamping: number;
  loadingQuoteTransitionDurationSec: number;
  cardFallDistance: number; // Added
  cardFallStaggerDelaySec: number; // Added
  cardStackOffsetY: number; // Added

  numberOfRounds: number;
  timePerQuestion: number;
  showScore: boolean;
  allowSkip: boolean;  
  showIntroAnimation: boolean;
  introAnimationDuration: number;
  questionFontSize: number;
  dynamicThemeEnabled: boolean;
  questionCardAnimation: string;
  
  // Language settings
  language: SupportedLanguage;
  gameMode: 'classic' | 'nameBlame'; // Added
}

export interface Category {
  id: string;
  name: string;
  emoji?: string;
}

export interface Question {
  text: string;
  categoryId: string; // Renamed from category to categoryId, stores the ID
  categoryName: string; // Stores the translated category name for display
  categoryEmoji: string; // Stores the emoji for the category
  questionId?: string; // Optional: a unique ID for the question itself
}

export interface Player {
  id: string;
  name: string;
  score?: number; // Optional: score for the player
}

export interface NameBlameEntry {
  from: string;
  to: string;
  question: string;
  timestamp: string;
}

export type GameStep = 'intro' | 'playerSetup' | 'loading' | 'roulette' | 'game' | 'summary'; // Added 'loading'

export interface QuestionStats {
  totalQuestions: number;
  playedQuestions: number;
  availableQuestions: number;
  categories?: Record<string, number>;
}

export interface Translation {
  common: {
    app_name: string;
    loading: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    next: string;
    back: string;
    submit: string;
    reset: string;
    yes: string;
    no: string;
  };
  intro: {
    title: string;
    tagline: string;
    start_button: string;
    settings_button: string;
    info_button: string;
    start_team_mode: string;
    start_name_blame: string;
    loading_quote: string;
  };
  settings: {
    title: string;
    sound: string;
    sound_on: string;
    sound_off: string;
    volume: string;
    categories: string;
    select_all: string;
    deselect_all: string;
    language: string;
    theme: string;
    reset: string;
    save: string;
    cancel: string;
  };
  player: {
    setup_title: string;
    add_player: string;
    remove_player: string;
    start_game: string;
    player_name_placeholder: string;
    min_players_warning: string;
    max_players_warning: string;
  };
  game: {
    question_count: string;
    round: string;
    of: string;
    category: string;
    blame_question: string;
    select_player: string;
    continue: string;
    skip: string;
    back: string;
  };
  summary: {
    game_over: string;
    questions_completed: string;
    most_blamed_singular: string;
    most_blamed_plural: string;
    blame_count_singular: string;
    blame_count_plural: string;
    no_blames: string;
    team_mode: string;
    team_congratulation: string;
    restart_game: string;
  };
  modal: {
    info_title: string;
    info_description: string;
    reset_data_description: string;
    close: string;
    reset_app_data: string;
  };  
  debug: {
    title: string;
    sound_settings: string;
    sound_enabled: string;
    volume: string;
    game_state: string;
    current_step: string;
    debug_mode: string;
    player_management: string;
    player_count: string;
    name_blame_mode: string;
    question_stats: string;
    total_questions: string;
    played_questions: string;
    available_questions: string;
    categories: string;
    category_count: string;
    reset_data: string;
    language_settings: string;
    current_language: string;
    translation_test: string;
    no_categories_found: string;
  };
}
