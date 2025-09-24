/**
 * GameConfigSchema
 * Framework configuration schema for game modules.
 * Validates per-game game.json files at runtime.
 */
import { z } from 'zod';

export const GameActionEnum = z.enum(['ADVANCE','BACK','SELECT_TARGET','REVEAL','RESTART','CUSTOM']);

export const GamePhaseSchema = z.object({
  id: z.string().min(1),
  screenId: z.string().min(1),
  allowedActions: z.array(GameActionEnum)
});

export const ContentProviderConfigSchema = z.object({
  type: z.string(),
  source: z.string().optional(),
  shuffle: z.boolean().optional()
}).optional();

export const MultiplayerConfigSchema = z.object({
  supportsRoom: z.boolean().default(false),
  requiresRoom: z.boolean().default(false)
}).default({ supportsRoom: false, requiresRoom: false });

const GameSettingsSchema = z.object({
  categoriesPerGame: z.number().int().min(1).max(20).default(5),
  questionsPerCategory: z.number().int().min(1).max(50).default(10),
  maxQuestionsTotal: z.number().int().min(1).max(100).default(50),
  allowRepeatQuestions: z.boolean().default(false),
  shuffleQuestions: z.boolean().default(true),
  shuffleCategories: z.boolean().default(true),
  gameTimeLimit: z.number().int().min(0).max(3600).default(0), // 0 = no limit, in seconds
  autoAdvanceTime: z.number().int().min(0).max(60).default(0), // 0 = no auto advance, in seconds
  allowSkipQuestions: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  enableSounds: z.boolean().default(true),
  enableAnimations: z.boolean().default(true)
}).default({});

const UILayoutConfigSchema = z.object({
  showHeader: z.boolean().default(true),
  showFooter: z.boolean().default(true),
  headerStyle: z.enum(['minimal', 'full', 'compact']).default('minimal')
}).default({ showHeader: true, showFooter: true, headerStyle: 'minimal' });

const UIFeaturesConfigSchema = z.object({
  soundControl: z.boolean().default(false),
  volumeControl: z.boolean().default(false),
  languageSelector: z.boolean().default(true),
  categorySelection: z.boolean().default(false),
  gameMode: z.string().optional(),
  playerSetup: z.boolean().default(false),
  infoModal: z.boolean().default(true),
  settingsPanel: z.boolean().default(true),
  kofiLink: z.boolean().default(false),
  githubLink: z.boolean().default(false),
  versionDisplay: z.boolean().default(true),
  darkModeToggle: z.boolean().default(true)
}).default({});

const UIBrandingConfigSchema = z.object({
  showFrameworkBadge: z.boolean().default(false),
  gameName: z.string().optional(),
  tagline: z.string().optional(),
  mainQuestion: z.string().optional(),
  subtitle: z.string().optional()
}).default({});

const UIThemeConfigSchema = z.object({
  // Legacy support
  primaryGradient: z.string().default('from-blue-400 via-purple-500 to-indigo-600'),
  cardBackground: z.string().default('bg-white'),
  accentColor: z.string().default('blue'),
  // New 5-color system
  colors: z.object({
    primary: z.string().default('purple-500'),      // Main brand color (buttons, titles)
    secondary: z.string().default('pink-500'),      // Secondary brand color (gradients, accents)
    accent: z.string().default('indigo-500'),       // Highlighting and emphasis
    neutral: z.string().default('gray-500'),        // Text, borders, neutral elements
    highlight: z.string().default('yellow-400')     // Success, warnings, special highlights
  }).default({
    primary: 'purple-500',
    secondary: 'pink-500', 
    accent: 'indigo-500',
    neutral: 'gray-500',
    highlight: 'yellow-400'
  })
}).default({});

// UI Settings (config-driven settings form)
const UISettingsFieldSchema = z.object({
  key: z.string(),                    // matches GameSettings key
  type: z.enum(['number','boolean']), // supported control types
  label: z.string(),                  // i18n key for label
  group: z.string().default('general'),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  order: z.number().optional()
});

const UISettingsConfigSchema = z.object({
  fields: z.array(UISettingsFieldSchema).default([])
}).default({ fields: [] });

const UIConfigSchema = z.object({
  layout: UILayoutConfigSchema,
  features: UIFeaturesConfigSchema,
  branding: UIBrandingConfigSchema,
  theme: UIThemeConfigSchema,
  settings: UISettingsConfigSchema
}).default({});

export const GameConfigSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  description: z.string().default(''),
  version: z.string(),
  minPlayers: z.number().int().min(1),
  maxPlayers: z.number().int().min(1),
  tags: z.array(z.string()).default([]),
  themeRef: z.string().default('default'),
  i18nNamespaces: z.array(z.string()).default([]),
  screens: z.record(z.string(), z.string()),
  phases: z.array(GamePhaseSchema),
  contentProvider: ContentProviderConfigSchema,
  ui: UIConfigSchema,
  gameSettings: GameSettingsSchema,
  featureFlags: z.record(z.boolean()).default({}),
  multiplayer: MultiplayerConfigSchema
});

export type GameConfig = z.infer<typeof GameConfigSchema>;
export type GamePhase = z.infer<typeof GamePhaseSchema>;
export type GameSettings = z.infer<typeof GameSettingsSchema>;
export type UISettingsConfig = z.infer<typeof UISettingsConfigSchema>;
export type UISettingsField = z.infer<typeof UISettingsFieldSchema>;
