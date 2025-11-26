/**
 * Foundation Test: App Initialization
 * 
 * Purpose: Tests core application startup, data loading, and basic infrastructure
 * to ensure the foundation is stable before testing game flows.
 * 
 * Test Areas:
 * - App startup and component mounting
 * - Question data loading (1029+ questions across 33 categories)
 * - Translation system initialization
 * - Local storage functionality
 * - Core error handling
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker, waitForQuestionsLoaded, verifyTranslationSystem } from '../utils/debug-helpers';

test.describe('Foundation: App Initialization', () => {
  test('should initialize app and load core data successfully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'app-initialization-basic');
    
    tracker.logUserAction('Navigate to app');
    await page.goto('/');
    
    // Measure initial load time
    const loadTime = await tracker.measurePageLoad();
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    
    // Verify app title and basic structure
    tracker.logUserAction('Verify app title');
    await expect(page).toHaveTitle(/Blame Game|BlameGame/);
    
    // Check that main app container exists
    const appContainer = page.locator('body');
    await expect(appContainer).toBeVisible();
    tracker.logGameEvent('App container rendered');
    
    // Take screenshot of initial state
    await tracker.takeScreenshot('initial-load');
    
    // Verify questions are loaded
    const questionsLoaded = await waitForQuestionsLoaded(page, tracker);
    expect(questionsLoaded).toBe(true);
    
    // Verify translation system
    const translationsWorking = await verifyTranslationSystem(page, tracker);
    expect(translationsWorking).toBe(true);
    
    // Check for any console errors
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should load all required question categories', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'app-initialization-categories');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Wait for categories to load
    tracker.logDataFlow('Waiting for categories to load');
    const categoriesLoaded = await page.waitForFunction(() => {
      return window.gameCategories && window.gameCategories.length >= 30;
    }, { timeout: 10000 });
    
    expect(categoriesLoaded).toBeTruthy();
    
    // Verify we have the expected number of categories (around 33)
    const categoryCount = await page.evaluate(() => {
      return window.gameCategories ? window.gameCategories.length : 0;
    });
    
    tracker.logDataFlow('Categories loaded', { count: categoryCount });
    expect(categoryCount).toBeGreaterThanOrEqual(30);
    expect(categoryCount).toBeLessThanOrEqual(50); // reasonable upper bound
    
    // Verify categories have required structure
    const categoriesValid = await page.evaluate(() => {
      if (!window.gameCategories) return false;
      return window.gameCategories.every((cat) => 
        cat.id && cat.name && cat.emoji && Array.isArray(cat.questions)
      );
    });
    
    expect(categoriesValid).toBe(true);
    tracker.logDataFlow('Category structure validation passed');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should load sufficient questions for gameplay', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'app-initialization-questions');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Wait for questions to load
    await waitForQuestionsLoaded(page, tracker);
    
    // Count total questions across all categories
    const totalQuestions = await page.evaluate(() => {
      if (!window.gameCategories) return 0;
      return window.gameCategories.reduce((total: number, cat) => {
        return total + (cat.questions ? cat.questions.length : 0);
      }, 0);
    });
    
    tracker.logDataFlow('Total questions loaded', { count: totalQuestions });
    
    // Should have at least 1000 questions (documented as 1029+)
    expect(totalQuestions).toBeGreaterThanOrEqual(1000);
    
    // Verify question structure
    const questionsValid = await page.evaluate(() => {
      if (!window.gameCategories) return false;
      return window.gameCategories.every((cat) => {
        if (!cat.questions || cat.questions.length === 0) return true; // Empty categories are OK
        return cat.questions.every((q) => 
          typeof q === 'string' && q.length > 0
        );
      });
    });
    
    expect(questionsValid).toBe(true);
    tracker.logDataFlow('Question structure validation passed');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should handle network failures gracefully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'app-initialization-network-failure');
    
    // Start offline
    await page.context().setOffline(true);
    tracker.logDataFlow('Network set to offline');
    
    await page.goto('/');
    
    // App should still load basic structure even offline
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded in offline mode');
    
    // Take screenshot of offline state
    await tracker.takeScreenshot('offline-state');
    
    // Go back online
    await page.context().setOffline(false);
    tracker.logDataFlow('Network restored to online');
    
    // Wait a bit and check if data loads
    await page.waitForTimeout(2000);
    
    // Questions might load now that we're online
    const questionsLoaded = await page.evaluate(() => {
      return window.gameQuestions && window.gameQuestions.length > 0;
    });
    
    tracker.logDataFlow('Questions loaded after network restore', { loaded: questionsLoaded });
    
    const report = tracker.generateReport();
    // We expect some errors in offline mode, but app should not crash
    expect(report.errors.length).toBeLessThan(10);
  });

  test('should initialize with correct default settings', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'app-initialization-default-settings');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Check localStorage for default settings
    const settings = await tracker.checkLocalStorage('gameSettings');
    tracker.logPersistence('Default settings loaded', 'gameSettings', settings);
    
    // Should have default language setting
    if (settings && typeof settings === 'object') {
      const settingsObj = settings as Record<string, unknown>;
      expect(settingsObj).toHaveProperty('language');
      expect(['de', 'en', 'es', 'fr']).toContain(settingsObj.language);
    }
    
    // Verify sound settings exist
    const soundSettings = await tracker.checkLocalStorage('soundSettings');
    if (soundSettings && typeof soundSettings === 'object') {
      const soundObj = soundSettings as Record<string, unknown>;
      expect(soundObj).toHaveProperty('enabled');
      expect(typeof soundObj.enabled).toBe('boolean');
    }
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should recover from corrupted localStorage', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'app-initialization-corrupted-storage');
    
    // Set corrupted data in localStorage
    await page.evaluate(() => {
      localStorage.setItem('gameSettings', 'invalid-json{');
      localStorage.setItem('gameState', 'corrupted-data');
    });
    tracker.logPersistence('Corrupted localStorage set');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // App should still load and reset corrupted settings
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded despite corrupted localStorage');
    
    // Check that settings were reset or handled gracefully
    const settings = await tracker.checkLocalStorage('gameSettings');
    if (settings) {
      // Should be valid object, not the corrupted string
      expect(typeof settings).toBe('object');
      expect(settings).not.toBe('invalid-json{');
    }
    
    const report = tracker.generateReport();
    // Some errors are expected due to corrupted data
    expect(report.errors.length).toBeLessThan(5);
  });

  test('should display intro screen with start button', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'app-initialization-intro-screen');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Should see game title
    const gameTitle = page.getByText('BlameGame').first();
    await expect(gameTitle).toBeVisible();
    tracker.logUserAction('Game title visible');
    
    // Should see start button
    const startButton = page.getByRole('button', { name: /start|spiel/i });
    await expect(startButton).toBeVisible();
    tracker.logUserAction('Start button visible');
    
    // Should see settings access
    const settingsButton = page.locator('[data-testid="settings-button"]')
      .or(page.getByRole('button', { name: /settings|einstellungen/i }))
      .or(page.locator('button').filter({ hasText: /⚙️|settings/i }));
    
    await expect(settingsButton.first()).toBeVisible();
    tracker.logUserAction('Settings button visible');
    
    // Take screenshot of intro screen
    await tracker.takeScreenshot('intro-screen');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });
});
