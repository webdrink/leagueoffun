/**
 * React Party Game Framework
 * 
 * A modular, extensible framework for building interactive party games.
 * Used by games like BlameGame and HookHunt.
 * 
 * @packageDocumentation
 */

// ============================================================================
// Core Framework
// ============================================================================

// Event System
export { createEventBus } from './core/events/eventBus';
export type { EventBus, GameEvent } from './core/events/eventBus';

// Module System
export { gameModuleRegistry } from './core/modules';
export type { GameModule, GameModuleContextMinimal, ScreenRegistry } from './core/modules';

// Router and Navigation
export { FrameworkRouter, useFrameworkRouter } from './core/router/FrameworkRouter';

// Actions and Dispatcher
export * from './core/actions';
export { createDispatcher } from './core/dispatcher';

// Phase System
export type { PhaseController } from './core/phases';

// Game Host
export { default as GameHost } from './core/GameHost';

// ============================================================================
// Configuration
// ============================================================================

export type { GameConfig, GameSettings, UISettingsConfig, UISettingsField } from './config/game.schema';
export { discoverGameConfigs } from './config/discovery/discover';

// ============================================================================
// Persistence
// ============================================================================

export { storageGet, storageSet, storageRemove, storageClearNamespace, STORAGE_KEYS } from './persistence/storage';

// ============================================================================
// UI Components
// ============================================================================

// Basic UI Components
export {
  Button,
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  Checkbox,
  Input,
  Label,
  Switch,
  Slider,
  VolumeControl,
  SplitText,
  Confetti,
  FooterButton,
  FOOTER_ICON_STYLE,
  InfoModal,
  ErrorDisplay,
  DataLoader,
  GameInfoLoader,
  GameLayout,
  GameHeader,
  GameBody,
  GameFooter,
} from './ui/components';

// Screen Components
export {
  GameShell,
  GameMain,
  GameMainHeader,
  GameMainFooter,
  GameMainScreen,
  FrameworkIntroScreen,
  FrameworkPlayerSetupScreen,
  FrameworkQuestionScreen,
  FrameworkCategoryPickScreen,
  FrameworkPreparingScreen,
  FrameworkSummaryScreen,
  GameSettingsPanel,
  DarkModeToggle,
} from './ui/screens';

// Menu
export { default as GameMenu } from './ui/GameMenu';
export type { GameMenuProps } from './ui/GameMenu';

// ============================================================================
// Utilities
// ============================================================================

export { parseInitialParams } from './utils/url';
