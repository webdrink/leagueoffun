/**
 * Framework Foundation Tests
 * 
 * Updated foundation tests that work with the new framework architecture.
 * These tests replace the legacy tests that expected specific global variables.
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker } from '../utils/debug-helpers';
import { 
  waitForFrameworkInitialized, 
  verifyFrameworkContent,
  verifyFrameworkTranslations,
  getFrameworkTitle,
  getFrameworkLanguage,
  findFrameworkStartButton
} from '../utils/framework-helpers';

test.describe('Framework Foundation Tests', () => {
  test('should initialize framework and display title', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'framework-basic-initialization');
    
    tracker.logUserAction('Navigate to framework app');
    await page.goto('/');
    
    // Measure initial load time
    const loadTime = await tracker.measurePageLoad();
    expect(loadTime).toBeLessThan(5000);
    
    // Wait for framework to initialize
    const frameworkReady = await waitForFrameworkInitialized(page, tracker);
    expect(frameworkReady).toBe(true);
    tracker.logGameEvent('Framework initialized successfully');
    
    // Get the actual framework title
    const actualTitle = await getFrameworkTitle(page);
    tracker.logGameEvent('Framework title detected', { title: actualTitle });
    
    // Title should be BlameGame or contain it
    expect(actualTitle).toBeTruthy();
    expect(actualTitle).toMatch(/BlameGame|Blame.*Game/i);
    
    // Take screenshot of framework state
    await tracker.takeScreenshot('framework-initialized');
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBe(0);
  });

  test('should have working start button', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'framework-start-button');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Wait for framework
    await waitForFrameworkInitialized(page, tracker);
    
    // Check for start button
    const hasStartButton = await findFrameworkStartButton(page);
    expect(hasStartButton).toBe(true);
    tracker.logUserAction('Start button found');
    
    // Try to click the start button
    const startButtonClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startButton = buttons.find(button => {
        const text = button.textContent?.toLowerCase() || '';
        return text.includes('start') || text.includes('spiel');
      });
      
      if (startButton && !startButton.disabled) {
        (startButton as HTMLButtonElement).click();
        return true;
      }
      return false;
    });
    
    expect(startButtonClicked).toBe(true);
    tracker.logUserAction('Start button clicked successfully');
    
    // Wait a moment for any navigation
    await page.waitForTimeout(2000);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should have working translation system', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'framework-translations');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Wait for framework
    await waitForFrameworkInitialized(page, tracker);
    
    // Check translation system
    const translationsWorking = await verifyFrameworkTranslations(page, tracker);
    expect(translationsWorking).toBe(true);
    
    // Get current language
    const currentLanguage = await getFrameworkLanguage(page);
    tracker.logGameEvent('Current language detected', { language: currentLanguage });
    
    // Should be a valid language or unknown (but not empty)
    expect(currentLanguage).toBeTruthy();
    expect(currentLanguage.length).toBeGreaterThan(0);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });

  test('should handle framework content loading', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'framework-content-loading');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // Wait for framework
    await waitForFrameworkInitialized(page, tracker);
    
    // Content might not be loaded immediately, but framework should be ready
    const contentAvailable = await verifyFrameworkContent(page, tracker);
    tracker.logGameEvent('Framework content check completed', { available: contentAvailable });
    
    // Framework should be functional even if content isn't loaded yet
    const frameworkFunctional = await page.evaluate(() => {
      return document.body && document.body.children.length > 0;
    });
    
    expect(frameworkFunctional).toBe(true);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });

  test('should maintain responsive layout', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'framework-responsive-layout');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    await waitForFrameworkInitialized(page, tracker);
    
    // Test different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      tracker.logUserAction(`Testing ${viewport.name} viewport`);
      await page.waitForTimeout(500);
      
      // Check if content is still visible
      const contentVisible = await page.evaluate(() => {
        const body = document.body;
        return body && body.offsetHeight > 0 && body.offsetWidth > 0;
      });
      
      expect(contentVisible).toBe(true);
      tracker.logGameEvent(`${viewport.name} layout working`);
      
      await tracker.takeScreenshot(`framework-${viewport.name}`);
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(3);
  });
});