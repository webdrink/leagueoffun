// All shared types for the Blame Game application

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

  numberOfRounds: number;
  timePerQuestion: number;
  showScore: boolean;
  allowSkip: boolean;
  showIntroAnimation: boolean;
  introAnimationDuration: number;
  questionFontSize: number;
  dynamicThemeEnabled: boolean;
  questionCardAnimation: string;
}

export interface Question {
  category: string;
  text: string;
}

export interface Player {
  id: string;
  name: string;
}

export interface NameBlameEntry {
  from: string;
  to: string;
  question: string;
  timestamp: string;
}

export type GameStep = 'intro' | 'playerSetup' | 'roulette' | 'game' | 'summary';

export interface QuestionStats {
  totalQuestions: number;
  playedQuestions: number;
  availableQuestions: number;
  categories?: Record<string, number>;
}
