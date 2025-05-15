// Default game settings with explanatory comments

import { GameSettings } from '../../types';

// Default game settings
/**
 * Initial game settings for the application.
 *
 * @remarks
 * This object defines the default configuration for various aspects of the game,
 * including content, animation timings, spring physics, gameplay, and language.
 *
 * @property categoryCount - Number of categories to include in a game.
 * @property questionsPerCategory - Number of questions per category.
 * @property rouletteDurationMs - Duration of the roulette animation in milliseconds.
 * @property loadingQuoteIntervalMs - Interval between loading quotes in milliseconds.
 * @property introSpringStiffness - Controls how "springy" the intro animation is.
 * @property introSpringDamping - Controls how quickly the intro animation settles.
 * @property introSpringDurationSec - Duration of the intro spring animation in seconds.
 * @property questionCardTransitionSec - Duration of question card transitions in seconds.
 * @property questionCardSpringStiffness - Stiffness for question card springs.
 * @property questionCardSpringDamping - Damping for question card springs.
 * @property rouletteCardBaseDurationSec - Base duration for roulette card animations in seconds.
 * @property rouletteCardStaggerDelaySec - Delay between consecutive card animations in seconds.
 * @property rouletteCardStaggerDurationIncrementSec - Incremental duration per card in seconds.
 * @property rouletteCardSpringStiffness - Stiffness for roulette card springs.
 * @property rouletteCardSpringDamping - Damping for roulette card springs.
 * @property rouletteCardSpreadFactor - How spread out the cards appear.
 * @property rouletteCardRotationAngle - Maximum rotation angle for cards.
 * @property loadingQuoteSpringStiffness - Stiffness for loading quote springs.
 * @property loadingQuoteSpringDamping - Damping for loading quote springs.
 * @property loadingQuoteTransitionDurationSec - Duration of loading quote transitions in seconds.
 * @property numberOfRounds - Number of rounds in a game.
 * @property timePerQuestion - Time allowed per question in seconds.
 * @property showScore - Whether to show scores.
 * @property allowSkip - Whether questions can be skipped.
 * @property showIntroAnimation - Whether to show intro animation.
 * @property introAnimationDuration - Duration of intro animation in milliseconds.
 * @property questionFontSize - Font size for questions in rem units.
 * @property dynamicThemeEnabled - Whether to use time-based themes.
 * @property questionCardAnimation - Type of question card animation.
 * @property language - Default language for the game.
 */
export const initialGameSettings: GameSettings = {
  // Content settings
  categoryCount: 10,               // Number of categories to include in a game
  questionsPerCategory: 10,        // Number of questions per category
  
  // Animation timing
  rouletteDurationMs: 2000,        // Duration of the roulette animation
  loadingQuoteIntervalMs: 800,     // Interval between loading quotes
  
  // Spring physics for intro animation
  introSpringStiffness: 260,       // Controls how "springy" the intro animation is
  introSpringDamping: 20,          // Controls how quickly the intro animation settles
  introSpringDurationSec: 0.3,     // Duration of the intro spring animation
  
  // Question card animation settings
  questionCardTransitionSec: 0.15, // Duration of question card transitions
  questionCardSpringStiffness: 120,// Stiffness for question card springs
  questionCardSpringDamping: 20,   // Damping for question card springs
  
  // Roulette card animation settings
  rouletteCardBaseDurationSec: 0.5,// Base duration for roulette card animations
  rouletteCardStaggerDelaySec: 0.1,// Delay between consecutive card animations
  rouletteCardStaggerDurationIncrementSec: 0.05, // How much to increase duration per card
  rouletteCardSpringStiffness: 80, // Stiffness for roulette card springs
  rouletteCardSpringDamping: 12,   // Damping for roulette card springs
  rouletteCardSpreadFactor: 60,    // How spread out the cards appear
  rouletteCardRotationAngle: 10,   // Maximum rotation angle for cards
  
  // Loading quote animation settings
  loadingQuoteSpringStiffness: 120,// Stiffness for loading quote springs
  loadingQuoteSpringDamping: 10,   // Damping for loading quote springs
  loadingQuoteTransitionDurationSec: 0.5, // Duration of loading quote transitions
  
  // Card falling animation settings
  cardFallDistance: 800,           // Distance cards fall in pixels
  cardFallStaggerDelaySec: 0.1,    // Delay between consecutive cards falling
  cardStackOffsetY: 10,            // Vertical offset for stacked cards
  
  // Gameplay settings
  numberOfRounds: 3,               // Number of rounds in a game
  timePerQuestion: 30,             // Time allowed per question (in seconds)
  showScore: true,                 // Whether to show scores
  allowSkip: true,                 // Whether questions can be skipped
  showIntroAnimation: true,        // Whether to show intro animation
  introAnimationDuration: 1500,    // Duration of intro animation (ms)
  questionFontSize: 1.5,           // Font size for questions (rem)
  dynamicThemeEnabled: true,       // Whether to use time-based themes
  questionCardAnimation: 'roulette',// Type of question card animation
  
  // Game mode and language settings
  gameMode: 'classic',             // Game mode (classic or nameBlame)
  language: 'de',                  // Default language (German)
};
