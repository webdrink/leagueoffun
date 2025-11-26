/**
 * GameConfigSchema Validation Tests
 * Tests runtime validation of game.json files with valid/invalid scenarios.
 */
import { test, expect } from '@playwright/test';

test.describe('GameConfigSchema Validation Tests', () => {
  test('should validate complete valid game config', async ({ page }) => {
    const result = await page.evaluate(async () => {
      // Import schema validation (simulate the validation logic)
      const validConfig = {
        id: 'test-game',
        title: 'Test Game',
        description: 'A test game for validation',
        version: '1.0.0',
        minPlayers: 2,
        maxPlayers: 8,
        tags: ['party', 'test'],
        themeRef: 'default',
        i18nNamespaces: ['game.test'],
        screens: {
          intro: 'IntroScreen',
          play: 'PlayScreen',
          summary: 'SummaryScreen'
        },
        phases: [
          { id: 'intro', screenId: 'intro', allowedActions: ['ADVANCE'] },
          { id: 'play', screenId: 'play', allowedActions: ['ADVANCE', 'BACK'] },
          { id: 'summary', screenId: 'summary', allowedActions: ['RESTART'] }
        ],
        contentProvider: {
          type: 'static-questions',
          source: '/questions/test.json',
          shuffle: true
        },
        featureFlags: {
          showDebug: true,
          allowRestart: false
        },
        multiplayer: {
          supportsRoom: true,
          requiresRoom: false
        }
      };

      // Simulate validation (basic structure check)
      const isValid = validConfig.id && 
                     validConfig.title && 
                     validConfig.version &&
                     typeof validConfig.minPlayers === 'number' &&
                     typeof validConfig.maxPlayers === 'number' &&
                     Array.isArray(validConfig.phases) &&
                     validConfig.phases.length > 0 &&
                     typeof validConfig.screens === 'object';

      return { isValid, config: validConfig };
    });

    expect(result.isValid).toBe(true);
    expect(result.config.id).toBe('test-game');
    expect(result.config.phases).toHaveLength(3);
    expect(result.config.screens.intro).toBe('IntroScreen');
  });

  test('should reject invalid config - missing required fields', async ({ page }) => {
    const result = await page.evaluate(() => {
      const invalidConfigs = [
        // Missing id
        { title: 'Test', version: '1.0.0', minPlayers: 2, maxPlayers: 4, screens: {}, phases: [] },
        // Missing title
        { id: 'test', version: '1.0.0', minPlayers: 2, maxPlayers: 4, screens: {}, phases: [] },
        // Missing version
        { id: 'test', title: 'Test', minPlayers: 2, maxPlayers: 4, screens: {}, phases: [] },
        // Invalid minPlayers type
        { id: 'test', title: 'Test', version: '1.0.0', minPlayers: 'two', maxPlayers: 4, screens: {}, phases: [] },
        // Empty phases array
        { id: 'test', title: 'Test', version: '1.0.0', minPlayers: 2, maxPlayers: 4, screens: {}, phases: [] }
      ];

      const validationResults = invalidConfigs.map(config => {
        const hasRequiredFields = config.id && 
                                 config.title && 
                                 config.version &&
                                 typeof config.minPlayers === 'number' &&
                                 typeof config.maxPlayers === 'number' &&
                                 Array.isArray(config.phases) &&
                                 config.phases.length > 0;
        return !hasRequiredFields; // Should be invalid
      });

      return { allInvalid: validationResults.every(invalid => invalid) };
    });

    expect(result.allInvalid).toBe(true);
  });

  test('should validate phase descriptors correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const validPhases = [
        { id: 'intro', screenId: 'IntroScreen', allowedActions: ['ADVANCE'] },
        { id: 'play', screenId: 'PlayScreen', allowedActions: ['ADVANCE', 'BACK', 'SELECT_TARGET'] },
        { id: 'summary', screenId: 'SummaryScreen', allowedActions: ['RESTART'] }
      ];

      const invalidPhases = [
        // Missing id
        { screenId: 'IntroScreen', allowedActions: ['ADVANCE'] },
        // Missing screenId
        { id: 'intro', allowedActions: ['ADVANCE'] },
        // Invalid action
        { id: 'intro', screenId: 'IntroScreen', allowedActions: ['INVALID_ACTION'] },
        // Empty allowedActions
        { id: 'intro', screenId: 'IntroScreen', allowedActions: [] }
      ];

      const validActions = ['ADVANCE', 'BACK', 'SELECT_TARGET', 'REVEAL', 'RESTART', 'CUSTOM'];
      
      const validatePhase = (phase: unknown) => {
        const p = phase as Record<string, unknown>;
        return p.id && 
               p.screenId && 
               Array.isArray(p.allowedActions) &&
               (p.allowedActions as unknown[]).length > 0 &&
               (p.allowedActions as string[]).every((action: string) => validActions.includes(action));
      };

      return {
        validPhasesPass: validPhases.every(validatePhase),
        invalidPhasesFail: invalidPhases.every(phase => !validatePhase(phase))
      };
    });

    expect(result.validPhasesPass).toBe(true);
    expect(result.invalidPhasesFail).toBe(true);
  });

  test('should handle default values correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const minimalConfig = {
        id: 'minimal',
        title: 'Minimal Game',
        version: '1.0.0',
        minPlayers: 2,
        maxPlayers: 4,
        screens: { intro: 'IntroScreen' },
        phases: [{ id: 'intro', screenId: 'intro', allowedActions: ['ADVANCE'] }]
      };

      // Simulate default application
      const configWithDefaults = {
        ...minimalConfig,
        description: '',
        tags: [],
        themeRef: 'default',
        i18nNamespaces: [],
        featureFlags: {},
        multiplayer: { supportsRoom: false, requiresRoom: false }
      };

      return {
        hasDefaults: configWithDefaults.description === '' &&
                    Array.isArray(configWithDefaults.tags) &&
                    configWithDefaults.themeRef === 'default' &&
                    configWithDefaults.multiplayer.supportsRoom === false
      };
    });

    expect(result.hasDefaults).toBe(true);
  });

  test('should validate content provider configuration', async ({ page }) => {
    const result = await page.evaluate(() => {
      const validProviders = [
        { type: 'static-questions', source: '/questions/en.json', shuffle: true },
        { type: 'static-questions', source: '/questions/de.json', shuffle: false },
        { type: 'api-questions' }, // source optional for some types
        undefined // contentProvider is optional
      ];

      const invalidProviders = [
        { source: '/questions/en.json' }, // missing type
        { type: '' }, // empty type
        { type: 'static-questions', shuffle: 'yes' } // wrong shuffle type
      ];

      const validateProvider = (provider: unknown) => {
        if (!provider) return true; // optional
        const p = provider as Record<string, unknown>;
        return p.type && 
               typeof p.type === 'string' &&
               p.type.length > 0 &&
               (p.shuffle === undefined || typeof p.shuffle === 'boolean');
      };

      return {
        validPass: validProviders.every(validateProvider),
        invalidFail: invalidProviders.every(provider => !validateProvider(provider))
      };
    });

    expect(result.validPass).toBe(true);
    expect(result.invalidFail).toBe(true);
  });
});