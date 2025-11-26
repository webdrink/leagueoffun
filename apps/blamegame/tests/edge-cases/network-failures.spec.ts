/**
 * Edge Case Test: Network Failures
 * 
 * Purpose: Tests the application's behavior under various network conditions
 * including offline scenarios, slow connections, and data loading failures.
 * 
 * Test Areas:
 * - Offline mode functionality
 * - Slow network simulation
 * - Asset loading failures
 * - Recovery from network issues
 * - Graceful degradation
 */

import { test, expect } from '@playwright/test';
import { createGameStateTracker, simulateNetworkConditions } from '../utils/debug-helpers';

test.describe('Edge Cases: Network Failures', () => {
  test('should handle offline mode gracefully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'network-offline-mode');
    
    // Start offline
    await simulateNetworkConditions(page, true);
    
    await page.goto('/');
    tracker.logUserAction('Loaded app in offline mode');
    
    // App should still render basic structure
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App structure loaded in offline mode');
    
    // Check for offline indicators or error messages
    const offlineIndicator = page.locator('text*=offline').or(page.locator('text*=no connection'));
    const hasOfflineIndicator = await offlineIndicator.count() > 0;
    tracker.logDataFlow('Offline indicator check', { hasIndicator: hasOfflineIndicator });
    
    await tracker.takeScreenshot('offline-mode');
    
    // Go back online
    await simulateNetworkConditions(page, false);
    await page.waitForTimeout(2000);
    
    // App should recover
    const appStillWorks = await page.locator('body').isVisible();
    expect(appStillWorks).toBe(true);
    tracker.logGameEvent('App recovered from offline mode');
    
    const report = tracker.generateReport();
    // Allow some errors in offline mode
    expect(report.errors.length).toBeLessThan(10);
  });

  test('should handle slow network conditions', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'network-slow-connection');
    
    // Throttle network to simulate slow connection
    await page.context().route('**/*', async (route) => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.continue();
    });
    
    tracker.logDataFlow('Network throttling enabled');
    
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    tracker.logPerformance('slowNetworkLoadTime', loadTime);
    
    // App should still load, just slower
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded on slow network');
    
    // Should be slower than normal but not excessively slow
    expect(loadTime).toBeGreaterThan(500); // Should be noticeably slower
    expect(loadTime).toBeLessThan(30000); // But not timeout
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(5);
  });

  test('should handle asset loading failures', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'network-asset-loading-failures');
    
    // Block specific asset types
    await page.context().route('**/*.{png,jpg,jpeg,gif,svg}', route => {
      route.abort();
    });
    
    await page.context().route('**/*.{mp3,wav,ogg}', route => {
      route.abort();
    });
    
    tracker.logDataFlow('Asset loading blocked for testing');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // App should still function without assets
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded without assets');
    
    // Try to start a game
    const startButton = page.getByRole('button', { name: /start|spiel/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      tracker.logUserAction('Started game without assets');
      
      await page.waitForTimeout(3000);
      
      // Game should still work, just without images/sounds
      const gameStillWorks = await page.locator('body').isVisible();
      expect(gameStillWorks).toBe(true);
      tracker.logGameEvent('Game functionality maintained without assets');
    }
    
    const report = tracker.generateReport();
    // Expect some errors due to failed asset loading
    expect(report.errors.length).toBeLessThan(20);
  });

  test('should handle JSON loading failures', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'network-json-loading-failures');
    
    // Block JSON files
    await page.context().route('**/*.json', route => {
      route.abort();
    });
    
    tracker.logDataFlow('JSON loading blocked for testing');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // App should handle missing JSON gracefully
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App structure loaded without JSON');
    
    // Should show appropriate error messages
    const errorMessage = page.locator('text*=error').or(page.locator('text*=fehler'));
    const loadingMessage = page.locator('text*=loading').or(page.locator('text*=laden'));
    
    const hasErrorIndicator = await errorMessage.count() > 0;
    const hasLoadingIndicator = await loadingMessage.count() > 0;
    
    tracker.logDataFlow('Error handling check', {
      hasError: hasErrorIndicator,
      hasLoading: hasLoadingIndicator
    });
    
    await tracker.takeScreenshot('json-loading-failure');
    
    const report = tracker.generateReport();
    // Expect errors due to failed JSON loading
    expect(report.errors.length).toBeGreaterThan(0);
  });

  test('should recover from intermittent network issues', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'network-intermittent-issues');
    
    let requestCount = 0;
    
    // Simulate intermittent failures
    await page.context().route('**/*', async (route) => {
      requestCount++;
      
      // Fail every 3rd request
      if (requestCount % 3 === 0) {
        tracker.logDataFlow(`Simulated network failure for request ${requestCount}`);
        route.abort();
      } else {
        await route.continue();
      }
    });
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // App should still function despite intermittent failures
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded with intermittent network issues');
    
    // Try to interact with the app
    const startButton = page.getByRole('button', { name: /start|spiel/i });
    if (await startButton.isVisible()) {
      await startButton.click();
      tracker.logUserAction('Attempted to start game with network issues');
      
      await page.waitForTimeout(5000); // Give more time for retries
      
      // App should either work or show appropriate error handling
      const appResponsive = await page.locator('body').isVisible();
      expect(appResponsive).toBe(true);
      tracker.logGameEvent('App remained responsive during network issues');
    }
    
    const report = tracker.generateReport();
    // Allow more errors due to simulated failures
    expect(report.errors.length).toBeLessThan(15);
  });

  test('should handle CDN failures gracefully', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'network-cdn-failures');
    
    // Block external CDN requests
    await page.context().route('**/cdn.**', route => {
      route.abort();
    });
    
    await page.context().route('**/fonts.**', route => {
      route.abort();
    });
    
    tracker.logDataFlow('CDN and font loading blocked');
    
    await page.goto('/');
    await tracker.measurePageLoad();
    
    // App should still work without external resources
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded without CDN resources');
    
    // UI should still be functional, maybe with fallback fonts
    const interactiveElements = page.getByRole('button');
    const buttonCount = await interactiveElements.count();
    
    tracker.logGameEvent('Interactive elements check', { buttonCount });
    expect(buttonCount).toBeGreaterThan(0);
    
    const report = tracker.generateReport();
    expect(report.errors.length).toBeLessThan(10);
  });

  test('should handle timeout scenarios', async ({ page }) => {
    const tracker = createGameStateTracker(page, 'network-timeout-scenarios');
    
    // Simulate very slow responses that might timeout
    await page.context().route('**/*.json', async (route) => {
      // Add significant delay
      await new Promise(resolve => setTimeout(resolve, 5000));
      await route.continue();
    });
    
    tracker.logDataFlow('Slow JSON responses simulated');
    
    // Set shorter timeout for this test
    page.setDefaultTimeout(10000);
    
    await page.goto('/');
    
    // App should handle timeouts gracefully
    await expect(page.locator('body')).toBeVisible();
    tracker.logGameEvent('App loaded despite slow responses');
    
    // Should show loading indicators or timeout messages
    const loadingIndicator = page.locator('text*=loading').or(page.locator('text*=laden'));
    const timeoutMessage = page.locator('text*=timeout').or(page.locator('text*=zeit'));
    
    const hasLoadingIndicator = await loadingIndicator.count() > 0;
    const hasTimeoutMessage = await timeoutMessage.count() > 0;
    
    tracker.logDataFlow('Timeout handling check', {
      hasLoading: hasLoadingIndicator,
      hasTimeout: hasTimeoutMessage
    });
    
    const report = tracker.generateReport();
    // Allow errors due to simulated timeouts
    expect(report.errors.length).toBeLessThan(10);
  });
});
